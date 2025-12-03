package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/vergabe-agent/vergabe-backend/internal/domain"
)

var ErrCompanyNotFound = errors.New("company not found")

type MatchingService struct {
	db *gorm.DB
}

func NewMatchingService(db *gorm.DB) *MatchingService {
	return &MatchingService{db: db}
}

func (s *MatchingService) FindMatchesHybrid(ctx context.Context, authUserID uuid.UUID, limit int) ([]domain.Match, error) {
	if limit <= 0 {
		limit = 20
	}

	// Company mit ALLEN benötigten Feldern laden
	var company domain.Company
	if err := s.db.WithContext(ctx).
		Select("id", "profile_embedding", "industry_tags", "location_geom", "service_radius_km").
		Where("auth_user_id = ?", authUserID).
		First(&company).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCompanyNotFound
		}
		return nil, fmt.Errorf("load company failed: %w", err)
	}

	// Hybrid Query mit korrekter PostGIS-Distanzberechnung
	rows := make([]matchRowHybrid, 0, limit)

	// WICHTIG: Raw-Query mit Named Parameters
	err := s.db.WithContext(ctx).Raw(`
		WITH company_data AS (
			SELECT 
				id, 
				profile_embedding, 
				industry_tags, 
				location_geom, 
				service_radius_km
			FROM companies 
			WHERE id = @company_id
		),
		tender_candidates AS (
			SELECT 
				t.id,
				t.title,
				t.description_full,
				t.deadline,
				t.region_zip,
				t.cpv_codes,
				t.requirement_embedding,
				t.location_geom AS tender_location,
				-- 1. Vektor-Ähnlichkeit
				1 - (t.requirement_embedding <=> c.profile_embedding) AS vector_score,
				-- 2. CPV-Überlappung
				COALESCE(
					(SELECT COUNT(*)::float / NULLIF(array_length(t.cpv_codes, 1), 0)
					FROM unnest(t.cpv_codes) AS t_cpv
					WHERE t_cpv = ANY(c.industry_tags)
					), 0
				) AS cpv_score,
				-- 3. Geo-Distanz
				CASE 
					WHEN c.location_geom IS NOT NULL AND t.location_geom IS NOT NULL 
					THEN ST_Distance(c.location_geom::geography, t.location_geom::geography) / 1000
					ELSE NULL
				END AS distance_km,
				-- 4. Ist innerhalb des Radius?
				CASE 
					WHEN c.location_geom IS NOT NULL AND t.location_geom IS NOT NULL 
					THEN ST_DWithin(c.location_geom::geography, t.location_geom::geography, c.service_radius_km * 1000)
					ELSE false
				END AS is_within_radius
			FROM tenders t
			CROSS JOIN company_data c
			WHERE t.deadline > NOW()
		)
		SELECT 
			id AS tender_id,
			title,
			description_full AS description,
			deadline,
			region_zip,
			cpv_codes,
			vector_score,
			cpv_score,
			distance_km,
			is_within_radius,
			-- Geo-Score berechnen (höher = besser)
			CASE 
				WHEN distance_km IS NULL THEN 0.3
				WHEN is_within_radius = true THEN 1.0
				WHEN distance_km <= 50 THEN 0.8
				WHEN distance_km <= 100 THEN 0.6
				WHEN distance_km <= 200 THEN 0.4
				ELSE 0.2
			END AS geo_score
		FROM tender_candidates
		WHERE (vector_score > 0.3 OR cpv_score > 0.2 OR geo_score > 0.5)
		ORDER BY 
			CASE WHEN is_within_radius = true THEN 0 ELSE 1 END,
			(vector_score * 0.5 + cpv_score * 0.3 + geo_score * 0.2) DESC
		LIMIT @limit
	`, sql.Named("company_id", company.ID), sql.Named("limit", limit)).Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("hybrid query failed: %w", err)
	}

	// Matches erstellen
	matches := make([]domain.Match, len(rows))
	for i, row := range rows {
		matches[i] = domain.Match{
			ID:        uuid.New(),
			CompanyID: company.ID,
			TenderID:  row.TenderID,
			Score:     calculateWeightedScore(row.VectorScore, row.CPVScore, row.GeoScore),
			Reason:    generateReason(row.VectorScore, row.CPVScore, row.DistanceKM, row.IsWithinRadius),
			Status:    "new",
			Tender: domain.Tender{
				ID:              row.TenderID,
				Title:           row.Title,
				DescriptionFull: row.Description,
				Deadline:        row.Deadline.Time,
				RegionZIP:       row.RegionZIP,
				CPVCodes:        row.CPVCodes,
			},
		}
	}

	return matches, nil
}

// Hilfs-Struct muss ALLE Felder aus der Query enthalten
type matchRowHybrid struct {
	TenderID       uuid.UUID       `gorm:"column:tender_id"`
	Title          string          `gorm:"column:title"`
	Description    string          `gorm:"column:description"`
	Deadline       sql.NullTime    `gorm:"column:deadline"`
	RegionZIP      string          `gorm:"column:region_zip"`
	CPVCodes       []string        `gorm:"column:cpv_codes;type:text[]"`
	VectorScore    float64         `gorm:"column:vector_score"`
	CPVScore       float64         `gorm:"column:cpv_score"`
	DistanceKM     sql.NullFloat64 `gorm:"column:distance_km"`
	IsWithinRadius sql.NullBool    `gorm:"column:is_within_radius"`
	GeoScore       float64         `gorm:"column:geo_score"`
}

// Gewichtung: 50% Vektor, 30% CPV, 20% Geo
func calculateWeightedScore(v, c, g float64) float64 {
	return (v * 0.5) + (c * 0.3) + (g * 0.2)
}

func generateReason(v, c float64, distance sql.NullFloat64, withinRadius sql.NullBool) string {
	if withinRadius.Bool && v > 0.7 {
		return "Perfekte Übereinstimmung in Ihrer Nähe"
	}
	if v > 0.8 {
		return "Exzellente inhaltliche Übereinstimmung"
	}
	if c > 0.6 {
		return "Starke Branchenübereinstimmung"
	}
	if withinRadius.Bool {
		return fmt.Sprintf("Innerhalb Ihres Service-Radius (%.1f km)", distance.Float64)
	}
	if distance.Valid && distance.Float64 < 50 {
		return fmt.Sprintf("Gute geografische Nähe (%.1f km)", distance.Float64)
	}
	return "Potenzielle Übereinstimmung"
}
