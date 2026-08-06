# Veri Modeli

## Temel Tablolar

### users
Tüm sistem kullanıcıları.

```sql
id UUID PK
email VARCHAR UNIQUE NOT NULL
username VARCHAR UNIQUE NOT NULL
password_hash VARCHAR
full_name VARCHAR
avatar_url VARCHAR
role_id UUID FK roles
status ENUM (active, inactive, suspended)
two_factor_enabled BOOLEAN
two_factor_secret VARCHAR (encrypted)
last_login_at TIMESTAMP
created_by UUID FK users
updated_by UUID FK users
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now()
version INT DEFAULT 1 (optimistic locking)
```

### roles
Rol tanımları (super_admin, admin, editor, verifier, researcher, viewer).

```sql
id UUID PK
code VARCHAR UNIQUE NOT NULL (e.g., "super_admin")
name VARCHAR NOT NULL
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### entity_types
Varlık türleri (holding, company, person, public_institution, bank, union, vs.).

```sql
id UUID PK
code VARCHAR UNIQUE NOT NULL (e.g., "holding")
name VARCHAR NOT NULL
description TEXT
icon VARCHAR (icon name)
color_token VARCHAR (e.g., "primary", "secondary")
singular_name VARCHAR
plural_name VARCHAR
examples TEXT
visibility ENUM (public, internal)
is_searchable BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Başlangıç türleri:**
- holding, company, subsidiary, person
- public_institution, municipality, bank, financial_institution
- union, yellow_union, association, foundation, media_organization
- factory, mine, power_plant, port, warehouse, construction_site
- project, tender, license, permit, court_case, law
- official_gazette_decision, worker_resistance, strike, protest
- ecological_struggle, workplace_death, accident, report, publication
- political_party, international_institution

### entities
Temel varlık kaydı.

```sql
id UUID PK
entity_type_id UUID FK entity_types NOT NULL
canonical_name VARCHAR NOT NULL
slug VARCHAR UNIQUE NOT NULL (for URLs)
short_name VARCHAR
description TEXT
summary TEXT (one paragraph)
status ENUM (active, inactive, dissolved, defunct)
visibility ENUM (public, internal, draft)
verification_status ENUM (unverified, verified, needs_review)
primary_location_id UUID FK locations
founded_at DATE
closed_at DATE
active_from DATE
active_until DATE
website_url VARCHAR
logo_file_id UUID FK files
cover_file_id UUID FK files
metadata_json JSONB (rare custom fields)
published_revision_id UUID FK revisions
published_at TIMESTAMP
created_by UUID FK users NOT NULL
updated_by UUID FK users NOT NULL
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now()
version INT DEFAULT 1

UNIQUE (entity_type_id, canonical_name) -- no duplicates within type
INDEX (slug, visibility, status)
INDEX (entity_type_id, visibility, published_at)
```

### entity_aliases
Eski isimler, kısaltmalar, ticari adlar, yanlış yazılışlar.

```sql
id UUID PK
entity_id UUID FK entities NOT NULL
alias VARCHAR NOT NULL
alias_type ENUM (
  former_name,
  trade_name,
  abbreviation,
  common_name,
  legal_name,
  misspelling
) NOT NULL
valid_from DATE
valid_until DATE
language VARCHAR (e.g., "tr", "en")
source_id UUID FK sources
created_at TIMESTAMP
updated_at TIMESTAMP

INDEX (entity_id, alias_type)
INDEX (alias) -- for search
```

### locations
Coğrafi konumlar.

```sql
id UUID PK
name VARCHAR NOT NULL
location_type ENUM (
  exact,
  approximate,
  district,
  province,
  country,
  region
)
country_code VARCHAR (e.g., "TR")
province VARCHAR
district VARCHAR
neighborhood VARCHAR
address VARCHAR
latitude DECIMAL(10, 8)
longitude DECIMAL(11, 8)
geometry GEOMETRY(Point, 4326) -- PostGIS
accuracy_level ENUM (exact, approximate, district, province, unknown)
source_id UUID FK sources
created_at TIMESTAMP
updated_at TIMESTAMP

INDEX (entity_id) -- to find locations for entities
SPATIAL INDEX (geometry)
```

### relation_types
İlişki türü tanımları.

