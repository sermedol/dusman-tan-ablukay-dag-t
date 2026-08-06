# Sistem Mimarisi

## Genel Yaklaşım

**Modüler Monolith** — İlk sürümde mikroservis mimarisi kurulmaz. Ancak modüllerin sınırları net tutulur; ilerde ayrıştırılabilecek yapıda geliştirilir.

## Üst Düzey Yapı

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Layer                              │
├───────────────────┬───────────────────┬───────────────────┬─────┤
│    apps/web       │    apps/admin     │   apps/worker    │REPL│
│   (Public Site)   │   (Admin Panel)   │  (Background)    │    │
└──────────┬────────┴─────────┬──────────┴─────────┬────────┴─────┘
           │                  │                    │
           └──────────────────┼────────────────────┘
                              ↓
           ┌──────────────────────────────────────┐
           │        REST API (NestJS)             │
           │        apps/api                      │
           ├──────────────────────────────────────┤
           │ Controllers, Application Services   │
           │ Permission Guards, Request Validation│
           └──────────────────────┬───────────────┘
                                  ↓
           ┌──────────────────────────────────────┐
           │    Domain & Business Logic Layer     │
           │     packages/domain                  │
           ├──────────────────────────────────────┤
           │ Entities, ValueObjects, Repositories│
           │ Permission Rules, Validation Rules  │
           └──────────────────────┬───────────────┘
                                  ↓
           ┌──────────────────────────────────────┐
           │     Infrastructure Layer             │
           │     packages/database                │
           │     packages/search                  │
           │     packages/graph                   │
           │     packages/storage                 │
           └──────────────────────┬───────────────┘
                                  ↓
           ┌──────────────────────────────────────┐
           │     External Services                │
           ├──────────────────────────────────────┤
           │ PostgreSQL  │  Redis   │  Meilisearch│
           │ Object Storage (S3)   │ Google Drive │
           └──────────────────────────────────────┘
```

## Teknoloji Seçimi ve Gerekçesi

### Frontend

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| Next.js 15+ | App Router | SSR, SSG, API routes, modern DX |
| React 18+ | Strict Mode | Type safety, best practices |
| TypeScript | strict: true | Compile-time safety |
| Tailwind CSS | Utility-first | Responsive, themeable |
| shadcn/ui | Component lib | Accessible, unstyled, Radix tabanlı |
| TanStack Query | Data fetching | Server state management, sync |
| Zustand | Client state | Minimal, TypeScript-first |
| Framer Motion | Animations | Smooth UX, performance |
| React Hook Form | Forms | Minimal, validation-ready |

### Harita & Ağ

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| MapLibre GL | Vector tiles | WebGL, gelişmiş katmanlar, vektör desteği |
| PostGIS | Spatial DB | Türkiye coğrafyası, clustering, queries |
| Sigma.js | Graph render | WebGL, binlerce node, performans |
| Supercluster | Clustering | Client-side, smooth zoom, fast |

**Neden GraphQL değil:** İlk sürümde karmaşık ve öngörülemeyen istemci sorguları beklenmez. REST yeterlidir. GraphQL, ikinci aşamada read-only katman olarak eklenebilir.

### Backend

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| NestJS | Framework | Modüler, middleware, providers, scalable |
| TypeScript | Language | Statik typing, compile-time checks |
| Prisma | ORM | Type-safe, migrations, relationships |
| Drizzle | ORM Alt. | Lightweight, SQL-first (alternatif) |

### Veri Tabanı

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| PostgreSQL | Ana DB | ACID, JSON, array, PostGIS, indexes |
| PostGIS | Spatial | Türkiye haritası, proximity, clustering |
| Redis | Cache/Queue | BullMQ jobs, session, cache |
| Meilisearch | Search | Türkçe, typo tolerance, fast |

**Graph DB (Neo4j):** İlk sürümde kullanılmaz. PostgreSQL recursive CTE ve views yeterlidir. Toplu traverse sorguları gerekirse ikinci aşamada Neo4j eklenir.

### Kuyruk & Async

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| Redis | Message Broker | Fast, in-memory, pub/sub |
| BullMQ | Job Queue | Reliable, delay, retry, monitoring |

Arka plan işleri:
- Arama indeksleme
- Dosya işleme (resize, OCR)
- CSV/XLSX import
- PDF önizleme
- Kaynak doğrulama
- Google Drive senkronizasyonu
- Yedekleme

### Dosya Saklama

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| S3-uyumlu storage | Object store | MinIO local, AWS/R2 production, portable |
| Signed URLs | Access | Zaman sınırlı, güvenli dosya paylaşımı |

Veritabanında binary depolama **hayır**.

### Kimlik Doğrulama

| Teknoloji | Seçim | Gerekçe |
|-----------|-------|--------|
| Auth.js | Auth framework | OIDC-ready, secure cookies, 2FA-ready |
| HttpOnly cookies | Session | CSRF-safe, XSS-safe |
| TOTP | 2FA | Standardı, Google Authenticator |
| RBAC | Authorization | Role-based access control |

JWT'leri localStorage'a yazma **hayır**.

## Paket Yapısı (Monorepo)

```
umut-sen-platform/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx (Ana sayfa)
│   │   │   │   ├── explore/
│   │   │   │   ├── entity/[slug]/
│   │   │   │   ├── network/
│   │   │   │   ├── struggles/
│   │   │   │   └── ...
│   │   │   └── layout.tsx
│   │   └── public/
│   ├── admin/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── entities/
│   │   │   │   ├── relations/
│   │   │   │   ├── sources/
│   │   │   │   ├── verification/
│   │   │   │   ├── import/
│   │   │   │   ├── users/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   └── public/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── entities/
│   │   │   │   ├── relations/
│   │   │   │   ├── sources/
│   │   │   │   ├── verification/
│   │   │   │   ├── search/
│   │   │   │   ├── map/
│   │   │   │   ├── graph/
│   │   │   │   ├── import/
│   │   │   │   ├── struggles/
│   │   │   │   ├── files/
│   │   │   │   └── health/
│   │   │   └── shared/
│   │   └── test/
│   └── worker/
│       ├── src/
│       │   ├── main.ts
│       │   ├── workers/
│       │   │   ├── search-indexer.ts
│       │   │   ├── file-processor.ts
│       │   │   ├── import-processor.ts
│       │   │   ├── drive-sync.ts
│       │   │   └── ...
│       │   └── utils/
│       └── test/
│
├── packages/
│   ├── ui/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   ├── maps/
│   │   │   └── ...
│   │   ├── styles/
│   │   └── index.ts
│   ├── database/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── migrations/
│   │   │   ├── seed.ts
│   │   │   └── client.ts
│   │   └── lib/
│   ├── auth/
│   │   ├── src/
│   │   │   ├── session.ts
│   │   │   ├── permissions.ts
│   │   │   └── guards.ts
│   │   └── lib/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── api.types.ts
│   │   │   ├── domain.types.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── search/
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── indexing.ts
│   │   │   └── normalization.ts
│   │   └── lib/
│   ├── graph/
│   │   ├── src/
│   │   │   ├── queries.ts
│   │   │   ├── traversal.ts
│   │   │   └── path-finding.ts
│   │   └── lib/
│   ├── maps/
│   │   ├── src/
│   │   │   ├── providers.ts
│   │   │   └── clustering.ts
│   │   └── lib/
│   ├── logger/
│   │   ├── src/
│   │   │   └── logger.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── src/
│   │   │   └── config.ts
│   │   └── index.ts
│   └── testing/
│       ├── src/
│       │   ├── test-db.ts
│       │   ├── mocks/
│       │   └── fixtures/
│       └── index.ts
│
├── docs/
│   ├── product-scope.md
│   ├── architecture.md (bu dosya)
│   ├── data-model.md
│   ├── navigation.md
│   ├── publication-workflow.md
│   ├── permissions.md
│   ├── design-system.md
│   ├── implementation-plan.md
│   └── adr/ (Architecture Decision Records)
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.admin
│   │   └── Dockerfile.worker
│   └── compose/
│       └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── ...
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Katmanlar (Layering)

