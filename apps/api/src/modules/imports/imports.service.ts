import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateImportDto, UpdateImportDto } from './dto';
import { ImportRepository } from './repositories/import.repository';
import { DataProcessorService } from './services/data-processor.service';

@Injectable()
export class ImportsService {
  private readonly logger = new Logger('ImportsService');

  constructor(
    private prisma: PrismaService,
    private repository: ImportRepository,
    private processor: DataProcessorService
  ) {}

  /**
   * Create new import job
   */
  async create(dto: CreateImportDto, userId: string) {
    // Validate source URL is accessible
    try {
      const response = await fetch(dto.sourceUrl, { method: 'HEAD' });
      if (!response.ok && response.status !== 405) {
        // 405 is OK (method not allowed, but URL exists)
        throw new BadRequestException('Source URL is not accessible');
      }
    } catch (error) {
      this.logger.warn(`Could not verify source URL: ${dto.sourceUrl}`);
      // Don't fail on verification error - source might require auth
    }

    return this.repository.create({
      ...dto,
      status: 'pending',
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      createdBy: userId,
      updatedBy: userId,
    } as any);
  }

  /**
   * Get import by ID
   */
  async findById(id: string) {
    const importJob = await this.repository.findOne(id);

    if (!importJob) {
      throw new NotFoundException('Import not found');
    }

    return importJob;
  }

  /**
   * List all imports
   */
  async findAll(skip = 0, take = 20) {
    return this.repository.find({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update import
   */
  async update(id: string, dto: UpdateImportDto, userId: string) {
    await this.findById(id);

    return this.repository.update(id, {
      ...dto,
      updatedBy: userId,
    } as any);
  }

  /**
   * Delete import
   */
  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  /**
   * Get import statistics
   */
  async getStats() {
    return this.repository.getStats();
  }

  /**
   * Get imports by status
   */
  async getByStatus(status: string, skip = 0, take = 20) {
    return this.repository.findByStatus(status, { skip, take });
  }

  /**
   * Process import file
   */
  async processImport(importId: string) {
    const importJob = await this.findById(importId);

    try {
      // Update status to processing
      await this.repository.update(importId, {
        status: 'processing',
      } as any);

      // Fetch source data
      const sourceData = await this.fetchSource(importJob.sourceUrl);

      // Parse based on source type
      const records = await this.parseSource(
        sourceData,
        importJob.sourceType as any,
        importJob.config
      );

      this.logger.log(`Parsed ${records.length} records from ${importJob.sourceType}`);

      // Validate records
      const { valid, invalid } = this.processor.validateRecords(records);

      this.logger.log(`Validated ${valid.length} records, ${invalid.length} invalid`);

      // Transform and store records
      let processedCount = 0;
      let failedCount = invalid.length;

      for (const record of valid) {
        try {
          await this.storeRecord(record);
          processedCount++;
        } catch (error) {
          failedCount++;
          this.logger.error(`Failed to store record at line ${record.lineNumber}`, error);
        }
      }

      // Update import with results
      await this.repository.updateProgress(
        importId,
        processedCount,
        failedCount,
        records.length
      );

      return {
        importId,
        total: records.length,
        processed: processedCount,
        failed: failedCount,
        status: 'completed',
      };
    } catch (error) {
      // Update status to failed
      await this.repository.update(importId, {
        status: 'failed',
      } as any);

      throw error;
    }
  }

  /**
   * Get pending imports
   */
  async getPending() {
    return this.repository.findPending({ take: 10 });
  }

  /**
   * Cancel import
   */
  async cancelImport(id: string) {
    await this.findById(id);

    return this.repository.update(id, {
      status: 'cancelled',
    } as any);
  }

  /**
   * Get import results (valid and invalid records)
   */
  async getImportResults(id: string) {
    const importJob = await this.findById(id);

    return {
      importId: id,
      sourceType: importJob.sourceType,
      status: importJob.status,
      totalRecords: importJob.totalRecords,
      processedRecords: importJob.processedRecords,
      failedRecords: importJob.failedRecords,
      createdAt: importJob.createdAt,
      completedAt: importJob.updatedAt,
    };
  }

  // ========== Private Methods ==========

  /**
   * Fetch data from source
   */
  private async fetchSource(sourceUrl: string): Promise<Buffer | string> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text')) {
        return response.text();
      } else {
        return Buffer.from(await response.arrayBuffer());
      }
    } catch (error) {
      throw new BadRequestException(`Failed to fetch source: ${error}`);
    }
  }

  /**
   * Parse source data based on type
   */
  private async parseSource(
    data: Buffer | string,
    sourceType: string,
    config?: any
  ): Promise<any[]> {
    switch (sourceType) {
      case 'csv':
        return this.processor.parseCSV(data as string, config);
      case 'json':
        return this.processor.parseJSON(data as string, config);
      case 'excel':
        return this.processor.parseExcel(data as Buffer, config);
      default:
        throw new BadRequestException(`Unsupported source type: ${sourceType}`);
    }
  }

  /**
   * Store parsed record in database
   */
  private async storeRecord(record: any) {
    const { type } = record;

    if (type === 'entity') {
      const entity = this.processor.transformToEntity(record);
      return this.prisma.entity.create({
        data: entity,
      });
    } else if (type === 'relation') {
      const relation = this.processor.transformToRelation(record);
      return this.prisma.relation.create({
        data: relation,
      });
    } else if (type === 'event') {
      // Timeline event storage (if table exists)
      this.logger.debug('Event storage not yet implemented');
      return null;
    }

    return null;
  }
}
