/**
 * Integration test: fake Google Sheet -> real Postgres (via PrismaService).
 *
 * This exercises the full sync pipeline (Master Registry discovery, holding
 * sync, idempotency, change detection, reference resolution, rejection
 * handling, and "missing from source" behavior) end to end, without any real
 * Google credentials or network access - using the FakeGoogleSheetsClient
 * fixture instead, exactly as docs/GOOGLE_DRIVE_DATA_PIPELINE.md describes
 * for credential-less local development and CI.
 *
 * Requires a reachable Postgres (DATABASE_URL / DATABASE_URL_TEST) with the
 * migrations applied and the standard seed data loaded (EntityType,
 * RelationType, SourceType rows) - the same database `pnpm --filter
 * @umutsensen/database migrate deploy && pnpm --filter @umutsensen/database
 * seed` sets up for local development.
 */
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { HoldingSyncService } from '../services/holding-sync.service';
import { MasterRegistryService } from '../services/master-registry.service';
import {
  buildMasterRegistryFixture,
  buildYildizlarSssFixture,
  FakeGoogleSheetsClient,
  MASTER_SPREADSHEET_ID,
  YSSS_SPREADSHEET_ID,
} from './fake-google-sheets-client';

// Matches the external_id used in the fixture's own HOLDING tab row - in
// real usage the Master Registry's holding_id and the holding sheet's own
// HOLDING row should always refer to the same holding.
const TEST_HOLDING_ID = 'holding:yildizlar-sss';
const TEST_USER_EMAIL = 'sync-integration-test@demo.local';

