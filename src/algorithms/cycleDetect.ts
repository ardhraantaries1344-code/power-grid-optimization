import { GridNode, GridEdge, AlgoResult } from '../types/grid'

export function computeCycles(nodes: GridNode[], edges: GridEdge[]): AlgoResult {
  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const activeEdges = edges.filter(e => !e.tripped)
  const adj: Record<string, { to: string; edgeId: string }[]> = {}
  activeNodes.forEach(n => (adj[n.id] = []))
  activeEdges.forEach(e => {
    adj[e.u]?.push({ to: e.v, edgeId: e.id })
    adj[e.v]?.push({ to: e.u, edgeId: e.id })
  })

  const visited: Record<string, boolean> = {}
  let cycleEdges: string[] = []
  let cycleNodes: string[] = []

  const dfs = (u: string, p: string | null): boolean => {
    visited[u] = true
    for (const { to, edgeId } of adj[u] ?? []) {
      if (to === p) continue
      if (visited[to]) {
        cycleEdges.push(edgeId); cycleNodes.push(to, u); return true
      }
      if (!visited[to]) {
        if (dfs(to, u)) { cycleEdges.push(edgeId); return true }
      }
    }
    return false
  }

  let hasCycle = false
  for (const n of activeNodes) {
    if (!visited[n.id]) { if (dfs(n.id, null)) { hasCycle = true; break } }
  }

  return {
    type: 'cycle',
    hasCycle,
    selectedEdges: cycleEdges,
    selectedNodes: cycleNodes,
    explanation: hasCycle
      ? `Ring Bus Loop verified! Closed loop provides parallel backup paths on line trips.`
      : `Network is strictly radial/acyclic. Loss of any branch will disconnect downstream loads.`,
  }
}
