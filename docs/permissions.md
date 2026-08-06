# Erişim Kontrol (RBAC)

## Roller

### 1. super_admin
Tüm sisteme erişim. Korunmalı işlemler.

### 2. admin
Kullanıcı yönetimi, sistem ayarları, toplu işlemler, yayın geri alma.

### 3. editor / verifier
Taslak inceleme, onay/reddet, ilişki düzeltme, çakışma çözme.

### 4. researcher
Taslak oluşturma, kaynak ekleme, değişiklik önerme.

### 5. viewer
Salt okunur erişim (ziyaretçi giriş).

## İzin Matrisi

| İzin | Viewer | Researcher | Verifier | Admin | Super Admin |
|------|--------|------------|----------|-------|------------|
| **Entity** | | | | | |
| view_published | ✓ | ✓ | ✓ | ✓ | ✓ |
| view_all_drafts | | ✓ | ✓ | ✓ | ✓ |
| create | | ✓ | ✓ | ✓ | ✓ |
| edit_own_draft | | ✓ | ✓ | ✓ | ✓ |
| edit_all_drafts | | | ✓ | ✓ | ✓ |
| submit | | ✓ | ✓ | ✓ | ✓ |
| verify | | | ✓ | ✓ | ✓ |
| publish | | | ✓ | ✓ | ✓ |
| unpublish | | | | ✓ | ✓ |
| archive | | | | ✓ | ✓ |
| **Relation** | | | | | |
| view_published | ✓ | ✓ | ✓ | ✓ | ✓ |
| create | | ✓ | ✓ | ✓ | ✓ |
| edit_own_draft | | ✓ | ✓ | ✓ | ✓ |
| verify | | | ✓ | ✓ | ✓ |
| publish | | | ✓ | ✓ | ✓ |
| **Source** | | | | | |
| view | ✓ | ✓ | ✓ | ✓ | ✓ |
| upload | | ✓ | ✓ | ✓ | ✓ |
| link_to_entity | | ✓ | ✓ | ✓ | ✓ |
| verify | | | ✓ | ✓ | ✓ |
| **File** | | | | | |
| view_public | ✓ | ✓ | ✓ | ✓ | ✓ |
| download_internal | | ✓ | ✓ | ✓ | ✓ |
| upload | | ✓ | ✓ | ✓ | ✓ |
| delete_own | | ✓ | ✓ | ✓ | ✓ |
| delete_any | | | | ✓ | ✓ |
| **Import** | | | | | |
| upload_file | | ✓ | ✓ | ✓ | ✓ |
| preview | | ✓ | ✓ | ✓ | ✓ |
| import | | | ✓ | ✓ | ✓ |
| **User Management** | | | | | |
| view_users | | | | ✓ | ✓ |
| create_user | | | | ✓ | ✓ |
| edit_user | | | | ✓ | ✓ |
| change_role | | | | ✓ | ✓ |
| delete_user | | | | | ✓ |
| **System** | | | | | |
| view_audit_log | | | ✓ | ✓ | ✓ |
| manage_taxonomy | | | | ✓ | ✓ |
| manage_settings | | | | ✓ | ✓ |
| trigger_backup | | | | ✓ | ✓ |
| view_health | | | | ✓ | ✓ |
| rebuild_search_index | | | | ✓ | ✓ |
| sync_google_drive | | | | ✓ | ✓ |

## İzin Kodu

Sistem şu izin kodlarını kullanır:

```
{resource}:{action}
```

Örnek:
- `entity:view_published`
- `entity:create`
- `entity:verify`
- `entity:publish`
- `relation:create`
- `source:upload`
- `file:download_internal`
- `import:import`
- `user:manage`
- `system:manage_settings`
- `audit:view_log`

## Authorization Kontrolü

### Backend Guard (NestJS)

