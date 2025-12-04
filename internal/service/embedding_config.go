package service

import (
	"context"
	"errors"
	"strings"

	openaiembed "github.com/cloudwego/eino-ext/components/embedding/openai"
	orclient "github.com/vergabe-agent/vergabe-backend/internal/openrouter"
)

const defaultEmbeddingModel = "text-embedding-3-small"

// EmbeddingProviderConfig beschreibt die Konfiguration fuer OpenRouter Embedding-Aufrufe.
type EmbeddingProviderConfig struct {
	APIKey  string
	Model   string
	BaseURL string
	AppName string
	AppURL  string
}

func newEmbeddingClient(ctx context.Context, cfg EmbeddingProviderConfig) (*openaiembed.Embedder, error) {
	apiKey := strings.TrimSpace(cfg.APIKey)
	if apiKey == "" {
		return nil, errors.New("missing embedding API key")
	}

	model := strings.TrimSpace(cfg.Model)
	if model == "" {
		model = defaultEmbeddingModel
	}

	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = orclient.DefaultBaseURL
	}

	return openaiembed.NewEmbedder(ctx, &openaiembed.EmbeddingConfig{
		APIKey:     apiKey,
		Model:      model,
		BaseURL:    baseURL,
		HTTPClient: orclient.NewHTTPClient(cfg.AppURL, cfg.AppName),
	})
}
