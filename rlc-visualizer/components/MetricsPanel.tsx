'use client'
// components/MetricsPanel.tsx
// MEMBER 3 — Enhanced Analytics Dashboard

import { useRLCStore } from '@/store/rlcStore'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react'

const modeConfig = {
  underdamped: { color: 'text-blue-400', bg: 'bg-blue-950/20', border: 'border-blue-500/30', label: 'Underdamped', icon: <TrendingDown className="animate-pulse" size={16} /> },
  critical:    { color: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-500/30', label: 'Critical', icon: <CheckCircle2 size={16} /> },
  overdamped:  { color: 'text-red-400', bg: 'bg-red-950/20', border: 'border-red-500/30', label: 'Overdamped', icon: <AlertTriangle size={16} /> },
}

function MetricCard({ label, value, color = 'text-white', sub = '', delay = 0 }: {
  label: string; value: string; color?: string; sub?: string; delay?: number
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-4 flex flex-col justify-between h-full hover:bg-white/5 transition-colors border border-white/5"
    >
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-2 font-medium opacity-60 leading-tight">{sub}</p>}
    </motion.div>
  )
}

export default function MetricsPanel() {
  const { result } = useRLCStore()
  const { zeta, Q, alpha, tau, mode, loss_percent, E_initial, omega0 } = result

  const cfg = modeConfig[mode]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <TrendingDown size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">System Analytics</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Real-time Diagnostics</p>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <div className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border} flex items-center justify-between shadow-lg backdrop-blur-md`}>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 opacity-60">Status Indicator</p>
            <p className={`font-black text-xs tracking-tighter ${cfg.color}`}>
              {cfg.label.toUpperCase()} MODE
            </p>
          </div>
          <div className={`p-2 rounded-full border ${cfg.border} bg-black/20`}>
            {cfg.icon}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            label="Damping Ratio ζ" 
            value={zeta.toFixed(3)}
            color={zeta < 0.999 ? 'text-blue-400' : zeta <= 1.001 ? 'text-yellow-400' : 'text-red-400'} 
            sub={zeta < 1 ? "Under-damping state" : "Stability achieved"}
            delay={0.1}
          />
          <MetricCard 
            label="Quality Q" 
            value={Q.toFixed(2)}
            color="text-indigo-400"
            sub={Q > 5 ? "High spectral purity" : "Dissipative regime"}
            delay={0.2}
          />
          <MetricCard 
            label="Decay α" 
            value={alpha.toFixed(2) + ' s⁻¹'} 
            color="text-purple-400" 
            sub="Inverse relaxation time"
            delay={0.3}
          />
          <MetricCard 
            label="Natural ω₀" 
            value={omega0.toFixed(1) + ' r/s'} 
            color="text-emerald-400" 
            sub="Fundamental frequency"
            delay={0.4}
          />
          <MetricCard 
            label="Constant τ" 
            value={tau.toFixed(4) + ' s'} 
            color="text-cyan-400" 
            sub="Simulation time step window"
            delay={0.5}
          />
          <MetricCard 
            label="Dissipation" 
            value={loss_percent.toFixed(1) + '%'} 
            color="text-red-400" 
            sub={`E₀ = ${E_initial.toFixed(4)} J`}
            delay={0.6}
          />
        </div>
      </motion.div>
    </div>
  )
}
