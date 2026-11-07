import type { MouseEvent } from 'react';
import { trackEvent, type DonationSource } from './analytics';
import { markDonationClicked } from './donation-nudge';

/**
 * Handlers for a donation link. Middle-click opens the link through `auxclick`, which
 * doesn't fire `click`, so both are handled to record every way of opening it.
 */
export function donationLinkHandlers(source: DonationSource, onOpen?: () => void) {
  const record = () => {
    markDonationClicked();
    trackEvent('donation_click', { source });
    onOpen?.();
  };
  return {
    onClick: record,
    onAuxClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.button === 1) record();
    },
  };
}
