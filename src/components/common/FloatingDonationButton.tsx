'use client';

import { useEffect, useRef, useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { trackEvent, type DonationSource } from '@/lib/analytics';
import { getDonationUrl } from '@/lib/donation';
import {
  TOOL_USED_EVENT,
  markDonationClicked,
  markNudgeDismissed,
  readNudgeState,
  shouldShowNudge,
} from '@/lib/donation-nudge';

/** Wait a moment after a tool use so the bubble never interrupts the result appearing. */
const NUDGE_DELAY_MS = 2500;

/**
 * Small coffee button stacked above the contact button. Returning users (see
 * `shouldShowNudge`) get a one-time bubble per page visit suggesting a donation.
 * Renders nothing when no donation URL is configured.
 */
export function FloatingDonationButton() {
  const t = useTranslations('Donation');
  const donationUrl = getDonationUrl(useLocale());
  const [showNudge, setShowNudge] = useState(false);
  const shownThisVisit = useRef(false);

  useEffect(() => {
    if (!donationUrl) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onToolUsed = () => {
      if (shownThisVisit.current || timer) return;
      if (!shouldShowNudge(readNudgeState(), Date.now())) return;
      timer = setTimeout(() => {
        shownThisVisit.current = true;
        setShowNudge(true);
        trackEvent('donation_nudge', { action: 'shown' });
      }, NUDGE_DELAY_MS);
    };

    window.addEventListener(TOOL_USED_EVENT, onToolUsed);
    return () => {
      window.removeEventListener(TOOL_USED_EVENT, onToolUsed);
      if (timer) clearTimeout(timer);
    };
  }, [donationUrl]);

  if (!donationUrl) return null;

  const onDonationClick = (source: DonationSource) => {
    markDonationClicked();
    setShowNudge(false);
    trackEvent('donation_click', { source });
  };

  const dismiss = () => {
    markNudgeDismissed();
    setShowNudge(false);
    trackEvent('donation_nudge', { action: 'dismissed' });
  };

  return (
    <>
      {showNudge && (
        // Hidden on small screens, where a bubble would cover the tool itself.
        <div
          role="status"
          className="fixed bottom-[5.25rem] left-[4.5rem] z-[54] hidden w-64 rounded-xl border bg-background p-4 pr-8 shadow-xl sm:block motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('dismiss')}
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-medium">{t('nudgeTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('nudgeMessage')}</p>
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDonationClick('nudge')}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-300"
          >
            <Coffee className="h-4 w-4" aria-hidden="true" />
            {t('nudgeCta')}
            <span className="sr-only"> ({t('opensInNewTab')})</span>
          </a>
        </div>
      )}

      <a
        href={donationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onDonationClick('floating')}
        aria-label={`${t('buttonLabel')} (${t('opensInNewTab')})`}
        title={t('buttonLabel')}
        className="fixed bottom-20 left-7 z-[55] flex h-10 w-10 items-center justify-center rounded-full border bg-background text-amber-500 shadow-lg transition-transform hover:scale-105"
      >
        <Coffee className="h-5 w-5" aria-hidden="true" />
      </a>
    </>
  );
}