```sql
id UUID PK
code VARCHAR UNIQUE NOT NULL (e.g., "owns")
name VARCHAR NOT NULL (source → target metin)
inverse_name VARCHAR (target → source metin, e.g., "is_owned_by")
category VARCHAR NOT NULL (
  ownership, management, public_relations, finance,
  production_supply, struggle, document
)
description TEXT
is_directed BOOLEAN DEFAULT true
allow_multiple BOOLEAN DEFAULT true (aynı kaynak-hedef çiftine çoklu ilişki)
color_token VARCHAR (e.g., "primary")
line_style ENUM (solid, dashed, dotted)
icon VARCHAR
source_entity_type_rules JSONB (allowlist, e.g., ["holding", "company"])
target_entity_type_rules JSONB (allowlist, e.g., ["company", "subsidiary"])
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Başlangıç türleri:** Prompt Bölüm 6.5'e bakın.

### relations
Varlıklar arasındaki ilişkiler.

```sql
id UUID PK
relation_type_id UUID FK relation_types NOT NULL
source_entity_id UUID FK entities NOT NULL
target_entity_id UUID FK entities NOT NULL
direction VARCHAR (forward, backward, bidirectional)
summary VARCHAR (optional one-liner)
description TEXT
status ENUM (draft, active, inactive)
visibility ENUM (public, internal, private)
verification_status ENUM (unverified, verified, needs_review)
confidence_level ENUM (high, medium, low, unverified)
valid_from DATE
valid_until DATE
observed_at DATE (when the relation was observed/started)
published_revision_id UUID FK revisions
published_at TIMESTAMP
created_by UUID FK users NOT NULL
updated_by UUID FK users NOT NULL
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now()
version INT DEFAULT 1

CHECK (source_entity_id != target_entity_id) -- no self-relations
INDEX (source_entity_id, visibility, published_at)
INDEX (target_entity_id, visibility, published_at)
INDEX (relation_type_id, visibility)
```

### source_types
Kaynak türü kataloğu.

```sql
id UUID PK
code VARCHAR UNIQUE NOT NULL
name VARCHAR NOT NULL
description TEXT
created_at TIMESTAMP
```

Türler:
official_gazette, trade_registry, kap_disclosure, company_report,
public_tender_record, court_decision, municipal_decision,
parliamentary_record, union_statement, field_report, news_article,
academic_report, photograph, video, audio, social_media,
archive_copy, other

### sources
Belge ve kaynak kaynakları (PDF, haber, resmi kayıt, vs.).

```sql
id UUID PK
source_type_id UUID FK source_types NOT NULL
title VARCHAR NOT NULL
publisher VARCHAR
author VARCHAR
publication_date DATE
accessed_at DATE
original_url VARCHAR
archived_url VARCHAR
file_id UUID FK files
language VARCHAR (e.g., "tr", "en")
page_reference VARCHAR (e.g., "p. 23-25")
quote_excerpt TEXT
notes TEXT
reliability_level ENUM (primary, secondary, tertiary, unreliable)
verification_status ENUM (unverified, verified, disputed)
checksum VARCHAR (for duplicate detection)
metadata_json JSONB
created_by UUID FK users NOT NULL
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now()
version INT DEFAULT 1

INDEX (source_type_id, publication_date)
INDEX (checksum) -- duplicate detection
```

### entity_source_evidence
Varlık ve kaynak arasındaki kanıt bağlantısı.

```sql
id UUID PK
entity_id UUID FK entities NOT NULL
source_id UUID FK sources NOT NULL
evidence_type ENUM (
  supports_description,
  supports_location,
  supports_founded_date,
  supports_closure_date,
  supports_sector,
  supports_relationship,
  other
)
excerpt TEXT (quoted portion from source)
page_number INT
supports_from DATE (if relation is time-bound)
supports_until DATE
notes TEXT
created_at TIMESTAMP

UNIQUE (entity_id, source_id, evidence_type) -- avoid duplicates
INDEX (entity_id, evidence_type)
```

### relation_source_evidence
İlişki ve kaynak arasındaki kanıt bağlantısı.

```sql
id UUID PK
relation_id UUID FK relations NOT NULL
source_id UUID FK sources NOT NULL
excerpt TEXT
page_number INT
notes TEXT
created_at TIMESTAMP

