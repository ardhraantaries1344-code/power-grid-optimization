import { X, Info } from 'lucide-react'
import { GridNode, GridEdge } from '../types/grid'
import { useScada } from '../store/scadaStore'

interface Props {
  node?: GridNode | null
  edge?: GridEdge | null
  onClose: () => void
}

export default function Drawer({ node, edge, onClose }: Props) {
  const { nodes, tripEdge, tripNode } = useScada()
  if (!node && !edge) return null

  const getNode = (id: string) => nodes.find(n => n.id === id)

  return (
    <div className="absolute top-4 right-4 z-[400] w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 transition duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-400" />
          {node ? 'Facility Inspection' : 'Corridor Inspection'}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Detail */}
      {node && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <Row label="Facility ID"     value={node.id} mono />
            <Row label="Name"            value={node.name} color="text-emerald-400" />
            <Row label="Classification"  value={node.category.toUpperCase()} />
            <Row label="Voltage"         value={`${node.voltage} kV`} color="text-amber-400" mono />
            <Row label="Power Rating"    value={node.mw !== 0 ? `${Math.abs(node.mw)} MW` : '0 MW (Switching)'} color="text-amber-400" mono />
            <Row label="Coordinates"     value={`${node.lat}°N, ${node.lng}°E`} mono />
            <Row label="Status"          value={node.status} color={node.status === 'Tripped' ? 'text-rose-400' : 'text-emerald-400'} />
          </div>
          <button
            onClick={() => { tripNode(node.id); onClose() }}
            className={`w-full py-2.5 text-white rounded-lg font-bold text-xs transition shadow-lg ${
              node.status === 'Tripped'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {node.status === 'Tripped' ? 'Restore Facility' : 'Simulate Major Outage (Trip Node)'}
          </button>
        </div>
      )}

      {/* Edge Detail */}
      {edge && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <Row label="Line Corridor"  value={edge.id} mono />
            <Row label="From"           value={getNode(edge.u)?.name ?? edge.u} color="text-emerald-400" />
            <Row label="To"             value={getNode(edge.v)?.name ?? edge.v} color="text-emerald-400" />
            <Row label="Voltage Class"  value={`${edge.voltage} kV`} color="text-amber-400" mono />
            <Row label="Route Distance" value={`${edge.actualKm} km`} color="text-emerald-400" mono />
            <Row label="Est. CAPEX"     value={`₹ ${edge.cost.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs`} color="text-emerald-400" mono />
          </div>

          {/* Loading bar */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Electrical Telemetry</label>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Thermal Loading:</span>
              <span className={`font-mono font-bold ${(edge.loadMW / edge.capacity) > 0.9 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {edge.loadMW} / {edge.capacity} MW ({Math.round((edge.loadMW / edge.capacity) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`${(edge.loadMW / edge.capacity) > 0.9 ? 'bg-rose-500' : 'bg-emerald-500'} h-full rounded-full transition-all`}
                style={{ width: `${Math.min((edge.loadMW / edge.capacity) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className={`font-bold font-mono ${edge.tripped ? 'text-rose-400' : 'text-emerald-400'}`}>
                {edge.tripped ? 'TRIPPED / FAULTED' : 'ENERGISED'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { tripEdge(edge.id); onClose() }}
            className={`w-full py-2 text-white rounded-lg font-bold text-xs transition ${
              edge.tripped
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {edge.tripped ? 'Re-Energise Corridor' : 'Trip / Disconnect Line (Fault Sim)'}
          </button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}:</span>
      <span className={`${mono ? 'font-mono' : ''} ${color ?? 'text-white'} font-semibold text-right max-w-[200px] truncate`}>
        {value}
      </span>
    </div>
  )
}
