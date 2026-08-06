# Düşmanı Tanı Ablukayı Dağıt - Kaynaklar (Resources)

**Proje kaynakları, dosyalar ve erişim bilgileri**

---

## 📦 Proje Konumu

```
GitHub Repository:
  https://github.com/sermedol/dusman-tan-ablukay-dag-t.git

Dev Branch:
  git clone -b claude/umut-sen-platform-grj0zl \
    https://github.com/sermedol/dusman-tan-ablukay-dag-t.git

Local Path:
  /home/user/D-man-Tan-Ablukay-Da-t/
```

---

## 🗂️ Dosya Yapısı - Tam Map

### Root Dokümantasyon
```
├── README.md                      (Proje tanıtımı)
├── IMPLEMENTATION_PLAN.md         (9 haftalık plan)
├── DEVELOPMENT_STARTED.md         (İlk hafta özeti)
├── PROJECT_STATUS_REPORT.md       (Detaylı durum)
├── RESOURCES.md                   (Bu dosya)
├── .env.example                   (Konfigürasyon template)
├── docker-compose.yml             (Containers)
└── package.json                   (Root deps)
```

### Backend (API)
```
apps/api/src/
├── app.module.ts                  (Main module - StrugglesModule added)
├── main.ts                        (Entry point)
└── modules/
    ├── struggles/                 ⭐ YENI
    │   ├── struggles.service.ts   (420 lines - Business logic)
    │   ├── struggles.controller.ts (180 lines - HTTP handlers)
    │   └── struggles.module.ts    (Module export)
    │
    ├── entities/
    │   ├── entities.service.ts
    │   ├── entities.controller.ts
    │   └── entities.module.ts
    │
    ├── relations/
    ├── sources/
    ├── verification/
    ├── public/
    │   ├── public.service.ts       (Updated: added struggle methods)
    │   └── public.controller.ts    (Updated: added struggle endpoints)
    │
    └── [other modules...]
```

### Admin Panel (UI)
```
apps/admin/src/
└── app/
    └── dashboard/
        ├── entities/
        │   └── page.tsx
        ├── relations/
        │   └── page.tsx
        ├── sources/
        │   └── page.tsx
        ├── users/
        │   └── page.tsx
        ├── verification/
        │   └── page.tsx
        ├── import/
        │   └── page.tsx
        └── struggles/              ⭐ YENI
            └── page.tsx            (600 lines - Full CRUD)
```

### Kamu Web Sitesi (Public)
```
apps/public/src/
├── app/
│   ├── page.tsx                   (Homepage - Updated branding)
│   ├── search/
│   │   └── page.tsx
│   ├── entities/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── relations/
│   │   └── page.tsx
│   ├── struggles/                 ⭐ YENI
│   │   └── page.tsx               (550 lines - Listing)
    │
    └── components/
        ├── MapComponent.tsx
        └── GraphComponent.tsx
```

### Database (Schema)
```
packages/database/
├── prisma/
│   ├── schema.prisma              (Updated: +Struggle models)
│   ├── migrations/
│   │   └── [migration_date]/
│   │       └── migration.sql
│   └── seed.ts
│
└── package.json
```

### Shared Packages
```
packages/
├── auth/                          (JWT authentication)
│   └── src/
│       ├── jwt.strategy.ts
│       ├── jwt-auth.guard.ts
│       └── decorators/
│           └── current-user.decorator.ts
│
├── database/                      (Prisma client)
│   └── prisma/
│       └── schema.prisma
│
└── types/                         (Shared TypeScript types)
```

---

## 🔧 Konfigürasyon Dosyaları

### Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dusman_dev
DATABASE_SHADOW_URL=postgresql://postgres:postgres@localhost:5432/dusman_shadow

# API
API_PORT=3001
API_HOST=0.0.0.0

# Authentication
AUTH_SECRET=your-super-secret-key

# Logging
LOG_LEVEL=info

# File Storage (S3-compatible)
S3_REGION=us-east-1
S3_BUCKET=dusman-local
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

### Docker Services (docker-compose.yml)
```yaml
Services:
  postgres       - PostgreSQL 15 (DB)
  redis          - Redis 7 (Cache)
  meilisearch    - Meilisearch (Search)
  minio          - MinIO (S3-compatible storage)
```

---

## 📚 Veri Modeli - Struggle