```typescript
@UseGuards(JwtAuthGuard, PermissionGuard)
@Permissions('entity:create', 'entity:edit_own_draft')
async createEntity(@Req() req) {
  // only users with these permissions can call
}
```

### Resource Ownership

Bazı işlemler resource ownership'a dayanır:

```typescript
if (entity.created_by !== userId && !user.hasPermission('entity:edit_all_drafts')) {
  throw new ForbiddenException();
}
```

### Publish İş Akışı

```
Researcher: create → submit ✓
Verifier: review → verify → publish ✓
Admin: unpublish ✓ (if needed)
```

Bir kayıt yayımlandıktan sonra, researecher kendi taslağını değiştiremez.

## Görünürlük Kontrolleri

Her entity, relation, source, file:

- **public** — Herkese visible (authenticated veya not authenticated)
- **internal** — Yalnız authenticated users
- **private** — Yalnız owner ve admins

**Kural:** Yayımlanmış kayıtlar `public` veya `internal` olmalıdır.

## Veri Filtreleme

API responses'ta:

```typescript
// Viewer
const entities = entities.where(e => e.visibility === 'public' && e.published_at !== null);

// Researcher
const entities = entities.where(e => 
  (e.visibility === 'public' && e.published_at !== null) ||
  (e.created_by === userId && e.status !== 'archived')
);

// Verifier
const entities = entities.where(e => 
  (e.visibility === 'public' && e.published_at !== null) ||
  (e.visibility === 'internal' && authenticated) ||
  (user.canVerify && !e.archived)
);
```

## Denetim (Audit)

Tüm yazma işlemleri `audit_events` tablosuna kaydedilir:

- Kim yaptı (`actor_id`)
- Ne yaptı (`action`)
- Neye yaptı (`resource_type`, `resource_id`)
- Ne değişti (`before_json`, `after_json`)
- Ne zaman (`created_at`)

Sensitive alanlar (email, IP) hashed tutulur.

## API Düzeyinde Güvenlik

### Rate Limiting

```
/api/v1/* → 100 req/min per user (authenticated)
/api/v1/* → 10 req/min per IP (unauthenticated)
/api/v1/auth/login → 5 req/min per email
/api/v1/files/upload → 50MB per upload, 5GB per day per user
```

### CSRF Protection

```typescript
// All mutations require CSRF token in header
X-CSRF-Token: <token>
```

HttpOnly cookies otomatik CSRF token ekler.

### XSS Prevention

```typescript
// All user input sanitized
const sanitized = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
});
```

### SQL Injection Prevention

Prisma ORM parametrized queries kullanır.

### Secure Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## OAuth / OIDC (Gelecek)

Dış kurumlara erişim:

```
/api/v1/oauth/authorize
/api/v1/oauth/callback
/api/v1/oauth/revoke
```

Scope'lar:
- `search` — Arama
- `entity:read` — Varlık oku
- `entity:write` — Varlık yaz
- `relation:read` — İlişki oku
- `source:read` — Kaynak oku

## 2FA (Two-Factor Authentication)

### TOTP Flow

1. User login email/password
2. System generates QR code (TOTP secret)
3. User scans with Google Authenticator / Authy
4. System validates code
5. Session created

### Recovery Codes

Login başarısız olursa, user 10 recovery code alır. Her bir kullanım sonrası silinir.

## Session Management

```
Session lifetime: 7 days
Idle timeout: 1 day
Concurrent sessions: 3 per user (oldest expires)
```

User logout:
- Session token invalidated
- Cookie deleted
- Audit logged

## Admin Impersonation

Super admin başka bir user olarak login yapabilir:

```
POST /api/v1/admin/impersonate
{
  "userId": "..."
}
```

- Işlem audit logged
- Impersonation 1 saatlik
- Banner gösterilir
```

## Test Hesapları

Development ortamında:

```
researcher@demo.local / password123
verifier@demo.local / password123
admin@demo.local / password123
super_admin@demo.local / password123
```

Production'da test hesabı yoktur.
