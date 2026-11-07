'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';
import { donationLinkHandlers } from '@/lib/donation-click';
import { getDonationUrl } from '@/lib/donation';
import {
  TOOL_USED_EVENT,
  markNudgeDismissed,
  readNudgeState,
  shouldShowNudge,
} from '@/lib/donation-nudge';

/** Wait a moment after a tool use so the bubble never interrupts the result appearing. */
const NUDGE_DELAY_MS = 2500;
/** Tailwind's `sm` breakpoint; the bubble is only used at this width and up. */
const WIDE_SCREEN_QUERY = '(min-width: 640px)';

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
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!donationUrl) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onToolUsed = () => {
      if (shownThisVisit.current || timer) return;
      // Small screens get the button only: a bubble would cover the tool, and an unseen
      // bubble must not be counted as shown.
      if (!window.matchMedia(WIDE_SCREEN_QUERY).matches) return;
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

  const dismiss = useCallback(() => {
    markNudgeDismissed();
    setShowNudge(false);
    trackEvent('donation_nudge', { action: 'dismissed' });
  }, []);

  // Esc closes the bubble, like other dismissible popovers.
  useEffect(() => {
    if (!showNudge) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showNudge, dismiss]);

  if (!donationUrl) return null;

  const hideNudge = () => setShowNudge(false);

  return (
    <>
      {showNudge && (
        // Non-modal dialog: it never takes focus away from the tool the user is working in.
        <div
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={messageId}
          // Same card styling as the contact modal (FloatingContactButton), placed beside the buttons.
          className="fixed bottom-[5.5rem] left-[5.5rem] z-[54] hidden w-72 rounded-lg border bg-background p-4 shadow-xl sm:block motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 id={titleId} className="font-semibold">
              {t('nudgeTitle')}
            </h3>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('dismiss')}
              className="shrink-0 rounded-full p-1 transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p id={messageId} className="mb-4 text-sm text-muted-foreground">
            {t('nudgeMessage')}
          </p>
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...donationLinkHandlers('nudge', hideNudge)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
        {...donationLinkHandlers('floating', hideNudge)}
        aria-label={`${t('buttonLabel')} (${t('opensInNewTab')})`}
        title={t('buttonLabel')}
        // Same size and colors as the contact button, stacked 16px above it.
        className="fixed bottom-[5.5rem] left-6 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Coffee className="h-5 w-5" aria-hidden="true" />
      </a>
    </>
  );
}
