'use client'
// components/StoryMode.tsx
// MEMBER 4 — Interactive Guided Experience
// A multi-chapter modal that walks users through circuit physics.

import { useState } from 'react'
import { useRLCStore } from '@/store/rlcStore'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

const CHAPTERS = [
  {
    id: 1,
    title: "⚡ The Ideal Circuit",
    tagline: "What if resistance was zero?",
    description: "In a perfect LC circuit, energy oscillates forever between the capacitor (electric field) and inductor (magnetic field). This is the theoretical ideal where $Q \\to \\infty$.",
    params: { R: 0.2, L: 0.1, C: 0.001, V0: 10 },
    insight: "Notice: the envelope is flat. No energy is dissipating into heat.",
    quantum: false,
  },
  {
    id: 2,
    title: "🔥 Reality: Parasitic Loss",
    tagline: "Every real circuit has some resistance.",
    description: "Add a small amount of resistance. The oscillation now decays exponentially. Energy is slowly 'leaked' from the system as heat.",
    params: { R: 10, L: 0.1, C: 0.001, V0: 10 },
    insight: "Damping ratio $\\zeta \\approx 0.16$. The system is underdamped.",
    quantum: false,
  },
  {
    id: 3,
    title: "⚖️ Critical Damping",
    tagline: "The engineering 'Sweet Spot'.",
    description: "At $\\zeta = 1$, the system returns to zero as fast as possible without oscillating. This is how high-end scale needles and door closers are designed.",
    params: { R: 63.2, L: 0.1, C: 0.001, V0: 10 },
    insight: "No oscillation here. Just a clean, rapid return to equilibrium.",
    quantum: false,
  },
  {
    id: 4,
    title: "🐢 Overdamping",
    tagline: "When friction dominates inertia.",
    description: "Too much resistance prevents oscillation entirely and significantly slows the return to rest. Like trying to pull a heavy door through thick oil.",
    params: { R: 150, L: 0.1, C: 0.001, V0: 10 },
    insight: "$\\zeta = 2.37$. Energy is dissipated so fast that no magnetic field can build up.",
    quantum: false,
  },
  {
    id: 5,
    title: "⚛️ The Qubit Analogy",
    tagline: "Why quantum computers are hard to build.",
    description: "A superconducting qubit is essentially an RLC circuit. Resistance maps to 'decoherence'. If resistance isn't zero, the quantum state $|1\\rangle$ decays to $|0\\rangle$.",
    params: { R: 25, L: 0.1, C: 0.001, V0: 10 },
    insight: "The damping coefficient $\\alpha$ is the relaxation rate $1/T_1$. Lower R = better Qubit.",
    quantum: true,
  },
]

export default function StoryMode() {
  const [chapter, setChapter] = useState(0)
  const { 
    setR, setL, setC, setV0, toggleQuantumMode, 
    quantumMode, toggleStoryMode, setPlaying 
  } = useRLCStore()

  function goToChapter(idx: number) {
    setChapter(idx)
    const p = CHAPTERS[idx].params
    setR(p.R); setL(p.L); setC(p.C); setV0(p.V0)
    
    // Auto-pulse the sound for the new chapter
    setPlaying(false)
    
    // Switch quantum mode if needed
    if (CHAPTERS[idx].id === 5 && !quantumMode) toggleQuantumMode()
    if (CHAPTERS[idx].id !== 5 && quantumMode) toggleQuantumMode()
  }

  const current = CHAPTERS[chapter]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleStoryMode}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div 
        layoutId="story-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row h-[500px]"
      >
        {/* Progress Sidebar */}
        <div className="w-full sm:w-20 bg-black/20 flex sm:flex-col items-center justify-center gap-4 p-4 border-r border-white/5">
          {CHAPTERS.map((c, i) => (
            <button 
              key={i} 
              onClick={() => goToChapter(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === chapter ? 'bg-blue-500 scale-125 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-700 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto">
          <button 
            onClick={toggleStoryMode}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">CHAPTER 0{current.id}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{current.title}</h2>
            <p className="text-blue-400 font-bold text-sm mb-6 tracking-wide uppercase italic">{current.tagline}</p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">{current.description}</p>
            
            <motion.div 
                key={chapter}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10"
            >
                <p className="text-blue-300 text-sm italic font-medium">
                    <span className="not-italic mr-2">💡</span> {current.insight}
                </p>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={() => chapter > 0 && goToChapter(chapter - 1)}
              disabled={chapter === 0}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {chapter < CHAPTERS.length - 1 ? (
              <button 
                onClick={() => goToChapter(chapter + 1)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
              >
                Next Level <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={toggleStoryMode}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
              >
                Finish <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
