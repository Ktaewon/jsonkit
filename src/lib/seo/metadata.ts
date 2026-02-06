import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://jsonkit.org';

const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  ko: 'ko_KR',
  ja: 'ja_JP',
  zh: 'zh_CN',
  ru: 'ru_RU',
};

interface GeneratePageMetadataParams {
  translationNamespace: string;
  path: string;
  locale: string;
}

export async function generatePageMetadata({
  translationNamespace,
  path,
  locale,
}: GeneratePageMetadataParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: translationNamespace });

  const metaTitle = t('metaTitle');
  const metaDescription = t('metaDescription');
  const canonicalPath = path ? `/${locale}${path}` : `/${locale}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const locPath = path ? `/${loc}${path}` : `/${loc}`;
    languages[loc] = `${BASE_URL}${locPath}`;
  }
  languages['x-default'] = `${BASE_URL}${path || '/'}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'JSONKit',
      type: 'website',
      locale: OG_LOCALE_MAP[locale] || 'en_US',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'JSONKit - Online JSON Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}
