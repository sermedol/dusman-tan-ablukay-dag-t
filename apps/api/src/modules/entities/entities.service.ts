import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';

@Injectable()
export class EntitiesService {
  constructor(private prisma: PrismaService) {}

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
        ...(filters?.visibility && { visibility: filters.visibility }),
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

    return entity;
  }

  async findBySlug(slug: string) {
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

    return entity;
  }

  async update(id: string, dto: UpdateEntityDto, userId: string) {
    const entity = await this.findById(id);

    return this.prisma.entity.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
      include: {
        entityType: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.entity.delete({
      where: { id },
    });
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
