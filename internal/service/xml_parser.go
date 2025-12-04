package service

import (
	"encoding/xml"
	"fmt"
	"strings"
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

// eForms UBL 2.3 XML Structure with namespace support
type EFormsContractNotice struct {
	XMLName          xml.Name `xml:"ContractNotice"`
	ID               string   `xml:"ID"`
	ContractFolderID string   `xml:"ContractFolderID"`
	IssueDate        string   `xml:"IssueDate"`
	IssueTime        string   `xml:"IssueTime"`
	NoticeTypeCode   string   `xml:"NoticeTypeCode"`

	// Extensions containing Organizations
	UBLExtensions struct {
		UBLExtension struct {
			ExtensionContent struct {
				EformsExtension struct {
					Organizations struct {
						Organization []struct {
							Company struct {
								WebsiteURI string `xml:"WebsiteURI"`
								EndpointID string `xml:"EndpointID"`
								PartyName  struct {
									Name string `xml:"Name"`
								} `xml:"PartyName"`
								PostalAddress struct {
									StreetName           string `xml:"StreetName"`
									CityName             string `xml:"CityName"`
									PostalZone           string `xml:"PostalZone"`
									CountrySubentityCode string `xml:"CountrySubentityCode"`
								} `xml:"PostalAddress"`
								Contact struct {
									Telephone      string `xml:"Telephone"`
									ElectronicMail string `xml:"ElectronicMail"`
								} `xml:"Contact"`
							} `xml:"Company"`
						} `xml:"Organization"`
					} `xml:"Organizations"`
				} `xml:"EformsExtension"`
			} `xml:"ExtensionContent"`
		} `xml:"UBLExtension"`
	} `xml:"UBLExtensions"`

	// ContractingParty (alternative format for authority info)
	ContractingParty struct {
		Party struct {
			PartyName struct {
				Name string `xml:"Name"`
			} `xml:"PartyName"`
		} `xml:"Party"`
	} `xml:"ContractingParty"`

	// Tendering Process
	TenderingProcess struct {
		SubmissionMethodCode           string `xml:"SubmissionMethodCode"`
		TenderSubmissionDeadlinePeriod struct {
			EndDate string `xml:"EndDate"`
			EndTime string `xml:"EndTime"`
		} `xml:"TenderSubmissionDeadlinePeriod"`
	} `xml:"TenderingProcess"`

	// Main Procurement Project
	ProcurementProject struct {
		ID                          string `xml:"ID"`
		Name                        string `xml:"Name"`
		Description                 string `xml:"Description"`
		ProcurementTypeCode         string `xml:"ProcurementTypeCode"`
		MainCommodityClassification struct {
			ItemClassificationCode string `xml:"ItemClassificationCode"`
		} `xml:"MainCommodityClassification"`
		AdditionalCommodityClassification []struct {
			ItemClassificationCode string `xml:"ItemClassificationCode"`
		} `xml:"AdditionalCommodityClassification"`
		RealizedLocation struct {
			Description string `xml:"Description"`
			Address     struct {
				CityName             string `xml:"CityName"`
				PostalZone           string `xml:"PostalZone"`
				CountrySubentityCode string `xml:"CountrySubentityCode"`
			} `xml:"Address"`
		} `xml:"RealizedLocation"`
	} `xml:"ProcurementProject"`

	// Procurement Project Lot (contains CPV codes and awarding terms)
	ProcurementProjectLot struct {
		ID             string `xml:"ID"`
		TenderingTerms struct {
			AwardingTerms struct {
				AwardingCriterion struct {
					SubordinateAwardingCriterion struct {
						AwardingCriterionTypeCode string `xml:"AwardingCriterionTypeCode"`
						Name                      string `xml:"Name"`
					} `xml:"SubordinateAwardingCriterion"`
				} `xml:"AwardingCriterion"`
			} `xml:"AwardingTerms"`
			CallForTendersDocumentReference struct {
				Attachment struct {
					ExternalReference struct {
						URI string `xml:"URI"`
					} `xml:"ExternalReference"`
				} `xml:"Attachment"`
			} `xml:"CallForTendersDocumentReference"`
		} `xml:"TenderingTerms"`
		TenderingProcess struct {
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
			AdditionalCommodityClassification []struct {
				ItemClassificationCode string `xml:"ItemClassificationCode"`
			} `xml:"AdditionalCommodityClassification"`
			RealizedLocation struct {
				Description string `xml:"Description"`
				Address     struct {
					CityName             string `xml:"CityName"`
					PostalZone           string `xml:"PostalZone"`
					CountrySubentityCode string `xml:"CountrySubentityCode"`
					Country              struct {
						IdentificationCode string `xml:"IdentificationCode"`
					} `xml:"Country"`
				} `xml:"Address"`
			} `xml:"RealizedLocation"`
		} `xml:"ProcurementProject"`
	} `xml:"ProcurementProjectLot"`
}

// validateNoticeType checks if the XML is a ContractNotice (accepted) or ContractAwardNotice (rejected)
func (s *XMLParserService) validateNoticeType(xmlData []byte) error {
	// Simple struct to detect root element
	type RootDetector struct {
		XMLName xml.Name
	}

	var root RootDetector
	if err := xml.Unmarshal(xmlData, &root); err != nil {
		return fmt.Errorf("ungültiges XML-Format: %w", err)
	}

	// Check root element local name
	switch root.XMLName.Local {
	case "ContractNotice":
		return nil // Accepted
	case "ContractAwardNotice":
		return fmt.Errorf("ContractAwardNotice (Vergabebekanntmachung) wird nicht unterstützt. Nur ContractNotice (Ausschreibung) kann hochgeladen werden")
	case "PriorInformationNotice":
		return fmt.Errorf("PriorInformationNotice (Vorinformation) wird nicht unterstützt. Nur ContractNotice (Ausschreibung) kann hochgeladen werden")
	default:
		return fmt.Errorf("unbekannter XML-Typ: %s. Nur ContractNotice (Ausschreibung) wird unterstützt", root.XMLName.Local)
	}
}

func (s *XMLParserService) ParseAndSaveXML(xmlData []byte) (*domain.Tender, error) {
	// Pre-validate: Only accept ContractNotice, reject ContractAwardNotice
	if err := s.validateNoticeType(xmlData); err != nil {
		return nil, err
	}

	var eforms EFormsContractNotice
	if err := xml.Unmarshal(xmlData, &eforms); err != nil {
		return nil, fmt.Errorf("XML parsing failed: %w", err)
	}

	// Extract deadline
	deadline := s.parseDeadline(eforms)

	// Extract published date
	publishedAt := s.parsePublishedDate(eforms)

	// Extract authority info from first organization
	authorityName, authorityAddress, locationZip, locationCity := s.extractAuthorityInfo(eforms)

	// Extract CPV codes (from lot or main project)
	cpvCodes := s.extractCPVCodes(eforms)

	// Extract source URL
	sourceURL := s.extractSourceURL(eforms)

	// Extract award criteria
	awardCriteria := s.extractAwardCriteria(eforms)

	// Extract NUTS codes
	nutsCodes := s.extractNutsCodes(eforms)

	// Build description text
	description := eforms.ProcurementProject.Description
	descriptionFull := description
	if eforms.ProcurementProjectLot.ProcurementProject.Name != "" {
		descriptionFull = fmt.Sprintf("%s\n\nLos: %s", description, eforms.ProcurementProjectLot.ProcurementProject.Name)
	}

	// Parse location (handles "84034 Landshut" format)
	parsedZip, parsedCity := s.parseLocationFromCity(locationCity)
	if parsedZip != "" && locationZip == "" {
		locationZip = parsedZip
	}
	if parsedCity != "" {
		locationCity = parsedCity
	}

	now := time.Now()
	tender := &domain.Tender{
		ID:                uuid.New(),
		ExternalID:        eforms.ID,
		SourcePortal:      "eforms-xml",
		SourceURL:         sourceURL,
		Title:             eforms.ProcurementProject.Name,
		Description:       description,
		DescriptionFull:   descriptionFull,
		OCRCompressedText: description,
		CPVCodes:          cpvCodes,
		NutsCodes:         nutsCodes,
		ProcedureType:     eforms.ProcurementProject.ProcurementTypeCode,
		AwardCriteria:     awardCriteria,
		PublishedAt:       publishedAt,
		DeadlineAt:        deadline,
		AwardingAuthority: authorityName,
		AuthorityAddress:  authorityAddress,
		LocationZip:       locationZip,
		LocationCity:      locationCity,
		ProcessingStatus:  "parsed",
		ScrapedAt:         &now,
		CreatedAt:         now,
	}

	// Upsert Logic
	var existing domain.Tender
	err := s.db.Where("external_id = ?", tender.ExternalID).First(&existing).Error
	if err == nil {
		tender.ID = existing.ID
		if err := s.db.Model(&existing).Updates(tender).Error; err != nil {
			return nil, err
		}
		return &existing, nil
	}

	if err := s.db.Create(tender).Error; err != nil {
		return nil, err
	}

	return tender, nil
}

func (s *XMLParserService) parseDeadline(eforms EFormsContractNotice) time.Time {
	// Try main TenderingProcess first
	endDate := eforms.TenderingProcess.TenderSubmissionDeadlinePeriod.EndDate
	endTime := eforms.TenderingProcess.TenderSubmissionDeadlinePeriod.EndTime

	// Fallback: ProcurementProjectLot.TenderingProcess
	if endDate == "" {
		endDate = eforms.ProcurementProjectLot.TenderingProcess.TenderSubmissionDeadlinePeriod.EndDate
		endTime = eforms.ProcurementProjectLot.TenderingProcess.TenderSubmissionDeadlinePeriod.EndTime
	}

	if endDate == "" {
		return time.Now().Add(14 * 24 * time.Hour)
	}

	// Clean date format (remove timezone suffix like +01:00)
	endDate = strings.Split(endDate, "+")[0]
	if endTime != "" {
		endTime = strings.Split(endTime, "+")[0]
	} else {
		endTime = "23:59:59"
	}

	deadlineStr := endDate + "T" + endTime

	// Try various formats
	formats := []string{
		"2006-01-02T15:04:05",
		"2006-01-02T15:04",
		"2006-01-02",
	}

	for _, format := range formats {
		if deadline, err := time.Parse(format, deadlineStr); err == nil {
			return deadline
		}
	}

	return time.Now().Add(14 * 24 * time.Hour)
}

func (s *XMLParserService) parsePublishedDate(eforms EFormsContractNotice) *time.Time {
	issueDate := eforms.IssueDate
	if issueDate == "" {
		return nil
	}

	issueDate = strings.Split(issueDate, "+")[0]

	formats := []string{"2006-01-02", "2006-01-02T15:04:05"}
	for _, format := range formats {
		if t, err := time.Parse(format, issueDate); err == nil {
			return &t
		}
	}
	return nil
}

func (s *XMLParserService) extractAuthorityInfo(eforms EFormsContractNotice) (name, address, zip, city string) {
	// Try UBLExtensions first (full eForms format)
	orgs := eforms.UBLExtensions.UBLExtension.ExtensionContent.EformsExtension.Organizations.Organization
	if len(orgs) > 0 {
		company := orgs[0].Company
		name = company.PartyName.Name
		postal := company.PostalAddress
		address = postal.StreetName
		zip = postal.PostalZone
		city = postal.CityName
		return
	}

	// Fallback: ContractingParty (simplified format)
	if eforms.ContractingParty.Party.PartyName.Name != "" {
		name = eforms.ContractingParty.Party.PartyName.Name
	}

	// Extract city from RealizedLocation
	if eforms.ProcurementProject.RealizedLocation.Address.CityName != "" {
		city = eforms.ProcurementProject.RealizedLocation.Address.CityName
	}

	return
}

func (s *XMLParserService) extractCPVCodes(eforms EFormsContractNotice) []string {
	var codes []string

	// From lot - main
	if code := eforms.ProcurementProjectLot.ProcurementProject.MainCommodityClassification.ItemClassificationCode; code != "" {
		codes = append(codes, code)
	}

	// From lot - additional
	for _, acc := range eforms.ProcurementProjectLot.ProcurementProject.AdditionalCommodityClassification {
		if acc.ItemClassificationCode != "" && !contains(codes, acc.ItemClassificationCode) {
			codes = append(codes, acc.ItemClassificationCode)
		}
	}

	// From main project - main
	if code := eforms.ProcurementProject.MainCommodityClassification.ItemClassificationCode; code != "" && !contains(codes, code) {
		codes = append(codes, code)
	}

	// From main project - additional
	for _, acc := range eforms.ProcurementProject.AdditionalCommodityClassification {
		if acc.ItemClassificationCode != "" && !contains(codes, acc.ItemClassificationCode) {
			codes = append(codes, acc.ItemClassificationCode)
		}
	}

	return codes
}

func (s *XMLParserService) extractSourceURL(eforms EFormsContractNotice) string {
	if uri := eforms.ProcurementProjectLot.TenderingTerms.CallForTendersDocumentReference.Attachment.ExternalReference.URI; uri != "" {
		return uri
	}

	orgs := eforms.UBLExtensions.UBLExtension.ExtensionContent.EformsExtension.Organizations.Organization
	if len(orgs) > 0 {
		return orgs[0].Company.EndpointID
	}
	return ""
}

func (s *XMLParserService) extractAwardCriteria(eforms EFormsContractNotice) string {
	criteria := eforms.ProcurementProjectLot.TenderingTerms.AwardingTerms.AwardingCriterion.SubordinateAwardingCriterion
	if criteria.Name != "" {
		return criteria.Name
	}
	return criteria.AwardingCriterionTypeCode
}

func (s *XMLParserService) extractNutsCodes(eforms EFormsContractNotice) []string {
	var codes []string

	// From main project
	if code := eforms.ProcurementProject.RealizedLocation.Address.CountrySubentityCode; code != "" {
		codes = append(codes, code)
	}

	// From lot
	if code := eforms.ProcurementProjectLot.ProcurementProject.RealizedLocation.Address.CountrySubentityCode; code != "" && !contains(codes, code) {
		codes = append(codes, code)
	}

	return codes
}

// parseLocationFromCity handles combined formats like "84034 Landshut"
func (s *XMLParserService) parseLocationFromCity(cityName string) (zip, city string) {
	cityName = strings.TrimSpace(cityName)
	if cityName == "" {
		return "", ""
	}

	// Check if starts with digits (PLZ)
	parts := strings.SplitN(cityName, " ", 2)
	if len(parts) == 2 {
		// Check if first part looks like a German PLZ (5 digits)
		potentialZip := strings.TrimSpace(parts[0])
		if len(potentialZip) == 5 && isNumeric(potentialZip) {
			return potentialZip, strings.TrimSpace(parts[1])
		}
	}

	// No PLZ found, return as city
	return "", cityName
}

func isNumeric(s string) bool {
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
