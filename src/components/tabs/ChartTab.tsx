import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Legend, Tooltip } from 'chart.js'
import { useScada } from '../../store/scadaStore'
import { BarChart2 } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip)

export default function ChartTab() {
  const { edges } = useScada()
  const top = edges.slice(0, 8)

  const data = {
    labels: top.map(e => e.id.replace('TL_', '')),
    datasets: [
      { label: 'Active Load (MW)',    data: top.map(e => e.tripped ? 0 : e.loadMW),  backgroundColor: '#10b981', borderRadius: 4 },
      { label: 'Thermal Rating (MW)', data: top.map(e => e.capacity),                backgroundColor: '#334155', borderRadius: 4 },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 9, family: 'JetBrains Mono' } }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.4)' } },
    },
  } as const

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-400" /> Corridor Loading vs Thermal Limit
          </span>
          <span className="text-[10px] font-mono text-slate-400">Live (MW)</span>
        </div>
        <div className="h-64 w-full pt-2">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  )
}
