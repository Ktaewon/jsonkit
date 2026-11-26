# Cloudflare Workers 배포 가이드 (무료 플랜)

JSONKit은 [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)(1.20.x)로 빌드해서 **Cloudflare Workers 무료 플랜**에 배포합니다.
기존 Docker 배포(`output: 'standalone'` + `Dockerfile`)도 그대로 동작합니다.

## 구조 요약

| 항목                    | 설정                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 어댑터                  | `@opennextjs/cloudflare` (`open-next.config.ts`)                                                                                               |
| Worker 설정             | `wrangler.jsonc` (이름 `jsonkit`, `nodejs_compat`, `global_fetch_strictly_public`)                                                             |
| 페이지 렌더링           | 모든 페이지를 빌드 시 **정적 생성(SSG)**. 요청 시 SSR 없음                                                                                     |
| 캐시                    | `static-assets-incremental-cache`: 미리 렌더링한 HTML/RSC를 Workers Static Assets(`ASSETS` 바인딩)에서 읽기 전용으로 제공. **R2/KV/D1 불필요** |
| Worker 진입점           | `cloudflare/worker.mjs`: 미리 렌더링된 페이지·로케일 리다이렉트·404를 직접 응답하고 나머지만 OpenNext로 넘김 (아래 "Worker 진입점")            |
| 이미지                  | `images.unoptimized: true`. 블로그 이미지는 Vercel Blob URL을 그대로 사용                                                                      |
| JSON → Code (quicktype) | **브라우저에서 실행**(필요할 때 동적 import). 서버 액션 없음                                                                                   |
| 정적 파일 헤더          | `public/_headers` (`/_next/static/*`, `/monaco/*`는 1년 immutable 캐시)                                                                        |

## 배포 방법

```bash
npm ci
npx wrangler login          # 최초 1회, 브라우저에서 Cloudflare 계정 인증
npm run deploy              # npm run build:cf && opennextjs-cloudflare deploy
```

- `npm run build:cf` = `opennextjs-cloudflare build && node scripts/build-edge-manifest.mjs`. **두 번째 단계를 빼먹으면 `cloudflare/worker.mjs`가 import하는 `.open-next/jsonkit/edge-manifest.json`이 없어서 wrangler 번들링이 실패합니다**(조용히 잘못 배포되지 않음).
- `opennextjs-cloudflare build`는 내부적으로 `npm run build`(= `copy-monaco` + `next build`)를 실행합니다. Monaco 복사 단계도 자동으로 포함됩니다.
- 배포가 끝나면 `https://jsonkit.<계정-서브도메인>.workers.dev` 주소가 출력됩니다. 계정 서브도메인은 대시보드 **Workers & Pages → 계정 설정(Subdomain)** 에서 확인하거나 변경할 수 있습니다.
- 그 밖의 스크립트:
  - `npm run preview`: 빌드한 뒤 로컬 workerd(`wrangler dev`)에서 실제 Workers 런타임으로 실행합니다. 기본 주소는 `http://localhost:8787`이고, 포트는 `npm run preview -- --port 8788`처럼 바꿀 수 있습니다.
  - `npm run upload`: 새 **버전만 업로드**하고 트래픽은 넘기지 않습니다(Gradual deployments용). 블로그 이미지 업로드(`node scripts/upload-blog-images.mjs`)와는 다른 명령입니다.
  - `npm run cf-typegen`: `wrangler.jsonc`의 바인딩으로 `cloudflare-env.d.ts`를 다시 생성합니다. 바인딩을 바꿨다면 실행하세요.
- 업로드 없이 번들 크기만 확인하려면: `npm run build:cf && npx wrangler deploy --dry-run`을 실행하고 `Total Upload: … / gzip: …` 줄을 보세요.

### Git 연동(Workers Builds)을 쓰는 경우

대시보드에서 저장소를 연결할 때 Build command는 **`npm run build:cf`**, Deploy command는 `npx opennextjs-cloudflare deploy`로 설정합니다. (이전 설정 `npx opennextjs-cloudflare build`를 쓰고 있다면 바꿔야 합니다.)
아래 `NEXT_PUBLIC_*` 값은 **Build variables**에 넣어야 합니다(런타임 변수에 넣으면 적용되지 않습니다).

## 환경 변수

### 1) 빌드 시 고정되는 값: `NEXT_PUBLIC_*`

