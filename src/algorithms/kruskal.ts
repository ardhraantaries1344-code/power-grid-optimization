import { GridNode, GridEdge, AlgoResult } from '../types/grid'

export function computeMST(nodes: GridNode[], edges: GridEdge[]): AlgoResult {
  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const activeEdges = edges.filter(e => !e.tripped)

  const parent: Record<string, string> = {}
  activeNodes.forEach(n => (parent[n.id] = n.id))

  function find(i: string): string {
    if (parent[i] !== i) parent[i] = find(parent[i])
    return parent[i]
  }
  function union(i: string, j: string) { parent[find(i)] = find(j) }

  const sorted = [...activeEdges].sort((a, b) => a.cost - b.cost)
  const mstEdges: string[] = []
  let totalCostLakhs = 0
  let totalDistKm = 0

  for (const e of sorted) {
    if (find(e.u) !== find(e.v)) {
      mstEdges.push(e.id)
      totalCostLakhs += e.cost
      totalDistKm    += e.actualKm
      union(e.u, e.v)
    }
  }

  const isConnected =
    activeNodes.length > 0 &&
    activeNodes.every(n => find(n.id) === find(activeNodes[0].id))

  const fullGridCost = activeEdges.reduce((s, e) => s + e.cost, 0)
  const savedLakhs   = fullGridCost - totalCostLakhs

  return {
    type: 'mst',
    selectedEdges: mstEdges,
    selectedNodes: [],
    totalCostLakhs,
    totalDistKm: totalDistKm.toFixed(1),
    fullGridCost,
    savedLakhs,
    edgeCount: mstEdges.length,
    isConnected,
    explanation: isConnected
      ? `Kruskal MST: ${mstEdges.length} lines. Cost ₹${totalCostLakhs.toFixed(1)} Lakhs (Saves ₹${savedLakhs.toFixed(1)} Lakhs vs full grid).`
      : `Graph has isolated components; Minimum Spanning Forest formed.`,
  }
}