describe('Holding sync integration (fake sheet -> Postgres)', () => {
  let prisma: PrismaService;
  let masterRegistry: MasterRegistryService;
  let holdingSync: HoldingSyncService;
  let userId: string;

  beforeAll(async () => {
    process.env.GOOGLE_MASTER_SPREADSHEET_ID = MASTER_SPREADSHEET_ID;

    prisma = new PrismaService();
    await prisma.$connect();

    // GoogleSheetsService is never actually called in these tests - every
    // call site is given an explicit `sheetsClient` override - so a real
    // instance isn't needed.
    masterRegistry = new MasterRegistryService(prisma, undefined as never);
    holdingSync = new HoldingSyncService(prisma, undefined as never);

    const role = await prisma.role.findUnique({ where: { code: 'researcher' } });
    if (!role) throw new Error('Expected seed data (Role "researcher") to exist - run `pnpm --filter @umutsensen/database seed` first.');

    const user = await prisma.user.upsert({
      where: { email: TEST_USER_EMAIL },
      update: {},
      create: {
        email: TEST_USER_EMAIL,
        username: 'sync-integration-test',
        passwordHash: 'test',
        roleId: role.id,
        status: 'active',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupFixtureData(prisma);
    await prisma.user.deleteMany({ where: { email: TEST_USER_EMAIL } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanupFixtureData(prisma);
  });

  it('discovers a holding from the Master Registry fixture', async () => {
    const masterFixture = buildMasterRegistryFixture();
    const result = await masterRegistry.refresh(masterFixture);

    expect(result.rowsRead).toBe(1);
    expect(result.created).toBe(1);
    expect(result.rejected).toHaveLength(0);

    const registry = await prisma.holdingRegistry.findUnique({
      where: { holdingId: 'holding:yildizlar-sss' },
    });
    expect(registry?.syncEnabled).toBe(true);
    expect(registry?.spreadsheetId).toBe(YSSS_SPREADSHEET_ID);

    await prisma.holdingRegistry.delete({ where: { id: registry!.id } });
  });

  it('dry-run does not write anything to the database', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();

    const result = await holdingSync.syncHolding({
      holdingRegistry: registry,
      userId,
      dryRun: true,
      sheetsClient: fixture,
    });

    expect(result.status).toBe('preview_ready');
    expect(result.counts.createCount).toBeGreaterThan(0);

    const entityCount = await prisma.entity.count({ where: { externalId: { in: ['company:eti-gumus', 'company:nesko-maden'] } } });
    expect(entityCount).toBe(0);
  });

  it('creates the full record graph from a real (non-dry-run) sync', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();

    const result = await holdingSync.syncHolding({
      holdingRegistry: registry,
      userId,
      dryRun: false,
      sheetsClient: fixture,
    });

    expect(result.status).toBe('completed');
    expect(result.counts.rejectedCount).toBe(0);
    expect(result.counts.unresolvedReferenceCount).toBe(0);
    // HOLDING(1) + ENTITIES(4) + ALIASES(1) + LOCATIONS(1) + SOURCES(2) +
    // RELATIONS(3) + STRUGGLES(1) + STRUGGLE_ACTORS(1) + STRUGGLE_DEMANDS(1) +
    // STRUGGLE_ACTIONS(1) + EVENTS(1) + EVIDENCE(2) = 19
    expect(result.counts.rowCount).toBe(19);
    expect(result.counts.createCount).toBe(19);

    const etiGumus = await prisma.entity.findUnique({ where: { externalId: 'company:eti-gumus' } });
    expect(etiGumus).not.toBeNull();
    expect(etiGumus?.visibility).toBe('internal'); // sync never auto-publishes

    const ownsRelation = await prisma.relation.findUnique({ where: { externalId: 'relation:ysss-eti-gumus-owns' } });
    expect(ownsRelation?.sourceEntityId).toBe((await prisma.entity.findUnique({ where: { externalId: TEST_HOLDING_ID } }))!.id);
    expect(ownsRelation?.targetEntityId).toBe(etiGumus!.id);

    const struggle = await prisma.struggle.findUnique({ where: { externalId: 'struggle:doruk-bagimsiz-2026' }, include: { actors: true, demands: true, actions: true } });
    expect(struggle?.actors).toHaveLength(1);
    expect(struggle?.demands).toHaveLength(1);
    expect(struggle?.actions).toHaveLength(1);

    const evidence = await prisma.relationSourceEvidence.findFirst({ where: { relation: { externalId: 'relation:ysss-eti-gumus-owns' } } });
    expect(evidence?.claimField).toBe('ownership');
  });

  it('a second identical sync produces zero duplicates and reports "unchanged"', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();

    await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });
    const before = await countFixtureRecords(prisma);

    const second = await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    expect(second.counts.createCount).toBe(0);
    expect(second.counts.unchangedCount).toBe(second.counts.rowCount);

    const after = await countFixtureRecords(prisma);
    expect(after).toEqual(before);
  });

  it('a changed field is reported as "update" and is actually updated', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();
    await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    fixture.seed(YSSS_SPREADSHEET_ID, 'ENTITIES', [
      ['external_id', 'entity_type', 'canonical_name', 'status', 'visibility'],
      ['company:eti-gumus', 'company', 'Eti Gümüş (yeniden adlandırıldı)', 'active', 'internal'],
      ['company:nesko-maden', 'company', 'Nesko Maden', 'active', 'internal'],
      ['facility:yunus-emre-termik', 'power_plant', 'Yunus Emre Termik Santrali', 'active', 'internal'],
      ['union:bagimsiz-maden-is', 'union', 'Bağımsız Maden-İş', 'active', 'internal'],
    ]);

    const result = await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });
    expect(result.counts.updateCount).toBeGreaterThanOrEqual(1);

    const updated = await prisma.entity.findUnique({ where: { externalId: 'company:eti-gumus' } });
    expect(updated?.canonicalName).toBe('Eti Gümüş (yeniden adlandırıldı)');
  });

  it('rejects a relation whose target cannot be resolved, and does not insert it', async () => {
    const registry = await createTestRegistry(prisma);
    // A minimal, self-contained fixture (only the tabs this scenario needs)
    // so there's no cross-tab noise from STRUGGLES/EVENTS/EVIDENCE rows that
    // would also fail to resolve once ENTITIES is stripped down.
    const fixture = new FakeGoogleSheetsClient();
    fixture.seed(YSSS_SPREADSHEET_ID, 'HOLDING', [
      ['external_id', 'canonical_name'],
      [TEST_HOLDING_ID, 'Yıldızlar SSS'],
    ]);
    fixture.seed(YSSS_SPREADSHEET_ID, 'RELATIONS', [
      ['external_id', 'relation_type', 'source_external_id', 'target_external_id'],
      ['relation:dangling', 'owns', TEST_HOLDING_ID, 'company:does-not-exist'],
    ]);

    const result = await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    expect(result.counts.unresolvedReferenceCount).toBe(1);
    const relation = await prisma.relation.findUnique({ where: { externalId: 'relation:dangling' } });
    expect(relation).toBeNull();
  });

  it('rejects an invalid record (missing required field) without inserting it', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();
    fixture.seed(YSSS_SPREADSHEET_ID, 'ENTITIES', [
      ['external_id', 'entity_type', 'canonical_name'],
      ['company:missing-name', 'company', ''], // canonical_name required, blank
    ]);

    const result = await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    expect(result.counts.rejectedCount).toBeGreaterThanOrEqual(1);
    const entity = await prisma.entity.findUnique({ where: { externalId: 'company:missing-name' } });
    expect(entity).toBeNull();
  });

  it('never hard-deletes a record that disappears from the sheet - flags it missing_from_source instead', async () => {
    const registry = await createTestRegistry(prisma);
    const fixture = buildYildizlarSssFixture();
    await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    // Simulate the row for nesko-maden disappearing from the sheet.
    fixture.seed(YSSS_SPREADSHEET_ID, 'ENTITIES', [
      ['external_id', 'entity_type', 'canonical_name', 'status', 'visibility'],
      ['company:eti-gumus', 'company', 'Eti Gümüş', 'active', 'internal'],
      ['facility:yunus-emre-termik', 'power_plant', 'Yunus Emre Termik Santrali', 'active', 'internal'],
      ['union:bagimsiz-maden-is', 'union', 'Bağımsız Maden-İş', 'active', 'internal'],
    ]);

    const result = await holdingSync.syncHolding({ holdingRegistry: registry, userId, dryRun: false, sheetsClient: fixture });

    const stillThere = await prisma.entity.findUnique({ where: { externalId: 'company:nesko-maden' } });
    expect(stillThere).not.toBeNull(); // never hard-deleted

    const flagged = result.rows.find((r) => r.externalId === 'company:nesko-maden' && r.operation === 'missing_from_source');
    expect(flagged).toBeDefined();
  });
});

