// internal/service/ocr_service.go
package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image/png"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/klippa-app/go-pdfium"
	"github.com/klippa-app/go-pdfium/requests"
	"github.com/klippa-app/go-pdfium/webassembly"
)

// Global pdfium instance (initialized once)
var pdfiumInstance pdfium.Pdfium

func init() {
	// Initialize the pdfium library with WebAssembly (no external dependencies!)
	pool, err := webassembly.Init(webassembly.Config{
		MinIdle:  1,
		MaxIdle:  1,
		MaxTotal: 1,
	})
	if err != nil {
		log.Printf("Warning: Failed to initialize pdfium WASM: %v", err)
		return
	}

	instance, err := pool.GetInstance(time.Second * 30)
	if err != nil {
		log.Printf("Warning: Failed to get pdfium instance: %v", err)
		return
	}
	pdfiumInstance = instance
}

type OCRService struct {
	novitaAPIKey string
	client       *http.Client
}

func NewOCRService(novitaAPIKey string) *OCRService {
	return &OCRService{
		novitaAPIKey: novitaAPIKey,
		client:       &http.Client{Timeout: 120 * time.Second},
	}
}

// ExtractFromPDF converts PDF pages to images and sends them to DeepSeek-OCR via Novita.ai
func (s *OCRService) ExtractFromPDF(pdfBytes []byte) (string, error) {
	if pdfiumInstance == nil {
		return "", fmt.Errorf("pdfium not initialized")
	}

	// 1. Convert PDF pages to images
	images, err := s.pdfToImages(pdfBytes)
	if err != nil {
		return "", fmt.Errorf("PDF to images failed: %w", err)
	}

	if len(images) == 0 {
		return "", fmt.Errorf("no pages found in PDF")
	}

	// 2. Process each page with DeepSeek-OCR
	var allText strings.Builder
	for i, imgBase64 := range images {
		text, err := s.callDeepSeekOCR(imgBase64)
		if err != nil {
			log.Printf("OCR failed for page %d: %v", i+1, err)
			continue
		}
		if i > 0 {
			allText.WriteString("\n\n---\n\n")
		}
		allText.WriteString(text)
	}

	return allText.String(), nil
}

// pdfToImages converts PDF pages to base64-encoded PNG images
func (s *OCRService) pdfToImages(pdfBytes []byte) ([]string, error) {
	ctx := context.Background()

	// Open PDF document
	doc, err := pdfiumInstance.OpenDocument(&requests.OpenDocument{
		File: &pdfBytes,
	})
	if err != nil {
		return nil, fmt.Errorf("open PDF: %w", err)
	}
	defer pdfiumInstance.FPDF_CloseDocument(&requests.FPDF_CloseDocument{
		Document: doc.Document,
	})

	// Get page count
	pageCount, err := pdfiumInstance.FPDF_GetPageCount(&requests.FPDF_GetPageCount{
		Document: doc.Document,
	})
	if err != nil {
		return nil, fmt.Errorf("get page count: %w", err)
	}

	var images []string
	for i := 0; i < pageCount.PageCount; i++ {
		// Render page to image
		renderResp, err := pdfiumInstance.RenderPageInDPI(&requests.RenderPageInDPI{
			DPI: 150, // Good balance between quality and size
			Page: requests.Page{
				ByIndex: &requests.PageByIndex{
					Document: doc.Document,
					Index:    i,
				},
			},
		})
		if err != nil {
			log.Printf("Failed to render page %d: %v", i+1, err)
			continue
		}

		// Encode to PNG base64
		var buf bytes.Buffer
		if err := png.Encode(&buf, renderResp.Result.Image); err != nil {
			log.Printf("Failed to encode page %d: %v", i+1, err)
			continue
		}

		base64Img := base64.StdEncoding.EncodeToString(buf.Bytes())
		images = append(images, base64Img)

		// Clean up
		renderResp.Result.Image = nil
		_ = ctx // silence unused warning
	}

	return images, nil
}

// callDeepSeekOCR sends an image to Novita.ai's DeepSeek-OCR endpoint
func (s *OCRService) callDeepSeekOCR(imageBase64 string) (string, error) {
	url := "https://api.novita.ai/v3/openai/chat/completions"

	// OpenAI-compatible request format
	reqBody := map[string]interface{}{
		"model": "deepseek/deepseek-ai/DeepSeek-OCR",
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": "data:image/png;base64," + imageBase64,
						},
					},
					{
						"type": "text",
						"text": "Convert the document to markdown. Extract all text accurately.",
					},
				},
			},
		},
		"max_tokens": 4096,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.novitaAPIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API call: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	// Parse OpenAI-compatible response
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("parse response: %w", err)
	}

	if result.Error.Message != "" {
		return "", fmt.Errorf("OCR error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no OCR result returned")
	}

	return result.Choices[0].Message.Content, nil
}
