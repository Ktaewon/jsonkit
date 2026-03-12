import ELK, { ElkNode } from 'elkjs/lib/elk.bundled';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

const getColorForType = (type: string) => {
  switch (type) {
    case 'string':
      return '#22c55e'; // green-500
    case 'number':
      return '#3b82f6'; // blue-500
    case 'boolean':
      return '#f59e0b'; // amber-500
    case 'null':
      return '#ef4444'; // red-500
    case 'object':
      return '#8b5cf6'; // violet-500
    case 'array':
      return '#ec4899'; // pink-500
    default:
      return '#64748b'; // slate-500
  }
};

const formatValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return Array.isArray(value) ? 'Array' : 'Object';
  return String(value);
};

export function processJsonToGraph(data: unknown): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 0;

  const traverse = (currentData: unknown, keyName: string, parentId: string | null) => {
    const currentId = `n-${nodeIdCounter++}`;
    const type =
      currentData === null ? 'null' : Array.isArray(currentData) ? 'array' : typeof currentData;
    const isPrimitive = type !== 'object' && type !== 'array';

    // Create Node
    const displayLabel = keyName ? keyName : 'Root';
    const displayValue = isPrimitive
      ? formatValue(currentData)
      : Array.isArray(currentData)
        ? `Array [${currentData.length}]`
        : 'Object';

    const node: Node = {
      id: currentId,
      data: {
        label: displayLabel,
        value: displayValue,
        type: type,
        isPrimitive,
      },
      position: { x: 0, y: 0 },
      type: 'default', // We can use custom nodes later
      style: {
        border: `1px solid ${getColorForType(type)}`,
        borderRadius: '8px',
        padding: '4px 8px',
        minWidth: '150px',
        fontSize: '12px',
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        textAlign: 'left',
      },
    };

    if (isPrimitive) {
      node.data.label = `${displayLabel}: ${formatValue(currentData)}`;
    } else {
      node.data.label = `${displayLabel} (${displayValue})`;
    }

    nodes.push(node);

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 },
      });
    }

    // Recursion
    if (type === 'object' && currentData !== null && typeof currentData === 'object') {
      Object.entries(currentData as Record<string, unknown>).forEach(([k, v]) => {
        traverse(v, k, currentId);
      });
    } else if (type === 'array' && Array.isArray(currentData)) {
      currentData.forEach((v, i) => {
        traverse(v, `[${i}]`, currentId);
      });
    }
  };

  traverse(data, 'root', null);
  return { nodes, edges };
}

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: { direction: 'TB' | 'LR' } = { direction: 'LR' }
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options.direction,
      'nodePlacement.strategy': 'SIMPLE',
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80', // Increase layer spacing
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: (node.style?.width as number) || 180, // Approximate width
      height: (node.style?.height as number) || 40,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((lgNode) => lgNode.id === node.id);

      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? 0,
          y: layoutedNode?.y ?? 0,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch {
    return { nodes, edges };
  }
}
