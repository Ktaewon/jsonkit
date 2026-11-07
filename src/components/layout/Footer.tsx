'use client';

import { Link } from '@/i18n/navigation';
import { getDonationUrl } from '@/lib/donation';
import { Coffee } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');
  const donationUrl = getDonationUrl(useLocale());

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{' '}
            <a
              href="https://github.com/Ktaewon"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              JSONKit Team
            </a>
            . The source code is available on{' '}
            <a
              href="https://github.com/Ktaewon/jsonkit"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {donationUrl && (
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={t('supportDescription')}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
              {t('support')}
            </a>
          )}
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {t('about')}
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {t('contact')}
          </Link>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {t('blog')}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {t('privacyPolicy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
