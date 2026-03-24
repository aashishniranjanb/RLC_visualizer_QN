'use client'
// app/page.tsx
// MEMBER 4 — Main Layout + Integration

import dynamic from 'next/dynamic'
import ControlPanel from '@/components/ControlPanel'
import MetricsPanel from '@/components/MetricsPanel'
import PlotPanel from '@/components/PlotPanel'
import QuantumPanel from '@/components/QuantumPanel'

// Three.js MUST be dynamically imported — no SSR
const ThreeScene = dynamic(() => import('@/components/ThreeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl flex items-center justify-center"
      style={{ background: '#0a0a0f', border: '1px solid #1e293b' }}>
      <p className="text-gray-600 text-sm animate-pulse">Loading 3D Scene…</p>
    </div>
  )
})

export default function Home() {
  return (
    <main className="min-h-screen text-white p-4 md:p-6"
      style={{ background: 'linear-gradient(160deg, #030712 0%, #0a0f1e 50%, #050a0f 100%)' }}>

      {/* ━━ Header ━━ */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ background: 'linear-gradient(90deg, #60a5fa, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚡ RLC Ring-Down Energy Visualizer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Interactive transient decay simulation · Classical ↔ Quantum Analog · QTHack04
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
          <span className="px-2 py-1 rounded-full"
            style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
            SRMIST · Team QN
          </span>
        </div>
      </header>

      {/* ━━ 3-column grid ━━ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* LEFT: Controls + Quantum */}
        <div className="md:col-span-3 space-y-4">
          <ControlPanel />
          <QuantumPanel />
        </div>

        {/* CENTER: 3D Scene + Plots */}
        <div className="md:col-span-6 space-y-4">
          <ThreeScene />
          <PlotPanel />
        </div>

        {/* RIGHT: Metrics */}
        <div className="md:col-span-3">
          <MetricsPanel />
        </div>
      </div>

      {/* ━━ Footer ━━ */}
      <footer className="mt-8 pt-4 text-center text-gray-700 text-xs"
        style={{ borderTop: '1px solid #1e293b' }}>
        RLC Ring-Down Visualizer · Physics: RK4 Integration · 3D: React Three Fiber · QTHack04
      </footer>
    </main>
  )
}
