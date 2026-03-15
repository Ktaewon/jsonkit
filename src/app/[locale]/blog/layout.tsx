import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/common/JsonLd';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    translationNamespace: 'Blog',
    path: '/blog',
    locale,
  });
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'JSONKit Blog',
    url: `${BASE_URL}/${locale}/blog`,
    description: t('metaDescription'),
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      {children}
    </>
  );
}
