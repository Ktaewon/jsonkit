'use client';

import { usePathname } from '@/i18n/navigation';

const serve = process.env.NEXT_PUBLIC_CARBONADS_SERVE?.trim() ?? '';
const placement = process.env.NEXT_PUBLIC_CARBONADS_PLACEMENT?.trim() ?? '';
const enabled = process.env.NEXT_PUBLIC_CARBONADS_ENABLED === 'true';

const scriptSrc =
  serve && placement
    ? `https://cdn.carbonads.com/carbon.js?serve=${encodeURIComponent(serve)}&placement=${encodeURIComponent(placement)}`
    : '';

export function CarbonAd() {
  const pathname = usePathname();

  if (!enabled || !scriptSrc) {
    return null;
  }

  return (
    <div
      key={pathname}
      className="carbon-wrap flex max-h-[120px] max-w-[330px] shrink-0 items-start justify-end [&_.carbon-img]:rounded [&_a]:no-underline"
      data-nosnippet
    >
      <div id="carbonads" />
      {/* Native script so each pathname remount re-runs Carbon (next/script dedupes by id). */}
      <script key={pathname} id="_carbonads_js" src={scriptSrc} async type="text/javascript" />
    </div>
  );
}
