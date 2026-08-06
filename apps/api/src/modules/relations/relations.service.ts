import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRelationDto, UpdateRelationDto } from './dto';
import { RelationsRepository } from './repositories/relations.repository';

@Injectable()
export class RelationsService {
  constructor(
    private prisma: PrismaService,
    private repository: RelationsRepository
  ) {}

  async create(dto: CreateRelationDto, userId: string) {
    // Validate self-relation
    if (dto.sourceEntityId === dto.targetEntityId) {
      throw new BadRequestException('Self-relations are not allowed');
    }

    // Validate entities exist
    await Promise.all([
      this.validateEntityExists(dto.sourceEntityId),
      this.validateEntityExists(dto.targetEntityId),
      this.validateRelationTypeExists(dto.relationTypeId),
    ]);

    const relation = await this.repository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    } as any);

    return this.enrichRelation(relation);
  }

  async findAll(filters?: {
    sourceEntityId?: string;
    targetEntityId?: string;
    relationTypeId?: string;
    visibility?: string;
    skip?: number;
    take?: number;
  }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    const relations = await this.repository.find({
      where: {
        ...(filters?.sourceEntityId && { sourceEntityId: filters.sourceEntityId }),
        ...(filters?.targetEntityId && { targetEntityId: filters.targetEntityId }),
        ...(filters?.relationTypeId && { relationTypeId: filters.relationTypeId }),
        ...(filters?.visibility && { visibility: filters.visibility }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
    });

    return relations;
  }

  async findById(id: string) {
    const relation = await this.repository.findOne(id, {
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    return relation;
  }

  async update(id: string, dto: UpdateRelationDto, userId: string) {
    await this.findById(id);

    const relation = await this.repository.update(id, {
      ...dto,
      updatedBy: userId,
    } as any);

    return this.enrichRelation(relation);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  /**
   * Get relation graph for an entity
   */
  async getEntityGraph(entityId: string, depth: number = 2) {
    // Validate entity exists
    await this.validateEntityExists(entityId);

    return this.repository.getEntityGraph(entityId, depth);
  }

  /**
   * Get statistics about relations
   */
  async getStats() {
    return this.repository.getStats();
  }

  /**
   * Find related entities for recommendation
   */
  async findRelatedEntities(entityId: string, limit: number = 10) {
    return this.repository.findRelatedEntities(entityId, limit);
  }

  /**
   * Find common connections between entities
   */
  async findCommonConnections(entityId1: string, entityId2: string) {
    await Promise.all([
      this.validateEntityExists(entityId1),
      this.validateEntityExists(entityId2),
    ]);

    return this.repository.findCommonConnections(entityId1, entityId2);
  }

  /**
   * Find pending verification relations
   */
  async findPendingVerification(skip: number = 0, take: number = 20) {
    return this.repository.findPendingVerification({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verify a relation
   */
  async verifyRelation(id: string, userId: string) {
    await this.findById(id);

    return this.repository.update(id, {
      verificationStatus: 'verified',
      updatedBy: userId,
    } as any);
  }

  private async enrichRelation(relation: any) {
    return this.prisma.relation.findUnique({
      where: { id: relation.id },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
    });
  }

  private async validateEntityExists(entityId: string) {
    const exists = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });
    if (!exists) {
      throw new BadRequestException(`Entity with id ${entityId} not found`);
    }
  }

  private async validateRelationTypeExists(relationTypeId: string) {
    const exists = await this.prisma.relationType.findUnique({
      where: { id: relationTypeId },
    });
    if (!exists) {
      throw new BadRequestException(`RelationType with id ${relationTypeId} not found`);
    }
  }
}
