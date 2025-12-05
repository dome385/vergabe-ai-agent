package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// GeocodingService konvertiert Adressen zu Koordinaten via Nominatim (OpenStreetMap)
type GeocodingService struct {
	client    *http.Client
	userAgent string
}

// NewGeocodingService erstellt einen neuen Geocoding-Service
func NewGeocodingService() *GeocodingService {
	return &GeocodingService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		userAgent: "VergabeAIAgent/1.0 (https://vergabe-agent.de)",
	}
}

// NominatimResult ist die Antwort von Nominatim API
type NominatimResult struct {
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
	DisplayName string `json:"display_name"`
}

// Geocode konvertiert PLZ + Stadt + Land zu Latitude/Longitude
// Gibt (0, 0, nil) zurück wenn keine Koordinaten gefunden wurden
func (s *GeocodingService) Geocode(ctx context.Context, zip, city, country string) (lat, lng float64, err error) {
	if zip == "" && city == "" {
		return 0, 0, nil
	}

	// Query zusammenbauen
	query := ""
	if zip != "" {
		query = zip
	}
	if city != "" {
		if query != "" {
			query += " "
		}
		query += city
	}
	if country != "" {
		if query != "" {
			query += ", "
		}
		query += country
	}

	// Nominatim API URL
	baseURL := "https://nominatim.openstreetmap.org/search"
	params := url.Values{}
	params.Set("q", query)
	params.Set("format", "json")
	params.Set("limit", "1")
	params.Set("countrycodes", "de") // Nur Deutschland

	requestURL := baseURL + "?" + params.Encode()

	// HTTP Request erstellen
	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("create request failed: %w", err)
	}

	// User-Agent ist Pflicht bei Nominatim
	req.Header.Set("User-Agent", s.userAgent)

	// Request ausführen
	resp, err := s.client.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, 0, fmt.Errorf("nominatim returned status %d", resp.StatusCode)
	}

	// Response parsen
	var results []NominatimResult
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return 0, 0, fmt.Errorf("decode response failed: %w", err)
	}

	if len(results) == 0 {
		// Keine Ergebnisse - kein Fehler, aber 0,0 Koordinaten
		return 0, 0, nil
	}

	// Koordinaten parsen
	var latF, lngF float64
	_, err = fmt.Sscanf(results[0].Lat, "%f", &latF)
	if err != nil {
		return 0, 0, nil
	}
	_, err = fmt.Sscanf(results[0].Lon, "%f", &lngF)
	if err != nil {
		return 0, 0, nil
	}

	return latF, lngF, nil
}
