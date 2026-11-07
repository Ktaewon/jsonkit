import { describe, it, expect } from 'vitest';
import { processJsonToGraph } from '../graph-layout';

describe('processJsonToGraph', () => {
  it('작은 JSON은 모든 노드와 간선을 만들어야 함', () => {
    const { nodes, edges, truncated } = processJsonToGraph({ a: 1, b: [true, null] });
    // root, a, b, b[0], b[1]
    expect(nodes).toHaveLength(5);
    expect(edges).toHaveLength(4);
    expect(truncated).toBe(false);
  });

  it('노드 수 상한을 넘으면 잘라내고 표시해야 함', () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ id: i, tags: ['x', 'y'] }));
    const { nodes, edges, truncated } = processJsonToGraph(data, 20);
    expect(nodes).toHaveLength(20);
    expect(truncated).toBe(true);
    // Every edge points at a node that exists
    const ids = new Set(nodes.map((n) => n.id));
    expect(edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(true);
  });

  it('상한과 정확히 같으면 잘렸다고 표시하지 않아야 함', () => {
    const { nodes, truncated } = processJsonToGraph([1, 2], 3);
    expect(nodes).toHaveLength(3);
    expect(truncated).toBe(false);
  });
});
