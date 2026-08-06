import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateSourceDto, UpdateSourceDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSourceDto, userId: string) {
    // Validate source type exists
    await this.validateSourceTypeExists(dto.sourceTypeId);

    // Generate checksum if file URL provided
    const checksum = dto.originalUrl ? this.generateChecksum(dto.originalUrl) : null;

    return this.prisma.source.create({
      data: {
        ...dto,
        checksum,
        createdBy: userId,
      },
      include: {
        sourceType: true,
        file: true,
      },
    });
  }

  async findAll(filters?: {
    sourceTypeId?: string;
    reliabilityLevel?: string;
    verificationStatus?: string;
    skip?: number;
    take?: number;
  }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    return this.prisma.source.findMany({
      where: {
        ...(filters?.sourceTypeId && { sourceTypeId: filters.sourceTypeId }),
        ...(filters?.reliabilityLevel && { reliabilityLevel: filters.reliabilityLevel }),
        ...(filters?.verificationStatus && { verificationStatus: filters.verificationStatus }),
      },
      include: {
        sourceType: true,
        file: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        sourceType: true,
        file: true,
        entityEvidence: {
          include: {
            entity: true,
          },
        },
        relationEvidence: {
          include: {
            relation: true,
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async findByChecksum(checksum: string) {
    return this.prisma.source.findUnique({
      where: { checksum },
      include: {
        sourceType: true,
      },
    });
  }

  async update(id: string, dto: UpdateSourceDto, userId: string) {
    await this.findById(id);

    return this.prisma.source.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
      include: {
        sourceType: true,
        file: true,
      },
    });
  }

  async linkToEntity(sourceId: string, entityId: string, evidenceType: string) {
    await Promise.all([this.findById(sourceId), this.validateEntityExists(entityId)]);

    return this.prisma.entitySourceEvidence.upsert({
      where: {
        entityId_sourceId_evidenceType: {
          entityId,
          sourceId,
          evidenceType,
        },
      },
      create: {
        entityId,
        sourceId,
        evidenceType,
      },
      update: {},
      include: {
        entity: true,
        source: true,
      },
    });
  }

  async linkToRelation(sourceId: string, relationId: string) {
    await Promise.all([this.findById(sourceId), this.validateRelationExists(relationId)]);

    return this.prisma.relationSourceEvidence.upsert({
      where: {
        relationId_sourceId: {
          relationId,
          sourceId,
        },
      },
      create: {
        relationId,
        sourceId,
      },
      update: {},
      include: {
        relation: true,
        source: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.source.delete({
      where: { id },
    });
  }

  private async validateSourceTypeExists(sourceTypeId: string) {
    const exists = await this.prisma.sourceType.findUnique({
      where: { id: sourceTypeId },
    });
    if (!exists) {
      throw new BadRequestException(`SourceType with id ${sourceTypeId} not found`);
    }
  }

  private async validateEntityExists(entityId: string) {
    const exists = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });
    if (!exists) {
      throw new BadRequestException(`Entity with id ${entityId} not found`);
    }
  }

  private async validateRelationExists(relationId: string) {
    const exists = await this.prisma.relation.findUnique({
      where: { id: relationId },
    });
    if (!exists) {
      throw new BadRequestException(`Relation with id ${relationId} not found`);
    }
  }

  private generateChecksum(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex');
  }
}
