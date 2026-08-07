# Umut-Sen Platform

**Düşmanı Tanı, Ablukayı Dağıt!**

Türkiye'deki sermaye gruplarını, bağlı şirketleri, tesisleri, finans ilişkilerini, kamu bağlantılarını, ihaleleri, projeleri, sendikaları, işçi direnişlerini, iş cinayetlerini, davaları, ekoloji mücadelelerini ve bunlara dayanak oluşturan belgeleri tek bir veri sistemi içinde ilişkilendiren araştırma, haritalandırma ve ilişki analizi platformu.

## ⚡ Hızlı Başlangıç

### Ön Koşullar

- Node.js ≥ 20
- pnpm ≥ 9
- Docker & Docker Compose
- Git

### Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/sermedol/D-man-Tan-Ablukay-Da-t.git
cd D-man-Tan-Ablukay-Da-t

# Bağımlılıkları yükle
pnpm install

# .env dosyasını oluştur (örnek'ten)
cp .env.example .env.local

# Docker servislerini başlat (postgres, redis, meilisearch, minio)
docker-compose up -d

# Veritabanı migrationlarını çalıştır
pnpm db:migrate

# Demo verilerini yükle
pnpm db:seed

# Tüm uygulamaları başlat (API, Web, Admin, Worker)
pnpm dev
```

### Erişim

| Uygulama | URL | Amaç |
|----------|-----|------|
| Web (Public) | http://localhost:3000 | Halka açık site |
| Admin Panel | http://localhost:3002 | Editöryel kontrol |
| API | http://localhost:3001/api/v1 | REST API |
| API Docs | http://localhost:3001/api/v1/docs | Swagger UI |
| MinIO Console | http://localhost:9001 | Dosya depolaması |
| Meilisearch UI | http://localhost:7700 | Arama indeksi |

### Test Hesapları

```
researcher@demo.local / password123
verifier@demo.local / password123
admin@demo.local / password123
super_admin@demo.local / password123
```

## 📦 Yapı

```
.
├── apps/                 # Uygulamalar
│   ├── web/            # Next.js halka açık site
│   ├── admin/          # Next.js admin paneli
│   ├── api/            # NestJS backend
│   └── worker/         # Node.js arka plan işleri
├── packages/           # Paylaşılan paketler
│   ├── ui/            # React bileşenleri
│   ├── database/       # Prisma ORM, migrations
│   ├── auth/          # Kimlik doğrulama
│   ├── search/        # Meilisearch integration
│   ├── graph/         # Graph queries
│   ├── maps/          # Map utilities
│   ├── config/        # Shared config
│   ├── contracts/     # TypeScript types
│   ├── logger/        # Pino logger
│   └── testing/       # Test utilities
├── docs/              # Dokümantasyon
├── infra/             # Infrastructure (Docker, scripts)
└── .github/           # GitHub workflows

```

## 🚀 Geliştirme

### Komutlar

```bash
# Tüm paketleri lint'le
pnpm lint

# Format'ı kontrol et
pnpm format:check

# Format'ı onar
pnpm format

# TypeScript tiplerini kontrol et
pnpm type-check

# Build et
pnpm build

# Test et (unit + integration)
pnpm test

# E2E test'leri çalıştır
pnpm test:e2e

# Watch modda test et
pnpm test:watch

# Veritabanı migration'ı çalıştır
pnpm db:migrate

# Demo verilerini yükle
pnpm db:seed

# Veritabanı'nı reset et (tüm veri silinir!)
pnpm db:reset

# Platform dışa aktarma (backup)
pnpm platform:export

# Platform geri yükleme
pnpm platform:restore ./platform-export-...
```

### Turbo

Monorepo Turbo ile yönetilir. Task'ları paralel veya serial çalıştırabilir:

```bash
# Spesifik paket'i build et
turbo run build --filter=@umutsensen/api

# Dependency'siyle birlikte build et
turbo run build --filter=@umutsensen/web...

