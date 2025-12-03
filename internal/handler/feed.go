package handler

import (
	"context"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/google/uuid"

	"github.com/vergabe-agent/vergabe-backend/internal/middleware"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
)

type FeedHandler struct {
	svc *service.MatchingService
}

func NewFeedHandler(svc *service.MatchingService) *FeedHandler {
	return &FeedHandler{svc: svc}
}

func (h *FeedHandler) GetFeed(ctx context.Context, c *app.RequestContext) {
	// User ID aus Middleware holen
	userIDVal, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	// UUID Parse
	userID, _ := uuid.Parse(userIDVal.(string))

	limit := 10
	if l := c.Query("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	matches, err := h.svc.FindMatchesHybrid(ctx, userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, map[string]any{"matches": matches})
}
