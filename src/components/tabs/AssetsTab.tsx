import { useScada } from '../../store/scadaStore'
import { GridNode } from '../../types/grid'

export default function AssetsTab() {
  const { nodes } = useScada()
  const ps = nodes.filter(n => n.category === 'powerstation')
  const ss = nodes.filter(n => n.category === 'substation')
  const ct = nodes.filter(n => n.category === 'city')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 bg-sky-950/40 border border-sky-800/50 rounded-xl">
          <span className="text-sky-400 font-bold text-sm block">{ps.length}</span>
          <span className="text-[10px] text-slate-400">Power Stations</span>
        </div>
        <div className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
          <span className="text-slate-300 font-bold text-sm block">{ss.length}</span>
          <span className="text-[10px] text-slate-400">Substations</span>
        </div>
        <div className="p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-xl">
          <span className="text-rose-400 font-bold text-sm block">{ct.length}</span>
          <span className="text-[10px] text-slate-400">Cities / Loads</span>
        </div>
      </div>

      <Section title="⚡ Power Stations (Generation)" nodes={ps} color="text-sky-400" />
      <Section title="🔀 Transmission Substations"     nodes={ss} color="text-slate-300" />
      <Section title="🏢 Cities & Demand Centers"      nodes={ct} color="text-rose-400" />
    </div>
  )
}

function Section({ title, nodes, color }: { title: string; nodes: GridNode[]; color: string }) {
  return (
    <div className="space-y-2">
      <span className={`font-bold ${color} text-xs block border-b border-slate-800 pb-1`}>{title}</span>
      <div className="space-y-1.5 text-xs">
        {nodes.map((n: GridNode) => (
          <div key={n.id} className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-600 transition">
            <div>
              <span className="font-semibold text-white block">{n.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{n.id} • {n.voltage} kV</span>
            </div>
            <div className="text-right font-mono text-xs">
              {n.mw !== 0
                ? <span className={n.mw > 0 ? 'text-sky-400 font-bold' : 'text-rose-400 font-bold'}>{Math.abs(n.mw)} MW</span>
                : <span className="text-slate-400">Switching</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
