'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { JsonEditor } from '@/components/editor/JsonEditor';
import { JsonTreeView } from '@/components/editor/TreeView';
import { Button } from '@/components/ui/button';
import { Network, Trash2, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

const DEFAULT_JSON =
  '{\n  "demo": "Try pasting some JSON here!",\n  "features": ["Tree View", "Copy Path", "Expand/Collapse"]\n}';

export default function ViewerPage() {
  const t = useTranslations('Viewer');
  const tCommon = useTranslations('Common');

  // In i18n update, we might want to localize this default json too or leave it.
  // For now, keep it simple.
  const [input, setInput] = useLocalStorage<string>('jsonkit-viewer-input', DEFAULT_JSON);

  const { parsedData, error } = useMemo(() => {
    if (!input.trim()) {
      return { parsedData: null, error: null };
    }
    try {
      const parsed = JSON.parse(input);
      return { parsedData: parsed, error: null };
    } catch {
      return { parsedData: null, error: 'Invalid JSON' }; // Hardcoded or translated? "Invalid JSON" can be t('Beautify.invalidJson') or similar
    }
  }, [input]);

  const handleClear = () => setInput('');

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="h-6 w-6" /> {t('title')}
        </h1>
      </div>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{t('inputTitle')}</h2>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" /> {tCommon('clear')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
            <JsonEditor value={input} onChange={(v) => setInput(v || '')} />
            {error && (
              <div className="absolute bottom-2 right-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                {tCommon('error')}: {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{t('treeTitle')}</h2>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-auto p-4 bg-background">
            {parsedData ? (
              <JsonTreeView data={parsedData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ArrowRight className="h-8 w-8 mb-2 opacity-20" />
                <p>{t('enterValid')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
