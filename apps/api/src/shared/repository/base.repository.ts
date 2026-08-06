import { PrismaClient } from '@prisma/client';

export interface FindOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export interface FindOneOptions {
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async find(options?: FindOptions): Promise<T[]> {
    const { skip, take, orderBy, where, include, select } = options || {};

    return this.model.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
      select,
    });
  }

  async findOne(id: string, options?: FindOneOptions): Promise<T | null> {
    const { include, select } = options || {};

    return this.model.findUnique({
      where: { id },
      include,
      select,
    });
  }

  async findOneBy(where: Record<string, any>, options?: FindOneOptions): Promise<T | null> {
    const { include, select } = options || {};

    return this.model.findFirst({
      where,
      include,
      select,
    });
  }

  async count(where?: Record<string, any>): Promise<number> {
    return this.model.count({
      where,
    });
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }
}
