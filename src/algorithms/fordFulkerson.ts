import { GridNode, GridEdge, AlgoResult } from '../types/grid'

export function computeFordFulkerson(
  nodes: GridNode[],
  edges: GridEdge[],
  sId: string,
  tId: string
): AlgoResult {
  if (sId === tId)
    return { type: 'maxflow', selectedEdges: [], selectedNodes: [], explanation: '', error: 'Source and Sink must be distinct.' }

  const activeNodes = nodes.filter(n => n.status !== 'Tripped')
  const activeEdges = edges.filter(e => !e.tripped)
  const nodeIdx: Record<string, number> = {}
  activeNodes.forEach((n, i) => (nodeIdx[n.id] = i))
  const V = activeNodes.length

  if (nodeIdx[sId] === undefined || nodeIdx[tId] === undefined)
    return { type: 'maxflow', selectedEdges: [], selectedNodes: [], explanation: '', error: 'Source or sink is offline.' }

  const cap         = Array.from({ length: V }, () => Array(V).fill(0)) as number[][]
  const originalCap = Array.from({ length: V }, () => Array(V).fill(0)) as number[][]

  activeEdges.forEach(e => {
    const u = nodeIdx[e.u], v = nodeIdx[e.v]
    if (u !== undefined && v !== undefined) {
      cap[u][v] += e.capacity; cap[v][u] += e.capacity
      originalCap[u][v] += e.capacity; originalCap[v][u] += e.capacity
    }
  })

  const s = nodeIdx[sId], t = nodeIdx[tId]
  let maxFlow = 0
  const parent = Array(V).fill(-1)

  function bfs(): number {
    parent.fill(-1)
    parent[s] = -2
    const q: [number, number][] = [[s, Infinity]]
    while (q.length > 0) {
      const [u, f] = q.shift()!
      for (let v = 0; v < V; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u
          const newF = Math.min(f, cap[u][v])
          if (v === t) return newF
          q.push([v, newF])
        }
      }
    }
    return 0
  }

  let push = 0
  while ((push = bfs()) > 0) {
    maxFlow += push
    let cur = t
    while (cur !== s) {
      const p = parent[cur]
      cap[p][cur] -= push
      cap[cur][p] += push
      cur = p
    }
  }

  const activeLines = activeEdges
    .filter(e => {
      const u = nodeIdx[e.u], v = nodeIdx[e.v]
      return u !== undefined && v !== undefined &&
        (originalCap[u][v] - cap[u][v] > 0 || originalCap[v][u] - cap[v][u] > 0)
    })
    .map(e => e.id)

  return {
    type: 'maxflow',
    selectedEdges: activeLines,
    selectedNodes: [],
    maxFlowMW: maxFlow,
    explanation: `Ford–Fulkerson: Maximum power throughput is ${maxFlow.toLocaleString('en-IN')} MW without violating thermal limits.`,
  }
}
