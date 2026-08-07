import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  // Entity verification workflow
  async submitEntity(entityId: string, userId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    // Check if entity has at least one source
    const hasSource = await this.prisma.entitySourceEvidence.findFirst({
      where: { entityId },
    });

    if (!hasSource) {
      throw new BadRequestException('Entity must have at least one source before submission');
    }

    // Update entity status to submitted
    return this.prisma.entity.update({
      where: { id: entityId },
      data: {
        visibility: 'internal',
        verificationStatus: 'needs_review',
        updatedBy: userId,
      },
    });
  }

  async verifyEntity(entityId: string, approve: boolean, userId: string, _reason?: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    if (approve) {
      return this.prisma.entity.update({
        where: { id: entityId },
        data: {
          verificationStatus: 'verified',
          updatedBy: userId,
        },
      });
    } else {
      return this.prisma.entity.update({
        where: { id: entityId },
        data: {
          verificationStatus: 'needs_review',
          visibility: 'draft',
          updatedBy: userId,
        },
      });
    }
  }

  async publishEntity(entityId: string, userId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        sourceEvidence: true,
      },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    if (entity.verificationStatus !== 'verified') {
      throw new BadRequestException('Entity must be verified before publishing');
    }

    if (entity.sourceEvidence.length === 0) {
      throw new BadRequestException('Entity must have at least one source');
    }

    // Create revision snapshot
    const revision = await this.prisma.revision.create({
      data: {
        resourceType: 'entity',
        resourceId: entityId,
        revisionNumber: entity.version + 1,
        snapshotJson: entity,
        changeSummary: 'Published',
        createdBy: userId,
      },
    });

    // Publish entity
    return this.prisma.entity.update({
      where: { id: entityId },
      data: {
        visibility: 'public',
        status: 'active',
        publishedAt: new Date(),
        publishedRevisionId: revision.id,
        updatedBy: userId,
      },
    });
  }

  // Get pending items for verification
  async getPendingEntities(filters?: { skip?: number; take?: number }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    return this.prisma.entity.findMany({
      where: {
        verificationStatus: 'needs_review',
        visibility: 'internal',
      },
      include: {
        entityType: true,
        sourceEvidence: {
          include: {
            source: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPendingRelations(filters?: { skip?: number; take?: number }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    return this.prisma.relation.findMany({
      where: {
        verificationStatus: 'needs_review',
        visibility: 'internal',
      },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
        sourceEvidence: {
          include: {
            source: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Relation verification workflow
  async submitRelation(relationId: string, userId: string) {
    const relation = await this.prisma.relation.findUnique({
      where: { id: relationId },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    const hasSource = await this.prisma.relationSourceEvidence.findFirst({
      where: { relationId },
    });

    if (!hasSource) {
      throw new BadRequestException('Relation must have at least one source before submission');
    }

    return this.prisma.relation.update({
      where: { id: relationId },
      data: {
        visibility: 'internal',
        verificationStatus: 'needs_review',
        updatedBy: userId,
      },
    });
  }

  async verifyRelation(relationId: string, approve: boolean, userId: string) {
    const relation = await this.prisma.relation.findUnique({
      where: { id: relationId },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    if (approve) {
      return this.prisma.relation.update({
        where: { id: relationId },
        data: {
          verificationStatus: 'verified',
          updatedBy: userId,
        },
      });
    } else {
      return this.prisma.relation.update({
        where: { id: relationId },
        data: {
          verificationStatus: 'needs_review',
          visibility: 'draft',
          updatedBy: userId,
        },
      });
    }
  }

  async publishRelation(relationId: string, userId: string) {
    const relation = await this.prisma.relation.findUnique({
      where: { id: relationId },
      include: {
        sourceEvidence: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    if (relation.verificationStatus !== 'verified') {
      throw new BadRequestException('Relation must be verified before publishing');
    }

    if (relation.sourceEvidence.length === 0) {
      throw new BadRequestException('Relation must have at least one source');
    }

    const revision = await this.prisma.revision.create({
      data: {
        resourceType: 'relation',
        resourceId: relationId,
        revisionNumber: relation.version + 1,
        snapshotJson: relation,
        changeSummary: 'Published',
        createdBy: userId,
      },
    });

    return this.prisma.relation.update({
      where: { id: relationId },
      data: {
        visibility: 'public',
        status: 'active',
        publishedAt: new Date(),
        publishedRevisionId: revision.id,
        updatedBy: userId,
      },
    });
  }
}
