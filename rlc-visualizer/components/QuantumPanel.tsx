'use client'
// components/QuantumPanel.tsx
// MEMBER 4 — Quantum Analogy with Framer Motion

import { useRLCStore } from '@/store/rlcStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Atom, HelpCircle } from 'lucide-react'

export default function QuantumPanel() {
  const { quantumMode, toggleQuantumMode, result } = useRLCStore()
  const { alpha, loss_percent, T1_analog } = result

  const coherence = Math.max(0, 100 - loss_percent)
  const radius = Math.max(6, 40 * (coherence / 100))

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-indigo rounded-3xl p-6 space-y-4 relative overflow-hidden group"
    >
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Atom size={18} className="animate-spin-slow" />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-white uppercase">Quantum Bridge</h2>
        </div>
        
        <button
          onClick={toggleQuantumMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none border border-white/10 ${
            quantumMode ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-white/5'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
              quantumMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {quantumMode ? (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Decay Rate</p>
                <p className="font-mono text-sm text-indigo-300">{alpha.toFixed(2)} s⁻¹</p>
              </div>
              <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">T₁ Relaxation</p>
                <p className="font-mono text-sm text-purple-300">{T1_analog.toFixed(3)} s</p>
              </div>
            </div>

            <div className="flex justify-center py-4 bg-black/30 rounded-3xl border border-white/5 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#312e81" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" />
                
                {/* Motion path for dot */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  fill="url(#grad)" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                />
                
                <defs>
                  <radialGradient id="grad">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </radialGradient>
                </defs>

                <motion.circle 
                  cx="50" 
                  cy={50 - radius} 
                  r="4" 
                  fill="white" 
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                
                <line x1="50" y1="50" x2="50" y2={50 - radius} stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
                
                <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="black">
                  {coherence.toFixed(0)}%
                </text>
                <text x="50" y="65" textAnchor="middle" fill="#818cf8" fontSize="6" fontWeight="bold" letterSpacing="1">COHERENCE</text>
              </svg>
            </div>

            <div className="text-[10px] text-indigo-300/60 leading-relaxed bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
              <p className="flex items-start gap-2">
                <HelpCircle size={12} className="mt-0.5 shrink-0" />
                Damping α is mathematically equivalent to 1/T₁. High resistance R increases environmental coupling γ, accelerating decoherence.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 space-y-4"
          >
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl group-hover:border-indigo-500/20 transition-colors">
              <p className="text-xs text-center text-gray-500 max-w-[150px] leading-relaxed group-hover:text-indigo-400/60 transition-colors">
                Enable Quantum Bridge to map classical RLC parameters to qubit decoherence models.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