`NEXT_PUBLIC_*`는 **`next build` 시점에 번들과 미리 렌더링된 HTML에 그대로 박힙니다.**
모든 페이지가 정적으로 생성되므로 서버 컴포넌트에서 읽는 값도 마찬가지입니다.
따라서 **`wrangler secret put`이나 대시보드의 런타임 변수로는 바뀌지 않으며**, 값을 바꾸면 **다시 빌드하고 배포**해야 합니다.

| 변수                                                       | 용도                           | 프로덕션                                   |
| ---------------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`                                     | canonical URL, sitemap, robots | 실제 도메인 (기본값 `https://jsonkit.org`) |
| `NEXT_PUBLIC_DONATION_URL` / `NEXT_PUBLIC_DONATION_URL_ZH` | 후원 링크                      | 필요하면 설정                              |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`                            | Google Analytics 4             | 필요하면 설정                              |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`                            | AdSense                        | **비워 둠 (프로덕션에서는 끔)**            |

값은 빌드하는 셸의 환경 변수나 `.env.production.local`에 넣습니다.

```bash
# 예: .env.production.local (gitignore 대상)
NEXT_PUBLIC_BASE_URL=https://jsonkit.org
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_DONATION_URL=https://...
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=
```

> ⚠️ `next build`는 **`.env.local`도 읽습니다.** 로컬 `.env.local`에 AdSense ID가 있으면 프로덕션 빌드에 들어갑니다.
> 배포 전에 `.env.local`에서 지우거나, 위처럼 `.env.production.local`에 빈 값으로 덮어쓰세요.
> 빌드 후 `grep -rl pagead2 .open-next/assets/cdn-cgi | head`의 결과가 비어 있으면 AdSense가 꺼진 것입니다.

### 2) 런타임 시크릿: `wrangler secret put`

**현재 Worker에 필요한 런타임 시크릿은 없습니다.**

- `BLOB_READ_WRITE_TOKEN`은 로컬에서 실행하는 블로그 이미지 업로드 스크립트(`scripts/upload-blog-images.mjs`, `.env.local`을 읽음)에서만 씁니다. **Cloudflare에 올리지 마세요.**
- 나중에 서버 코드(Route Handler 등)가 시크릿을 런타임에 읽어야 한다면:
  ```bash
  npx wrangler secret put MY_SECRET   # 프로덕션
  echo "MY_SECRET=..." >> .dev.vars    # 로컬 preview용 (gitignore 대상)
  ```
  런타임 값은 `process.env.MY_SECRET` 또는 `getCloudflareContext().env.MY_SECRET`로 읽습니다.
  이 값은 SSG 페이지에는 반영되지 않고, 요청 시 실행되는 코드에서만 보입니다.

## 커스텀 도메인 연결 (나중에)

도메인이 Cloudflare DNS 존에 있어야 합니다(네임서버를 Cloudflare로 옮긴 상태).

1. **Workers Custom Domains (권장)**: 대시보드 **Workers & Pages → jsonkit → Settings → Domains & Routes → Add → Custom domain** 에서 `jsonkit.org`, `www.jsonkit.org`를 추가합니다. DNS 레코드와 인증서는 자동으로 만들어집니다.
   또는 `wrangler.jsonc`에 다음을 추가하고 `npm run deploy`를 실행합니다.
   ```jsonc
   "routes": [
     { "pattern": "jsonkit.org", "custom_domain": true },
     { "pattern": "www.jsonkit.org", "custom_domain": true }
   ]
   ```
2. **Routes**: 이미 프록시(주황 구름) 레코드가 있는 존이라면 `"routes": [{ "pattern": "jsonkit.org/*", "zone_name": "jsonkit.org" }]`처럼 라우트로 연결할 수도 있습니다.
3. 도메인을 바꿨다면 `NEXT_PUBLIC_BASE_URL`을 맞추고 **다시 빌드해서 배포**합니다. 이 값은 sitemap과 canonical에 들어갑니다.
4. `workers.dev` 주소를 닫으려면 `wrangler.jsonc`에 `"workers_dev": false`를 추가합니다.
5. Vercel에서 옮기는 경우: Vercel 쪽 도메인 연결을 해제한 뒤 DNS를 전환하세요.

## 무료 플랜 한도와 현재 상태

