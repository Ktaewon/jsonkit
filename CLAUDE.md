# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (Next.js on localhost:3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint 9 flat config)
- **Format**: `npm run format` (Prettier), `npm run format:check`
- **Type check**: `npx tsc --noEmit`
- **Tests**: `npm test` (Vitest), `npm run test:watch`, `npm run test:coverage`
- **Run a single test**: `npx vitest run src/lib/json/__tests__/beautify.test.ts`

CI runs lint, format:check, typecheck, test, then build (build depends on lint+test passing).

## Architecture

**JSONKit** is a Next.js 16 App Router application — an all-in-one client-side JSON utility toolkit deployed on Vercel.

### Routing & i18n

- All pages live under `src/app/[locale]/` — the `[locale]` dynamic segment is handled by **next-intl**.
- Supported locales: `en`, `ko`, `ja`, `zh`, `ru` (configured in `src/i18n/routing.ts`).
- `src/middleware.ts` handles locale detection/redirect via next-intl middleware.
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
- **quicktype-core** — JSON-to-code generation, invoked via a server action (`src/app/actions/generate-code.ts`).
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

- `output: 'standalone'` in next.config.ts for Docker/Vercel deployment.
- Dockerfile included for containerized builds.
- Vercel Analytics and Speed Insights are integrated in the root layout.
