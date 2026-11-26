// Runs after `opennextjs-cloudflare build` (see `npm run build:cf`). Prepares what the Worker
// entry (cloudflare/worker.mjs) needs to answer most requests without loading OpenNext/Next:
//
// - every prerendered body (HTML, RSC, RSC segments, route handlers) as a plain file in the
//   static assets under /cdn-cgi/_jk/<buildId>/, so a cache hit is a streamed ASSETS fetch
//   instead of reading and JSON-parsing a 200–400 KB OpenNext cache entry,
// - .open-next/jsonkit/edge-manifest.json: the list of routes with their response headers
//   and precomputed ETags (same md5 OpenNext computes per request), the not-found page and
//   the custom headers from next.config.ts.
//
// The files come from .open-next/cache, i.e. the very entries OpenNext would serve. The script
// fails if any page is rendered at request time, because the Worker answers unknown paths with
// the prerendered 404 page.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, '.next');
const OPEN_NEXT_DIR = path.join(ROOT, '.open-next');
const ASSET_PREFIX = '/cdn-cgi/_jk';

function fail(message) {
  console.error(`[build-edge-manifest] ${message}`);
  process.exit(1);
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

if (!fs.existsSync(path.join(OPEN_NEXT_DIR, 'worker.js'))) {
  fail('.open-next/worker.js not found, run `opennextjs-cloudflare build` first');
}

// Same binary detection OpenNext uses for route handler bodies stored as base64
const requireFromRoot = createRequire(path.join(ROOT, 'package.json'));
const requireFromCloudflare = createRequire(requireFromRoot.resolve('@opennextjs/cloudflare'));
const { isBinaryContentType } = await import(
  pathToFileURL(requireFromCloudflare.resolve('@opennextjs/aws/utils/binary.js')).href
);

const buildId = fs.readFileSync(path.join(NEXT_DIR, 'BUILD_ID'), 'utf8').trim();
const prerender = readJson(path.join(NEXT_DIR, 'prerender-manifest.json'));
const routesManifest = readJson(path.join(NEXT_DIR, 'routes-manifest.json'));
const appPaths = readJson(path.join(NEXT_DIR, 'app-path-routes-manifest.json'));

if (routesManifest.basePath) fail('basePath is not supported');
if (
  (routesManifest.rewrites?.beforeFiles ?? []).length ||
  (routesManifest.rewrites?.afterFiles ?? []).length ||
  (routesManifest.rewrites?.fallback ?? []).length
) {
  fail('next.config rewrites are not supported by the Worker fast path');
}
const userRedirects = (routesManifest.redirects ?? []).filter((r) => !r.internal);
if (userRedirects.length) fail('next.config redirects are not supported by the Worker fast path');

// --- Every app route must be fully prerendered ---------------------------------------------
const SPECIAL = new Set(['/_not-found', '/_global-error']);
for (const route of new Set(Object.values(appPaths))) {
  if (SPECIAL.has(route)) continue;
  if (route.includes('[')) {
    const dynamic = prerender.dynamicRoutes[route];
    if (!dynamic || dynamic.fallback !== false) {
      fail(
        `${route} is not prerendered with dynamicParams = false (fallback: ${dynamic?.fallback})`
      );
    }
  } else if (!prerender.routes[route]) {
    fail(`${route} is rendered at request time; the Worker would answer it with a 404`);
  }
}
for (const [route, info] of Object.entries(prerender.routes)) {
  if (info.initialRevalidateSeconds !== false && info.initialRevalidateSeconds !== undefined) {
    fail(`${route} uses revalidate (${info.initialRevalidateSeconds}); ISR is not supported`);
  }
}

// --- Bodies -> static assets -----------------------------------------------------------------
const cacheDir = path.join(OPEN_NEXT_DIR, 'cache', buildId);
const assetDir = path.join(OPEN_NEXT_DIR, 'assets', ASSET_PREFIX.slice(1), buildId);
fs.rmSync(path.join(OPEN_NEXT_DIR, 'assets', ASSET_PREFIX.slice(1)), {
  recursive: true,
  force: true,
});
fs.mkdirSync(assetDir, { recursive: true });

const md5 = (value) => createHash('md5').update(value).digest('hex');
let assetCount = 0;
let assetBytes = 0;
const written = new Set();

/** Writes a body as an asset file, returns [file name, etag]. */
function asset(stored, binary = false) {
  const data = binary ? Buffer.from(stored, 'base64') : Buffer.from(stored, 'utf8');
  const name = createHash('sha256').update(data).digest('hex').slice(0, 32);
  if (!written.has(name)) {
    fs.writeFileSync(path.join(assetDir, name), data);
    written.add(name);
    assetCount += 1;
    assetBytes += data.length;
  }
  // OpenNext's ETag is the md5 of the stored string (base64 for binary bodies)
  return [name, `"${md5(stored)}"`];
}

// Headers stored in the cache entry that must not be sent (see OpenNext cacheInterceptor)
const INTERNAL_HEADERS = new Set(['x-middleware-set-cookie', 'x-next-cache-tags']);
function publicHeaders(headers = {}) {
  const result = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || INTERNAL_HEADERS.has(key.toLowerCase())) continue;
    result[key] = String(value);
  }
  return result;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.cache') ? [full] : [];
  });
}

