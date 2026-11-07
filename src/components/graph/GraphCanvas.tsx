'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

function Canvas({ nodes: layoutedNodes, edges: layoutedEdges }: GraphCanvasProps) {
  const { resolvedTheme } = useTheme();
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layoutedEdges);

  // Show each new layout in full. The `fitView` prop alone only fits once, after every
  // node is measured, which never happens when off-screen nodes aren't rendered.
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    if (layoutedNodes.length === 0) return;
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.1, minZoom: 0.1 });
    });
    return () => cancelAnimationFrame(frame);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
      minZoom={0.1}
      maxZoom={4}
      onlyRenderVisibleElements
      attributionPosition="bottom-right"
    >
      <Background color="#888" gap={16} size={1} />
      <Controls />
    </ReactFlow>
  );
}

/**
 * React Flow canvas, split out so the page can load it (and its JS and CSS) lazily
 * instead of blocking the first paint of the graph tool.
 */
export default function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
