'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AArrowDown, AArrowUp } from 'lucide-react';
import type { IDisposable, editor } from 'monaco-editor';
import {
  DEFAULT_EDITOR_FONT_SIZE,
  MAX_EDITOR_FONT_SIZE,
  MIN_EDITOR_FONT_SIZE,
  changeEditorFontSize,
  getEditorFontSize,
  resetEditorFontSize,
  subscribeEditorFontSize,
} from '@/lib/editor-font-size';
import { cn } from '@/lib/utils';

/** Space kept free below the last line so the overlaid control never hides it. */
export const FONT_SIZE_CONTROL_CLEARANCE = 40;

/** The shared editor font size; every editor using it updates together. */
export function useEditorFontSize(): number {
  return useSyncExternalStore(
    subscribeEditorFontSize,
    getEditorFontSize,
    () => DEFAULT_EDITOR_FONT_SIZE
  );
}

/** The parts of Monaco's namespace object (passed to onMount) that the shortcuts use. */
type MonacoApi = {
  KeyCode: {
    Equal: number;
    Minus: number;
    Digit0: number;
    NumpadAdd: number;
    NumpadSubtract: number;
    Numpad0: number;
  };
};

/**
 * Ctrl/Cmd + = (or +) / - / 0 change the font size while the editor has focus. A key is
 * only consumed when it actually changes the size, so at the min/max (or at the default,
 * for 0) the browser's own page zoom still works; outside the editor it always does.
 *
 * Listens on the editor itself, so the listener goes away when the editor is disposed.
 */
export function addFontSizeShortcuts(
  target: editor.IStandaloneCodeEditor,
  monaco: MonacoApi
): IDisposable {
  const { Equal, Minus, Digit0, NumpadAdd, NumpadSubtract, Numpad0 } = monaco.KeyCode;
  return target.onKeyDown((e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    let changed: boolean;
    if (e.keyCode === Equal || e.keyCode === NumpadAdd) {
      changed = changeEditorFontSize(1);
    } else if (e.keyCode === Minus || e.keyCode === NumpadSubtract) {
      changed = changeEditorFontSize(-1);
    } else if ((e.keyCode === Digit0 || e.keyCode === Numpad0) && !e.shiftKey) {
      changed = resetEditorFontSize();
    } else {
      return;
    }
    if (changed) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

/** Shared look of the small button groups overlaid on editors. */
export const toolbarGroupClass =
  'flex items-center overflow-hidden rounded-md border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm';

export const toolbarButtonClass =
  'flex h-7 items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground';

/**
 * Bottom-right overlay holding the editor's small controls. Faded until hovered or
 * focused so it doesn't distract while typing.
 */
export function EditorToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="absolute bottom-3 right-5 z-10 flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100 focus-within:opacity-100">
      {children}
    </div>
  );
}

/** Small A− / size / A+ control, shown in the editor toolbar. */
export function EditorFontSizeControl({ className }: { className?: string }) {
  const t = useTranslations('Common');
  const size = useEditorFontSize();
  const atMin = size <= MIN_EDITOR_FONT_SIZE;
  const atMax = size >= MAX_EDITOR_FONT_SIZE;

  return (
    <div role="group" aria-label={t('fontSize')} className={cn(toolbarGroupClass, className)}>
      {/* aria-disabled instead of disabled, so focus isn't lost when a limit is reached */}
      <button
        type="button"
        onClick={() => !atMin && changeEditorFontSize(-1)}
        aria-disabled={atMin}
        aria-label={t('fontSizeDecrease')}
        title={t('fontSizeDecrease')}
        className={cn(toolbarButtonClass, 'w-7')}
      >
        <AArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={resetEditorFontSize}
        aria-label={t('fontSizeReset', { size })}
        title={t('fontSizeReset', { size })}
        className={cn(toolbarButtonClass, 'min-w-[2rem] border-x px-1 text-xs tabular-nums')}
      >
        <span aria-live="polite">{size}</span>
      </button>
      <button
        type="button"
        onClick={() => !atMax && changeEditorFontSize(1)}
        aria-disabled={atMax}
        aria-label={t('fontSizeIncrease')}
        title={t('fontSizeIncrease')}
        className={cn(toolbarButtonClass, 'w-7')}
      >
        <AArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
