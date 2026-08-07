import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

export interface SearchResult<T> {
  hits: T[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
}

export interface SearchOptions {
  q: string;
  limit?: number;
  offset?: number;
  filter?: string[];
  sort?: string[];
}

export interface IndexSettings {
  searchableAttributes?: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  displayedAttributes?: string[];
  distinctAttribute?: string;
  rankingRules?: string[];
  typoTolerance?: { enabled: boolean; minWordSizeForTypos?: { oneTypo: number; twoTypos: number } };
}

@Injectable()
export class MeilisearchService {
  private readonly logger = new Logger('MeilisearchService');
  private client: MeiliSearch | null = null;
  private enabled: boolean = false;
  private indexes = new Map<string, IndexSettings>();

  constructor() {
    this.initializeClient();
    this.setupDefaultIndexes();
  }

  private initializeClient() {
    const meilisearchUrl = process.env.MEILISEARCH_URL;
    const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;

    if (!meilisearchUrl) {
      this.logger.warn('Meilisearch not configured - search disabled');
      return;
    }

    try {
      this.client = new MeiliSearch({
        host: meilisearchUrl,
        apiKey: meilisearchApiKey,
      });
      this.logger.log(`Meilisearch configured: ${meilisearchUrl}`);
      this.enabled = true;
    } catch (error) {
      this.logger.error('Meilisearch initialization failed', error);
      this.enabled = false;
    }
  }

  private setupDefaultIndexes() {
    this.indexes.set('entities', {
      searchableAttributes: ['canonicalName', 'shortName', 'description', 'type'],
      filterableAttributes: ['type', 'status', 'visibility', 'verificationStatus', 'createdAt'],
      sortableAttributes: ['canonicalName', 'createdAt', 'updatedAt'],
      displayedAttributes: ['id', 'canonicalName', 'type', 'status', 'description'],
      rankingRules: [
        'sort',
        'words',
        'typo',
        'proximity',
        'attribute',
        'exactness',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
      },
    });

    this.indexes.set('relations', {
      searchableAttributes: ['summary', 'description'],
      filterableAttributes: ['status', 'verificationStatus', 'direction', 'createdAt'],
      sortableAttributes: ['summary', 'createdAt'],
      displayedAttributes: ['id', 'sourceEntityId', 'targetEntityId', 'status', 'summary'],
    });

    this.indexes.set('timeline', {
      searchableAttributes: ['title', 'description'],
      filterableAttributes: ['eventType', 'status', 'verificationStatus', 'occurredAt'],
      sortableAttributes: ['title', 'occurredAt'],
      displayedAttributes: ['id', 'entityId', 'eventType', 'title', 'occurredAt'],
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async searchEntities<T extends { id: string }>(
    options: SearchOptions
  ): Promise<SearchResult<T>> {
    if (!this.enabled || !this.client) return this.getMockResults<T>(options);

    try {
      const index = this.client.index('entities');
      const results = await index.search(options.q, {
        limit: options.limit || 10,
        offset: options.offset || 0,
        filter: options.filter,
        sort: options.sort,
      });
      return results as SearchResult<T>;
    } catch (error) {
      this.logger.error('Search failed', error);
      return this.getMockResults<T>(options);
    }
  }

  async searchRelations<T extends { id: string }>(
    options: SearchOptions
  ): Promise<SearchResult<T>> {
    if (!this.enabled || !this.client) return this.getMockResults<T>(options);

    try {
      const index = this.client.index('relations');
      const results = await index.search(options.q, {
        limit: options.limit || 10,
        offset: options.offset || 0,
        filter: options.filter,
        sort: options.sort,
      });
      return results as SearchResult<T>;
    } catch (error) {
      this.logger.error('Relation search failed', error);
      return this.getMockResults<T>(options);
    }
  }

  async searchTimeline<T extends { id: string }>(
    options: SearchOptions
  ): Promise<SearchResult<T>> {
    if (!this.enabled || !this.client) return this.getMockResults<T>(options);

    try {
      const index = this.client.index('timeline');
      const results = await index.search(options.q, {
        limit: options.limit || 10,
        offset: options.offset || 0,
        filter: options.filter,
        sort: options.sort,
      });
      return results as SearchResult<T>;
    } catch (error) {
      this.logger.error('Timeline search failed', error);
      return this.getMockResults<T>(options);
    }
  }

  async indexEntity(id: string, data: Record<string, any>): Promise<void> {
    if (!this.enabled || !this.client) {
      this.logger.debug(`Entity ${id} indexed (mock)`);
      return;
    }

    try {
      const index = this.client.index('entities');
      await index.addDocuments([{ id, ...data }]);
      this.logger.debug(`Entity ${id} indexed`);
    } catch (error) {
      this.logger.error(`Failed to index entity ${id}`, error);
    }
  }

  async indexRelation(id: string, data: Record<string, any>): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      const index = this.client.index('relations');
      await index.addDocuments([{ id, ...data }]);
    } catch (error) {
      this.logger.error(`Failed to index relation ${id}`, error);
    }
  }

  async indexTimelineEvent(id: string, data: Record<string, any>): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      const index = this.client.index('timeline');
      await index.addDocuments([{ id, ...data }]);
    } catch (error) {
      this.logger.error(`Failed to index timeline event ${id}`, error);
    }
  }

  async removeEntity(id: string): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      const index = this.client.index('entities');
      await index.deleteDocument(id);
    } catch (error) {
      this.logger.error(`Failed to remove entity ${id}`, error);
    }
  }

  async removeRelation(id: string): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      const index = this.client.index('relations');
      await index.deleteDocument(id);
    } catch (error) {
      this.logger.error(`Failed to remove relation ${id}`, error);
    }
  }

  async removeTimelineEvent(id: string): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      const index = this.client.index('timeline');
      await index.deleteDocument(id);
    } catch (error) {
      this.logger.error(`Failed to remove timeline event ${id}`, error);
    }
  }

  async updateEntity(id: string, data: Record<string, any>): Promise<void> {
    await this.removeEntity(id);
    await this.indexEntity(id, data);
  }

  async clearIndexes(): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      for (const indexName of this.indexes.keys()) {
        const index = this.client.index(indexName);
        await index.deleteAllDocuments();
      }
      this.logger.info('Indexes cleared');
    } catch (error) {
      this.logger.error('Failed to clear indexes', error);
    }
  }

  async createIndexes(): Promise<void> {
    if (!this.enabled || !this.client) return;

    try {
      for (const [name, settings] of this.indexes) {
        await this.client.createIndex(name);
        const index = this.client.index(name);
        await index.updateSettings(settings);
      }
      this.logger.info('Indexes created/updated');
    } catch (error) {
      this.logger.error('Failed to create indexes', error);
    }
  }

  private getMockResults<T extends { id: string }>(options: SearchOptions): SearchResult<T> {
    return {
      hits: [],
      estimatedTotalHits: 0,
      limit: options.limit || 10,
      offset: options.offset || 0,
      processingTimeMs: 0,
    };
  }
}
