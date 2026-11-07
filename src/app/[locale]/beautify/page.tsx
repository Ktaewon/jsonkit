'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import type { EditorErrorMarker } from '@/components/editor/JsonEditor';
import { Button } from '@/components/ui/button';
import {
  INDENT_OPTIONS,
  formatJson,
  getJsonErrorLocation,
  minifyAndEscapeJson,
  minifyJson,
  type FormatResult,
  type IndentOption,
} from '@/lib/json/beautify';
import { textToUnicode, unicodeToText } from '@/lib/json/unicode';
import { Copy, Trash2, FileJson } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getSizeBucket, trackToolUse, type ToolAction } from '@/lib/analytics';
import { BEAUTIFY_SAMPLE } from '@/lib/json/samples';

export default function BeautifyPage() {
  const t = useTranslations('Beautify');
  const tCommon = useTranslations('Common');
  const copy = useCopyToClipboard();

  const [input, setInput] = useLocalStorage<string>('jsonkit-beautify-input', BEAUTIFY_SAMPLE);
  const [indent, setIndent] = useLocalStorage<IndentOption>('jsonkit-beautify-indent', 2);
  const [sortKeys, setSortKeys] = useLocalStorage<boolean>('jsonkit-beautify-sort-keys', false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorMarker, setErrorMarker] = useState<EditorErrorMarker | null>(null);

  const showResult = (
    { success, result, error }: FormatResult,
    action: ToolAction,
    mode?: string
  ) => {
    trackToolUse({
      tool: 'beautify',
      action,
      result: success ? 'success' : 'error',
      size_bucket: getSizeBucket(input),
      ...(mode ? { mode } : {}),
    });
    if (success) {
      setOutput(result);
      setError(null);
      setErrorMarker(null);
      return;
    }
    const message = error || t('invalidJson');
    setError(message);
    const location = error ? getJsonErrorLocation(input, error) : null;
    setErrorMarker(location ? { ...location, message } : null);
  };

  const handleFormat = () =>
    showResult(formatJson(input, indent, { sortKeys }), 'format', sortKeys ? 'sorted' : undefined);
  const handleMinify = () =>
    showResult(minifyJson(input, { sortKeys }), 'minify', sortKeys ? 'sorted' : undefined);
  const handleMinifyEscape = () => showResult(minifyAndEscapeJson(input), 'escape', 'minify');
  // Unicode conversion works on any text, not only valid JSON
  const handleUnicodeToText = () =>
    showResult({ success: true, result: unicodeToText(input) }, 'unescape', 'unicode');
  const handleTextToUnicode = () =>
    showResult({ success: true, result: textToUnicode(input) }, 'escape', 'unicode');

  const handleInputChange = (value: string | undefined) => {
    setInput(value || '');
    setErrorMarker(null);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setErrorMarker(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    if (await copy(output)) trackToolUse({ tool: 'beautify', action: 'copy' });
  };

  return (
    <div className="container flex flex-col min-h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-3.5rem)] md:min-h-0 py-6 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileJson className="h-6 w-6" /> {t('title')}
        </h1>
      </div>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">{t('indent')}</span>
          <select
            value={String(indent)}
            onChange={(e) =>
              setIndent(e.target.value === 'tab' ? 'tab' : (Number(e.target.value) as 2 | 4))
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {INDENT_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {option === 'tab' ? t('indentTab') : t('indentSpaces', { count: option })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {t('sortKeys')}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleMinifyEscape}>
            {t('minifyEscape')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleUnicodeToText}>
            {t('unicodeToText')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleTextToUnicode}>
            {t('textToUnicode')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{tCommon('input')}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                title={tCommon('clear')}
                aria-label={tCommon('clear')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            <JsonEditor value={input} onChange={handleInputChange} errorMarker={errorMarker} />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{tCommon('output')}</h2>
            <div className="flex gap-2">
              <Button onClick={handleFormat}>{t('format')}</Button>
              <Button onClick={handleMinify}>{t('minify')}</Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                title={tCommon('copy')}
                aria-label={tCommon('copy')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
            <JsonEditor value={output} readOnly />
            {error && (
              <ErrorBanner
                message={tCommon('error')}
                details={error}
                onDismiss={() => setError(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
