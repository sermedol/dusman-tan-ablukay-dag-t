# API Documentation

Düşmanı Tanı Platform REST API reference.

## Base URL

```
https://api.example.com/api/v1
```

## Authentication

JWT token'ı `Authorization` header'ında gönder:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." https://api.example.com/api/v1/entities
```

### Token Alma

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": "user-1",
      "email": "user@example.com",
      "roles": ["editor"]
    }
  }
}
```

## Response Format

Tüm response'lar standardize edilmiş:

**Başarılı:**

```json
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2024-08-07T10:30:00Z",
    "requestId": "req-abc123",
    "version": "1.0.0"
  }
}
```

**Hata:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "canonicalName": "Field is required"
    }
  },
  "meta": {
    "timestamp": "2024-08-07T10:30:00Z",
    "requestId": "req-abc123",
    "path": "/api/v1/entities"
  }
}
```

## Entities (Kuruluşlar)

### Kurulu Oluştur

```http
POST /entities
Content-Type: application/json
Authorization: Bearer token

{
  "canonicalName": "Örnek Kuruluş",
  "shortName": "ÖK",
  "description": "Kuruluş açıklaması",
  "type": "organization",
  "status": "active",
  "visibility": "public",
  "websiteUrl": "https://example.org"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "entity-1",
    "canonicalName": "Örnek Kuruluş",
    "slug": "ornek-kurulusaadi",
    "type": "organization",
    "status": "active",
    "createdAt": "2024-08-07T10:30:00Z"
  }
}
```

### Kuruluşları Listele

```http
GET /entities?skip=0&take=20&type=organization&status=active
Authorization: Bearer token
```

**Parameters:**

- `skip` (int): Kaçtane skip et (default: 0)
- `take` (int): Kaç tane al (default: 20, max: 100)
- `type` (string): Entity type filter
- `status` (string): Status filter (active, inactive, dissolved)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "entity-1",
      "canonicalName": "Örnek Kuruluş",
      "type": "organization",
      "status": "active",
      "createdAt": "2024-08-07T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "skip": 0,
    "take": 20
  }
}
```

### Kuruluş Detayı

```http
GET /entities/:id
Authorization: Bearer token
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "entity-1",
    "canonicalName": "Örnek Kuruluş",
    "slug": "ornek-kurulusaadi",
    "description": "Açıklama",
    "type": "organization",
    "status": "active",
    "visibility": "public",
    "verificationStatus": "verified",
    "websiteUrl": "https://example.org",
    "foundedAt": "2020-01-15T00:00:00Z",
    "createdBy": "user-1",
    "createdAt": "2024-08-07T10:30:00Z",
    "updatedAt": "2024-08-07T10:30:00Z"
  }
}
```

### Kuruluş Güncelle

```http
PATCH /entities/:id
Content-Type: application/json
Authorization: Bearer token

{
  "canonicalName": "Güncellenmiş Adı",
  "description": "Yeni açıklama"
}
```

**Response:** `200 OK`

### Kuruluş Sil

```http
DELETE /entities/:id
Authorization: Bearer token
```

**Response:** `204 No Content`

## Relations (İlişkiler)

### İlişki Oluştur

```http
POST /relations
Content-Type: application/json
Authorization: Bearer token

{
  "sourceEntityId": "entity-1",
  "targetEntityId": "entity-2",
  "relationTypeId": "type-ownership",
  "direction": "forward",
  "summary": "entity-1 entity-2'yi sahiplenmektedir",
  "description": "Detaylı açıklama",
  "confidenceLevel": "high",
  "status": "active",
  "verificationStatus": "unverified"
}
```

### İlişki Grafiği

```http
GET /relations/graph/:entityId?depth=2
Authorization: Bearer token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "entity-1",
        "label": "Örnek Kuruluş",
        "level": 0,
        "type": "organization"
      },
      {
        "id": "entity-2",
        "label": "İlişkili Kuruluş",
        "level": 1,
        "type": "organization"
      }
    ],
    "edges": [
      {
        "source": "entity-1",
        "target": "entity-2",
        "relationType": "ownership",
        "confidence": 0.95
      }
    ]
  },
  "meta": {
    "nodeCount": 25,
    "edgeCount": 18,
    "depth": 2,
    "maxDepth": 3
  }
}
```

### İlişkilerin İstatistikleri

```http
GET /relations/graph/stats
Authorization: Bearer token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "verified": 850,
    "pendingVerification": 400,
    "highConfidence": 750,
    "active": 1100
  }
}
```

## Timeline (Olaylar)

### Olay Oluştur

```http
POST /events
Content-Type: application/json
Authorization: Bearer token

{
  "entityId": "entity-1",
  "eventType": "protest",
  "title": "Protesto Eylemi",
  "description": "Kısa açıklama",
  "occurredAt": "2024-08-01T15:30:00Z",
  "endedAt": "2024-08-01T18:00:00Z",
  "status": "confirmed",
  "verificationStatus": "unverified",
  "source": "news-outlet-1"
}
```

