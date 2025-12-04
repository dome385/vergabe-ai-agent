package service

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SupabaseStorageService handles file uploads to Supabase Storage
type SupabaseStorageService struct {
	projectURL string
	serviceKey string
	httpClient *http.Client
}

// NewSupabaseStorageService creates a new storage service
func NewSupabaseStorageService(projectURL, serviceKey string) *SupabaseStorageService {
	return &SupabaseStorageService{
		projectURL: projectURL,
		serviceKey: serviceKey,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// UploadFile uploads a file to Supabase Storage
func (s *SupabaseStorageService) UploadFile(bucket, path string, data []byte, contentType string) error {
	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.projectURL, bucket, path)

	req, err := http.NewRequest("POST", url, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("create request failed: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true") // Overwrite if exists

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("upload request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// DeleteFile deletes a file from Supabase Storage
func (s *SupabaseStorageService) DeleteFile(bucket, path string) error {
	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.projectURL, bucket, path)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("create request failed: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.serviceKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("delete request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 && resp.StatusCode != 404 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// GetPublicURL returns the public URL for a file (if bucket is public)
func (s *SupabaseStorageService) GetPublicURL(bucket, path string) string {
	return fmt.Sprintf("%s/storage/v1/object/public/%s/%s", s.projectURL, bucket, path)
}

// GetSignedURL returns a signed URL for private file access
func (s *SupabaseStorageService) GetSignedURL(bucket, path string, expiresIn int) (string, error) {
	url := fmt.Sprintf("%s/storage/v1/object/sign/%s/%s", s.projectURL, bucket, path)

	reqBody := fmt.Sprintf(`{"expiresIn":%d}`, expiresIn)
	req, err := http.NewRequest("POST", url, bytes.NewReader([]byte(reqBody)))
	if err != nil {
		return "", fmt.Errorf("create request failed: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("sign request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("sign failed with status %d: %s", resp.StatusCode, string(body))
	}

	body, _ := io.ReadAll(resp.Body)
	// Response is {"signedURL": "..."}
	// Simple extraction without full JSON parsing
	return fmt.Sprintf("%s/storage/v1%s", s.projectURL, extractSignedPath(string(body))), nil
}

func extractSignedPath(jsonResp string) string {
	// Very basic extraction - in production use proper JSON parsing
	start := `"signedURL":"`
	idx := len(start)
	if i := bytes.Index([]byte(jsonResp), []byte(start)); i >= 0 {
		rest := jsonResp[i+idx:]
		if end := bytes.Index([]byte(rest), []byte(`"`)); end >= 0 {
			return rest[:end]
		}
	}
	return ""
}
