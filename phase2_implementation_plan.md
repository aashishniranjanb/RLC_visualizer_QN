# RLC Visualizer — Phase 2: 48-Hour Grand Hackathon Plan
## QTHack04 · April 3–5 · Full Power Execution

---

## 🔬 Critical Gap Analysis (Where Phase 1 Falls Short)

### What Phase 1 Has
- Static 3D scene (glows, no animation loop)
- Recharts plots (good but static)
- Metrics panel (numbers only)
- Quantum toggle (text + SVG circle)

### What Judges See in Phase 2 (Offline — They Interact Directly)
Judges will sit in front of your laptop. They will:
- **Click, drag, and break things** — robustness matters
- **Ask "show me underdamped vs overdamped"** — you need instant switching
- **Ask "what happens at critical damping?"** — you need to explain while showing
- **Compare your build to other teams** — you need one feature no one else has

### The One Feature Nobody Else Will Have
**Real-time animated time evolution** — the circuit plays like a movie.
A moving cursor scrubs through time. The 3D scene updates frame-by-frame.
The energy bar drains as you watch. This is the difference between a "graph tool" and a "physics instrument."

---

## 🎯 Phase 2 Upgrade Targets (Prioritized)

### TIER 1 — Non-Negotiable (Hours 0–24)
| Feature | Impact | Owner |
|---|---|---|
| Animated time playback (Play/Pause/Scrub) | ⭐⭐⭐⭐⭐ | M1 + M2 |
| Energy flow particles between L↔C | ⭐⭐⭐⭐⭐ | M2 |
| FFT / Frequency spectrum plot | ⭐⭐⭐⭐ | M3 |
| Phase portrait (V vs I) | ⭐⭐⭐⭐ | M3 |
| Oscilloscope skin (green waveform, grid) | ⭐⭐⭐⭐ | M4 |

### TIER 2 — High Value (Hours 24–36)
| Feature | Impact | Owner |
|---|---|---|
| Compare Mode (two configs side by side) | ⭐⭐⭐⭐ | M4 |
| Thermal noise injection (real-world mode) | ⭐⭐⭐⭐ | M1 |
| Guided Story Mode (5-step walkthrough) | ⭐⭐⭐⭐ | M4 |
| Bloch Sphere (proper 3D, not SVG circle) | ⭐⭐⭐ | M2 |
| Export: PNG plots + CSV data | ⭐⭐⭐ | M3 |

### TIER 3 — Bonus (Hours 36–48)
| Feature | Impact | Owner |
|---|---|---|
| Audio sonification (hear the decay) | ⭐⭐⭐ | M3 |
| Multi-stage LC ladder (advanced circuit) | ⭐⭐ | M1 |
| Real-world use case cards (RF, quantum HW) | ⭐⭐⭐ | M4 |
| Presentation mode (full-screen, no chrome) | ⭐⭐⭐ | M4 |

---

## 🏗️ Full Architecture (Phase 2)

```
rlc-visualizer/
├── app/
│   ├── page.tsx                    ← upgraded main layout (M4)
│   └── layout.tsx
├── components/
│   ├── ThreeScene.tsx              ← particle system + animated (M2)
│   ├── BlochSphere.tsx             ← proper 3D Bloch sphere (M2)
│   ├── PlotPanel.tsx               ← voltage + energy plots (M3)
│   ├── FFTPlot.tsx                 ← frequency domain (M3)
│   ├── PhasePortrait.tsx           ← V vs I orbit (M3)
│   ├── MetricsPanel.tsx            ← numbers + insights (M3)
│   ├── ControlPanel.tsx            ← sliders + presets (M4)
│   ├── QuantumPanel.tsx            ← quantum bridge (M4)
│   ├── TimelineBar.tsx             ← play/pause/scrub (M4)
│   ├── ComparePanel.tsx            ← split screen compare (M4)
│   ├── OscilloscopeSkin.tsx        ← CRT overlay (M4)
│   └── StoryMode.tsx               ← guided walkthrough (M4)
├── lib/
│   ├── physics.ts                  ← upgraded: noise + FFT (M1)
│   ├── fft.ts                      ← FFT implementation (M1)
│   └── audioEngine.ts              ← Web Audio API (M3)
├── store/
│   └── rlcStore.ts                 ← upgraded: timeIndex, playback state (M1)
└── hooks/
    └── useAnimationLoop.ts         ← rAF-based playback hook (M1)
```

---

## 🔢 Physics Upgrades (Member 1 Owns)

