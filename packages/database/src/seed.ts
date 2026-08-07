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

  await prisma.role.upsert({
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
  // Lookup table, not an enum - new types can always be added here (or by a
  // future admin UI) without a schema migration.
  const entityTypes: Array<{
    code: string;
    name: string;
    icon: string;
    colorToken: string;
  }> = [
    { code: 'holding', name: 'Holding', icon: 'building-2', colorToken: 'red' },
    { code: 'company', name: 'Şirket', icon: 'briefcase', colorToken: 'blue' },
    { code: 'subsidiary', name: 'Bağlı Şirket', icon: 'git-branch', colorToken: 'blue' },
    { code: 'person', name: 'Kişi', icon: 'user', colorToken: 'gray' },
    { code: 'public_institution', name: 'Kamu Kurumu', icon: 'landmark', colorToken: 'green' },
    { code: 'municipality', name: 'Belediye', icon: 'landmark', colorToken: 'green' },
    { code: 'bank', name: 'Banka', icon: 'bank', colorToken: 'purple' },
    { code: 'financial_institution', name: 'Finans Kurumu', icon: 'bank', colorToken: 'purple' },
    { code: 'union', name: 'Sendika', icon: 'users', colorToken: 'orange' },
    { code: 'association', name: 'Dernek', icon: 'users', colorToken: 'orange' },
    { code: 'foundation', name: 'Vakıf', icon: 'users', colorToken: 'orange' },
    { code: 'factory', name: 'Fabrika', icon: 'factory', colorToken: 'brown' },
    { code: 'mine', name: 'Maden', icon: 'mountain', colorToken: 'brown' },
    { code: 'power_plant', name: 'Enerji Santrali', icon: 'zap', colorToken: 'amber' },
    { code: 'port', name: 'Liman', icon: 'anchor', colorToken: 'teal' },
    { code: 'warehouse', name: 'Depo', icon: 'warehouse', colorToken: 'brown' },
    { code: 'construction_site', name: 'Şantiye', icon: 'hard-hat', colorToken: 'amber' },
    { code: 'project', name: 'Proje', icon: 'folder', colorToken: 'gray' },
    { code: 'tender', name: 'İhale', icon: 'file-text', colorToken: 'amber' },
    { code: 'license', name: 'Ruhsat', icon: 'file-check', colorToken: 'amber' },
    { code: 'permit', name: 'İzin', icon: 'file-check', colorToken: 'amber' },
    { code: 'court_case', name: 'Dava', icon: 'scale', colorToken: 'red-dark' },
    { code: 'worker_resistance', name: 'İşçi Direnişi', icon: 'zap', colorToken: 'red-dark' },
    { code: 'strike', name: 'Grev', icon: 'zap', colorToken: 'red-dark' },
    { code: 'protest', name: 'Protesto', icon: 'megaphone', colorToken: 'red-dark' },
    { code: 'ecological_struggle', name: 'Ekoloji Mücadelesi', icon: 'leaf', colorToken: 'green-dark' },
    { code: 'workplace_death', name: 'İş Cinayeti', icon: 'alert-triangle', colorToken: 'red-dark' },
    { code: 'accident', name: 'Kaza', icon: 'alert-triangle', colorToken: 'red-dark' },
    { code: 'political_party', name: 'Siyasi Parti', icon: 'flag', colorToken: 'violet' },
    { code: 'international_institution', name: 'Uluslararası Kurum', icon: 'globe', colorToken: 'teal' },
  ];

  for (const entityType of entityTypes) {
    await prisma.entityType.upsert({
      where: { code: entityType.code },
      update: {},
      create: { ...entityType, isSearchable: true },
    });
  }

  console.log(`✅ ${entityTypes.length} entity types seeded`);

  // Source Types
  const sourceTypes: Array<{ code: string; name: string }> = [
    { code: 'news_article', name: 'Haber Makalesi' },
    { code: 'official_gazette', name: 'Resmi Gazete' },
    { code: 'court_decision', name: 'Mahkeme Kararı' },
    { code: 'company_registry', name: 'Ticaret Sicili' },
    { code: 'regulatory_decision', name: 'Rekabet Kurumu / Düzenleyici Kurum Kararı' },
    { code: 'parliamentary_record', name: 'TBMM Kaydı' },
    { code: 'corporate_website', name: 'Holding / Şirket Sitesi' },
    { code: 'union_statement', name: 'Sendika Açıklaması' },
    { code: 'report', name: 'Rapor' },
    { code: 'tender_notice', name: 'İhale İlanı' },
  ];

  for (const sourceType of sourceTypes) {
    await prisma.sourceType.upsert({
      where: { code: sourceType.code },
      update: {},
      create: sourceType,
    });
  }

  console.log(`✅ ${sourceTypes.length} source types seeded`);

  // Relation Types
  const relationTypes: Array<{
    code: string;
    name: string;
    inverseName: string;
    category: string;
    isDirected: boolean;
    allowMultiple: boolean;
    colorToken: string;
    lineStyle: string;
  }> = [
    { code: 'owns', name: 'sahip olur', inverseName: 'tarafından sahip olunur', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'subsidiary_of', name: 'bağlı şirketidir', inverseName: 'ana şirketidir', category: 'ownership', isDirected: true, allowMultiple: false, colorToken: 'red', lineStyle: 'solid' },
    { code: 'shareholder_of', name: 'ortağıdır', inverseName: 'ortağı vardır', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'partially_owns', name: 'kısmen sahip olur', inverseName: 'kısmen sahip olunur', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'controlled_by', name: 'tarafından kontrol edilir', inverseName: 'kontrol eder', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'acquired', name: 'satın aldı', inverseName: 'tarafından satın alındı', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'transferred_to', name: 'devretti', inverseName: 'tarafından devralındı', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'dashed' },
    { code: 'board_member_of', name: 'yönetim kurulu üyesidir', inverseName: 'yönetim kurulunda bulunur', category: 'governance', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'executive_of', name: 'yöneticisidir', inverseName: 'yöneticisi vardır', category: 'governance', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'founded_by', name: 'tarafından kuruldu', inverseName: 'kurdu', category: 'governance', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'family_relation', name: 'akrabalık ilişkisi vardır', inverseName: 'akrabalık ilişkisi vardır', category: 'governance', isDirected: false, allowMultiple: true, colorToken: 'gray', lineStyle: 'dotted' },
    { code: 'awarded_tender_to', name: 'ihaleyi verdi', inverseName: 'ihaleyi aldı', category: 'public_procurement', isDirected: true, allowMultiple: true, colorToken: 'green', lineStyle: 'solid' },
    { code: 'received_tender_from', name: 'ihaleyi aldı', inverseName: 'ihaleyi verdi', category: 'public_procurement', isDirected: true, allowMultiple: true, colorToken: 'green', lineStyle: 'solid' },
    { code: 'licensed_by', name: 'tarafından ruhsatlandırıldı', inverseName: 'ruhsat verdi', category: 'regulatory', isDirected: true, allowMultiple: true, colorToken: 'green', lineStyle: 'solid' },
    { code: 'permitted_by', name: 'tarafından izinlendirildi', inverseName: 'izin verdi', category: 'regulatory', isDirected: true, allowMultiple: true, colorToken: 'green', lineStyle: 'solid' },
    { code: 'subsidized_by', name: 'tarafından desteklendi', inverseName: 'destek sağladı', category: 'finance', isDirected: true, allowMultiple: true, colorToken: 'purple', lineStyle: 'solid' },
    { code: 'incentivized_by', name: 'teşvik aldı', inverseName: 'teşvik verdi', category: 'finance', isDirected: true, allowMultiple: true, colorToken: 'purple', lineStyle: 'solid' },
    { code: 'financed_by', name: 'tarafından finanse edildi', inverseName: 'finanse etti', category: 'finance', isDirected: true, allowMultiple: true, colorToken: 'purple', lineStyle: 'solid' },
    { code: 'provided_credit_to', name: 'kredi sağladı', inverseName: 'kredi aldı', category: 'finance', isDirected: true, allowMultiple: true, colorToken: 'purple', lineStyle: 'solid' },
    { code: 'contractor_of', name: 'yükleniciliğini yaptı', inverseName: 'yüklenicisi vardır', category: 'production_supply', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'subcontractor_of', name: 'taşeronudur', inverseName: 'taşeronu vardır', category: 'production_supply', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'supplier_of', name: 'tedarikçisidir', inverseName: 'tedarikçisi vardır', category: 'production_supply', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'operates', name: 'işletir', inverseName: 'tarafından işletilir', category: 'production_supply', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'owns_facility', name: 'tesisin sahibidir', inverseName: 'sahibi vardır', category: 'ownership', isDirected: true, allowMultiple: true, colorToken: 'red', lineStyle: 'solid' },
    { code: 'joint_venture_with', name: 'ortak girişimdedir', inverseName: 'ortak girişimdedir', category: 'ownership', isDirected: false, allowMultiple: true, colorToken: 'red', lineStyle: 'dashed' },
    { code: 'works_for', name: 'çalışan olur', inverseName: 'istihdam eder', category: 'production_supply', isDirected: true, allowMultiple: true, colorToken: 'blue', lineStyle: 'solid' },
    { code: 'resists_against', name: 'direnç gösterir', inverseName: 'direnişe maruz kalır', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'red-dark', lineStyle: 'dashed' },
    { code: 'resistance_at', name: 'direniş yaşandı', inverseName: 'direnişin yaşandığı yerdir', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'red-dark', lineStyle: 'dashed' },
    { code: 'strike_against', name: 'grev yaptı', inverseName: 'grev yaşadı', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'red-dark', lineStyle: 'dashed' },
    { code: 'unionized_at', name: 'örgütlendi', inverseName: 'örgütlenme yaşandı', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'orange', lineStyle: 'dashed' },
    { code: 'union_busting_at', name: 'sendika kırıcılığı yaptı', inverseName: 'sendika kırıcılığına maruz kaldı', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'red-dark', lineStyle: 'dashed' },
    { code: 'wage_theft_at', name: 'ücret gaspı yaptı', inverseName: 'ücret gaspına uğradı', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'red-dark', lineStyle: 'dashed' },
    { code: 'ecological_struggle_against', name: 'ekoloji mücadelesi hedefidir', inverseName: 'ekoloji mücadelesi yürütür', category: 'struggle', isDirected: true, allowMultiple: true, colorToken: 'green-dark', lineStyle: 'dashed' },
  ];

  for (const relationType of relationTypes) {
    await prisma.relationType.upsert({
      where: { code: relationType.code },
      update: {},
      create: relationType,
    });
  }

  console.log(`✅ ${relationTypes.length} relation types seeded`);

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
