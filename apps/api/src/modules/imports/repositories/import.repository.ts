import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BaseRepository, FindOptions } from '../../../shared/repository/base.repository';

interface ImportModel {
  id: string;
  name: string;
  sourceType: string;
  sourceUrl: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  config: Record<string, any> | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type ImportCreateInput = any;
type ImportUpdateInput = any;

@Injectable()
export class ImportRepository extends BaseRepository<ImportModel, ImportCreateInput, ImportUpdateInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
    // Note: This assumes an Import model exists in Prisma schema
    this.model = prisma.import || null;
  }

  /**
   * Find imports by status
   */
  async findByStatus(status: string, options?: FindOptions): Promise<ImportModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find imports by source type
   */
  async findBySourceType(sourceType: string, options?: FindOptions): Promise<ImportModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        sourceType,
      },
    });
  }

  /**
   * Find pending imports
   */
  async findPending(options?: FindOptions): Promise<ImportModel[]> {
    return this.findByStatus('pending', options);
  }

  /**
   * Find processing imports
   */
  async findProcessing(options?: FindOptions): Promise<ImportModel[]> {
    return this.findByStatus('processing', options);
  }

  /**
   * Find completed imports
   */
  async findCompleted(options?: FindOptions): Promise<ImportModel[]> {
    return this.findByStatus('completed', options);
  }

  /**
   * Find failed imports
   */
  async findFailed(options?: FindOptions): Promise<ImportModel[]> {
    return this.findByStatus('failed', options);
  }

  /**
   * Find imports created by user
   */
  async findByCreator(userId: string, options?: FindOptions): Promise<ImportModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        createdBy: userId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get import statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
  }> {
    if (!this.model) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
      };
    }

    const imports = await this.find();
    const byStatus = {
      pending: imports.filter((i) => i.status === 'pending').length,
      processing: imports.filter((i) => i.status === 'processing').length,
      completed: imports.filter((i) => i.status === 'completed').length,
      failed: imports.filter((i) => i.status === 'failed').length,
    };

    const totals = imports.reduce(
      (acc, imp) => ({
        totalRecords: acc.totalRecords + (imp.totalRecords || 0),
        processedRecords: acc.processedRecords + (imp.processedRecords || 0),
        failedRecords: acc.failedRecords + (imp.failedRecords || 0),
      }),
      { totalRecords: 0, processedRecords: 0, failedRecords: 0 }
    );

    return {
      total: imports.length,
      ...byStatus,
      ...totals,
    };
  }

  /**
   * Update import progress
   */
  async updateProgress(
    id: string,
    processed: number,
    failed: number,
    total: number
  ): Promise<ImportModel | null> {
    if (!this.model) return null;

    const status = processed + failed === total ? 'completed' : 'processing';

    return this.update(id, {
      processedRecords: processed,
      failedRecords: failed,
      status,
    } as any);
  }
}
