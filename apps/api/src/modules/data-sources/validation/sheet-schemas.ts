import { z } from 'zod';

/**
 * Column-name assumptions.
 *
 * These schemas encode the column names described in the integration
 * request (MASTER_HOLDINGS, SOURCES) and reasonable, consistent snake_case
 * equivalents for the remaining tabs (ENTITIES, RELATIONS, STRUGGLES, ...).
 * They have NOT been verified against the live Yıldızlar SSS spreadsheet -
 * this sandbox has no network path to Google's APIs and no service-account
 * credentials were provided. Once the sheet's real IMPORT_MAPPING/
 * DATA_DICTIONARY tabs can be read (either by a human pasting their
 * contents, or by this code running somewhere with real Google access),
 * update the field names below to match exactly. The rest of the pipeline
 * (parsing, validation, external ID resolution, upsert, dry-run) does not
 * change - only these column names would.
 */

const dateString = z.string().optional();

// ---------------------------------------------------------------------------
// MASTER_HOLDINGS (Master Registry spreadsheet)
// ---------------------------------------------------------------------------
export const masterHoldingRowSchema = z.object({
  holding_id: z.string().min(1, 'holding_id is required'),
  holding_name: z.string().min(1, 'holding_name is required'),
  short_name: z.string().optional(),
  drive_folder_url: z.string().optional(),
  spreadsheet_url: z.string().optional(),
  spreadsheet_id: z.string().optional(),
  status: z.string().optional(),
  research_status: z.string().optional(),
  sync_enabled: z.string().optional(),
  sync_mode: z.enum(['manual', 'scheduled', 'manual_and_scheduled']).optional(),
  import_mode: z.string().optional(),
  template_version: z.string().optional(),
  data_owner: z.string().optional(),
  reviewer: z.string().optional(),
  notes: z.string().optional(),
});
export type MasterHoldingRow = z.infer<typeof masterHoldingRowSchema>;

// ---------------------------------------------------------------------------
// HOLDING (per-holding sheet's own summary row -> published as an Entity)
// ---------------------------------------------------------------------------
export const holdingRowSchema = z.object({
  external_id: z.string().min(1),
  canonical_name: z.string().min(1),
  short_name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  website_url: z.string().optional(),
  founded_at: dateString,
});
export type HoldingRow = z.infer<typeof holdingRowSchema>;

// ---------------------------------------------------------------------------
// ENTITIES
// ---------------------------------------------------------------------------
export const entityRowSchema = z.object({
  external_id: z.string().min(1),
  entity_type: z.string().min(1),
  canonical_name: z.string().min(1),
  slug: z.string().optional(),
  short_name: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  website_url: z.string().optional(),
  founded_at: dateString,
  closed_at: dateString,
});
export type EntityRow = z.infer<typeof entityRowSchema>;

// ---------------------------------------------------------------------------
// ALIASES
// ---------------------------------------------------------------------------
export const aliasRowSchema = z.object({
  external_id: z.string().optional(),
  entity_external_id: z.string().min(1),
  alias: z.string().min(1),
  alias_type: z
    .enum(['former_name', 'trade_name', 'abbreviation', 'common_name', 'legal_name', 'misspelling'])
    .default('common_name'),
  valid_from: dateString,
  valid_until: dateString,
  language: z.string().optional(),
  source_external_id: z.string().optional(),
});
export type AliasRow = z.infer<typeof aliasRowSchema>;

// ---------------------------------------------------------------------------
// LOCATIONS
// ---------------------------------------------------------------------------
export const locationRowSchema = z.object({
  external_id: z.string().min(1),
  name: z.string().min(1),
  location_type: z.enum(['exact', 'approximate', 'district', 'province', 'country', 'region']).default('approximate'),
  country_code: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  accuracy_level: z.enum(['exact', 'approximate', 'district', 'province', 'unknown']).default('unknown'),
  source_external_id: z.string().optional(),
});
export type LocationRow = z.infer<typeof locationRowSchema>;

// ---------------------------------------------------------------------------
// SOURCES
// ---------------------------------------------------------------------------
export const sourceRowSchema = z.object({
  source_id: z.string().min(1),
  source_type: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().optional(),
  author: z.string().optional(),
  publication_date: dateString,
  accessed_at: dateString,
  original_url: z.string().optional(),
  archived_url: z.string().optional(),
  drive_file_id: z.string().optional(),
  reliability_level: z.enum(['primary', 'secondary', 'tertiary', 'unreliable']).default('secondary'),
  verification_status: z
    .enum(['unverified', 'verified', 'needs_review', 'source_required', 'conflicting'])
    .default('unverified'),
  factual_role: z.string().optional(),
  political_language_allowed: z.string().optional(),
});
export type SourceRow = z.infer<typeof sourceRowSchema>;

