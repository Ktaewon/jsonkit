'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

// Shown instead of Next's bare default page when a tool page throws while rendering
// (e.g. an editor that failed to load). Header and footer stay, since the locale layout
// still renders around this boundary.
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-bold">{t('errorPageTitle')}</h1>
      <p className="max-w-md text-muted-foreground">{t('errorPageMessage')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" /> {t('retry')}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{t('goHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
