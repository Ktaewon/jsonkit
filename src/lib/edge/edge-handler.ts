// Request handler of the Cloudflare Worker entry (cloudflare/worker.mjs), in front of OpenNext.
//
// Every page is prerendered, so for almost every request the answer is known at build time:
// a locale redirect, a prerendered body, or the prerendered 404 page. Answering those here
// skips OpenNext's routing layer, the Next proxy (next-intl) and the cache entry JSON.parse,
// and above all never loads the Next server (~10 MB of JS to evaluate on a cold isolate,
// 100+ ms CPU), which used to happen for every 404.
//
// Everything else (non-GET/HEAD, /_next/*, preview mode, server actions, unknown RSC
// segments, URLs Next normalizes with a 308, invalid encodings) goes to OpenNext unchanged.
// The responses mirror what OpenNext's cache interception + the next-intl proxy return; the
// manifest is generated from the OpenNext cache by scripts/build-edge-manifest.mjs.
import { normalizeSearch, resolveLocaleRouting } from './locale-routing';

type Asset = [file: string, etag: string];

export interface EdgeManifest {
  buildId: string;
  assetPrefix: string;
  configHeaders: Array<{ regex: string; headers: Array<[string, string]> }>;
  notFound: { html: string; rsc: string };
  routes: Record<
    string,
    | {
        type: 'app';
        status: number;
        headers: Record<string, string>;
        html: Asset;
        rsc: Asset;
        segments: Record<string, Asset>;
      }
    | { type: 'route'; status: number; headers: Record<string, string>; body: Asset }
  >;
}

export interface AssetsBinding {
  fetch(input: string | URL | Request): Promise<Response>;
}

export type Fallback = () => Promise<Response>;

const SSG_CACHE_CONTROL = 's-maxage=31536000, stale-while-revalidate=2592000';
const NO_STORE_CACHE_CONTROL = 'private, no-cache, no-store, max-age=0, must-revalidate';
const VARY =
  'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url';
const NOT_FOUND_VARY =
  'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch';
const HTML = 'text/html; charset=utf-8';
const RSC = 'text/x-component';

/** Paths matched by the proxy matcher in src/proxy.ts. */
export function matchesProxy(pathname: string): boolean {
  const rest = pathname.slice(1);
  return !(
    rest.startsWith('api') ||
    rest.startsWith('_next') ||
    rest.startsWith('_vercel') ||
    rest.includes('.')
  );
}

export function createEdgeHandler(manifest: EdgeManifest) {
  const configHeaders = manifest.configHeaders.map((rule) => ({
    regex: new RegExp(rule.regex),
    headers: rule.headers,
  }));

  function baseHeaders(pathname: string): Headers {
    const headers = new Headers();
    for (const rule of configHeaders) {
      if (rule.regex.test(pathname)) {
        for (const [key, value] of rule.headers) headers.set(key, value);
      }
    }
    return headers;
  }

  async function body(assets: AssetsBinding, request: Request, file: string, head: boolean) {
    if (head) return null;
    const res = await assets.fetch(new URL(manifest.assetPrefix + file, request.url));
    if (!res.ok) throw new Error(`edge asset ${file} missing (${res.status})`);
    return res.body;
  }

  return async function handle(
    request: Request,
    assets: AssetsBinding,
    fallback: Fallback
  ): Promise<Response> {
    const method = request.method;
    if (method !== 'GET' && method !== 'HEAD') return fallback();
    const url = new URL(request.url);
    const { pathname } = url;
    const reqHeaders = request.headers;

    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/cdn-cgi/') ||
      // Next answers these with a 308 to the normalized URL
      (pathname !== '/' && pathname.endsWith('/')) ||
      pathname.includes('//') ||
      reqHeaders.has('next-action') ||
      reqHeaders.has('x-prerender-revalidate')
    ) {
      return fallback();
    }
    const cookie = reqHeaders.get('cookie');
    if (
      cookie &&
      (cookie.includes('__prerender_bypass') || cookie.includes('__next_preview_data'))
    ) {
      return fallback();
    }

    const route = Object.hasOwn(manifest.routes, pathname) ? manifest.routes[pathname] : undefined;
    if (!route && pathname.includes('%')) {
      // Might be an encoded spelling of a known route; let Next decide.
      return fallback();
    }

    const headers = baseHeaders(pathname);

    // --- next-intl proxy ---
    if (matchesProxy(pathname)) {
      const search = normalizeSearch(url.search);
      const nextUrl = new URL(pathname + search, url);
      const locale = resolveLocaleRouting({
        url: nextUrl,
        cookie,
        acceptLanguage: reqHeaders.get('accept-language'),
        host: reqHeaders.get('host'),
        forwardedHost: reqHeaders.get('x-forwarded-host'),
        forwardedProto: reqHeaders.get('x-forwarded-proto'),
      });
      if (locale.type === 'passthrough') return fallback();
      if (locale.setCookie) headers.set('set-cookie', locale.setCookie);
      if (locale.type === 'redirect') {
        // Next turns same-origin redirect URLs into relative ones
        const location = locale.location.startsWith(`${url.origin}/`)
          ? locale.location.slice(url.origin.length)
          : locale.location;
        headers.set('location', location);
        return new Response(null, { status: 307, headers });
      }
      headers.set('link', locale.link);
    }

    const head = method === 'HEAD';
    const isRsc = reqHeaders.get('rsc') === '1';

    if (!route) {
      headers.set('cache-control', NO_STORE_CACHE_CONTROL);
      headers.set('content-type', isRsc ? RSC : HTML);
      headers.set('vary', NOT_FOUND_VARY);
      const file = isRsc ? manifest.notFound.rsc : manifest.notFound.html;
      return new Response(await body(assets, request, file, head), { status: 404, headers });
    }

    let asset: Asset;
    let contentType: string | undefined;
    let segmentResponse = false;
    if (route.type === 'app') {
      if (isRsc) {
        const segment = reqHeaders.get('next-router-segment-prefetch');
        if (segment !== null) {
          if (!Object.hasOwn(route.segments, segment)) return fallback();
          asset = route.segments[segment];
          segmentResponse = true;
        } else {
          asset = route.rsc;
        }
        contentType = RSC;
      } else {
        asset = route.html;
        contentType = HTML;
      }
    } else {
      asset = route.body;
    }

    headers.set('cache-control', SSG_CACHE_CONTROL);
    headers.set('x-opennext-cache', 'HIT');
    headers.set('etag', asset[1]);
    if (contentType) headers.set('content-type', contentType);
    for (const [key, value] of Object.entries(route.headers)) headers.set(key, value);
    headers.set('vary', VARY);
    if (segmentResponse) {
      headers.set('x-nextjs-prerender', '1');
      headers.set('x-nextjs-postponed', '2');
    }
    if (route.status === 404 || route.status === 500) {
      headers.set('cache-control', NO_STORE_CACHE_CONTROL);
    }
    return new Response(await body(assets, request, asset[0], head), {
      status: route.status,
      headers,
    });
  };
}
