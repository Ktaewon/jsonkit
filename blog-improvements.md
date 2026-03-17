# JSONKit 블로그 개선 사항

## HIGH PRIORITY

### 1. 55개 MDX 정적 import로 인한 번들 크기 문제

**파일:** `src/app/[locale]/blog/[slug]/content.tsx`

**현상:** 모든 55개(5 locale × 11 posts) MDX 파일을 최상위에서 정적 import하여, 블로그 포스트 하나를 방문할 때도 전체가 번들에 포함됨.

**해결 방안:**

서버 컴포넌트에서 동적 import로 전환. 단, 이전에 동적 import 시도 시 `react-hooks/static-components` 린트 룰과 충돌한 이력이 있어 주의 필요.

```tsx
// content.tsx
export async function BlogPostContent({ slug, locale }: { slug: string; locale: string }) {
  const Component = (await import(`@/content/blog/${locale}/${slug}.mdx`)).default;
  if (!Component) return null;
  return <Component />;
}
```

- `BlogPostContent`를 async 서버 컴포넌트로 만들면 린트 룰을 우회 가능
- Turbopack에서 동적 import 경로가 정상 동작하는지 테스트 필수
- 실패 시 현재 방식(정적 import + contentMap) 유지하되, Next.js의 tree-shaking이 미사용 컴포넌트를 제거하는지 빌드 분석으로 확인

---

### 2. `generateStaticParams` 누락 (SSG 미적용)

**파일:** `src/app/[locale]/blog/[slug]/page.tsx`

**현상:** `[slug]` 세그먼트에 `generateStaticParams`가 없어, 모든 블로그 포스트가 런타임에 서버 사이드 렌더링됨. 이전에 `getTranslations`와 충돌(`DYNAMIC_SERVER_USAGE` 에러)로 제거한 이력 있음.

**해결 방안:**

`page.tsx`가 아닌 `layout.tsx`에서 `getTranslations`를 사용하고 있으므로, `page.tsx`에만 `generateStaticParams`를 추가하면 충돌 없이 동작할 가능성 있음.

```tsx
// page.tsx에 추가
import { getAllPosts } from '@/lib/blog/posts';

export async function generateStaticParams() {
  return getAllPosts().flatMap((post) =>
    post.locales.map((locale) => ({ locale, slug: post.slug }))
  );
}
```

- layout.tsx의 `getTranslations`가 여전히 충돌을 일으키면, `dynamicParams = true` 설정으로 빌드 시점에는 정적 생성하되 새 slug에 대해서는 런타임 렌더링 허용
- 테스트: `npm run build` 후 라우트 목록에서 `○` (Static)으로 표시되는지 확인

---

### 3. ~~Article 스키마에 `image` 필드 누락~~ ✅ 완료

**파일:** `src/lib/seo/structured-data.ts`

**현상:** Google의 Article 구조화 데이터 가이드라인에서 `image`는 필수 필드. 누락 시 Google Search Console에서 경고 발생.

**해결 방안:**

```ts
// getArticleSchema 반환 객체에 추가
image: `${BASE_URL}/icon.png`, // 또는 전용 OG 이미지
```

- 향후 포스트별 커버 이미지를 지원하려면 `posts.ts`의 `BlogPost` 인터페이스에 `image?: string` 필드 추가
- 당장은 사이트 기본 아이콘/로고로 대체 가능

---

### 4. 블로그 목록 페이지에서 `useTranslations` 사용

**파일:** `src/app/[locale]/blog/page.tsx`

**현상:** `'use client'` 지시자 없이 `useTranslations` (클라이언트 훅) 사용. next-intl이 서버에서도 지원하지만, 공식 권장은 서버 컴포넌트에서 `getTranslations` 사용.

**해결 방안:**

```tsx
// 변경 전
import { useTranslations } from 'next-intl';
const t = useTranslations('Blog');

// 변경 후
import { getTranslations } from 'next-intl/server';
export default async function BlogPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  // ...
}
```

---

## MEDIUM PRIORITY

### 5. Header/MobileNav Blog 링크 미번역

**파일:** `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`

**현상:** Blog 링크 텍스트가 `"Blog"`로 하드코딩. 다른 메뉴는 모두 `t('...')`으로 번역됨.

**해결 방안:**

Navigation 번역 파일에 `"blog": "Blog"` 키 추가 후 `t('blog')` 사용. 5개 locale 메시지 파일 모두 수정 필요.

```tsx
// Header.tsx / MobileNav.tsx
{
  t('blog');
}
```

```json
// messages/ko.json → Navigation
"blog": "블로그"
// messages/ja.json → Navigation
"blog": "ブログ"
// messages/zh.json → Navigation
"blog": "博客"
// messages/ru.json → Navigation
"blog": "Блог"
// messages/en.json → Navigation
"blog": "Blog"
```

---

### 6. TableOfContents 접근성 및 다국어

