import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/json/code-generator';
import type { SupportedLanguage } from '@/lib/json/code-generator';

interface PopularConversionsProps {
  locale: string;
  /** Language page being viewed; it is left out of the list. */
  current?: SupportedLanguage;
}

export async function PopularConversions({ locale, current }: PopularConversionsProps) {
  const t = await getTranslations({ locale, namespace: 'JsonToCodeLanguage' });
  const languages = SUPPORTED_LANGUAGES.filter(({ value }) => value !== current);

  return (
    <section className="container py-8 border-t mt-8 max-w-4xl">
      <h2 className="text-xl font-semibold mb-3">
        {current ? t('otherConversionsTitle') : t('popularTitle')}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {languages.map(({ value, label }) => (
          <li key={value}>
            <Link
              href={`/json-to-code/${value}`}
              className="block rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {t('linkLabel', { language: label })}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