### Struggle Table Structure
```typescript
interface Struggle {
  // Identification
  id: string                          // CUID
  title: string                       // Başlık
  slug: string                        // URL-safe identifier
  
  // Content
  description?: string                // Uzun açıklama
  summary?: string                    // Kısa özet
  
  // Classification
  type: StruggleType                  // 10 types
    | 'worker_resistance'             // İşçi direniş
    | 'union_pressure'                // Sendikal baskı
    | 'wage_theft'                    // Ücret gasp
    | 'workplace_death'               // İş cinayeti
    | 'forced_expropriation'          // Zorunlu kamulaştırma
    | 'mining_project'                // Madencilik karşıtı
    | 'energy_project'                // Enerji projesi karşıtı
    | 'ecological_battle'             // Ekoloji mücadelesi
    | 'land_struggle'                 // Arazi mücadelesi
    | 'other'
  
  status: StruggleStatus
    | 'active'                        // Devam ediyor
    | 'completed'                     // Tamamlandı
    | 'ongoing'                       // Süregelen
    | 'historical'                    // Tarihi
  
  visibility: Visibility
    | 'public'                        // Halk açık
    | 'internal'                      // İç
    | 'private'                       // Özel
  
  verificationStatus: VerificationStatus
    | 'unverified'                    // Doğrulanmamış
    | 'verified'                      // Doğrulanmış
    | 'needs_review'                  // İnceleme gerekli
    | 'source_required'               // Kaynak gerekli
    | 'conflicting'                   // Çelişkili
  
  // Temporal
  startDate?: Date                    // Başlangıç tarihi
  endDate?: Date                      // Bitiş tarihi
  
  // Location
  location?: string                   // Konum (metin)
  latitude?: Decimal                  // Enlem
  longitude?: Decimal                 // Boylam
  
  // Details
  participants?: string               // Katılımcılar
  outcome?: string                    // Sonuç
  lessons?: string                    // Dersleri
  relatedEntities?: string            // JSON: Entity IDs
  
  // Metadata
  publicationDate?: Date
  publishedAt?: Date
  
  // Audit
  createdBy: string                   // User ID
  createdByUser: User
  updatedBy: string                   // User ID
  updatedByUser: User
  createdAt: Date
  updatedAt: Date
  version: Int
  
  // Relations
  sourceEvidence: StruggleSourceEvidence[]
  tags: StruggleTag[]
}
```

### StruggleSourceEvidence
```typescript
interface StruggleSourceEvidence {
  id: string
  struggleId: string
  sourceId: string
  source: Source
  excerpt?: string                    // Alıntı
  pageNumber?: number
  notes?: string
  createdAt: Date
}
```

### StruggleTag
```typescript
interface StruggleTag {
  id: string
  struggleId: string
  struggle: Struggle
  tag: string                         // Etiket
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Struggles Endpoints

#### Create (Admin)
```http
POST /struggles
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Konak Termoelektrik Santralı Karşı Direniş",
  "type": "energy_project",
  "status": "active",
  "visibility": "internal",
  "description": "Ege Bölgesi'nde enerji santralına karşı çiftçi direniş",
  "startDate": "2023-03-15",
  "endDate": "2023-05-20",
  "location": "Konak, İzmir",
  "participants": "Yerel çiftçiler, çevre örgütleri",
  "outcome": "Şirketi proje ertelemeye zorladi"
}
```

#### List (Admin)
```http
GET /struggles?type=energy_project&status=active&search=Konak
Authorization: Bearer <JWT_TOKEN>
```

#### Detail (Admin)
```http
GET /struggles/{id}
Authorization: Bearer <JWT_TOKEN>
```

#### Update (Admin)
```http
PATCH /struggles/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "completed",
  "outcome": "..."
}
```

#### Delete (Admin)
```http
DELETE /struggles/{id}
Authorization: Bearer <JWT_TOKEN>
```

#### Add Source (Admin)
```http
POST /struggles/{id}/sources
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "sourceId": "src_12345",
  "excerpt": "Yöre halkı santrale karşı gösteri yaptı...",
  "pageNumber": 5,
  "notes": "Gazetede yer alan haber"
}
```

#### Add Tag (Admin)
```http
POST /struggles/{id}/tags
Authorization: Bearer <JWT_TOKEN>

{
  "tag": "çevre-kirliliği"
}
```

### Public API Endpoints (No Auth)

#### List All
```http
GET /public/struggles
```

#### By Type
```http
GET /public/struggles/type/energy_project
```

#### Detail
```http
GET /public/struggles/{id}
```

---

## 🎨 UI Components

### Admin Page (struggles/page.tsx)
```typescript
// Components
<StrugglesPage />
  ├── Header with "+ Yeni Mücadele" button
  ├── Form (conditional rendering)
  │   ├── Title input
  │   ├── Type select (10 options)
  │   ├── Status select
  │   ├── Visibility select
  │   ├── Date inputs
  │   ├── Location input
  │   ├── Description textarea
  │   └── Form buttons (Ekle/Güncelle, İptal)
  │
  ├── Filters
  │   ├── Search input
  │   ├── Type filter
  │   ├── Status filter
  │   └── Result count
  │
  └── Table
      ├── Başlık column
      ├── Tür column (with badge)
      ├── Durum column (with badge)
      ├── Konum column
      └── İşlemler column (Edit, Delete buttons)

