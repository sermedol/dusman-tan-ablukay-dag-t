/**
 * Standalone CLI runner for the Google Sheets -> Postgres sync pipeline.
 * Meant to run somewhere with real internet access to Google's APIs (a
 * GitHub Actions runner, a server, your own machine) - NOT inside this
 * repo's dev sandbox, which has neither Google credentials nor a network
 * path to Google.
 *
 * Usage (env-driven, no CLI flags to keep the GitHub Actions workflow simple):
 *   DATABASE_URL=...            (required)
 *   GOOGLE_DRIVE_ENABLED=true   (required)
 *   GOOGLE_SERVICE_ACCOUNT_JSON=... (required)
 *   GOOGLE_MASTER_SPREADSHEET_ID=... (required)
 *   SYNC_DRY_RUN=true|false     (default: true - never writes by accident)
 *   SYNC_HOLDING_ID=holding:yildizlar-sss  (optional - omit to sync every
 *                                            sync_enabled holding)
 *
 * Exits non-zero if any targeted holding's sync throws.
 */
import type { HoldingRegistry, User } from '@prisma/client';

import { GoogleAuthService } from '../src/modules/data-sources/services/google-auth.service';
import { GoogleSheetsService } from '../src/modules/data-sources/services/google-sheets.service';
import { HoldingSyncService } from '../src/modules/data-sources/services/holding-sync.service';
import { MasterRegistryService } from '../src/modules/data-sources/services/master-registry.service';
import { PrismaService } from '../src/shared/prisma/prisma.service';

const SYNC_BOT_EMAIL = 'google-sync@system.local';

async function main() {
  const dryRun = process.env.SYNC_DRY_RUN !== 'false';
  const targetHoldingId = process.env.SYNC_HOLDING_ID || null;

  const prisma = new PrismaService();
  await prisma.$connect();

  const googleAuth = new GoogleAuthService();
  if (!googleAuth.isEnabled()) {
    console.error(`Google integration is not configured: ${googleAuth.getDisabledReason()}`);
    process.exit(1);
  }

  const googleSheets = new GoogleSheetsService(googleAuth);
  const masterRegistry = new MasterRegistryService(prisma, googleSheets);
  const holdingSync = new HoldingSyncService(prisma, googleSheets);

  console.log(`\n=== Master Registry refresh (dryRun does not apply here - registry rows are always upserted) ===`);
  const registryResult = await masterRegistry.refresh();
  console.log(JSON.stringify(registryResult, null, 2));

  const botUser = await ensureSyncBotUser(prisma);

  const targets: HoldingRegistry[] = targetHoldingId
    ? (await prisma.holdingRegistry.findUnique({ where: { holdingId: targetHoldingId } }).then((h) => (h ? [h] : [])))
    : await prisma.holdingRegistry.findMany({ where: { syncEnabled: true } });

  if (targets.length === 0) {
    console.log('\nNo sync-enabled holdings found (or SYNC_HOLDING_ID did not match any registry row). Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  let failures = 0;
  for (const holding of targets) {
    console.log(`\n=== Syncing ${holding.holdingId} (${holding.holdingName}) - dryRun=${dryRun} ===`);
    try {
      const result = await holdingSync.syncHolding({ holdingRegistry: holding, userId: botUser.id, dryRun });
      console.log(
        JSON.stringify(
          { status: result.status, tabsFound: result.tabsFound, tabsMissing: result.tabsMissing, counts: result.counts },
          null,
          2
        )
      );
      const problemRows = result.rows.filter((r) => r.errors?.length || r.warnings?.length);
      if (problemRows.length > 0) {
        console.log(`-- ${problemRows.length} row(s) with errors/warnings --`);
        for (const row of problemRows.slice(0, 100)) {
          console.log(`  [${row.sheetName} #${row.rowNumber}] ${row.operation} ${row.externalId ?? ''}: ${[...(row.errors ?? []), ...(row.warnings ?? [])].join('; ')}`);
        }
      }
    } catch (error) {
      failures += 1;
      console.error(`FAILED: ${holding.holdingId}:`, error instanceof Error ? error.message : error);
    }
  }

  await prisma.$disconnect();
  if (failures > 0) {
    console.error(`\n${failures} holding(s) failed to sync.`);
    process.exit(1);
  }
  console.log('\nDone.');
}

async function ensureSyncBotUser(prisma: PrismaService): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: SYNC_BOT_EMAIL } });
  if (existing) return existing;

  const role = await prisma.role.findUnique({ where: { code: 'researcher' } });
  if (!role) {
    throw new Error('Expected the "researcher" role to exist - run `pnpm --filter @umutsensen/database seed` first.');
  }

  return prisma.user.create({
    data: {
      email: SYNC_BOT_EMAIL,
      username: 'google-sync-bot',
      // Never used to log in - this account exists only as a createdBy/
      // updatedBy attribution target for sync-created records.
      passwordHash: 'disabled',
      fullName: 'Google Sheets Sync',
      roleId: role.id,
      status: 'active',
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
