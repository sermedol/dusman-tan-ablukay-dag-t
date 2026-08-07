# Google Drive / Sheets Research Data Pipeline

This document describes how the platform's research data flows from Google
Drive/Sheets into PostgreSQL, and how to operate, extend, and troubleshoot
that pipeline.

## Status of this document

The pipeline described here is implemented and tested against a **fake**
Google Sheets client (`apps/api/src/modules/data-sources/__tests__/fake-google-sheets-client.ts`)
that mirrors the real Yıldızlar SSS spreadsheet's tab structure. It has
**not** been run against the real Google Sheets, because the environment
this was built in has no Google service-account credentials and no network
path to Google's APIs. The column names assumed for each tab (below) are a
best-effort reading of the integration request's own field lists (exact for
`MASTER_HOLDINGS` and `SOURCES`, inferred-but-consistent for the rest) - they
have not been checked against the real `IMPORT_MAPPING`/`DATA_DICTIONARY`
tabs. If those differ, update `apps/api/src/modules/data-sources/validation/sheet-schemas.ts`
to match; nothing else in the pipeline needs to change.

## 1. Architecture

```
Google Drive / Google Sheets
        │  (read-only, service account)
        ▼
GoogleSheetsService  (googleapis, batch reads, retry/backoff)
        │
        ▼
MasterRegistryService          HoldingSyncService
  reads MASTER_HOLDINGS  ──▶     reads a holding's own tabs in
  upserts HoldingRegistry        dependency order, validates each
  rows (discovery only)          row (Zod), resolves external ID
                                 references, upserts into the
                                 publication tables, tracks
                                 provenance/change-detection via
                                 RecordOrigin, records every row's
                                 outcome in ImportBatch/ImportRow
        │
        ▼
PostgreSQL (Entity, Relation, Source, Struggle, StruggleActor/Demand/
Action, TimelineEvent, Location, EntityAlias, *SourceEvidence, ...)
        │
        ▼
Public API (/api/v1/public/*)  →  Public website, map, graph, search
```

Key design points:

- **Master Registry drives discovery.** No holding's spreadsheet ID is
  hardcoded anywhere in the backend. Adding a row to `MASTER_HOLDINGS` with
  `sync_enabled = EVET` and a `spreadsheet_id` is the only way a new
  holding's data source becomes visible to the system.
- **Read-only, one direction.** The pipeline never writes back to Google
  Sheets. `POST` endpoints only ever move data Sheets → Postgres.
- **Sync never auto-publishes.** Every entity/relation/struggle created or
  updated by sync is written with `visibility: 'internal'`, regardless of
  what the sheet's own `visibility`/`status` columns say. Publication to
  `public` remains a separate, deliberate admin action outside this
  pipeline. A row that claims `visibility=public` without
  `verification_status=verified` is flagged with a warning (not silently
  dropped) so reviewers can see the sheet itself has a data-quality issue.
- **Historical relations are not overwritten.** `Relation` no longer has a
  strict `(source, target, type)` uniqueness constraint - the same pair of
  entities can have several relations of the same type across different
  `validFrom`/`validUntil` windows. Idempotency for sync-created relations
  is instead enforced by each relation's own unique `externalId`.
- **Nothing is ever hard-deleted by sync.** If a previously-synced entity or
  struggle disappears from the sheet, it is left untouched in the database
  and flagged `missing_from_source` in the sync result for a human to
  review. Hard delete is only ever a deliberate, separate admin action.
- **Mapping is declarative, not executable.** Column → field mapping lives
  in Zod schemas (`validation/sheet-schemas.ts`); nothing from the sheet is
  ever `eval`'d or executed as code.

## 2. Setting up Google credentials

1. In Google Cloud Console, create a service account and a JSON key for it.
2. Share the Master Registry spreadsheet, and every holding spreadsheet, with
   that service account's `client_email` (Viewer access is enough - the
   integration only ever reads).
