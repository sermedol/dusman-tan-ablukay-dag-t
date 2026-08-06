import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async createBatch(filename: string, userId: string) {
    return this.prisma.importBatch.create({
      data: {
        filename,
        status: 'pending',
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        createdBy: userId,
      },
    });
  }

  async findAllBatches() {
    return this.prisma.importBatch.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBatchById(id: string) {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Import batch not found');
    }

    return batch;
  }

  async addRowToBatch(
    batchId: string,
    rowNumber: number,
    data: Record<string, any>,
  ) {
    const batch = await this.findBatchById(batchId);

    return this.prisma.importRow.create({
      data: {
        batchId,
        rowNumber,
        data,
        status: 'pending',
      },
    });
  }

  async getBatchRows(
    batchId: string,
    filters?: { status?: string; skip?: number; take?: number },
  ) {
    await this.findBatchById(batchId);

    const where: any = { batchId };
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.importRow.findMany({
      where,
      skip: filters?.skip || 0,
      take: filters?.take || 100,
      orderBy: { rowNumber: 'asc' },
    });
  }

  async updateRowStatus(
    rowId: string,
    status: 'pending' | 'processed' | 'error',
    errorMessage?: string,
  ) {
    return this.prisma.importRow.update({
      where: { id: rowId },
      data: {
        status,
        errorMessage,
      },
    });
  }

  async updateBatchStatus(
    batchId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    stats?: { successCount?: number; errorCount?: number; totalRows?: number },
  ) {
    return this.prisma.importBatch.update({
      where: { id: batchId },
      data: {
        status,
        ...stats,
      },
    });
  }

  async createRecordOrigin(
    batchId: string,
    rowId: string,
    resourceType: 'entity' | 'relation' | 'source',
    resourceId: string,
  ) {
    return this.prisma.recordOrigin.create({
      data: {
        batchId,
        rowId,
        resourceType,
        resourceId,
      },
    });
  }
}
