// internal/service/ocr_service.go
package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type OCRService struct {
	hfToken string
	client  *http.Client
}

func NewOCRService(hfToken string) *OCRService {
	return &OCRService{
		hfToken: hfToken,
		client:  &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *OCRService) ExtractFromPDF(pdfBytes []byte) (string, error) {
	// DeepSeek-OCR via HuggingFace
	url := "https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-OCR"

	req, err := http.NewRequest("POST", url, bytes.NewReader(pdfBytes))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.hfToken)
	req.Header.Set("Content-Type", "application/pdf")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API call: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		GeneratedText string `json:"generated_text"`
		Error         string `json:"error"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("parse response: %w", err)
	}

	if result.Error != "" {
		return "", fmt.Errorf("OCR error: %s", result.Error)
	}

	return result.GeneratedText, nil
}