### 1. Store Must Now Include Time State
```typescript
// store/rlcStore.ts — add these fields
interface RLCStore {
  // existing...
  timeIndex: number          // current frame (0..N)
  isPlaying: boolean
  playbackSpeed: number      // 0.5x, 1x, 2x, 5x
  noiseEnabled: boolean
  noiseLevel: number         // 0..1
  setTimeIndex: (i: number) => void
  setPlaying: (v: boolean) => void
  setPlaybackSpeed: (v: number) => void
  toggleNoise: () => void
  setNoiseLevel: (v: number) => void
}
```

### 2. Noise Injection (Thermal Noise Model)
```typescript
// lib/physics.ts — add to solveRLC output
function addThermalNoise(signal: number[], level: number, seed = 42): number[] {
  // Box-Muller gaussian noise
  return signal.map((v) => {
    const u1 = Math.random(), u2 = Math.random()
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return v + gaussian * level * Math.max(...signal.map(Math.abs)) * 0.05
  })
}
// Conditionally add to V[] when noiseEnabled = true
```

### 3. FFT Implementation
```typescript
// lib/fft.ts — Cooley-Tukey FFT
export function computeFFT(signal: number[], sampleRate: number): {
  frequencies: number[], magnitudes: number[]
} {
  // Pad to next power of 2
  const N = nextPow2(signal.length)
  const padded = [...signal, ...Array(N - signal.length).fill(0)]
  
  // FFT via recursive Cooley-Tukey
  const result = fft(padded)
  
  // Return only positive frequencies (first N/2)
  const frequencies = Array.from({length: N/2}, (_, i) => i * sampleRate / N)
  const magnitudes = result.slice(0, N/2).map(c => Math.sqrt(c.re**2 + c.im**2))
  
  return { frequencies, magnitudes }
}
```

### 4. Animation Hook
```typescript
// hooks/useAnimationLoop.ts
import { useEffect, useRef } from 'react'
import { useRLCStore } from '@/store/rlcStore'

export function useAnimationLoop() {
  const { isPlaying, timeIndex, result, playbackSpeed, setTimeIndex, setPlaying } = useRLCStore()
  const rafRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current!)
      return
    }

    const frameInterval = 16 / playbackSpeed  // ms per frame

    const tick = (now: number) => {
      if (now - lastTimeRef.current >= frameInterval) {
        lastTimeRef.current = now
        const next = timeIndex + 1
        if (next >= result.t.length) {
          setPlaying(false)  // stop at end
        } else {
          setTimeIndex(next)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [isPlaying, timeIndex, playbackSpeed])
}
```

---

## 🎮 3D Scene Upgrades (Member 2 Owns)

### Particle System (Energy Flow)
The particles are the centerpiece. They flow L↔C and fade at the resistor.

```tsx
// Particle concept in R3F
function EnergyParticles({ fromPos, toPos, count, speed, color, opacity }: ParticleProps) {
  const particlesRef = useRef<Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = i / count  // spread along path
      arr[i*3]   = fromPos[0] + (toPos[0] - fromPos[0]) * t
      arr[i*3+1] = fromPos[1] + (toPos[1] - fromPos[1]) * t + Math.sin(t * Math.PI) * 0.3
      arr[i*3+2] = fromPos[2]
    }
    return arr
  }, [fromPos, toPos, count])

  useFrame((_, delta) => {
    if (!particlesRef.current) return
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      // Move each particle along path, wrap around
      const t = ((i / count) + (Date.now() * speed * 0.001) % 1)
      pos[i*3]   = fromPos[0] + (toPos[0] - fromPos[0]) * (t % 1)
      pos[i*3+1] = fromPos[1] + Math.sin((t % 1) * Math.PI) * 0.5
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} transparent opacity={opacity} sizeAttenuation />
    </points>
  )
}
```

