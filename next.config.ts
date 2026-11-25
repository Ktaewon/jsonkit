import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

// Version of the self-hosted Monaco build in public/monaco (see scripts/copy-monaco.mjs).
// Read here instead of importing package.json in client code, so the JSON isn't bundled.
const monacoVersion: string = JSON.parse(
  readFileSync(join(process.cwd(), 'node_modules', 'monaco-editor', 'package.json'), 'utf8')
).version;

const BROWSER_ONLY_STUB = './src/lib/browser-only-stub.ts';

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

// Gives `next dev` the Cloudflare bindings from wrangler.jsonc via getCloudflareContext().
// The app uses no bindings yet, so this only runs in dev, never during `next build`.
if (process.env.NODE_ENV === 'development') {
  void import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev());
}

const nextConfig: NextConfig = {
  // Used by the Dockerfile. @opennextjs/cloudflare also builds on the standalone output
  // (it forces NEXT_PRIVATE_STANDALONE itself), so this works for both targets.
  output: 'standalone',
  env: {
    NEXT_PUBLIC_MONACO_VERSION: monacoVersion,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  turbopack: {
    // quicktype-core and elkjs are only ever loaded lazily from client effects, but their
    // `import()` still gets compiled into the SSR bundle, which adds ~3 MiB to the
    // Cloudflare Worker. Resolve them to a stub everywhere except the browser build.
    resolveAlias: {
      'quicktype-core': { browser: 'quicktype-core', default: BROWSER_ONLY_STUB },
      'elkjs/lib/elk.bundled': { browser: 'elkjs/lib/elk.bundled', default: BROWSER_ONLY_STUB },
      // quicktype-core imports `node:fs` in code paths the browser never runs.
      'node:fs': { browser: './src/lib/empty-module.ts' },
    },
  },
  images: {
    // Cloudflare Workers has no built-in Next.js image optimizer, so images are served as-is
    // (blog images are already on the Vercel Blob CDN). Kept the same for Docker so both
    // targets render identical HTML.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pdohaq5b0usqo1wk.public.blob.vercel-storage.com',
        pathname: '/blog/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Self-hosted Monaco build; the version is in the path, so it never changes in place
        source: '/monaco/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withMDX(withNextIntl(nextConfig));
