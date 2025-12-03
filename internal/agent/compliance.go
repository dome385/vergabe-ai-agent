package agent

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/eino-contrib/jsonschema"

	openai "github.com/cloudwego/eino-ext/components/model/openai"
)

// ComplianceInput enthält OCR-Text und Profil.
type ComplianceInput struct {
	OCRText        string `json:"ocr_text"`
	ProfileSummary string `json:"profile_summary"`
}

// ComplianceAssessment ist das Ziel-Struct.
type ComplianceAssessment struct {
	IsFeasible bool     `json:"is_feasible" jsonschema:"description=Ist die Bewerbung machbar?"`
	Blockers   []string `json:"blockers" jsonschema:"description=Liste der fehlenden Dokumente oder K.O.-Kriterien."`
}

type ComplianceAgentConfig struct {
	APIKey      string
	Model       string
	Temperature float32
}

type ComplianceAgent struct {
	chain compose.Runnable[ComplianceInput, ComplianceAssessment]
}

func NewComplianceAgent(ctx context.Context, cfg ComplianceAgentConfig) (*ComplianceAgent, error) {
	if strings.TrimSpace(cfg.APIKey) == "" {
		return nil, errors.New("missing OpenAI API key")
	}

	modelName := cfg.Model
	if modelName == "" {
		modelName = "gpt-4o"
	}
	temp := cfg.Temperature

	// 1. Tool Definition (JSON Schema via Reflection)
	reflector := jsonschema.Reflector{ExpandedStruct: true}
	jsonSchema := reflector.Reflect(&ComplianceAssessment{})

	toolName := "submit_compliance_check"
	toolInfo := &schema.ToolInfo{
		Name:        toolName,
		Desc:        "Reicht das Ergebnis der Compliance-Prüfung ein.",
		ParamsOneOf: schema.NewParamsOneOfByJSONSchema(jsonSchema),
	}

	// 2. ChatModel erstellen (OHNE Tools in der Config)
	chatModel, err := openai.NewChatModel(ctx, &openai.ChatModelConfig{
		APIKey:      cfg.APIKey,
		Model:       modelName,
		Temperature: &temp,
	})
	if err != nil {
		return nil, fmt.Errorf("init chat model: %w", err)
	}

	// 3. Tools Binden (In-Place Fix!)
	// Wir gehen davon aus, dass BindTools in deiner Version das Model direkt modifiziert.
	// Falls deine Version doch (Runnable, error) zurückgibt, wird der Compiler hier meckern.
	// In dem Fall nutzen wir das Interface ToolBindable manuell.
	// Aber probieren wir erst den In-Place Fix:
	err = chatModel.BindTools([]*schema.ToolInfo{toolInfo})
	if err != nil {
		return nil, fmt.Errorf("bind tools failed: %w", err)
	}

	// 4. Prompt Template
	template := prompt.FromMessages(
		schema.FString,
		&schema.Message{
			Role:    schema.System,
			Content: "Du bist ein strenger Vergabeprüfer. Analysiere das Profil. DU MUSST das Tool 'submit_compliance_check' nutzen, um das Ergebnis zu melden. Antworte NICHT mit Text.",
		},
		&schema.Message{
			Role:    schema.User,
			Content: "OCR_TEXT:\n{ocr_text}\n\nUNTERNEHMENSPROFIL:\n{profile}",
		},
	)

	// 5. Parser Konfiguration
	parserConfig := &schema.MessageJSONParseConfig{
		ParseFrom: schema.MessageParseFromToolCall,
	}
	parser := schema.NewMessageJSONParser[ComplianceAssessment](parserConfig)

	// 6. Chain zusammenbauen
	c := compose.NewChain[ComplianceInput, ComplianceAssessment]()

	// Node 1: Input -> Map
	c.AppendLambda(compose.InvokableLambda(func(ctx context.Context, input ComplianceInput) (map[string]any, error) {
		return map[string]any{
			"ocr_text": strings.TrimSpace(input.OCRText),
			"profile":  strings.TrimSpace(input.ProfileSummary),
		}, nil
	}))

	// Node 2: Map -> Prompt -> Messages
	c.AppendChatTemplate(template)

	// Node 3: Messages -> Model (Tools sind bereits gebunden)
	c.AppendChatModel(chatModel)

	// Node 4: Message -> Parser -> Struct
	// FIX: InvokableLambda statt InvokableGraph (kompatibler)
	c.AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (ComplianceAssessment, error) {
		return parser.Parse(ctx, input)
	}))

	runnable, err := c.Compile(ctx)
	if err != nil {
		return nil, fmt.Errorf("compile compliance chain: %w", err)
	}

	return &ComplianceAgent{chain: runnable}, nil
}

func (a *ComplianceAgent) Assess(ctx context.Context, input ComplianceInput) (*ComplianceAssessment, error) {
	if a == nil || a.chain == nil {
		return nil, errors.New("compliance agent is not initialized")
	}

	result, err := a.chain.Invoke(ctx, input)
	if err != nil {
		// Detailliertes Error-Logging, falls das Model kein ToolCall macht
		return nil, fmt.Errorf("agent error: %w", err)
	}

	return &result, nil
}