UNIQUE (relation_id, source_id) -- one evidence per relation-source pair
INDEX (relation_id)
```

### files
Dosya metadata'sı (gerçek içerik S3'te).

```sql
id UUID PK
object_key VARCHAR UNIQUE NOT NULL (S3 path)
file_name VARCHAR NOT NULL
mime_type VARCHAR
size_bytes INT
checksum VARCHAR (SHA256)
uploaded_by UUID FK users NOT NULL
access_level ENUM (public, internal, private)
expiry_date TIMESTAMP (signed URL için)
created_at TIMESTAMP
updated_at TIMESTAMP

INDEX (uploaded_by, created_at)
INDEX (access_level)
```

### revisions
Her varlık veya ilişkinin immutable sürümleri.

```sql
id UUID PK
resource_type VARCHAR (entity, relation, source)
resource_id UUID NOT NULL
revision_number INT NOT NULL (1, 2, 3, ...)
snapshot_json JSONB (tam o anki veri)
change_summary VARCHAR
change_reason VARCHAR
created_by UUID FK users NOT NULL
created_at TIMESTAMP
reviewed_by UUID FK users
reviewed_at TIMESTAMP
review_status ENUM (pending, approved, rejected)

UNIQUE (resource_type, resource_id, revision_number)
INDEX (resource_id, resource_type)
INDEX (review_status, reviewed_at)
```

### audit_events
Tüm eylemler kaydedilir.

```sql
id UUID PK
actor_id UUID FK users NOT NULL
action VARCHAR NOT NULL (create, update, delete, publish, unpublish)
resource_type VARCHAR (entity, relation, source, user, role)
resource_id UUID
request_id VARCHAR (correlation ID)
ip_hash VARCHAR (hashed, privacy-preserving)
user_agent VARCHAR
before_json JSONB (previous state)
after_json JSONB (new state)
created_at TIMESTAMP DEFAULT now()

INDEX (actor_id, created_at)
INDEX (resource_type, resource_id)
INDEX (action, created_at)
```

## İçe Aktarma Tabloları

### import_batches
Bir Excel veya Drive dosyası import işleminin metadata'sı.

```sql
id UUID PK
origin_type ENUM (admin_upload, google_drive, api, manual)
origin_file_id VARCHAR (Google Drive file ID or upload ID)
drive_file_id VARCHAR (Google Drive file ID)
file_name VARCHAR
file_checksum VARCHAR (for duplicate detection)
template_type VARCHAR (entities, relations, sources, struggles)
template_version VARCHAR (e.g., "1.0")
uploaded_by UUID FK users
status ENUM (
  pending,
  processing,
  preview_ready,
  approved,
  importing,
  completed,
  failed
)
started_at TIMESTAMP
completed_at TIMESTAMP
row_count INT
valid_row_count INT
invalid_row_count INT
warning_count INT
error_message TEXT
created_at TIMESTAMP
updated_at TIMESTAMP

INDEX (origin_type, created_at)
INDEX (status)
```

### import_rows
Ham içe aktarılan satırlar.

```sql
id UUID PK
import_batch_id UUID FK import_batches NOT NULL
sheet_name VARCHAR
row_number INT
raw_json JSONB (exactly as from file)
normalized_json JSONB (after normalization)
status ENUM (
  pending,
  valid,
  has_warnings,
  invalid,
  duplicate,
  matched,
  imported
)
error_json JSONB (validation errors)
warning_json JSONB (non-critical issues)
matched_resource_id UUID (entity, relation, source ID found)
external_id VARCHAR (from import file)
created_at TIMESTAMP

INDEX (import_batch_id, status)
INDEX (external_id)
```

### record_origins
Her kaydın nereden geldiği izlenir.

```sql
id UUID PK
resource_type VARCHAR (entity, relation, source)
resource_id UUID NOT NULL
origin_type ENUM (admin_ui, excel_import, google_drive, api, other)
origin_reference VARCHAR (file ID, upload ID, API endpoint)
import_batch_id UUID FK import_batches
drive_file_id VARCHAR
sheet_name VARCHAR
row_number INT
first_imported_at TIMESTAMP
last_synced_at TIMESTAMP

