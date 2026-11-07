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

export function readEditorFontSize(): number {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_FONT_SIZE;
  try {
    return parseFontSize(window.localStorage.getItem(EDITOR_FONT_SIZE_KEY));
  } catch {
    return DEFAULT_EDITOR_FONT_SIZE;
  }
}

export function writeEditorFontSize(size: number): void {
  if (typeof window === 'undefined') return;
  const next = clampFontSize(size);
  try {
    if (next === DEFAULT_EDITOR_FONT_SIZE) {
      window.localStorage.removeItem(EDITOR_FONT_SIZE_KEY);
    } else {
      window.localStorage.setItem(EDITOR_FONT_SIZE_KEY, String(next));
    }
    memoryFallback = null;
  } catch {
    // Storage blocked (private mode, disabled site data): the change still applies below
    // for this page view, it just isn't remembered.
    memoryFallback = next;
  }
  window.dispatchEvent(new Event(EDITOR_FONT_SIZE_EVENT));
}

// Used only when localStorage throws, so the buttons still work within the page.
let memoryFallback: number | null = null;

/** Current size, preferring the in-memory value when storage is unavailable. */
export function getEditorFontSize(): number {
  return memoryFallback ?? readEditorFontSize();
}

export function changeEditorFontSize(delta: number): void {
  writeEditorFontSize(getEditorFontSize() + delta);
}

export function resetEditorFontSize(): void {
  writeEditorFontSize(DEFAULT_EDITOR_FONT_SIZE);
}

/** Subscribes to font size changes from this page and from other tabs. */
export function subscribeEditorFontSize(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === EDITOR_FONT_SIZE_KEY) onChange();
  };
  window.addEventListener(EDITOR_FONT_SIZE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EDITOR_FONT_SIZE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
