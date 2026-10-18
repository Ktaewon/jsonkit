import { getTranslations } from 'next-intl/server';
import {
  CONVERSION_EXAMPLES,
  convert,
  getPairLabels,
  parseConversionPair,
} from '@/lib/json/converter';
import type { ConversionPair } from '@/lib/json/converter';

interface ConversionExampleProps {
  pair: ConversionPair;
  locale: string;
}

/** Static example rendered at build time: sample input and the output the converter produces. */
export async function ConversionExample({ pair, locale }: ConversionExampleProps) {
  const t = await getTranslations({ locale, namespace: 'ConvertPair' });
  const { format, direction } = parseConversionPair(pair);
  const input = CONVERSION_EXAMPLES[pair];
  const { result } = convert(input, format, direction);
  const { from, to } = getPairLabels(pair);

  return (
    <section className="container py-8 border-t mt-8 max-w-4xl space-y-4">
      <h2 className="text-xl font-semibold">{t('exampleTitle', { from, to })}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-2">{t('exampleInput', { format: from })}</h3>
          <pre className="rounded-md border bg-muted/30 p-4 text-xs overflow-auto max-h-96">
            <code>{input}</code>
          </pre>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-2">{t('exampleOutput', { format: to })}</h3>
          <pre className="rounded-md border bg-muted/30 p-4 text-xs overflow-auto max-h-96">
            <code>{result}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
