'use client';

import { useState } from 'react';
import { MessageCircleQuestion, X, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FloatingContactButton() {
  const t = useTranslations('Common');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-[56] w-72 rounded-lg border bg-background p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{t('contact')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('contactDescription')}
          </p>
          <a
            href="https://github.com/Ktaewon/jsonkit/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            GitHub Issues
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('contact')}
        className="fixed bottom-6 left-6 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircleQuestion className="h-5 w-5" />}
      </button>
    </>
  );
}
