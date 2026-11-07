// Editor font size preference, shared by every Monaco editor on the site.
//
// Stored in localStorage so it survives visits, and broadcast with a window event so all
// editors on the page (e.g. input and output panes) change together. Other tabs pick it
// up through the native `storage` event.

export const EDITOR_FONT_SIZE_KEY = 'jsonkit:editor-font-size';
export const EDITOR_FONT_SIZE_EVENT = 'jsonkit:editor-font-size';
export const MIN_EDITOR_FONT_SIZE = 10;
export const MAX_EDITOR_FONT_SIZE = 24;
export const DEFAULT_EDITOR_FONT_SIZE = 14;

/** Rounds to a whole pixel and keeps the size within the supported range. */
export function clampFontSize(size: number): number {
  if (!Number.isFinite(size)) return DEFAULT_EDITOR_FONT_SIZE;
  return Math.min(MAX_EDITOR_FONT_SIZE, Math.max(MIN_EDITOR_FONT_SIZE, Math.round(size)));
}

/** Parses a stored value, falling back to the default for anything missing or invalid. */
export function parseFontSize(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === '') return DEFAULT_EDITOR_FONT_SIZE;
  return clampFontSize(Number(raw));
}

function readStoredFontSize(): number {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_FONT_SIZE;
  try {
    return parseFontSize(window.localStorage.getItem(EDITOR_FONT_SIZE_KEY));
  } catch {
    return DEFAULT_EDITOR_FONT_SIZE;
  }
}

// In-memory copy, so renders don't hit localStorage and a change still applies for this
// page view when storage is blocked. Refreshed from storage when another tab changes it.
let current: number | null = null;

export function getEditorFontSize(): number {
  if (current === null) current = readStoredFontSize();
  return current;
}

export function setEditorFontSize(size: number): void {
  if (typeof window === 'undefined') return;
  const next = clampFontSize(size);
  if (next === getEditorFontSize()) return;
  current = next;
  try {
    if (next === DEFAULT_EDITOR_FONT_SIZE) {
      window.localStorage.removeItem(EDITOR_FONT_SIZE_KEY);
    } else {
      window.localStorage.setItem(EDITOR_FONT_SIZE_KEY, String(next));
    }
  } catch {
    // Storage blocked (private mode, disabled site data, quota): the change still applies
    // for this page view, it just isn't remembered.
  }
  window.dispatchEvent(new Event(EDITOR_FONT_SIZE_EVENT));
}

/** Changes the size by `delta`; returns false when already at the limit (nothing changed). */
export function changeEditorFontSize(delta: number): boolean {
  const before = getEditorFontSize();
  setEditorFontSize(before + delta);
  return getEditorFontSize() !== before;
}

/** Resets to the default; returns false when it already was the default. */
export function resetEditorFontSize(): boolean {
  const before = getEditorFontSize();
  setEditorFontSize(DEFAULT_EDITOR_FONT_SIZE);
  return before !== DEFAULT_EDITOR_FONT_SIZE;
}

/** Subscribes to font size changes from this page and from other tabs. */
export function subscribeEditorFontSize(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== EDITOR_FONT_SIZE_KEY) return;
    current = readStoredFontSize();
    onChange();
  };
  window.addEventListener(EDITOR_FONT_SIZE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EDITOR_FONT_SIZE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
