package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/pgvector/pgvector-go"
)

// Company repräsentiert das Firmenprofil
// Company repräsentiert das Firmenprofil
type Company struct {
	ID                  uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	AuthUserID          uuid.UUID       `gorm:"type:uuid;uniqueIndex" json:"auth_user_id"`
	Name                string          `json:"name"`
	LegalForm           string          `json:"legal_form"`
	TaxID               string          `json:"tax_id"`
	IndustryTags        pq.StringArray  `gorm:"type:text[]" json:"industry_tags"`
	ContactName         string          `json:"contact_name"`
	ContactEmail        string          `json:"contact_email"`
	ContactPhone        string          `json:"contact_phone"`
	AddressStreet       string          `json:"address_street"`
	AddressZip          string          `json:"address_zip"`
	AddressCity         string          `json:"address_city"`
	AddressCountry      string          `gorm:"default:'DE'" json:"address_country"`
	ServiceRadiusKM     int             `gorm:"default:100" json:"service_radius_km"`
	Longitude           float64         `gorm:"column:longitude;type:double precision" json:"longitude,omitempty"`
	Latitude            float64         `gorm:"column:latitude;type:double precision" json:"latitude,omitempty"`
	LocationGeog        interface{}     `gorm:"-" json:"-"`
	EmployeeCount       int             `json:"employee_count"`
	AnnualRevenue       float64         `gorm:"type:numeric(12,2)" json:"annual_revenue"`
	FoundingYear        int             `json:"founding_year"`
	ProfileSummary      string          `json:"profile_summary"`
	ProfileEmbedding    pgvector.Vector `gorm:"type:vector(1536);<-:update" json:"profile_embedding"` // Changed to 100 dims as per SQL
	Certifications      json.RawMessage `gorm:"type:jsonb;default:'[]'" json:"certifications"`
	ProjectReferences   json.RawMessage `gorm:"type:jsonb;default:'[]'" json:"project_references"`
	EmployeeCVs         json.RawMessage `gorm:"column:employee_cvs;type:jsonb;default:'[]'" json:"employee_cvs"`
	FinancialDocuments  json.RawMessage `gorm:"type:jsonb;default:'[]'" json:"financial_documents"`
	OnboardingCompleted bool            `gorm:"default:false" json:"onboarding_completed"`
	SubscriptionTier    string          `gorm:"default:'free'" json:"subscription_tier"`
	Settings            json.RawMessage `gorm:"type:jsonb;default:'{\"auto_generate\": false, \"notifications\": true}'" json:"settings"`
	CreatedAt           time.Time       `gorm:"type:timestamptz;default:now()" json:"created_at"`
	UpdatedAt           time.Time       `gorm:"type:timestamptz;default:now()" json:"updated_at"`
	VerifiedAt          *time.Time      `gorm:"type:timestamptz" json:"verified_at"`
}

