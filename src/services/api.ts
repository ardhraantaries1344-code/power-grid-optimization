import { GridNode, GridEdge, AlgoResult, WeightKey } from '../types/grid'

const API_BASE = 'http://127.0.0.1:8000/api'

export interface LiveTelemetryResponse {
  frequency_hz: number
  status_code: string
  grid_damping_ratio: number
  scada_cycle_ms: number
  timestamp: string
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return false
    const data = await res.json()
    return data.status === 'healthy'
  } catch {
    return false
  }
}

export async function fetchLiveTelemetry(): Promise<LiveTelemetryResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/live`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function apiSolveDijkstra(
  nodes: GridNode[],
  edges: GridEdge[],
  source: string,
  target: string,
  weightKey: WeightKey
): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/dijkstra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, source, target, weightKey })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSolveKruskal(nodes: GridNode[], edges: GridEdge[]): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/kruskal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSolveMaxFlow(
  nodes: GridNode[],
  edges: GridEdge[],
  source: string,
  target: string
): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/maxflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, source, target })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSolveTarjan(nodes: GridNode[], edges: GridEdge[]): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/tarjan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSolveCycles(nodes: GridNode[], edges: GridEdge[]): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/cycles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSolveMinCut(
  nodes: GridNode[],
  edges: GridEdge[],
  source: string,
  target: string
): Promise<AlgoResult> {
  const res = await fetch(`${API_BASE}/algorithms/mincut`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, source, target })
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function apiSaveScenario(name: string, nodes: GridNode[], edges: GridEdge[]): Promise<string> {
  const res = await fetch(`${API_BASE}/scenarios/save?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges })
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.message
}
