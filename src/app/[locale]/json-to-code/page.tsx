import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';
import { JsonToCodeTool } from '@/components/json-to-code/JsonToCodeTool';
import { PopularConversions } from '@/components/json-to-code/PopularConversions';
import { DEFAULT_LANGUAGE } from '@/lib/json/code-generator';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Type', path: '/json-to-code', locale });
}

export default async function JsonToCodePage({ params }: { params: Promise<{ locale: string }> }) {
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
      <JsonToCodeTool
        initialLanguage={DEFAULT_LANGUAGE}
        title={t('title')}
        description={t('description')}
      />
      <PopularConversions locale={locale} />
      <PageSeoContent namespace="Type" locale={locale} />
    </>
  );
}
