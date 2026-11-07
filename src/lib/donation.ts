// Donation link configuration.
//
// Links come from env vars so the repo never hardcodes an account, and forks can point
// to their own page (or show nothing). Donation page URLs are public by nature, so they
// are safe as NEXT_PUBLIC_ values; never put payment credentials or API keys here.

/**
 * Returns the URL only if it is a valid https URL without embedded credentials,
 * otherwise an empty string.
 */
export function sanitizeDonationUrl(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    const isSafe = url.protocol === 'https:' && !url.username && !url.password;
    return isSafe ? url.toString() : '';
  } catch {
    return '';
  }
}

export type DonationUrls = {
  /** Global page, e.g. Buy Me a Coffee, Ko-fi or GitHub Sponsors */
  global?: string | null;
  /** Page for Chinese users, e.g. Afdian (WeChat Pay / Alipay) */
  zh?: string | null;
};

/**
 * Picks the donation URL for a locale. Chinese visitors get the zh page when one is
 * configured, everyone else (and zh as a fallback) gets the global page. Returns an
 * empty string when nothing usable is configured, so the link can be hidden.
 */
export function resolveDonationUrl(locale: string, urls: DonationUrls): string {
  const global = sanitizeDonationUrl(urls.global);
  if (locale === 'zh') {
    return sanitizeDonationUrl(urls.zh) || global;
  }
  return global;
}

export function getDonationUrl(locale: string): string {
  // Each NEXT_PUBLIC_ var must be read by its literal name so Next.js can inline it.
  return resolveDonationUrl(locale, {
    global: process.env.NEXT_PUBLIC_DONATION_URL,
    zh: process.env.NEXT_PUBLIC_DONATION_URL_ZH,
  });
}
