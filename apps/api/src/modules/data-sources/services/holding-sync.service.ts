import { Injectable, Logger } from '@nestjs/common';
import type { ZodType, ZodTypeDef } from 'zod';

import { PrismaService } from '../../../shared/prisma/prisma.service';
import { resolvePoliticalLanguageAllowed } from '../validation/political-source-policy';
import {
  emptyToUndefined,
  parseBooleanish,
  parseDateish,
  parseNumberish,
  rowsFromTabValues,
  type RawSheetRow,
} from '../validation/sheet-row-transform';
import {
  aliasRowSchema,
  entityRowSchema,
  evidenceRowSchema,
  eventRowSchema,
  holdingRowSchema,
  locationRowSchema,
  relationRowSchema,
  sourceRowSchema,
  struggleActionRowSchema,
  struggleActorRowSchema,
  struggleDemandRowSchema,
  struggleRowSchema,
  type AliasRow,
  type EntityRow,
  type EvidenceRow,
  type EventRow,
  type HoldingRow,
  type LocationRow,
  type RelationRow,
  type SourceRow,
  type StruggleActionRow,
  type StruggleActorRow,
  type StruggleDemandRow,
  type StruggleRow,
} from '../validation/sheet-schemas';
import { contentHashOf } from './content-hash.util';
import { ExternalIdResolver } from './external-id-resolver';
import type { IGoogleSheetsClient } from './google-sheets-client.interface';
import { GoogleSheetsService } from './google-sheets.service';
import { RecordOriginTracker } from './record-origin-tracker';
import { slugify } from './slugify.util';
import {
  emptyCounts,
  RowRejectedError,
  type SyncCounts,
  type SyncResult,
  type SyncRowOperation,
  type SyncRowOutcome,
} from './sync-result.types';

/** Sheet tabs, in dependency order (per the integration spec). */
const TAB_ORDER = [
  'HOLDING',
  'ENTITIES',
  'ALIASES',
  'LOCATIONS',
  'SOURCES',
  'RELATIONS',
  'STRUGGLES',
  'STRUGGLE_ACTORS',
  'STRUGGLE_DEMANDS',
  'STRUGGLE_ACTIONS',
  'EVENTS',
  'EVIDENCE',
] as const;

interface SyncContext {
  holdingRegistryId: string;
  holdingExternalId: string;
  spreadsheetId: string;
  importBatchId: string;
  dryRun: boolean;
  userId: string;
  entityTypeByCode: Map<string, string>;
  relationTypeByCode: Map<string, string>;
  sourceTypeByCode: Map<string, string>;
  resolver: ExternalIdResolver;
  origins: RecordOriginTracker;
  counts: SyncCounts;
  rows: SyncRowOutcome[];
}

/**
 * Publication gate: a row that claims a public/published state without
 * verified research does not get rejected outright (sync never publishes
 * automatically anyway - see visibility handling below) but is flagged so
 * reviewers can see the sheet itself has a data-quality issue.
 */
function checkPublishGate(visibility: string | undefined, verificationStatus: string | undefined): string | undefined {
  const claimsPublic = (visibility ?? '').toLowerCase() === 'public';
  if (claimsPublic && verificationStatus !== 'verified') {
    return `Row requests visibility=public but verification_status is "${verificationStatus ?? 'unset'}", not "verified".`;
  }
  return undefined;
}

@Injectable()
export class HoldingSyncService {
  private readonly logger = new Logger('HoldingSyncService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleSheets: GoogleSheetsService
  ) {}

