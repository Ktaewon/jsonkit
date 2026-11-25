// OpenNext config for Cloudflare Workers. See DEPLOY_CLOUDFLARE.md.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  // Every page is prerendered at build time (SSG) and nothing uses ISR/revalidate, so the
  // prerendered HTML/RSC is served read-only from Workers Static Assets (the ASSETS binding).
  // No R2/KV/D1 bindings needed, which keeps this on the free plan. If a page ever uses
  // `revalidate`, switch to the R2 incremental cache (see DEPLOY_CLOUDFLARE.md).
  incrementalCache: staticAssetsIncrementalCache,
  // Serve cache hits before the Next.js server is loaded, which saves CPU per request.
  enableCacheInterception: true,
});
