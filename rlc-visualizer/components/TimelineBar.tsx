'use client'
// components/TimelineBar.tsx
// MEMBER 4 — Unified Playback Controls
// Provides a centralized scrubber and playback state management.

import { useRLCStore } from '@/store/rlcStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { audioEngine } from '@/lib/audioEngine'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function TimelineBar() {
  // Drive the global animation loop
  useAnimationLoop()

  const { 
    timeIndex, isPlaying, playbackSpeed, result,
    setTimeIndex, setPlaying, setPlaybackSpeed 
  } = useRLCStore()

  const maxIndex = result.t.length - 1
  const currentTime = result.t[timeIndex] || 0
  const maxTime = result.t[maxIndex] || 0

  const handlePlayPause = () => {
    if (!isPlaying && timeIndex >= maxIndex) {
      // Auto-restart if playing from end
      setTimeIndex(0)
    }
    
    // Play sound when starting pulse
    if (!isPlaying) {
        audioEngine.playPulse(result.omega0 / (2 * Math.PI), result.alpha, 1.5)
    }
    
    setPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setPlaying(false)
    setTimeIndex(0)
  }

  return (
    <div className="w-full glass rounded-3xl p-4 flex flex-col gap-4 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-6">
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRestart}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700 text-gray-400 border border-white/5 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-95 ${
              isPlaying 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
          </button>
        </div>

        {/* Scrubber */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">
            <span className="text-emerald-400 font-mono">T = {currentTime.toFixed(4)}s</span>
            <span>SIMULATION PROGRESS</span>
            <span className="font-mono">{maxTime.toFixed(4)}s</span>
          </div>
          <div className="relative group">
            <input 
              type="range"
              min={0}
              max={maxIndex}
              value={timeIndex}
              onChange={(e) => {
                setPlaying(false)
                setTimeIndex(parseInt(e.target.value))
              }}
              className="w-full h-2 rounded-lg bg-gray-800 appearance-none cursor-pointer accent-blue-500"
            />
            {/* Playback head highlight can be added as a motion.div here */}
          </div>
        </div>

        {/* speed selector */}
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Clock Rate</span>
          <select 
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 border border-white/10 outline-none"
          >
            <option value={0.5}>0.5x Slow</option>
            <option value={1}>1.0x Normal</option>
            <option value={2}>2.0x Fast</option>
            <option value={4}>4.0x Warp</option>
          </select>
        </div>
      </div>
    </div>
  )
}
