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
	Longitude           float64         `gorm:"type:double precision" json:"longitude,omitempty"`
	Latitude            float64         `gorm:"type:double precision" json:"latitude,omitempty"`
	LocationGeog        interface{}     `gorm:"type:geography(Point,4326);<-:false" json:"-"`
	EmployeeCount       int             `json:"employee_count"`
	AnnualRevenue       float64         `gorm:"type:numeric(12,2)" json:"annual_revenue"`
	FoundingYear        int             `json:"founding_year"`
	ProfileSummary      string          `json:"profile_summary"`
	ProfileEmbedding    pgvector.Vector `gorm:"type:vector(1536)" json:"profile_embedding"` // Changed to 100 dims as per SQL
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
	Title                string          `json:"title"`
	DescriptionFull      string          `json:"description_full"`
	OCRCompressedText    string          `json:"ocr_compressed_text"`
	Deadline             time.Time       `gorm:"type:timestamptz" json:"deadline"`
	RegionZIP            string          `json:"region_zip"`
	RequirementEmbedding pgvector.Vector `gorm:"type:vector(1536)" json:"requirement_embedding"`
	CPVCodes             pq.StringArray  `gorm:"type:text[]" json:"cpv_codes"`

	// PostGIS
	Longitude    float64     `gorm:"type:double precision" json:"longitude,omitempty"`
	Latitude     float64     `gorm:"type:double precision" json:"latitude,omitempty"`
	LocationCity string      `json:"location_city,omitempty"`
	LocationGeom interface{} `gorm:"type:geography(Point,4326);<-:false" json:"-"`

	// XML Metadaten
	NoticeID            string     `json:"notice_id"`
	ContractFolderID    string     `json:"contract_folder_id"`
	ProcedureCode       string     `json:"procedure_code"`
	ProcurementTypeCode string     `json:"procurement_type_code"`
	XMLRaw              string     `gorm:"type:text" json:"xml_raw,omitempty"`
	ParsedAt            *time.Time `gorm:"type:timestamptz" json:"parsed_at,omitempty"`
	CreatedAt           time.Time  `gorm:"type:timestamptz;default:now()" json:"created_at"`
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
