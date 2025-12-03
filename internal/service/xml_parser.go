package service

import (
	"encoding/xml"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/vergabe-agent/vergabe-backend/internal/domain"
)

type XMLParserService struct {
	db *gorm.DB
}

func NewXMLParserService(db *gorm.DB) *XMLParserService {
	return &XMLParserService{db: db}
}

// UBL XML Struktur (vereinfacht für Parsing)
type UBLContractNotice struct {
	XMLName          xml.Name `xml:"ContractNotice"`
	ID               string   `xml:"ID"`
	ContractFolderID string   `xml:"ContractFolderID"`
	IssueDate        string   `xml:"IssueDate"`
	NoticeTypeCode   string   `xml:"NoticeTypeCode"`
	TenderingProcess struct {
		ProcedureCode                  string `xml:"ProcedureCode"`
		TenderSubmissionDeadlinePeriod struct {
			EndDate string `xml:"EndDate"`
			EndTime string `xml:"EndTime"`
		} `xml:"TenderSubmissionDeadlinePeriod"`
	} `xml:"TenderingProcess"`
	ProcurementProject struct {
		Name                        string `xml:"Name"`
		Description                 string `xml:"Description"`
		ProcurementTypeCode         string `xml:"ProcurementTypeCode"`
		MainCommodityClassification struct {
			ItemClassificationCode string `xml:"ItemClassificationCode"`
		} `xml:"MainCommodityClassification"`
		RealizedLocation struct {
			Address struct {
				CountrySubentityCode string `xml:"CountrySubentityCode"` // NUTS/ZIP often here
			} `xml:"Address"`
		} `xml:"RealizedLocation"`
	} `xml:"ProcurementProject"`
}

func (s *XMLParserService) ParseAndSaveXML(xmlData []byte) (*domain.Tender, error) {
	var ubl UBLContractNotice
	if err := xml.Unmarshal(xmlData, &ubl); err != nil {
		return nil, fmt.Errorf("XML parsing failed: %w", err)
	}

	// Deadline Construct
	deadlineStr := ubl.TenderingProcess.TenderSubmissionDeadlinePeriod.EndDate + "T" + ubl.TenderingProcess.TenderSubmissionDeadlinePeriod.EndTime
	deadline, err := time.Parse("2006-01-02T15:04:05Z07:00", deadlineStr) // Versuche ISO8601
	if err != nil {
		deadline = time.Now().Add(14 * 24 * time.Hour) // Fallback: 2 Wochen
	}

	now := time.Now()
	tender := &domain.Tender{
		ID:                  uuid.New(),
		ExternalID:          ubl.ID,
		NoticeID:            ubl.ID,
		ContractFolderID:    ubl.ContractFolderID,
		Title:               ubl.ProcurementProject.Name,
		DescriptionFull:     ubl.ProcurementProject.Description,
		OCRCompressedText:   ubl.ProcurementProject.Description, // Initiale Füllung
		Deadline:            deadline,
		RegionZIP:           ubl.ProcurementProject.RealizedLocation.Address.CountrySubentityCode,
		ProcedureCode:       ubl.TenderingProcess.ProcedureCode,
		ProcurementTypeCode: ubl.ProcurementProject.ProcurementTypeCode,
		CPVCodes:            []string{ubl.ProcurementProject.MainCommodityClassification.ItemClassificationCode},
		XMLRaw:              string(xmlData),
		ParsedAt:            &now,
	}

	// Upsert Logic (On Conflict Update)
	// GORM macht das am besten explizit
	var existing domain.Tender
	err = s.db.Where("external_id = ?", tender.ExternalID).First(&existing).Error
	if err == nil {
		// Update existing
		tender.ID = existing.ID
		if err := s.db.Model(&existing).Updates(tender).Error; err != nil {
			return nil, err
		}
		return &existing, nil
	}

	// Create new
	if err := s.db.Create(tender).Error; err != nil {
		return nil, err
	}

	return tender, nil
}