| 한도 (Workers Free) | 값                                | JSONKit 현재 상태                                                                                  |
| ------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| 요청당 CPU 시간     | **10 ms**                         | 페이지는 정적 캐시에서 제공. quicktype는 브라우저에서 실행                                         |
| Worker 크기         | **3 MiB (gzip)**                  | `wrangler deploy --dry-run` 기준 **10,201.34 KiB / gzip 2,028.89 KiB**                             |
| 요청 수             | **100,000 / 일** (UTC 0시 초기화) | 정적 파일(`/_next/static`, `/monaco` 등)은 Worker를 거치지 않으므로 집계되지 않음                  |
| Static Assets       | 파일 20,000개, 파일당 25 MiB      | 약 1,300개(`/cdn-cgi/_jk` 본문 약 880개 + 캐시 216개 포함), 최대 파일 6.8 MiB (Monaco `ts.worker`) |
| 메모리              | 128 MB / isolate                  | —                                                                                                  |

하루 10만 요청을 넘으면 Worker 요청은 에러(1027)를 반환하므로, 트래픽이 늘면 Workers Paid($5/월)를 검토하세요.
페이지 HTML 요청과 next-intl 리다이렉트는 Worker 요청으로 집계됩니다.

## quicktype(JSON → Code) 결정

**결론: quicktype를 브라우저로 옮기고 서버 액션(`src/app/actions/generate-code.ts`)은 삭제했습니다.**

측정 방법: `node scripts/measure-quicktype.mjs` (Node 24, 이 저장소의 quicktype-core 23.2.6, `process.cpuUsage()` 기준)

| 입력 → 언어                         | 첫 호출(cold) CPU                     | 반복(warm) 평균 CPU |
| ----------------------------------- | ------------------------------------- | ------------------- |
| small → TypeScript                  | **129.15 ms** (모듈 첫 실행/JIT 포함) | 2.44 ms             |
| small → Go                          | 3.54 ms                               | 2.21 ms             |
| small → Rust                        | 2.35 ms                               | 1.93 ms             |
| medium(객체 20개 배열) → TypeScript | 5.10 ms                               | 3.37 ms             |
| medium → Go                         | 2.32 ms                               | 3.40 ms             |
| medium → Java                       | 6.35 ms                               | 4.74 ms             |

- warm 상태에서도 2–5 ms를 쓰는데, **cold isolate의 첫 호출은 129 ms**입니다. 게다가 **입력 크기를 사용자가 정하므로** 큰 JSON을 붙여넣으면 10 ms를 쉽게 넘습니다.
- quicktype-core는 서버 번들에 약 1.6 MiB씩 들어가서, 3 MiB gzip 한도도 위협합니다(옮기기 전 dry-run은 gzip 3,661 KiB로 **한도 초과**).
- 지금은 `JsonToCodeTool`이 `await import('@/lib/json/quicktype')`로 **처음 사용할 때만** quicktype 청크(약 1.3 MiB, immutable 캐시)를 내려받습니다. 첫 화면 JS에는 포함되지 않습니다.
- `/json-to-code/<language>` 페이지의 예제 출력은 미리 생성한 `src/lib/json/language-examples.generated.json`에서 읽습니다. quicktype를 올린 뒤 결과가 달라지면 테스트가 실패하며, 다음 명령으로 다시 생성합니다.
  `UPDATE_LANGUAGE_EXAMPLES=1 npx vitest run language-examples`
- `next.config.ts`의 `turbopack.resolveAlias`가 `quicktype-core`와 `elkjs`를 브라우저 빌드가 아닌 곳에서는 스텁(`src/lib/browser-only-stub.ts`)으로 바꿉니다. 둘 다 클라이언트 effect에서만 lazy-load하는데도 SSR 번들에 들어가 Worker를 약 3 MiB 키우기 때문입니다.
  또한 브라우저 빌드에서는 `node:fs`를 빈 모듈로 바꿉니다. quicktype-core의 `NodeIO`가 `node:fs`를 import하지만, 우리가 쓰는 경로에서는 실행되지 않습니다.

## Worker 진입점과 CPU

측정·결정 과정은 PR(perf/workers-cpu) 설명을 참고하세요. 요약:

