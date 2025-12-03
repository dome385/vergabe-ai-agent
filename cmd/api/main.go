package main

import (
	"context"
	"log"
	"os"
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
	// 1. Config
	dsn := os.Getenv("DATABASE_URL")
	openAIKey := os.Getenv("OPENAI_API_KEY")
	hfToken := os.Getenv("HUGGINGFACE_TOKEN")
	supabaseJWTSecret := os.Getenv("SUPABASE_JWT_SECRET")

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
	ingestionSvc, err := service.NewIngestionService(db, openAIKey, hfToken)
	if err != nil {
		log.Fatalf("Ingestion Service Init failed: %v", err)
	}
	matchingSvc := service.NewMatchingService(db)

	companySvc, err := service.NewCompanyService(db, openAIKey)
	if err != nil {
		log.Fatalf("Company Service Init failed: %v", err)
	}

	complianceAgent, err := agent.NewComplianceAgent(context.Background(), agent.ComplianceAgentConfig{
		APIKey:      openAIKey,
		Model:       "gpt-4o",
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
