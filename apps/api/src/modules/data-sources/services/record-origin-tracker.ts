import type { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * Reads/writes `RecordOrigin` rows, which are the durable per-record sync
 * state (last content hash, last synced timestamp) that change detection and
 * "missing from source" detection are built on. Plain class, not a NestJS
 * singleton, scoped to one sync run via `importBatchId`.
 */
export class RecordOriginTracker {
  constructor(
    private readonly prisma: PrismaService,
    private readonly importBatchId: string
  ) {}

  async getStoredHash(resourceType: string, resourceId: string, externalId: string): Promise<string | null> {
    const row = await this.prisma.recordOrigin.findUnique({
      where: {
        resourceType_resourceId_originType_originReference: {
          resourceType,
          resourceId,
          originType: 'google_drive',
          originReference: externalId,
        },
      },
      select: { contentHash: true },
    });
    return row?.contentHash ?? null;
  }

  async touch(params: {
    resourceType: string;
    resourceId: string;
    externalId: string;
    contentHash: string;
    driveFileId?: string;
    sheetName?: string;
    rowNumber?: number;
  }): Promise<void> {
    const { resourceType, resourceId, externalId, contentHash, driveFileId, sheetName, rowNumber } = params;
    await this.prisma.recordOrigin.upsert({
      where: {
        resourceType_resourceId_originType_originReference: {
          resourceType,
          resourceId,
          originType: 'google_drive',
          originReference: externalId,
        },
      },
      update: {
        contentHash,
        lastSyncedAt: new Date(),
        importBatchId: this.importBatchId,
        driveFileId,
        sheetName,
        rowNumber,
      },
      create: {
        resourceType,
        resourceId,
        originType: 'google_drive',
        originReference: externalId,
        contentHash,
        importBatchId: this.importBatchId,
        driveFileId,
        sheetName,
        rowNumber,
        lastSyncedAt: new Date(),
      },
    });
  }

  /** External IDs previously synced for this holding + resourceType, across all prior batches. */
  async listPreviouslySyncedExternalIds(resourceType: string, holdingRegistryId: string): Promise<string[]> {
    const rows = await this.prisma.recordOrigin.findMany({
      where: {
        resourceType,
        originType: 'google_drive',
        importBatch: { holdingRegistryId },
      },
      select: { originReference: true },
      distinct: ['originReference'],
    });
    return rows.map((r) => r.originReference).filter((value): value is string => Boolean(value));
  }
}
