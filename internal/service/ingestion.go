package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	openaiembed "github.com/cloudwego/eino-ext/components/embedding/openai" // RICHTIGER IMPORT
	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
	"github.com/vergabe-agent/vergabe-backend/internal/domain"
	"gorm.io/gorm"
)

type IngestionService struct {
	db           *gorm.DB
	xmlParser    *XMLParserService
	embedder     *openaiembed.Embedder
	novitaAPIKey string
	ocrService   *OCRService
}

func NewIngestionService(db *gorm.DB, novitaAPIKey string, embedCfg EmbeddingProviderConfig) (*IngestionService, error) {
	ctx := context.Background()
	emb, err := newEmbeddingClient(ctx, embedCfg)
	if err != nil {
		return nil, fmt.Errorf("init embedder failed: %w", err)
	}

	return &IngestionService{
		db:           db,
		xmlParser:    NewXMLParserService(db),
		embedder:     emb,
		novitaAPIKey: novitaAPIKey,
		ocrService:   NewOCRService(novitaAPIKey),
	}, nil
}

// ProcessUpload entscheidet anhand des Dateinamens, wie verarbeitet wird
func (s *IngestionService) ProcessUpload(ctx context.Context, fileContent []byte, filename string) (*domain.Tender, error) {
	filename = strings.ToLower(filename)

	switch {
	case strings.HasSuffix(filename, ".xml"):
		return s.processXML(ctx, fileContent)
	case strings.HasSuffix(filename, ".pdf"):
		return s.processPDF(ctx, fileContent)
	default:
		return nil, fmt.Errorf("unsupported format: %s", filename)
	}
}

func (s *IngestionService) processPDF(ctx context.Context, pdfData []byte) (*domain.Tender, error) {
	// 1. OCR
	ocrText, err := s.ocrService.ExtractFromPDF(pdfData)
	if err != nil {
		return nil, fmt.Errorf("OCR failed: %w", err)
	}

	// 2. Grundlegende Metadaten extrahieren (Regex für Titel/Datum)
	title := extractTitleFromText(ocrText)
	deadline := extractDeadlineFromText(ocrText)

	// 3. Tender mit OCR-Text erstellen
	now := time.Now()
	tender := &domain.Tender{
		ID:               uuid.New(),
		SourcePortal:     "pdf-ocr",
		Title:            title,
		DescriptionFull:  ocrText,
		DeadlineAt:       deadline,
		ProcessingStatus: "ocr_processing",
		ScrapedAt:        &now,
		CreatedAt:        now,
	}

	// 4. Embedding generieren
	vectors64, err := s.embedder.EmbedStrings(ctx, []string{ocrText})
	if err != nil {
		return nil, fmt.Errorf("embedding failed: %w", err)
	}

	// 5. Speichern
	vector32 := make([]float32, len(vectors64[0]))
	for i, v := range vectors64[0] {
		vector32[i] = float32(v)
	}
	tender.RequirementEmbedding = pgvector.NewVector(vector32)

	if err := s.db.Create(tender).Error; err != nil {
		return nil, fmt.Errorf("save tender: %w", err)
	}

	return tender, nil
}

func (s *IngestionService) processXML(ctx context.Context, xmlData []byte) (*domain.Tender, error) {
	// 1. XML Parsen & Metadaten speichern
	tender, err := s.xmlParser.ParseAndSaveXML(xmlData)
	if err != nil {
		return nil, err
	}

	// 2. Embedding generieren
	inputText := fmt.Sprintf("%s\n%s\n%s",
		tender.Title,
		tender.DescriptionFull,
		strings.Join(tender.CPVCodes, " "),
	)

	// EmbedStrings gibt []float64 zurück
	vectors64, err := s.embedder.EmbedStrings(ctx, []string{inputText})
	if err != nil {
		return nil, fmt.Errorf("embedding generation failed: %w", err)
	}

	if len(vectors64) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}

	// 3. Konvertierung float64 -> float32
	vector32 := make([]float32, len(vectors64[0]))
	for i, v := range vectors64[0] {
		vector32[i] = float32(v)
	}

	// 4. Tender mit Vektor updaten
	tender.RequirementEmbedding = pgvector.NewVector(vector32)

	// Speichern
	if err := s.db.Model(tender).Update("requirement_embedding", tender.RequirementEmbedding).Error; err != nil {
		return nil, fmt.Errorf("failed to save embedding: %w", err)
	}

	return tender, nil
}

// extractTitleFromText versucht, einen Titel zu finden (nimmt die erste nicht-leere Zeile oder einen Default)
func extractTitleFromText(text string) string {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		// Titel sind meist kurz, aber nicht zu kurz, und enthalten keine Datumsmuster
		if len(trimmed) > 10 && len(trimmed) < 100 {
			return trimmed
		}
	}
	return "Unbenannte Ausschreibung (OCR)"
}

// extractDeadlineFromText sucht nach Datumsformaten im Text
func extractDeadlineFromText(text string) time.Time {
	// Sucht nach DD.MM.YYYY oder YYYY-MM-DD
	re := regexp.MustCompile(`\b(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})\b`)
	matches := re.FindStringSubmatch(text)

	if len(matches) > 0 {
		// Versuche deutsche Formatierung
		t, err := time.Parse("02.01.2006", matches[0])
		if err == nil {
			return t
		}

		// Versuche ISO Formatierung
		t, err = time.Parse("2006-01-02", matches[0])
		if err == nil {
			return t
		}
	}

	// Fallback: 4 Wochen in die Zukunft
	return time.Now().Add(28 * 24 * time.Hour)
}

// compressText entfernt überflüssige Whitespaces für weniger Token-Verbrauch
func compressText(text string) string {
	return strings.Join(strings.Fields(text), " ")
}
