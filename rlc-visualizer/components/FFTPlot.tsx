'use client'
// components/FFTPlot.tsx
// MEMBER 3 — Frequency Domain Analysis
// Visualization of the RLC circuit's frequency spectrum using FFT.

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useRLCStore } from '@/store/rlcStore'
import { useMemo } from 'react'
import { Activity } from 'lucide-react'

export default function FFTPlot() {
  const { result, oscMode } = useRLCStore()

  const data = useMemo(() => {
    // Return first 200 points to focus on the interesting low-frequency part
    // Usually peaks are at low frequencies for these RLC values
    return result.fftFrequencies.slice(0, 200).map((f, i) => ({
      f: parseFloat(f.toFixed(1)),
      mag: parseFloat(result.fftMagnitudes[i].toFixed(6))
    }))
  }, [result])

  const peakFreq = useMemo(() => {
    let maxMag = 0
    let freq = 0
    for (let i = 0; i < result.fftMagnitudes.length; i++) {
        if (result.fftMagnitudes[i] > maxMag) {
            maxMag = result.fftMagnitudes[i]
            freq = result.fftFrequencies[i]
        }
    }
    return freq
  }, [result])

  const theme = oscMode ? {
    stroke: "#22c55e",
    fill: "rgba(34, 197, 94, 0.2)",
    text: "#22c55e",
    grid: "rgba(34, 197, 94, 0.1)"
  } : {
    stroke: "#a855f7",
    fill: "rgba(168, 85, 247, 0.2)",
    text: "rgba(255,255,255,0.3)",
    grid: "rgba(255,255,255,0.03)"
  }

  return (
    <div className={`p-5 rounded-3xl border border-white/5 shadow-xl glass h-full flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <Activity size={14} className="text-purple-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Frequency Spectrum (FFT)</h3>
        </div>
        <div className="text-[9px] font-bold text-gray-500">
            PEAK: <span className="text-purple-400">{peakFreq.toFixed(1)} Hz</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFFT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.stroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis dataKey="f" tick={{fontSize: 8, fill: theme.text}} axisLine={false} tickLine={false} unit="Hz" />
            <YAxis tick={{fontSize: 8, fill: theme.text}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '9px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
                type="monotone" 
                dataKey="mag" 
                stroke={theme.stroke} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorFFT)" 
                isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
