import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventDto,
} from './dto';
import { TimelineEventRepository } from './repositories/timeline-event.repository';

@Injectable()
export class TimelineService {
  constructor(
    private prisma: PrismaService,
    private repository: TimelineEventRepository
  ) {}

  async create(dto: CreateTimelineEventDto, userId: string) {
    // Validate entity exists
    const entity = await this.prisma.entity.findUnique({
      where: { id: dto.entityId },
    });

    if (!entity) {
      throw new BadRequestException(`Entity with id ${dto.entityId} not found`);
    }

    return this.repository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    } as any);
  }

  async findAll(filters?: {
    entityId?: string;
    eventType?: string;
    status?: string;
    verificationStatus?: string;
    skip?: number;
    take?: number;
  }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    return this.repository.find({
      where: {
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.eventType && { eventType: filters.eventType }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.verificationStatus && {
          verificationStatus: filters.verificationStatus,
        }),
      },
      skip,
      take,
      orderBy: { occurredAt: 'desc' },
    });
  }

  async findById(id: string) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Timeline event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateTimelineEventDto, userId: string) {
    await this.findById(id);

    return this.repository.update(id, {
      ...dto,
      updatedBy: userId,
    } as any);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  /**
   * Get timeline for an entity
   */
  async getEntityTimeline(entityId: string, page: number = 1, limit: number = 20) {
    // Validate entity exists
    await this.validateEntityExists(entityId);

    return this.repository.getEntityTimeline(entityId, page, limit);
  }

  /**
   * Get timeline statistics
   */
  async getStats() {
    return this.repository.getStats();
  }

  /**
   * Find events by type
   */
  async findByType(eventType: string, skip?: number, take?: number) {
    return this.repository.findByType(eventType, {
      skip: skip || 0,
      take: take || 20,
    });
  }

  /**
   * Find events within date range
   */
  async findByDateRange(startDate: Date, endDate: Date, skip?: number, take?: number) {
    return this.repository.findByDateRange(startDate, endDate, {
      skip: skip || 0,
      take: take || 20,
    });
  }

  /**
   * Find verified events
   */
  async findVerified(skip?: number, take?: number) {
    return this.repository.findVerified({
      skip: skip || 0,
      take: take || 20,
    });
  }

  /**
   * Find events pending verification
   */
  async findPendingVerification(skip?: number, take?: number) {
    return this.repository.findPendingVerification({
      skip: skip || 0,
      take: take || 20,
    });
  }

  /**
   * Verify a timeline event
   */
  async verifyEvent(id: string, userId: string) {
    await this.findById(id);

    return this.repository.update(id, {
      verificationStatus: 'verified',
      updatedBy: userId,
    } as any);
  }

  /**
   * Find events related to a relation
   */
  async findRelatedToRelation(relationId: string) {
    return this.repository.findRelatedEvents(relationId);
  }

  private async validateEntityExists(entityId: string) {
    const exists = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!exists) {
      throw new BadRequestException(`Entity with id ${entityId} not found`);
    }
  }
}
