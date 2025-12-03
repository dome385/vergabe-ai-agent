// internal/service/compliance_service.go
package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/vergabe-agent/vergabe-backend/internal/agent"
	"github.com/vergabe-agent/vergabe-backend/internal/domain"
	"gorm.io/gorm"
)

type ComplianceService struct {
	complianceAgent *agent.ComplianceAgent
	db              *gorm.DB
}

func NewComplianceService(agent *agent.ComplianceAgent, db *gorm.DB) *ComplianceService {
	return &ComplianceService{
		complianceAgent: agent,
		db:              db,
	}
}

func (s *ComplianceService) CheckCompliance(ctx context.Context, authUserID, tenderID uuid.UUID) (*domain.ComplianceCheck, error) {
	// 1. Company und Tender laden
	var company domain.Company
	var tender domain.Tender

	if err := s.db.Where("auth_user_id = ?", authUserID).First(&company).Error; err != nil {
		return nil, fmt.Errorf("company profile not found for user: %w", err)
	}

	if err := s.db.First(&tender, "id = ?", tenderID).Error; err != nil {
		return nil, fmt.Errorf("tender not found: %w", err)
	}

	// 2. Compliance Agent aufrufen
	input := agent.ComplianceInput{
		OCRText: tender.OCRCompressedText,
		ProfileSummary: fmt.Sprintf("Firma: %s, Branche: %v, Referenzen: %s",
			company.Name, company.IndustryTags, string(company.ReferencesJSON)),
	}

	assessment, err := s.complianceAgent.Assess(ctx, input)
	if err != nil {
		return nil, err
	}

	// 3. Ergebnis speichern
	check := &domain.ComplianceCheck{
		ID:             uuid.New(),
		CompanyID:      company.ID,
		TenderID:       tenderID,
		IsFeasible:     assessment.IsFeasible,
		MissingDocs:    assessment.Blockers,
		CriticalIssues: []string{},
		CreatedAt:      time.Now(),
	}

	if err := s.db.Create(check).Error; err != nil {
		return nil, err
	}

	return check, nil
}