### Time-Synced Scene
```tsx
// ThreeScene.tsx — read timeIndex from store
export default function ThreeScene() {
  const { result, timeIndex } = useRLCStore()

  const t = timeIndex
  const E_cap_norm = result.E_total[0] > 0 ? result.E_cap[t] / result.E_total[0] : 0
  const E_ind_norm = result.E_total[0] > 0 ? result.E_ind[t] / result.E_total[0] : 0
  const loss_norm = result.loss_percent / 100

  // Particle count proportional to energy being transferred
  const particleCount = Math.floor(E_cap_norm * 30)

  return (
    <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={0.8} />
      <Capacitor energyNorm={E_cap_norm} />
      <Inductor energyNorm={E_ind_norm} />
      <Resistor lossNorm={loss_norm} />
      {/* Particles flow C→L then L→C */}
      <EnergyParticles fromPos={[-2,0,0]} toPos={[2,0,0]}
        count={particleCount} speed={1 + E_cap_norm}
        color="#60a5fa" opacity={E_cap_norm} />
      <EnergyParticles fromPos={[2,0,0]} toPos={[-2,0,0]}
        count={Math.floor(E_ind_norm * 30)} speed={1 + E_ind_norm}
        color="#f97316" opacity={E_ind_norm} />
      {/* Drain particles going down to resistor */}
      <EnergyParticles fromPos={[0,0,0]} toPos={[0,-2,0]}
        count={Math.floor(loss_norm * 20)} speed={2}
        color="#ef4444" opacity={loss_norm * 0.8} />
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}
```

### Bloch Sphere (Quantum Mode)
```tsx
// components/BlochSphere.tsx
export default function BlochSphere({ coherence }: { coherence: number }) {
  // coherence: 0..1, drives state vector length
  return (
    <Canvas camera={{ position: [0, 0, 3.5] }} style={{ height: 200 }}>
      <ambientLight intensity={0.5} />
      {/* Sphere outline */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#1e1b4b" transparent opacity={0.3} wireframe />
      </mesh>
      {/* State vector arrow — shrinks with decoherence */}
      <arrowHelper args={[
        new THREE.Vector3(0, coherence, Math.sqrt(1 - coherence**2)).normalize(),
        new THREE.Vector3(0, 0, 0),
        coherence,
        '#818cf8'
      ]} />
      {/* Axes */}
      <axesHelper args={[1.2]} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  )
}
```

---

## 📊 Plot Upgrades (Member 3 Owns)

### 1. Time Cursor Overlay on All Plots
```tsx
// Add to PlotPanel.tsx
const { timeIndex, result, setTimeIndex } = useRLCStore()
const currentT = result.t[timeIndex]

// In LineChart, add a ReferenceLine:
<ReferenceLine x={currentT} stroke="#facc15" strokeWidth={2} label="" />
// This shows WHERE in time the 3D scene currently is
```

### 2. FFT Plot Component
```tsx
// components/FFTPlot.tsx
'use client'
import { useRLCStore } from '@/store/rlcStore'
import { computeFFT } from '@/lib/fft'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

export default function FFTPlot() {
  const { result } = useRLCStore()
  const sampleRate = result.t.length / (result.t[result.t.length - 1] || 1)

  const fftData = useMemo(() => {
    const { frequencies, magnitudes } = computeFFT(result.V, sampleRate)
    // Only show up to 5x natural frequency
    const cutoff = result.omega0 * 5 / (2 * Math.PI)
    return frequencies
      .map((f, i) => ({ f: parseFloat(f.toFixed(2)), mag: magnitudes[i] }))
      .filter(d => d.f <= cutoff && d.f > 0)
  }, [result])

  return (
    <div>
      <h3 className="text-sm text-gray-400 mb-1">Frequency Spectrum (FFT)</h3>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={fftData}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="f" tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'Hz', fill: '#6b7280', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} />
          <Area type="monotone" dataKey="mag" stroke="#a78bfa" fill="#4c1d95" strokeWidth={2} name="Magnitude" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-purple-400 mt-1">
        Resonance peak at ω₀ = {(result.omega0 / (2 * Math.PI)).toFixed(2)} Hz
      </p>
    </div>
  )
}
```

### 3. Phase Portrait (V vs I)
```tsx
// components/PhasePortrait.tsx
'use client'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRLCStore } from '@/store/rlcStore'
import { useMemo } from 'react'

export default function PhasePortrait() {
  const { result, timeIndex } = useRLCStore()

  const data = useMemo(() =>
    result.V.map((v, i) => ({ V: parseFloat(v.toFixed(3)), I: parseFloat(result.I[i].toFixed(3)) }))
  , [result])

  const currentPoint = { V: result.V[timeIndex], I: result.I[timeIndex] }

  return (
    <div>
      <h3 className="text-sm text-gray-400 mb-1">Phase Portrait (V vs I)</h3>
      <p className="text-xs text-gray-500 mb-1">Spiral = energy dissipating. Circle = lossless. Line = overdamped.</p>
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="V" type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} name="Voltage (V)" />
          <YAxis dataKey="I" type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} name="Current (A)" />
          <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill="#60a5fa" opacity={0.4} />
          {/* Current point highlighted */}
          <Scatter data={[currentPoint]} fill="#facc15" opacity={1} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### 4. Audio Sonification
```typescript
// lib/audioEngine.ts
export class AudioEngine {
  private ctx: AudioContext | null = null
  private osc: OscillatorNode | null = null
  private gain: GainNode | null = null

