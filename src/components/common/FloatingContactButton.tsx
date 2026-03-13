'use client';

import { MessageCircleQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FloatingContactButton() {
  const t = useTranslations('Common');

  return (
    <a
      href="https://github.com/Ktaewon/jsonkit/issues"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('contact')}
      className="fixed bottom-6 left-6 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircleQuestion className="h-5 w-5" />
    </a>
  );
}
