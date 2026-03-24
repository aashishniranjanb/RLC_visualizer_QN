// store/rlcStore.ts
// MEMBER 1 — Zustand State Store
// Central state for all R, L, C, V0 parameters and computed physics results

import { create } from 'zustand'
import { solveRLC, RLCResult } from '@/lib/physics'

interface RLCStore {
  R: number
  L: number
  C: number
  V0: number
  result: RLCResult
  quantumMode: boolean
  setR: (v: number) => void
  setL: (v: number) => void
  setC: (v: number) => void
  setV0: (v: number) => void
  toggleQuantumMode: () => void
}

// Default values: R=10Ω, L=0.1H, C=1mF → ζ≈0.158 (underdamped)
const DEFAULT_R = 10
const DEFAULT_L = 0.1
const DEFAULT_C = 0.001
const DEFAULT_V0 = 10

export const useRLCStore = create<RLCStore>((set, get) => ({
  R: DEFAULT_R,
  L: DEFAULT_L,
  C: DEFAULT_C,
  V0: DEFAULT_V0,
  result: solveRLC(DEFAULT_R, DEFAULT_L, DEFAULT_C, DEFAULT_V0),
  quantumMode: false,

  setR: (R) => set({ R, result: solveRLC(R, get().L, get().C, get().V0) }),
  setL: (L) => set({ L, result: solveRLC(get().R, L, get().C, get().V0) }),
  setC: (C) => set({ C, result: solveRLC(get().R, get().L, C, get().V0) }),
  setV0: (V0) => set({ V0, result: solveRLC(get().R, get().L, get().C, V0) }),
  toggleQuantumMode: () => set((s) => ({ quantumMode: !s.quantumMode })),
}))