Cada uygulamada:

```
HTTP Layer (Controller)
    ↓
Application/Use Case Layer (Service)
    ↓
Domain Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Infrastructure Layer (ORM, DB)
```

**Kural:** Domain katmanında veritabanı / HTTP bağımlılığı olmaz.

## Modüller (Backend)

Temel modüller:

- **AuthModule** — Giriş, session, 2FA
- **UsersModule** — Profil, ayarlar
- **RolesModule** — RBAC
- **EntitiesModule** — Varlık CRUD
- **EntityTypesModule** — Tür taksonomisi
- **RelationsModule** — İlişki CRUD
- **RelationTypesModule** — İlişki türü taksonomisi
- **SourcesModule** — Kaynak yönetimi
- **FilesModule** — Dosya yükleme ve depolama
- **VerificationModule** — Doğrulama akışı
- **PublishingModule** — Yayın kontrol
- **RevisionModule** — Sürüm geçmişi
- **AuditModule** — Denetim günlüğü
- **SearchModule** — Arama indeksleme
- **MapModule** — Harita API
- **GraphModule** — İlişki ağı API
- **StrugglesModule** — Mücadele yönetimi
- **DocumentsModule** — Belge katalogluğu
- **ImportsModule** — CSV/XLSX/Drive import
- **ExportsModule** — Veri dışa aktarma
- **TaxonomyModule** — Tasnif yönetimi
- **NotificationsModule** — Bildirimler
- **SystemModule** — Config, health
- **HealthModule** — Liveness, readiness

## Veri Akışı

```
Araştırmacı
    ↓
Admin Panel / Form → Request → API
    ↓
Validation Guard
    ↓
Permission Guard
    ↓
Application Service
    ↓
Domain Layer (Business rules, Relation validation)
    ↓
Repository (Prisma)
    ↓
PostgreSQL
    ↓
Trigger/Event
    ↓
BullMQ Job Queue
    ↓
Search Indexer, File Processor, Notifications
    ↓
Meilisearch, Object Storage, Email/WebSocket
```

## Önemli Kararlar

1. **PostgreSQL recursive CTE** — İlk sürümde graph DB gerekli değil
2. **REST first** — GraphQL ikinci aşamada read-only
3. **Domain-driven design** — Entities, ValueObjects, Aggregates
4. **Event sourcing değil** — Revision table + audit log yeterli
5. **Modüler monolith** — Şimdi tightly coupled, gelecekte loosely coupled
6. **S3-uyumlu storage** — Vendor lock-in yok
7. **Arama indeks yeniden oluşturulabilir** — Kaynağı PostgreSQL
8. **Yedekleme seperate stores** — Multiple providers

## Deployment Ortamları

- **local** — Docker Compose
- **development** — Kubernetes-ready (optional)
- **staging** — Full production replica
- **production** — Yönetilen container + RDS-like options
- **disaster-recovery** — Bağımsız sağlayıcı

## Scalability Düşüncesi

- **Horizontal:** Stateless API instances
- **Vertical:** Database instance upgrades
- **Caching:** Redis, CDN, HTTP cache headers
- **Async:** BullMQ workers
- **Search:** Meilisearch replication
- **Files:** Object storage CDN

İlk sürümde deniz hayvanı değil, solid foundation odaklı.
