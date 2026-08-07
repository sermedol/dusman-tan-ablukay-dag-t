import { Injectable } from '@nestjs/common';
import { Entity, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BaseRepository, FindOptions } from '../../../shared/repository/base.repository';

type EntityCreateInput = Prisma.EntityCreateInput;
type EntityUpdateInput = Prisma.EntityUpdateInput;

@Injectable()
export class EntitiesRepository extends BaseRepository<Entity, EntityCreateInput, EntityUpdateInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
    this.model = prisma.entity;
  }

  /**
   * Find entities by type
   */
  async findByType(entityTypeId: string, options?: FindOptions): Promise<Entity[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        entityTypeId,
      },
    });
  }

  /**
   * Search entities by canonical name (case-insensitive)
   */
  async searchByName(query: string, options?: FindOptions): Promise<Entity[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        canonicalName: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Find entities by status
   */
  async findByStatus(status: string, options?: FindOptions): Promise<Entity[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        status,
      },
    });
  }

  /**
   * Find verified entities
   */
  async findVerified(options?: FindOptions): Promise<Entity[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'verified',
      },
    });
  }

  /**
   * Find entities requiring verification review
   */
  async findPendingVerification(options?: FindOptions): Promise<Entity[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'needs_review',
      },
    });
  }

  /**
   * Count entities by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }

  /**
   * Count verified entities
   */
  async countVerified(): Promise<number> {
    return this.count({ verificationStatus: 'verified' });
  }

  /**
   * Get entity statistics
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    pendingVerification: number;
    active: number;
  }> {
    const [total, verified, pendingVerification, active] = await Promise.all([
      this.count(),
      this.count({ verificationStatus: 'verified' }),
      this.count({ verificationStatus: 'needs_review' }),
      this.count({ status: 'active' }),
    ]);

    return { total, verified, pendingVerification, active };
  }
}
