// Decides when to show the "consider supporting JSONKit" bubble.
//
// Only returning users see it: a number of successful tool uses spread over several
// distinct days. Everything is stored in this browser's localStorage and never sent
// anywhere. Dismissing hides it for a while; clicking the donation link hides it for good.

export const NUDGE_STORAGE_KEY = 'jsonkit:donation-nudge';
/** Fired on window after each counted tool use, so the floating button can react. */
export const TOOL_USED_EVENT = 'jsonkit:tool-used';

export const NUDGE_MIN_USES = 10;
export const NUDGE_MIN_DAYS = 3;
export const NUDGE_DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

export type NudgeState = {
  /** Successful tool uses counted so far */
  uses: number;
  /** Distinct local days (YYYY-MM-DD) with a tool use, capped at NUDGE_MIN_DAYS */
  days: string[];
  /** When the bubble was last closed */
  dismissedAt?: number;
  /** When a donation link was clicked; the bubble never shows again after this */
  clickedAt?: number;
};

export const EMPTY_NUDGE_STATE: NudgeState = { uses: 0, days: [] };

/** Local calendar day, so "3 different days" matches what the user experiences. */
export function toDayKey(now: number): string {
  const date = new Date(now);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function recordUse(state: NudgeState, now: number): NudgeState {
  const today = toDayKey(now);
  const days =
    state.days.includes(today) || state.days.length >= NUDGE_MIN_DAYS
      ? state.days
      : [...state.days, today];
  return { ...state, uses: state.uses + 1, days };
}

export function shouldShowNudge(state: NudgeState, now: number): boolean {
  if (state.clickedAt !== undefined) return false;
  if (state.dismissedAt !== undefined && now - state.dismissedAt < NUDGE_DISMISS_MS) {
    return false;
  }
  return state.uses >= NUDGE_MIN_USES && state.days.length >= NUDGE_MIN_DAYS;
}

/** Parses stored JSON, falling back to an empty state for anything malformed. */
export function parseNudgeState(raw: string | null): NudgeState {
  if (!raw) return EMPTY_NUDGE_STATE;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return EMPTY_NUDGE_STATE;
    const { uses, days, dismissedAt, clickedAt } = value as Record<string, unknown>;
    return {
      uses: typeof uses === 'number' && Number.isFinite(uses) && uses > 0 ? Math.floor(uses) : 0,
      days: Array.isArray(days)
        ? days.filter((d): d is string => typeof d === 'string').slice(0, NUDGE_MIN_DAYS)
        : [],
      dismissedAt: typeof dismissedAt === 'number' ? dismissedAt : undefined,
      clickedAt: typeof clickedAt === 'number' ? clickedAt : undefined,
    };
  } catch {
    return EMPTY_NUDGE_STATE;
  }
}

export function readNudgeState(): NudgeState {
  if (typeof window === 'undefined') return EMPTY_NUDGE_STATE;
  try {
    return parseNudgeState(window.localStorage.getItem(NUDGE_STORAGE_KEY));
  } catch {
    return EMPTY_NUDGE_STATE;
  }
}

function writeNudgeState(state: NudgeState): void {
  try {
    window.localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode); the nudge is optional.
  }
}

/** Counts one successful tool use and notifies listeners. Never throws. */
export function recordToolUseForNudge(now = Date.now()): void {
  if (typeof window === 'undefined') return;
  writeNudgeState(recordUse(readNudgeState(), now));
  try {
    window.dispatchEvent(new Event(TOOL_USED_EVENT));
  } catch {
    // Ignore environments without DOM events.
  }
}

export function markNudgeDismissed(now = Date.now()): void {
  if (typeof window === 'undefined') return;
  writeNudgeState({ ...readNudgeState(), dismissedAt: now });
}

export function markDonationClicked(now = Date.now()): void {
  if (typeof window === 'undefined') return;
  writeNudgeState({ ...readNudgeState(), clickedAt: now });
}
