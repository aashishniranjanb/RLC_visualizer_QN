'use client'
// app/page.tsx
// MEMBER 4 — Phase 2: Master Dashboard Assembly
// Cinematic, multi-panel grid integrating all physics & quantum metrics.

import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, Sparkles, BookOpen, Scale, Zap } from 'lucide-react'
import { useRLCStore } from '@/store/rlcStore'

import ControlPanel from '@/components/ControlPanel'
import MetricsPanel from '@/components/MetricsPanel'
import PlotPanel from '@/components/PlotPanel'
import QuantumPanel from '@/components/QuantumPanel'
import TimelineBar from '@/components/TimelineBar'
import ComparePanel from '@/components/ComparePanel'
import StoryMode from '@/components/StoryMode'
import FFTPlot from '@/components/FFTPlot'
import PhasePortrait from '@/components/PhasePortrait'
import BlochSphere from '@/components/BlochSphere'

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false })

export default function Home() {
  const { 
    storyMode, compareMode, quantumMode, oscMode,
    toggleStoryMode, toggleCompareMode, toggleOscMode, result 
  } = useRLCStore()

  // Coherence derived from classical loss for quantum mapping
  const coherence = Math.max(0, 1 - result.loss_percent / 100)

  return (
    <main className={`min-h-screen p-6 transition-colors duration-700 ${oscMode ? 'bg-black font-mono' : 'bg-[#030712]'} text-white selection:bg-blue-500/30`}>
      
      {/* CRT SCANLINE OVERLAY */}
      <AnimatePresence>
        {oscMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[60]" 
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
              boxShadow: 'inset 0 0 100px rgba(34, 197, 94, 0.1)'
            }} 
          />
        )}
      </AnimatePresence>

      {/* STORY MODE OVERLAY */}
      <AnimatePresence>
        {storyMode && <StoryMode />}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="max-w-[1600px] mx-auto mb-8 flex items-center justify-between">
        <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
        >
          <div className={`p-3 rounded-2xl ${oscMode ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-600/10 border-blue-600/20'} border shadow-2xl`}>
            <Zap className={oscMode ? 'text-green-400' : 'text-blue-500'} size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tighter ${oscMode ? 'text-green-500' : 'text-white'}`}>
              QUANTUM NEXUS <span className="text-gray-600 font-light">RLC</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Advanced Physics & Decoherence Engine</p>
          </div>
        </motion.div>

        <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
        >
          <button 
            onClick={toggleStoryMode}
            className={`group px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                oscMode ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-purple-600/10 border-purple-600/20 text-purple-400 hover:bg-purple-600/20'
            }`}
          >
            <BookOpen size={14} /> Story Mode
          </button>
          
          <button 
            onClick={toggleCompareMode}
            className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                compareMode 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Scale size={14} /> Compare
          </button>

          <button 
            onClick={toggleOscMode}
            className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                oscMode 
                    ? 'bg-green-600 border-green-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layout size={14} /> {oscMode ? 'Standard' : 'Oscilloscope'}
          </button>
        </motion.div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-12">
        
        {/* FULL WIDTH TIMELINE BAR */}
        <div className="col-span-12">
            <TimelineBar />
        </div>

        {/* LEFT COLUMN: CONTROLS & COMPARISON */}
        <div className="col-span-3 space-y-6">
          <ControlPanel />
          <QuantumPanel />
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ComparePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER COLUMN: 3D ACTION & PRIMARY PLOTS */}
        <div className="col-span-6 space-y-6">
          <ThreeScene />
          <PlotPanel />
          <div className="grid grid-cols-2 gap-6">
            <FFTPlot />
            <PhasePortrait />
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & QUANTUM BLOCK */}
        <div className="col-span-3 space-y-6">
          <MetricsPanel />
          <AnimatePresence>
            {quantumMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <BlochSphere coherence={coherence} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
             <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Project Insight</h4>
             </div>
             <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">
                &quot;The energy within an RLC circuit behaves exactly like probability density in a decohering qubit. As resistance drains energy, information is lost to the environment.&quot;
             </p>
          </div>
        </div>
      </div>

    </main>
  )
}
