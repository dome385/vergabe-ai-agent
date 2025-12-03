package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	openaiembed "github.com/cloudwego/eino-ext/components/embedding/openai"
	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
	"github.com/vergabe-agent/vergabe-backend/internal/domain"
	"gorm.io/gorm"
)

type CompanyService struct {
	db       *gorm.DB
	embedder *openaiembed.Embedder
}

func NewCompanyService(db *gorm.DB, openAIKey string) (*CompanyService, error) {
	ctx := context.Background()
	emb, err := openaiembed.NewEmbedder(ctx, &openaiembed.EmbeddingConfig{
		APIKey: openAIKey,
		Model:  "text-embedding-3-small",
	})
	if err != nil {
		return nil, fmt.Errorf("init embedder failed: %w", err)
	}

	return &CompanyService{
		db:       db,
		embedder: emb,
	}, nil
}

type CompanyInput struct {
	AuthUserID  string          `json:"-"` // Set from context
	Basics      BasicsData      `json:"basics"`
	References  ReferencesData  `json:"references"`
	Preferences PreferencesData `json:"preferences"`
}

type BasicsData struct {
	CompanyName   string   `json:"companyName"`
	Industry      string   `json:"industry"`
	CPVCodes      []string `json:"cpvCodes"`
	EmployeeCount string   `json:"employeeCount"`
	Location      string   `json:"location"`
	RevenueTier   int      `json:"revenueTier"`
	ContactName   string   `json:"contactName"`
	ContactEmail  string   `json:"contactEmail"`
	Website       string   `json:"website"`
	IsAvpq        bool     `json:"isAvpq"`
}

type ReferencesData struct {
	Documents    []any `json:"documents"`
	References   []any `json:"references"`
	Certificates []any `json:"certificates"`
}

type PreferencesData struct {
	AlertEmail     bool     `json:"alertEmail"`
	AlertSlack     bool     `json:"alertSlack"`
	AlertFrequency string   `json:"alertFrequency"`
	MinMatchScore  int      `json:"minMatchScore"`
	BudgetRange    []int    `json:"budgetRange"`
	Regions        []string `json:"regions"`
	Consent        bool     `json:"consent"`
}

func (s *CompanyService) CreateCompany(ctx context.Context, input CompanyInput) (*domain.Company, error) {
	// 1. Generate Embedding
	embeddingText := fmt.Sprintf("%s\n%s\n%s",
		input.Basics.CompanyName,
		input.Basics.Industry,
		strings.Join(input.Basics.CPVCodes, " "),
	)

	vectors64, err := s.embedder.EmbedStrings(ctx, []string{embeddingText})
	if err != nil {
		return nil, fmt.Errorf("embedding failed: %w", err)
	}

	vector32 := make([]float32, len(vectors64[0]))
	for i, v := range vectors64[0] {
		vector32[i] = float32(v)
	}

	// 2. Prepare JSONs
	referencesJSON, _ := json.Marshal(input.References)
	settingsJSON, _ := json.Marshal(input.Preferences)

	// 3. Create Company
	company := &domain.Company{
		ID:               uuid.New(),
		AuthUserID:       uuid.MustParse(input.AuthUserID),
		Name:             input.Basics.CompanyName,
		IndustryTags:     input.Basics.CPVCodes,
		ZipCode:          input.Basics.Location, // Assuming location is ZIP for now, or extract it
		ProfileEmbedding: pgvector.NewVector(vector32),
		ReferencesJSON:   referencesJSON,
		Settings:         settingsJSON,
		// Map other fields as needed
	}

	// Save to DB
	if err := s.db.Create(company).Error; err != nil {
		// Check for unique constraint violation on auth_user_id
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			// Update existing? Or return error?
			// For now, let's update
			var existing domain.Company
			if err := s.db.Where("auth_user_id = ?", input.AuthUserID).First(&existing).Error; err == nil {
				existing.Name = company.Name
				existing.IndustryTags = company.IndustryTags
				existing.ZipCode = company.ZipCode
				existing.ProfileEmbedding = company.ProfileEmbedding
				existing.ReferencesJSON = company.ReferencesJSON
				if err := s.db.Save(&existing).Error; err != nil {
					return nil, fmt.Errorf("update company failed: %w", err)
				}
				return &existing, nil
			}
		}
		return nil, fmt.Errorf("create company failed: %w", err)
	}

	return company, nil
}
