// lib/physics.ts
// MEMBER 1 — Physics Engine (Phase 2)

import { computeFFT } from './fft'

export interface RLCResult {
  t: number[]
  V: number[]
  I: number[]
  E_cap: number[]
  E_ind: number[]
  E_total: number[]
  envelope: number[]
  alpha: number
  omega0: number
  zeta: number
  Q: number
  tau: number
  mode: 'underdamped' | 'critical' | 'overdamped'
  E_initial: number
  E_final: number
  loss_percent: number
  T1_analog: number
  // FFT Results
  fftFrequencies: number[]
  fftMagnitudes: number[]
}

export function solveRLC(R: number, L: number, C: number, V0: number): RLCResult {
  const Rsafe = Math.max(R, 1e-6)
  const Lsafe = Math.max(L, 1e-9)
  const Csafe = Math.max(C, 1e-12)

  const alpha = Rsafe / (2 * Lsafe)
  const omega0 = 1 / Math.sqrt(Lsafe * Csafe)
  const zeta = alpha / omega0
  const Q = omega0 * Lsafe / Rsafe
  const tau = 1 / alpha
  const T1_analog = tau

  const mode: 'underdamped' | 'critical' | 'overdamped' =
    zeta < 0.999 ? 'underdamped' :
    zeta <= 1.001 ? 'critical' : 'overdamped'

  // TASK 1.4 — Performance: Adjust N based on mode
  // Overdamped needs fewer points for a good look, Underdamped needs more for ripples
  const N = mode === 'overdamped' ? 600 : 1200
  const tMax = Math.min(10 * tau, 2.5) // Increased slightly for better tail visualization
  const dt = tMax / N

  const t: number[] = []
  const V: number[] = []
  const I: number[] = []
  const E_cap: number[] = []
  const E_ind: number[] = []
  const E_total: number[] = []
  const envelope: number[] = []

  let q = Csafe * V0
  let i = 0

  for (let n = 0; n <= N; n++) {
    const tn = n * dt
    const Vn = q / Csafe
    const Ec = 0.5 * Csafe * Vn * Vn
    const El = 0.5 * Lsafe * i * i

    t.push(tn)
    V.push(Vn)
    I.push(i)
    E_cap.push(Ec)
    E_ind.push(El)
    E_total.push(Ec + El)
    envelope.push(V0 * Math.exp(-alpha * tn))

    // RK4
    const dq1 = i
    const di1 = -(Rsafe / Lsafe) * i - (1 / (Lsafe * Csafe)) * q

    const dq2 = i + 0.5 * dt * di1
    const di2 = -(Rsafe / Lsafe) * (i + 0.5 * dt * di1) - (1 / (Lsafe * Csafe)) * (q + 0.5 * dt * dq1)

    const dq3 = i + 0.5 * dt * di2
    const di3 = -(Rsafe / Lsafe) * (i + 0.5 * dt * di2) - (1 / (Lsafe * Csafe)) * (q + 0.5 * dt * dq2)

    const dq4 = i + dt * di3
    const di4 = -(Rsafe / Lsafe) * (i + dt * di3) - (1 / (Lsafe * Csafe)) * (q + dt * dq3)

    q += (dt / 6) * (dq1 + 2 * dq2 + 2 * dq3 + dq4)
    i += (dt / 6) * (di1 + 2 * di2 + 2 * di3 + di4)
  }

  // TASK 1.2 — FFT Integration
  // Performance: Downsample V for FFT if N is too high
  const fftInput = V.length > 1024 
    ? V.filter((_, idx) => idx % Math.ceil(V.length / 1024) === 0)
    : V
  const fftDt = dt * (V.length / fftInput.length)
  
  const { frequencies: fftFrequencies, magnitudes: fftMagnitudes } = computeFFT(fftInput, fftDt)

  const E_initial = E_total[0]
  const E_final = E_total[E_total.length - 1]
  const loss_percent = E_initial > 0 ? ((E_initial - E_final) / E_initial) * 100 : 0

  return {
    t, V, I, E_cap, E_ind, E_total, envelope,
    alpha, omega0, zeta, Q, tau, mode,
    E_initial, E_final, loss_percent, T1_analog,
    fftFrequencies, fftMagnitudes
  }
}
