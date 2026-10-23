import { useRef, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'

export default function App() {
  const searchFnRef = useRef<((q: string) => void) | null>(null)

  const handleSearchRef = useCallback((fn: (q: string) => void) => {
    searchFnRef.current = fn
  }, [])

  return (
    <div className="bg-[#050811] text-slate-100 h-screen flex flex-col overflow-hidden select-none">
      <Header searchRef={searchFnRef} />
      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar />
        <MapView onSearchRef={handleSearchRef} />
      </div>
    </div>
  )
}