// ---------------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------------
export const relationRowSchema = z.object({
  external_id: z.string().min(1),
  relation_type: z.string().min(1),
  source_external_id: z.string().min(1),
  target_external_id: z.string().min(1),
  direction: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  verification_status: z
    .enum(['unverified', 'verified', 'needs_review', 'source_required', 'conflicting'])
    .optional(),
  confidence_level: z.enum(['high', 'medium', 'low', 'unverified']).optional(),
  valid_from: dateString,
  valid_until: dateString,
  observed_at: dateString,
});
export type RelationRow = z.infer<typeof relationRowSchema>;

// ---------------------------------------------------------------------------
// STRUGGLES
// ---------------------------------------------------------------------------
export const struggleRowSchema = z.object({
  external_id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  type: z.enum([
    'worker_resistance',
    'union_pressure',
    'wage_theft',
    'workplace_death',
    'forced_expropriation',
    'mining_project',
    'energy_project',
    'ecological_battle',
    'land_struggle',
    'other',
  ]),
  status: z.enum(['active', 'completed', 'ongoing', 'historical']).default('active'),
  visibility: z.string().optional(),
  verification_status: z
    .enum(['unverified', 'verified', 'needs_review', 'source_required', 'conflicting'])
    .optional(),
  start_date: dateString,
  end_date: dateString,
  location_external_id: z.string().optional(),
  location: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  participants: z.string().optional(),
  outcome: z.string().optional(),
  lessons: z.string().optional(),
});
export type StruggleRow = z.infer<typeof struggleRowSchema>;

// ---------------------------------------------------------------------------
// STRUGGLE_ACTORS / STRUGGLE_DEMANDS / STRUGGLE_ACTIONS
// ---------------------------------------------------------------------------
// external_id is required (not optional) on every STRUGGLE_* / EVENTS row so
// re-syncing is always idempotent - there is no compound natural key to fall
// back on for these tables the way there is for e.g. aliases or evidence.
export const struggleActorRowSchema = z.object({
  external_id: z.string().min(1, 'external_id is required for idempotent sync'),
  struggle_external_id: z.string().min(1),
  entity_external_id: z.string().optional(),
  actor_name: z.string().optional(),
  role: z.string().optional(),
  side: z.string().optional(),
  notes: z.string().optional(),
});
export type StruggleActorRow = z.infer<typeof struggleActorRowSchema>;

export const struggleDemandRowSchema = z.object({
  external_id: z.string().min(1, 'external_id is required for idempotent sync'),
  struggle_external_id: z.string().min(1),
  demand: z.string().min(1),
  status: z.string().optional(),
  notes: z.string().optional(),
});
export type StruggleDemandRow = z.infer<typeof struggleDemandRowSchema>;

export const struggleActionRowSchema = z.object({
  external_id: z.string().min(1, 'external_id is required for idempotent sync'),
  struggle_external_id: z.string().min(1),
  action_type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  occurred_at: dateString,
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type StruggleActionRow = z.infer<typeof struggleActionRowSchema>;

// ---------------------------------------------------------------------------
// EVENTS (timeline)
// ---------------------------------------------------------------------------
export const eventRowSchema = z
  .object({
    external_id: z.string().min(1, 'external_id is required for idempotent sync'),
    entity_external_id: z.string().optional(),
    struggle_external_id: z.string().optional(),
    event_type: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    occurred_at: z.string().min(1, 'occurred_at is required'),
    ended_at: dateString,
    status: z.string().optional(),
    verification_status: z
      .enum(['unverified', 'verified', 'needs_review', 'source_required', 'conflicting'])
      .optional(),
    related_relation_external_id: z.string().optional(),
  })
  .refine((row) => Boolean(row.entity_external_id || row.struggle_external_id), {
    message: 'Event must reference either entity_external_id or struggle_external_id',
  });
export type EventRow = z.infer<typeof eventRowSchema>;

// ---------------------------------------------------------------------------
// EVIDENCE
// ---------------------------------------------------------------------------
export const evidenceRowSchema = z.object({
  external_id: z.string().optional(),
  parent_type: z.enum(['entity', 'relation', 'struggle']),
  parent_external_id: z.string().min(1),
  source_external_id: z.string().min(1),
  claim_field: z.string().optional(),
  evidence_type: z.string().optional(),
  excerpt: z.string().optional(),
  page_number: z.string().optional(),
  supports_from: dateString,
  supports_until: dateString,
  notes: z.string().optional(),
});
export type EvidenceRow = z.infer<typeof evidenceRowSchema>;
