import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../shared/prisma/prisma.service';
import { getMasterSpreadsheetId } from '../google-config';
import { parseBooleanish, rowsFromTabValues } from '../validation/sheet-row-transform';
import { masterHoldingRowSchema, type MasterHoldingRow } from '../validation/sheet-schemas';
import type { IGoogleSheetsClient } from './google-sheets-client.interface';
import { GoogleSheetsService } from './google-sheets.service';

export interface MasterRegistrySyncResult {
  spreadsheetId: string;
  rowsRead: number;
  created: number;
  updated: number;
  unchanged: number;
  rejected: Array<{ rowNumber: number; errors: string[] }>;
}

/**
 * Reads the Master Registry spreadsheet's MASTER_HOLDINGS tab and upserts
 * `HoldingRegistry` rows. This is the ONLY place a holding gets discovered -
 * adding a row here (with sync_enabled = EVET/true) is how a new holding's
 * data source becomes visible to the rest of the system, with no code change.
 */
@Injectable()
export class MasterRegistryService {
  private readonly logger = new Logger('MasterRegistryService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleSheets: GoogleSheetsService
  ) {}

  async refresh(sheetsClient: IGoogleSheetsClient = this.googleSheets): Promise<MasterRegistrySyncResult> {
    const spreadsheetId = getMasterSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('GOOGLE_MASTER_SPREADSHEET_ID is not configured.');
    }

    const [tab] = await sheetsClient.batchGetTabValues(spreadsheetId, ['MASTER_HOLDINGS']);
    const rows = tab ? rowsFromTabValues(tab) : [];

    const result: MasterRegistrySyncResult = {
      spreadsheetId,
      rowsRead: rows.length,
      created: 0,
      updated: 0,
      unchanged: 0,
      rejected: [],
    };

    for (const row of rows) {
      const parsed = masterHoldingRowSchema.safeParse(row.cells);
      if (!parsed.success) {
        result.rejected.push({
          rowNumber: row.rowNumber,
          errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        });
        continue;
      }

      const outcome = await this.upsertHolding(parsed.data);
      result[outcome] += 1;
    }

    this.logger.log(
      `Master Registry refresh: ${result.rowsRead} rows, ${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged, ${result.rejected.length} rejected`
    );
    return result;
  }

  async listHoldings() {
    return this.prisma.holdingRegistry.findMany({
      orderBy: { holdingName: 'asc' },
      include: { entity: { select: { id: true, slug: true, canonicalName: true } } },
    });
  }

  async getHolding(holdingRegistryId: string) {
    return this.prisma.holdingRegistry.findUnique({
      where: { id: holdingRegistryId },
      include: { entity: { select: { id: true, slug: true, canonicalName: true } } },
    });
  }

  private async upsertHolding(row: MasterHoldingRow): Promise<'created' | 'updated' | 'unchanged'> {
    const data = {
      holdingName: row.holding_name,
      shortName: row.short_name,
      driveFolderUrl: row.drive_folder_url,
      spreadsheetUrl: row.spreadsheet_url,
      spreadsheetId: row.spreadsheet_id,
      status: row.status,
      researchStatus: row.research_status,
      syncEnabled: parseBooleanish(row.sync_enabled ?? '') ?? false,
      syncMode: row.sync_mode ?? 'manual',
      importMode: row.import_mode,
      templateVersion: row.template_version,
      dataOwner: row.data_owner,
      reviewer: row.reviewer,
      notes: row.notes,
    };

    const existing = await this.prisma.holdingRegistry.findUnique({ where: { holdingId: row.holding_id } });
    if (!existing) {
      await this.prisma.holdingRegistry.create({ data: { holdingId: row.holding_id, ...data } });
      return 'created';
    }

    const changed =
      existing.holdingName !== data.holdingName ||
      existing.spreadsheetId !== data.spreadsheetId ||
      existing.syncEnabled !== data.syncEnabled ||
      existing.syncMode !== data.syncMode ||
      existing.status !== data.status ||
      existing.researchStatus !== data.researchStatus;

    if (!changed) return 'unchanged';

    await this.prisma.holdingRegistry.update({ where: { id: existing.id }, data });
    return 'updated';
  }
}