UNIQUE (resource_type, resource_id, origin_type, origin_reference)
INDEX (resource_id)
```

## Arama ve Cache Tabloları

### search_index_state
Arama indeksi durumu (meta).

```sql
id UUID PK
index_name VARCHAR UNIQUE (e.g., "entities", "relations")
last_indexed_at TIMESTAMP
total_documents INT
last_sync_checkpoint VARCHAR (cursor)
is_healthy BOOLEAN
error_message TEXT
updated_at TIMESTAMP
```

## Entity Değişiklik Seçenekleri

Excel'den gelen veri sistemdeki veri ile çakışırsa:

```sql
conflict_resolutions
id UUID PK
resource_type VARCHAR
resource_id UUID
import_row_id UUID
conflict_type ENUM (duplicate_name, duplicate_key, field_mismatch)
resolution_choice ENUM (
  use_import,
  keep_existing,
  merge_fields,
  review
)
resolved_by UUID FK users
resolved_at TIMESTAMP
notes TEXT
```

## Mücadele (Struggles)

Özel bir "entity type" (struggle) ile temsil edilir. Ek tablo:

### struggle_details
Mücadele özgü alanlar.

```sql
id UUID PK
entity_id UUID FK entities (where entity_type_id = struggle)
struggle_type VARCHAR (strike, protest, resistance, ecological, vs.)
demands TEXT (comma-separated or JSON array)
action_types TEXT (JSON array: "strike", "blockade", "court_case", vs.)
status ENUM (ongoing, resolved, abandoned)
participants_count INT
duration_days INT
created_at TIMESTAMP
updated_at TIMESTAMP
```

Mücadeleler ilişkilendirilerek işletme, kamu kurumu, sendika ile bağlanır.

## Tasnif (Taxonomy)

Dinamik alan türleri.

```sql
taxonomy_categories
id UUID PK
code VARCHAR UNIQUE
name VARCHAR
parent_id UUID FK self
type VARCHAR (sector, outcome, demand, action_type, vs.)
created_at TIMESTAMP

taxonomy_values
id UUID PK
category_id UUID FK taxonomy_categories
value VARCHAR
label VARCHAR
description TEXT
sort_order INT
created_at TIMESTAMP
```

Entity ve ilişkilere tag olarak eklenir:

```sql
entity_tags
id UUID PK
entity_id UUID FK entities
taxonomy_value_id UUID FK taxonomy_values
created_at TIMESTAMP

UNIQUE (entity_id, taxonomy_value_id)
```

## Göz Önünde Bulundurulması Gereken Noktalar

1. **Temporal Queries:** `valid_from`, `valid_until` tarih aralıklarında sorgular için index
2. **Full-text Search:** PostgreSQL'in `tsvector` veya Meilisearch ayrı
3. **Materialized Views:** `entity_relation_count`, `entity_source_count` vs. performans için
4. **Recursive CTE:** N-level holding bağlantıları için
5. **Soft Deletes:** `deleted_at` koşullu alan; silme işlemi soft delete olabilir
6. **Versioning:** Optimistic locking ile `version` alanı

## Örnek Queries

### Tüm Limak Holdings'i ve bağlı şirketleri
```sql
WITH RECURSIVE chain AS (
  SELECT id, entity_type_id, canonical_name, 1 as depth
  FROM entities
  WHERE canonical_name ILIKE 'Limak' AND entity_type_id = (SELECT id FROM entity_types WHERE code = 'holding')
  
  UNION ALL
  
  SELECT e.id, e.entity_type_id, e.canonical_name, chain.depth + 1
  FROM entities e
  JOIN relations r ON r.target_entity_id = e.id
  JOIN relation_types rt ON r.relation_type_id = rt.id
  JOIN chain ON chain.id = r.source_entity_id
  WHERE rt.code = 'owns' AND chain.depth < 3
)
SELECT * FROM chain
ORDER BY depth, canonical_name;
```

### İşçi direnişi ve ilgili işverenler
```sql
SELECT e.*, r.relation_type_id, re.canonical_name as related_entity
FROM entities e
JOIN relations r ON e.id = r.source_entity_id OR e.id = r.target_entity_id
JOIN entities re ON (CASE WHEN e.id = r.source_entity_id THEN r.target_entity_id ELSE r.source_entity_id END) = re.id
WHERE e.entity_type_id = (SELECT id FROM entity_types WHERE code = 'worker_resistance')
AND e.published_at IS NOT NULL
AND e.visibility = 'public';
```

### Kaynaksız kayıtlar
```sql
SELECT e.id, e.canonical_name
FROM entities e
WHERE e.published_at IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM entity_source_evidence ese WHERE ese.entity_id = e.id
)
AND NOT EXISTS (
  SELECT 1 FROM relation_source_evidence rse
  JOIN relations r ON rse.relation_id = r.id
  WHERE r.source_entity_id = e.id OR r.target_entity_id = e.id
);
```
