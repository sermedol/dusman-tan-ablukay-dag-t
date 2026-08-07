import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export const getPrismaTestInstance = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
        },
      },
    });
  }
  return prismaInstance;
};

export const cleanupDatabase = async (): Promise<void> => {
  const prisma = getPrismaTestInstance();
  try {
    // Clean up in correct order considering foreign keys
    await prisma.revision.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.timelineEvent.deleteMany({});
    await prisma.relation.deleteMany({});
    await prisma.entity.deleteMany({});
    await prisma.location.deleteMany({});
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
};

export const setupTestDatabase = async (): Promise<void> => {
  const prisma = getPrismaTestInstance();
  try {
    await prisma.$connect();
    await cleanupDatabase();
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

export const teardownTestDatabase = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};

export const seedTestData = async (): Promise<Record<string, any>> => {
  const prisma = getPrismaTestInstance();

  // Create test entity type
  const entityType = await prisma.entityType.upsert({
    where: { id: 'test-type' },
    update: {},
    create: {
      id: 'test-type',
      name: 'Test Type',
      description: 'Test entity type',
      isActive: true,
    },
  });

  // Create test entity
  const entity = await prisma.entity.create({
    data: {
      canonicalName: 'Test Entity',
      slug: 'test-entity',
      type: 'organization',
      status: 'active',
      visibility: 'public',
      verificationStatus: 'verified',
      createdBy: 'test-user',
      updatedBy: 'test-user',
      entityTypeId: entityType.id,
    },
  });

  // Create relation type
  const relationType = await prisma.relationType.upsert({
    where: { id: 'test-rel-type' },
    update: {},
    create: {
      id: 'test-rel-type',
      name: 'Test Relation',
      description: 'Test relation type',
      isActive: true,
    },
  });

  return { entityType, entity, relationType };
};
