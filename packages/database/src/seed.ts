import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Roles
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      code: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access',
      permissions: {
        createMany: {
          data: [
            { permission: 'entity:create' },
            { permission: 'entity:edit_all_drafts' },
            { permission: 'entity:publish' },
            { permission: 'entity:unpublish' },
            { permission: 'relation:create' },
            { permission: 'relation:publish' },
            { permission: 'source:upload' },
            { permission: 'import:import' },
            { permission: 'user:manage' },
            { permission: 'system:manage_settings' },
            { permission: 'audit:view_log' },
          ],
        },
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      code: 'admin',
      name: 'Admin',
      description: 'Manage users and system settings',
      permissions: {
        createMany: {
          data: [
            { permission: 'entity:create' },
            { permission: 'entity:edit_all_drafts' },
            { permission: 'entity:publish' },
            { permission: 'relation:create' },
            { permission: 'relation:publish' },
            { permission: 'source:upload' },
            { permission: 'import:import' },
            { permission: 'user:manage' },
            { permission: 'system:manage_settings' },
            { permission: 'audit:view_log' },
          ],
        },
      },
    },
  });

  const verifierRole = await prisma.role.upsert({
    where: { code: 'verifier' },
    update: {},
    create: {
      code: 'verifier',
      name: 'Verifier',
      description: 'Review and approve submissions',
      permissions: {
        createMany: {
          data: [
            { permission: 'entity:view_all_drafts' },
            { permission: 'entity:edit_all_drafts' },
            { permission: 'entity:verify' },
            { permission: 'entity:publish' },
            { permission: 'relation:verify' },
            { permission: 'relation:publish' },
            { permission: 'source:verify' },
            { permission: 'import:import' },
            { permission: 'audit:view_log' },
          ],
        },
      },
    },
  });

  const researcherRole = await prisma.role.upsert({
    where: { code: 'researcher' },
    update: {},
    create: {
      code: 'researcher',
      name: 'Researcher',
      description: 'Create and submit records',
      permissions: {
        createMany: {
          data: [
            { permission: 'entity:create' },
            { permission: 'entity:edit_own_draft' },
            { permission: 'entity:submit' },
            { permission: 'relation:create' },
            { permission: 'relation:edit_own_draft' },
            { permission: 'source:upload' },
            { permission: 'source:link_to_entity' },
          ],
        },
      },
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { code: 'viewer' },
    update: {},
    create: {
      code: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: {
        createMany: {
          data: [{ permission: 'entity:view_published' }],
        },
      },
    },
  });

  console.log('✅ Roles seeded');

  // Entity Types
  const holdingType = await prisma.entityType.upsert({
    where: { code: 'holding' },
    update: {},
    create: {
      code: 'holding',
      name: 'Holding',
      icon: 'building-2',
      colorToken: 'red',
      isSearchable: true,
    },
  });

  const companyType = await prisma.entityType.upsert({
    where: { code: 'company' },
    update: {},
    create: {
      code: 'company',
      name: 'Şirket',
      icon: 'briefcase',
      colorToken: 'blue',
      isSearchable: true,
    },
  });

  const publicInstitutionType = await prisma.entityType.upsert({
    where: { code: 'public_institution' },
    update: {},
    create: {
      code: 'public_institution',
      name: 'Kamu Kurumu',
      icon: 'landmark',
      colorToken: 'green',
      isSearchable: true,
    },
  });

  const bankType = await prisma.entityType.upsert({
    where: { code: 'bank' },
    update: {},
    create: {
      code: 'bank',
      name: 'Banka',
      icon: 'bank',
      colorToken: 'purple',
      isSearchable: true,
    },
  });

  const unionType = await prisma.entityType.upsert({
    where: { code: 'union' },
    update: {},
    create: {
      code: 'union',
      name: 'Sendika',
      icon: 'users',
      colorToken: 'orange',
      isSearchable: true,
    },
  });

  const workerResistanceType = await prisma.entityType.upsert({
    where: { code: 'worker_resistance' },
    update: {},
    create: {
      code: 'worker_resistance',
      name: 'İşçi Direnişi',
      icon: 'zap',
      colorToken: 'red-dark',
      isSearchable: true,
    },
  });

  console.log('✅ Entity types seeded');

  // Source Types
  await prisma.sourceType.upsert({
    where: { code: 'news_article' },
    update: {},
    create: {
      code: 'news_article',
      name: 'Haber Makalesi',
    },
  });

  await prisma.sourceType.upsert({
    where: { code: 'official_gazette' },
    update: {},
    create: {
      code: 'official_gazette',
      name: 'Resmi Gazete',
    },
  });

  await prisma.sourceType.upsert({
    where: { code: 'court_decision' },
    update: {},
    create: {
      code: 'court_decision',
      name: 'Mahkeme Kararı',
    },
  });

  console.log('✅ Source types seeded');

  // Relation Types
  const ownsRelationType = await prisma.relationType.upsert({
    where: { code: 'owns' },
    update: {},
    create: {
      code: 'owns',
      name: 'sahip olur',
      inverseName: 'tarafından sahip olunur',
      category: 'ownership',
      isDirected: true,
      allowMultiple: false,
      colorToken: 'red',
      lineStyle: 'solid',
    },
  });

  const worksForRelationType = await prisma.relationType.upsert({
    where: { code: 'works_for' },
    update: {},
    create: {
      code: 'works_for',
      name: 'çalışan olur',
      inverseName: 'istihdam eder',
      category: 'production_supply',
      isDirected: true,
      allowMultiple: true,
      colorToken: 'blue',
      lineStyle: 'solid',
    },
  });

  const resistsAgainstRelationType = await prisma.relationType.upsert({
    where: { code: 'resists_against' },
    update: {},
    create: {
      code: 'resists_against',
      name: 'direnç gösterir',
      inverseName: 'direnişe maruz kalır',
      category: 'struggle',
      isDirected: true,
      allowMultiple: true,
      colorToken: 'red-dark',
      lineStyle: 'dashed',
    },
  });

  console.log('✅ Relation types seeded');

  // Demo Users
  const demoPassword = '$2a$12$demo'; // Placeholder, would be properly hashed in real app

  await prisma.user.upsert({
    where: { email: 'super_admin@demo.local' },
    update: {},
    create: {
      email: 'super_admin@demo.local',
      username: 'super_admin',
      passwordHash: demoPassword,
      fullName: 'Demo Super Admin',
      roleId: superAdminRole.id,
      status: 'active',
      createdBy: 'SEED',
      updatedBy: 'SEED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      username: 'admin',
      passwordHash: demoPassword,
      fullName: 'Demo Admin',
      roleId: adminRole.id,
      status: 'active',
      createdBy: 'SEED',
      updatedBy: 'SEED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'verifier@demo.local' },
    update: {},
    create: {
      email: 'verifier@demo.local',
      username: 'verifier',
      passwordHash: demoPassword,
      fullName: 'Demo Verifier',
      roleId: verifierRole.id,
      status: 'active',
      createdBy: 'SEED',
      updatedBy: 'SEED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'researcher@demo.local' },
    update: {},
    create: {
      email: 'researcher@demo.local',
      username: 'researcher',
      passwordHash: demoPassword,
      fullName: 'Demo Researcher',
      roleId: researcherRole.id,
      status: 'active',
      createdBy: 'SEED',
      updatedBy: 'SEED',
    },
  });

  console.log('✅ Demo users seeded');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
