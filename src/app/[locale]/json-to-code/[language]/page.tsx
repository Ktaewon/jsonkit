import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';
import { JsonToCodeTool } from '@/components/json-to-code/JsonToCodeTool';
import { LanguageExample } from '@/components/json-to-code/LanguageExample';
import { PopularConversions } from '@/components/json-to-code/PopularConversions';
import { SUPPORTED_LANGUAGES, isSupportedLanguage } from '@/lib/json/code-generator';
import { BASE_URL } from '@/lib/constants';

type Params = Promise<{ locale: string; language: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(({ value }) => ({ language: value }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, language } = await params;
  if (!isSupportedLanguage(language)) return {};
  return generatePageMetadata({
    translationNamespace: `JsonToCodeLanguage.languages.${language}`,
    path: `/json-to-code/${language}`,
    locale,
  });
}

export default async function JsonToCodeLanguagePage({ params }: { params: Params }) {
  const { locale, language } = await params;
  if (!isSupportedLanguage(language)) notFound();

  const namespace = `JsonToCodeLanguage.languages.${language}`;
  const t = await getTranslations({ locale, namespace });

  return (
    <>
      <JsonLd
        data={getWebApplicationSchema(
          t('metaTitle'),
          t('metaDescription'),
          `${BASE_URL}/${locale}/json-to-code/${language}`
        )}
      />
      <JsonToCodeTool
        initialLanguage={language}
        title={t('title')}
        description={t('description')}
      />
      <PageSeoContent namespace={namespace} locale={locale} />
      <LanguageExample language={language} locale={locale} />
      <PopularConversions locale={locale} current={language} />
    </>
  );
}
