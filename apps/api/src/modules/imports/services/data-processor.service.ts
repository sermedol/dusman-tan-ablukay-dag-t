import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface ImportRecord {
  type: 'entity' | 'relation' | 'event';
  data: Record<string, any>;
  source: string;
  lineNumber?: number;
  errors?: string[];
}

@Injectable()
export class DataProcessorService {
  private readonly logger = new Logger('DataProcessorService');

  /**
   * Parse CSV data
   */
  async parseCSV(csvContent: string, config?: any): Promise<ImportRecord[]> {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const delimiter = config?.delimiter || ',';
    const headerRow = config?.headerRow || 0;
    const headers = lines[headerRow].split(delimiter).map((h) => h.trim());

    const records: ImportRecord[] = [];

    for (let i = headerRow + 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim());
      const record: Record<string, any> = {};

      headers.forEach((header, idx) => {
        record[header] = values[idx] || null;
      });

      // Apply column mappings if provided
      const mappedRecord = this.applyMappings(record, config?.mappings);

      records.push({
        type: this.detectRecordType(mappedRecord),
        data: mappedRecord,
        source: 'csv',
        lineNumber: i + 1,
      });
    }

    return records;
  }

  /**
   * Parse Excel data (placeholder - requires xlsx library)
   */
  async parseExcel(buffer: Buffer, config?: any): Promise<ImportRecord[]> {
    this.logger.warn('Excel parsing requires xlsx library installation');
    // Would use: const XLSX = require('xlsx');
    return [];
  }

  /**
   * Parse JSON data
   */
  async parseJSON(jsonContent: string, config?: any): Promise<ImportRecord[]> {
    try {
      const data = JSON.parse(jsonContent);
      const records = Array.isArray(data) ? data : [data];

      return records.map((record, idx) => ({
        type: this.detectRecordType(record),
        data: record,
        source: 'json',
        lineNumber: idx + 1,
      }));
    } catch (error) {
      throw new BadRequestException('Invalid JSON format');
    }
  }

  /**
   * Validate import records
   */
  validateRecords(records: ImportRecord[]): {
    valid: ImportRecord[];
    invalid: ImportRecord[];
  } {
    const valid: ImportRecord[] = [];
    const invalid: ImportRecord[] = [];

    for (const record of records) {
      const errors = this.validateRecord(record);

      if (errors.length > 0) {
        invalid.push({ ...record, errors });
      } else {
        valid.push(record);
      }
    }

    return { valid, invalid };
  }

  /**
   * Transform records to entity format
   */
  transformToEntity(record: ImportRecord): any {
    const { data } = record;

    return {
      canonicalName: data.name || data.canonicalName || '',
      shortName: data.shortName || data.short_name || undefined,
      description: data.description || data.desc || undefined,
      type: data.type || data.entityType || 'unknown',
      status: data.status || 'active',
      visibility: data.visibility || 'internal',
      verificationStatus: data.verificationStatus || 'unverified',
      websiteUrl: data.website || data.websiteUrl || undefined,
      foundedAt: data.foundedAt || data.founded_at ? new Date(data.foundedAt || data.founded_at) : undefined,
      metadataJson: this.extractMetadata(data),
    };
  }

  /**
   * Transform records to relation format
   */
  transformToRelation(record: ImportRecord): any {
    const { data } = record;

    return {
      sourceEntityId: data.sourceEntityId || data.source_entity_id || '',
      targetEntityId: data.targetEntityId || data.target_entity_id || '',
      relationTypeId: data.relationTypeId || data.relation_type_id || '',
      direction: data.direction || 'forward',
      summary: data.summary || undefined,
      description: data.description || undefined,
      status: data.status || 'active',
      verificationStatus: data.verificationStatus || 'unverified',
      confidenceLevel: data.confidence || data.confidenceLevel || 'medium',
      validFrom: data.validFrom || data.valid_from ? new Date(data.validFrom || data.valid_from) : undefined,
      validUntil: data.validUntil || data.valid_until ? new Date(data.validUntil || data.valid_until) : undefined,
    };
  }

  /**
   * Detect record type from data
   */
  private detectRecordType(
    data: Record<string, any>
  ): 'entity' | 'relation' | 'event' {
    // Check for relation markers
    if (
      (data.sourceEntityId || data.source_entity_id) &&
      (data.targetEntityId || data.target_entity_id)
    ) {
      return 'relation';
    }

    // Check for event markers
    if (data.occurredAt || data.occurred_at || data.eventType || data.event_type) {
      return 'event';
    }

    // Default to entity
    return 'entity';
  }

  /**
   * Validate individual record
   */
  private validateRecord(record: ImportRecord): string[] {
    const errors: string[] = [];
    const { type, data } = record;

    if (type === 'entity') {
      if (!data.name && !data.canonicalName) {
        errors.push('Entity name is required');
      }
      if (!data.type && !data.entityType) {
        errors.push('Entity type is required');
      }
    } else if (type === 'relation') {
      if (!data.sourceEntityId && !data.source_entity_id) {
        errors.push('Source entity ID is required');
      }
      if (!data.targetEntityId && !data.target_entity_id) {
        errors.push('Target entity ID is required');
      }
      if (!data.relationTypeId && !data.relation_type_id) {
        errors.push('Relation type ID is required');
      }
    } else if (type === 'event') {
      if (!data.title) {
        errors.push('Event title is required');
      }
      if (!data.occurredAt && !data.occurred_at) {
        errors.push('Event date is required');
      }
    }

    return errors;
  }

  /**
   * Apply column mappings
   */
  private applyMappings(
    record: Record<string, any>,
    mappings?: Record<string, string>
  ): Record<string, any> {
    if (!mappings) return record;

    const mapped: Record<string, any> = { ...record };

    for (const [source, target] of Object.entries(mappings)) {
      if (source in mapped) {
        mapped[target] = mapped[source];
        if (source !== target) {
          delete mapped[source];
        }
      }
    }

    return mapped;
  }

  /**
   * Extract metadata from record
   */
  private extractMetadata(data: Record<string, any>): Record<string, any> {
    const excluded = new Set([
      'id',
      'name',
      'canonicalName',
      'shortName',
      'short_name',
      'description',
      'desc',
      'type',
      'entityType',
      'status',
      'visibility',
      'verificationStatus',
      'verification_status',
      'website',
      'websiteUrl',
      'foundedAt',
      'founded_at',
      'closedAt',
      'closed_at',
      'sourceEntityId',
      'source_entity_id',
      'targetEntityId',
      'target_entity_id',
      'relationTypeId',
      'relation_type_id',
      'direction',
      'confidence',
      'confidenceLevel',
      'validFrom',
      'valid_from',
      'validUntil',
      'valid_until',
      'occurredAt',
      'occurred_at',
      'eventType',
      'event_type',
      'title',
    ]);

    const metadata: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (!excluded.has(key) && value !== null && value !== undefined) {
        metadata[key] = value;
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }
}
