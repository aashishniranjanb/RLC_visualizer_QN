'use client'
// components/QuantumPanel.tsx
// MEMBER 4 — Quantum Analogy toggle and visual indicator

import { useRLCStore } from '@/store/rlcStore'

export default function QuantumPanel() {
  const { quantumMode, toggleQuantumMode, result } = useRLCStore()
  const { alpha, loss_percent, T1_analog } = result

  const coherence = Math.max(0, 100 - loss_percent)
  const radius = Math.max(6, 40 * (coherence / 100))

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">⚛ Quantum Mode</h2>
        <button
          onClick={toggleQuantumMode}
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none"
          style={{ background: quantumMode ? '#4f46e5' : '#374151' }}
        >
          <span
            className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: quantumMode ? 'translateX(1.125rem)' : 'translateX(0.1875rem)' }}
          />
        </button>
      </div>

      {quantumMode ? (
        <div className="space-y-3">
          {/* Analogy table */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: '#0f0d2a', border: '1px solid #3730a3' }}>
            <p className="text-indigo-400 text-xs font-semibold">RLC ↔ Qubit Mapping</p>
            {[
              ['α', '1/T₁', 'Decay rate'],
              ['R', 'γ', 'Env. coupling'],
              ['τ', 'T₁', 'Relaxation time'],
              ['e⁻ᵅᵗ', '|ψ(t)|²', 'State probability'],
            ].map(([left, right, hint]) => (
              <div key={left} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-indigo-300 w-8">{left}</span>
                <span className="text-gray-600">↔</span>
                <span className="font-mono text-purple-300 w-8">{right}</span>
                <span className="text-gray-600">— {hint}</span>
              </div>
            ))}
          </div>

          {/* Bloch sphere / coherence indicator */}
          <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              {/* Outer reference circle */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#312e81" strokeWidth="1" opacity="0.5" />
              {/* Axes */}
              <line x1="50" y1="10" x2="50" y2="90" stroke="#1e1b4b" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#1e1b4b" strokeWidth="0.5" />
              {/* Bloch state dot */}
              <circle
                cx="50"
                cy={50 - radius}
                r={Math.max(3, radius * 0.3)}
                fill="#6366f1"
                opacity="0.9"
              />
              {/* Radius line */}
              <line x1="50" y1="50" x2="50" y2={50 - radius} stroke="#818cf8" strokeWidth="1" opacity="0.7" />
              {/* Coherence fill */}
              <circle cx="50" cy="50" r={radius} fill="#4f46e5" opacity="0.25" />
              {/* Labels */}
              <text x="50" y="7" textAnchor="middle" fill="#6366f1" fontSize="7">|e⟩</text>
              <text x="50" y="97" textAnchor="middle" fill="#6366f1" fontSize="7">|g⟩</text>
              {/* Percentage */}
              <text x="50" y="55" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                {coherence.toFixed(0)}%
              </text>
              <text x="50" y="63" textAnchor="middle" fill="#818cf8" fontSize="6">coherence</text>
            </svg>
            <p className="text-indigo-400 text-xs text-center">
              T₁ analog: <span className="font-mono text-white">{T1_analog.toFixed(4)} s</span>
            </p>
            <p className="text-gray-600 text-xs text-center">
              α = {alpha.toFixed(3)} → 1/T₁ decay rate
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-xs leading-relaxed">
          Toggle to see how RLC damping maps to qubit T₁ decoherence. The envelope e⁻ᵅᵗ is identical in both systems.
        </p>
      )}
    </div>
  )
}
