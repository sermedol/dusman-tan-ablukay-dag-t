import { createHash } from 'node:crypto';

/**
 * Deterministic JSON stringify: object keys are sorted so the same logical
 * content always produces the same string regardless of key insertion order
 * (which Sheets row-to-object conversion cannot guarantee is stable).
 */
export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries.map(([k, v]) => [k, sortKeysDeep(v)]));
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

/** SHA-256 content hash of a normalized record, used for change detection. */
export function contentHashOf(value: unknown): string {
  return createHash('sha256').update(canonicalStringify(value)).digest('hex');
}
