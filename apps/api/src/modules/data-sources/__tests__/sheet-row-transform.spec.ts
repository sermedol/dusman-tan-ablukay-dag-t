import { parseBooleanish, parseDateish, parseNumberish, rowsFromTabValues } from '../validation/sheet-row-transform';

describe('rowsFromTabValues', () => {
  it('converts header + data rows into header-keyed row objects', () => {
    const result = rowsFromTabValues({
      sheetName: 'ENTITIES',
      values: [
        ['external_id', 'canonical_name'],
        ['company:eti-gumus', 'Eti Gümüş'],
      ],
    });

    expect(result).toEqual([
      { rowNumber: 2, cells: { external_id: 'company:eti-gumus', canonical_name: 'Eti Gümüş' } },
    ]);
  });

  it('normalizes header casing and spacing', () => {
    const result = rowsFromTabValues({
      sheetName: 'ENTITIES',
      values: [
        ['External ID', 'Canonical Name'],
        ['x', 'y'],
      ],
    });
    expect(result[0].cells).toEqual({ external_id: 'x', canonical_name: 'y' });
  });

  it('skips fully empty rows', () => {
    const result = rowsFromTabValues({
      sheetName: 'ENTITIES',
      values: [
        ['external_id', 'canonical_name'],
        ['', ''],
        ['x', 'y'],
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0].rowNumber).toBe(3);
  });

  it('returns an empty array when there is no header row', () => {
    expect(rowsFromTabValues({ sheetName: 'X', values: [] })).toEqual([]);
  });
});

describe('parseBooleanish', () => {
  it.each(['evet', 'EVET', 'true', '1', 'yes', 'x'])('treats "%s" as true', (value) => {
    expect(parseBooleanish(value)).toBe(true);
  });

  it.each(['hayir', 'false', '0', 'no'])('treats "%s" as false', (value) => {
    expect(parseBooleanish(value)).toBe(false);
  });

  it('returns undefined for empty input', () => {
    expect(parseBooleanish('')).toBeUndefined();
  });
});

describe('parseDateish', () => {
  it('parses a valid ISO date', () => {
    expect(parseDateish('2026-01-15')?.getUTCFullYear()).toBe(2026);
  });

  it('returns undefined for empty or invalid input', () => {
    expect(parseDateish('')).toBeUndefined();
    expect(parseDateish('not-a-date')).toBeUndefined();
  });
});

describe('parseNumberish', () => {
  it('parses numbers with a comma decimal separator', () => {
    expect(parseNumberish('39,92')).toBeCloseTo(39.92);
  });

  it('returns undefined for empty or invalid input', () => {
    expect(parseNumberish('')).toBeUndefined();
    expect(parseNumberish('abc')).toBeUndefined();
  });
});
