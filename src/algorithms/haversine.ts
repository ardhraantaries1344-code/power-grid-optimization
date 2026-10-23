import { GridNode, GridEdge } from '../types/grid'
import { COST_TABLE, ROUTE_MULTIPLIER } from '../data/ernakulam'

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function computeEdgeMetrics(
  e: Omit<GridEdge, 'straightKm' | 'actualKm' | 'cost'>,
  nodes: GridNode[]
): { straightKm: number; actualKm: number; cost: number } {
  const u = nodes.find(n => n.id === e.u)
  const v = nodes.find(n => n.id === e.v)
  if (!u || !v) return { straightKm: 0, actualKm: 0, cost: 0 }
  const straightKm = haversineKm(u.lat, u.lng, v.lat, v.lng)
  const actualKm   = straightKm * ROUTE_MULTIPLIER
  const rateLakhs  = COST_TABLE[e.voltage] ?? 50
  const cost       = parseFloat((actualKm * rateLakhs).toFixed(1))
  return {
    straightKm: parseFloat(straightKm.toFixed(1)),
    actualKm:   parseFloat(actualKm.toFixed(1)),
    cost,
  }
}
