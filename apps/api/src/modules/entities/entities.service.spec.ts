import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../shared/cache/redis.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';
import { EntitiesService } from './entities.service';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockEntity = {
    id: '1',
    canonicalName: 'Test Entity',
    slug: 'test-entity',
    shortName: null,
    description: 'Test Description',
    type: 'organization',
    status: 'active',
    visibility: 'public',
    verificationStatus: 'verified',
    websiteUrl: null,
    foundedAt: null,
    metadataJson: null,
    entityTypeId: null,
    createdBy: 'user1',
    updatedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        {
          provide: PrismaService,
          useValue: {
            entity: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const dto: CreateEntityDto = {
        canonicalName: 'Test Entity',
        type: 'organization',
        description: 'Test Description',
      };

      jest.spyOn(prismaService.entity, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.entity, 'create').mockResolvedValue(mockEntity);

      const result = await service.create(dto, 'user1');

      expect(result).toEqual(mockEntity);
      expect(prismaService.entity.create).toHaveBeenCalled();
    });

    it('should throw error if slug is not unique', async () => {
      const dto: CreateEntityDto = {
        canonicalName: 'Test Entity',
        type: 'organization',
      };

      jest.spyOn(prismaService.entity, 'findUnique').mockResolvedValue(mockEntity);

      await expect(service.create(dto, 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return cached entity if available', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(mockEntity);

      const result = await service.findById('1');

      expect(result).toEqual(mockEntity);
      expect(redisService.get).toHaveBeenCalledWith('entity:1');
      expect(prismaService.entity.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not in cache', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.entity, 'findUnique').mockResolvedValue(mockEntity);
      jest.spyOn(redisService, 'set').mockResolvedValue(true);

      const result = await service.findById('1');

      expect(result).toEqual(mockEntity);
      expect(redisService.get).toHaveBeenCalledWith('entity:1');
      expect(prismaService.entity.findUnique).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if entity not found', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.entity, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update entity and invalidate cache', async () => {
      const dto: UpdateEntityDto = {
        canonicalName: 'Updated Entity',
      };

      jest.spyOn(redisService, 'get').mockResolvedValue(mockEntity);
      jest.spyOn(prismaService.entity, 'update').mockResolvedValue({
        ...mockEntity,
        canonicalName: 'Updated Entity',
      });
      jest.spyOn(redisService, 'del').mockResolvedValue(2);

      const result = await service.update('1', dto, 'user1');

      expect(result.canonicalName).toBe('Updated Entity');
      expect(redisService.del).toHaveBeenCalledWith('entity:1', expect.any(String));
    });
  });

  describe('delete', () => {
    it('should delete entity and invalidate cache', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(mockEntity);
      jest.spyOn(prismaService.entity, 'delete').mockResolvedValue(mockEntity);
      jest.spyOn(redisService, 'del').mockResolvedValue(2);

      const result = await service.delete('1');

      expect(result).toEqual(mockEntity);
      expect(redisService.del).toHaveBeenCalledWith('entity:1', expect.any(String));
    });
  });

  describe('slug generation', () => {
    it('should generate correct slug from Turkish characters', async () => {
      const dto: CreateEntityDto = {
        canonicalName: 'Türkçe Kuruluş Adı',
        type: 'organization',
      };

      jest.spyOn(prismaService.entity, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.entity, 'create').mockResolvedValue({
        ...mockEntity,
        canonicalName: 'Türkçe Kuruluş Adı',
        slug: 'turkce-kurulusaadi',
      });

      await service.create(dto, 'user1');

      expect(prismaService.entity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expect.stringMatching(/^[a-z0-9-]+$/),
          }),
        })
      );
    });
  });
});
