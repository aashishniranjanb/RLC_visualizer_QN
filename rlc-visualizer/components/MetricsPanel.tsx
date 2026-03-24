'use client'
// components/MetricsPanel.tsx
// MEMBER 3 — Derived parameters display: ζ, Q, α, τ, mode, loss%

import { useRLCStore } from '@/store/rlcStore'

const modeConfig = {
  underdamped: { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800', label: 'UNDERDAMPED', icon: '〜' },
  critical:    { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', label: 'CRITICAL', icon: '─' },
  overdamped:  { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', label: 'OVERDAMPED', icon: '↘' },
}

function MetricCard({ label, value, color = 'text-white', sub = '' }: {
  label: string; value: string; color?: string; sub?: string
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export default function MetricsPanel() {
  const { result, quantumMode } = useRLCStore()
  const { zeta, Q, alpha, tau, mode, loss_percent, E_initial, T1_analog, omega0 } = result

  const cfg = modeConfig[mode]

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">System Metrics</h2>

      {/* Mode badge — full width */}
      <div className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border} flex items-center justify-between`}>
        <div>
          <p className="text-gray-500 text-xs mb-0.5">Damping Mode</p>
          <p className={`font-bold text-sm ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </p>
        </div>
        <div className={`w-8 h-8 rounded-full border-2 ${cfg.border} flex items-center justify-center`}>
          <span className={`text-lg ${cfg.color}`}>{cfg.icon}</span>
        </div>
      </div>

      {/* 2×3 grid metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Damping Ratio ζ" value={zeta.toFixed(3)}
          color={zeta < 0.999 ? 'text-blue-400' : zeta <= 1.001 ? 'text-yellow-400' : 'text-red-400'} />
        <MetricCard label="Quality Factor Q" value={Q.toFixed(2)}
          sub={Q > 1 ? 'Resonant' : 'Lossy'} />
        <MetricCard label="Damping Coeff α" value={alpha.toFixed(2) + ' s⁻¹'} color="text-purple-400" />
        <MetricCard label="Time Constant τ" value={tau.toFixed(4) + ' s'} color="text-cyan-400" />
        <MetricCard label="Natural Freq ω₀" value={omega0.toFixed(2) + ' r/s'} color="text-green-400" />
        <MetricCard label="Energy Lost" value={loss_percent.toFixed(1) + '%'} color="text-red-400"
          sub={'Initial: ' + E_initial.toFixed(4) + ' J'} />
      </div>

      {/* Quantum Analog section */}
      {quantumMode && (
        <div className="rounded-xl p-3" style={{ background: '#0f0d2a', border: '1px solid #3730a3' }}>
          <p className="text-indigo-400 text-xs font-semibold mb-2">⚛ Quantum Analog Active</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">T₁ Relaxation Analog</span>
              <span className="font-mono text-indigo-300">{T1_analog.toFixed(4)} s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Decay Rate (1/T₁ = α)</span>
              <span className="font-mono text-indigo-300">{alpha.toFixed(3)} s⁻¹</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Qubit state |e⟩ prob</span>
              <span className="font-mono text-indigo-300">{(100 - loss_percent).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-indigo-600 text-xs mt-2 leading-relaxed">
            α = {alpha.toFixed(3)} s⁻¹ maps to 1/T₁ in qubit decoherence
          </p>
        </div>
      )}
    </div>
  )
}
