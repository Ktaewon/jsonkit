// Google Analytics 4 event helper.
//
// Privacy rule: event params must never contain JSON content or any other user input.
// Only tool/action names, formats, languages and coarse size buckets are allowed, which
// the types below enforce.

export type ToolName =
  | 'beautify'
  | 'validate'
  | 'viewer'
  | 'compare'
  | 'convert'
  | 'query'
  | 'escape'
  | 'repair'
  | 'schema'
  | 'graph'
  | 'json-to-code';

export type ToolAction =
  | 'format'
  | 'minify'
  | 'validate'
  | 'view'
  | 'diff'
  | 'convert'
  | 'execute'
  | 'escape'
  | 'unescape'
  | 'repair'
  | 'render'
  | 'generate'
  | 'copy';

export type SizeBucket = 'empty' | 'lt_1kb' | '1_10kb' | '10_100kb' | '100kb_1mb' | 'gt_1mb';

export type ToolEventParams = {
  tool: ToolName;
  action: ToolAction;
  result?: 'success' | 'error';
  size_bucket?: SizeBucket;
  /** Conversion source format, e.g. 'json' or 'yaml' */
  from_format?: string;
  /** Conversion target format */
  to_format?: string;
  /** Target language for code generation */
  language?: string;
  /** Diff view mode or graph layout direction */
  mode?: string;
};

type AnalyticsEvents = {
  tool_use: ToolEventParams;
};

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function getGaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
}

/**
 * Sends a GA4 event. No-ops when GA isn't configured or its script failed to load
 * (e.g. blocked by an ad blocker or network), and never throws.
 */
export function trackEvent<K extends keyof AnalyticsEvents>(
  name: K,
  params: AnalyticsEvents[K]
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch {
    // Analytics must never break the tools
  }
}

export function trackToolUse(params: ToolEventParams): void {
  trackEvent('tool_use', params);
}

/** Coarse size bucket of a text, so no exact length or content is ever sent. */
export function getSizeBucket(text: string | null | undefined): SizeBucket {
  const length = text?.length ?? 0;
  if (length === 0) return 'empty';
  if (length < 1_000) return 'lt_1kb';
  if (length < 10_000) return '1_10kb';
  if (length < 100_000) return '10_100kb';
  if (length < 1_000_000) return '100kb_1mb';
  return 'gt_1mb';
}
