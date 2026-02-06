'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { repairJson } from '@/lib/json/repair';
import { Copy, Trash2, Wrench, CheckCircle, AlertCircle } from 'lucide-react';

import { useLocalStorage } from '@/hooks/use-local-storage';

export default function RepairPage() {
  const t = useTranslations('Repair');
  const tCommon = useTranslations('Common');

  const [input, setInput] = useLocalStorage<string>('jsonkit-repair-input', '');
  const [output, setOutput] = useState('');
  const [wasRepaired, setWasRepaired] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRepair = () => {
    const { success, result, wasRepaired: repaired, error } = repairJson(input);
    if (success) {
      setOutput(result);
      setWasRepaired(repaired);
      setError(null);
    } else {
      setOutput('');
      setWasRepaired(null);
      setError(error || t('repairFailed'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setWasRepaired(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Clipboard API failed, ignore silently
    }
  };

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" /> {t('title')}
        </h1>
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
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            <JsonEditor value={input} onChange={(v) => setInput(v || '')} />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {tCommon('output')}
              {wasRepaired === true && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  {t('repaired')}
                </span>
              )}
              {wasRepaired === false && output && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <AlertCircle className="h-4 w-4" />
                  {t('alreadyValid')}
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <Button onClick={handleRepair}>
                <Wrench className="h-4 w-4 mr-2" />
                {t('repair')}
              </Button>
              <Button variant="outline" onClick={handleCopy} title={tCommon('copy')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
            <JsonEditor value={output} readOnly />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
                {tCommon('error')}: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Repair hints */}
      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-1">{t('supportsTitle')}:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('supports.trailingCommas')}</li>
          <li>{t('supports.missingQuotes')}</li>
          <li>{t('supports.singleQuotes')}</li>
          <li>{t('supports.comments')}</li>
          <li>{t('supports.unquotedKeys')}</li>
        </ul>
      </div>
    </div>
  );
}
