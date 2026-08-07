import type { SheetTabValues } from '../services/google-sheets-client.interface';

export interface RawSheetRow {
  /** 1-indexed spreadsheet row number (header row is row 1), for error messages. */
  rowNumber: number;
  /** header -> cell value, trimmed. Missing cells are empty strings. */
  cells: Record<string, string>;
}

/**
 * Converts a tab's raw [][] values (header row + data rows) into header-keyed
 * row objects. Header cells are normalized (trimmed, lowercased with spaces
 * -> underscores) so minor spreadsheet formatting differences don't break
 * column matching.
 */
export function rowsFromTabValues(tab: SheetTabValues): RawSheetRow[] {
  const [headerRow, ...dataRows] = tab.values;
  if (!headerRow) return [];

  const headers = headerRow.map(normalizeHeader);

  return dataRows
    .map((row, index) => {
      const cells: Record<string, string> = {};
      headers.forEach((header, colIndex) => {
        if (!header) return;
        cells[header] = (row[colIndex] ?? '').toString().trim();
      });
      return { rowNumber: index + 2, cells };
    })
    .filter((row) => Object.values(row.cells).some((value) => value !== ''));
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

/** Empty-string-safe helpers used by the Zod schemas below. */
export function emptyToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value;
}

export function parseBooleanish(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return undefined;
  return ['evet', 'true', '1', 'yes', 'x', 'y'].includes(normalized);
}

export function parseDateish(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseNumberish(value: string): number | undefined {
  if (value === '') return undefined;
  const num = Number(value.replace(',', '.'));
  return Number.isNaN(num) ? undefined : num;
}