3. Set the following environment variables (see `.env.example`):

   | Variable | Required | Meaning |
   |---|---|---|
   | `GOOGLE_DRIVE_ENABLED` | yes | Must be exactly `true` to turn the integration on at all. |
   | `GOOGLE_SERVICE_ACCOUNT_JSON` | yes | The service account key JSON, as a string (or base64-encoded). **Never commit a real value.** |
   | `GOOGLE_MASTER_SPREADSHEET_ID` | yes | Spreadsheet ID of the Master Registry. |
   | `GOOGLE_DRIVE_ROOT_FOLDER_ID` | no | Drive folder ID of the research pool root. Reserved for a future document browser; not read yet. |

4. Without these set, the app starts and runs completely normally - only the
   `/api/v1/data-sources/*` endpoints report `googleIntegrationEnabled: false`
   with a human-readable reason via `GET /api/v1/data-sources`, instead of
   crashing or hanging.

**Local development / CI without real credentials:** every sync entry point
(`MasterRegistryService.refresh()`, `HoldingSyncService.syncHolding()`)
accepts an explicit `sheetsClient` parameter that overrides the real
`GoogleSheetsService`. Use `FakeGoogleSheetsClient` (in
`__tests__/fake-google-sheets-client.ts`) to exercise the whole pipeline
against in-memory fixture data - this is exactly how the integration test
suite works.

## 3. Master Registry format (`MASTER_HOLDINGS` tab)

| Column | Notes |
|---|---|
| `holding_id` | Required. Stable external ID, e.g. `holding:yildizlar-sss`. |
| `holding_name` | Required. |
| `short_name` | |
| `drive_folder_url` | |
| `spreadsheet_url` | |
| `spreadsheet_id` | The holding's own spreadsheet ID - this is what gets read next. |
| `status` | Free text. |
| `research_status` | Free text. |
| `sync_enabled` | `EVET`/`true`/`1`/`yes`/`x` = enabled; anything else = disabled. |
| `sync_mode` | `manual` \| `scheduled` \| `manual_and_scheduled`. Only `manual` is actually actionable today - see §8. |
| `import_mode`, `template_version`, `data_owner`, `reviewer`, `notes` | Stored as-is on `HoldingRegistry`, not yet used to change sync behavior. |

Refreshing the registry (`POST /api/v1/data-sources/refresh-registry`) reads
this tab and upserts `HoldingRegistry` rows keyed on `holding_id`. It never
deletes a `HoldingRegistry` row that disappears from the tab.

## 4. Holding spreadsheet format

Each holding's own spreadsheet is expected to have some or all of these tabs
(all optional except `HOLDING`/`ENTITIES` if you want anything else to
resolve against them). Tabs are read in this order, because later tabs
reference external IDs introduced by earlier ones:

`HOLDING → ENTITIES → ALIASES → LOCATIONS → SOURCES → RELATIONS → STRUGGLES → STRUGGLE_ACTORS → STRUGGLE_DEMANDS → STRUGGLE_ACTIONS → EVENTS → EVIDENCE`

Every row-level Zod schema lives in
`apps/api/src/modules/data-sources/validation/sheet-schemas.ts`. Summary of
expected columns (✱ = required):

- **HOLDING**: `external_id`✱, `canonical_name`✱, `short_name`, `slug`,
  `description`, `summary`, `status`, `visibility`, `website_url`,
  `founded_at`. Becomes the holding's own `Entity` (type `holding`), and
  links `HoldingRegistry.entityId` to it.
- **ENTITIES**: same shape as HOLDING plus `entity_type`✱ (must match a seeded
  `EntityType.code` - see §6 to add new ones) and `closed_at`.
- **ALIASES**: `entity_external_id`✱, `alias`✱, `alias_type`
  (`former_name`\|`trade_name`\|`abbreviation`\|`common_name`\|`legal_name`\|`misspelling`),
  `valid_from`, `valid_until`, `language`, `source_external_id`.
- **LOCATIONS**: `external_id`✱, `name`✱, `location_type`, `country_code`,
  `province`, `district`, `neighborhood`, `address`, `latitude`, `longitude`,
  `accuracy_level`, `source_external_id`.
