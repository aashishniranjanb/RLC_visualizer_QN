'use client'
// components/ControlPanel.tsx
// MEMBER 4 — Enhanced UI with Framer Motion and Glassmorphism

import { useRLCStore } from '@/store/rlcStore'
import { motion } from 'framer-motion'
import { Zap, Activity, Battery, Waves, RotateCcw } from 'lucide-react'

interface SliderProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
}

function Slider({ label, unit, value, min, max, step, onChange, icon: Icon, color }: SliderProps) {
  return (
    <div className="space-y-2 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
          <Icon size={14} className="opacity-70" />
          <span>{label}</span>
        </div>
        <span className="font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5" style={{ color }}>
          {value} {unit}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500" 
      />
    </div>
  )
}

export default function ControlPanel() {
  const { R, L, C, V0, setR, setL, setC, setV0 } = useRLCStore()

  const setUnderdamped = () => { setR(10); setL(0.1); setC(0.001); setV0(20) }
  const setCritical = () => { setR(20); setL(0.1); setC(1.0e-3); setV0(20) }
  const setOverdamped = () => { setR(80); setL(0.1); setC(1.0e-3); setV0(20) }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-3xl p-6 space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <Zap size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">System Controls</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Circuit Architecture</p>
        </div>
      </div>

      <div className="space-y-1">
        <Slider label="Resistance" unit="Ω" value={R} min={0.1} max={200} step={0.1} onChange={setR} icon={Activity} color="#f87171" />
        <Slider label="Inductance" unit="H" value={L} min={0.01} max={1} step={0.01} onChange={setL} icon={Waves} color="#fb923c" />
        <Slider label="Capacitance" unit="mF" value={Number((C * 1000).toFixed(1))} min={0.1} max={10} step={0.1} onChange={(v: number) => setC(v / 1000)} icon={Battery} color="#60a5fa" />
        <Slider label="Initial Voltage" unit="V" value={V0} min={1} max={100} step={1} onChange={setV0} icon={Zap} color="#34d399" />
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Damping Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          <PresetButton label="Under" onClick={setUnderdamped} color="hover:bg-blue-500/20 hover:text-blue-400" />
          <PresetButton label="Critical" onClick={setCritical} color="hover:bg-yellow-500/20 hover:text-yellow-400" />
          <PresetButton label="Over" onClick={setOverdamped} color="hover:bg-red-500/20 hover:text-red-400" />
        </div>
      </div>

      <button 
        onClick={() => { setR(10); setL(0.1); setC(0.001); setV0(10); }}
        className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
      >
        <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
        Factory Reset
      </button>
    </motion.div>
  )
}

function PresetButton({ label, onClick, color }: { label: string, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${color}`}
    >
      {label}
    </button>
  )
}
