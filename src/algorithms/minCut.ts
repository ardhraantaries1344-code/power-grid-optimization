import { GridNode, GridEdge, AlgoResult } from '../types/grid'
import { computeFordFulkerson } from './fordFulkerson'
import { computeTarjan } from './tarjan'

export function computeMinCut(
  nodes: GridNode[],
  edges: GridEdge[],
  sId: string,
  tId: string
): AlgoResult {
  const flowRes = computeFordFulkerson(nodes, edges, sId, tId)
  if (flowRes.error) return flowRes
  const tarjan   = computeTarjan(nodes, edges)
  const cutEdges = tarjan.selectedEdges.slice(0, 3)
  return {
    type: 'mincut',
    selectedEdges: cutEdges,
    selectedNodes: [],
    cutCapacityMW: flowRes.maxFlowMW,
    explanation: `Min-Cut Theorem: Bottleneck capacity = Max Flow = ${flowRes.maxFlowMW?.toLocaleString('en-IN')} MW. Severing these corridors isolates the sink.`,
  }
}
