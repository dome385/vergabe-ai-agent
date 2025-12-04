package openrouter

import (
	"net/http"
	"strings"
)

const DefaultBaseURL = "https://openrouter.ai/api/v1"

// BuildAttributionHeaders returns the headers OpenRouter expects for attribution.
func BuildAttributionHeaders(appURL, appName string) map[string]string {
	headers := make(map[string]string, 2)

	if value := strings.TrimSpace(appURL); value != "" {
		headers["HTTP-Referer"] = value
	}

	if value := strings.TrimSpace(appName); value != "" {
		headers["X-Title"] = value
	}

	if len(headers) == 0 {
		return nil
	}

	return headers
}

// NewHTTPClient injects the attribution headers required by OpenRouter.
// Returns nil when no attribution headers are configured so callers can fall back to default clients.
func NewHTTPClient(appURL, appName string) *http.Client {
	headers := BuildAttributionHeaders(appURL, appName)
	if len(headers) == 0 {
		return nil
	}

	return &http.Client{
		Transport: &headerInjectorTransport{
			base:    http.DefaultTransport,
			headers: headers,
		},
	}
}

type headerInjectorTransport struct {
	base    http.RoundTripper
	headers map[string]string
}

func (h *headerInjectorTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	rt := h.base
	if rt == nil {
		rt = http.DefaultTransport
	}

	clone := req.Clone(req.Context())
	for key, value := range h.headers {
		if value == "" {
			continue
		}
		if clone.Header.Get(key) == "" {
			clone.Header.Set(key, value)
		}
	}

	return rt.RoundTrip(clone)
}
