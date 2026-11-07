import type { ElkNode } from 'elkjs/lib/elk.bundled';
import type { Node, Edge } from '@xyflow/react';

/**
 * Upper bound on rendered nodes. ELK layout and React Flow both slow down sharply beyond
 * a few thousand nodes, and big inputs used to freeze the tab, so larger JSON is
 * truncated to the first nodes in document order and the page shows a notice.
 */
export const MAX_GRAPH_NODES = 1500;

type ElkInstance = { layout: (graph: ElkNode) => Promise<ElkNode> };
let elkPromise: Promise<ElkInstance> | null = null;

/** ELK is ~400 KB, so it is only downloaded when the first graph is laid out. */
function getElk(): Promise<ElkInstance> {
  elkPromise ??= import('elkjs/lib/elk.bundled')
    .then(({ default: ELK }) => new ELK())
    .catch((error: unknown) => {
      // Don't cache a failed download (offline, or a stale chunk after a deploy)
      elkPromise = null;
      throw error;
    });
  return elkPromise;
}

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

export function processJsonToGraph(
  data: unknown,
  maxNodes: number = MAX_GRAPH_NODES
): { nodes: Node[]; edges: Edge[]; truncated: boolean } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 0;
  let truncated = false;

  const traverse = (currentData: unknown, keyName: string, parentId: string | null) => {
    if (nodes.length >= maxNodes) {
      truncated = true;
      return;
    }
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
      for (const [k, v] of Object.entries(currentData as Record<string, unknown>)) {
        if (nodes.length >= maxNodes) {
          truncated = true;
          break;
        }
        traverse(v, k, currentId);
      }
    } else if (type === 'array' && Array.isArray(currentData)) {
      for (let i = 0; i < currentData.length; i++) {
        if (nodes.length >= maxNodes) {
          truncated = true;
          break;
        }
        traverse(currentData[i], `[${i}]`, currentId);
      }
    }
  };

  traverse(data, 'root', null);
  return { nodes, edges, truncated };
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

  // A failed ELK download is rethrown so the page can show an error instead of a pile of
  // nodes at (0, 0)
  const elk = await getElk();
  try {
    const layoutedGraph = await elk.layout(graph);
    const positions = new Map((layoutedGraph.children ?? []).map((n) => [n.id, n]));

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = positions.get(node.id);

      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? 0,
          y: layoutedNode?.y ?? 0,
        },
        // Size estimate used by fitView before React Flow has measured the node (nodes
        // outside the viewport are never measured, since only visible ones render).
        initialWidth: layoutedNode?.width ?? 180,
        initialHeight: layoutedNode?.height ?? 40,
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch {
    return { nodes, edges };
  }
}
