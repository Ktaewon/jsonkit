'use client';

import { useTranslations } from 'next-intl';
import { JsonDiffEditor } from '@/components/editor/JsonDiffEditor';
import { Button } from '@/components/ui/button';
import { GitCompare, Trash2, Columns, Rows } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useState, useEffect } from 'react';

import { JsonEditor } from '@/components/editor/JsonEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ComparePage() {
  const t = useTranslations('Compare');
  const tCommon = useTranslations('Common');

  // Using local storage for compare too
  const [original, setOriginal] = useLocalStorage<string>(
    'jsonkit-compare-original',
    '{\n  "name": "JSONKit",\n  "version": "1.0.0"\n}'
  );
  const [modified, setModified] = useLocalStorage<string>(
    'jsonkit-compare-modified',
    '{\n  "name": "JSONKit",\n  "version": "2.0.0",\n  "newFeature": true\n}'
  );

  const [activeTab, setActiveTab] = useState('diff');
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: initialize client-side state
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClear = () => {
    setOriginal('');
    setModified('');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompare className="h-6 w-6" /> {t('title')}
        </h1>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md mr-2">
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="h-7 px-2 text-xs"
              >
                <Columns className="h-3.5 w-3.5 mr-1" />
                {tCommon('splitView')}
              </Button>
              <Button
                variant={viewMode === 'inline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('inline')}
                className="h-7 px-2 text-xs"
              >
                <Rows className="h-3.5 w-3.5 mr-1" />
                {tCommon('inlineView')}
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={handleClear} size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> {t('clearAll')}
          </Button>
        </div>
      </div>

      {!isMobile ? (
        // Desktop View
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <p className="text-muted-foreground">{t('description')}</p>
          <div className="flex-1 min-h-0 relative">
            <JsonDiffEditor
              original={original}
              modified={modified}
              onOriginalChange={setOriginal}
              onModifiedChange={setModified}
              options={{
                renderSideBySide: viewMode === 'split',
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      ) : (
        // Mobile View
        <Tabs className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="original" activeValue={activeTab} onValueChange={setActiveTab}>
              Original
            </TabsTrigger>
            <TabsTrigger value="modified" activeValue={activeTab} onValueChange={setActiveTab}>
              Modified
            </TabsTrigger>
            <TabsTrigger value="diff" activeValue={activeTab} onValueChange={setActiveTab}>
              Compare
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 relative">
            <TabsContent value="original" activeValue={activeTab} className="h-full mt-0">
              <JsonEditor value={original} onChange={(value) => setOriginal(value || '')} />
            </TabsContent>
            <TabsContent value="modified" activeValue={activeTab} className="h-full mt-0">
              <JsonEditor value={modified} onChange={(value) => setModified(value || '')} />
            </TabsContent>
            <TabsContent value="diff" activeValue={activeTab} className="h-full mt-0">
              <JsonDiffEditor
                original={original}
                modified={modified}
                readOnly
                options={{
                  renderSideBySide: false,
                  wordWrap: 'on',
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