// Styling
- Background: #f9f8f6 (cream)
- Accent: #dc2626 (red)
- Borders: #e5e5e5 (light gray)
- Text: #1a1a1a (dark)
```

### Public Page (struggles/page.tsx)
```typescript
// Components
<StrugglesListPage />
  ├── Navigation Bar
  ├── Hero Section
  │   ├── Title "Direniş Haritası"
  │   └── Search form
  │
  ├── Filter Tags (10 types, color-coded)
  │
  ├── Grid Cards (3 columns, responsive)
  │   └── Each Card:
  │       ├── Type badge (colored)
  │       ├── Title (link)
  │       ├── Description excerpt
  │       ├── Location (📍)
  │       ├── Date range (📅)
  │       └── Tags (max 3)
  │
  └── Footer

// Colors by Type
- worker_resistance: #dc2626 (red)
- union_pressure: #f59e0b (amber)
- wage_theft: #ef4444 (light red)
- workplace_death: #991b1b (dark red)
- forced_expropriation: #7c3aed (purple)
- mining_project: #78716c (gray)
- energy_project: #10b981 (green)
- ecological_battle: #059669 (dark green)
- land_struggle: #d97706 (orange)
- other: #6b7280 (slate)
```

---

## 🗄️ Database Queries

### Find All Struggles (with filtering)
```sql
SELECT * FROM struggle
WHERE visibility = 'public'
  AND ($1 IS NULL OR type = $1)
  AND ($2 IS NULL OR status = $2)
  AND ($3 IS NULL OR 
       title ILIKE '%' || $3 || '%' OR
       description ILIKE '%' || $3 || '%')
ORDER BY startDate DESC
LIMIT $4;
```

### Get Struggle with Evidence
```sql
SELECT 
  s.*,
  json_agg(
    json_build_object(
      'id', sse.id,
      'sourceId', sse.sourceId,
      'excerpt', sse.excerpt,
      'source', row_to_json(src.*)
    )
  ) as sourceEvidence
FROM struggle s
LEFT JOIN struggle_source_evidence sse ON s.id = sse.struggleId
LEFT JOIN source src ON sse.sourceId = src.id
WHERE s.id = $1
GROUP BY s.id;
```

---

## 📊 Statistics

### Database Size
- Struggle table: ~50KB (empty)
- StruggleSourceEvidence: ~20KB (empty)
- StruggleTag: ~10KB (empty)
- **Total:** ~80KB

### Code Size
```
struggles.service.ts    420 lines
struggles.controller.ts 180 lines
admin/struggles/page    600 lines
public/struggles/page   550 lines
database schema         150 lines
─────────────────────────────────
Total                 1,900 lines
```

---

## 🔐 Security

### Authentication
- JWT Token-based
- Bearer token in Authorization header
- Token expiry: 7 days (configurable)
- Refresh token: Not yet implemented

### Authorization
- Role-based access control (RBAC)
- Roles: super_admin, admin, verifier, researcher, viewer
- Struggles: admins can create/edit, researchers can view

### Data Protection
- Encrypted passwords (bcrypt)
- HTTPS in production
- CORS configured
- SQL injection prevention (Prisma parameterization)
- XSS protection (React built-in)

---

## 📱 Git Commands

### Clone & Setup
```bash
git clone https://github.com/sermedol/dusman-tan-ablukay-dag-t.git
cd D-man-Tan-Ablukay-Da-t
git checkout claude/umut-sen-platform-grj0zl
pnpm install
```

### View Recent Commits
```bash
git log --oneline -10

# Output:
16241b5 feat(struggles): add admin and public struggle management pages
ebb1bf0 docs: add development status and first week summary
a3624c6 feat(struggles): add comprehensive struggle/resistance tracking system
8b229a8 ...
```

### View Changes
```bash
git diff HEAD~2 HEAD    # Last 2 commits
git show 16241b5        # Specific commit
git log -p --follow -- apps/api/src/modules/struggles/
```

---

## 🚀 Development Commands

### Install Dependencies
```bash
pnpm install
```

### Run Database Migration
```bash
cd packages/database
npx prisma migrate dev --name "add_struggle_model"
```

### Seed Database
```bash
npx prisma db seed
```

### Start API Server
```bash
cd apps/api
npm run dev              # Port 3001
```

### Start Admin Panel
```bash
cd apps/admin
npm run dev              # Port 3002
```

### Start Public Site
```bash
cd apps/public
npm run dev              # Port 3003
```

### Run Tests
```bash
pnpm test
```

### Build for Production
```bash
pnpm build
```

---

## 📞 İletişim & Destek

### Issues & Questions
```
GitHub Issues:
  https://github.com/sermedol/dusman-tan-ablukay-dag-t/issues

Development Branch:
  claude/umut-sen-platform-grj0zl
```

### Documentation Locations
```
├── IMPLEMENTATION_PLAN.md     - 9-week roadmap
├── DEVELOPMENT_STARTED.md     - First week details
├── PROJECT_STATUS_REPORT.md   - Current status
└── RESOURCES.md               - This file
```

---

**Güncelleme Tarihi:** 6 Ağustos 2026  
**Sorumlu:** Claude Code  
**Durum:** 🟢 Aktif
