'use client'
// components/PlotPanel.tsx
// MEMBER 3 — Phase 2: Enhanced Plotting, Export & Oscilloscope Skin

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts'
import { useRLCStore } from '@/store/rlcStore'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart as ChartIcon, FileText, Camera } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function PlotPanel() {
  const { result, timeIndex, oscMode } = useRLCStore()

  const data = useMemo(() => {
    // Dynamic sampling for performance while maintaining resolution
    const step = Math.max(1, Math.floor(result.t.length / 200))
    return result.t.filter((_, i) => i % step === 0).map((t, j) => ({
      t: parseFloat(t.toFixed(4)),
      voltage: parseFloat((result.V[j * step] ?? 0).toFixed(4)),
      E_cap: parseFloat((result.E_cap[j * step] ?? 0).toFixed(6)),
      E_ind: parseFloat((result.E_ind[j * step] ?? 0).toFixed(6)),
      E_total: parseFloat((result.E_total[j * step] ?? 0).toFixed(6)),
      envelope: parseFloat((result.envelope[j * step] ?? 0).toFixed(4)),
    }))
  }, [result])

  const currentTime = result.t[timeIndex] || 0

  const theme = oscMode ? {
    grid: "rgba(34, 197, 94, 0.1)",
    text: "#22c55e",
    signal: "#22c55e",
    envelope: "rgba(34, 197, 94, 0.3)",
    bg: "bg-black border-green-500/30",
    tooltip: { bg: "#052e16", border: "#22c55e" }
  } : {
    grid: "rgba(255,255,255,0.03)",
    text: "rgba(255,255,255,0.3)",
    signal: "#3b82f6",
    envelope: "#f59e0b",
    bg: "glass border-white/5",
    tooltip: { bg: "#0f172a", border: "rgba(255,255,255,0.1)" }
  }

  const exportPNG = async (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const canvas = await html2canvas(el, { backgroundColor: oscMode ? '#000' : '#030712' })
    const link = document.createElement('a')
    link.download = `rlc-analysis-${id}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const exportCSV = () => {
    const headers = ['Time (s)', 'Voltage (V)', 'E_cap (J)', 'E_ind (J)']
    const rows = result.t.map((t, i) => [t, result.V[i], result.E_cap[i], result.E_ind[i]].join(','))
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rlc-data.csv'
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${oscMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'}`}>
            <ChartIcon size={20} />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${oscMode ? 'text-green-400' : 'text-white'}`}>
              Waveform Analysis {oscMode && '[SCANNED]'}
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Real-time Oscillatory Decay</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 border border-white/5 transition-colors">
            <FileText size={16} />
          </button>
          <button onClick={() => exportPNG('waveform-container')} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 border border-white/5 transition-colors">
            <Camera size={16} />
          </button>
        </div>
      </div>

      <motion.div 
        id="waveform-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme.bg} rounded-[2rem] p-6 space-y-4 border shadow-2xl relative overflow-hidden`}
      >
        <div className="flex justify-between items-center px-1">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${oscMode ? 'text-green-500/60' : 'text-gray-500'}`}>
            Voltage Transients
          </span>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-[0.15em]">
            <span className={`flex items-center gap-1.5`} style={{ color: theme.signal }}>● Signal</span>
            <span className={`flex items-center gap-1.5`} style={{ color: theme.envelope }}>● Envelope</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.signal} stopOpacity={oscMode ? 0.4 : 0.2}/>
                <stop offset="95%" stopColor={theme.signal} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
            <XAxis dataKey="t" tick={{fontSize: 9, fill: theme.text, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 9, fill: theme.text, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: theme.tooltip.bg, border: `1px solid ${theme.tooltip.border}`, borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
            <ReferenceLine x={parseFloat(currentTime.toFixed(4))} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3 label" />
            <Area type="monotone" dataKey="voltage" stroke={theme.signal} strokeWidth={2.5} fillOpacity={1} fill="url(#colorWave)" isAnimationActive={false} />
            <Line type="monotone" dataKey="envelope" stroke={theme.envelope} strokeWidth={1.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${theme.bg} rounded-[2rem] p-6 space-y-4 border shadow-2xl`}
      >
        <div className="flex justify-between items-center px-1">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${oscMode ? 'text-green-500/60' : 'text-gray-500'}`}>
            Energy Reservoir Status
          </span>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-[0.15em]">
            <span className="text-blue-500">Cap</span>
            <span className="text-orange-500">Ind</span>
            <span className="text-emerald-500">Net</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis dataKey="t" tick={{fontSize: 9, fill: theme.text}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 8, fill: theme.text}} axisLine={false} tickLine={false} />
            <ReferenceLine x={parseFloat(currentTime.toFixed(4))} stroke="#ef4444" strokeWidth={1} />
            <Line type="monotone" dataKey="E_cap" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="E_ind" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="E_total" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
