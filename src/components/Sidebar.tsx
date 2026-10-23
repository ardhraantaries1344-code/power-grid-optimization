import { useState } from 'react'
import { Cpu, GitCompare, Layers, BarChart2, Wrench } from 'lucide-react'
import AlgorithmsTab from './tabs/AlgorithmsTab'
import CompareTab from './tabs/CompareTab'
import AssetsTab from './tabs/AssetsTab'
import ChartTab from './tabs/ChartTab'
import ToolsTab from './tabs/ToolsTab'

type Tab = 'algorithms' | 'compare' | 'assets' | 'chart' | 'tools'

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'algorithms', label: 'Solvers',     Icon: Cpu },
  { id: 'compare',   label: 'Comparison',  Icon: GitCompare },
  { id: 'assets',    label: 'Assets',      Icon: Layers },
  { id: 'chart',     label: 'Bar Graph',   Icon: BarChart2 },
  { id: 'tools',     label: 'Tools',       Icon: Wrench },
]

export default function Sidebar() {
  const [active, setActive] = useState<Tab>('algorithms')

  return (
    <aside className="w-[430px] bg-slate-900/95 border-r border-slate-800 flex flex-col z-20 shrink-0 backdrop-blur shadow-2xl">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1 transition ${
              active === id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {active === 'algorithms' && <AlgorithmsTab />}
        {active === 'compare'   && <CompareTab />}
        {active === 'assets'    && <AssetsTab />}
        {active === 'chart'     && <ChartTab />}
        {active === 'tools'     && <ToolsTab />}
      </div>
    </aside>
  )
}
