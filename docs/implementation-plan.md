# Uygulama Planı

## Faz Sistemi

Projeyi 7 faza böldük. Her faz tamamlandığında çalışan kod, test sonuçları ve teknik borç raporu sunulur.

---

## Faz 0 — Teknik Temel (1 hafta)

**Hedef:** Geliştirme ortamı hazır, CI/CD ayağa kalkmış, kod standardı oluşturulmuş.

### Görevler

- [ ] Monorepo yapısı (pnpm + Turborepo)
- [ ] TypeScript konfigürasyonu (strict mode)
- [ ] ESLint, Prettier, commitlint setup
- [ ] Docker Compose (postgres, redis, meilisearch, minio)
- [ ] Database migration tool (Prisma)
- [ ] Logging (Pino)
- [ ] Health check endpoints
- [ ] GitHub Actions CI pipeline
- [ ] README (quick start)
- [ ] `pnpm dev` komutu çalışır

### Çıktılar

- `/apps/api` — Boş NestJS uygulaması
- `/apps/web` — Boş Next.js uygulaması
- `/apps/admin` — Boş Next.js uygulaması
- `/apps/worker` — Boş Node.js uygulaması
- `/packages/*` — Paket yapıları
- `/docker-compose.yml` — Tüm servisler
- `/.github/workflows/ci.yml` — Lint, type check, test
- `/docs/assumptions.md` — Teknik varsayımlar
- `/docs/adr/0001-monorepo.md` — Karar kaydı

### Kabul Kriterleri

- `pnpm install && pnpm dev` komutuyla tüm servisler (API, web, admin, worker, DB, Redis) ayağa kalkması ~2 dakika içinde
- Type check hata vermemesi
- CI pipeline'da 3 job: lint, typecheck, build
- Health endpoint'leri cevap vermesi

---

## Faz 1 — Veri Omurgası (2 hafta)

**Hedef:** Veritabanı şeması, temel API, seed data.

### Görevler

- [ ] Prisma schema yazılması (tüm tablolar)
- [ ] Database migrations (up/down)
- [ ] Seed script (demo data)
  - 5 holding
  - 20 şirket
  - 10 kamu kurumu
  - 5 banka
  - 3 sendika
  - 5 mücadele
  - 20+ kaynak
  - Demo ilişkileri
- [ ] Entity CRUD API (REST)
- [ ] Relation CRUD API
- [ ] Source API
- [ ] Basic validation (Zod)
- [ ] Pagination (cursor-based)
- [ ] Error handling (RFC 9457)
- [ ] Unit tests (domain logic)
- [ ] Integration tests (API)
- [ ] RBAC role/permission system
- [ ] Audit logging
- [ ] Revision tracking

### Çıktılar

- `/packages/database/prisma/schema.prisma` — Tüm tablolar
- `/apps/api/src/modules/entities/*` — Entity CRUD
- `/apps/api/src/modules/relations/*` — Relation CRUD
- `/apps/api/src/modules/sources/*` — Source CRUD
- `/apps/api/src/shared/guards/*` — Permission guards
- API OpenAPI documentation
- Test coverage ≥ 70%

### Kabul Kriterleri

- `POST /api/v1/entities` → 201 (kayıt oluştur)
- `GET /api/v1/entities/:id` → 200 (kayıt oku)
- `PATCH /api/v1/entities/:id` → 200 (güncelle)
- Permission guard `POST` ve `PATCH` 403 döner (yetkisiz)
- Audit log yazılır
- Revision oluşturulur
- Seed data yüklenir, system çalışır

---

## Faz 2 — Admin MVP (1.5 hafta)

**Hedef:** Admin paneli giriş yap, kayıt oluştur, doğrula, yayımla.

### Görevler

- [ ] Auth.js setup (HttpOnly cookies, TOTP)
- [ ] Login sayfası
- [ ] 2FA setup akışı
- [ ] Admin dashboard (stats)
- [ ] Entity tablo (liste, filter, sort)
- [ ] Entity detay sayfası (edit form)
- [ ] Relation kurma (form)
- [ ] Source yükleme (file upload)
- [ ] Verification queue (inceleme listesi)
- [ ] Publish workflow
  - Draft → Submitted → Approved → Published
  - Changes request flow
