import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BaseRepository, FindOptions } from '../../../shared/repository/base.repository';
import { Prisma } from '@prisma/client';

type TimelineEventCreateInput = Prisma.TimelineEventCreateInput;
type TimelineEventUpdateInput = Prisma.TimelineEventUpdateInput;

export interface TimelineEventModel {
  id: string;
  entityId: string;
  eventType: string;
  title: string;
  description?: string | null;
  occurredAt: Date;
  endedAt?: Date | null;
  status: string;
  verificationStatus: string;
  source?: string | null;
  metadataJson?: Record<string, any> | null;
  relatedRelationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TimelineEventRepository extends BaseRepository<
  TimelineEventModel,
  TimelineEventCreateInput,
  TimelineEventUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma);
    // Note: This assumes a TimelineEvent model exists in Prisma schema
    // If not, we'll need to create it
    this.model = prisma.timelineEvent || null;
  }

  /**
   * Find events for an entity ordered by date
   */
  async findByEntity(
    entityId: string,
    options?: FindOptions
  ): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        entityId,
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  /**
   * Find events by type
   */
  async findByType(
    eventType: string,
    options?: FindOptions
  ): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        eventType,
      },
    });
  }

  /**
   * Find events within a date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindOptions
  ): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        occurredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { occurredAt: 'asc' },
    });
  }

  /**
   * Find verified events
   */
  async findVerified(options?: FindOptions): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'verified',
      },
    });
  }

  /**
   * Find events pending verification
   */
  async findPendingVerification(options?: FindOptions): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'unverified',
      },
    });
  }

  /**
   * Get timeline statistics
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    byType: Record<string, number>;
  }> {
    if (!this.model) {
      return { total: 0, verified: 0, unverified: 0, byType: {} };
    }

    const total = await this.count();
    const verified = await this.count({ verificationStatus: 'verified' });
    const unverified = await this.count({ verificationStatus: 'unverified' });

    return {
      total,
      verified,
      unverified,
      byType: {},
    };
  }

  /**
   * Get timeline for entity (return ordered events with pagination)
   */
  async getEntityTimeline(
    entityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    events: TimelineEventModel[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (!this.model) {
      return { events: [], total: 0, page, totalPages: 0 };
    }

    const skip = (page - 1) * limit;
    const total = await this.count({ entityId });

    const events = await this.find({
      where: { entityId },
      skip,
      take: limit,
      orderBy: { occurredAt: 'desc' },
    });

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find related events (events linked to same relation)
   */
  async findRelatedEvents(
    relationId: string,
    options?: FindOptions
  ): Promise<TimelineEventModel[]> {
    if (!this.model) return [];

    return this.find({
      ...options,
      where: {
        ...options?.where,
        relatedRelationId: relationId,
      },
      orderBy: { occurredAt: 'desc' },
    });
  }
}
