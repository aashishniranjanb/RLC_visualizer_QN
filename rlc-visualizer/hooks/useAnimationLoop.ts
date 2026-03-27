'use client'
// hooks/useAnimationLoop.ts
// MEMBER 1 — Animation Loop Hook for Phase 2

import { useEffect, useRef } from 'react'
import { useRLCStore } from '@/store/rlcStore'

/**
 * Hook that drives the timeIndex in the RLC store using requestAnimationFrame.
 * Should be called by a high-level UI component (e.g., TimelineBar).
 */
export function useAnimationLoop() {
  const isPlaying = useRLCStore((s) => s.isPlaying)
  const timeIndex = useRLCStore((s) => s.timeIndex)
  const playbackSpeed = useRLCStore((s) => s.playbackSpeed)
  const resultLength = useRLCStore((s) => s.result.t.length)
  
  const setTimeIndex = useRLCStore((s) => s.setTimeIndex)
  const setPlaying = useRLCStore((s) => s.setPlaying)

  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  
  // Use a ref for the current index to avoid closure staleness without re-subscribing the effect
  const indexRef = useRef(timeIndex)
  useEffect(() => {
    indexRef.current = timeIndex
  }, [timeIndex])

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    // Target ~60fps, adjusted by playback speed
    // 16ms per frame at 1x speed
    const msPerFrame = 16 / playbackSpeed

    const tick = (now: number) => {
      if (now - lastTimeRef.current >= msPerFrame) {
        lastTimeRef.current = now
        
        const nextIndex = indexRef.current + 1
        
        if (nextIndex >= resultLength) {
          setPlaying(false)
          return
        }
        
        setTimeIndex(nextIndex)
      }
      
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, playbackSpeed, resultLength, setPlaying, setTimeIndex])
}
