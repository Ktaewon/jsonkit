import { generatePageMetadata } from '@/lib/seo/metadata';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Type', path: '/json-to-code', locale });
}

export default async function JsonToCodeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Type' });

  return (
    <>
      <JsonLd
        data={getWebApplicationSchema(
          t('metaTitle'),
          t('metaDescription'),
          `${BASE_URL}/${locale}/json-to-code`
        )}
      />
      {children}
      <PageSeoContent namespace="Type" locale={locale} />
    </>
  );
}
