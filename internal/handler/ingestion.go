package handler

import (
	"context"
	"io"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
)

type IngestionHandler struct {
	svc *service.IngestionService
}

func NewIngestionHandler(svc *service.IngestionService) *IngestionHandler {
	return &IngestionHandler{svc: svc}
}

func (h *IngestionHandler) UploadFile(ctx context.Context, c *app.RequestContext) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "File fehlt"})
		return
	}

	src, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": "Upload Fehler"})
		return
	}
	defer src.Close()

	bytes, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": "Read Fehler"})
		return
	}

	tender, err := h.svc.ProcessUpload(ctx, bytes, fileHeader.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, map[string]any{
		"status": "success",
		"id":     tender.ID,
		"title":  tender.Title,
	})
}
