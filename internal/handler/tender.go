package handler

import (
	"context"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/google/uuid"
	"github.com/vergabe-agent/vergabe-backend/internal/domain"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
	"gorm.io/gorm"
)

type TenderHandler struct {
	db         *gorm.DB
	storage    *service.SupabaseStorageService
	ocrService *service.OCRService
}

func NewTenderHandler(db *gorm.DB, storage *service.SupabaseStorageService, ocrService *service.OCRService) *TenderHandler {
	return &TenderHandler{
		db:         db,
		storage:    storage,
		ocrService: ocrService,
	}
}

// ListTenders returns all tenders for dropdown selection
func (h *TenderHandler) ListTenders(ctx context.Context, c *app.RequestContext) {
	var tenders []domain.Tender

	err := h.db.WithContext(ctx).
		Select("id", "title", "awarding_authority", "deadline_at", "created_at").
		Order("created_at DESC").
		Limit(100).
		Find(&tenders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tenders)
}

// GetTenderAttachments returns all attachments for a tender
func (h *TenderHandler) GetTenderAttachments(ctx context.Context, c *app.RequestContext) {
	tenderID := c.Param("tenderId")
	if tenderID == "" {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "tender_id required"})
		return
	}

	tenderUUID, err := uuid.Parse(tenderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid tender_id"})
		return
	}

	var attachments []domain.TenderAttachment
	err = h.db.WithContext(ctx).
		Where("tender_id = ?", tenderUUID).
		Order("created_at DESC").
		Find(&attachments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attachments)
}

// UploadAttachment handles PDF upload for a tender
func (h *TenderHandler) UploadAttachment(ctx context.Context, c *app.RequestContext) {
	tenderID := c.Param("tenderId")
	if tenderID == "" {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "tender_id required"})
		return
	}

	tenderUUID, err := uuid.Parse(tenderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid tender_id"})
		return
	}

	// Check tender exists
	var tender domain.Tender
	if err := h.db.WithContext(ctx).First(&tender, "id = ?", tenderUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, map[string]string{"error": "Tender nicht gefunden"})
		return
	}

	// Get file from form
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "File fehlt"})
		return
	}

	// Validate file type
	filename := fileHeader.Filename
	ext := strings.ToLower(filepath.Ext(filename))
	allowedTypes := map[string]struct {
		fileType    string
		contentType string
	}{
		".pdf":  {"pdf", "application/pdf"},
		".doc":  {"doc", "application/msword"},
		".docx": {"docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
		".xlsx": {"xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
		".xls":  {"xls", "application/vnd.ms-excel"},
	}

	typeInfo, ok := allowedTypes[ext]
	if !ok {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "Nur PDF, DOC, DOCX, XLS, XLSX erlaubt"})
		return
	}

	// Read file content
	src, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": "Datei konnte nicht geöffnet werden"})
		return
	}
	defer src.Close()

	fileBytes, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": "Datei konnte nicht gelesen werden"})
		return
	}

	// Generate storage path
	attachmentID := uuid.New()
	storagePath := tenderID + "/" + attachmentID.String() + ext

	// Upload to Supabase Storage
	if h.storage != nil {
		if err := h.storage.UploadFile("tender-attachments", storagePath, fileBytes, typeInfo.contentType); err != nil {
			log.Printf("Storage upload failed: %v", err)
			c.JSON(http.StatusInternalServerError, map[string]string{"error": "Datei-Upload fehlgeschlagen: " + err.Error()})
			return
		}
	}

	// Get optional metadata from form
	documentType := string(c.FormValue("document_type"))
	title := string(c.FormValue("title"))
	if title == "" {
		title = filename
	}
	description := string(c.FormValue("description"))

	// Create attachment record
	attachment := &domain.TenderAttachment{
		ID:           attachmentID,
		TenderID:     tenderUUID,
		Filename:     filename,
		FileType:     typeInfo.fileType,
		DocumentType: documentType,
		Title:        title,
		Description:  description,
		StoragePath:  storagePath,
		FileSize:     len(fileBytes),
		CreatedAt:    time.Now(),
	}

	// Save to database
	if err := h.db.WithContext(ctx).Create(attachment).Error; err != nil {
		// Try to cleanup uploaded file
		if h.storage != nil {
			h.storage.DeleteFile("tender-attachments", storagePath)
		}
		c.JSON(http.StatusInternalServerError, map[string]string{"error": "Speichern fehlgeschlagen: " + err.Error()})
		return
	}

	// Run OCR for PDF files in background
	if typeInfo.fileType == "pdf" && h.ocrService != nil {
		go func() {
			log.Printf("Starting OCR for attachment %s", attachment.ID)
			ocrText, err := h.ocrService.ExtractFromPDF(fileBytes)
			if err != nil {
				log.Printf("OCR failed for attachment %s: %v", attachment.ID, err)
				return
			}

			// Update attachment with OCR result
			updateErr := h.db.Model(&domain.TenderAttachment{}).
				Where("id = ?", attachment.ID).
				Updates(map[string]interface{}{
					"content_ocr":   ocrText,
					"ocr_processed": true,
				}).Error

			if updateErr != nil {
				log.Printf("Failed to save OCR result for attachment %s: %v", attachment.ID, updateErr)
			} else {
				log.Printf("OCR completed for attachment %s (%d chars)", attachment.ID, len(ocrText))
			}
		}()
	}

	c.JSON(http.StatusOK, attachment)
}

// DeleteAttachment removes an attachment
func (h *TenderHandler) DeleteAttachment(ctx context.Context, c *app.RequestContext) {
	attachmentID := c.Param("attachmentId")
	if attachmentID == "" {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "attachment_id required"})
		return
	}

	attachmentUUID, err := uuid.Parse(attachmentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid attachment_id"})
		return
	}

	// Get attachment to find storage path
	var attachment domain.TenderAttachment
	if err := h.db.WithContext(ctx).First(&attachment, "id = ?", attachmentUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, map[string]string{"error": "Attachment nicht gefunden"})
		return
	}

	// Delete from storage
	if h.storage != nil && attachment.StoragePath != "" {
		if err := h.storage.DeleteFile("tender-attachments", attachment.StoragePath); err != nil {
			log.Printf("Storage delete failed: %v", err)
			// Continue with DB delete anyway
		}
	}

	// Delete from database
	result := h.db.WithContext(ctx).Delete(&domain.TenderAttachment{}, "id = ?", attachmentUUID)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
