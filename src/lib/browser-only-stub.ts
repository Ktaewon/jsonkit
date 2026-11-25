// Stand-in for browser-only libraries (quicktype-core, elkjs) in the server bundles.
// next.config.ts aliases them to this file for every non-browser build, because they are
// only used lazily from client effects and would otherwise add ~3 MiB to the Cloudflare
// Worker (free plan limit: 3 MiB gzip). Reaching this on the server is a bug.
function browserOnly(): never {
  throw new Error('This library is browser-only and is not bundled for the server.');
}

export default browserOnly;
export const quicktype = browserOnly;
export const InputData = browserOnly;
export const jsonInputForTargetLanguage = browserOnly;
