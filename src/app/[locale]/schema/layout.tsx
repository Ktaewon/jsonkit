import { generatePageMetadata } from '@/lib/seo/metadata';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://jsonkit.org';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Schema', path: '/schema', locale });
}

export default async function SchemaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Schema' });
  return (
    <>
      <JsonLd data={getWebApplicationSchema(t('metaTitle'), t('metaDescription'), `${BASE_URL}/${locale}/schema`)} />
      {children}
      <PageSeoContent namespace="Schema" locale={locale} />
    </>
  );
}