  start(omega0: number, alpha: number) {
    this.ctx = new AudioContext()
    this.osc = this.ctx.createOscillator()
    this.gain = this.ctx.createGain()

    this.osc.frequency.value = Math.min(omega0 / (2 * Math.PI) * 10, 1200)  // scale to audible
    this.osc.type = 'sine'

    // Gain decays like the circuit
    this.gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    this.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1 / alpha)

    this.osc.connect(this.gain)
    this.gain.connect(this.ctx.destination)
    this.osc.start()
    this.osc.stop(this.ctx.currentTime + 1 / alpha + 0.1)
  }

  stop() {
    this.osc?.stop()
    this.ctx?.close()
  }
}
```

---

## 🖥️ UI/UX Upgrades (Member 4 Owns)

### 1. Timeline Bar (Play/Pause/Scrub)
```tsx
// components/TimelineBar.tsx
'use client'
import { useRLCStore } from '@/store/rlcStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'

export default function TimelineBar() {
  useAnimationLoop()  // hooks into rAF
  const { isPlaying, setPlaying, timeIndex, setTimeIndex, result, playbackSpeed, setPlaybackSpeed } = useRLCStore()

  const progress = timeIndex / (result.t.length - 1)
  const currentTime = result.t[timeIndex]?.toFixed(4) ?? '0'

  return (
    <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-4">
      {/* Play/Pause */}
      <button onClick={() => {
        if (timeIndex >= result.t.length - 1) setTimeIndex(0)
        setPlaying(!isPlaying)
      }} className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Reset */}
      <button onClick={() => { setPlaying(false); setTimeIndex(0) }}
        className="text-gray-400 hover:text-white text-sm">↺</button>

      {/* Scrubber */}
      <div className="flex-1 flex items-center gap-2">
        <input type="range" min={0} max={result.t.length - 1} value={timeIndex}
          onChange={(e) => { setPlaying(false); setTimeIndex(parseInt(e.target.value)) }}
          className="flex-1 accent-blue-500" />
        <span className="text-xs font-mono text-blue-400 w-16">{currentTime}s</span>
      </div>

      {/* Speed */}
      <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
        className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700">
        <option value={0.25}>0.25×</option>
        <option value={0.5}>0.5×</option>
        <option value={1}>1×</option>
        <option value={2}>2×</option>
        <option value={5}>5×</option>
      </select>
    </div>
  )
}
```

### 2. Oscilloscope Skin Toggle
```tsx
// Add to page.tsx — a theme toggle
const [oscMode, setOscMode] = useState(false)

// When oscMode = true, apply these classes globally:
// - bg-black instead of bg-gray-950
// - All chart strokes → #00ff41 (phosphor green)
// - Grid → darker green
// - Font → monospace
// - Add CRT scanline overlay div

// CRT Overlay Component:
function CRTOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50" style={{
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
      mixBlendMode: 'multiply'
    }} />
  )
}
```

### 3. Compare Mode (Split Screen)
```tsx
// components/ComparePanel.tsx
// Two independent stores OR one store with A/B params
// Simplest: store R_A,L_A,C_A and R_B,L_B,C_B
// Compute result_A and result_B separately
// Show PlotPanel twice side by side with different colors

