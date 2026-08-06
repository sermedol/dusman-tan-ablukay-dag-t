import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRelationDto, UpdateRelationDto } from './dto';

@Injectable()
export class RelationsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.relation.create({
      data: {
        ...dto,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
    });
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

    return this.prisma.relation.findMany({
      where: {
        ...(filters?.sourceEntityId && { sourceEntityId: filters.sourceEntityId }),
        ...(filters?.targetEntityId && { targetEntityId: filters.targetEntityId }),
        ...(filters?.relationTypeId && { relationTypeId: filters.relationTypeId }),
        ...(filters?.visibility && { visibility: filters.visibility }),
      },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const relation = await this.prisma.relation.findUnique({
      where: { id },
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

    return this.prisma.relation.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.relation.delete({
      where: { id },
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
