import { describe, it, expect, beforeEach } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { EntitiesService } from './entities.service';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = new PrismaClient();
    service = new EntitiesService(prisma);
  });

  it('should create an entity', async () => {
    // Setup: Create entity type
    const entityType = await prisma.entityType.upsert({
      where: { code: 'test_holding' },
      update: {},
      create: {
        code: 'test_holding',
        name: 'Test Holding',
        isSearchable: true,
      },
    });

    // Act
    const entity = await service.create(
      {
        entityTypeId: entityType.id,
        canonicalName: 'Test Entity ABC',
        status: 'active',
        visibility: 'draft',
      },
      'test-user',
    );

    // Assert
    expect(entity).toBeDefined();
    expect(entity.canonicalName).toBe('Test Entity ABC');
    expect(entity.slug).toBe('test-entity-abc');
    expect(entity.createdBy).toBe('test-user');

    // Cleanup
    await prisma.entity.delete({ where: { id: entity.id } });
    await prisma.entityType.delete({ where: { id: entityType.id } });
  });

  it('should find entity by slug', async () => {
    // Setup
    const entityType = await prisma.entityType.upsert({
      where: { code: 'test_type_2' },
      update: {},
      create: {
        code: 'test_type_2',
        name: 'Test Type 2',
      },
    });

    const entity = await service.create(
      {
        entityTypeId: entityType.id,
        canonicalName: 'Unique Test Name',
        visibility: 'draft',
      },
      'test-user',
    );

    // Act
    const found = await service.findBySlug(entity.slug);

    // Assert
    expect(found.id).toBe(entity.id);
    expect(found.canonicalName).toBe('Unique Test Name');

    // Cleanup
    await prisma.entity.delete({ where: { id: entity.id } });
    await prisma.entityType.delete({ where: { id: entityType.id } });
  });
});
