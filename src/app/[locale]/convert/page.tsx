import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';
import { ConverterTool } from '@/components/convert/ConverterTool';
import { ConversionLinks } from '@/components/convert/ConversionLinks';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Convert', path: '/convert', locale });
}

export default async function ConvertPage({ params }: { params: Promise<{ locale: string }> }) {
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
      <ConverterTool
        initialFormat="yaml"
        initialDirection="json-to-format"
        title={t('title')}
        description={t('description')}
      />
      <ConversionLinks locale={locale} />
      <PageSeoContent namespace="Convert" locale={locale} />
    </>
  );
}
