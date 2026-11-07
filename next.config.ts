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

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_MONACO_VERSION: monacoVersion,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
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
