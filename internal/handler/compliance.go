// handler/compliance.go - Neu erstellen
package handler

import (
	"context"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/google/uuid"
	"github.com/vergabe-agent/vergabe-backend/internal/middleware"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
)

type ComplianceHandler struct {
	svc *service.ComplianceService
}

func NewComplianceHandler(svc *service.ComplianceService) *ComplianceHandler {
	return &ComplianceHandler{svc: svc}
}

// In internal/handler/compliance.go

func (h *ComplianceHandler) Analyze(ctx context.Context, c *app.RequestContext) {
	userIDVal, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	// Parse Auth User ID
	authUserID, err := uuid.Parse(userIDVal.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid User ID"})
		return
	}

	tenderIDStr := c.Param("tenderId")
	tenderID, err := uuid.Parse(tenderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid tender ID"})
		return
	}

	// FIX: Wir übergeben jetzt die authUserID
	check, err := h.svc.CheckCompliance(ctx, authUserID, tenderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, check)
}
