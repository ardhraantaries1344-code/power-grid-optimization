import { useState } from 'react'
import { Play, Info, Navigation, Server, Laptop } from 'lucide-react'
import { useScada } from '../../store/scadaStore'
import { AlgoType, WeightKey, AlgoResult } from '../../types/grid'
import { computeDijkstra } from '../../algorithms/dijkstra'
import { computeMST }      from '../../algorithms/kruskal'
import { computeFordFulkerson } from '../../algorithms/fordFulkerson'
import { computeTraversal }     from '../../algorithms/bfsDfs'
import { computeTarjan }        from '../../algorithms/tarjan'
import { computeCycles }        from '../../algorithms/cycleDetect'
import { computeMinCut }        from '../../algorithms/minCut'
import {
  apiSolveDijkstra,
  apiSolveKruskal,
  apiSolveMaxFlow,
  apiSolveTarjan,
  apiSolveCycles,
  apiSolveMinCut
} from '../../services/api'

const ALGO_OPTIONS: { value: AlgoType; label: string }[] = [
  { value: 'dijkstra', label: "1. Dijkstra's Shortest Path (Distance / Cost Weighted)" },
  { value: 'mst',      label: '2. Minimum Spanning Tree (MST - Kruskal Capex Minimizer)' },
  { value: 'maxflow',  label: '3. Ford–Fulkerson Algorithm (Maximum Flow in MW)' },
  { value: 'bfs_dfs',  label: '4. BFS / DFS Connectivity & Reachability' },
  { value: 'tarjan',   label: "5. Tarjan's Algorithm (Bridges & Articulation Points)" },
  { value: 'cycles',   label: '6. Undirected Cycle Detection (Ring Bus Redundancy)' },
  { value: 'mincut',   label: '7. Minimum Cut Bottleneck Analysis' },
]

const ALGO_DESC: Record<AlgoType, string> = {
  dijkstra: "Finds the optimal path between substations using Distance (km) or CAPEX Cost (₹ Lakhs) as weights.",
  mst:      "Kruskal MST identifies the minimum-cost connection tree linking all facilities without redundant loops.",
  maxflow:  "Ford–Fulkerson (Edmonds–Karp) calculates maximum MW transfer from Source to Destination.",
  bfs_dfs:  "BFS/DFS traversal examines network connectivity and isolates blackout islands.",
  tarjan:   "Tarjan's finds critical transmission bridges and articulation substations (N-1 single points of failure).",
  cycles:   "Cycle Detection identifies closed ring buses that provide backup feeding redundancy.",
  mincut:   "Min-Cut identifies bottleneck lines whose removal completely partitions Source and Destination.",
}

