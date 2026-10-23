// ─── Grid Node ──────────────────────────────────────────────────────────────
export type NodeCategory = 'powerstation' | 'substation' | 'city'
export type NodeStatus   = 'Active' | 'Tripped'

export interface GridNode {
  id:       string
  name:     string
  category: NodeCategory
  lat:      number
  lng:      number
  topoX:    number
  topoY:    number
  voltage:  number
  mw:       number
  status:   NodeStatus
}

// ─── Grid Edge ──────────────────────────────────────────────────────────────
export interface GridEdge {
  id:         string
  u:          string
  v:          string
  voltage:    number
  capacity:   number
  loadMW:     number
  tripped:    boolean
  straightKm: number
  actualKm:   number
  cost:       number
}

// ─── Algorithm Types ─────────────────────────────────────────────────────────
export type AlgoType  = 'dijkstra' | 'mst' | 'maxflow' | 'bfs_dfs' | 'tarjan' | 'cycles' | 'mincut'
export type WeightKey = 'distance' | 'cost'
export type ToolMode  = 'inspect' | 'connect' | 'fault'

export interface AlgoResult {
  type:          string
  selectedEdges: string[]
  selectedNodes: string[]
  explanation:   string
  error?:        string
  // Dijkstra
  totalCost?:     string
  totalDistance?: string
  weightKey?:     WeightKey
  // MST
  totalCostLakhs?: number
  totalDistKm?:    string
  fullGridCost?:   number
  savedLakhs?:     number
  edgeCount?:      number
  isConnected?:    boolean
  // Max Flow
  maxFlowMW?: number
  // Traversal
  unreachable?: string[]
  // Tarjan
  bridgeCount?: number
  apCount?:     number
  // Cycle
  hasCycle?: boolean
  // Min Cut
  cutCapacityMW?: number
}

// ─── Telemetry ───────────────────────────────────────────────────────────────
export interface Telemetry {
  totalGen:       number
  totalLoad:      number
  deficit:        number
  totalCapexLakhs: number
}
