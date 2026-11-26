// Locale routing for the Cloudflare Worker entry (cloudflare/worker.mjs).
//
// Re-implements what next-intl's `createMiddleware(routing)` (src/proxy.ts) does for this
// app's routing config, so the Worker can answer redirects and add the locale headers
// without going through OpenNext + the Next proxy on every request. It uses the same
// negotiation libraries as next-intl. src/lib/edge/__tests__/locale-routing.test.ts runs
// both implementations on the same requests and expects identical results.
//
// Only the options this app uses are supported (localePrefix 'always', no domains, no
// pathnames, default cookie, detection and alternate links); anything else throws at
// startup instead of silently behaving differently from next-intl.
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { routing } from '../../i18n/routing';

const config: Record<string, unknown> = routing;
for (const key of ['domains', 'pathnames', 'localeCookie', 'localeDetection', 'alternateLinks']) {
  if (config[key] !== undefined) {
    throw new Error(`locale-routing: unsupported next-intl routing option "${key}"`);
  }
}
if (config.localePrefix !== undefined && config.localePrefix !== 'always') {
  throw new Error('locale-routing: only localePrefix "always" is supported');
}

export const LOCALES: readonly string[] = routing.locales;
export const DEFAULT_LOCALE: string = routing.defaultLocale;
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// next-intl sorts by length to work around formatjs/formatjs#4469
const ORDERED_LOCALES = LOCALES.slice().sort((a, b) => b.length - a.length);

// Accept-Language values repeat a lot (same browsers), and best-fit matching is the most
// expensive part of locale detection, so remember recent results.
const acceptLanguageCache = new Map<string, string | undefined>();
const ACCEPT_LANGUAGE_CACHE_SIZE = 256;

/** Same as next-intl's getAcceptLanguageLocale (undefined when nothing usable). */
export function getAcceptLanguageLocale(acceptLanguage: string | null): string | undefined {
  const key = acceptLanguage ?? '';
  if (acceptLanguageCache.has(key)) return acceptLanguageCache.get(key);
  let locale: string | undefined;
  try {
    const languages = new Negotiator({
      headers: { 'accept-language': acceptLanguage || undefined },
    }).languages();
    locale = match(languages, ORDERED_LOCALES, DEFAULT_LOCALE);
  } catch {
    // Invalid language
  }
  if (acceptLanguageCache.size >= ACCEPT_LANGUAGE_CACHE_SIZE) acceptLanguageCache.clear();
  acceptLanguageCache.set(key, locale);
  return locale;
}

/** Same parsing as Next's RequestCookies (@edge-runtime/cookies parseCookie), one cookie. */
export function getCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  let result: string | undefined;
  for (const pair of cookieHeader.split(/; */)) {
    if (!pair) continue;
    const splitAt = pair.indexOf('=');
    if (splitAt === -1) {
      if (pair === name) result = 'true';
      continue;
    }
    if (pair.slice(0, splitAt) !== name) continue;
    try {
      result = decodeURIComponent(pair.slice(splitAt + 1));
    } catch {
      // ignored, like Next
    }
  }
  return result;
}

interface PrefixMatch {
  locale: string;
  prefix: string;
  exact: boolean;
}

function getPathnameMatch(pathname: string): PrefixMatch | undefined {
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { locale, prefix, exact: true };
    }
    const lower = pathname.toLowerCase();
    if (lower === prefix || lower.startsWith(`${prefix}/`)) {
      return { locale, prefix, exact: false };
    }
  }
  return undefined;
}

