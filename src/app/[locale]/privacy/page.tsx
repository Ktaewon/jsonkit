'use client';

import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';

interface Section {
  key: string;
  listItems?: string[];
}

const sections: Section[] = [
  { key: 'dataCollection' },
  { key: 'localStorage' },
  { key: 'cookies', listItems: ['googleAdsense', 'googleAnalytics'] },
  { key: 'thirdParty' },
  { key: 'contact' },
];

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-lg mb-8">
          {t('lastUpdated')}: {t('lastUpdatedDate')}
        </p>

        {sections.map(({ key, listItems }) => (
          <section key={key} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t(`sections.${key}.title`)}</h2>
            <p className={`text-muted-foreground ${listItems ? 'mb-4' : ''}`}>
              {t(`sections.${key}.content`)}
            </p>
            {listItems && (
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                {listItems.map((item) => (
                  <li key={item}>{t(`sections.${key}.${item}`)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
