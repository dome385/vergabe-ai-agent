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
	CompanyName    string   `json:"companyName"`
	LegalForm      string   `json:"legalForm"`
	TaxID          string   `json:"taxId"`
	Industry       string   `json:"industry"`
	CPVCodes       []string `json:"cpvCodes"`
	EmployeeCount  string   `json:"employeeCount"` // Frontend sends range string
	AddressStreet  string   `json:"addressStreet"`
	AddressZip     string   `json:"addressZip"`
	AddressCity    string   `json:"addressCity"`
	AddressCountry string   `json:"addressCountry"`
	ServiceRadius  int      `json:"serviceRadius"`
	RevenueTier    int      `json:"revenueTier"` // Frontend sends index 0-2
	FoundingYear   int      `json:"foundingYear"`
	ContactName    string   `json:"contactName"`
	ContactEmail   string   `json:"contactEmail"`
	ContactPhone   string   `json:"contactPhone"`
	Website        string   `json:"website"`
	IsAvpq         bool     `json:"isAvpq"`
	ProfileSummary string   `json:"profileSummary"`
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
	embeddingText := fmt.Sprintf("%s\n%s\n%s\n%s",
		input.Basics.CompanyName,
		input.Basics.Industry,
		strings.Join(input.Basics.CPVCodes, " "),
		input.Basics.ProfileSummary,
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

	// Convert EmployeeCount string to int (approximate)
	var empCount int
	switch input.Basics.EmployeeCount {
	case "1-10":
		empCount = 10
	case "11-50":
		empCount = 50
	case "51-200":
		empCount = 200
	case "201-500":
		empCount = 500
	case "500+":
		empCount = 1000
	default:
		empCount = 1
	}

	// Convert RevenueTier to numeric (approximate)
	var revenue float64
	switch input.Basics.RevenueTier {
	case 0:
		revenue = 500000 // <1M
	case 1:
		revenue = 5000000 // 1-10M
	case 2:
		revenue = 15000000 // >10M
	default:
		revenue = 0
	}

	// 3. Create Company
	company := &domain.Company{
		ID:                  uuid.New(),
		AuthUserID:          uuid.MustParse(input.AuthUserID),
		Name:                input.Basics.CompanyName,
		LegalForm:           input.Basics.LegalForm,
		TaxID:               input.Basics.TaxID,
		IndustryTags:        input.Basics.CPVCodes, // Using CPV codes as industry tags for now
		ContactName:         input.Basics.ContactName,
		ContactEmail:        input.Basics.ContactEmail,
		ContactPhone:        input.Basics.ContactPhone,
		AddressStreet:       input.Basics.AddressStreet,
		AddressZip:          input.Basics.AddressZip,
		AddressCity:         input.Basics.AddressCity,
		AddressCountry:      input.Basics.AddressCountry,
		ServiceRadiusKM:     input.Basics.ServiceRadius,
		EmployeeCount:       empCount,
		AnnualRevenue:       revenue,
		FoundingYear:        input.Basics.FoundingYear,
		ProfileSummary:      input.Basics.ProfileSummary,
		ProfileEmbedding:    pgvector.NewVector(vector32),
		ProjectReferences:   referencesJSON,
		Settings:            settingsJSON,
		OnboardingCompleted: true,
	}

	if company.AddressCountry == "" {
		company.AddressCountry = "DE"
	}
	if company.ServiceRadiusKM == 0 {
		company.ServiceRadiusKM = 100
	}

	// Save to DB
	if err := s.db.Create(company).Error; err != nil {
		// Check for unique constraint violation on auth_user_id
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			// Update existing
			var existing domain.Company
			if err := s.db.Where("auth_user_id = ?", input.AuthUserID).First(&existing).Error; err == nil {
				existing.Name = company.Name
				existing.LegalForm = company.LegalForm
				existing.TaxID = company.TaxID
				existing.IndustryTags = company.IndustryTags
				existing.ContactName = company.ContactName
				existing.ContactEmail = company.ContactEmail
				existing.ContactPhone = company.ContactPhone
				existing.AddressStreet = company.AddressStreet
				existing.AddressZip = company.AddressZip
				existing.AddressCity = company.AddressCity
				existing.AddressCountry = company.AddressCountry
				existing.ServiceRadiusKM = company.ServiceRadiusKM
				existing.EmployeeCount = company.EmployeeCount
				existing.AnnualRevenue = company.AnnualRevenue
				existing.FoundingYear = company.FoundingYear
				existing.ProfileSummary = company.ProfileSummary
				existing.ProfileEmbedding = company.ProfileEmbedding
				existing.ProjectReferences = company.ProjectReferences
				existing.Settings = company.Settings
				existing.OnboardingCompleted = true

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
