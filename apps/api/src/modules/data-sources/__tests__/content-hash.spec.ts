import { canonicalStringify, contentHashOf } from '../services/content-hash.util';

describe('canonicalStringify', () => {
  it('produces the same string regardless of key order', () => {
    const a = canonicalStringify({ b: 1, a: 2 });
    const b = canonicalStringify({ a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it('drops undefined values so their presence/absence does not change the hash', () => {
    const a = canonicalStringify({ a: 1, b: undefined });
    const b = canonicalStringify({ a: 1 });
    expect(a).toBe(b);
  });

  it('serializes Date instances to ISO strings deterministically', () => {
    const date = new Date('2026-01-15T00:00:00.000Z');
    expect(canonicalStringify({ d: date })).toBe('{"d":"2026-01-15T00:00:00.000Z"}');
  });
});

describe('contentHashOf', () => {
  it('is stable for structurally-equal objects with different key order', () => {
    expect(contentHashOf({ b: 1, a: 2 })).toBe(contentHashOf({ a: 2, b: 1 }));
  });

  it('changes when a value changes', () => {
    expect(contentHashOf({ a: 1 })).not.toBe(contentHashOf({ a: 2 }));
  });
});
