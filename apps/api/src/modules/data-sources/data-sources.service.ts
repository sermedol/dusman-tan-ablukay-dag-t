import { Injectable, NotFoundException } from '@nestjs/common';
import type { ImportRowStatus } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { GoogleAuthService } from './services/google-auth.service';
import { HoldingSyncService } from './services/holding-sync.service';
import { MasterRegistryService } from './services/master-registry.service';
import type { SyncResult } from './services/sync-result.types';

@Injectable()
export class DataSourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAuth: GoogleAuthService,
    private readonly masterRegistry: MasterRegistryService,
    private readonly holdingSync: HoldingSyncService
  ) {}

  getStatus() {
    return {
      googleIntegrationEnabled: this.googleAuth.isEnabled(),
      disabledReason: this.googleAuth.getDisabledReason(),
    };
  }

  async refreshMasterRegistry() {
    return this.masterRegistry.refresh();
  }

  async listHoldings() {
    return this.masterRegistry.listHoldings();
  }

  private async resolveHoldingRegistry(holdingIdOrDbId: string) {
    const byExternalId = await this.prisma.holdingRegistry.findUnique({ where: { holdingId: holdingIdOrDbId } });
    if (byExternalId) return byExternalId;

    const byDbId = await this.prisma.holdingRegistry.findUnique({ where: { id: holdingIdOrDbId } });
    if (byDbId) return byDbId;

    throw new NotFoundException(`No holding registered with id "${holdingIdOrDbId}". Refresh the Master Registry first.`);
  }

  async syncHolding(holdingIdOrDbId: string, userId: string, dryRun: boolean): Promise<SyncResult> {
    const registry = await this.resolveHoldingRegistry(holdingIdOrDbId);
    return this.holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun });
  }

  async syncAll(userId: string, dryRun: boolean): Promise<Array<{ holdingId: string; result?: SyncResult; error?: string }>> {
    const enabled = await this.prisma.holdingRegistry.findMany({ where: { syncEnabled: true } });
    const results: Array<{ holdingId: string; result?: SyncResult; error?: string }> = [];

    for (const registry of enabled) {
      try {
        const result = await this.holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun });
        results.push({ holdingId: registry.holdingId, result });
      } catch (error) {
        results.push({ holdingId: registry.holdingId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }

  async getImportBatch(id: string) {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id },
      include: { holdingRegistry: true },
    });
    if (!batch) throw new NotFoundException(`Import batch "${id}" not found.`);
    return batch;
  }

  async getImportBatchRows(id: string, options: { status?: ImportRowStatus; skip?: number; take?: number }) {
    await this.getImportBatch(id);
    return this.prisma.importRow.findMany({
      where: { importBatchId: id, status: options.status },
      orderBy: { rowNumber: 'asc' },
      skip: options.skip ?? 0,
      take: Math.min(options.take ?? 100, 500),
    });
  }
}
