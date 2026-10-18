import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebApplicationSchema } from '@/lib/seo/structured-data';
import { PageSeoContent } from '@/components/common/PageSeoContent';
import { ConverterTool } from '@/components/convert/ConverterTool';
import { ConversionExample } from '@/components/convert/ConversionExample';
import { ConversionLinks } from '@/components/convert/ConversionLinks';
import { CONVERSION_PAIRS, isConversionPair, parseConversionPair } from '@/lib/json/converter';
import { BASE_URL } from '@/lib/constants';

type Params = Promise<{ locale: string; pair: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return CONVERSION_PAIRS.map(({ value }) => ({ pair: value }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, pair } = await params;
  if (!isConversionPair(pair)) return {};
  return generatePageMetadata({
    translationNamespace: `ConvertPair.pairs.${pair}`,
    path: `/convert/${pair}`,
    locale,
  });
}

export default async function ConvertPairPage({ params }: { params: Params }) {
  const { locale, pair } = await params;
  if (!isConversionPair(pair)) notFound();

  const namespace = `ConvertPair.pairs.${pair}`;
  const t = await getTranslations({ locale, namespace });
  const { format, direction } = parseConversionPair(pair);

  return (
    <>
      <JsonLd
        data={getWebApplicationSchema(
          t('metaTitle'),
          t('metaDescription'),
          `${BASE_URL}/${locale}/convert/${pair}`
        )}
      />
      <ConverterTool
        key={pair}
        initialFormat={format}
        initialDirection={direction}
        title={t('title')}
        description={t('description')}
      />
      <PageSeoContent namespace={namespace} locale={locale} />
      <ConversionExample pair={pair} locale={locale} />
      <ConversionLinks locale={locale} current={pair} />
    </>
  );
}
