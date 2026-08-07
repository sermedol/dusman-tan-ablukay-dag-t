/**
 * Political-language source policy.
 *
 * Factual research may cite a wide range of sources (Resmî Gazete, Ticaret
 * Sicili, Rekabet Kurumu, TBMM, kamu kurumları, holding/şirket siteleri,
 * Bağımsız Maden-İş, other reliable outlets). But editorial/political framing
 * may only ever be attributed to this specific source family: umutsen.org,
 * komiteler.org, e-komite.com.
 *
 * This is enforced here, at the validation layer, rather than trusted from
 * the sheet's own `political_language_allowed` cell - a sheet row claiming
 * "yes" for a source outside this allowlist is not honored. The Sheet's
 * SOURCE_POLICY tab is the source of truth for *which sources exist*, but
 * this allowlist (not sheet data) is the source of truth for *whether
 * political language may ever be attached to a given domain*.
 */
const POLITICAL_LANGUAGE_ALLOWLIST_DOMAINS = ['umutsen.org', 'komiteler.org', 'e-komite.com'];

export function isTrustedPoliticalDomain(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return POLITICAL_LANGUAGE_ALLOWLIST_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export interface PoliticalLanguageInput {
  originalUrl?: string;
  archivedUrl?: string;
  claimedAllowed: boolean;
}

export interface PoliticalLanguageResolution {
  allowed: boolean;
  /** Set when the sheet claimed `true` but the domain isn't trusted - a data-quality warning, not a hard rejection. */
  warning?: string;
}

export function resolvePoliticalLanguageAllowed(input: PoliticalLanguageInput): PoliticalLanguageResolution {
  const trustedDomain =
    isTrustedPoliticalDomain(input.originalUrl) || isTrustedPoliticalDomain(input.archivedUrl);

  if (input.claimedAllowed && !trustedDomain) {
    return {
      allowed: false,
      warning:
        'political_language_allowed was set for a source outside the trusted domain allowlist (umutsen.org, komiteler.org, e-komite.com); overridden to false.',
    };
  }

  return { allowed: input.claimedAllowed && trustedDomain };
}
