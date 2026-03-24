'use client'
// components/ControlPanel.tsx
// MEMBER 4 — R, L, C, V₀ slider controls

import { useRLCStore } from '@/store/rlcStore'

interface SliderProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  display?: string
  onChange: (v: number) => void
  color?: string
}

function Slider({ label, unit, value, min, max, step, display, onChange, color = '#60a5fa' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="font-mono" style={{ color }}>
          {display ?? value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full outline-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #1f2937 ${pct}%, #1f2937 100%)`,
          accentColor: color,
        }}
      />
      <div className="flex justify-between text-gray-700 text-xs">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function ControlPanel() {
  const { R, L, C, V0, setR, setL, setC, setV0 } = useRLCStore()

  // Display C in mF
  const C_mF = parseFloat((C * 1000).toFixed(2))

  return (
    <div className="rounded-2xl p-4 space-y-5" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Circuit Parameters</h2>

      <Slider
        label="Resistance"
        unit="Ω"
        value={R}
        min={0.1}
        max={200}
        step={0.1}
        display={R.toFixed(1)}
        onChange={setR}
        color="#f87171"
      />
      <Slider
        label="Inductance"
        unit="H"
        value={L}
        min={0.01}
        max={1}
        step={0.01}
        display={L.toFixed(2)}
        onChange={setL}
        color="#fb923c"
      />
      <Slider
        label="Capacitance"
        unit="mF"
        value={C_mF}
        min={0.1}
        max={10}
        step={0.1}
        display={C_mF.toFixed(1)}
        onChange={(v) => setC(v / 1000)}
        color="#60a5fa"
      />
      <Slider
        label="Initial Voltage"
        unit="V"
        value={V0}
        min={1}
        max={100}
        step={1}
        onChange={setV0}
        color="#34d399"
      />

      {/* Quick presets */}
      <div className="space-y-2">
        <p className="text-gray-600 text-xs">Quick Presets</p>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => { setR(10); setL(0.1); setC(0.001); setV0(10) }}
            className="text-xs rounded-lg py-1.5 font-medium transition-all hover:brightness-125"
            style={{ background: '#1e3a5f', color: '#60a5fa', border: '1px solid #1e40af' }}
          >
            Under
          </button>
          <button
            onClick={() => { setR(63.2); setL(0.1); setC(0.001); setV0(10) }}
            className="text-xs rounded-lg py-1.5 font-medium transition-all hover:brightness-125"
            style={{ background: '#2d2000', color: '#facc15', border: '1px solid #854d0e' }}
          >
            Critical
          </button>
          <button
            onClick={() => { setR(200); setL(0.1); setC(0.001); setV0(10) }}
            className="text-xs rounded-lg py-1.5 font-medium transition-all hover:brightness-125"
            style={{ background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d' }}
          >
            Over
          </button>
        </div>
      </div>
    </div>
  )
}
