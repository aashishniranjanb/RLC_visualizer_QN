// store/rlcStore.ts
// MEMBER 1 — Zustand State Store (Phase 2)

import { create } from 'zustand'
import { solveRLC, RLCResult } from '@/lib/physics'

interface RLCStore {
  R: number; L: number; C: number; V0: number
  result: RLCResult

  // Playback
  timeIndex: number
  isPlaying: boolean
  playbackSpeed: number

  // Noise
  noiseEnabled: boolean
  noiseLevel: number

  // Modes
  quantumMode: boolean
  oscMode: boolean
  compareMode: boolean
  storyMode: boolean

  // Actions
  setR: (v: number) => void
  setL: (v: number) => void
  setC: (v: number) => void
  setV0: (v: number) => void
  setTimeIndex: (i: number) => void
  setPlaying: (v: boolean) => void
  setPlaybackSpeed: (v: number) => void
  toggleNoise: () => void
  setNoiseLevel: (v: number) => void
  toggleQuantumMode: () => void
  toggleOscMode: () => void
  toggleCompareMode: () => void
  toggleStoryMode: () => void
  resetStore: () => void
}

const DEFAULT_R = 10
const DEFAULT_L = 0.1
const DEFAULT_C = 0.001
const DEFAULT_V0 = 10

function addNoise(signal: number[], level: number): number[] {
  const maxAmp = Math.max(...signal.map(Math.abs))
  return signal.map((v) => {
    // Basic Box-Muller for Gaussian noise
    const u1 = Math.random() + 1e-10
    const u2 = Math.random()
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return v + gaussian * level * maxAmp * 0.05
  })
}

function recompute(R: number, L: number, C: number, V0: number, noiseEnabled: boolean, noiseLevel: number): RLCResult {
  const base = solveRLC(R, L, C, V0)
  if (!noiseEnabled) return base
  return {
    ...base,
    V: addNoise(base.V, noiseLevel),
  }
}

export const useRLCStore = create<RLCStore>((set) => ({
  R: DEFAULT_R, L: DEFAULT_L, C: DEFAULT_C, V0: DEFAULT_V0,
  result: solveRLC(DEFAULT_R, DEFAULT_L, DEFAULT_C, DEFAULT_V0),
  
  timeIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  noiseEnabled: false,
  noiseLevel: 0.1,
  
  quantumMode: false,
  oscMode: false,
  compareMode: false,
  storyMode: false,

  setR: (R) => set((s) => ({ R, timeIndex: 0, result: recompute(R, s.L, s.C, s.V0, s.noiseEnabled, s.noiseLevel) })),
  setL: (L) => set((s) => ({ L, timeIndex: 0, result: recompute(s.R, L, s.C, s.V0, s.noiseEnabled, s.noiseLevel) })),
  setC: (C) => set((s) => ({ C, timeIndex: 0, result: recompute(s.R, s.L, C, s.V0, s.noiseEnabled, s.noiseLevel) })),
  setV0: (V0) => set((s) => ({ V0, timeIndex: 0, result: recompute(s.R, s.L, s.C, V0, s.noiseEnabled, s.noiseLevel) })),
  
  setTimeIndex: (timeIndex) => set({ timeIndex }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  
  toggleNoise: () => set((s) => {
    const noiseEnabled = !s.noiseEnabled
    return { noiseEnabled, timeIndex: 0, result: recompute(s.R, s.L, s.C, s.V0, noiseEnabled, s.noiseLevel) }
  }),
  setNoiseLevel: (noiseLevel) => set((s) => ({
    noiseLevel,
    result: recompute(s.R, s.L, s.C, s.V0, s.noiseEnabled, noiseLevel)
  })),
  
  toggleQuantumMode: () => set((s) => ({ quantumMode: !s.quantumMode })),
  toggleOscMode: () => set((s) => ({ oscMode: !s.oscMode })),
  toggleCompareMode: () => set((s) => ({ compareMode: !s.compareMode })),
  toggleStoryMode: () => set((s) => ({ storyMode: !s.storyMode })),
  
  resetStore: () => set({
    R: DEFAULT_R, L: DEFAULT_L, C: DEFAULT_C, V0: DEFAULT_V0,
    result: solveRLC(DEFAULT_R, DEFAULT_L, DEFAULT_C, DEFAULT_V0),
    timeIndex: 0, isPlaying: false, playbackSpeed: 1,
    noiseEnabled: false, quantumMode: false, oscMode: false,
    compareMode: false, storyMode: false
  })
}))
