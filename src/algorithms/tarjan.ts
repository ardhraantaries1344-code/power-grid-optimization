import { GridNode, GridEdge, AlgoResult } from '../types/grid'

export function computeTarjan(nodes: GridNode[], edges: GridEdge[]): AlgoResult {
  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const activeEdges = edges.filter(e => !e.tripped)
  const adj: Record<string, { to: string; edgeId: string }[]> = {}
  activeNodes.forEach(n => (adj[n.id] = []))
  activeEdges.forEach(e => {
    adj[e.u]?.push({ to: e.v, edgeId: e.id })
    adj[e.v]?.push({ to: e.u, edgeId: e.id })
  })

  let timer = 0
  const tin: Record<string, number> = {}
  const low: Record<string, number> = {}
  const visited: Record<string, boolean> = {}
  const bridges: string[] = []
  const ap = new Set<string>()

  const dfs = (u: string, p: string | null) => {
    visited[u] = true
    tin[u] = low[u] = ++timer
    let children = 0
    for (const { to, edgeId } of adj[u] ?? []) {
      if (to === p) continue
      if (visited[to]) {
        low[u] = Math.min(low[u], tin[to])
      } else {
        children++
        dfs(to, u)
        low[u] = Math.min(low[u], low[to])
        if (low[to] > tin[u]) bridges.push(edgeId)
        if (p !== null && low[to] >= tin[u]) ap.add(u)
      }
    }
    if (p === null && children > 1) ap.add(u)
  }

  activeNodes.forEach(n => { if (!visited[n.id]) dfs(n.id, null) })

  return {
    type: 'tarjan',
    selectedEdges: bridges,
    selectedNodes: Array.from(ap),
    bridgeCount: bridges.length,
    apCount: ap.size,
    explanation: `Tarjan's: ${bridges.length} critical bridges and ${ap.size} articulation substations (N-1 single points of failure).`,
  }
}
