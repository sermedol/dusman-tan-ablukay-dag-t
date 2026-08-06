import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@umut-sen/database';
import { StruggleType, StruggleStatus } from '@prisma/client';

@Injectable()
export class StrugglesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    type: StruggleType;
    status?: StruggleStatus;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    latitude?: number;
    longitude?: number;
    participants?: string;
    outcome?: string;
    relatedEntities?: string;
    visibility?: string;
    createdBy: string;
  }) {
    const slug = this.generateSlug(data.title);

    return this.prisma.struggle.create({
      data: {
        ...data,
        slug,
        updatedBy: data.createdBy,
      },
      include: {
        createdByUser: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  async findAll(filters?: {
    type?: StruggleType;
    status?: StruggleStatus;
    visibility?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.visibility) where.visibility = filters.visibility;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.struggle.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, email: true, fullName: true } },
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const struggle = await this.prisma.struggle.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, email: true, fullName: true } },
        updatedByUser: { select: { id: true, email: true, fullName: true } },
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
    });

    if (!struggle) throw new NotFoundException(`Struggle ${id} not found`);
    return struggle;
  }

  async findBySlug(slug: string) {
    const struggle = await this.prisma.struggle.findUnique({
      where: { slug },
      include: {
        createdByUser: { select: { id: true, email: true, fullName: true } },
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
    });

    if (!struggle) throw new NotFoundException(`Struggle not found`);
    return struggle;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: StruggleType;
      status?: StruggleStatus;
      startDate?: Date;
      endDate?: Date;
      location?: string;
      latitude?: number;
      longitude?: number;
      participants?: string;
      outcome?: string;
      relatedEntities?: string;
      visibility?: string;
      updatedBy: string;
    }
  ) {
    const struggle = await this.findOne(id);

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.title && data.title !== struggle.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    return this.prisma.struggle.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, email: true, fullName: true } },
        updatedByUser: { select: { id: true, email: true, fullName: true } },
        sourceEvidence: { include: { source: true } },
        tags: true,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.struggle.delete({ where: { id } });
  }

  async addSource(
    struggleId: string,
    sourceId: string,
    data: { excerpt?: string; pageNumber?: number; notes?: string }
  ) {
    await this.findOne(struggleId);

    return this.prisma.struggleSourceEvidence.create({
      data: {
        struggleId,
        sourceId,
        excerpt: data.excerpt,
        pageNumber: data.pageNumber,
        notes: data.notes,
      },
      include: { source: true },
    });
  }

  async removeSource(struggleId: string, sourceId: string) {
    return this.prisma.struggleSourceEvidence.delete({
      where: {
        struggleId_sourceId: {
          struggleId,
          sourceId,
        },
      },
    });
  }

  async addTag(struggleId: string, tag: string) {
    await this.findOne(struggleId);

    return this.prisma.struggleTag.create({
      data: { struggleId, tag },
    });
  }

  async removeTag(struggleId: string, tag: string) {
    return this.prisma.struggleTag.deleteMany({
      where: { struggleId, tag },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