- [ ] Revision history (karşılaştırma)
- [ ] User management (roles)
- [ ] Audit log görüntüleme
- [ ] E2E test (login → create entity → publish)

### Çıktılar

- `/apps/admin/app/(auth)/login` — Giriş sayfası
- `/apps/admin/app/(dashboard)/entities` — Entity yönetimi
- `/apps/admin/app/(dashboard)/verification` — Doğrulama merkezi
- Tailwind + shadcn/ui components
- E2E testler (Playwright)

### Kabul Kriterleri

- Admin başarıyla login yapabilmesi
- Yeni entity oluşturabilmesi (form)
- Taslağı gönderebilmesi (submitted state)
- Verifier taslağı onaylayabilmesi
- Entity yayımlanabilmesi
- Yayınlanan entity halka açık sitede görülebilmesi
- Audit log işlemi göstermesi

---

## Faz 3 — Public MVP (1 hafta)

**Hedef:** Halka açık site: ana sayfa, arama, varlık profili.

### Görevler

- [ ] Ana sayfa (responsive landing page)
  - Hero bölümü
  - Arama input'u
  - Temel sayılar (API'den gerçek veri)
  - Kategori kartları
  - Son eklenen ilişkiler
- [ ] Arama sayfası (`/search`)
  - Meilisearch entegrasyonu
  - Türkçe normalizasyon
  - Filtreler (tip, il, vs.)
  - Sonuç önerileri
- [ ] Varlık profil sayfası (`/entity/[slug]`)
  - Temel bilgiler
  - Sekmeler (ilişkiler, projeler, mücadeleler, vs.)
  - Kaynaklar
  - Responsive design
- [ ] Mücadele listesi (`/struggles`)
  - Liste görünümü
  - Filtreler
  - İlgili kayıtlar
- [ ] Kaynak görüntüleme
  - PDF önizleme (sandbox)
  - Meta bilgiler
  - İlişkili varlıklar
- [ ] Responsive tasarım (mobile-first)
- [ ] SEO (meta tags, sitemap)
- [ ] E2E test (ziyaretçi arama yapıp profil ziyaret edebilmesi)

### Çıktılar

- `/apps/web/app/(public)/page.tsx` — Ana sayfa
- `/apps/web/app/(public)/search/page.tsx` — Arama
- `/apps/web/app/(public)/entity/[slug]/page.tsx` — Profil
- Meilisearch indexing (arka planda)
- Lighthouse Performance ≥ 90

### Kabul Kriterleri

- Ana sayfa 3 saniyede yüklenmesi
- Arama "limak" sorgusu sonuç vermesi
- Entity profili Loading State'i olmaksızın yüklenmesi
- Mobile'da responsive olması
- Kilitli holding olmadığından farklı varlıklara geçişin çalışması

---

## Faz 4 — Harita (2 hafta)

**Hedef:** Interactive map: MapLibre GL, PostGIS clustering, filters.

### Görevler

- [ ] MapLibre GL JS setup
- [ ] PostGIS geometries (entities → locations)
- [ ] Map API endpoint (`GET /api/v1/map/features`)
  - Bounding box query
  - Zoom level clustering
  - Entity type filtering
  - Visibility filtering
- [ ] Marker rendering
  - Entity type icons
  - Color by category
  - Cluster bubbles
- [ ] Map UI
  - Filter panel
  - Marker popup
  - Fullscreen toggle
  - Mobile bottom sheet
  - URL state sync
- [ ] Performance
  - Viewport-based queries
  - Redis caching
  - Materialized view (PostGIS)
- [ ] E2E test (harita açılır, filtre uygulanır, marker seçilir)

### Çıktılar

- `/apps/web/app/(public)/explore/page.tsx` — Harita sayfası
- `/apps/api/src/modules/map/*` — Map API
- `/packages/maps/` — Map utilities, clustering
- PostGIS indexes ve views

### Kabul Kriterleri

- Harita ilk yüklemede 2 saniyada cevap vermesi
- 100+ marker cluster olması
- Filtre uygulaması real-time çalışması
- Mobile'da full-screen harita şeklinde görünmesi
- URL değişimi browser history'ye kaydedilmesi

---

## Faz 5 — İlişki Ağı (2 hafta)

**Hedef:** Sigma.js graph, kademeli yükleme, path-finding.

### Görevler

- [ ] Graph API endpoint (`GET /api/v1/graph/:entityId`)
  - Depth parameter (1-3)
  - Entity type filter
  - Relation type filter
  - Date range filter
- [ ] Sigma.js rendering
  - WebGL renderer
  - Node colors by entity type
  - Edge colors by relation type
  - Zoom/pan
- [ ] Interactions
  - Node click (detail)
  - Edge click (relation detail)
  - Double-click (expand)
  - Search in graph
- [ ] Path finding (`GET /api/v1/graph/path?source=...&target=...`)
  - Dijkstra algorithm
  - Max path length limit
- [ ] Export (PNG, SVG)
- [ ] Share state (URL)
- [ ] Legend
- [ ] Mobile simplification
- [ ] Performance
  - Server-side truncation
  - Lazy loading
  - Caching

### Çıktılar

- `/apps/web/app/(public)/network/page.tsx` — Graph sayfası
- `/apps/api/src/modules/graph/*` — Graph API
- `/packages/graph/` — Graph algorithms
- Sigma.js component

### Kabul Kriterleri

- Graph 2-3 saniyada yüklenmesi
- 500+ node/edge render edilebilmesi
- En kısa yol bulunabilmesi
- Mobile'da node listesi olarak gösterilmesi

---

## Faz 6 — İçe Aktarma (2 hafta)

**Hedef:** CSV/XLSX/Google Drive import, dry-run, conflict resolution.

### Görevler

- [ ] Excel şablonları
  - entities.xlsx
  - relations.xlsx
  - sources.xlsx
  - struggles.xlsx
- [ ] Upload endpoint
  - File validation
  - Duplicate checksum
  - Template version check
- [ ] Parsing & normalization
  - Türkçe character handling
  - Date parsing
  - Type validation
- [ ] Import batch tracking
  - Raw row storage
  - Progress tracking
  - Error collection
- [ ] Duplicate detection
  - By canonical_name
  - By external_id
  - Similarity matching
- [ ] Conflict resolution UI
  - Use import vs. keep existing
  - Field merging
  - Manual review
- [ ] Dry-run
  - No database writes
  - Full validation report
  - Preview results
- [ ] Google Drive sync
  - Service account OAuth
  - Folder watching
  - File checksum tracking
  - Automatic import on change
- [ ] Admin UI
  - Upload form
  - Batch list
  - Dry-run report
  - Approval flow

### Çıktılar

- `/apps/admin/app/(dashboard)/import/` — İçe aktarma sayfası
- `/apps/api/src/modules/imports/*` — Import API
- `/apps/worker/src/workers/import-processor.ts` — Arka plan işi
- Excel şablonları (template repo'sunda)
- Google Drive adapter

### Kabul Kriterleri

- Örnek Excel dosyası import edilebilmesi
- Duplicate'ler tespit edilebilmesi
- Dry-run hiç yazma yapmaz
- Google Drive dosyası algılanabilmesi
- Import kaynağı kaydedilmesi

---

## Faz 7 — Sertleştirme (2 hafta)

**Hedef:** Güvenlik, erişilebilirlik, performans, deployment.

### Görevler

- [ ] Security Audit
  - OWASP ASVS
  - Penetration testing mindset
  - Secret management
  - CORS policy
  - Rate limiting
  - Input validation
  - Output encoding
- [ ] Accessibility (WCAG 2.2 AA)
  - Keyboard navigation
  - Screen reader support
  - Color contrast
  - Focus indicators
  - aria-labels
  - axe-core testing
- [ ] Performance
  - Lighthouse targets (≥90)
  - Core Web Vitals (LCP <2.5s, CLS <0.1, INP <200ms)
  - Image optimization
  - Code splitting
  - Caching strategy
- [ ] Load testing
  - 100 concurrent users
  - Search performance
  - Map performance
  - Graph performance
- [ ] E2E test completeness
  - User flow 1: Search & view profile
  - User flow 2: Create entity & publish
  - User flow 3: Import CSV
  - User flow 4: View graph
- [ ] Documentation
  - Deployment guide
  - Backup/restore procedure
  - Platform export/import
  - Admin runbook
  - API documentation (OpenAPI)
  - Architecture decision records (ADRs)
  - Assumptions file
- [ ] Platform portability
  - Docker image build
  - Migration scripts
  - Backup + restore test
  - Deployment checklist
  - New domain setup
- [ ] Demo data
  - Clear "DEMO / TEMSİLİ" markers
  - Realistic but not real
  - Multiple entities, relations, struggles

### Çıktılar

- Security report
- Accessibility audit report
- Performance report
- Load test results
- E2E test coverage (✓ all critical flows)
- Deployment guide
- Runbook
- Demo data

### Kabul Kriterleri

- Lighthouse Performance ≥ 90
- Lighthouse Accessibility ≥ 95
- WCAG 2.2 AA compliance
- No critical security issues
- E2E testler çalışır
- Backup + restore test başarılı
- New domain'te deployment başarılı
- README'de quick-start çalışır

---

## Geliştirme Sırasında

### Teknik Borç Yönetimi

- Cleanup task'ları en aza indir
- TODO yorumları neden ve koşul içersin
- Incomplete bileşenleri push etme
- Hata testlerini kap

### Testing Strategy

| Level | Tool | Target |
|-------|------|--------|
| Unit | Vitest | Domain logic, validation |
| Integration | Supertest | API endpoints |
| E2E | Playwright | User workflows |
| Accessibility | axe-core | WCAG 2.2 AA |

### Code Review

- Type safety (TypeScript strict)
- Permission checks
- SQL injection prevention
- XSS prevention
- Error handling
- Test coverage

### Deployment Process

```
dev branch → feature branch
    ↓
PR (review, CI pass)
    ↓
main branch
    ↓
CI: build, test, security scan
    ↓
staging deploy (e2e test)
    ↓
production (manual approval)
    ↓
smoke test
```

---

## Faz Sonrası Raporlama

Her faz sonunda:

```markdown
## Faz X — [İsim] Tamamlandı

### ✓ Tamamlanan Görevler
- [ ] Görev 1
- [ ] Görev 2

### Çıktılar
- [ ] Dosya 1: Açıklama
- [ ] Dosya 2: Açıklama

### Test Sonuçları
- Unit tests: 150 pass, 0 fail
- Integration tests: 50 pass, 0 fail
- E2E tests: X pass, 0 fail
- Coverage: X%

### Teknik Borç
- [ ] TODO: Açıklama (Koşul: ...)
- [ ] FIXME: Açıklama

### Bilinen Sorunlar
- Sorunu: Tetikleme koşulu, etki

### Sonraki Faz Girdileri
- Faz Y için hazırlık: ...

### Kapasite Tahmini
- Tahmini: X gün
- Gerçek: Y gün
- Varyans: % Z
```

---

## Zaman Tahmini

| Faz | Kapasite | Başlama | Bitiş |
|-----|----------|---------|-------|
| 0 | 5 gün | W1 | W1 |
| 1 | 10 gün | W2 | W3 |
| 2 | 8 gün | W4 | W4 |
| 3 | 5 gün | W5 | W5 |
| 4 | 10 gün | W6 | W7 |
| 5 | 10 gün | W8 | W9 |
| 6 | 10 gün | W10 | W11 |
| 7 | 10 gün | W12 | W13 |
| **Toplam** | **68 gün** | | |

Parallelization ve iterative feedback dikkate alınmazsa, 13 hafta (3+ ay).

---

## Başarı Ölçütleri (Final)

- ✓ Sistem lokal Docker Compose'da çalışır
- ✓ 1 komutla (`pnpm dev`) kurulur
- ✓ Lighthouse scores ≥ 90 (performance)
- ✓ WCAG 2.2 AA compliant
- ✓ LCP <2.5s, CLS <0.1, INP <200ms
- ✓ E2E testler tüm kritik akışları kapsar
- ✓ Kaynaksız yayımlanmış kayıt yok
- ✓ Platform taşıma paketi çalışır
- ✓ Backup + restore tested
- ✓ Audit log tüm yazma işlemlerini kaydeder
- ✓ Permission kontrolleri çalışır
- ✓ Demo data "DEMO / TEMSİLİ" olarak işaretli
- ✓ README + docs yeterli