export default function AlgorithmsTab() {
  const { nodes, edges, setCurrentResult } = useScada()
  const [algo, setAlgo]         = useState<AlgoType>('dijkstra')
  const [weight, setWeight]     = useState<WeightKey>('distance')
  const [source, setSource]     = useState('PS_NER')
  const [target, setTarget]     = useState('CT_MET')
  const [badge, setBadge]       = useState<'Ready'|'Optimal'|'Unsolvable'>('Ready')
  const [summary, setSummary]   = useState('Click Compute to calculate the route.')
  const [metrics, setMetrics]   = useState<React.ReactNode>(null)
  const [engineUsed, setEngineUsed] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const nodeName = (id: string) => nodes.find(n => n.id === id)?.name ?? id

  async function run() {
    setLoading(true)
    let res: AlgoResult
    let usedPython = false

    try {
      // 1. Try Python FastAPI NetworkX solver first
      if (algo === 'dijkstra') {
        res = await apiSolveDijkstra(nodes, edges, source, target, weight)
        usedPython = true
      } else if (algo === 'mst') {
        res = await apiSolveKruskal(nodes, edges)
        usedPython = true
      } else if (algo === 'maxflow') {
        res = await apiSolveMaxFlow(nodes, edges, source, target)
        usedPython = true
      } else if (algo === 'tarjan') {
        res = await apiSolveTarjan(nodes, edges)
        usedPython = true
      } else if (algo === 'cycles') {
        res = await apiSolveCycles(nodes, edges)
        usedPython = true
      } else if (algo === 'mincut') {
        res = await apiSolveMinCut(nodes, edges, source, target)
        usedPython = true
      } else {
        res = computeTraversal(nodes, edges, source, true)
      }
    } catch {
      // 2. Graceful fallback to client-side TS algorithms
      usedPython = false
      if (algo === 'dijkstra')  res = computeDijkstra(nodes, edges, source, target, weight)
      else if (algo === 'mst')  res = computeMST(nodes, edges)
      else if (algo === 'maxflow') res = computeFordFulkerson(nodes, edges, source, target)
      else if (algo === 'bfs_dfs') res = computeTraversal(nodes, edges, source, true)
      else if (algo === 'tarjan')  res = computeTarjan(nodes, edges)
      else if (algo === 'cycles')  res = computeCycles(nodes, edges)
      else res = computeMinCut(nodes, edges, source, target)
    } finally {
      setLoading(false)
    }

    setEngineUsed(usedPython ? 'Python NetworkX (FastAPI)' : 'Browser Engine (TypeScript)')

    if (res.error) {
      setBadge('Unsolvable')
      setSummary(res.error)
      setMetrics(null)
      setCurrentResult(null)
      return
    }

    setBadge('Optimal')
    setSummary(res.explanation)
    setCurrentResult(res)

    if (algo === 'dijkstra') {
      setMetrics(
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <Card label="ROUTE CAPEX"     value={`₹ ${res.totalCost} Lakhs`}  color="text-emerald-400" />
          <Card label="ROUTE DISTANCE"  value={`${res.totalDistance} km`}    color="text-sky-400" />
          <div className="col-span-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">CORRIDOR HOPS ({res.selectedNodes.length} STATIONS)</span>
            <span className="text-emerald-300 font-mono text-[11px] leading-relaxed">{res.selectedNodes.map(nodeName).join(' → ')}</span>
          </div>
        </div>
      )
    } else if (algo === 'mst') {
      setMetrics(
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <Card label="MST MINIMUM COST" value={`₹ ${res.totalCostLakhs?.toFixed(1)} Lakhs`}  color="text-emerald-400" />
          <Card label="TOTAL ROUTE"      value={`${res.totalDistKm} km`}                       color="text-sky-400" />
          <div className="col-span-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">CAPEX BUDGET SAVINGS</span>
            <span className="text-emerald-300 font-bold text-sm">₹ {res.savedLakhs?.toFixed(1)} Lakhs ({Math.round(((res.savedLakhs??0)/(res.fullGridCost??1))*100)}% Saved)</span>
          </div>
        </div>
      )
    } else if (algo === 'maxflow') {
      setMetrics(
        <div className="pt-1 font-mono text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 col-span-2">
            <span className="text-slate-400 block text-[10px]">MAXIMUM TRANSFER CAPACITY</span>
            <span className="text-purple-400 font-bold text-base">{res.maxFlowMW?.toLocaleString('en-IN')} MW</span>
          </div>
        </div>
      )
    } else if (algo === 'bfs_dfs') {
      setMetrics(
        <div className="pt-1 font-mono text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">EXPLORATION ORDER</span>
            <span className="text-slate-200 font-mono text-[11px]">{res.selectedNodes.map(nodeName).join(' → ')}</span>
          </div>
        </div>
      )
    } else if (algo === 'tarjan') {
      setMetrics(
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <Card label="CRITICAL BRIDGES"   value={String(res.bridgeCount)} color="text-rose-400" />
          <Card label="ARTICULATION SUBS"  value={String(res.apCount)}     color="text-amber-400" />
        </div>
      )
    } else if (algo === 'cycles') {
      setMetrics(
        <div className="pt-1 font-mono text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">RING BUS REDUNDANCY</span>
            <span className={`font-bold text-sm ${res.hasCycle ? 'text-emerald-400' : 'text-amber-400'}`}>
              {res.hasCycle ? 'Verified (Closed Backup Loop Exists)' : 'Radial Grid (No Closed Loops)'}
            </span>
          </div>
        </div>
      )
    } else {
      setMetrics(
        <div className="pt-1 font-mono text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">MIN-CUT CAPACITY</span>
            <span className="text-rose-400 font-bold text-base">{res.cutCapacityMW?.toLocaleString('en-IN')} MW</span>
          </div>
        </div>
      )
    }
  }

  const psNodes = nodes.filter(n => n.category === 'powerstation')
  const ssNodes = nodes.filter(n => n.category === 'substation')
  const ctNodes = nodes.filter(n => n.category === 'city')

  return (
    <div className="space-y-4">
      {/* Source / Target Selection */}
      <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-emerald-400" /> Transmission Path Endpoints
        </span>
        <p className="text-[11px] text-slate-400">Select source and destination to evaluate shortest paths, maximum flow, and cut bottlenecks.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Source (From):</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-emerald-300 text-xs">
              <optgroup label="⚡ Power Stations">{psNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
              <optgroup label="🔀 Substations">{ssNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
              <optgroup label="🏢 Cities">{ctNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Destination (To):</label>
            <select value={target} onChange={e => setTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-rose-300 text-xs">
              <optgroup label="⚡ Power Stations">{psNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
              <optgroup label="🔀 Substations">{ssNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
              <optgroup label="🏢 Cities">{ctNodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}</optgroup>
            </select>
          </div>
        </div>
        {algo === 'dijkstra' && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['distance','cost'] as WeightKey[]).map(w => (
              <label key={w} className="flex items-center space-x-2 p-2 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <input type="radio" name="weight" value={w} checked={weight===w} onChange={()=>setWeight(w)} className="text-emerald-500" />
                <span className="text-slate-300">{w==='distance' ? 'Shortest Distance (km)' : 'Lowest Cost (₹ Lakhs)'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Algorithm Selector */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Graph Algorithm</label>
        <select value={algo} onChange={e => setAlgo(e.target.value as AlgoType)}
          className="w-full mt-1.5 bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-100">
          {ALGO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Description */}
      <div className="p-3 bg-emerald-950/25 border border-emerald-800/40 rounded-xl space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
          <Info className="w-3.5 h-3.5" /> Algorithm Objective:
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{ALGO_DESC[algo]}</p>
      </div>

      {/* Run Action */}
      <div className="flex gap-2">
        <button
          onClick={run}
          disabled={loading}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {loading ? 'Solving via Graph Engine...' : 'Compute Selected Algorithm'}
        </button>
        <button
          onClick={() => {
            setCurrentResult(null)
            setBadge('Ready')
            setSummary('Simulation highlights cleared.')
            setMetrics(null)
            setEngineUsed(null)
          }}
          className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
        >
          Clear
        </button>
      </div>

      {/* Results Output */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Mathematical Solution</span>
            {engineUsed && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                {engineUsed.includes('Python') ? <Server className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                {engineUsed}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            badge === 'Optimal'    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
            badge === 'Unsolvable' ? 'bg-rose-950 text-rose-400 border-rose-800' :
            'bg-slate-800 text-slate-400 border-slate-700'}`}>{badge}</span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">{summary}</div>
        {metrics}
      </div>
    </div>
  )
}

function Card({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
      <span className="text-slate-400 block text-[10px]">{label}</span>
      <span className={`${color} font-bold text-sm`}>{value}</span>
    </div>
  )
}