- **SOURCES**: `source_id`✱, `source_type`✱ (must match a seeded
  `SourceType.code`), `title`✱, `publisher`, `author`, `publication_date`,
  `accessed_at`, `original_url`, `archived_url`, `drive_file_id`,
  `reliability_level`, `verification_status`, `factual_role`,
  `political_language_allowed` - see §7 for how this last field is enforced.
- **RELATIONS**: `external_id`✱, `relation_type`✱ (must match a seeded
  `RelationType.code`), `source_external_id`✱, `target_external_id`✱,
  `direction`, `summary`, `description`, `status`, `visibility`,
  `verification_status`, `confidence_level`, `valid_from`, `valid_until`,
  `observed_at`.
- **STRUGGLES**: `external_id`✱, `title`✱, `type`✱ (one of the ten
  `StruggleType` enum values), `slug`, `description`, `summary`, `status`,
  `visibility`, `verification_status`, `start_date`, `end_date`,
  `location_external_id`, `location`, `latitude`, `longitude`,
  `participants`, `outcome`, `lessons`.
- **STRUGGLE_ACTORS** / **STRUGGLE_DEMANDS** / **STRUGGLE_ACTIONS**:
  `external_id`✱ (required on every row - see below), `struggle_external_id`✱,
  plus actor/demand/action-specific fields (`entity_external_id`, `role`,
  `side`; `demand`, `status`; `action_type`, `title`, `occurred_at`).
- **EVENTS**: `external_id`✱, `event_type`✱, `title`✱, `occurred_at`✱, and
  either `entity_external_id` or `struggle_external_id` (at least one
  required), plus `ended_at`, `status`, `verification_status`,
  `related_relation_external_id`.
- **EVIDENCE**: `parent_type`✱ (`entity`\|`relation`\|`struggle`),
  `parent_external_id`✱, `source_external_id`✱, `claim_field`,
  `evidence_type`, `excerpt`, `page_number`, `supports_from`,
  `supports_until`, `notes`.

`external_id` is required (not optional) on `STRUGGLE_ACTORS`,
`STRUGGLE_DEMANDS`, `STRUGGLE_ACTIONS`, and `EVENTS` specifically because
those tables have no other natural key to de-duplicate on across repeat
syncs - unlike aliases (unique on entity+alias+type) or evidence (unique on
parent+source).

## 5. Sync lifecycle

1. `POST /api/v1/data-sources/sync/:holdingId` (or `/preview/:holdingId` for
   a dry run) creates an `ImportBatch` row (`originType: google_drive`,
   `status: processing`).
2. Tabs are read in the dependency order above, in one batched
   `spreadsheets.values.batchGet` call.
3. Each row is parsed against its Zod schema. Invalid rows are recorded as
   `ImportRow.status = invalid` and skipped - not written anywhere.
4. Valid rows resolve their external ID references (e.g. a relation's
   `source_external_id`/`target_external_id`) via an in-run cache seeded by
   everything already created earlier in the *same* run, falling back to a
   database lookup. An unresolvable required reference rejects the row with
   `UNRESOLVED_ENTITY_REFERENCE` (or the struggle/source equivalent) - the
   row is never inserted with a dangling reference.
5. For rows with their own natural key, the existing record's stored content
   hash (kept on `RecordOrigin.contentHash`, keyed by
   `(resourceType, resourceId, originType='google_drive', originReference=externalId)`)
   is compared against a fresh hash of the normalized row. Unchanged rows are
   skipped without writing; changed rows are updated; new externalIds are
   created. Every write updates `RecordOrigin.lastSyncedAt`.
