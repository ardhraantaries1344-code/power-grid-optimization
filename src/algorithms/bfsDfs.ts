import { GridNode, GridEdge, AlgoResult } from '../types/grid'

type AdjEntry = { to: string; edgeId: string }

function buildAdj(nodes: GridNode[], edges: GridEdge[]): Record<string, AdjEntry[]> {
  const adj: Record<string, AdjEntry[]> = {}
  nodes.filter(n => n.status !== 'Tripped').forEach(n => (adj[n.id] = []))
  edges.filter(e => !e.tripped).forEach(e => {
    adj[e.u]?.push({ to: e.v, edgeId: e.id })
    adj[e.v]?.push({ to: e.u, edgeId: e.id })
  })
  return adj
}

export function computeTraversal(
  nodes: GridNode[],
  edges: GridEdge[],
  startId: string,
  isBfs = true
): AlgoResult {
  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const adj = buildAdj(activeNodes, edges)
  const visitedOrder: string[] = []
  const traversedEdges: string[] = []
  const visitedSet = new Set<string>()

  if (isBfs) {
    const q = [startId]
    visitedSet.add(startId)
    while (q.length > 0) {
      const u = q.shift()!
      visitedOrder.push(u)
      for (const { to, edgeId } of adj[u] ?? []) {
        if (!visitedSet.has(to)) {
          visitedSet.add(to); traversedEdges.push(edgeId); q.push(to)
        }
      }
    }
  } else {
    const dfs = (u: string) => {
      visitedSet.add(u); visitedOrder.push(u)
      for (const { to, edgeId } of adj[u] ?? []) {
        if (!visitedSet.has(to)) { traversedEdges.push(edgeId); dfs(to) }
      }
    }
    dfs(startId)
  }

  const unreachable = activeNodes.filter(n => !visitedSet.has(n.id)).map(n => n.id)
  return {
    type: 'traversal',
    selectedEdges: traversedEdges,
    selectedNodes: visitedOrder,
    unreachable,
    explanation: `${isBfs ? 'BFS' : 'DFS'} explored ${visitedOrder.length}/${activeNodes.length} facilities. ${unreachable.length > 0 ? 'Isolated islands: ' + unreachable.join(', ') : 'All facilities connected.'}`,
  }
}
