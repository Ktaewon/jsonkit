'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { escapeJson, unescapeJson } from '@/lib/json/escape';
import { Copy, Trash2, FileJson } from 'lucide-react';

import { useLocalStorage } from '@/hooks/use-local-storage';

export default function EscapePage() {
  const t = useTranslations('Escape');
  const tCommon = useTranslations('Common');

  const [input, setInput] = useLocalStorage<string>('jsonkit-escape-input', '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEscape = () => {
    const { success, result, error } = escapeJson(input);
    if (success) {
      setOutput(result);
      setError(null);
    } else {
      setError(error || t('invalidJson'));
    }
  };

  const handleUnescape = () => {
    const { success, result, error } = unescapeJson(input);
    if (success) {
      setOutput(result);
      setError(null);
    } else {
      setError(error || t('invalidEscaped'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileJson className="h-6 w-6" /> {t('title')}
        </h1>
        <div className="flex items-center gap-2">{/* Actions */}</div>
      </div>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{tCommon('input')}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClear} title={tCommon('clear')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <JsonEditor value={input} onChange={(v) => setInput(v || '')} />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{tCommon('output')}</h2>
            <div className="flex gap-2">
              <Button onClick={handleEscape}>{t('escape')}</Button>
              <Button onClick={handleUnescape}>{t('unescape')}</Button>
              <Button variant="outline" onClick={handleCopy} title={tCommon('copy')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative">
            <JsonEditor value={output} readOnly />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
                {tCommon('error')}: {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