  async syncHolding(params: {
    holdingRegistry: { id: string; holdingId: string; spreadsheetId: string | null };
    userId: string;
    dryRun: boolean;
    sheetsClient?: IGoogleSheetsClient;
  }): Promise<SyncResult> {
    const { holdingRegistry, userId, dryRun } = params;
    const sheetsClient = params.sheetsClient ?? this.googleSheets;

    if (!holdingRegistry.spreadsheetId) {
      throw new RowRejectedError('MISSING_SPREADSHEET_ID', `Holding ${holdingRegistry.holdingId} has no spreadsheet_id configured.`);
    }
    const spreadsheetId = holdingRegistry.spreadsheetId;
    const startedAt = new Date();

    const [entityTypes, relationTypes, sourceTypes] = await Promise.all([
      this.prisma.entityType.findMany({ select: { id: true, code: true } }),
      this.prisma.relationType.findMany({ select: { id: true, code: true } }),
      this.prisma.sourceType.findMany({ select: { id: true, code: true } }),
    ]);

    const importBatch = await this.prisma.importBatch.create({
      data: {
        originType: 'google_drive',
        spreadsheetId,
        holdingRegistryId: holdingRegistry.id,
        fileName: `${holdingRegistry.holdingId} (${spreadsheetId})`,
        templateType: 'holding_sync',
        dryRun,
        triggeredBy: `user:${userId}`,
        uploadedBy: userId,
        status: 'processing',
        startedAt,
      },
    });

    const ctx: SyncContext = {
      holdingRegistryId: holdingRegistry.id,
      holdingExternalId: holdingRegistry.holdingId,
      spreadsheetId,
      importBatchId: importBatch.id,
      dryRun,
      userId,
      entityTypeByCode: new Map(entityTypes.map((e) => [e.code, e.id])),
      relationTypeByCode: new Map(relationTypes.map((r) => [r.code, r.id])),
      sourceTypeByCode: new Map(sourceTypes.map((s) => [s.code, s.id])),
      resolver: new ExternalIdResolver(this.prisma),
      origins: new RecordOriginTracker(this.prisma, importBatch.id),
      counts: emptyCounts(),
      rows: [],
    };

    let tabsFound: string[] = [];
    let tabsMissing: string[] = [];

    try {
      const availableTabs = await sheetsClient.listTabNames(spreadsheetId);
      tabsFound = TAB_ORDER.filter((name) => availableTabs.includes(name));
      tabsMissing = TAB_ORDER.filter((name) => !availableTabs.includes(name));

      const tabValues = await sheetsClient.batchGetTabValues(spreadsheetId, [...tabsFound]);
      const valuesByTab = new Map(tabValues.map((t) => [t.sheetName, t]));

      const rowsFor = (sheetName: string): RawSheetRow[] => {
        const tab = valuesByTab.get(sheetName);
        return tab ? rowsFromTabValues(tab) : [];
      };

      await this.processTab<HoldingRow>(ctx, 'HOLDING', rowsFor('HOLDING'), holdingRowSchema, (row, rowNumber) =>
        this.handleHoldingRow(ctx, row, rowNumber)
      );
      await this.processTab<EntityRow>(ctx, 'ENTITIES', rowsFor('ENTITIES'), entityRowSchema, (row, rowNumber) =>
        this.handleEntityRow(ctx, row, rowNumber)
      );
      await this.processTab<AliasRow>(ctx, 'ALIASES', rowsFor('ALIASES'), aliasRowSchema, (row) =>
        this.handleAliasRow(ctx, row)
      );
      await this.processTab<LocationRow>(ctx, 'LOCATIONS', rowsFor('LOCATIONS'), locationRowSchema, (row) =>
        this.handleLocationRow(ctx, row)
      );
      await this.processTab<SourceRow>(ctx, 'SOURCES', rowsFor('SOURCES'), sourceRowSchema, (row) =>
        this.handleSourceRow(ctx, row)
      );
      await this.processTab<RelationRow>(ctx, 'RELATIONS', rowsFor('RELATIONS'), relationRowSchema, (row) =>
        this.handleRelationRow(ctx, row)
      );
      await this.processTab<StruggleRow>(ctx, 'STRUGGLES', rowsFor('STRUGGLES'), struggleRowSchema, (row) =>
        this.handleStruggleRow(ctx, row)
      );
      await this.processTab<StruggleActorRow>(
        ctx,
        'STRUGGLE_ACTORS',
        rowsFor('STRUGGLE_ACTORS'),
        struggleActorRowSchema,
        (row) => this.handleStruggleActorRow(ctx, row)
      );
      await this.processTab<StruggleDemandRow>(
        ctx,
        'STRUGGLE_DEMANDS',
        rowsFor('STRUGGLE_DEMANDS'),
        struggleDemandRowSchema,
        (row) => this.handleStruggleDemandRow(ctx, row)
      );
      await this.processTab<StruggleActionRow>(
        ctx,
        'STRUGGLE_ACTIONS',
        rowsFor('STRUGGLE_ACTIONS'),
        struggleActionRowSchema,
        (row) => this.handleStruggleActionRow(ctx, row)
      );
      await this.processTab<EventRow>(ctx, 'EVENTS', rowsFor('EVENTS'), eventRowSchema, (row) =>
        this.handleEventRow(ctx, row)
      );
      await this.processTab<EvidenceRow>(ctx, 'EVIDENCE', rowsFor('EVIDENCE'), evidenceRowSchema, (row) =>
        this.handleEvidenceRow(ctx, row)
      );

      await this.detectMissingFromSource(ctx, 'entity');
      await this.detectMissingFromSource(ctx, 'struggle');

      const completedAt = new Date();
      const status = dryRun ? 'preview_ready' : 'completed';

      await this.prisma.importBatch.update({
        where: { id: importBatch.id },
        data: {
          status,
          completedAt,
          rowCount: ctx.counts.rowCount,
          validRowCount: ctx.counts.rowCount - ctx.counts.rejectedCount,
          invalidRowCount: ctx.counts.rejectedCount,
          warningCount: ctx.counts.warningCount,
        },
      });

      if (!dryRun) {
        await this.prisma.holdingRegistry.update({
          where: { id: holdingRegistry.id },
          data: { lastSyncAt: completedAt, lastSyncStatus: status },
        });
      }

      return {
        importBatchId: importBatch.id,
        dryRun,
        holdingId: holdingRegistry.holdingId,
        spreadsheetId,
        status,
        startedAt,
        completedAt,
        counts: ctx.counts,
        rows: ctx.rows,
        tabsFound,
        tabsMissing,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Sync failed for holding ${holdingRegistry.holdingId}: ${message}`);
      await this.prisma.importBatch.update({
        where: { id: importBatch.id },
        data: { status: 'failed', completedAt: new Date(), errorMessage: message },
      });
      if (!dryRun) {
        await this.prisma.holdingRegistry.update({
          where: { id: holdingRegistry.id },
          data: { lastSyncAt: new Date(), lastSyncStatus: 'failed' },
        });
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------
  // Generic per-tab row loop
  // ---------------------------------------------------------------------
  private async processTab<TRow>(
    ctx: SyncContext,
    sheetName: string,
    rawRows: RawSheetRow[],
    // Only the parsed OUTPUT type is constrained to TRow; the schema's input
    // type is intentionally left unconstrained since fields using
    // `.default(...)` have an optional input but a required output.
    schema: ZodType<TRow, ZodTypeDef, any>,
    handleRow: (row: TRow, rowNumber: number) => Promise<{ operation: SyncRowOperation; externalId?: string; warnings?: string[] }>
  ): Promise<void> {
    for (const raw of rawRows) {
      ctx.counts.rowCount += 1;
      const parsed = schema.safeParse(raw.cells);

      if (!parsed.success) {
        ctx.counts.rejectedCount += 1;
        ctx.rows.push({
          sheetName,
          rowNumber: raw.rowNumber,
          operation: 'rejected',
          errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        });
        await this.writeImportRow(ctx, sheetName, raw, 'invalid', 'rejected', undefined, parsed.error.issues.map((i) => i.message));
        continue;
      }

      try {
        const result = await handleRow(parsed.data, raw.rowNumber);
        this.recordCount(ctx, result.operation);
        if (result.warnings?.length) ctx.counts.warningCount += result.warnings.length;
        ctx.rows.push({
          sheetName,
          rowNumber: raw.rowNumber,
          externalId: result.externalId,
          operation: result.operation,
          warnings: result.warnings,
        });
        await this.writeImportRow(
          ctx,
          sheetName,
          raw,
          result.warnings?.length ? 'has_warnings' : 'valid',
          result.operation,
          result.externalId,
          undefined,
          result.warnings
        );
      } catch (error) {
        if (error instanceof RowRejectedError) {
          ctx.counts.rejectedCount += 1;
          if (error.code === 'UNRESOLVED_ENTITY_REFERENCE' || error.code === 'UNRESOLVED_REFERENCE') {
            ctx.counts.unresolvedReferenceCount += 1;
          }
          ctx.rows.push({ sheetName, rowNumber: raw.rowNumber, operation: 'rejected', errors: [`${error.code}: ${error.message}`] });
          await this.writeImportRow(ctx, sheetName, raw, 'invalid', 'rejected', undefined, [`${error.code}: ${error.message}`]);
        } else {
          throw error;
        }
      }
    }
  }

  private recordCount(ctx: SyncContext, operation: SyncRowOperation): void {
    if (operation === 'create') ctx.counts.createCount += 1;
    else if (operation === 'update') ctx.counts.updateCount += 1;
    else if (operation === 'unchanged') ctx.counts.unchangedCount += 1;
    else if (operation === 'missing_from_source') ctx.counts.missingFromSourceCount += 1;
  }

  private async writeImportRow(
    ctx: SyncContext,
    sheetName: string,
    raw: RawSheetRow,
    status: 'valid' | 'has_warnings' | 'invalid',
    operation: SyncRowOperation,
    externalId?: string,
    errors?: string[],
    warnings?: string[]
  ): Promise<void> {
    await this.prisma.importRow.create({
      data: {
        importBatchId: ctx.importBatchId,
        sheetName,
        rowNumber: raw.rowNumber,
        rawJson: raw.cells,
        status,
        operation,
        externalId,
        errorJson: errors?.length ? { errors } : undefined,
        warningJson: warnings?.length ? { warnings } : undefined,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Entity upsert (shared by HOLDING and ENTITIES tabs)
  // ---------------------------------------------------------------------
  private async upsertEntity(
    ctx: SyncContext,
    input: {
      externalId: string;
      entityTypeCode: string;
      canonicalName: string;
      slug?: string;
      shortName?: string;
      description?: string;
      summary?: string;
      status?: string;
      visibility?: string;
      verificationStatus?: string;
      websiteUrl?: string;
      foundedAt?: Date;
      closedAt?: Date;
    },
    sheetName: string,
    rowNumber: number
  ): Promise<{ operation: SyncRowOperation; externalId: string; warnings?: string[] }> {
    const entityTypeId = ctx.entityTypeByCode.get(input.entityTypeCode);
    if (!entityTypeId) {
      throw new RowRejectedError('UNKNOWN_ENTITY_TYPE', `Unknown entity_type "${input.entityTypeCode}".`);
    }

    const warnings: string[] = [];
    const publishWarning = checkPublishGate(input.visibility, input.verificationStatus);
    if (publishWarning) warnings.push(publishWarning);

    const normalized = {
      entityTypeCode: input.entityTypeCode,
      canonicalName: input.canonicalName,
      shortName: input.shortName ?? null,
      description: input.description ?? null,
      summary: input.summary ?? null,
      status: normalizeEntityStatus(input.status),
      websiteUrl: input.websiteUrl ?? null,
      foundedAt: input.foundedAt?.toISOString() ?? null,
      closedAt: input.closedAt?.toISOString() ?? null,
    };
    const contentHash = contentHashOf(normalized);

    const existing = await this.prisma.entity.findUnique({ where: { externalId: input.externalId } });
    const status = normalizeEntityStatus(input.status);
    const verificationStatus = normalizeVerificationStatus(input.verificationStatus);

    if (existing) {
      const storedHash = await ctx.origins.getStoredHash('entity', existing.id, input.externalId);
      ctx.resolver.register('entity', input.externalId, existing.id);

      if (storedHash === contentHash) {
        if (!ctx.dryRun) {
          await ctx.origins.touch({ resourceType: 'entity', resourceId: existing.id, externalId: input.externalId, contentHash, sheetName, rowNumber });
        }
        return { operation: 'unchanged', externalId: input.externalId, warnings: warnings.length ? warnings : undefined };
      }

      if (!ctx.dryRun) {
        await this.prisma.entity.update({
          where: { id: existing.id },
          data: {
            entityTypeId,
            canonicalName: input.canonicalName,
            shortName: input.shortName,
            description: input.description,
            summary: input.summary,
            status,
            verificationStatus,
            websiteUrl: input.websiteUrl,
            foundedAt: input.foundedAt,
            closedAt: input.closedAt,
            updatedBy: ctx.userId,
          },
        });
        await ctx.origins.touch({ resourceType: 'entity', resourceId: existing.id, externalId: input.externalId, contentHash, sheetName, rowNumber });
      }
      return { operation: 'update', externalId: input.externalId, warnings: warnings.length ? warnings : undefined };
    }

    if (ctx.dryRun) {
      // Preview only: don't create, but let later rows in this same dry-run
      // resolve against a synthetic in-memory id so relation/evidence
      // previews for brand-new entities don't spuriously fail.
      ctx.resolver.register('entity', input.externalId, `preview:${input.externalId}`);
      return { operation: 'create', externalId: input.externalId, warnings: warnings.length ? warnings : undefined };
    }

    const slug = await this.uniqueEntitySlug(input.slug || input.canonicalName, input.externalId);
    const created = await this.prisma.entity.create({
      data: {
        entityTypeId,
        externalId: input.externalId,
        canonicalName: input.canonicalName,
        slug,
        shortName: input.shortName,
        description: input.description,
        summary: input.summary,
        status,
        // Sync never publishes automatically - see docs/GOOGLE_DRIVE_DATA_PIPELINE.md.
        // Reviewed/verified records still land in 'internal', not 'public'.
        visibility: 'internal',
        verificationStatus,
        websiteUrl: input.websiteUrl,
        foundedAt: input.foundedAt,
        closedAt: input.closedAt,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    });
    ctx.resolver.register('entity', input.externalId, created.id);
    await ctx.origins.touch({ resourceType: 'entity', resourceId: created.id, externalId: input.externalId, contentHash, sheetName, rowNumber });
    return { operation: 'create', externalId: input.externalId, warnings: warnings.length ? warnings : undefined };
  }

  private async uniqueEntitySlug(base: string, externalId: string): Promise<string> {
    const candidate = slugify(base);
    const collision = await this.prisma.entity.findUnique({ where: { slug: candidate } });
    if (!collision) return candidate;
    return `${candidate}-${slugify(externalId).slice(-8)}`;
  }

  // ---------------------------------------------------------------------
  // Tab handlers
  // ---------------------------------------------------------------------
  private async handleHoldingRow(ctx: SyncContext, row: HoldingRow, rowNumber: number) {
    const result = await this.upsertEntity(
      ctx,
      {
        externalId: row.external_id,
        entityTypeCode: 'holding',
        canonicalName: row.canonical_name,
        slug: row.slug,
        shortName: row.short_name,
        description: row.description,
        summary: row.summary,
        status: row.status,
        visibility: row.visibility,
        websiteUrl: row.website_url,
        foundedAt: parseDateish(row.founded_at ?? ''),
      },
      'HOLDING',
      rowNumber
    );

    if (!ctx.dryRun) {
      const entityId = await ctx.resolver.resolve('entity', row.external_id);
      if (entityId) {
        await this.prisma.holdingRegistry.update({
          where: { id: ctx.holdingRegistryId },
          data: { entityId },
        });
      }
    }

    return result;
  }

  private async handleEntityRow(ctx: SyncContext, row: EntityRow, rowNumber: number) {
    return this.upsertEntity(
      ctx,
      {
        externalId: row.external_id,
        entityTypeCode: row.entity_type,
        canonicalName: row.canonical_name,
        slug: row.slug,
        shortName: row.short_name,
        description: row.description,
        summary: row.summary,
        status: row.status,
        visibility: row.visibility,
        websiteUrl: row.website_url,
        foundedAt: parseDateish(row.founded_at ?? ''),
        closedAt: parseDateish(row.closed_at ?? ''),
      },
      'ENTITIES',
      rowNumber
    );
  }

  private async handleAliasRow(ctx: SyncContext, row: AliasRow) {
    const entityId = await ctx.resolver.resolve('entity', row.entity_external_id);
    if (!entityId) {
      throw new RowRejectedError('UNRESOLVED_ENTITY_REFERENCE', `entity_external_id "${row.entity_external_id}" not found.`);
    }
    if (ctx.dryRun) {
      return { operation: 'create' as SyncRowOperation, externalId: row.external_id };
    }

    let sourceId: string | undefined;
    const warnings: string[] = [];
    if (row.source_external_id) {
      const resolved = await ctx.resolver.resolve('source', row.source_external_id);
      if (resolved) sourceId = resolved;
      else warnings.push(`source_external_id "${row.source_external_id}" not resolvable yet (will resolve on a later sync).`);
    }

    const existing = await this.prisma.entityAlias.findUnique({
      where: { entityId_alias_aliasType: { entityId, alias: row.alias, aliasType: row.alias_type } },
    });

    const data = {
      entityId,
      alias: row.alias,
      aliasType: row.alias_type,
      validFrom: parseDateish(row.valid_from ?? ''),
      validUntil: parseDateish(row.valid_until ?? ''),
      language: row.language ?? 'tr',
      sourceId,
    };

    if (existing) {
      const operation = hasChanges(existing, data) ? 'update' : 'unchanged';
      if (operation === 'update') {
        await this.prisma.entityAlias.update({ where: { id: existing.id }, data });
      }
      return { operation: operation as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    await this.prisma.entityAlias.create({ data });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async handleLocationRow(ctx: SyncContext, row: LocationRow) {
    if (ctx.dryRun) {
      ctx.resolver.register('location', row.external_id, `preview:${row.external_id}`);
      return { operation: 'create' as SyncRowOperation, externalId: row.external_id };
    }

    const warnings: string[] = [];
    let sourceId: string | undefined;
    if (row.source_external_id) {
      const resolved = await ctx.resolver.resolve('source', row.source_external_id);
      if (resolved) sourceId = resolved;
      else warnings.push(`source_external_id "${row.source_external_id}" not resolvable yet (will resolve on a later sync).`);
    }

    const normalized = {
      name: row.name,
      locationType: row.location_type,
      countryCode: row.country_code ?? 'TR',
      province: row.province ?? null,
      district: row.district ?? null,
      neighborhood: row.neighborhood ?? null,
      address: row.address ?? null,
      latitude: parseNumberish(row.latitude ?? '') ?? null,
      longitude: parseNumberish(row.longitude ?? '') ?? null,
      accuracyLevel: row.accuracy_level,
    };
    const contentHash = contentHashOf(normalized);

    const existing = await this.prisma.location.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      ctx.resolver.register('location', row.external_id, existing.id);
      const storedHash = await ctx.origins.getStoredHash('location', existing.id, row.external_id);
      if (storedHash === contentHash) {
        await ctx.origins.touch({ resourceType: 'location', resourceId: existing.id, externalId: row.external_id, contentHash });
        return { operation: 'unchanged' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
      }
      await this.prisma.location.update({ where: { id: existing.id }, data: { ...normalized, sourceId } });
      await ctx.origins.touch({ resourceType: 'location', resourceId: existing.id, externalId: row.external_id, contentHash });
      return { operation: 'update' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    const created = await this.prisma.location.create({ data: { ...normalized, externalId: row.external_id, sourceId } });
    ctx.resolver.register('location', row.external_id, created.id);
    await ctx.origins.touch({ resourceType: 'location', resourceId: created.id, externalId: row.external_id, contentHash });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async handleSourceRow(ctx: SyncContext, row: SourceRow) {
    const sourceTypeId = ctx.sourceTypeByCode.get(row.source_type);
    if (!sourceTypeId) {
      throw new RowRejectedError('UNKNOWN_SOURCE_TYPE', `Unknown source_type "${row.source_type}".`);
    }

    const political = resolvePoliticalLanguageAllowed({
      originalUrl: row.original_url,
      archivedUrl: row.archived_url,
      claimedAllowed: parseBooleanish(row.political_language_allowed ?? '') ?? false,
    });
    const warnings = political.warning ? [political.warning] : undefined;

    if (ctx.dryRun) {
      ctx.resolver.register('source', row.source_id, `preview:${row.source_id}`);
      return { operation: 'create' as SyncRowOperation, externalId: row.source_id, warnings };
    }

    const normalized = {
      sourceTypeCode: row.source_type,
      title: row.title,
      publisher: row.publisher ?? null,
      author: row.author ?? null,
      publicationDate: parseDateish(row.publication_date ?? '')?.toISOString() ?? null,
      originalUrl: row.original_url ?? null,
      archivedUrl: row.archived_url ?? null,
      driveFileId: row.drive_file_id ?? null,
      reliabilityLevel: row.reliability_level,
      factualRole: row.factual_role ?? null,
      politicalLanguageAllowed: political.allowed,
    };
    const contentHash = contentHashOf(normalized);

    const data = {
      sourceTypeId,
      title: row.title,
      publisher: emptyToUndefined(row.publisher ?? ''),
      author: emptyToUndefined(row.author ?? ''),
      publicationDate: parseDateish(row.publication_date ?? ''),
      accessedAt: parseDateish(row.accessed_at ?? ''),
      originalUrl: emptyToUndefined(row.original_url ?? ''),
      archivedUrl: emptyToUndefined(row.archived_url ?? ''),
      driveFileId: emptyToUndefined(row.drive_file_id ?? ''),
      reliabilityLevel: row.reliability_level,
      verificationStatus: row.verification_status,
      factualRole: emptyToUndefined(row.factual_role ?? ''),
      politicalLanguageAllowed: political.allowed,
    };

    const existing = await this.prisma.source.findUnique({ where: { externalId: row.source_id } });
    if (existing) {
      ctx.resolver.register('source', row.source_id, existing.id);
      const storedHash = await ctx.origins.getStoredHash('source', existing.id, row.source_id);
      if (storedHash === contentHash) {
        await ctx.origins.touch({ resourceType: 'source', resourceId: existing.id, externalId: row.source_id, contentHash });
        return { operation: 'unchanged' as SyncRowOperation, externalId: row.source_id, warnings };
      }
      await this.prisma.source.update({ where: { id: existing.id }, data });
      await ctx.origins.touch({ resourceType: 'source', resourceId: existing.id, externalId: row.source_id, contentHash });
      return { operation: 'update' as SyncRowOperation, externalId: row.source_id, warnings };
    }

    const created = await this.prisma.source.create({
      data: { ...data, externalId: row.source_id, createdBy: ctx.userId },
    });
    ctx.resolver.register('source', row.source_id, created.id);
    await ctx.origins.touch({ resourceType: 'source', resourceId: created.id, externalId: row.source_id, contentHash });
    return { operation: 'create' as SyncRowOperation, externalId: row.source_id, warnings };
  }

  private async handleRelationRow(ctx: SyncContext, row: RelationRow) {
    const relationTypeId = ctx.relationTypeByCode.get(row.relation_type);
    if (!relationTypeId) {
      throw new RowRejectedError('UNKNOWN_RELATION_TYPE', `Unknown relation_type "${row.relation_type}".`);
    }
    const sourceEntityId = await ctx.resolver.resolve('entity', row.source_external_id);
    if (!sourceEntityId) {
      throw new RowRejectedError('UNRESOLVED_ENTITY_REFERENCE', `source_external_id "${row.source_external_id}" not found.`);
    }
    const targetEntityId = await ctx.resolver.resolve('entity', row.target_external_id);
    if (!targetEntityId) {
      throw new RowRejectedError('UNRESOLVED_ENTITY_REFERENCE', `target_external_id "${row.target_external_id}" not found.`);
    }

    const warnings: string[] = [];
    const publishWarning = checkPublishGate(row.visibility, row.verification_status);
    if (publishWarning) warnings.push(publishWarning);

    if (ctx.dryRun) {
      return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    const validFrom = parseDateish(row.valid_from ?? '');
    const validUntil = parseDateish(row.valid_until ?? '');
    const observedAt = parseDateish(row.observed_at ?? '');
    const normalized = {
      relationTypeCode: row.relation_type,
      sourceEntityId,
      targetEntityId,
      summary: row.summary ?? null,
      description: row.description ?? null,
      status: normalizeEntityStatus(row.status),
      confidenceLevel: row.confidence_level ?? 'medium',
      validFrom: validFrom?.toISOString() ?? null,
      validUntil: validUntil?.toISOString() ?? null,
    };
    const contentHash = contentHashOf(normalized);

    const data = {
      relationTypeId,
      sourceEntityId,
      targetEntityId,
      direction: row.direction || 'forward',
      summary: emptyToUndefined(row.summary ?? ''),
      description: emptyToUndefined(row.description ?? ''),
      status: normalizeEntityStatus(row.status),
      verificationStatus: normalizeVerificationStatus(row.verification_status),
      confidenceLevel: row.confidence_level ?? 'medium',
      validFrom,
      validUntil,
      observedAt,
    };

    const existing = await this.prisma.relation.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      const storedHash = await ctx.origins.getStoredHash('relation', existing.id, row.external_id);
      if (storedHash === contentHash) {
        await ctx.origins.touch({ resourceType: 'relation', resourceId: existing.id, externalId: row.external_id, contentHash });
        return { operation: 'unchanged' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
      }
      await this.prisma.relation.update({ where: { id: existing.id }, data: { ...data, updatedBy: ctx.userId } });
      await ctx.origins.touch({ resourceType: 'relation', resourceId: existing.id, externalId: row.external_id, contentHash });
      return { operation: 'update' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    const created = await this.prisma.relation.create({
      data: { ...data, externalId: row.external_id, visibility: 'internal', createdBy: ctx.userId, updatedBy: ctx.userId },
    });
    await ctx.origins.touch({ resourceType: 'relation', resourceId: created.id, externalId: row.external_id, contentHash });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async handleStruggleRow(ctx: SyncContext, row: StruggleRow) {
    const warnings: string[] = [];
    const publishWarning = checkPublishGate(row.visibility, row.verification_status);
    if (publishWarning) warnings.push(publishWarning);

    if (ctx.dryRun) {
      ctx.resolver.register('struggle', row.external_id, `preview:${row.external_id}`);
      return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    let locationId: string | undefined;
    if (row.location_external_id) {
      const resolved = await ctx.resolver.resolve('location', row.location_external_id);
      if (resolved) locationId = resolved;
      else warnings.push(`location_external_id "${row.location_external_id}" not resolvable yet.`);
    }

    const startDate = parseDateish(row.start_date ?? '');
    const endDate = parseDateish(row.end_date ?? '');
    const normalized = {
      title: row.title,
      description: row.description ?? null,
      summary: row.summary ?? null,
      type: row.type,
      status: row.status,
      startDate: startDate?.toISOString() ?? null,
      endDate: endDate?.toISOString() ?? null,
      location: row.location ?? null,
      participants: row.participants ?? null,
      outcome: row.outcome ?? null,
      lessons: row.lessons ?? null,
    };
    const contentHash = contentHashOf(normalized);

    const data = {
      title: row.title,
      description: emptyToUndefined(row.description ?? ''),
      summary: emptyToUndefined(row.summary ?? ''),
      type: row.type,
      status: row.status,
      verificationStatus: normalizeVerificationStatus(row.verification_status),
      startDate,
      endDate,
      location: emptyToUndefined(row.location ?? ''),
      locationId,
      latitude: parseNumberish(row.latitude ?? ''),
      longitude: parseNumberish(row.longitude ?? ''),
      participants: emptyToUndefined(row.participants ?? ''),
      outcome: emptyToUndefined(row.outcome ?? ''),
      lessons: emptyToUndefined(row.lessons ?? ''),
    };

    const existing = await this.prisma.struggle.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      ctx.resolver.register('struggle', row.external_id, existing.id);
      const storedHash = await ctx.origins.getStoredHash('struggle', existing.id, row.external_id);
      if (storedHash === contentHash) {
        await ctx.origins.touch({ resourceType: 'struggle', resourceId: existing.id, externalId: row.external_id, contentHash });
        return { operation: 'unchanged' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
      }
      await this.prisma.struggle.update({ where: { id: existing.id }, data: { ...data, updatedBy: ctx.userId } });
      await ctx.origins.touch({ resourceType: 'struggle', resourceId: existing.id, externalId: row.external_id, contentHash });
      return { operation: 'update' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }

    const slug = await this.uniqueStruggleSlug(row.slug || row.title, row.external_id);
    const created = await this.prisma.struggle.create({
      data: { ...data, externalId: row.external_id, slug, visibility: 'internal', createdBy: ctx.userId, updatedBy: ctx.userId },
    });
    ctx.resolver.register('struggle', row.external_id, created.id);
    await ctx.origins.touch({ resourceType: 'struggle', resourceId: created.id, externalId: row.external_id, contentHash });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async uniqueStruggleSlug(base: string, externalId: string): Promise<string> {
    const candidate = slugify(base);
    const collision = await this.prisma.struggle.findUnique({ where: { slug: candidate } });
    if (!collision) return candidate;
    return `${candidate}-${slugify(externalId).slice(-8)}`;
  }

  private async handleStruggleActorRow(ctx: SyncContext, row: StruggleActorRow) {
    const struggleId = await ctx.resolver.resolve('struggle', row.struggle_external_id);
    if (!struggleId) {
      throw new RowRejectedError('UNRESOLVED_STRUGGLE_REFERENCE', `struggle_external_id "${row.struggle_external_id}" not found.`);
    }
    if (ctx.dryRun) return { operation: 'create' as SyncRowOperation, externalId: row.external_id };

    let entityId: string | undefined;
    const warnings: string[] = [];
    if (row.entity_external_id) {
      const resolved = await ctx.resolver.resolve('entity', row.entity_external_id);
      if (resolved) entityId = resolved;
      else warnings.push(`entity_external_id "${row.entity_external_id}" not resolvable.`);
    }

    const data = { struggleId, entityId, actorName: row.actor_name, role: row.role, side: row.side, notes: row.notes };

    const existing = await this.prisma.struggleActor.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      const operation = hasChanges(existing, data) ? 'update' : 'unchanged';
      if (operation === 'update') {
        await this.prisma.struggleActor.update({ where: { id: existing.id }, data });
      }
      return { operation: operation as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }
    await this.prisma.struggleActor.create({ data: { ...data, externalId: row.external_id } });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async handleStruggleDemandRow(ctx: SyncContext, row: StruggleDemandRow) {
    const struggleId = await ctx.resolver.resolve('struggle', row.struggle_external_id);
    if (!struggleId) {
      throw new RowRejectedError('UNRESOLVED_STRUGGLE_REFERENCE', `struggle_external_id "${row.struggle_external_id}" not found.`);
    }
    if (ctx.dryRun) return { operation: 'create' as SyncRowOperation, externalId: row.external_id };

    const data = { struggleId, demand: row.demand, status: row.status, notes: row.notes };
    const existing = await this.prisma.struggleDemand.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      const operation = hasChanges(existing, data) ? 'update' : 'unchanged';
      if (operation === 'update') {
        await this.prisma.struggleDemand.update({ where: { id: existing.id }, data });
      }
      return { operation: operation as SyncRowOperation, externalId: row.external_id };
    }
    await this.prisma.struggleDemand.create({ data: { ...data, externalId: row.external_id } });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id };
  }

  private async handleStruggleActionRow(ctx: SyncContext, row: StruggleActionRow) {
    const struggleId = await ctx.resolver.resolve('struggle', row.struggle_external_id);
    if (!struggleId) {
      throw new RowRejectedError('UNRESOLVED_STRUGGLE_REFERENCE', `struggle_external_id "${row.struggle_external_id}" not found.`);
    }
    if (ctx.dryRun) return { operation: 'create' as SyncRowOperation, externalId: row.external_id };

    const data = {
      struggleId,
      actionType: row.action_type,
      title: row.title,
      description: row.description,
      occurredAt: parseDateish(row.occurred_at ?? ''),
      location: row.location,
      notes: row.notes,
    };
    const existing = await this.prisma.struggleAction.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      const operation = hasChanges(existing, data) ? 'update' : 'unchanged';
      if (operation === 'update') {
        await this.prisma.struggleAction.update({ where: { id: existing.id }, data });
      }
      return { operation: operation as SyncRowOperation, externalId: row.external_id };
    }
    await this.prisma.struggleAction.create({ data: { ...data, externalId: row.external_id } });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id };
  }

  private async handleEventRow(ctx: SyncContext, row: EventRow) {
    let entityId: string | undefined;
    let struggleId: string | undefined;
    const warnings: string[] = [];

    if (row.entity_external_id) {
      const resolved = await ctx.resolver.resolve('entity', row.entity_external_id);
      if (resolved) entityId = resolved;
      else throw new RowRejectedError('UNRESOLVED_ENTITY_REFERENCE', `entity_external_id "${row.entity_external_id}" not found.`);
    }
    if (row.struggle_external_id) {
      const resolved = await ctx.resolver.resolve('struggle', row.struggle_external_id);
      if (resolved) struggleId = resolved;
      else throw new RowRejectedError('UNRESOLVED_STRUGGLE_REFERENCE', `struggle_external_id "${row.struggle_external_id}" not found.`);
    }

    if (ctx.dryRun) return { operation: 'create' as SyncRowOperation, externalId: row.external_id };

    let relatedRelationId: string | undefined;
    if (row.related_relation_external_id) {
      const resolved = await ctx.resolver.resolve('relation', row.related_relation_external_id);
      if (resolved) relatedRelationId = resolved;
      else warnings.push(`related_relation_external_id "${row.related_relation_external_id}" not resolvable.`);
    }

    const occurredAt = parseDateish(row.occurred_at);
    if (!occurredAt) {
      throw new RowRejectedError('INVALID_DATE', `occurred_at "${row.occurred_at}" is not a valid date.`);
    }

    const data = {
      entityId,
      struggleId,
      eventType: row.event_type,
      title: row.title,
      description: row.description,
      occurredAt,
      endedAt: parseDateish(row.ended_at ?? ''),
      status: row.status || 'confirmed',
      verificationStatus: normalizeVerificationStatus(row.verification_status),
      relatedRelationId,
    };

    const existing = await this.prisma.timelineEvent.findUnique({ where: { externalId: row.external_id } });
    if (existing) {
      const operation = hasChanges(existing, data) ? 'update' : 'unchanged';
      if (operation === 'update') {
        await this.prisma.timelineEvent.update({ where: { id: existing.id }, data });
      }
      return { operation: operation as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
    }
    await this.prisma.timelineEvent.create({ data: { ...data, externalId: row.external_id } });
    return { operation: 'create' as SyncRowOperation, externalId: row.external_id, warnings: warnings.length ? warnings : undefined };
  }

  private async handleEvidenceRow(ctx: SyncContext, row: EvidenceRow) {
    const sourceId = await ctx.resolver.resolve('source', row.source_external_id);
    if (!sourceId) {
      throw new RowRejectedError('UNRESOLVED_SOURCE_REFERENCE', `source_external_id "${row.source_external_id}" not found.`);
    }

    const parentId = await ctx.resolver.resolve(row.parent_type, row.parent_external_id);
    if (!parentId) {
      throw new RowRejectedError(
        'UNRESOLVED_ENTITY_REFERENCE',
        `${row.parent_type} "${row.parent_external_id}" (evidence parent) not found.`
      );
    }

    if (ctx.dryRun) return { operation: 'create' as SyncRowOperation, externalId: row.external_id };

    const pageNumber = row.page_number ? Number.parseInt(row.page_number, 10) : undefined;
    const supportsFrom = parseDateish(row.supports_from ?? '');
    const supportsUntil = parseDateish(row.supports_until ?? '');

    let operation: SyncRowOperation;

    if (row.parent_type === 'entity') {
      const evidenceType = row.evidence_type || row.claim_field || 'general';
      const data = { excerpt: row.excerpt, pageNumber, supportsFrom, supportsUntil, notes: row.notes, claimField: row.claim_field };
      const existing = await this.prisma.entitySourceEvidence.findUnique({
        where: { entityId_sourceId_evidenceType: { entityId: parentId, sourceId, evidenceType } },
      });
      operation = !existing ? 'create' : hasChanges(existing, data) ? 'update' : 'unchanged';
      await this.prisma.entitySourceEvidence.upsert({
        where: { entityId_sourceId_evidenceType: { entityId: parentId, sourceId, evidenceType } },
        update: data,
        create: { entityId: parentId, sourceId, evidenceType, ...data },
      });
    } else if (row.parent_type === 'relation') {
      const data = { excerpt: row.excerpt, pageNumber, notes: row.notes, claimField: row.claim_field };
      const existing = await this.prisma.relationSourceEvidence.findUnique({
        where: { relationId_sourceId: { relationId: parentId, sourceId } },
      });
      operation = !existing ? 'create' : hasChanges(existing, data) ? 'update' : 'unchanged';
      await this.prisma.relationSourceEvidence.upsert({
        where: { relationId_sourceId: { relationId: parentId, sourceId } },
        update: data,
        create: { relationId: parentId, sourceId, ...data },
      });
    } else {
      const data = { excerpt: row.excerpt, pageNumber, notes: row.notes, claimField: row.claim_field };
      const existing = await this.prisma.struggleSourceEvidence.findUnique({
        where: { struggleId_sourceId: { struggleId: parentId, sourceId } },
      });
      operation = !existing ? 'create' : hasChanges(existing, data) ? 'update' : 'unchanged';
      await this.prisma.struggleSourceEvidence.upsert({
        where: { struggleId_sourceId: { struggleId: parentId, sourceId } },
        update: data,
        create: { struggleId: parentId, sourceId, ...data },
      });
    }

    return { operation, externalId: row.external_id };
  }

  // ---------------------------------------------------------------------
  // Missing-from-source detection (never deletes - review signal only)
  // ---------------------------------------------------------------------
  private async detectMissingFromSource(ctx: SyncContext, resourceType: 'entity' | 'struggle'): Promise<void> {
    const previouslySynced = await ctx.origins.listPreviouslySyncedExternalIds(resourceType, ctx.holdingRegistryId);
    const seenThisRun = new Set(ctx.rows.filter((r) => r.externalId).map((r) => r.externalId));

    for (const externalId of previouslySynced) {
      if (seenThisRun.has(externalId)) continue;
      ctx.counts.missingFromSourceCount += 1;
      ctx.rows.push({
        sheetName: resourceType === 'entity' ? 'ENTITIES' : 'STRUGGLES',
        rowNumber: -1,
        externalId,
        operation: 'missing_from_source',
        warnings: [`Previously synced ${resourceType} "${externalId}" was not found in this sync - left untouched, needs editor review.`],
      });
    }
  }
}

/**
 * Compares only the keys present in `next` against the same keys on
 * `existing`, normalizing `null`/`undefined` (Prisma stores absence as SQL
 * NULL, our parsed rows use `undefined`) and Date values before comparing,
 * so an unchanged evidence row is correctly reported as 'unchanged' rather
 * than a false 'update' on every re-sync.
 */
function hasChanges(existing: Record<string, unknown>, next: Record<string, unknown>): boolean {
  const normalize = (value: unknown): unknown => {
    if (value === undefined || value === null) return null;
    if (value instanceof Date) return value.toISOString();
    return value;
  };
  return Object.keys(next).some((key) => normalize(existing[key]) !== normalize(next[key]));
}

function normalizeEntityStatus(value: string | undefined): 'active' | 'inactive' | 'dissolved' | 'defunct' {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'inactive' || normalized === 'dissolved' || normalized === 'defunct') return normalized;
  return 'active';
}

function normalizeVerificationStatus(
  value: string | undefined
): 'unverified' | 'verified' | 'needs_review' | 'source_required' | 'conflicting' {
  const normalized = (value ?? '').toLowerCase();
  if (['unverified', 'verified', 'needs_review', 'source_required', 'conflicting'].includes(normalized)) {
    return normalized as 'unverified' | 'verified' | 'needs_review' | 'source_required' | 'conflicting';
  }
  return 'unverified';
}
