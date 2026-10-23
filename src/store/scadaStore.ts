import { create } from 'zustand'
import { GridNode, GridEdge, AlgoResult, ToolMode, Telemetry } from '../types/grid'
import { INITIAL_NODES, INITIAL_EDGES } from '../data/ernakulam'
import { computeEdgeMetrics } from '../algorithms/haversine'

function buildEdges(nodes: GridNode[]): GridEdge[] {
  return INITIAL_EDGES.map(e => {
    const m = computeEdgeMetrics(e, nodes)
    return { ...e, ...m }
  })
}

function calcTelemetry(nodes: GridNode[], edges: GridEdge[]): Telemetry {
  let totalGen = 0, totalLoad = 0
  nodes.forEach(n => {
    if (n.status === 'Tripped') return
    if (n.mw > 0) totalGen += n.mw
    else if (n.mw < 0) totalLoad += Math.abs(n.mw)
  })
  const totalCapexLakhs = edges.reduce((s, e) => s + (e.cost ?? 0), 0)
  return { totalGen, totalLoad, deficit: Math.max(0, totalLoad - totalGen), totalCapexLakhs }
}

interface ScadaStore {
  nodes:             GridNode[]
  edges:             GridEdge[]
  telemetry:         Telemetry
  currentTool:       ToolMode
  isTopologicalView: boolean
  connectSource:     GridNode | null
  currentResult:     AlgoResult | null

  // actions
  reset:              () => void
  tripEdge:           (id: string) => void
  tripNode:           (id: string) => void
  updateNodePos:      (id: string, lat: number, lng: number) => void
  addNode:            (node: GridNode) => void
  addEdge:            (edge: GridEdge) => void
  setCurrentTool:     (tool: ToolMode) => void
  setTopologicalView: (v: boolean) => void
  setConnectSource:   (n: GridNode | null) => void
  setCurrentResult:   (r: AlgoResult | null) => void
}

const freshNodes = (): GridNode[] => INITIAL_NODES.map(n => ({ ...n }))
const freshEdges = (nodes: GridNode[]): GridEdge[] => buildEdges(nodes)

export const useScada = create<ScadaStore>((set, _get) => {
  const nodes0 = freshNodes()
  const edges0 = freshEdges(nodes0)
  return {
    nodes:             nodes0,
    edges:             edges0,
    telemetry:         calcTelemetry(nodes0, edges0),
    currentTool:       'inspect',
    isTopologicalView: false,
    connectSource:     null,
    currentResult:     null,

    reset: () => {
      const n = freshNodes(); const e = freshEdges(n)
      set({ nodes: n, edges: e, telemetry: calcTelemetry(n, e), currentResult: null })
    },

    tripEdge: (id) => set(s => {
      const edges = s.edges.map(e => e.id === id ? { ...e, tripped: !e.tripped } : e)
      return { edges, telemetry: calcTelemetry(s.nodes, edges) }
    }),

    tripNode: (id) => set(s => {
      const nodes = s.nodes.map(n =>
        n.id === id ? { ...n, status: n.status === 'Tripped' ? 'Active' : 'Tripped' } : n
      ) as GridNode[]
      return { nodes, telemetry: calcTelemetry(nodes, s.edges) }
    }),

    updateNodePos: (id, lat, lng) => set(s => {
      const nodes = s.nodes.map(n => n.id === id ? { ...n, lat, lng } : n)
      const edges = s.edges.map(e => {
        const m = computeEdgeMetrics(e, nodes)
        return { ...e, ...m }
      })
      return { nodes, edges, telemetry: calcTelemetry(nodes, edges) }
    }),

    addNode: (node) => set(s => {
      const nodes = [...s.nodes, node]
      return { nodes, telemetry: calcTelemetry(nodes, s.edges) }
    }),

    addEdge: (edge) => set(s => {
      const edges = [...s.edges, edge]
      return { edges, telemetry: calcTelemetry(s.nodes, edges) }
    }),

    setCurrentTool:     (currentTool)       => set({ currentTool }),
    setTopologicalView: (isTopologicalView) => set({ isTopologicalView }),
    setConnectSource:   (connectSource)     => set({ connectSource }),
    setCurrentResult:   (currentResult)     => set({ currentResult }),
  }
})
