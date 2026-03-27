'use client'
// components/ComparePanel.tsx
// MEMBER 4 — Comparative Circuit Analysis
// Allows users to compare two independent RLC configurations side-by-side.

import { useState, useMemo } from 'react'
import { solveRLC } from '@/lib/physics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Scale } from 'lucide-react'

const PRESETS = {
  'Underdamped': { R: 10, L: 0.1, C: 0.001, V0: 10 },
  'Critical':    { R: 63.2, L: 0.1, C: 0.001, V0: 10 },
  'Overdamped':  { R: 150, L: 0.1, C: 0.001, V0: 10 },
  'High Q':      { R: 2, L: 0.1, C: 0.001, V0: 10 },
  'Low Q':       { R: 100, L: 0.1, C: 0.001, V0: 10 },
}

export default function ComparePanel() {
  const [presetA, setPresetA] = useState('Underdamped')
  const [presetB, setPresetB] = useState('Overdamped')

  const pA = PRESETS[presetA as keyof typeof PRESETS]
  const pB = PRESETS[presetB as keyof typeof PRESETS]
  
  const rA = useMemo(() => solveRLC(pA.R, pA.L, pA.C, pA.V0), [pA.R, pA.L, pA.C, pA.V0])
  const rB = useMemo(() => solveRLC(pB.R, pB.L, pB.C, pB.V0), [pB.R, pB.L, pB.C, pB.V0])

  const combinedData = useMemo(() => {
    const step = Math.max(1, Math.floor(rA.t.length / 150))
    return rA.t.filter((_, i) => i % step === 0).map((t, j) => ({
      t: parseFloat(t.toFixed(4)),
      A: parseFloat((rA.V[j * step] ?? 0).toFixed(3)),
      B: parseFloat((rB.V[j * step] ?? 0).toFixed(3)),
    }))
  }, [rA, rB])

  return (
    <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Scale size={18} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Compare Modes</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['A', 'B'] as const).map((side) => (
          <div key={side} className="space-y-1.5">
            <span className={`text-[9px] font-black uppercase tracking-widest ${side === 'A' ? 'text-blue-400' : 'text-orange-400'}`}>
                Configuration {side}
            </span>
            <select
              value={side === 'A' ? presetA : presetB}
              onChange={(e) => side === 'A' ? setPresetA(e.target.value) : setPresetB(e.target.value)}
              className="w-full bg-gray-900 text-white text-[11px] font-bold rounded-xl px-3 py-2 border border-white/10 outline-none transition-all focus:border-blue-500/50"
            >
              {Object.keys(PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="h-40 w-full bg-black/20 rounded-2xl p-2 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="t" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
            />
            <Line type="monotone" dataKey="A" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="B" stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
            <p className="text-blue-400 font-black uppercase tracking-widest">{presetA}</p>
            <div className="flex justify-between text-gray-500 font-bold">
                <span>ζ Ratio</span> <span>{rA.zeta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold">
                <span>Q Factor</span> <span>{rA.Q.toFixed(1)}</span>
            </div>
        </div>
        <div className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-1">
            <p className="text-orange-400 font-black uppercase tracking-widest">{presetB}</p>
            <div className="flex justify-between text-gray-500 font-bold">
                <span>ζ Ratio</span> <span>{rB.zeta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold">
                <span>Q Factor</span> <span>{rB.Q.toFixed(1)}</span>
            </div>
        </div>
      </div>
    </div>
  )
}