### Kuruluş Zaman Çizelgesi

```http
GET /events/entity/:entityId?skip=0&take=20
Authorization: Bearer token
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "entityId": "entity-1",
      "eventType": "protest",
      "title": "Protesto Eylemi",
      "occurredAt": "2024-08-01T15:30:00Z",
      "status": "confirmed",
      "verificationStatus": "unverified"
    }
  ],
  "meta": {
    "total": 42,
    "skip": 0,
    "take": 20
  }
}
```

## Search (Arama)

### Full-Text Search

```http
GET /search/entities?q=kuruluş+adı&limit=10&offset=0
Authorization: Bearer token
```

**Parameters:**

- `q` (string): Arama sorgusu
- `limit` (int): Kaç sonuç dön (max: 100)
- `offset` (int): Skip count
- `filter` (string[]): Filter'lar (tip, durum, vb.)
- `sort` (string[]): Sıralama kuralları

**Response:**

```json
{
  "success": true,
  "data": {
    "hits": [
      {
        "id": "entity-1",
        "canonicalName": "Aranılan Kuruluş",
        "description": "Açıklama...",
        "type": "organization"
      }
    ],
    "estimatedTotalHits": 125,
    "processingTimeMs": 45
  }
}
```

## Geographic (Coğrafi)

### Yakındaki Kuruluşlar

```http
GET /geo/nearby?latitude=41.0&longitude=29.0&radiusKm=50&limit=20
Authorization: Bearer token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "entities": [
      {
        "id": "entity-1",
        "name": "Yakındaki Kuruluş",
        "latitude": 41.02,
        "longitude": 29.05,
        "distance": 5.2
      }
    ]
  }
}
```

### Kümeleme (Clustering)

```http
POST /geo/cluster
Content-Type: application/json
Authorization: Bearer token

{
  "bounds": {
    "north": 41.5,
    "south": 40.5,
    "east": 29.5,
    "west": 28.5
  },
  "gridSizeMeters": 5000
}
```

## Imports (İçe Aktarma)

### İçe Aktarma Oluştur

```http
POST /imports
Content-Type: application/json
Authorization: Bearer token

{
  "name": "Aylık İçe Aktarma",
  "sourceType": "csv",
  "sourceUrl": "https://example.org/data.csv",
  "description": "CSV dosyasından toplu içe aktarma",
  "config": {
    "delimiter": ",",
    "headerRow": 0,
    "mappings": {
      "Kurulus Adi": "canonicalName",
      "Turu": "type"
    }
  },
  "dataTypes": ["entities", "relations"],
  "verificationMode": "manual"
}
```

### İçe Aktarma Listesi

```http
GET /imports?status=pending&skip=0&take=20
Authorization: Bearer token
```

### İçe Aktarma Sonuçları

```http
GET /imports/:id/results
Authorization: Bearer token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "importId": "import-1",
    "sourceType": "csv",
    "status": "completed",
    "totalRecords": 250,
    "processedRecords": 245,
    "failedRecords": 5,
    "createdAt": "2024-08-01T10:00:00Z",
    "completedAt": "2024-08-01T10:15:30Z"
  }
}
```

### İçe Aktarmayı İşle

```http
POST /imports/:id/process
Authorization: Bearer token
```

**Response:** `202 Accepted` (async processing)

## Errors

### Error Codes

| Code | Anlamı | HTTP Status |
|------|--------|------------|
| `VALIDATION_ERROR` | Giriş validasyonu başarısız | 400 |
| `UNAUTHORIZED` | Kimlik doğrulama başarısız | 401 |
| `FORBIDDEN` | Yetki yok | 403 |
| `NOT_FOUND` | Kaynak bulunamadı | 404 |
| `CONFLICT` | Çakışma (slug, vb.) | 409 |
| `RATE_LIMIT` | Rate limit aşıldı | 429 |
| `INTERNAL_ERROR` | Sunucu hatası | 500 |

## Rate Limiting

API rate limiting: 1000 req/hour per IP/token

Headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1722947400
```

## Pagination

Tüm list endpoint'ler pagination destekler:

```bash
GET /entities?skip=20&take=20
```

## Filtering & Sorting

### Filter Syntax

```bash
GET /entities?filter[status]=active&filter[type]=organization
```

### Sort Syntax

```bash
GET /entities?sort=-createdAt,canonicalName
```

## Webhooks

Event'leri webhook olarak dinle:

```bash
POST /webhooks
Authorization: Bearer token

{
  "events": ["entity.created", "entity.updated", "relation.verified"],
  "url": "https://your-app.com/webhooks",
  "secret": "webhook-secret-key"
}
```

## Changelog

### v1.0.0 (2024-08-07)

- Initial API release
- Entity, Relation, Timeline endpoints
- Search & geographic queries
- Import pipeline
- Redis caching
- Meilisearch integration
- PostGIS support
