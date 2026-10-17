'use client';

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { TOOLS } from '@/lib/tools';

// Sections rendered after the tool list; `mission` is rendered above it.
const sections = ['privacy', 'maintainer', 'openSource', 'funding'] as const;

export default function AboutPage() {
  const t = useTranslations('About');
  const tRoot = useTranslations();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <p className="text-muted-foreground text-lg mb-8">{t('intro')}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('sections.mission.title')}</h2>
        <p className="text-muted-foreground">{t('sections.mission.content')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('toolsTitle')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map(({ href, namespace }) => (
            <li key={href} className="rounded-lg border p-4">
              <Link href={href} className="font-medium underline underline-offset-4">
                {tRoot(`${namespace}.title`)}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {tRoot(`${namespace}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {sections.map((key) => (
        <section key={key} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t(`sections.${key}.title`)}</h2>
          <p className="text-muted-foreground">{t(`sections.${key}.content`)}</p>
        </section>
      ))}

      <p className="text-muted-foreground">
        {t('contactPrompt')}{' '}
        <Link href="/contact" className="font-medium underline underline-offset-4">
          {t('contactLink')}
        </Link>
      </p>
    </div>
  );
}
