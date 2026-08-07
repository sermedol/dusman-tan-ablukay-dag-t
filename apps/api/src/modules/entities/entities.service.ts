import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { RedisService } from '../../shared/cache/redis.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';

type EntityWithRelations = Prisma.EntityGetPayload<{
  include: { entityType: true; primaryLocation: true };
}>;

@Injectable()
export class EntitiesService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisService,
  ) {}

  async create(dto: CreateEntityDto, userId: string) {
    const slug = this.generateSlug(dto.canonicalName);

    // Check slug uniqueness
    const existing = await this.prisma.entity.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Slug must be unique');
    }

    return this.prisma.entity.create({
      data: {
        ...dto,
        metadataJson: dto.metadataJson as Prisma.InputJsonValue | undefined,
        slug,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        entityType: true,
      },
    });
  }

  async findAll(filters?: {
    entityTypeId?: string;
    visibility?: string;
    skip?: number;
    take?: number;
  }) {
    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    return this.prisma.entity.findMany({
      where: {
        ...(filters?.entityTypeId && { entityTypeId: filters.entityTypeId }),
        ...(filters?.visibility && { visibility: filters.visibility as Visibility }),
      },
      include: {
        entityType: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const cached = await this.cache.get<EntityWithRelations>(`entity:${id}`);
    if (cached) return cached;

    const entity = await this.prisma.entity.findUnique({
      where: { id },
      include: {
        entityType: true,
        primaryLocation: true,
      },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    await this.cache.set(`entity:${id}`, entity, 'entitySearch');
    return entity;
  }

  async findBySlug(slug: string) {
    const cached = await this.cache.get<EntityWithRelations>(`entity:slug:${slug}`);
    if (cached) return cached;

    const entity = await this.prisma.entity.findUnique({
      where: { slug },
      include: {
        entityType: true,
        primaryLocation: true,
      },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    await this.cache.set(`entity:slug:${slug}`, entity, 'entitySearch');
    return entity;
  }

  async update(id: string, dto: UpdateEntityDto, userId: string) {
    const entity = await this.findById(id);

    const updated = await this.prisma.entity.update({
      where: { id },
      data: {
        ...dto,
        metadataJson: dto.metadataJson as Prisma.InputJsonValue | undefined,
        updatedBy: userId,
      },
      include: {
        entityType: true,
      },
    });

    await this.cache.del(`entity:${id}`, `entity:slug:${entity.slug}`);
    return updated;
  }

  async delete(id: string) {
    const entity = await this.findById(id);
    const result = await this.prisma.entity.delete({
      where: { id },
    });

    await this.cache.del(`entity:${id}`, `entity:slug:${entity.slug}`);
    return result;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