// Tender repräsentiert eine Ausschreibung
type Tender struct {
	ID                   uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ExternalID           string          `gorm:"uniqueIndex" json:"external_id"`
	SourcePortal         string          `json:"source_portal"`
	SourceURL            string          `json:"source_url"`
	Title                string          `json:"title"`
	Description          string          `json:"description"`
	DescriptionFull      string          `json:"description_full"`
	OCRCompressedText    string          `gorm:"column:ocr_compressed_text" json:"ocr_compressed_text"`
	CPVCodes             pq.StringArray  `gorm:"type:text[]" json:"cpv_codes"`
	NutsCodes            pq.StringArray  `gorm:"type:text[];column:nutscodes" json:"nutscodes"`
	ProcedureType        string          `json:"procedure_type"`
	AwardCriteria        string          `json:"award_criteria"`
	EstimatedValue       float64         `gorm:"type:numeric(20,2)" json:"estimated_value"`
	Currency             string          `gorm:"default:'EUR'" json:"currency"`
	BudgetType           string          `json:"budget_type"`
	PublishedAt          *time.Time      `gorm:"type:timestamptz" json:"published_at"`
	DeadlineAt           time.Time       `gorm:"column:deadline_at;type:timestamptz" json:"deadline_at"`
	AwardAt              *time.Time      `gorm:"type:timestamptz" json:"award_at"`
	AwardingAuthority    string          `json:"awarding_authority"`
	AuthorityAddress     string          `json:"authority_address"`
	LocationZip          string          `json:"location_zip"`
	LocationCity         string          `json:"location_city"`
	Longitude            float64         `gorm:"column:longitude;type:double precision" json:"longitude,omitempty"`
	Latitude             float64         `gorm:"column:latitude;type:double precision" json:"latitude,omitempty"`
	LocationGeog         interface{}     `gorm:"-" json:"-"`
	RequirementEmbedding pgvector.Vector `gorm:"type:vector(1536);<-:update" json:"requirement_embedding"`
	FilePath             string          `json:"file_path"`
	ProcessingStatus     string          `gorm:"default:'pending'" json:"processing_status"`
	OCRQualityScore      *float64        `gorm:"type:double precision" json:"ocr_quality_score"`
	ParsingErrors        pq.StringArray  `gorm:"type:text[]" json:"parsing_errors"`
	ScrapedAt            *time.Time      `gorm:"type:timestamptz" json:"scraped_at"`
	CreatedAt            time.Time       `gorm:"type:timestamptz;default:now()" json:"created_at"`

	// Legacy fields for compatibility (mapped to new columns)
	Deadline  time.Time `gorm:"-" json:"deadline,omitempty"`
	RegionZIP string    `gorm:"-" json:"region_zip,omitempty"`
}

// Match repräsentiert das Ergebnis
type Match struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CompanyID uuid.UUID `gorm:"type:uuid;index" json:"company_id"`
	TenderID  uuid.UUID `gorm:"type:uuid;index" json:"tender_id"`
	Score     float64   `json:"score"`
	Reason    string    `gorm:"column:reason_text" json:"reason_text"`
	Status    string    `json:"status"`

	Company Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Tender  Tender  `gorm:"foreignKey:TenderID" json:"tender,omitempty"`
}

type ComplianceCheck struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CompanyID      uuid.UUID      `gorm:"type:uuid;index" json:"company_id"`
	TenderID       uuid.UUID      `gorm:"type:uuid;index" json:"tender_id"`
	IsFeasible     bool           `json:"is_feasible"`
	MissingDocs    pq.StringArray `gorm:"type:text[]" json:"missing_docs"`
	CriticalIssues pq.StringArray `gorm:"type:text[]" json:"critical_issues"`
	CreatedAt      time.Time      `gorm:"type:timestamptz;default:now()" json:"created_at"`

	// Relationen (Optional, falls GORM Preloading genutzt wird)
	Company Company `gorm:"foreignKey:CompanyID" json:"-"`
	Tender  Tender  `gorm:"foreignKey:TenderID" json:"-"`
}

// TenderAttachment repräsentiert ein PDF/Dokument das zu einer Ausschreibung gehört
type TenderAttachment struct {
	ID               uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	TenderID         uuid.UUID       `gorm:"type:uuid;index" json:"tender_id"`
	Filename         string          `json:"filename"`
	FileType         string          `json:"file_type"`
	DocumentType     string          `json:"document_type"`
	Title            string          `json:"title"`
	Description      string          `json:"description"`
	StoragePath      string          `json:"storage_path"`
	FileSize         int             `json:"file_size"`
	ContentOCR       string          `gorm:"column:content_ocr;type:text" json:"content_ocr"`
	OCRProcessed     bool            `gorm:"column:ocr_processed;default:false" json:"ocr_processed"`
	OCRQualityScore  *float64        `gorm:"column:ocr_quality_score;type:double precision" json:"ocr_quality_score"`
	ContentEmbedding pgvector.Vector `gorm:"column:content_embedding;type:vector(1536);<-:update" json:"content_embedding"`
	CreatedAt        time.Time       `gorm:"type:timestamptz;default:now()" json:"created_at"`

	// Relation
	Tender Tender `gorm:"foreignKey:TenderID" json:"-"`
}
