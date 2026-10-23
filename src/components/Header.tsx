import { useEffect, useState } from 'react'
import { Network, RotateCcw, ExternalLink, Activity } from 'lucide-react'
import { useScada } from '../store/scadaStore'
import { checkBackendHealth, fetchLiveTelemetry } from '../services/api'

export default function Header({ searchRef }: { searchRef: React.RefObject<((q: string) => void) | null> }) {
  const { telemetry, reset } = useScada()
  const { totalGen, totalLoad, deficit, totalCapexLakhs } = telemetry
  const [backendOnline, setBackendOnline] = useState<boolean>(false)
  const [frequency, setFrequency] = useState<number>(50.000)

  useEffect(() => {
    let isMounted = true

    const pollStatus = async () => {
      const isUp = await checkBackendHealth()
      if (isMounted) setBackendOnline(isUp)

      if (isUp) {
        const live = await fetchLiveTelemetry()
        if (isMounted && live) {
          setFrequency(live.frequency_hz)
        }
      } else {
        // Fallback simulation fluctuation
        if (isMounted) {
          setFrequency(+(50.0 + (Math.random() * 0.04 - 0.02)).toFixed(3))
        }
      }
    }

    pollStatus()
    const interval = setInterval(pollStatus, 3000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-5 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Engine Badge */}
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-white font-mono">
              ERNAKULAM <span className="text-emerald-400">GRAPH-OPTIMIZER</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MITS KOCHI • {frequency.toFixed(3)} Hz
            </span>

            {/* FastAPI Status Pill */}
            {backendOnline ? (
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                title="Click to open Swagger API Documentation"
                className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono font-semibold flex items-center gap-1 hover:bg-sky-500/25 transition cursor-pointer"
              >
                <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                PYTHON FASTAPI (ONLINE)
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            ) : (
              <span
                title="FastAPI server offline; running on in-browser engine"
                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-semibold"
              >
                ENGINE: BROWSER TS
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Power Grid SCADA & Optimization Suite (Ernakulam District)</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search station, substation or city..."
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          onChange={e => searchRef.current?.(e.target.value)}
        />
      </div>

      {/* District Telemetry */}
      <div className="flex items-center space-x-5 text-xs font-mono">
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-lg flex items-center gap-3">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-semibold">Total Generation</span>
            <span className="font-bold text-sky-400 text-sm">{totalGen.toLocaleString('en-IN')} MW</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-semibold">District Demand</span>
            <span className="font-bold text-rose-400 text-sm">{totalLoad.toLocaleString('en-IN')} MW</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-semibold">Net Deficit</span>
            <span className="font-bold text-amber-400 text-sm">{deficit.toLocaleString('en-IN')} MW</span>
          </div>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-semibold">Full Grid Capex</span>
          <span className="font-bold text-emerald-400 text-sm">₹ {totalCapexLakhs.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs</span>
        </div>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition flex items-center gap-1.5 font-sans font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </header>
  )
}
