'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Mail } from 'lucide-react';

const channels = [
  { key: 'issues', href: 'https://github.com/Ktaewon/jsonkit/issues' },
  { key: 'repo', href: 'https://github.com/Ktaewon/jsonkit' },
] as const;

const tips = ['bug', 'feature', 'privacy'] as const;

export default function ContactPage() {
  const t = useTranslations('Contact');

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <p className="text-muted-foreground text-lg mb-8">{t('intro')}</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {channels.map(({ key, href }) => (
          <div key={key} className="rounded-lg border p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">{t(`channels.${key}.title`)}</h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {t(`channels.${key}.content`)}
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t(`channels.${key}.cta`)}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('tipsTitle')}</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          {tips.map((key) => (
            <li key={key}>{t(`tips.${key}`)}</li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground">{t('responseTime')}</p>
    </div>
  );
}
