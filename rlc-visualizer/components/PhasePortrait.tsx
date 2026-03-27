'use client'
// components/PhasePortrait.tsx
// MEMBER 3 — State-Space Analysis
// Visualization of the V(t) vs I(t) trajectory (Phase Portrait).

import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts'
import { useRLCStore } from '@/store/rlcStore'
import { useMemo } from 'react'
import { Target } from 'lucide-react'

export default function PhasePortrait() {
  const { result, timeIndex, oscMode } = useRLCStore()

  const data = useMemo(() => {
    // Downsample for the trajectory line
    const step = Math.max(1, Math.floor(result.t.length / 150))
    return result.t.filter((_, i) => i % step === 0).map((_, j) => ({
      x: parseFloat((result.V[j * step] ?? 0).toFixed(4)),
      y: parseFloat((result.I[j * step] ?? 0).toFixed(4))
    }))
  }, [result])

  const currentPoint = useMemo(() => [{
    x: parseFloat((result.V[timeIndex] ?? 0).toFixed(4)),
    y: parseFloat((result.I[timeIndex] ?? 0).toFixed(4))
  }], [result, timeIndex])

  const theme = oscMode ? {
    stroke: "#22c55e",
    text: "#22c55e",
    grid: "rgba(34, 197, 94, 0.1)",
    dot: "#ef4444"
  } : {
    stroke: "#3b82f6",
    text: "rgba(255,255,255,0.3)",
    grid: "rgba(255,255,255,0.03)",
    dot: "#f87171"
  }

  return (
    <div className="p-5 rounded-3xl border border-white/5 shadow-xl glass h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <Target size={14} className="text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Phase Portrait (V vs I)</h3>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis 
                type="number" 
                dataKey="x" 
                name="Voltage" 
                unit="V" 
                tick={{fontSize: 8, fill: theme.text}} 
                axisLine={false} 
                tickLine={false}
                domain={['auto', 'auto']}
            />
            <YAxis 
                type="number" 
                dataKey="y" 
                name="Current" 
                unit="A" 
                tick={{fontSize: 8, fill: theme.text}} 
                axisLine={false} 
                tickLine={false}
                domain={['auto', 'auto']}
            />
            <ZAxis type="number" range={[1, 1]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '9px' }}
            />
            {/* Trajectory line */}
            <Scatter 
                data={data} 
                line={{ stroke: theme.stroke, strokeWidth: 1.5, opacity: 0.6 }} 
                shape={() => null} 
                isAnimationActive={false}
            />
            {/* Current state indicator */}
            <Scatter 
                data={currentPoint} 
                fill={theme.dot} 
                shape="circle" 
                isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
