import { generatePageMetadata } from '@/lib/seo/metadata';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Convert', path: '/convert', locale });
}

export default async function ConvertLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Convert' });
  return (
    <>
      <JsonLd
        data={getWebApplicationSchema(
          t('metaTitle'),
          t('metaDescription'),
          `${BASE_URL}/${locale}/convert`
        )}
      />
      {children}
    </>
  );
}
