import { Globe, Network, MousePointer, GitPullRequest, ZapOff, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useScada } from '../../store/scadaStore'
import { ToolMode } from '../../types/grid'
import { GridNode, NodeCategory } from '../../types/grid'

const TOOLS: { key: ToolMode; label: string; Icon: React.ElementType; color: string }[] = [
  { key: 'inspect', label: 'Inspect',     Icon: MousePointer,   color: 'border-emerald-500 bg-emerald-500/20 text-emerald-300' },
  { key: 'connect', label: 'Connect Line',Icon: GitPullRequest, color: 'border-slate-800 bg-slate-900 text-slate-400' },
  { key: 'fault',   label: 'Trip Fault',  Icon: ZapOff,         color: 'border-slate-800 bg-slate-900 text-rose-400' },
]

export default function ToolsTab() {
  const { currentTool, isTopologicalView, setCurrentTool, setTopologicalView, addNode, nodes } = useScada()
  const [showDeploy, setShowDeploy] = useState(false)
  const [form, setForm] = useState({ name: 'Muvattupuzha 220kV Hub', category: 'substation' as NodeCategory, voltage: 220, mw: 150, lat: 9.980, lng: 76.570 })

  function deploy() {
    const prefix = form.category === 'powerstation' ? 'PS' : form.category === 'substation' ? 'SS' : 'CT'
    const id = `${prefix}_${String(nodes.length + 1).padStart(2, '0')}`
    const mw = form.category === 'city' ? -Math.abs(form.mw) : form.mw
    const node: GridNode = { id, name: form.name, category: form.category, voltage: form.voltage, mw, lat: form.lat, lng: form.lng, topoX: form.lat, topoY: form.lng, status: 'Active' }
    addNode(node)
    setShowDeploy(false)
  }

  return (
    <div className="space-y-4">
      {/* View Mode */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Topological Representation</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button onClick={() => setTopologicalView(false)}
            className={`py-2 rounded-lg font-bold border flex items-center justify-center gap-1.5 transition ${!isTopologicalView ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
            <Globe className="w-4 h-4" /> GIS Satellite
          </button>
          <button onClick={() => setTopologicalView(true)}
            className={`py-2 rounded-lg font-bold border flex items-center justify-center gap-1.5 transition ${isTopologicalView ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
            <Network className="w-4 h-4" /> Plain Topology SLD
          </button>
        </div>
        <p className="text-[10px] text-slate-400">
          {isTopologicalView
            ? <><strong>Topology Mode:</strong> Precise bus-bar schematic on engineering grid.</>
            : <><strong>GIS Mode:</strong> Real-world GPS coordinates on Google Hybrid Satellite.</>}
        </p>
      </div>

      {/* Add Entity */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <span className="text-xs font-bold text-slate-300 block">Add Grid Entity</span>
        <button onClick={() => setShowDeploy(true)}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5">
          <PlusCircle className="w-4 h-4" /> Add Entity Wizard
        </button>
      </div>

      {/* Cursor Tool */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interactive Cursor Tool</label>
        <div className="grid grid-cols-3 gap-2">
          {TOOLS.map(({ key, label, Icon, color }) => (
            <button key={key} onClick={() => setCurrentTool(key)}
              className={`py-2 px-1 text-xs rounded-lg border font-semibold flex flex-col items-center gap-1 transition ${currentTool === key ? color : 'border-slate-800 bg-slate-900 text-slate-400'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          {currentTool === 'inspect' && <><strong>Inspect Mode:</strong> Click any substation or transmission corridor.</>}
          {currentTool === 'connect' && <><strong>Connect Mode:</strong> Click first facility, then destination.</>}
          {currentTool === 'fault'   && <><strong>Trip Mode:</strong> Click any element to cause an electrical outage.</>}
        </p>
      </div>

      {/* Deploy Modal */}
      {showDeploy && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2"><PlusCircle className="w-4 h-4 text-emerald-400" /> Add Ernakulam Grid Entity</h3>
              <button onClick={() => setShowDeploy(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <Field label="Entity Category:">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as NodeCategory }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold">
                  <option value="powerstation">⚡ Power Station</option>
                  <option value="substation">🔀 Substation</option>
                  <option value="city">🏢 City / Demand Center</option>
                </select>
              </Field>
              <Field label="Entity Name:">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Capacity / Demand (MW):">
                  <input type="number" value={form.mw} onChange={e => setForm(f => ({ ...f, mw: +e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </Field>
                <Field label="Voltage:">
                  <select value={form.voltage} onChange={e => setForm(f => ({ ...f, voltage: +e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono">
                    <option value={400}>400 kV</option>
                    <option value={220}>220 kV</option>
                    <option value={110}>110 kV</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude (°N):">
                  <input type="number" step="0.001" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: +e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </Field>
                <Field label="Longitude (°E):">
                  <input type="number" step="0.001" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: +e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </Field>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <button onClick={deploy}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition">
                Deploy into District Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  )
}
