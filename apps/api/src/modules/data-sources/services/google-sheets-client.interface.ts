export interface SheetTabValues {
  /** Tab/sheet name, e.g. "MASTER_HOLDINGS" or "ENTITIES". */
  sheetName: string;
  /** Raw rows including the header row at index 0. Empty array if the tab has no data. */
  values: string[][];
}

/**
 * Abstraction over "read tabs from a Google Sheet". Exists so the sync
 * engine can be exercised against a deterministic fake implementation in
 * tests and in credential-less local development, without any conditional
 * "if test" branching inside production code.
 */
export interface IGoogleSheetsClient {
  /** Lists the tab (sheet) names that actually exist in the spreadsheet. */
  listTabNames(spreadsheetId: string): Promise<string[]>;
  /**
   * Reads the full contents of the given tabs in one batch call. Tabs that
   * don't exist in the spreadsheet are simply omitted from the result
   * (not an error - most holding sheets won't populate every optional tab).
   */
  batchGetTabValues(spreadsheetId: string, sheetNames: string[]): Promise<SheetTabValues[]>;
}

export const GOOGLE_SHEETS_CLIENT = Symbol('GOOGLE_SHEETS_CLIENT');