# Watch modda çalıştır
turbo run dev --parallel
```

## 📚 Dokümantasyon

- [Ürün Kapsamı](docs/product-scope.md)
- [Sistem Mimarisi](docs/architecture.md)
- [Veri Modeli](docs/data-model.md)
- [Yayın Akışı](docs/publication-workflow.md)
- [Erişim Kontrol](docs/permissions.md)
- [Uygulama Planı](docs/implementation-plan.md)
- [Teknik Varsayımlar](docs/assumptions.md)
- [Navigasyon](docs/navigation.md)
- [Tasarım Sistemi](docs/design-system.md)

## 🔐 Güvenlik

- OWASP ASVS ilkeleri
- RBAC (Role-Based Access Control)
- HttpOnly secure cookies
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Audit logging

## 🧪 Testing

- **Unit Tests:** Vitest (domain logic)
- **Integration Tests:** Supertest (API)
- **E2E Tests:** Playwright (user workflows)
- **Accessibility:** axe-core (WCAG 2.2 AA)

Minimum coverage: 70%

## 🎨 Tasarım

- Next.js + React
- Tailwind CSS
- shadcn/ui (Radix UI)
- Framer Motion (animations)
- Responsive (mobile-first)
- Accessibility (WCAG 2.2 AA)

## 🗺️ Haritalama & Ağ

- **Harita:** MapLibre GL + PostGIS
- **Clustering:** Supercluster
- **Graph:** Sigma.js (WebGL)
- **Path Finding:** Dijkstra algorithm

## 🔍 Arama

- **Meilisearch:** Türkçe + typo tolerance
- **Normalizasyon:** İ/i, I/ı, Ş/ş, Ç/ç, Ğ/ğ, Ü/ü, Ö/ö
- **Alias:** Eski isimler, kısaltmalar, misspellings

## 🗄️ Veri Tabanı

- **PostgreSQL 16** (ACID, JSON, PostGIS)
- **Prisma ORM** (type-safe migrations)
- **Revisions** (immutable history)
- **Audit logging** (tüm yazma işlemleri)

### Migration

```bash
# Yeni migration oluştur
pnpm db:migration create [name]

# Migration'ları çalıştır
pnpm db:migrate

# Geri al
pnpm db:rollback
```

## 📤 İçe Aktarma

Sistem 3 veri giriş kanalını destekler:

1. **Admin Paneli** — Manuel form girişi
2. **Excel/XLSX/CSV** — Toplu import
3. **Google Drive / Sheets** — Master Registry üzerinden otomatik keşif ve senkronizasyon

Tüm kaynaklar aynı doğrulama akışına girer.

### Google Drive / Sheets Veri Hattı

Araştırma verisinin ana çalışma kaynağı Google Drive + Google Sheets'tir;
PostgreSQL yayımlanabilir/doğrulanmış uygulama veritabanıdır. Yeni bir
holding eklemek Master Registry sayfasına bir satır eklemekten ibarettir —
backend kodu değiştirmek gerekmez. Detaylı mimari, kimlik bilgisi kurulumu,
sheet formatı, sync yaşam döngüsü ve sorun giderme için:
[`docs/GOOGLE_DRIVE_DATA_PIPELINE.md`](docs/GOOGLE_DRIVE_DATA_PIPELINE.md)

## 🔄 Yayın Akışı

```
Draft → Submitted → Under Review → Approved → Published
                       ↓
                Changes Requested
                       ↓
                    Revised
```

Yayımlanmış kayıtlar en az bir kaynağa bağlı olmalıdır.

## 💾 Yedekleme

```bash
# Full backup (PostgreSQL + files + search)
pnpm platform:export

# Restore
pnpm platform:restore ./platform-export-...
```

## 🚢 Deployment

Docker image'ler Dockerfile'lardan oluşturulur:

- `infra/docker/Dockerfile.api`
- `infra/docker/Dockerfile.web`
- `infra/docker/Dockerfile.admin`
- `infra/docker/Dockerfile.worker`

CI/CD: GitHub Actions (lint, type-check, build)

## 📝 Lisans

[Açıklanmamıştır — Proje aşamasında]

## 🤝 Katkı

Düzenli commit'ler Conventional Commits formatını takip eder:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Örnekler:
- `feat(entities): add canonical name search`
- `fix(api): handle null locations in map queries`
- `docs(permissions): clarify verifier role`
- `test(integration): add entity publish workflow test`

Pre-commit hooks commitlint'i çalıştırır.

## 📞 İletişim

Umut-Sen — [İletişim bilgileri]

---

**Proje Durumu:** Phase 0 (Technical Foundation) — Kurulum ve dokümantasyon tamamlanmıştır.
