package handler

import (
	"context"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/vergabe-agent/vergabe-backend/internal/middleware"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
)

type CompanyHandler struct {
	svc *service.CompanyService
}

func NewCompanyHandler(svc *service.CompanyService) *CompanyHandler {
	return &CompanyHandler{svc: svc}
}

func (h *CompanyHandler) Create(ctx context.Context, c *app.RequestContext) {
	var input service.CompanyInput
	if err := c.BindAndValidate(&input); err != nil {
		c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// Get User ID from context (set by AuthMiddleware)
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	input.AuthUserID = userID.(string)

	company, err := h.svc.CreateCompany(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, company)
}