export default function ComparePanel() {
  const [configA, setConfigA] = useState({ R: 10, L: 0.1, C: 0.001, V0: 10 })
  const [configB, setConfigB] = useState({ R: 80, L: 0.1, C: 0.001, V0: 10 })

  const resultA = useMemo(() => solveRLC(configA.R, configA.L, configA.C, configA.V0), [configA])
  const resultB = useMemo(() => solveRLC(configB.R, configB.L, configB.C, configB.V0), [configB])

  // Render two CompactPlot side by side
  // Each shows V(t) with label "Config A" / "Config B"
  // Labels show mode, ζ, Q for each
}
```

### 4. Story Mode (Guided Walkthrough)
```tsx
// components/StoryMode.tsx
const CHAPTERS = [
  {
    title: "1. Ideal System",
    description: "In an ideal LC circuit with no resistance, energy oscillates forever between L and C.",
    params: { R: 0.01, L: 0.1, C: 0.001, V0: 10 },
    highlight: "voltage-plot"
  },
  {
    title: "2. Introducing Loss",
    description: "Add resistance. Watch how the oscillation envelope begins to decay exponentially.",
    params: { R: 15, L: 0.1, C: 0.001, V0: 10 },
    highlight: "energy-plot"
  },
  {
    title: "3. Critical Damping",
    description: "At ζ=1, the system returns to equilibrium fastest without oscillating. Used in galvanometers and door closers.",
    params: { R: 63.2, L: 0.1, C: 0.001, V0: 10 },
    highlight: "metrics"
  },
  {
    title: "4. Overdamping",
    description: "Too much resistance slows the return. Energy dissipates without any oscillation.",
    params: { R: 150, L: 0.1, C: 0.001, V0: 10 },
    highlight: "3d-scene"
  },
  {
    title: "5. The Quantum Connection",
    description: "This same exponential decay governs qubit T₁ relaxation. Your α is literally 1/T₁.",
    params: { R: 30, L: 0.1, C: 0.001, V0: 10 },
    highlight: "quantum",
    openQuantumMode: true
  }
]
```

---

## ⏱️ 48-Hour Timeline

### Hour 0–4: Setup & Merge
- Merge any local branches into main
- Ensure app runs clean (`npm run dev` zero errors)
- Assign roles, confirm dependencies

### Hour 4–12: Core Upgrades (Tier 1)
- M1: Add timeIndex to store + animation hook
- M2: Particle system rendering (even basic works)
- M3: FFT plot + phase portrait shells
- M4: Timeline bar + oscilloscope toggle skin

### Hour 12–20: Integration Sprint
- Connect timeIndex to ThreeScene (M2 consumes store)
- Connect time cursor to PlotPanel (M3 adds ReferenceLine)
- Full playback working end-to-end
- Noise toggle wired to physics (M1)

### Hour 20–28: Tier 2 Features
- M4: Compare mode + Story mode
- M2: Bloch Sphere component
- M3: Export PNG + audio engine
- M1: Performance — memoize physics calcs

### Hour 28–36: Polish Pass
- M4: Presentation mode (full-screen, hidden controls)
- M4: Real-world use case cards
- M3: Chart labels, axis units, tooltips
- M2: Scene lighting refinement, background stars/grid

### Hour 36–44: Testing & Demo Prep
- Full runthrough with all features
- Record demo video (4–5 min)
- Rehearse verbal explanation
- Fix last bugs

### Hour 44–48: Buffer
- Backup: static screenshots if anything breaks
- Presentation mode confirmed
- Submission checks

---

## 🎤 Upgraded Demo Flow (for Phase 2 Judges)

```
0:00  → Open app in Oscilloscope Mode (first impression = lab instrument)
0:15  → "We built an interactive energy decay instrument, not just a graph"
0:30  → Press PLAY — show animation running in real time
1:00  → Drag R slider from 10→150 — show mode switching live
1:30  → Point to phase portrait — "spiral closing = energy leaving the system"
2:00  → Click FFT — "resonance peak shifts as L and C change"
2:30  → Open Story Mode → walk through all 5 chapters
4:00  → Toggle Quantum Mode → show Bloch sphere shrinking
4:30  → "The same α=R/2L maps directly to 1/T₁ in superconducting qubits"
5:00  → Open Compare Mode — underdamped vs overdamped side by side
5:30  → "Any questions? The simulation is fully interactive."
```

---

## 🔥 Your Winning Differentiators (Say These Clearly)

1. **"Real-time animated time evolution"** — not just a plot, it plays like a movie
2. **"Phase portrait reveals energy topology"** — judges from physics background love this
3. **"FFT shows resonance frequency directly"** — connects to RF applications
4. **"5-chapter story mode"** — judges can follow without explanation
5. **"Classical damping = quantum T₁"** — the only team with this bridge built-in

---

## 🚨 Risk Table

| Risk | Probability | Mitigation |
|---|---|---|
| Particle system too laggy | Medium | Cap at 50 particles, use instanced mesh |
| FFT produces wrong peaks | Low | Validate: omega0/(2π) must match peak |
| Animation drift on slow machines | Medium | Use wall-clock delta, not frame count |
| Bloch sphere breaks Three.js context | Low | Separate Canvas, isolated component |
| Story mode state conflicts main store | Low | Story mode writes to main store via actions |