6. In `dryRun` mode, no database writes happen at all (new records aren't
   created; existing ones aren't touched) - only `create`/`update`/`unchanged`
   are *predicted* per row, which is enough to preview the shape of a sync
   before committing to it.
7. After all tabs are processed, any entity/struggle previously synced for
   this holding whose `externalId` was **not** seen in this run is flagged
   `missing_from_source` in the result. It is left completely untouched in
   the database.
8. The `ImportBatch` is finalized (`status: completed | preview_ready |
   failed`, row/valid/invalid/warning counts), and (for a real, non-dry-run
   sync) `HoldingRegistry.lastSyncAt`/`lastSyncStatus` are updated.

The full per-row detail (`sheetName`, `rowNumber`, `externalId`, `operation`,
`errors`, `warnings`) is both returned in the API response and persisted as
`ImportRow` rows, queryable via:

- `GET /api/v1/data-sources/imports/:id`
- `GET /api/v1/data-sources/imports/:id/rows?status=&skip=&take=`
- `GET /api/v1/data-sources/imports/:id/errors`

## 6. Adding a new holding

1. Add a row to the Master Registry's `MASTER_HOLDINGS` tab: `holding_id`,
   `holding_name`, `spreadsheet_id`, `sync_enabled = EVET`.
2. Share that holding's spreadsheet with the service account.
3. `POST /api/v1/data-sources/refresh-registry` (or click "Master
   Registry'yi Yenile" in the admin panel).
4. `POST /api/v1/data-sources/preview/:holdingId` to dry-run it first.
5. `POST /api/v1/data-sources/sync/:holdingId` to actually import it.

No backend code changes are required for any of this.

## 7. Adding a new source / entity type / relation type

`EntityType`, `RelationType`, and `SourceType` are lookup tables, not enums -
add a row via `packages/database/src/seed.ts` (or a future admin CRUD screen)
and re-run `pnpm --filter @umutsensen/database seed`. No migration needed.

`Struggle.type` **is** a hardcoded Prisma enum
(`packages/database/prisma/schema.prisma`). Adding a new struggle type does
require a migration; the ten seeded values were judged to already cover the
categories described in the integration request, so none were added in this
pass.

## 8. Political-language source policy

Editorial/political framing may only ever be attributed to sources on
`umutsen.org`, `komiteler.org`, or `e-komite.com`
(`apps/api/src/modules/data-sources/validation/political-source-policy.ts`).
A sheet row that sets `political_language_allowed = EVET` for a source on
any other domain is **not honored** - it's silently downgraded to `false`
and a warning is attached to that row's sync result. This check is
independent of whatever the sheet's own `SOURCE_POLICY` tab says, precisely
so a compromised or mistaken sheet row can't grant political-language status
to an untrusted source.

## 9. Known limitations / next steps

- **No live test against the real Yıldızlar SSS sheet.** See "Status of this
  document" above.
- **No real scheduler.** `HoldingRegistry.syncMode` supports `scheduled` and
  `manual_and_scheduled` values, but there is no queue/cron in this codebase
  (confirmed: no BullMQ, no `apps/worker`, everything today runs
  synchronously in the HTTP request). Wiring `scheduled` mode up would mean
  adding a real job scheduler - a genuine new piece of infrastructure, not
  something safely improvised in this pass.
- **Cross-tab forward references resolve one sync late.** `LOCATIONS` and
  `ALIASES` are read before `SOURCES` (matching the specified tab order), so
  a location or alias whose `source_external_id` is introduced for the first
  time in the very same sync will get a warning and a null source link; it
  resolves correctly on the *next* sync. This was a deliberate trade-off to
  respect the mandated tab order rather than re-ordering it.
- **`GOOGLE_DRIVE_ROOT_FOLDER_ID` / `Source.driveFileId` are schema-ready but
  not yet surfaced in any UI.** The field exists and is populated by sync;
  there's no "open this document in Drive" admin/public UI wired to it yet.
- **The pre-existing generic `imports` module (`/api/v1/imports/*`,
  CSV/Excel/ad-hoc-upload) was not touched.** It was already broken before
  this work (its repository's Prisma model is `null`) and serves a different
  purpose (one-off admin uploads) from the registry-driven sync described
  here. Repairing it is a separate, smaller task from this pipeline.
