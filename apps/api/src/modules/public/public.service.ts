import { Injectable } from '@nestjs/common';
import { StruggleType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit?: number) {
    const take = limit || 20;

    const [entities, relations, sources] = await Promise.all([
      this.prisma.entity.findMany({
        where: {
          OR: [
            { canonicalName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          visibility: 'public',
        },
        include: { entityType: true },
        take,
      }),
      this.prisma.relation.findMany({
        where: {
          visibility: 'public',
        },
        include: {
          relationType: true,
          sourceEntity: true,
          targetEntity: true,
        },
        take,
      }),
      this.prisma.source.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
            { quoteExcerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { sourceType: true },
        take,
      }),
    ]);

    const results = [
      ...entities.map((e) => ({
        id: e.id,
        type: 'entity' as const,
        title: e.canonicalName,
        description: e.description,
        metadata: { entityType: e.entityType?.name },
      })),
      ...relations.map((r) => ({
        id: r.id,
        type: 'relation' as const,
        title: `${r.sourceEntity?.canonicalName} → ${r.targetEntity?.canonicalName}`,
        description: r.relationType?.name,
        metadata: {},
      })),
      ...sources.map((s) => ({
        id: s.id,
        type: 'source' as const,
        title: s.title,
        description: s.notes?.substring(0, 100),
        metadata: { sourceType: s.sourceType?.name, url: s.originalUrl },
      })),
    ];

    return results.slice(0, take);
  }

  async getPublicEntity(id: string) {
    return this.prisma.entity.findUnique({
      where: { id },
      include: {
        entityType: true,
        sourceEvidence: {
          include: {
            source: true,
          },
        },
      },
    });
  }

  async getPublicRelations(entityId?: string, limit?: number) {
    const take = limit || 100;

    return this.prisma.relation.findMany({
      where: {
        visibility: 'public',
        OR: entityId
          ? [
              { sourceEntityId: entityId },
              { targetEntityId: entityId },
            ]
          : undefined,
      },
      include: {
        relationType: true,
        sourceEntity: true,
        targetEntity: true,
        sourceEvidence: {
          include: { source: true },
        },
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicEntities(limit?: number) {
    const take = limit || 100;

    return this.prisma.entity.findMany({
      where: { visibility: 'public' },
      include: { entityType: true },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicLocations() {
    return this.prisma.location.findMany({
      include: {
        entities: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPublicStruggles(limit?: number) {
    const take = limit || 100;

    return this.prisma.struggle.findMany({
      where: { visibility: 'public' },
      include: {
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
      take,
      orderBy: { startDate: 'desc' },
    });
  }

  async getPublicStrugglesByType(type: string, limit?: number) {
    const take = limit || 50;

    return this.prisma.struggle.findMany({
      where: {
        visibility: 'public',
        type: type as StruggleType,
      },
      include: {
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
      take,
      orderBy: { startDate: 'desc' },
    });
  }

  async getPublicStruggleById(id: string) {
    return this.prisma.struggle.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { fullName: true } },
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
    });
  }
}
