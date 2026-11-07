'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import type { Node, Edge } from '@xyflow/react';

import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { Loader2, Network, RotateCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTrackToolUse } from '@/hooks/use-track-tool-use';
import { getSizeBucket } from '@/lib/analytics';
import { getLayoutedElements, MAX_GRAPH_NODES, processJsonToGraph } from '@/lib/json/graph-layout';

const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

/** Wait for typing to pause before re-laying out the graph. */
const LAYOUT_DEBOUNCE_MS = 400;

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
  >
    {children}
  </span>
);

export default function GraphPage() {
  const t = useTranslations('Graph');
  const tCommon = useTranslations('Common');

  const [input, setInput] = useLocalStorage<string>(
    'jsonkit-graph-input',
    '{\n  "name": "JSONKit",\n  "components": [\n    { "name": "Editor", "status": "Active" },\n    { "name": "Graph", "status": "Beta" }\n  ]\n}'
  );

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const [error, setError] = useState<string | null>(null);
  // Input of the graph on screen; null until the first layout, which also runs right away
  const laidOutInputRef = useRef<string | null>(null);

  // Parse and lay out once typing pauses; a newer input cancels an older layout, so a slow
  // layout can't overwrite a newer graph.
  useEffect(() => {
    let cancelled = false;
    // Only typing is debounced; flipping the direction re-lays out right away
    const delay =
      laidOutInputRef.current === null || input === laidOutInputRef.current
        ? 0
        : LAYOUT_DEBOUNCE_MS;
    const timer = setTimeout(async () => {
      if (!input.trim()) {
        setNodes([]);
        setEdges([]);
        setTruncated(false);
        setError(null);
        return;
      }

      try {
        const parsed = JSON.parse(input);
        const graph = processJsonToGraph(parsed);
        const layouted = await getLayoutedElements(graph.nodes, graph.edges, { direction });
        if (cancelled) return;
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
        setTruncated(graph.truncated);
        setError(null);
        laidOutInputRef.current = input;
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message || 'Invalid JSON');
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, direction]);

  useTrackToolUse(`${direction}|${input}`, {
    tool: 'graph',
    action: 'render',
    result: error ? 'error' : 'success',
    mode: direction,
    size_bucket: getSizeBucket(input),
  });

  // Handle layout direction change
  const toggleDirection = () => {
    setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'));
  };

  return (
    <div className="container flex flex-col min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 py-6 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="h-6 w-6" /> {t('title')}
        </h1>
      </div>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Editor (1/3 width on large screens) */}
        <div className="flex flex-col gap-2 min-h-[300px] lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>{tCommon('input')}</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput('')}>
                <Trash2 className="h-4 w-4 mr-2" /> {tCommon('clear')}
              </Button>
            </div>
          </div>
          <div className="flex-1 border rounded-md overflow-hidden relative">
            <JsonEditor value={input} onChange={(v) => setInput(v || '')} language="json" />
            {error && <ErrorBanner message={tCommon('error')} details={error} />}
          </div>
        </div>

        {/* Graph (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-[500px] lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>{t('visualization')}</Label>
            <Button variant="outline" size="sm" onClick={toggleDirection}>
              <RotateCw className="h-4 w-4 mr-2" />
              {direction === 'LR' ? t('layoutTB') : t('layoutLR')}
            </Button>
          </div>
          <div className="flex-1 border rounded-md overflow-hidden bg-muted/10 relative">
            <GraphCanvas nodes={nodes} edges={edges} />
            {truncated && (
              <p
                role="status"
                className="absolute left-2 top-2 z-10 rounded-md border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm"
              >
                {t('truncated', { count: MAX_GRAPH_NODES })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
