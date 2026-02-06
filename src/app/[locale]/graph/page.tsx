'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { Network, RotateCw, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getLayoutedElements, GraphData, processJsonToGraph } from '@/lib/json/graph-layout';

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label
        className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            className
        )}
    >
        {children}
    </label>
);

export default function GraphPage() {
    const t = useTranslations('Graph');
    const tCommon = useTranslations('Common');

    const [input, setInput] = useLocalStorage<string>(
        'jsonkit-graph-input',
        '{\n  "name": "JSONKit",\n  "components": [\n    { "name": "Editor", "status": "Active" },\n    { "name": "Graph", "status": "Beta" }\n  ]\n}'
    );

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
    const [error, setError] = useState<string | null>(null);

    // Layout function
    const onLayout = useCallback(
        async (currentNodes: Node[], currentEdges: Edge[], dir: 'LR' | 'TB') => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
                currentNodes,
                currentEdges,
                { direction: dir }
            );
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [setNodes, setEdges]
    );

    // Effect to parse and layout when input changes
    useEffect(() => {
        const parseAndLayout = async () => {
            if (!input.trim()) {
                setNodes([]);
                setEdges([]);
                setError(null);
                return;
            }

            try {
                const parsed = JSON.parse(input);
                const { nodes: initialNodes, edges: initialEdges } = processJsonToGraph(parsed);
                const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
                    initialNodes,
                    initialEdges,
                    { direction }
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                setError(null);
            } catch (err) {
                console.error(err);
                setError((err as Error).message || 'Invalid JSON');
            }
        };

        parseAndLayout();
    }, [input, direction, setNodes, setEdges]);

    // Handle layout direction change
    const toggleDirection = () => {
        setDirection(prev => prev === 'LR' ? 'TB' : 'LR');
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Network className="h-6 w-6" /> {t('title')}
                </h1>
            </div>
            <p className="text-muted-foreground">{t('description')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                {/* Editor (1/3 width on large screens) */}
                <div className="flex flex-col gap-2 min-h-[300px] lg:min-h-0">
                    <div className="flex items-center justify-between">
                        <Label>{tCommon('input')}</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setInput('')}>
                                <Trash2 className="h-4 w-4 mr-2" /> {tCommon('clear')}
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 border rounded-md overflow-hidden relative">
                        <JsonEditor
                            value={input}
                            onChange={(v) => setInput(v || '')}
                            language="json"
                        />
                        {error && <ErrorBanner message={tCommon('error')} details={error} />}
                    </div>
                </div>

                {/* Graph (2/3 width) */}
                <div className="lg:col-span-2 flex flex-col gap-2 min-h-[500px] lg:min-h-0">
                    <div className="flex items-center justify-between">
                        <Label>{t('visualization')}</Label>
                        <Button variant="outline" size="sm" onClick={toggleDirection}>
                            <RotateCw className="h-4 w-4 mr-2" />
                            {direction === 'LR' ? t('layoutTB') : t('layoutLR')}
                        </Button>
                    </div>
                    <div className="flex-1 border rounded-md overflow-hidden bg-muted/10 relative">
                        <ReactFlowProvider>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                fitView
                                minZoom={0.1}
                                maxZoom={4}
                                attributionPosition="bottom-right"
                            >
                                <Background color="#888" gap={16} size={1} />
                                <Controls />
                            </ReactFlow>
                        </ReactFlowProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
