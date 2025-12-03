# Vergabe-Agent - KI-gestützter Ausschreibungs-Scanner

Der Vergabe-Agent ist eine moderne Web-Anwendung, die Unternehmen dabei unterstützt, relevante öffentliche Ausschreibungen zu finden und ihre Bewerbungschancen zu analysieren. Die Plattform kombiniert KI-gestützte Matching-Algorithmen mit Compliance-Prüfungen, um Unternehmen bei der Ausschreibungsteilnahme zu unterstützen.

## Funktionen

### Hauptfunktionen

- **Intelligente Ausschreibungsfindung**: Automatische Suche und Filterung von relevanten Ausschreibungen basierend auf Unternehmensprofil, Region, Budget und Gewerk
- **Match-Score-Berechnung**: KI-gestützte Bewertung der Passgenauigkeit zwischen Ausschreibung und Unternehmensprofil (mit Match-Score > 90% für relevante Ausschreibungen)
- **Compliance-Check**: Automatische Prüfung der Bewerbungsmachbarkeit durch KI-Agenten, der auf Unternehmensprofil und Ausschreibungsanforderungen basiert
- **OCR-Integration**: Texterkennung aus PDF-Dokumenten zur automatischen Analyse von Ausschreibungsunterlagen
- **Vektor-basiertes Matching**: Nutzung von Embeddings für präzises Matching zwischen Ausschreibungsanforderungen und Unternehmensfähigkeiten

### Dashboard-Funktionen

- **Opportunity Feed**: Personalisierter Feed mit relevanten Ausschreibungen
- **Tender-Detailansicht**: Detaillierte Ansicht mit Match-Score, Compliance-Status, Fristen und Budget
- **Bewerbungsmanagement**: Übersicht über aktuelle und abgeschlossene Bewerbungen
- **Benachrichtigungen**: Echtzeit-Benachrichtigungen über neue relevante Ausschreibungen

### Technische Features

- **API-Integration**: OpenRouter/OpenAI für KI-Modelle
- **PostgreSQL-Datenbank**: Mit pgvector-Erweiterung für Vektor-basiertes Matching
- **Supabase-Authentifizierung**: Sichere Benutzerverwaltung
- **XML-Parsing**: UBL (Universal Business Language) für Ausschreibungsdaten
- **Geolokalisierung**: Integration von PostGIS für geografische Matching-Logik

## Architektur

### Frontend

- **Next.js 16** mit React 19
- **TypeScript** für Typsicherheit
- **Tailwind CSS** für Styling
- **Framer Motion** für Animationen
- **Lucide React** für Icons
- **Radix UI** für barrierefreie Komponenten
- **Zustand** für State-Management

### Backend

- **Go** (Golang) als Backend-Sprache
- **Hertz Framework** für HTTP-Server
- **GORM** für Datenbank-Interaktion
- **Eino** für KI-Integration
- **PostgreSQL** als Datenbank mit pgvector-Erweiterung
- **JSON Schema** für API-Validierung

### KI-Komponenten

- **Compliance Agent**: KI-Agent, der Ausschreibungen auf Machbarkeit prüft
- **Matching Service**: Algorithmus für die Berechnung von Match-Scores
- **Embedding Service**: Vektor-basiertes Matching mit OpenAI-Embeddings
- **OCR Service**: Texterkennung für die Analyse von PDF-Dokumenten

## Installation

### Voraussetzungen

- Node.js 18+ (für Frontend)
- Go 1.21+ (für Backend)
- PostgreSQL mit pgvector-Erweiterung
- OpenAI API Key oder OpenRouter API Key
- Hugging Face Token (für OCR-Service)

### Backend-Setup

1. Backend-Server starten:

```bash
cd cmd/api
go run main.go
```

2. Stellen Sie sicher, dass die folgenden Umgebungsvariablen gesetzt sind:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/vergabe_agent"
OPENAI_API_KEY="your-openai-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
HUGGINGFACE_TOKEN="your-huggingface-token"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
OPENROUTER_MODEL="openai/gpt-4o"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_APP_NAME="Vergabe-Agent"
OPENROUTER_APP_URL="https://vergabe-agent.de"
```

### Frontend-Setup

1. Installieren Sie die Abhängigkeiten:

```bash
npm install
```

2. Starten Sie den Entwicklungs-Server:

```bash
npm run dev
```

3. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## API-Endpunkte

- `GET /health` - Server-Status
- `POST /api/v1/ingest` - Ausschreibungsdateien hochladen
- `GET /api/v1/feed` - Ausschreibungs-Feed abrufen
- `POST /api/v1/analyze/:tenderId` - Compliance-Check durchführen
- `POST /api/v1/companies` - Unternehmensprofil erstellen

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## Über das Projekt

Der Vergabe-Agent wurde entwickelt, um kleinen und mittelständischen Unternehmen die Teilnahme an öffentlichen Ausschreibungen zu erleichtern. Die Plattform nutzt moderne KI-Technologien, um den zeitaufwändigen Prozess der Ausschreibungsfindung und -analyse zu automatisieren und so die Chancen auf erfolgreiche Bewerbungen zu erhöhen.
