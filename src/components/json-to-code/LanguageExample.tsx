import { getTranslations } from 'next-intl/server';
import { generateCode } from '@/app/actions/generate-code';
import { LANGUAGE_EXAMPLES, getLanguageLabel } from '@/lib/json/code-generator';
import type { SupportedLanguage } from '@/lib/json/code-generator';

interface LanguageExampleProps {
  language: SupportedLanguage;
  locale: string;
}

/** Static example rendered at build time: sample JSON and the code quicktype generates from it. */
export async function LanguageExample({ language, locale }: LanguageExampleProps) {
  const t = await getTranslations({ locale, namespace: 'JsonToCodeLanguage' });
  const { json, typeName } = LANGUAGE_EXAMPLES[language];
  const output = await generateCode(json, { language, typeName });
  const label = getLanguageLabel(language);

  return (
    <section className="container py-8 border-t mt-8 max-w-4xl space-y-4">
      <h2 className="text-xl font-semibold">{t('exampleTitle', { language: label })}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-2">{t('exampleInput')}</h3>
          <pre className="rounded-md border bg-muted/30 p-4 text-xs overflow-auto max-h-96">
            <code>{json}</code>
          </pre>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-2">
            {t('exampleOutput', { language: label, typeName })}
          </h3>
          <pre className="rounded-md border bg-muted/30 p-4 text-xs overflow-auto max-h-96">
            <code>{output}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
