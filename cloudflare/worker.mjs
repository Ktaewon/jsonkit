// Cloudflare Worker entry (wrangler.jsonc `main`). Answers prerendered pages, locale redirects
// and 404s from build-time data (src/lib/edge/edge-handler.ts) and hands everything else to
// the OpenNext worker. Both generated imports come from `npm run build:cf`.
// See https://opennext.js.org/cloudflare/howtos/custom-worker
import openNextWorker from '../.open-next/worker.js';
import manifest from '../.open-next/jsonkit/edge-manifest.json';
import { createEdgeHandler } from '../src/lib/edge/edge-handler';

// Durable Object classes exported by the OpenNext worker (unused by this app's config)
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from '../.open-next/worker.js';

const handle = createEdgeHandler(manifest);

const worker = {
  async fetch(request, env, ctx) {
    return handle(request, env.ASSETS, () => openNextWorker.fetch(request, env, ctx));
  },
};

export default worker;
