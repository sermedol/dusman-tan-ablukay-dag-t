import { isTrustedPoliticalDomain, resolvePoliticalLanguageAllowed } from '../validation/political-source-policy';

describe('isTrustedPoliticalDomain', () => {
  it.each(['https://umutsen.org/x', 'https://www.komiteler.org', 'https://e-komite.com/y'])(
    'trusts %s',
    (url) => {
      expect(isTrustedPoliticalDomain(url)).toBe(true);
    }
  );

  it.each(['https://haber.com', 'https://umutsen.org.evil.com', 'not a url', undefined])(
    'does not trust %s',
    (url) => {
      expect(isTrustedPoliticalDomain(url)).toBe(false);
    }
  );
});

describe('resolvePoliticalLanguageAllowed', () => {
  it('honors true when the domain is trusted', () => {
    const result = resolvePoliticalLanguageAllowed({
      originalUrl: 'https://umutsen.org/rapor',
      claimedAllowed: true,
    });
    expect(result.allowed).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it('overrides true to false when the domain is not trusted, with a warning', () => {
    const result = resolvePoliticalLanguageAllowed({
      originalUrl: 'https://haber.com/article',
      claimedAllowed: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.warning).toMatch(/trusted domain allowlist/);
  });

  it('stays false when not claimed, even on a trusted domain', () => {
    const result = resolvePoliticalLanguageAllowed({
      originalUrl: 'https://umutsen.org/rapor',
      claimedAllowed: false,
    });
    expect(result.allowed).toBe(false);
  });
});