const routes = {};
let notFound;
for (const file of walk(cacheDir)) {
  const marker = file.indexOf(`${path.sep}$${path.sep}`);
  if (marker === -1) fail(`unexpected cache file layout: ${file}`);
  let route =
    '/' +
    file
      .slice(marker + 3, -'.cache'.length)
      .split(path.sep)
      .join('/');
  const value = readJson(file);
  if (value.revalidate !== undefined && value.revalidate !== false) {
    fail(`${route}: cache entry has revalidate=${value.revalidate}`);
  }
  if (route === '/_not-found') {
    if (value.type !== 'app' || !value.html || !value.rsc) fail('unexpected _not-found entry');
    notFound = { html: asset(value.html)[0], rsc: asset(value.rsc)[0] };
    continue;
  }
  if (route === '/_global-error') continue;
  if (route === '/index') route = '/';
  if (routes[route]) fail(`duplicate cache entry for ${route}`);

  const status = value.meta?.status ?? 200;
  const headers = publicHeaders(value.meta?.headers);
  if (value.type === 'app') {
    if (!value.html || value.rsc === undefined) fail(`${route}: incomplete app entry`);
    const segments = {};
    for (const [segment, body] of Object.entries(value.segmentData ?? {})) {
      segments[segment] = asset(body);
    }
    routes[route] = {
      type: 'app',
      status,
      headers,
      html: asset(value.html),
      rsc: asset(value.rsc),
      segments,
    };
  } else if (value.type === 'route') {
    const binary = isBinaryContentType(String(value.meta?.headers?.['content-type']));
    routes[route] = { type: 'route', status, headers, body: asset(value.body, binary) };
  } else {
    fail(`${route}: unsupported cache entry type ${value.type}`);
  }
}
if (!notFound) fail('no prerendered _not-found page');

// Every prerendered route must have a cache entry, or the Worker would 404 it
for (const route of Object.keys(prerender.routes)) {
  if (!SPECIAL.has(route) && !routes[route]) fail(`missing cache entry for prerendered ${route}`);
}

// next.config.ts headers(), applied by the Worker to the responses it builds itself
const configHeaders = (routesManifest.headers ?? []).map((rule) => {
  if (rule.has || rule.missing) fail(`header rule ${rule.source} uses has/missing`);
  return { regex: rule.regex, headers: rule.headers.map(({ key, value }) => [key, value]) };
});

const manifest = {
  buildId,
  assetPrefix: `${ASSET_PREFIX}/${buildId}/`,
  configHeaders,
  notFound,
  routes,
};
fs.mkdirSync(path.join(OPEN_NEXT_DIR, 'jsonkit'), { recursive: true });
fs.writeFileSync(
  path.join(OPEN_NEXT_DIR, 'jsonkit', 'edge-manifest.json'),
  JSON.stringify(manifest)
);

console.log(
  `[build-edge-manifest] ${Object.keys(routes).length} routes, ${assetCount} asset files ` +
    `(${(assetBytes / 1024 / 1024).toFixed(1)} MiB) in ${ASSET_PREFIX}/${buildId}/`
);
