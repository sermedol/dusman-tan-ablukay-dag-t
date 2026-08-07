import type { IGoogleSheetsClient, SheetTabValues } from '../services/google-sheets-client.interface';

/**
 * Deterministic in-memory fake of the Google Sheets client, for tests and
 * for exercising the sync pipeline without real Google credentials. This is
 * a fixture, not real research data - the yildizlar-sss-like structure below
 * exists only to shape-test the pipeline against something resembling the
 * real spreadsheet's tabs; the actual field values are synthetic.
 */
export class FakeGoogleSheetsClient implements IGoogleSheetsClient {
  private sheets = new Map<string, Map<string, string[][]>>();

  seed(spreadsheetId: string, sheetName: string, values: string[][]): void {
    if (!this.sheets.has(spreadsheetId)) this.sheets.set(spreadsheetId, new Map());
    this.sheets.get(spreadsheetId)!.set(sheetName, values);
  }

  async listTabNames(spreadsheetId: string): Promise<string[]> {
    return Array.from(this.sheets.get(spreadsheetId)?.keys() ?? []);
  }

  async batchGetTabValues(spreadsheetId: string, sheetNames: string[]): Promise<SheetTabValues[]> {
    const spreadsheet = this.sheets.get(spreadsheetId);
    if (!spreadsheet) return [];
    return sheetNames
      .filter((name) => spreadsheet.has(name))
      .map((name) => ({ sheetName: name, values: spreadsheet.get(name)! }));
  }
}

const MASTER_SPREADSHEET_ID = 'fake-master-registry';
const YSSS_SPREADSHEET_ID = 'fake-yildizlar-sss';

export function buildMasterRegistryFixture(): FakeGoogleSheetsClient {
  const client = new FakeGoogleSheetsClient();
  client.seed(MASTER_SPREADSHEET_ID, 'MASTER_HOLDINGS', [
    [
      'holding_id', 'holding_name', 'short_name', 'spreadsheet_id', 'status',
      'research_status', 'sync_enabled', 'sync_mode',
    ],
    [
      'holding:yildizlar-sss', 'Yıldızlar SSS', 'YSSS', YSSS_SPREADSHEET_ID, 'active',
      'in_progress', 'EVET', 'manual',
    ],
  ]);
  return client;
}

/** A small, structurally-faithful (but synthetic) YSSS-like fixture. */
export function buildYildizlarSssFixture(): FakeGoogleSheetsClient {
  const client = new FakeGoogleSheetsClient();

  client.seed(YSSS_SPREADSHEET_ID, 'HOLDING', [
    ['external_id', 'canonical_name', 'status', 'visibility'],
    ['holding:yildizlar-sss', 'Yıldızlar SSS', 'active', 'internal'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'ENTITIES', [
    ['external_id', 'entity_type', 'canonical_name', 'status', 'visibility'],
    ['company:eti-gumus', 'company', 'Eti Gümüş', 'active', 'internal'],
    ['company:nesko-maden', 'company', 'Nesko Maden', 'active', 'internal'],
    ['facility:yunus-emre-termik', 'power_plant', 'Yunus Emre Termik Santrali', 'active', 'internal'],
    ['union:bagimsiz-maden-is', 'union', 'Bağımsız Maden-İş', 'active', 'internal'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'ALIASES', [
    ['entity_external_id', 'alias', 'alias_type'],
    ['company:eti-gumus', 'Eti Gümüş A.Ş.', 'legal_name'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'LOCATIONS', [
    ['external_id', 'name', 'location_type', 'province', 'accuracy_level'],
    ['location:yunus-emre-termik', 'Yunus Emre Termik Santrali Sahası', 'exact', 'Kütahya', 'exact'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'SOURCES', [
    [
      'source_id', 'source_type', 'title', 'original_url',
      'reliability_level', 'verification_status', 'political_language_allowed',
    ],
    [
      'source:umutsen-2019-eti-gumus', 'report', 'Eti Gümüş Araştırma Raporu',
      'https://umutsen.org/rapor/eti-gumus', 'primary', 'verified', 'EVET',
    ],
    [
      'source:trade-registry-nesko', 'company_registry', 'Nesko Maden Ticaret Sicili Kaydı',
      'https://ticaretsicil.gov.tr/nesko', 'primary', 'verified', 'EVET',
    ],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'RELATIONS', [
    ['external_id', 'relation_type', 'source_external_id', 'target_external_id', 'valid_from'],
    ['relation:ysss-eti-gumus-owns', 'owns', 'holding:yildizlar-sss', 'company:eti-gumus', '2010-01-01'],
    ['relation:eti-gumus-operates-plant', 'operates', 'company:eti-gumus', 'facility:yunus-emre-termik', '2012-01-01'],
    [
      'relation:union-resistance-eti-gumus', 'resistance_at', 'union:bagimsiz-maden-is', 'company:eti-gumus',
      '2019-03-01',
    ],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'STRUGGLES', [
    ['external_id', 'title', 'type', 'status', 'start_date', 'location_external_id'],
    [
      'struggle:doruk-bagimsiz-2026', 'Eti Gümüş İşçi Direnişi', 'worker_resistance', 'ongoing', '2026-01-15',
      'location:yunus-emre-termik',
    ],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'STRUGGLE_ACTORS', [
    ['external_id', 'struggle_external_id', 'entity_external_id', 'role', 'side'],
    ['struggle-actor:doruk-bagimsiz-is', 'struggle:doruk-bagimsiz-2026', 'union:bagimsiz-maden-is', 'organizer', 'workers'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'STRUGGLE_DEMANDS', [
    ['external_id', 'struggle_external_id', 'demand', 'status'],
    ['struggle-demand:doruk-safety', 'struggle:doruk-bagimsiz-2026', 'İş güvenliği önlemlerinin artırılması', 'unmet'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'STRUGGLE_ACTIONS', [
    ['external_id', 'struggle_external_id', 'action_type', 'title', 'occurred_at'],
    ['struggle-action:doruk-strike-1', 'struggle:doruk-bagimsiz-2026', 'strike', 'Bir günlük iş bırakma', '2026-01-20'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'EVENTS', [
    ['external_id', 'entity_external_id', 'event_type', 'title', 'occurred_at'],
    ['event:eti-gumus-joined-ysss', 'company:eti-gumus', 'ownership_change', 'Yıldızlar SSS bünyesine katıldı', '2010-01-01'],
  ]);

  client.seed(YSSS_SPREADSHEET_ID, 'EVIDENCE', [
    ['parent_type', 'parent_external_id', 'source_external_id', 'claim_field'],
    ['relation', 'relation:ysss-eti-gumus-owns', 'source:umutsen-2019-eti-gumus', 'ownership'],
    ['entity', 'company:nesko-maden', 'source:trade-registry-nesko', 'registration'],
  ]);

  return client;
}

export { MASTER_SPREADSHEET_ID, YSSS_SPREADSHEET_ID };