async function createTestRegistry(prisma: PrismaService) {
  return prisma.holdingRegistry.create({
    data: {
      holdingId: TEST_HOLDING_ID,
      holdingName: 'Test Fixture SSS',
      spreadsheetId: YSSS_SPREADSHEET_ID,
      syncEnabled: true,
    },
  });
}

const FIXTURE_EXTERNAL_IDS = [
  TEST_HOLDING_ID,
  'company:eti-gumus',
  'company:nesko-maden',
  'facility:yunus-emre-termik',
  'union:bagimsiz-maden-is',
  'company:missing-name',
];
const FIXTURE_LOCATION_IDS = ['location:yunus-emre-termik'];
const FIXTURE_SOURCE_IDS = ['source:umutsen-2019-eti-gumus', 'source:trade-registry-nesko'];
const FIXTURE_STRUGGLE_IDS = ['struggle:doruk-bagimsiz-2026'];

async function countFixtureRecords(prisma: PrismaService) {
  return {
    entities: await prisma.entity.count({ where: { externalId: { in: FIXTURE_EXTERNAL_IDS } } }),
    relations: await prisma.relation.count({ where: { sourceEntity: { externalId: { in: FIXTURE_EXTERNAL_IDS } } } }),
    struggles: await prisma.struggle.count({ where: { externalId: { in: FIXTURE_STRUGGLE_IDS } } }),
    sources: await prisma.source.count({ where: { externalId: { in: FIXTURE_SOURCE_IDS } } }),
  };
}

async function cleanupFixtureData(prisma: PrismaService) {
  const entities = await prisma.entity.findMany({ where: { externalId: { in: FIXTURE_EXTERNAL_IDS } }, select: { id: true } });
  const entityIds = entities.map((e) => e.id);
  const struggles = await prisma.struggle.findMany({ where: { externalId: { in: FIXTURE_STRUGGLE_IDS } }, select: { id: true } });
  const struggleIds = struggles.map((s) => s.id);

  await prisma.recordOrigin.deleteMany({ where: { importBatch: { holdingRegistry: { holdingId: TEST_HOLDING_ID } } } });
  await prisma.importRow.deleteMany({ where: { importBatch: { holdingRegistry: { holdingId: TEST_HOLDING_ID } } } });
  await prisma.importBatch.deleteMany({ where: { holdingRegistry: { holdingId: TEST_HOLDING_ID } } });

  await prisma.relationSourceEvidence.deleteMany({ where: { source: { externalId: { in: FIXTURE_SOURCE_IDS } } } });
  await prisma.entitySourceEvidence.deleteMany({ where: { source: { externalId: { in: FIXTURE_SOURCE_IDS } } } });
  await prisma.struggleSourceEvidence.deleteMany({ where: { source: { externalId: { in: FIXTURE_SOURCE_IDS } } } });
  await prisma.relation.deleteMany({ where: { OR: [{ sourceEntityId: { in: entityIds } }, { targetEntityId: { in: entityIds } }] } });
  await prisma.timelineEvent.deleteMany({ where: { OR: [{ entityId: { in: entityIds } }, { struggleId: { in: struggleIds } }] } });
  await prisma.struggleActor.deleteMany({ where: { struggleId: { in: struggleIds } } });
  await prisma.struggleDemand.deleteMany({ where: { struggleId: { in: struggleIds } } });
  await prisma.struggleAction.deleteMany({ where: { struggleId: { in: struggleIds } } });
  await prisma.struggle.deleteMany({ where: { externalId: { in: FIXTURE_STRUGGLE_IDS } } });
  await prisma.entityAlias.deleteMany({ where: { entityId: { in: entityIds } } });
  await prisma.source.deleteMany({ where: { externalId: { in: FIXTURE_SOURCE_IDS } } });
  await prisma.location.deleteMany({ where: { externalId: { in: FIXTURE_LOCATION_IDS } } });
  await prisma.holdingRegistry.deleteMany({ where: { holdingId: TEST_HOLDING_ID } });
  await prisma.entity.deleteMany({ where: { externalId: { in: FIXTURE_EXTERNAL_IDS } } });
}
