# Teknik Varsayımlar ve Kısıtlamalar

## Varsayım: Verileri Örnekleme

Prompt üzerinde "gerçek kişi, şirket, kurum, ihale veya olay hakkında doğrulanmamış veri üretme" yasağı vardır.

**Varsayım:** Geliştirme aşamasındaki demo verileri tamamen hayali ve açıkça "DEMO / TEMSİLİ VERİ" işaretli olacak. Veri tabanı seed'inde:

- Holding isimleri: "Demo Holding A", "Demo Şirket B", etc.
- Kamu kurumları: "Demo Belediyesi", "Demo İçişleri Bakanlığı", etc.
- Gerçek adlarla hiçbir varlık olmayacak.
- Tüm demo ise, varlığa eklenen `metadata_json` alanında `"demo": true` flag'i konacak.

```json
{
  "demo": true,
  "template_version": "1.0",
  "created_for": "development"
}
```

## Varsayım: UI Tasarımı Referansı

Prompt "soft, modern, aşağı doğru kaydırılabilir ve nefes alan yapı" istiyor ama yalnızca açık bir referans verilmedi. Varsayım:

- **Soft beyaz arka plan:** #f9f8f6 veya #fafaf8
- **Koyu metin:** #1a1a1a veya #2d2d2d
- **Umut-Sen vurgusu:** Belirtilen kırmızı (#dc2626 veya #ef4444)
- **Kategori renkleri:** Pastel ama distinct
  - Holding: Kırmızı tonları
  - Şirket: Mavi tonları
  - Kamu: Yeşil tonları
  - Banka: Mor tonları
  - Sendika: Turuncu tonları
- **Tipografi:** System sans-serif (system-ui, -apple-system, Segoe UI, Roboto)
- **Boşluk:** Generous (16px, 24px, 32px gaps)
- **Radius:** Soft (8px, 12px)
- **Shadow:** Minimal, #00000008 - #00000012

## Varsayım: Türkçe Taş Işkı

Platformun hepsi türkçe olacak varsayımı yapıldı:
- UI metinleri: Türkçe
- API yanıtları: Türkçe hata mesajları
- Documentation: Türkçe + İngilizce (technical)

Gelecekte multi-language desteği eklenebilir ama ilk sürümde değil.

## Varsayım: PostgreSQL Local Development

Development ortamında PostgreSQL ayrı bir container'da çalışacak. Production ortamında managed database (AWS RDS, Azure Database, DigitalOcean Managed) kullanılabilir.

**Varsayım:** Connection string ortam değişkeninden gelir:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/umutsensen_dev
```

Secret (password) `.env.local` dosyasında tutulur; repo'ya push edilmez.

## Varsayım: S3-Uyumlu Storage

Object storage sağlayıcısı abstractionsız kullanılmayacak. Adapter pattern uygulanacak:

```typescript
interface ObjectStorageProvider {
  upload(key: string, stream: ReadableStream, metadata?: {}): Promise<string>;
  download(key: string): Promise<ReadableStream>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

class S3Provider implements ObjectStorageProvider { }
class MinIOProvider implements ObjectStorageProvider { }
```

Development: MinIO (Docker)
Production: AWS S3, Cloudflare R2, veya DigitalOcean Spaces

## Varsayım: Arama Normalizasyonu

Meilisearch'e giden veri pre-processed edilir:

- NFKD Unicode normalizasyon
- İ/i, I/ı, Ş/ş, Ç/ç, Ğ/ğ, Ü/ü, Ö/ö dönüşümleri
- Lowercase
- Alias isimler index'e eklenir

Örnek:
```
Entity: "Limak Holding A.Ş."
Aliases: ["LIMAK", "LİMAK", "Limak Holding"]
→ Index: limak, holding, a.s., lmk
```

## Varsayım: Graph Database İhtiyacı (İleri)

İlk sürümde PostgreSQL recursive CTE yeterli. Neo4j veya benzer graph DB ikinci aşamada eklenebilir.

**Koşul:** Eğer ortalama query süresi > 500ms ve depth > 3 ise Neo4j entegrasyon değerlendir.

Adapter pattern:
```typescript
interface GraphRepository {
  findPath(source, target, maxDepth): Promise<Path>;
  traverse(root, depth, filters): Promise<Graph>;
  findCycles(): Promise<Cycle[]>;
}

class PostgreSQLGraphRepository implements GraphRepository { }
class Neo4jGraphRepository implements GraphRepository { }
```

## Varsayım: WebGL Graph Rendering

Sigma.js seçildi çünkü:
- 1000+ node render etme kapasitesi
- WebGL performansı
- React integration
- Açık kaynak

React Flow alternatif değil (canvas-based, daha simpe, performans kısıtlı).

## Varsayım: Email Servisi (İleri)

Bildirimler şu an admin paneli ve in-app notification olarak düşünülüyor.

Email gönderme (doğrulama, bildirim) NestJS MailerModule + nodemailer/SendGrid ile yapılabilir fakat ilk sürümde zorunlu değil.

```
TODOs: Email notifications (koşul: bildirim sistemi 50+ kullanıcı)
```

## Varsayım: OpenAPI Dokumentasyonu

NestJS @nestjs/swagger modülü ile otomatik OpenAPI 3.1 üretilir. Ön kapı:

```
GET /api/v1/openapi.json
GET /api/v1/docs (Swagger UI)
```

## Varsayım: Authentication Provider Esnekliği

Auth.js (NextAuth.js) seçildi ama başka provider'ler (Auth0, Clerk) de uyumlu tutulacak.

```typescript
import { auth } from "@/lib/auth"
// Provider-agnostic session API
```

Deployment'da `AUTH_SECRET`, `AUTH_URL` ortam değişkenleriyle konfigüre edilir.

## Varsayım: Zaman Dilimi

Tüm timestamp'ler UTC'de tutulur. Frontend'de kullanıcının local timezone'u JavaScript'le render'lanır.

```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

## Varsayım: Yedekleme Periyodisi

- PostgreSQL: Günlük full, saatlik incremental WAL
- Object storage: Versioning enabled
- Search index: Yeniden üretilir (PostgreSQL'den)

RTO (Recovery Time Objective): 4 saat
RPO (Recovery Point Objective): 1 saat

## Varsayım: Rate Limiting Değerleri

```
Authenticated API: 100 req/min per user
Unauthenticated API: 10 req/min per IP
Login endpoint: 5 req/min per email
File upload: 5GB/day per user, 50MB/file
Search: 50 req/min per user
Map queries: 100 req/min per user
```

Cluster mode (Redis Sentinel) kullanılırsa dış rate limiter (e.g., nginx) tercih edilir.

## Varsayım: CORS Policy

```
Allowed origins:
- http://localhost:3000 (dev)
- https://dusmani-tani.org (prod)
- https://admin.dusmani-tani.org (prod admin)
Allowed methods: GET, POST, PATCH, DELETE, OPTIONS
Allowed headers: Content-Type, Authorization, X-CSRF-Token
Credentials: include (HttpOnly cookies)
```

## Varsayım: CSV/XLSX İçe Aktarma Süreci

Import'u yalnız Verifier+ yapabilir. Researcher taslak oluşturabilir ama yayımlanamaz.

Workflow:
```
Researcher: Upload Excel
    ↓ (arka planda preview)
Admin/Verifier: Dryrun sonucu inceler
    ↓
Verifier: Onay (import starts)
    ↓ (Worker job)
Kayıtlar taslak olarak oluşturulur
    ↓
Verifier: Yayın kontrolü
    ↓
Publish
```

## Varsayım: Mücadele Varlık Türü

"Struggle" (mücadele) ayrı bir entity type'dır:

```sql
INSERT INTO entity_types (code, name) VALUES
('worker_resistance', 'İşçi Direnişi'),
('strike', 'Grev'),
('protest', 'Protesto'),
('ecological_struggle', 'Ekoloji Mücadelesi'),
('workplace_death', 'İş Cinayeti');
```

İlişkiler ile işletme, sendika, kamu kurumu ile bağlanır:
```
Worker Resistance → resistedAgainst → Company
Worker Resistance → supportedBy → Union
Worker Resistance → relatedTo → Court Case
```

## Varsayım: Görünürlük Seviyeleri

- **public** — Herkese açık (authenticated değil gerekli)
- **internal** — Sadece authenticated users
- **private** — Sadece owner + super_admin

Published varlıklar `public` veya `internal` olmalıdır.

Draft/taslak `private` olabilir.

## Varsayım: Eski İsimleri Versiyon Tutması

Entity alias'ları sadece yazı formunda tutulur, veritabanında ayrı tablo. Entity kendisinin `canonical_name` değişmez (yeni başlangıç tarihi veya yeni entity).

Örnek:
```
Entity: Limak Holding (canonical_name)
Aliases:
  - Limak İnşaat (former_name, valid_until: 2010-01-01)
  - LIMAK (abbreviation)
  - Limak Harita Turizm (trade_name)
```

## Varsayım: Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Tailwind CSS defaults.

Mobile-first: base → sm → md → lg

## Varsayım: Drag & Drop Graph Editing (Admin)

Admin panelinde küçük React Flow instance olabilir. Public graph düzenlenemez.

## Varsayım: Taksonomil İçerik

Dinamik kategoriler (sector, outcome, demand) admin panelinden yönetilir. Ama temel ilişki türleri hardcoded başlar.

Taksonomiler JSONB veya ayrı tablo? → Ayrı tablo (queryability).

## Varsayım: Notification Strategy (İleri)

User → follows Entity/Relation → Email when published

İlk sürümde in-app notification'ı yok. Admin panel socket abone kullanabilir ama public site değil.

## Varsayım: Gelecek Şu An İçin Kapsanmayan

- [ ] Real-time collaboration (Google Docs style)
- [ ] Comment threads on entities
- [ ] Activity feed
- [ ] User profile pages (public)
- [ ] Entity merge workflow
- [ ] Advanced graph analytics
- [ ] AI-powered tagging
- [ ] GraphQL API
- [ ] Mobile native apps
- [ ] Blockchain/audit trail on-chain

Bu özellikler MVP'den sonra eklenebilir.

## Varsayım: Hukuki ve Gizlilik

- Kullanıcı IP'leri hashed tutulur
- Bir kullanıcının hesabı silinirse, audit_events'te actor_id anonymized olur
- Public data kapsamında GDPR compliance değerlendirilir (TR veri koruma)
- Demo veri real kişiler/kuruluşları içermez

## Varsayım: Batch Operations

Toplu silme, toplu etiketleme, toplu yayın admin panelinde yapılabilir ama her işlem audit log'da kaydedilir.

```
Admin → Select 10 entities → Publish All → 10 audit events
```
