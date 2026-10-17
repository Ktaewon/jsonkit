/**
 * Ad network selection for layout and components.
 * Carbon and AdSense must not load on the same page (Carbon / BuySellAds publisher terms).
 */
export function isCarbonAdsConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_CARBONADS_ENABLED !== 'true') {
    return false;
  }
  const serve = process.env.NEXT_PUBLIC_CARBONADS_SERVE?.trim();
  const placement = process.env.NEXT_PUBLIC_CARBONADS_PLACEMENT?.trim();
  return Boolean(serve && placement);
}

/** Publisher ID to pass to `GoogleAdsense`, or null when AdSense must not load. */
export function getGoogleAdsensePublisherId(): string | null {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim();
  if (!id || isCarbonAdsConfigured()) {
    return null;
  }
  return id;
}

export function shouldLoadGoogleAdsense(): boolean {
  return getGoogleAdsensePublisherId() !== null;
}
