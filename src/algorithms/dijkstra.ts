import { GridNode, GridEdge, AlgoResult, WeightKey } from '../types/grid'

export function computeDijkstra(
  nodes: GridNode[],
  edges: GridEdge[],
  startId: string,
  endId: string,
  weightKey: WeightKey = 'distance'
): AlgoResult {
  if (startId === endId)
    return { type: 'dijkstra', selectedEdges: [], selectedNodes: [], explanation: '', error: 'Source and Destination must be different.' }

  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const activeEdges = edges.filter(e => !e.tripped)

  const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {}
  activeNodes.forEach(n => (adj[n.id] = []))
  activeEdges.forEach(e => {
    const w = weightKey === 'cost' ? e.cost : e.actualKm
    adj[e.u]?.push({ to: e.v, weight: w, edgeId: e.id })
    adj[e.v]?.push({ to: e.u, weight: w, edgeId: e.id })
  })

  const dist: Record<string, number> = {}
  const prev: Record<string, string> = {}
  const prevEdge: Record<string, string> = {}
  const unvisited = new Set(activeNodes.map(n => n.id))
  activeNodes.forEach(n => (dist[n.id] = Infinity))
  dist[startId] = 0

  while (unvisited.size > 0) {
    let curr: string | null = null
    let minVal = Infinity
    for (const node of unvisited) {
      if (dist[node] < minVal) { minVal = dist[node]; curr = node }
    }
    if (!curr || dist[curr] === Infinity || curr === endId) break
    unvisited.delete(curr)
    for (const edge of adj[curr] ?? []) {
      if (!unvisited.has(edge.to)) continue
      const alt = dist[curr] + edge.weight
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt
        prev[edge.to] = curr
        prevEdge[edge.to] = edge.edgeId
      }
    }
  }

  if (!isFinite(dist[endId]))
    return { type: 'dijkstra', selectedEdges: [], selectedNodes: [], explanation: '', error: `No active route between ${startId} and ${endId}.` }

  const pathEdges: string[] = []
  const pathNodes: string[] = []
  let totalRouteCost = 0, totalRouteDist = 0
  let cur: string | undefined = endId

  while (cur && cur !== startId) {
    pathNodes.unshift(cur)
    const edgeId = prevEdge[cur]
    if (edgeId) {
      pathEdges.unshift(edgeId)
      const edge = edges.find(e => e.id === edgeId)
      if (edge) { totalRouteCost += edge.cost; totalRouteDist += edge.actualKm }
    }
    cur = prev[cur]
  }
  pathNodes.unshift(startId)

  return {
    type: 'dijkstra',
    selectedEdges: pathEdges,
    selectedNodes: pathNodes,
    totalCost: totalRouteCost.toFixed(1),
    totalDistance: totalRouteDist.toFixed(1),
    weightKey,
    explanation: `Shortest Path (${weightKey === 'cost' ? 'Cost-Weighted' : 'Distance-Weighted'}): ${pathEdges.length} hops. Total: ₹${totalRouteCost.toFixed(1)} Lakhs, ${totalRouteDist.toFixed(1)} km.`,
  }
}