function stripTrailingSlash(pathname: string): string {
  return pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

const LOCALE_PREFIX_RE = new RegExp(`^(${LOCALES.map((l) => `\\/${l}`).join('|')})/(.*)`, 'i');

/** Path without the locale prefix: '/en/beautify' → '/beautify', '/en' → '/'. */
export function getUnprefixedPathname(pathname: string): string {
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const m = withSlash.match(LOCALE_PREFIX_RE);
  const result = m ? `/${m[2]}` : withSlash;
  return result === '/' ? result : stripTrailingSlash(result);
}

function prefixPathname(prefix: string, pathname: string): string {
  return /^\/(\?.*)?$/.test(pathname) ? prefix + pathname.slice(1) : prefix + pathname;
}

export interface LocaleRoutingInput {
  /** Request URL as Next sees it (search already normalized, see normalizeSearch). */
  url: URL;
  cookie: string | null;
  acceptLanguage: string | null;
  host: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}

export type LocaleRoutingResult =
  | { type: 'passthrough' }
  | { type: 'redirect'; location: string; setCookie?: string }
  | { type: 'next'; locale: string; setCookie?: string; link: string };

/**
 * Decides what next-intl's middleware would do for a request that matches the proxy matcher.
 * 'passthrough' = let Next handle it (invalid percent-encoding, which Next answers with 400).
 */
export function resolveLocaleRouting(input: LocaleRoutingInput): LocaleRoutingResult {
  const { url } = input;
  let decoded: string;
  try {
    decoded = decodeURI(url.pathname);
  } catch {
    return { type: 'passthrough' };
  }
  const pathname = decoded.replace(/\\/g, '%5C').replace(/\/+/g, '/');

  const prefixMatch = getPathnameMatch(pathname);
  const cookieValue = getCookie(input.cookie, LOCALE_COOKIE);
  const cookieLocale =
    cookieValue !== undefined && LOCALES.includes(cookieValue) ? cookieValue : undefined;
  // Computed lazily: only needed without a locale prefix/cookie, or for the cookie sync
  let acceptLocale: string | undefined | null = null;
  const getAccept = () =>
    acceptLocale === null
      ? (acceptLocale = getAcceptLanguageLocale(input.acceptLanguage))
      : acceptLocale;

  const locale = prefixMatch?.locale ?? cookieLocale ?? getAccept() ?? DEFAULT_LOCALE;

  // syncCookie
  let setCookie: string | undefined;
  if (cookieValue !== undefined ? cookieValue !== locale : getAccept() !== locale) {
    setCookie = `${LOCALE_COOKIE}=${locale}; Path=/; SameSite=lax`;
  }

  const unprefixed = getUnprefixedPathname(pathname);
  if (!prefixMatch || !prefixMatch.exact) {
    const target = new URL(
      prefixPathname(prefixMatch?.prefix ?? `/${locale}`, unprefixed) + url.search,
      url
    );
    target.pathname = stripTrailingSlash(target.pathname);
    return { type: 'redirect', location: target.toString(), setCookie };
  }

  return { type: 'next', locale, setCookie, link: getAlternateLinks(input) };
}

/** Same value as next-intl's `Link` response header (hreflang alternates + x-default). */
function getAlternateLinks(input: LocaleRoutingInput): string {
  const base = new URL(input.url);
  const host = input.forwardedHost ?? input.host;
  if (host) {
    base.port = '';
    base.host = host;
  }
  if (input.forwardedProto) base.protocol = input.forwardedProto;
  const pathname = getUnprefixedPathname(base.pathname);
  const entry = (target: string, hreflang: string) => {
    const url = new URL(target, base);
    url.pathname = stripTrailingSlash(url.pathname);
    return `<${url.toString()}>; rel="alternate"; hreflang="${hreflang}"`;
  };
  const links = LOCALES.map((locale) =>
    entry(pathname === '/' ? `/${locale}` : `/${locale}${pathname}`, locale)
  );
  links.push(entry(pathname, 'x-default'));
  return links.join(', ');
}

/**
 * OpenNext rebuilds the query string from parsed parameters before Next sees it
 * (`?q=a%20b` → `?q=a+b`); redirects keep that form.
 */
export function normalizeSearch(search: string): string {
  if (search.length <= 1) return '';
  const normalized = new URLSearchParams(search).toString();
  return normalized ? `?${normalized}` : '';
}
