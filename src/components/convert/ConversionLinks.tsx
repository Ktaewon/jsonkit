import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CONVERSION_PAIRS, getPairLabels } from '@/lib/json/converter';
import type { ConversionPair } from '@/lib/json/converter';

interface ConversionLinksProps {
  locale: string;
  /** Pair page being viewed; it is left out of the list. */
  current?: ConversionPair;
}

export async function ConversionLinks({ locale, current }: ConversionLinksProps) {
  const t = await getTranslations({ locale, namespace: 'ConvertPair' });
  const pairs = CONVERSION_PAIRS.filter(({ value }) => value !== current);

  return (
    <section className="container py-8 border-t mt-8 max-w-4xl">
      <h2 className="text-xl font-semibold mb-3">
        {current ? t('otherConversionsTitle') : t('popularTitle')}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pairs.map(({ value }) => (
          <li key={value}>
            <Link
              href={`/convert/${value}`}
              className="block rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {t('linkLabel', getPairLabels(value))}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
