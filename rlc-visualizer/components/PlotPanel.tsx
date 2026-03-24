'use client'
// components/PlotPanel.tsx
// MEMBER 3 — 2D Charts: Voltage and Energy over time

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useRLCStore } from '@/store/rlcStore'
import { useMemo } from 'react'

export default function PlotPanel() {
  const { result } = useRLCStore()

  // Downsample to 200 points for smooth rendering performance
  const step = Math.max(1, Math.floor(result.t.length / 200))
  const data = useMemo(() =>
    result.t.filter((_, i) => i % step === 0).map((t, j) => ({
      t: parseFloat(t.toFixed(4)),
      voltage: parseFloat((result.V[j * step] ?? 0).toFixed(4)),
      E_cap: parseFloat((result.E_cap[j * step] ?? 0).toFixed(6)),
      E_ind: parseFloat((result.E_ind[j * step] ?? 0).toFixed(6)),
      E_total: parseFloat((result.E_total[j * step] ?? 0).toFixed(6)),
      envelope: parseFloat((result.envelope[j * step] ?? 0).toFixed(4)),
    })),
    [result]
  )

  const gridColor = '#1f2937'
  const tickStyle = { fill: '#6b7280', fontSize: 10 }
  const tooltipStyle = { background: '#111827', border: '1px solid #374151', color: '#e5e7eb', fontSize: 11 }

  return (
    <div className="space-y-3">
      {/* ── Voltage vs Time ── */}
      <div className="rounded-xl p-3" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          Voltage V(t) with Envelope
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="2 4" />
            <XAxis dataKey="t" tick={tickStyle} label={{ value: 't (s)', fill: '#4b5563', fontSize: 10, position: 'insideBottomRight', offset: -4 }} />
            <YAxis tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            <Line type="monotone" dataKey="voltage" stroke="#60a5fa" dot={false} strokeWidth={2} name="V(t)" />
            <Line type="monotone" dataKey="envelope" stroke="#fbbf24" dot={false} strokeWidth={1.5} strokeDasharray="6 3" name="Envelope" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Energy Decay ── */}
      <div className="rounded-xl p-3" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Energy Decay (Cap / Ind / Total)
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="2 4" />
            <XAxis dataKey="t" tick={tickStyle} label={{ value: 't (s)', fill: '#4b5563', fontSize: 10, position: 'insideBottomRight', offset: -4 }} />
            <YAxis tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            <Line type="monotone" dataKey="E_cap" stroke="#3b82f6" dot={false} strokeWidth={2} name="E_cap (J)" />
            <Line type="monotone" dataKey="E_ind" stroke="#f97316" dot={false} strokeWidth={2} name="E_ind (J)" />
            <Line type="monotone" dataKey="E_total" stroke="#10b981" dot={false} strokeWidth={2} name="E_total (J)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
