'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { AArrowDown, AArrowUp } from 'lucide-react';
import type { editor } from 'monaco-editor';
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

/** The shared editor font size; every editor using it updates together. */
export function useEditorFontSize(): number {
  return useSyncExternalStore(
    subscribeEditorFontSize,
    getEditorFontSize,
    () => DEFAULT_EDITOR_FONT_SIZE
  );
}

/** Monaco's namespace object, as passed to onMount (avoids importing the runtime). */
type MonacoApi = {
  KeyMod: { CtrlCmd: number };
  KeyCode: {
    Equal: number;
    Minus: number;
    Digit0: number;
    NumpadAdd: number;
    NumpadSubtract: number;
  };
};

/**
 * Ctrl/Cmd + = / - / 0 change the font size while the editor has focus. Elsewhere on the
 * page the browser's own zoom shortcuts keep working.
 */
export function addFontSizeShortcuts(
  target: editor.IStandaloneCodeEditor,
  monaco: MonacoApi
): void {
  const { CtrlCmd } = monaco.KeyMod;
  const { Equal, Minus, Digit0, NumpadAdd, NumpadSubtract } = monaco.KeyCode;
  target.addAction({
    id: 'jsonkit.fontSize.increase',
    label: 'Increase Font Size',
    keybindings: [CtrlCmd | Equal, CtrlCmd | NumpadAdd],
    run: () => changeEditorFontSize(1),
  });
  target.addAction({
    id: 'jsonkit.fontSize.decrease',
    label: 'Decrease Font Size',
    keybindings: [CtrlCmd | Minus, CtrlCmd | NumpadSubtract],
    run: () => changeEditorFontSize(-1),
  });
  target.addAction({
    id: 'jsonkit.fontSize.reset',
    label: 'Reset Font Size',
    keybindings: [CtrlCmd | Digit0],
    run: () => resetEditorFontSize(),
  });
}

const buttonClass =
  'flex h-7 items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40';

/** Small A− / size / A+ control overlaid on the editor's bottom-right corner. */
export function EditorFontSizeControl({ className }: { className?: string }) {
  const t = useTranslations('Common');
  const size = useEditorFontSize();

  return (
    <div
      role="group"
      aria-label={t('fontSize')}
      className={cn(
        'absolute bottom-3 right-5 z-10 flex items-center overflow-hidden rounded-md border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm',
        'opacity-70 transition-opacity hover:opacity-100 focus-within:opacity-100',
        className
      )}
    >
      <button
        type="button"
        onClick={() => changeEditorFontSize(-1)}
        disabled={size <= MIN_EDITOR_FONT_SIZE}
        aria-label={t('fontSizeDecrease')}
        title={t('fontSizeDecrease')}
        className={cn(buttonClass, 'w-7')}
      >
        <AArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={resetEditorFontSize}
        aria-label={t('fontSizeReset', { size })}
        title={t('fontSizeReset', { size })}
        className={cn(buttonClass, 'min-w-[2rem] border-x px-1 text-xs tabular-nums')}
      >
        {size}
      </button>
      <button
        type="button"
        onClick={() => changeEditorFontSize(1)}
        disabled={size >= MAX_EDITOR_FONT_SIZE}
        aria-label={t('fontSizeIncrease')}
        title={t('fontSizeIncrease')}
        className={cn(buttonClass, 'w-7')}
      >
        <AArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