- **`cloudflare/worker.mjs`** (wrangler `main`)가 OpenNext worker 앞에서 요청을 받습니다. 로직은 `src/lib/edge/`에 있습니다.
  - `GET`/`HEAD`이고 빌드 시 알 수 있는 응답이면 직접 응답합니다: 로케일 리다이렉트(307), 미리 렌더링된 HTML·RSC·prefetch segment·`robots.txt`/`sitemap.xml`, 그리고 **알 수 없는 경로는 미리 렌더링된 404 페이지**.
  - 본문은 `scripts/build-edge-manifest.mjs`가 `.open-next/cache`(OpenNext가 쓰던 바로 그 캐시 엔트리)에서 뽑아 `/cdn-cgi/_jk/<buildId>/`에 정적 파일로 둡니다. 응답 헤더·ETag는 OpenNext cache interception이 만들던 것과 같습니다. 캐시 엔트리를 `JSON.parse`하거나 md5를 계산하지 않고 ASSETS 응답을 그대로 스트리밍합니다.
  - 로케일 처리(`src/lib/edge/locale-routing.ts`)는 next-intl 미들웨어를 그대로 옮긴 것입니다(같은 `negotiator` + `@formatjs/intl-localematcher`, `NEXT_LOCALE` 쿠키 동기화, `Link` hreflang 헤더). 테스트가 두 구현을 같은 요청 조합으로 돌려 결과가 같은지 확인합니다. `src/i18n/routing.ts`에 지원하지 않는 옵션(domains, pathnames, localePrefix 변경 등)을 넣으면 Worker가 시작 시 에러를 냅니다.
  - 그 밖의 요청(POST 등, `/_next/*`, preview 쿠키, server action, 알 수 없는 segment, Next가 308로 정규화하는 URL(끝 슬래시, `//`), 퍼센트 인코딩이 섞인 미지 경로)은 기존처럼 OpenNext → `proxy.ts` → Next로 갑니다. Docker/`next start`/`next dev`는 이 진입점을 쓰지 않으므로 기존 `proxy.ts`(next-intl) 동작 그대로입니다.
- **번역 메시지**: `NextIntlClientProvider`에는 클라이언트 컴포넌트가 쓰는 네임스페이스만 넘깁니다(`src/i18n/client-messages.ts`; `Metadata`, `Blog`, `ConvertPair`, `JsonToCodeLanguage`, 각 네임스페이스의 `seoContent` 제외). 페이지당 캐시 엔트리가 평균 473 KB → 210 KB로 줄었습니다. 클라이언트 컴포넌트에서 이 네임스페이스/키를 쓰려면 목록에서 빼야 하며, 테스트가 이를 검사합니다.
- **빌드 가드**: `build-edge-manifest.mjs`는 요청 시 렌더링되는 페이지(SSG가 아닌 라우트, `dynamicParams` 미설정 동적 라우트, `revalidate`)나 next.config의 rewrites/redirects가 생기면 빌드를 실패시킵니다. Worker가 그런 경로를 404로 응답하게 되기 때문입니다. 그런 기능이 필요해지면 `src/lib/edge/edge-handler.ts`를 함께 고쳐야 합니다.
- 무료 플랜은 CPU 한도를 넘은 요청을 에러(1102)로 끝냅니다. 배포 후 대시보드 **Workers → jsonkit → Metrics/Observability**(`observability.enabled: true`)에서 CPU time 분포를 확인하세요.

## 기타 참고

- `@opennextjs/aws` 4.2.0의 미들웨어 변환기가 `import cookieParser from "cookie"`를 쓰는데, cookie 1.x에는 default export가 없습니다. 그래서 **쿠키가 있는 요청(예: `NEXT_LOCALE`)이 전부 500**이 납니다. `package.json`의 `overrides`로 이 패키지 안에서만 `cookie@0.7.2`를 쓰도록 고정했습니다. opennext를 올릴 때 수정됐는지 확인하고 override를 제거하세요.
- 미리 렌더링된 페이지는 `opennextjs-cloudflare deploy/preview/upload` 단계의 populate-cache에서 `.open-next/assets/cdn-cgi/_next_cache`로 복사됩니다. `build` 직후의 assets 디렉터리에는 아직 없습니다.
- `initOpenNextCloudflareForDev()`는 `next dev`에서만 호출합니다(`next.config.ts`). 지금은 바인딩을 쓰지 않으므로 사실상 no-op입니다.
- Vercel Analytics와 Speed Insights는 제거했습니다. 방문 분석은 GA4(`NEXT_PUBLIC_GA_MEASUREMENT_ID`)나 Cloudflare Web Analytics(대시보드에서 켜기)를 쓰세요.
