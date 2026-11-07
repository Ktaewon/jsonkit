'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/**
 * Copies text and shows the same success/failure toast on every tool. Resolves to
 * whether the copy worked, so callers can track it.
 */
export function useCopyToClipboard(): (text: string) => Promise<boolean> {
  const t = useTranslations('Common');
  return useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('copied'));
        return true;
      } catch {
        toast.error(t('copyFailed'));
        return false;
      }
    },
    [t]
  );
}