**파일:** `src/components/blog/TableOfContents.tsx`

**현상:**

- `<nav>`에 `aria-label` 없음
- 활성 항목에 `aria-current` 없음
- "On this page" 텍스트 하드코딩 (미번역)

**해결 방안:**

```tsx
<nav aria-label="Table of contents" className="...">
  <p className="...">{t('tableOfContents')}</p>
  {items.map((item) => (
    <button
      aria-current={activeId === item.id ? 'true' : undefined}
      // ...
    />
  ))}
</nav>
```

- 클라이언트 컴포넌트이므로 `useTranslations` 사용
- 5개 locale 메시지 파일의 `Blog` 네임스페이스에 `"tableOfContents"` 키 추가

---

### 7. 날짜 표시가 ISO 형식 그대로

**파일:** `src/app/[locale]/blog/page.tsx`

**현상:** `2025-03-14` 형식으로 그대로 노출. locale별 자연스러운 날짜 포맷 필요.

**해결 방안:**

```tsx
// 날짜 포맷 유틸리티 (인라인 또는 별도 함수)
const formattedDate = new Date(post.date).toLocaleDateString(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// 출력 예시:
// ko: 2025년 3월 14일
// en: March 14, 2025
// ja: 2025年3月14日
// zh: 2025年3月14日
// ru: 14 марта 2025 г.
```

---

### 8. sitemap `lastModified`가 항상 오늘 날짜

**파일:** `src/app/sitemap.ts`

**현상:** 도구 페이지들의 `lastModified`가 `new Date()`로 매 빌드마다 갱신. 실제 변경 없는 페이지도 "오늘 수정됨"으로 표시되어 검색 크롤러의 재크롤링 효율 저하.

**해결 방안:**

도구 페이지는 고정된 날짜 또는 마지막 실제 배포 날짜를 사용:

```ts
// 도구 페이지
const TOOLS_LAST_MODIFIED = '2025-03-15';

toolPaths.map((path) => ({
  url: `${BASE_URL}/${locale}${path}`,
  lastModified: TOOLS_LAST_MODIFIED,
  // ...
}));

// 블로그 포스트 — 이미 post.date 사용 중 (정상)
```

---

## LOW PRIORITY

### 9. Blog 스키마에 `inLanguage` 누락

**파일:** `src/app/[locale]/blog/layout.tsx`

**현상:** 다국어 블로그임을 검색엔진에 명시하지 못함.

**해결 방안:**

```ts
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'JSONKit Blog',
  url: `${BASE_URL}/${locale}/blog`,
  description: t('metaDescription'),
  inLanguage: locale,
};
```

---

### 10. MobileNav copyright 연도 하드코딩

**파일:** `src/components/layout/MobileNav.tsx`

**현상:** `© 2024 JSONKit`으로 하드코딩. 현재 2026년.

**해결 방안:**

```tsx
<p>© {new Date().getFullYear()} JSONKit</p>
```

---

### 11. `readingTime` / `tags` 필드 부재

**파일:** `src/lib/blog/posts.ts`

**현상:** `BlogPost` 인터페이스에 예상 읽기 시간이나 태그 정보 없음. 블로그 목록 UX 개선 시 유용.

**해결 방안:**

```ts
export interface BlogPost {
  slug: string;
  locales: string[];
  date: string;
  relatedTool: string;
  relatedToolPath: string;
  readingTime?: number; // 분 단위
  tags?: string[]; // e.g. ['beginner', 'json-syntax']
}
```

- 목록 페이지 카드에 "3분 읽기" 배지 표시
- 태그별 필터링 기능 추가 가능

---

## 작업 우선순위 권장

| 순서 | 항목                                 | 난이도 | 비고                         |
| ---- | ------------------------------------ | ------ | ---------------------------- |
| 1    | #3 Article 스키마 image 추가         | 낮음   | 즉시 가능, SEO 필수          |
| 2    | #4 useTranslations → getTranslations | 낮음   | 즉시 가능                    |
| 3    | #5 Blog 링크 번역                    | 낮음   | 즉시 가능                    |
| 4    | #7 날짜 포맷 개선                    | 낮음   | 즉시 가능                    |
| 5    | #9 Blog 스키마 inLanguage            | 낮음   | 즉시 가능                    |
| 6    | #10 copyright 연도                   | 낮음   | 즉시 가능                    |
| 7    | #8 sitemap lastModified              | 낮음   | 즉시 가능                    |
| 8    | #6 TableOfContents 접근성/번역       | 중간   | 번역 키 추가 필요            |
| 9    | #2 generateStaticParams 복구         | 중간   | 이전 충돌 이력 주의          |
| 10   | #1 동적 import 전환                  | 높음   | Turbopack 호환성 테스트 필요 |
| 11   | #11 readingTime/tags                 | 중간   | 데이터 입력 + UI 작업        |
