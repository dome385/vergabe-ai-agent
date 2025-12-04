package main

import (
	"bufio"
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/network/standard"
	"github.com/vergabe-agent/vergabe-backend/internal/agent"
	"github.com/vergabe-agent/vergabe-backend/internal/handler"
	"github.com/vergabe-agent/vergabe-backend/internal/middleware"
	"github.com/vergabe-agent/vergabe-backend/internal/service"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	if err := loadEnvFiles(".env", "cmd/api/.env"); err != nil {
		log.Fatalf("Failed to load .env file: %v", err)
	}

	// 1. Config
	dsn := os.Getenv("DATABASE_URL")
	hfToken := os.Getenv("HUGGINGFACE_TOKEN")
	supabaseJWTSecret := os.Getenv("SUPABASE_JWT_SECRET")
	openRouterKey := strings.TrimSpace(os.Getenv("OPENROUTER_API_KEY"))
	openRouterModel := strings.TrimSpace(os.Getenv("OPENROUTER_MODEL"))
	openRouterBaseURL := strings.TrimSpace(os.Getenv("OPENROUTER_BASE_URL"))
	openRouterAppName := os.Getenv("OPENROUTER_APP_NAME")
	openRouterAppURL := os.Getenv("OPENROUTER_APP_URL")

	openRouterEmbeddingModel := strings.TrimSpace(os.Getenv("OPENROUTER_EMBEDDING_MODEL"))

	embeddingCfg := service.EmbeddingProviderConfig{
		APIKey:  openRouterKey,
		Model:   openRouterEmbeddingModel,
		BaseURL: openRouterBaseURL,
		AppName: openRouterAppName,
		AppURL:  openRouterAppURL,
	}

	if dsn == "" || supabaseJWTSecret == "" {
		log.Fatal("Missing required environment variables: DATABASE_URL, SUPABASE_JWT_SECRET")
	}

	// 2. DB mit Logger
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Warn,
			Colorful:      true,
		},
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	// Connection Pool
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Get DB instance failed: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	defer sqlDB.Close()

	// 3. Services
	ingestionSvc, err := service.NewIngestionService(db, hfToken, embeddingCfg)
	if err != nil {
		log.Fatalf("Ingestion Service Init failed: %v", err)
	}
	matchingSvc := service.NewMatchingService(db)

	companySvc, err := service.NewCompanyService(db, embeddingCfg)
	if err != nil {
		log.Fatalf("Company Service Init failed: %v", err)
	}

	complianceAgent, err := agent.NewComplianceAgent(context.Background(), agent.ComplianceAgentConfig{
		APIKey:      openRouterKey,
		Model:       openRouterModel,
		BaseURL:     openRouterBaseURL,
		AppName:     openRouterAppName,
		AppURL:      openRouterAppURL,
		Temperature: 0.2,
	})
	if err != nil {
		log.Fatalf("Compliance Agent Init failed: %v", err)
	}

	complianceSvc := service.NewComplianceService(complianceAgent, db)

	// Handler registrieren
	complianceHandler := handler.NewComplianceHandler(complianceSvc)

	// 4. Handlers
	ingestHandler := handler.NewIngestionHandler(ingestionSvc)
	feedHandler := handler.NewFeedHandler(matchingSvc)
	companyHandler := handler.NewCompanyHandler(companySvc)

	// 5. Server
	h := server.Default(
		server.WithHostPorts(":8080"),
		server.WithMaxRequestBodySize(50*1024*1024), // 50MB
		server.WithTransport(standard.NewTransporter),
	)

	// Public routes
	h.GET("/health", func(c context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	// Protected API routes
	api := h.Group("/api/v1")
	api.Use(middleware.AuthMiddleware())

	api.POST("/ingest", ingestHandler.UploadFile)
	api.GET("/feed", feedHandler.GetFeed)
	api.POST("/analyze/:tenderId", complianceHandler.Analyze)
	api.POST("/companies", companyHandler.Create)

	log.Println("🚀 Server running on :8080")
	if err := h.Run(); err != nil {
		log.Fatalf("Server stopped: %v", err)
	}
}

func loadEnvFiles(paths ...string) error {
	for _, path := range paths {
		if path == "" {
			continue
		}

		if err := parseEnvFile(path); err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return err
		}
	}

	return nil
}

func parseEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		line = strings.TrimPrefix(line, "export ")
		line = strings.TrimPrefix(line, "$env:")

		kv := strings.SplitN(line, "=", 2)
		if len(kv) != 2 {
			continue
		}

		key := strings.TrimSpace(kv[0])
		if key == "" {
			continue
		}

		value := strings.TrimSpace(kv[1])
		value = strings.Trim(value, `"'`)

		if _, exists := os.LookupEnv(key); exists {
			continue
		}

		if err := os.Setenv(key, value); err != nil {
			return err
		}
	}

	return scanner.Err()
}
