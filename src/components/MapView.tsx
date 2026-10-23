import { useEffect, useRef, useCallback, useState } from 'react'
import L from 'leaflet'
import { useScada } from '../store/scadaStore'
import { GridNode, GridEdge } from '../types/grid'
import Drawer from './Drawer'

const GOOGLE_HYBRID = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

function nodeCoords(n: GridNode, isTopo: boolean): [number, number] {
  return isTopo ? [n.topoX ?? n.lat, n.topoY ?? n.lng] : [n.lat, n.lng]
}

function makeIcon(n: GridNode): L.DivIcon {
  let typeClass = 'type-substation', symbol = '🔀'
  if (n.category === 'powerstation') { typeClass = 'type-powerstation'; symbol = '⚡' }
  else if (n.category === 'city')    { typeClass = 'type-city';         symbol = '🏢' }
  if (n.status === 'Tripped') typeClass += ' type-tripped'
  return L.divIcon({
    className: 'custom-pin',
    html: `<div class="substation-pin">
      <div class="pin-icon ${typeClass}"><span>${symbol}</span></div>
      <div class="pin-label">${n.name} <span style="color:#34d399;font-family:monospace">(${Math.abs(n.mw)}MW)</span></div>
    </div>`,
    iconSize: [140, 50],
    iconAnchor: [70, 16],
  })
}

interface Props {
  onSearchRef: (fn: (q: string) => void) => void
}

export default function MapView({ onSearchRef }: Props) {
  const {
    nodes, edges, currentTool, isTopologicalView,
    connectSource, currentResult,
    tripEdge, tripNode, updateNodePos,
    setConnectSource, addEdge,
  } = useScada()

  const mapRef      = useRef<L.Map | null>(null)
  const tileRef     = useRef<L.TileLayer | null>(null)
  const markersRef  = useRef<Record<string, L.Marker>>({})
  const polylinesRef= useRef<Record<string, L.Polyline>>({})
  const mapDivRef   = useRef<HTMLDivElement>(null)

  const [drawerNode, setDrawerNode] = useState<GridNode | null>(null)
  const [drawerEdge, setDrawerEdge] = useState<GridEdge | null>(null)

  // Init map once
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return
    const map = L.map(mapDivRef.current, { zoomControl: false }).setView([10.04, 76.45], 10)
    L.control.zoom({ position: 'topright' }).addTo(map)
    mapRef.current = map
  }, [])

  // Search helper
  const flyTo = useCallback((q: string) => {
    if (!q || !mapRef.current) return
    const target = nodes.find(n => n.name.toLowerCase().includes(q.toLowerCase()) || n.id.toLowerCase().includes(q.toLowerCase()))
    if (target) mapRef.current.flyTo(nodeCoords(target, isTopologicalView), 12, { duration: 1 })
  }, [nodes, isTopologicalView])

  useEffect(() => { onSearchRef(flyTo) }, [flyTo, onSearchRef])

  // Toggle topology view tile layer
  useEffect(() => {
    const map = mapRef.current; if (!map) return
    if (isTopologicalView) {
      if (tileRef.current) { map.removeLayer(tileRef.current); tileRef.current = null }
      mapDivRef.current?.classList.add('plain-grid-bg')
      if (nodes.length > 0) {
        map.flyToBounds(L.latLngBounds(nodes.map(n => nodeCoords(n, true))), {
          padding: [80, 80],
          maxZoom: 10,
          duration: 0.8,
        })
      }
    } else {
      mapDivRef.current?.classList.remove('plain-grid-bg')
      if (!tileRef.current) tileRef.current = L.tileLayer(GOOGLE_HYBRID, { maxZoom: 20 }).addTo(map)
      map.flyTo([10.04, 76.45], 10, { duration: 0.8 })
    }
  }, [isTopologicalView])

  // Render map elements
  useEffect(() => {
    const map = mapRef.current; if (!map) return

    // Clear old
    Object.values(markersRef.current).forEach(m => map.removeLayer(m))
    Object.values(polylinesRef.current).forEach(l => map.removeLayer(l))
    markersRef.current = {}; polylinesRef.current = {}

    // Draw edges
    edges.forEach((e: GridEdge) => {
      const u = nodes.find(n => n.id === e.u)
      const v = nodes.find(n => n.id === e.v)
      if (!u || !v) return

      let color = e.voltage === 400 ? '#fbbf24' : e.voltage === 220 ? '#38bdf8' : '#34d399'
      let weight = e.voltage === 400 ? 5 : e.voltage === 220 ? 3.5 : 2.5
      let cls = 'flowing-line'

      if (e.tripped) { color = '#ef4444'; weight = 3; cls = 'faulted-line' }
      else if (currentResult?.selectedEdges.includes(e.id)) {
        color = '#10b981'; weight = 6
      } else if (currentResult) {
        color = isTopologicalView ? '#334155' : '#1e293b'; weight = 1.5; cls = ''
      }

      const poly = L.polyline([nodeCoords(u, isTopologicalView), nodeCoords(v, isTopologicalView)], {
        color, weight, opacity: 0.95, className: cls,
      }).addTo(map)

      poly.on('click', ev => {
        L.DomEvent.stopPropagation(ev)
        if (currentTool === 'fault') tripEdge(e.id)
        else { setDrawerEdge(e); setDrawerNode(null) }
      })
      polylinesRef.current[e.id] = poly
    })

    // Draw nodes
    nodes.forEach((n: GridNode) => {
      const pos = nodeCoords(n, isTopologicalView)
      const marker = L.marker(pos, { icon: makeIcon(n), draggable: !isTopologicalView }).addTo(map)

      marker.on('dragend', ev => {
        const ll = (ev.target as L.Marker).getLatLng()
        updateNodePos(n.id, parseFloat(ll.lat.toFixed(4)), parseFloat(ll.lng.toFixed(4)))
      })

      marker.on('click', ev => {
        L.DomEvent.stopPropagation(ev)
        if (currentTool === 'fault') { tripNode(n.id); return }
        if (currentTool === 'connect') {
          if (!connectSource) { setConnectSource(n); return }
          if (connectSource.id === n.id) return
          const newEdge = {
            id: `TL_${String(useScada.getState().edges.length + 1).padStart(2,'0')}`,
            u: connectSource.id, v: n.id,
            voltage: Math.min(connectSource.voltage, n.voltage),
            capacity: 300, loadMW: 60, tripped: false,
            straightKm: 0, actualKm: 0, cost: 0,
          }
          addEdge(newEdge)
          setConnectSource(null)
          return
        }
        // inspect mode — open drawer
        setDrawerNode(n); setDrawerEdge(null)
      })
      markersRef.current[n.id] = marker
    })
  }, [nodes, edges, currentResult, currentTool, isTopologicalView, connectSource, tripEdge, tripNode, updateNodePos, setConnectSource, addEdge])

  return (
    <main className="flex-1 relative">
      <div ref={mapDivRef} id="map" className="h-full w-full" />

      {/* Inspection Drawer */}
      <Drawer
        node={drawerNode}
        edge={drawerEdge}
        onClose={() => { setDrawerNode(null); setDrawerEdge(null) }}
      />

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs space-y-2">
        <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">Ernakulam Infrastructure</span>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[11px]">
          {[['⚡','Power Station','bg-sky-500'],['🔀','Substation','bg-slate-700'],['🏢','City / Load','bg-rose-500']].map(([sym,label,bg])=>(
            <div key={label} className="flex items-center space-x-2">
              <span className={`w-3.5 h-3.5 rounded-md ${bg} flex items-center justify-center text-[9px]`}>{sym}</span>
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
