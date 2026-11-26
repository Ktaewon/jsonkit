# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (Next.js on localhost:3000)
- **Build**: `npm run build`
- **Cloudflare**: `npm run build:cf` (opennext build + `scripts/build-edge-manifest.mjs`), `npm run preview` (build:cf + run in local workerd), `npm run deploy`; see DEPLOY_CLOUDFLARE.md
- **Lint**: `npm run lint` (ESLint 9 flat config)
- **Format**: `npm run format` (Prettier), `npm run format:check`
- **Type check**: `npx tsc --noEmit`
- **Tests**: `npm test` (Vitest), `npm run test:watch`, `npm run test:coverage`
- **Run a single test**: `npx vitest run src/lib/json/__tests__/beautify.test.ts`

CI runs lint, format:check, typecheck, test, then build (build depends on lint+test passing).

## Architecture

**JSONKit** is a Next.js 16 App Router application — an all-in-one client-side JSON utility toolkit deployed on Cloudflare Workers (free plan) via `@opennextjs/cloudflare`.

### Routing & i18n

- All pages live under `src/app/[locale]/` — the `[locale]` dynamic segment is handled by **next-intl**.
- Supported locales: `en`, `ko`, `ja`, `zh`, `ru` (configured in `src/i18n/routing.ts`).
- `src/proxy.ts` (Next 16 `proxy` convention, formerly middleware) handles locale detection/redirect via next-intl.
- Every page is statically generated: server pages/layouts call `setRequestLocale(locale)` and dynamic segments define `generateStaticParams` with `dynamicParams = false`. Keep it that way: a dynamic route costs Worker CPU on every request (10 ms limit on the free plan).
- Translation files are `src/messages/<locale>.json` (loaded in `src/i18n/request.ts`); use `useTranslations()` client-side and `getTranslations()` server-side. Any new UI string or SEO key must be added to all five locale files.
- Navigation links should use `Link` from `@/i18n/navigation`, not `next/link` directly.

### Tool pages pattern

Each JSON tool (beautify, validate, viewer, compare, convert, query, escape, repair, schema, graph, json-to-code) follows the same structure:

- `src/app/[locale]/<tool>/layout.tsx` — server component generating SEO metadata + JSON-LD structured data via `generatePageMetadata()` and `PageSeoContent`.
- `src/app/[locale]/<tool>/page.tsx` — client component (`'use client'`) with the tool's UI.

### Core JSON utilities

Pure logic lives in `src/lib/json/` — one file per tool (beautify, validate, converter, escape, query, repair, schema, code-generator, graph-layout). Tests are in `src/lib/json/__tests__/`.

### Key libraries

- **Monaco Editor** (`@monaco-editor/react`) — JSON editing. Editor components are in `src/components/editor/` with dynamic imports (`DynamicJsonEditor`, `DynamicJsonDiffEditor`).
- **@xyflow/react + elkjs** — graph visualization with ELK automatic layout (`src/lib/json/graph-layout.ts`).
- **quicktype-core** — JSON-to-code generation in the browser (`src/lib/json/quicktype.ts`, lazily imported by `JsonToCodeTool`). There is no server action. The `/json-to-code/<language>` example output is precomputed in `src/lib/json/language-examples.generated.json` (regenerate: `UPDATE_LANGUAGE_EXAMPLES=1 npx vitest run language-examples`).
- quicktype-core and elkjs are browser-only: `next.config.ts` aliases them to a stub outside the browser build so they stay out of the 3 MiB Worker bundle. Don't import them from server code.
- **ajv + ajv-formats** — JSON Schema validation.
- **jsonpath-plus** — JSONPath query execution.
- **jsonrepair** — malformed JSON repair.
- **jsonlint-mod** — strict JSON validation with error positions.

### Blog system

Blog posts are MDX files in `src/content/blog/<locale>/<slug>.mdx`. Post metadata is managed in `src/lib/blog/posts.ts` (not frontmatter). Blog images are hosted on Vercel Blob storage.

`scripts/upload-blog-images.mjs` uploads PNGs from `public/images/blog/` to Vercel Blob (reads `.env.local`).

### Ads

- `src/lib/ads/config.ts` decides which ad network loads. Carbon Ads (`CarbonAd.tsx`) and Google AdSense (`GoogleAdsense.tsx`) must never load on the same page (Carbon publisher terms): when Carbon is configured (`NEXT_PUBLIC_CARBONADS_ENABLED=true` + `SERVE` + `PLACEMENT`), AdSense is disabled. Always gate AdSense via `getGoogleAdsensePublisherId()` / `shouldLoadGoogleAdsense()` rather than reading the env var directly.
- All env vars are optional for local dev; see `.env.example` (copy to `.env.local`). `NEXT_PUBLIC_BASE_URL` drives SEO URLs, sitemap, and robots.

### UI & Styling

- Tailwind CSS 3 with `cn()` utility (`src/lib/utils.ts`) combining clsx + tailwind-merge.
- Shadcn UI pattern — components in `src/components/ui/`.
- Dark mode via `next-themes` ThemeProvider.

### SEO

- `src/lib/seo/metadata.ts` — `generatePageMetadata()` builds Next.js Metadata from translation keys.
- `src/lib/seo/structured-data.ts` — JSON-LD schema generators (WebApplication, Website, Organization).
- Each tool layout injects structured data and an SEO content section.

### Deployment

- Cloudflare Workers via `@opennextjs/cloudflare`: `wrangler.jsonc`, `open-next.config.ts` (static-assets incremental cache, no ISR). Full guide, env vars and free-plan limits: DEPLOY_CLOUDFLARE.md.
- The Worker entry is `cloudflare/worker.mjs` (logic in `src/lib/edge/`): it serves prerendered pages, locale redirects (a port of next-intl's middleware, tested for parity against it) and the prerendered 404 straight from build output, and only hands other requests to OpenNext. Consequences: every route must stay SSG (the build fails otherwise), next.config rewrites/redirects are not supported on Cloudflare without updating `edge-handler.ts`, and `src/proxy.ts` only runs on Cloudflare for requests the entry passes through.
- `NextIntlClientProvider` gets only client-needed messages (`src/i18n/client-messages.ts`); add a namespace there before reading it from a client component.
- `NEXT_PUBLIC_*` values are inlined at build time (pages are prerendered); changing them requires a rebuild + deploy.
- `images.unoptimized: true` (Workers has no Next image optimizer). `public/_headers` sets cache headers for static assets on Cloudflare.
- `output: 'standalone'` + Dockerfile still work for containerized builds.
