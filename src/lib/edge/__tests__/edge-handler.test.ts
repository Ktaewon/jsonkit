import { describe, it, expect, vi } from 'vitest';
import { createEdgeHandler, matchesProxy, type EdgeManifest } from '../edge-handler';

const manifest: EdgeManifest = {
  buildId: 'b1',
  assetPrefix: '/cdn-cgi/_jk/b1/',
  configHeaders: [
    {
      regex: '^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$',
      headers: [['X-Frame-Options', 'SAMEORIGIN']],
    },
  ],
  notFound: { html: 'nf-html', rsc: 'nf-rsc' },
  routes: {
    '/en/beautify': {
      type: 'app',
      status: 200,
      headers: { 'x-nextjs-stale-time': '300' },
      html: ['html', '"e-html"'],
      rsc: ['rsc', '"e-rsc"'],
      segments: { '/_tree': ['tree', '"e-tree"'] },
    },
    '/robots.txt': {
      type: 'route',
      status: 200,
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
      body: ['robots', '"e-robots"'],
    },
  },
};

const assets = {
  fetch: vi.fn(async (input: string | URL | Request) => {
    const file = String(input).split('/').pop();
    return new Response(`body:${file}`);
  }),
};

const handle = createEdgeHandler(manifest);
const FALLBACK = 'fallback';

async function run(path: string, init: RequestInit = {}) {
  const fallback = vi.fn(async () => new Response(FALLBACK, { status: 299 }));
  const res = await handle(new Request(`https://jsonkit.org${path}`, init), assets, fallback);
  return { res, text: await res.text(), fellBack: fallback.mock.calls.length > 0 };
}

describe('createEdgeHandler', () => {
  it('prerendered HTML', async () => {
    const { res, text } = await run('/en/beautify', { headers: { 'accept-language': 'en' } });
    expect(res.status).toBe(200);
    expect(text).toBe('body:html');
    expect(res.headers.get('etag')).toBe('"e-html"');
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(res.headers.get('link')).toContain('hreflang="x-default"');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('RSC, segment prefetch, HEAD', async () => {
    expect((await run('/en/beautify?_rsc=1', { headers: { rsc: '1' } })).text).toBe('body:rsc');
    const seg = await run('/en/beautify', {
      headers: { rsc: '1', 'next-router-segment-prefetch': '/_tree' },
    });
    expect(seg.text).toBe('body:tree');
    expect(seg.res.headers.get('x-nextjs-postponed')).toBe('2');
    const head = await run('/en/beautify', { method: 'HEAD' });
    expect(head.text).toBe('');
    expect(head.res.headers.get('etag')).toBe('"e-html"');
  });

  it('unknown paths are the prerendered 404 without the Next server', async () => {
    const page = await run('/en/nope');
    expect(page.res.status).toBe(404);
    expect(page.text).toBe('body:nf-html');
    expect(page.res.headers.get('cache-control')).toContain('no-store');
    const rsc = await run('/en/nope', { headers: { rsc: '1' } });
    expect(rsc.text).toBe('body:nf-rsc');
    const bot = await run('/wp-login.php');
    expect(bot.res.status).toBe(404);
    expect(bot.res.headers.get('link')).toBeNull();
  });

  it('locale redirects', async () => {
    const { res } = await run('/beautify?a=1', { headers: { 'accept-language': 'ko' } });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('/ko/beautify?a=1');
  });

  it('route handlers keep their own headers', async () => {
    const { res, text } = await run('/robots.txt');
    expect(text).toBe('body:robots');
    expect(res.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate');
  });

  it.each([
    ['/en/beautify', { method: 'POST' }],
    ['/_next/image?url=x', {}],
    ['/en/beautify/', {}],
    ['/en//beautify', {}],
    ['/en/beaut%69fy', {}],
    ['/%E0%A4%A', {}],
    ['/en/beautify', { headers: { cookie: '__prerender_bypass=1' } }],
    ['/en/beautify', { headers: { 'next-action': 'abc' } }],
    ['/en/beautify', { headers: { rsc: '1', 'next-router-segment-prefetch': '/unknown' } }],
  ] as Array<[string, RequestInit]>)('%s goes to OpenNext', async (path, init) => {
    const { fellBack, text } = await run(path, init);
    expect(fellBack).toBe(true);
    expect(text).toBe(FALLBACK);
  });

  it('matchesProxy mirrors the src/proxy.ts matcher', () => {
    expect(matchesProxy('/')).toBe(true);
    expect(matchesProxy('/en/beautify')).toBe(true);
    expect(matchesProxy('/api/x')).toBe(false);
    expect(matchesProxy('/apixyz')).toBe(false);
    expect(matchesProxy('/robots.txt')).toBe(false);
    expect(matchesProxy('/_vercel/x')).toBe(false);
  });
});
