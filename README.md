# Vergabe AI Agent - Intelligente Ausschreibungsplattform

Eine KI-gestützte Plattform, die Unternehmen dabei unterstützt, relevante öffentliche Ausschreibungen zu finden, zu analysieren und sich erfolgreich zu bewerben. Das System kombiniert Vektor-basiertes Matching, geografische Analyse und automatisierte Compliance-Prüfungen.

---

## 📋 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Architektur](#architektur)
- [Funktionen](#funktionen)
  - [Implementierte Features](#implementierte-features)
  - [Was noch fehlt](#was-noch-fehlt)
- [Tech Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Installation \& Setup](#installation--setup)
- [API-Dokumentation](#api-dokumentation)
- [Datenbankmodelle](#datenbankmodelle)
- [Frontend-Komponenten](#frontend-komponenten)
- [Backend-Services](#backend-services)
- [Aktueller Status](#aktueller-status)
- [Umgebungsvariablen](#umgebungsvariablen)

---

## 🎯 Überblick

Der **Vergabe AI Agent** ist eine Full-Stack-Anwendung, die aus einem **Go-Backend** (Hertz Framework) und einem **Next.js 16 Frontend** (React 19) besteht. Die Plattform nutzt:

- **OpenAI Embeddings** für semantisches Matching zwischen Firmenprofilen und Ausschreibungen
- **PostgreSQL mit pgvector** für Vektor-Suche
- **PostGIS** für geografisches Matching (Service-Radius)
- **Supabase** für Authentifizierung
- **OpenRouter/OpenAI LLMs** für Compliance-Prüfungen mittels Tool Calling

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js 16)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Onboarding   │  │  Dashboard   │  │  Detail View │      │
│  │   (Zustand)  │  │   (Feed)     │  │  (Tender)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                   │             │
└─────────┼──────────────────┼───────────────────┼─────────────┘
          │                  │                   │
          │    HTTP/REST     │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend (Go + Hertz Framework)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Handlers   │  │   Services   │  │    Agents    │      │
│  │  - Company   │  │  - Matching  │  │  - Compliance│      │
│  │  - Feed      │  │  - Ingestion │  │              │      │
│  │  - Ingest    │  │  - Company   │  └──────────────┘      │
│  │  - Compliance│  │  - Compliance│                         │
│  └──────────────┘  └──────────────┘                         │
│         │                  │                                 │
└─────────┼──────────────────┼─────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL + pgvector + PostGIS                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  companies   │  │   tenders    │  │   matches    │      │
│  │  compliance_ │  │              │  │              │      │
│  │    checks    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Funktionen

### Implementierte Features

#### ✅ **Onboarding Flow (Frontend + Backend)**
- **Komponenten**: `BasicsStep.tsx`, `ReferencesStep.tsx`, `PreferencesStep.tsx`
- **Store**: `profile-store.ts` (Zustand mit LocalStorage Persistence)
- **Backend**: `CompanyService.CreateCompany()` - Voll funktional
- **Features**:
  - ✅ Firmendaten-Erfassung (Name, Rechtsform, Adresse, CPV-Codes, etc.)
  - ✅ Referenzen & Dokumente Upload (UI vorhanden, Backend speichert in `project_references` JSONB)
  - ✅ Präferenzen (Budget-Range, Regionen, Alert-Frequenz)
  - ✅ Automatische Embedding-Generierung beim Speichern
  - ✅ Session-Check mit Supabase Auth
  - ✅ JWT-Middleware für Backend-Authentifizierung

#### ✅ **Ausschreibungs-Ingestion (Backend)**
- **Service**: `ingestion.go`
- **Features**:
  - ✅ PDF-Upload → OCR (Hugging Face) → Text-Extraktion
  - ✅ XML-Upload → UBL-Parsing → Metadaten-Extraktion
  - ✅ Automatische Embedding-Generierung (OpenAI `text-embedding-3-small`)
  - ✅ Speichern in `tenders` Tabelle
  - ⚠️ OCR-Service ist implementiert, aber keine Echtzeitverarbeitung (kein Hugging Face API tatsächlich getestet)

#### ✅ **Hybrid Matching Engine (Backend)**
- **Service**: `matching.go`
- **Algorithmus**:
  - **50% Vektor-Similarity** (Cosine Distance zwischen `profile_embedding` und `requirement_embedding`)
  - **30% CPV-Code-Overlap** (Industry Tags vs. Tender CPV Codes)
  - **20% Geografische Nähe** (PostGIS Distance + Service Radius Check)
- **Features**:
  - ✅ `FindMatchesHybrid()` mit SQL CTE (Common Table Expressions)
  - ✅ Deadline-Filter (nur zukünftige Ausschreibungen)
  - ✅ Distanz-Berechnung in km (ST_Distance Geography)
  - ✅ Ranking nach `is_within_radius`, dann gewichteter Score

#### ✅ **Compliance Agent (Backend)**
- **Agent**: `compliance.go` (Eino Framework + OpenRouter)
- **Features**:
  - ✅ LLM Tool Calling (JSON Schema aus Go Struct generiert)
  - ✅ Prüft OCR-Text + Firmenprofil → `is_feasible` + `blockers` Liste
  - ✅ Speichert Ergebnis in `compliance_checks` Tabelle
  - ⚠️ Aktuell nur Backend-Logik, **kein Frontend-UI** für Compliance-Ergebnisse

#### ✅ **Authentifizierung (Frontend + Backend)**
- **Frontend**: Supabase Client (`createClient()` in `supabase.ts`)
- **Backend**: JWT-Middleware (`middleware/auth.go`)
- **Features**:
  - ✅ Session-Check auf `/onboarding` und `/dashboard`
  - ✅ Authorization Header Validation (Bearer Token)
  - ✅ User ID Extraction aus JWT Claims (`sub`)

#### 🟡 **Dashboard Feed (Teilweise Implementiert)**
- **Frontend**: `dashboard/page.tsx` - **HARDCODED Mock-Daten**
- **Backend**: `/api/v1/feed` Endpunkt funktioniert
- **Status**:
  - ❌ Frontend holt Daten noch NICHT vom Backend
  - ✅ Backend liefert Matches korrekt (getestet mit Curl möglich)
  - ❌ Keine Error-Handling für leere Company

---

### Was noch fehlt

#### ❌ **Backend → Frontend Integration**
1. **Dashboard Feed**: 
   - Frontend zeigt Mock-Daten, ruft `/api/v1/feed` nicht auf
   - Keine State-Management für Matches
   
2. **Tender Detail View**:
   - Keine Komponente für Detailansicht
   - Keine Backend-Route für `/api/v1/tenders/:id`

3. **Compliance UI**:
   - Backend kann Compliance Checks durchführen
   - Frontend hat keine Komponente zum Anzeigen/Triggern

#### ❌ **File Upload für Referenzen**
- UI in `ReferencesStep.tsx` vorhanden
- Backend speichert nur JSONB, **keine echten Files** (kein S3/Object Storage)
- Dropzone ist Dummy

#### ❌ **Geografische Daten (Geocoding)**
- `location_geog` Spalte existiert in `companies` und `tenders`
- **Kein automatisches Geocoding** beim Speichern von Adressen
- PostGIS-Funktionen sind in Matching Query vorhanden, aber ohne echte Koordinaten ineffektiv

#### ❌ **Realtime Notifications**
- Frontend hat Notifications-Seite (`notifications/page.tsx`)
- Keine WebSocket/SSE Implementation
- Keine Benachrichtigungen bei neuen Matches

#### ❌ **Bewerbungsmanagement**
- Keine Tabelle für Bewerbungen (Applications)
- Keine Status-Verwaltung (Draft, Submitted, Won, Lost)

#### ❌ **Admin-Panel**
- Kein Upload-Interface für Ausschreibungen (nur API-Endpunkt)
- Keine Übersicht über alle Tenders

#### ❌ **Tests**
- Keine Unit Tests (Backend)
- Keine E2E Tests (Frontend)

---

## 🛠️ Tech Stack

### Frontend
| Technologie | Version | Verwendung |
|------------|---------|-----------|
| Next.js | 16.0.5 | React Framework (App Router) |
| React | 19.2.0 | UI Library |
| TypeScript | 5.x | Typsicherheit |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.0.9 | State Management |
| Radix UI | Various | Accessible Components |
| Framer Motion | 12.23.24 | Animationen |
| React Hook Form | 7.67.0 | Form Management |
| Zod | 4.1.13 | Schema Validation |
| Supabase SSR | 0.8.0 | Auth Client |

### Backend
| Technologie | Version | Verwendung |
|------------|---------|-----------|
| Go | 1.25.4 | Backend Sprache |
| Hertz | 0.10.3 | HTTP Framework (Cloudwego) |
| GORM | 1.25.5 | ORM |
| pgvector-go | 0.3.0 | Vektor Operations |
| Eino | 0.6.0 | AI Framework |
| OpenAI Client | Custom | Embeddings |
| JWT | 5.3.0 | Token Validation |

### Datenbank
| Technologie | Verwendung |
|------------|-----------|
| PostgreSQL | Hauptdatenbank |
| pgvector | Vektor-Extension (1536 dims für Embeddings) |
| PostGIS | Geografische Queries |

### KI/ML
| Service | Verwendung |
|---------|-----------|
| OpenAI API | `text-embedding-3-small` (1536 dims) |
| OpenRouter | LLM API (gpt-4o für Compliance) |
| Hugging Face | OCR (theoretisch, nicht getestet) |

---

## 📁 Projektstruktur

```
vergabe-ai-agent/
├── cmd/
│   └── api/
│       └── main.go                    # Einstiegspunkt, Server-Setup
│
├── internal/
│   ├── agent/
│   │   └── compliance.go              # Compliance LLM Agent (Tool Calling)
│   ├── domain/
│   │   └── models.go                  # GORM Models (Company, Tender, Match)
│   ├── handler/
│   │   ├── company.go                 # POST /api/v1/companies
│   │   ├── feed.go                    # GET /api/v1/feed
│   │   ├── ingestion.go               # POST /api/v1/ingest
│   │   └── compliance.go              # POST /api/v1/analyze/:tenderId
│   ├── middleware/
│   │   └── auth.go                    # JWT Validation (Supabase)
│   └── service/
│       ├── company_service.go         # CreateCompany, Embedding-Generierung
│       ├── matching.go                # FindMatchesHybrid (Vektor + Geo + CPV)
│       ├── ingestion.go               # PDF/XML Processing
│       ├── xml_parser.go              # UBL XML Parsing
│       ├── ocr_service.go             # OCR via Hugging Face
│       └── compliance_service.go      # CheckCompliance
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           # ❌ MOCK-DATEN (kein API-Call)
│   │   ├── onboarding/
│   │   │   └── page.tsx               # ✅ Onboarding Wizard
│   │   └── login/                     # Login/Register Pages
│   ├── components/
│   │   ├── onboarding/
│   │   │   └── steps/
│   │   │       ├── BasicsStep.tsx     # ✅ Firmenprofil-Formular
│   │   │       ├── ReferencesStep.tsx # 🟡 Dropzone (kein Upload)
│   │   │       └── PreferencesStep.tsx# ✅ Präferenzen
│   │   ├── dashboard/
│   │   │   ├── TenderCard.tsx         # ✅ UI für Match-Karte
│   │   │   ├── Sidebar.tsx            # ✅ Navigation
│   │   │   └── Topbar.tsx             # ✅ Header
│   │   └── ui/                        # Radix UI Components
│   ├── lib/
│   │   ├── supabase.ts                # ✅ Supabase Client
│   │   ├── company.ts                 # ✅ fetchCompanyStatus Helper
│   │   └── utils.ts                   # cn() für Tailwind
│   └── stores/
│       └── profile-store.ts           # ✅ Zustand Store (Onboarding)
│
├── go.mod                             # Go Dependencies
├── package.json                       # NPM Dependencies
└── README.md                          # Diese Datei
```

---

## 🚀 Installation & Setup

### Voraussetzungen
- **Node.js** 18+
- **Go** 1.21+
- **PostgreSQL** 14+ mit Extensions:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE EXTENSION IF NOT EXISTS postgis;
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```
- **Supabase Projekt** (oder PostgreSQL + eigenes Auth-System)
- **API Keys**:
  - OpenAI API Key (für Embeddings)
  - OpenRouter API Key (für Compliance LLM)
  - Hugging Face Token (für OCR)

### Backend Setup

1. **Datenbank migrieren** (Beispiel-Schema):
```sql
-- Tables werden von GORM automatisch erstellt, aber für Referenz:
-- companies, tenders, matches, compliance_checks
-- Siehe internal/domain/models.go für Schema-Details
```

2. **Umgebungsvariablen setzen** (`.env` im Root):
```bash
DATABASE_URL=postgres://user:pass@localhost:5432/vergabe_agent
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_NAME=Vergabe-Agent
OPENROUTER_APP_URL=https://vergabe-agent.de
HUGGINGFACE_TOKEN=hf_...
```

3. **Backend starten**:
```bash
cd cmd/api
go run main.go
# Server läuft auf :8080
```

### Frontend Setup

1. **Dependencies installieren**:
```bash
npm install
```

2. **Umgebungsvariablen** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

3. **Dev-Server starten**:
```bash
npm run dev
# Frontend läuft auf localhost:3000
```

---

## 📡 API-Dokumentation

### Public Endpoints

#### `GET /health`
**Beschreibung**: Server Health Check  
**Response**:
```json
{
  "status": "ok"
}
```

---

### Protected Endpoints (JWT erforderlich)

#### `POST /api/v1/companies`
**Beschreibung**: Firmenprofil erstellen/aktualisieren  
**Headers**: `Authorization: Bearer <token>`  
**Body**:
```json
{
  "basics": {
    "companyName": "Musterfirma GmbH",
    "industry": "IT-Dienste",
    "cpvCodes": ["72000000-5"],
    "addressZip": "80331",
    "addressCity": "München",
    "serviceRadius": 100,
    "revenueTier": 1,
    "employeeCount": "11-50",
    "contactEmail": "info@example.com",
    ...
  },
  "references": {
    "documents": [],
    "references": [],
    "certificates": []
  },
  "preferences": {
    "alertEmail": true,
    "minMatchScore": 70,
    "budgetRange": [50000, 500000],
    "regions": ["München", "Bayern"]
  }
}
```
**Response**: Company Object mit ID

---

#### `GET /api/v1/feed?limit=10`
**Beschreibung**: Personalisierte Ausschreibungen basierend auf Firmenprofil  
**Headers**: `Authorization: Bearer <token>`  
**Query Params**:
- `limit` (optional, default: 10)

**Response**:
```json
{
  "matches": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "tender_id": "uuid",
      "score": 0.87,
      "reason_text": "Perfekte Übereinstimmung in Ihrer Nähe",
      "status": "new",
      "tender": {
        "id": "uuid",
        "title": "Sanierung Schulturnhalle",
        "description_full": "...",
        "deadline": "2025-12-31T23:59:59Z",
        "region_zip": "80331",
        "cpv_codes": ["45000000-7"]
      }
    }
  ]
}
```

---

#### `POST /api/v1/ingest`
**Beschreibung**: Ausschreibung hochladen (PDF oder XML)  
**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body**: `file` (PDF oder XML)  
**Response**: Tender Object

---

#### `POST /api/v1/analyze/:tenderId`
**Beschreibung**: Compliance-Check für Ausschreibung  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "tender_id": "uuid",
  "is_feasible": true,
  "missing_docs": ["ISO 9001 Zertifikat"],
  "critical_issues": []
}
```

---

## 🗄️ Datenbankmodelle

### `companies` Tabelle
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `auth_user_id` | UUID | Supabase User ID (Unique Index) |
| `name` | TEXT | Firmenname |
| `legal_form` | TEXT | z.B. "GmbH" |
| `industry_tags` | TEXT[] | CPV-Codes als String-Array |
| `profile_embedding` | VECTOR(100) | ⚠️ **ACHTUNG**: Sollte (1536) sein! |
| `address_city`, `address_zip` | TEXT | Adresse |
| `location_geog` | GEOGRAPHY(Point, 4326) | PostGIS Koordinaten |
| `service_radius_km` | INT | Service-Radius (default: 100) |
| `employee_count` | INT | Anzahl Mitarbeiter |
| `annual_revenue` | NUMERIC(12,2) | Jahresumsatz |
| `onboarding_completed` | BOOLEAN | Onboarding-Status |
| `certifications`, `project_references` | JSONB | Dokumente |

**⚠️ BUG**: `profile_embedding` ist als `vector(100)` definiert, aber OpenAI liefert 1536 Dimensionen!  
**Fix**: Schema-Migration zu `vector(1536)` nötig.

### `tenders` Tabelle
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `external_id` | TEXT | Eindeutige ID vom Parser (Unique) |
| `title` | TEXT | Ausschreibungstitel |
| `description_full` | TEXT | Volltext |
| `ocr_compressed_text` | TEXT | OCR-Extrakt (komprimiert) |
| `requirement_embedding` | VECTOR(1536) | Embedding vom Ausschreibungstext |
| `cpv_codes` | TEXT[] | CPV-Codes |
| `deadline` | TIMESTAMPTZ | Frist |
| `region_zip` | TEXT | PLZ |
| `location_geom` | GEOGRAPHY(Point, 4326) | PostGIS Koordinaten |

### `matches` Tabelle
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `company_id` | UUID | Foreign Key → companies |
| `tender_id` | UUID | Foreign Key → tenders |
| `score` | FLOAT64 | Gewichteter Match-Score (0-1) |
| `reason_text` | TEXT | Begründung ("Perfekte Übereinstimmung...") |
| `status` | TEXT | "new", "viewed", "applied", ... |

### `compliance_checks` Tabelle
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `company_id` | UUID | Foreign Key → companies |
| `tender_id` | UUID | Foreign Key → tenders |
| `is_feasible` | BOOLEAN | Ist Bewerbung machbar? |
| `missing_docs` | TEXT[] | Liste fehlender Dokumente |
| `critical_issues` | TEXT[] | K.O.-Kriterien |

---

## 🖥️ Frontend-Komponenten

### Onboarding Flow
**Path**: `src/app/onboarding/page.tsx`  
**Store**: `profile-store.ts` (Zustand)

**Steps**:
1. **BasicsStep** (`BasicsStep.tsx`):
   - Firmendaten (Name, Rechtsform, Adresse, CPV-Codes)
   - Zod-Validierung
   - Auto-Suggestion für CPV-Codes basierend auf Branche
   - City-Autocomplete (München, Berlin, Hamburg, ...)

2. **ReferencesStep** (`ReferencesStep.tsx`):
   - ❌ Dropzone für Dokumente (**kein echter Upload**)
   - Referenzprojekte manuell erfassen (Name, Jahr, Budget)
   - Zertifikate als Tags

3. **PreferencesStep** (`PreferencesStep.tsx`):
   - Alert-Einstellungen (E-Mail, Slack)
   - Match-Score Threshold (Slider)
   - Budget-Range (Doppel-Slider)
   - Regionen (Multi-Select)
   - DSGVO-Consent

**Flow**:
```
Onboarding → API Call → /api/v1/companies → DB Insert → Redirect /dashboard
```

### Dashboard
**Path**: `src/app/(dashboard)/dashboard/page.tsx`

**❌ AKTUELL**: Zeigt hardcoded Mock-Daten:
```tsx
const tenders = [
  { title: "Sanierung Schulturnhalle", matchScore: 94, ... }
]
```

**✅ SOLLTE**: Daten von `/api/v1/feed` fetchen mit `Authorization` Header.

---

## ⚙️ Backend-Services

### `CompanyService` (`company_service.go`)
**Methoden**:
- `CreateCompany(ctx, CompanyInput) → Company`
  
**Logic**:
1. Embedding aus `companyName + industry + cpvCodes + profileSummary`
2. EmployeeCount String → Int Konvertierung
3. RevenueTier (0-2) → Numeric Konvertierung
4. Upsert-Logic bei Duplicate `auth_user_id`

**⚠️ FEHLT**: Geocoding für `location_geog`

---

### `MatchingService` (`matching.go`)
**Methoden**:
- `FindMatchesHybrid(ctx, authUserID, limit) → []Match`

**SQL-Query** (Vereinfacht):
```sql
WITH company_data AS (
  SELECT profile_embedding, industry_tags, location_geom, service_radius_km
  FROM companies WHERE id = ?
),
tender_candidates AS (
  SELECT 
    t.*,
    1 - (t.requirement_embedding <=> c.profile_embedding) AS vector_score,
    cpv_overlap / total_cpv AS cpv_score,
    ST_Distance(c.location_geom::geography, t.location_geom::geography) / 1000 AS distance_km,
    CASE 
      WHEN distance_km <= service_radius_km THEN 1.0
      WHEN distance_km <= 50 THEN 0.8
      ELSE 0.2
    END AS geo_score
  FROM tenders t
  CROSS JOIN company_data c
  WHERE t.deadline > NOW()
)
SELECT * FROM tender_candidates
ORDER BY (vector_score * 0.5 + cpv_score * 0.3 + geo_score * 0.2) DESC
LIMIT ?
```

---

### `IngestionService` (`ingestion.go`)
**Methoden**:
- `ProcessUpload(ctx, fileContent, filename) → Tender`

**Logic**:
- `.pdf` → `processPDF()` → OCR → Embedding → DB
- `.xml` → `processXML()` → UBL Parser → Embedding → DB

**⚠️ FEHLT**: Tatsächliche Hugging Face OCR-Integration (Service existiert, aber nicht getestet)

---

### `ComplianceService` (`compliance_service.go`)
**Methoden**:
- `CheckCompliance(ctx, authUserID, tenderID) → ComplianceCheck`

**Logic**:
1. Lade Company + Tender
2. Rufe `ComplianceAgent.Assess()` auf
3. Speichere Ergebnis in `compliance_checks`

**Agent**: Nutzt Eino Framework + OpenRouter mit Tool Calling:
```go
// Tool: submit_compliance_check
type ComplianceAssessment struct {
  IsFeasible bool     `json:"is_feasible"`
  Blockers   []string `json:"blockers"`
}
```

---

## 📊 Aktueller Status

### Was funktioniert ✅
1. **Kompletter Onboarding-Flow** (Frontend → Backend → DB)
2. **JWT-Authentifizierung** (Supabase Sessions + Backend Middleware)
3. **Matching-Engine** (Hybrid-Score mit Vektor + Geo + CPV)
4. **Compliance-Agent** (LLM Tool Calling funktioniert)
5. **XML/PDF-Ingestion** (Backend-Logic vorhanden)

### Was hardcoded ist 🟡
1. **Dashboard Feed**: Frontend zeigt Mock-Daten statt API-Calls
2. **Geocoding**: Keine automatische Koordinaten-Generierung aus Adresse
3. **OCR**: Service existiert, aber kein Test mit echtem Hugging Face API
4. **File-Uploads**: Dropzone in Frontend, aber keine Storage-Integration

### Was fehlt ❌
1. **Dashboard → Backend-Integration**: `fetch('/api/v1/feed')` mit Auth Header
2. **Tender Detail View**: Keine Komponente für Einzelansicht
3. **Compliance UI**: Kein Frontend für Compliance-Checks
4. **Error-Handling**: Kein User-Feedback bei API-Fehlern
5. **Bewerbungsmanagement**: Keine Tabelle/UI für Applications
6. **Admin-Panel**: Keine UI für manuelles Upload von Tenders
7. **Realtime Updates**: Keine WebSockets/SSE
8. **Tests**: Weder Backend noch Frontend

### Kritische Bugs 🐛
1. **Embedding Dimensionen**: `companies.profile_embedding` ist `vector(100)`, aber sollte `vector(1536)` sein
2. **Geocoding fehlt**: Matching-Query nutzt `location_geog`, aber Spalte ist immer NULL
3. **OCR nicht getestet**: Hugging Face API-Call wird ausgeführt, aber niemand weiß ob's funktioniert

---

## 🔐 Umgebungsvariablen

### Backend (`.env` im Root)
```bash
# Datenbank
DATABASE_URL=postgres://user:pass@localhost:5432/vergabe_agent

# Supabase
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# OpenAI (für Embeddings)
OPENAI_API_KEY=sk-...

# OpenRouter (für Compliance LLM)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_NAME=Vergabe-Agent
OPENROUTER_APP_URL=https://vergabe-agent.de

# Hugging Face (für OCR)
HUGGINGFACE_TOKEN=hf_...
```

### Frontend (`.env.local`)
```bash
# Supabase (Public Keys)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 📝 Nächste Schritte

### Priorität 1: Dashboard Integration
1. **Feed API-Call**:
   ```tsx
   // dashboard/page.tsx
   const { data: session } = await supabase.auth.getSession()
   const res = await fetch('/api/v1/feed', {
     headers: { Authorization: `Bearer ${session.access_token}` }
   })
   const { matches } = await res.json()
   ```

2. **Error-Handling**:
   - Toast-Nachrichten bei Fehlern
   - Fallback auf Mock-Daten bei Network-Error

### Priorität 2: Geocoding
1. **Geocoding-Service**:
   - Nominatim (OpenStreetMap) oder Google Geocoding API
   - Bei Company-Create: PLZ+City → Lat/Lng → `location_geog`

2. **Backend-Integration**:
   ```go
   // In CreateCompany():
   lat, lng := geocode(company.AddressZip, company.AddressCity)
   company.Latitude = lat
   company.Longitude = lng
   // DB Trigger: location_geog = ST_GeogFromText('POINT(lng lat)')
   ```

### Priorität 3: Embedding-Bug Fix
```sql
-- Migration
ALTER TABLE companies 
ALTER COLUMN profile_embedding TYPE vector(1536);
```

### Priorität 4: Tender Detail View
1. Backend-Route: `GET /api/v1/tenders/:id`
2. Frontend-Komponente: `app/(dashboard)/tenders/[id]/page.tsx`

---

## 🎓 Zusammenfassung

**Vergabe AI Agent** ist eine ambitionierte Plattform mit solidem Backend (Go + KI) und modernem Frontend (Next.js). Der **Onboarding-Flow** ist komplett, das **Matching** funktioniert, aber die **Dashboard-Integration** fehlt noch. Die Architektur ist sauber getrennt, aber es gibt kritische Lücken:

1. **Frontend zeigt Mock-Daten** statt echte API-Calls
2. **Geocoding fehlt**, weshalb geografisches Matching nicht funktioniert
3. **OCR ist ungetestet**
4. **Embedding-Dimensionen stimmen nicht** (100 vs. 1536)

Mit den nächsten Schritten (Dashboard-API-Integration, Geocoding, Bug-Fixes) wird die Plattform voll funktionsfähig. Der Grundstein ist gelegt! 🚀
