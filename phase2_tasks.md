# Phase 2 Tasks — 48-Hour Hackathon
## QTHack04 · April 3–5 · Per-Member Execution Guide

---

## 🗺️ Who Owns What (Zero Overlap)

| Member | Primary Ownership | Dependency |
|---|---|---|
| **M1** | Physics upgrades + animation state + FFT math | Delivers store/physics.ts by Hour 4 |
| **M2** | All Three.js: particles + Bloch sphere + lighting | Depends on M1's timeIndex |
| **M3** | All chart upgrades: FFT plot + phase portrait + audio + export | Depends on M1's fft.ts |
| **M4** | All UX: timeline bar + oscilloscope skin + compare mode + story mode + presentation | Depends on M1's store shape |

---

---

## 👤 MEMBER 1 — Physics + State Architect

**You own the data layer. Everyone renders from what you provide.**
**Target: Everything done by Hour 8**

---

### TASK 1.1 — Upgrade Store (Hour 0–2)

Add these fields to `rlcStore.ts`:

```typescript
import { create } from 'zustand'
import { solveRLC, RLCResult } from '@/lib/physics'

interface RLCStore {
  // Existing params
  R: number; L: number; C: number; V0: number
  result: RLCResult

  // NEW: Playback state
  timeIndex: number
  isPlaying: boolean
  playbackSpeed: number

  // NEW: Noise
  noiseEnabled: boolean
  noiseLevel: number

  // NEW: UI state
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
}

function recompute(R: number, L: number, C: number, V0: number, noiseEnabled: boolean, noiseLevel: number): RLCResult {
  const base = solveRLC(R, L, C, V0)
  if (!noiseEnabled) return base
  return {
    ...base,
    V: addNoise(base.V, noiseLevel),
  }
}

export const useRLCStore = create<RLCStore>((set, get) => ({
  R: 10, L: 0.1, C: 0.001, V0: 10,
  result: solveRLC(10, 0.1, 0.001, 10),
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
}))

function addNoise(signal: number[], level: number): number[] {
  const maxAmp = Math.max(...signal.map(Math.abs))
  return signal.map((v) => {
    const u1 = Math.random() + 1e-10
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random())
    return v + gaussian * level * maxAmp * 0.05
  })
}
```

**Checklist:**
- [ ] All existing features still work after store upgrade
- [ ] `setR/L/C/V0` all reset `timeIndex` to 0
- [ ] Noise toggles and regenerates result
- [ ] Share updated store with team by Hour 2

---

### TASK 1.2 — Add FFT to physics.ts (Hour 2–5)

Create `lib/fft.ts`:

```typescript
// lib/fft.ts

interface Complex { re: number; im: number }

function nextPow2(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

function fftRecursive(x: Complex[]): Complex[] {
  const N = x.length
  if (N <= 1) return x
  const even = fftRecursive(x.filter((_, i) => i % 2 === 0))
  const odd  = fftRecursive(x.filter((_, i) => i % 2 !== 0))
  const T: Complex[] = Array(N / 2).fill(null).map((_, k) => {
    const angle = -2 * Math.PI * k / N
    return {
      re: Math.cos(angle) * odd[k].re - Math.sin(angle) * odd[k].im,
      im: Math.cos(angle) * odd[k].im + Math.sin(angle) * odd[k].re,
    }
  })
  return Array(N).fill(null).map((_, k) =>
    k < N / 2
      ? { re: even[k].re + T[k].re, im: even[k].im + T[k].im }
      : { re: even[k - N/2].re - T[k - N/2].re, im: even[k - N/2].im - T[k - N/2].im }
  )
}

export function computeFFT(signal: number[], dt: number): { frequencies: number[], magnitudes: number[] } {
  const N = nextPow2(signal.length)
  const padded: Complex[] = Array(N).fill(null).map((_, i) => ({
    re: signal[i] ?? 0,
    im: 0
  }))
  const result = fftRecursive(padded)
  const sampleRate = 1 / dt
  const frequencies = Array.from({ length: N / 2 }, (_, i) => i * sampleRate / N)
  const magnitudes = result.slice(0, N / 2).map(c => Math.sqrt(c.re ** 2 + c.im ** 2) / N)
  return { frequencies, magnitudes }
}
```

**Add to RLCResult interface and solveRLC:**
```typescript
// In lib/physics.ts, add to RLCResult:
fftFrequencies: number[]
fftMagnitudes: number[]

// At end of solveRLC, before return:
const dt = t[1] - t[0]
const { frequencies: fftFrequencies, magnitudes: fftMagnitudes } = computeFFT(V, dt)
```

**Checklist:**
- [ ] FFT output peak frequency matches `omega0 / (2*PI)` for underdamped
- [ ] For overdamped, FFT shows no peak (DC component only)
- [ ] `fftFrequencies` and `fftMagnitudes` available in result object

---

### TASK 1.3 — Animation Hook (Hour 5–7)

Create `hooks/useAnimationLoop.ts`:

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { useRLCStore } from '@/store/rlcStore'

export function useAnimationLoop() {
  const isPlaying = useRLCStore((s) => s.isPlaying)
  const timeIndex = useRLCStore((s) => s.timeIndex)
  const resultLength = useRLCStore((s) => s.result.t.length)
  const playbackSpeed = useRLCStore((s) => s.playbackSpeed)
  const setTimeIndex = useRLCStore((s) => s.setTimeIndex)
  const setPlaying = useRLCStore((s) => s.setPlaying)

  const rafRef = useRef<number>()
  const lastRef = useRef<number>(0)
  const indexRef = useRef(timeIndex)

  // Keep ref in sync
  useEffect(() => { indexRef.current = timeIndex }, [timeIndex])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current!)
      return
    }

    const msPerFrame = 16 / playbackSpeed

    const tick = (now: number) => {
      if (now - lastRef.current >= msPerFrame) {
        lastRef.current = now
        const next = indexRef.current + 1
        if (next >= resultLength) {
          setPlaying(false)
          return
        }
        setTimeIndex(next)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [isPlaying, playbackSpeed, resultLength])
}
```

**Checklist:**
- [ ] Press play → timeIndex increments every frame
- [ ] Press pause → stops exactly
- [ ] Change speed → playback rate changes immediately
- [ ] Slider param change → timeIndex resets to 0, playback stops

---

### TASK 1.4 — Performance (Hour 7–8)

```typescript
// lib/physics.ts — wrap heavy computation
// Increase N to 2000 points only when needed:
const N = result.mode === 'overdamped' ? 800 : 1500

// Ensure t array is Float64Array for speed
// Downsample FFT input to max 1024 points
const fftInput = V.length > 1024
  ? V.filter((_, i) => i % Math.ceil(V.length / 1024) === 0)
  : V
```

**Checklist:**
- [ ] Slider drag is smooth (no lag on each change)
- [ ] FFT computes in under 50ms
- [ ] Console has zero errors

---
---

## 👤 MEMBER 2 — 3D Scene Architect

**You own everything visible in Three.js. Your scene is the first thing judges see.**
**Target: Particle system by Hour 12, Bloch sphere by Hour 28**

---

### TASK 2.1 — Energy Flow Particle System (Hour 4–12)

```tsx
// components/ThreeScene.tsx — full upgrade

'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Grid } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useRLCStore } from '@/store/rlcStore'

// --- Animated Particles ---
function FlowParticles({
  from, to, count, speed, color, opacity
}: {
  from: [number,number,number], to: [number,number,number],
  count: number, speed: number, color: string, opacity: number
}) {
  const ref = useRef<THREE.Points>(null)
  const offsets = useMemo(() => Array.from({length: count}, (_, i) => i / count), [count])

  useFrame(({ clock }) => {
    if (!ref.current || count === 0) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const t = clock.getElapsedTime() * speed

    for (let i = 0; i < count; i++) {
      const phase = (offsets[i] + t) % 1
      const arc = Math.sin(phase * Math.PI) * 0.5
      pos[i*3]   = from[0] + (to[0] - from[0]) * phase
      pos[i*3+1] = from[1] + (to[1] - from[1]) * phase + arc
      pos[i*3+2] = from[2]
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i*3] = from[0]; arr[i*3+1] = from[1]; arr[i*3+2] = from[2]
    }
    return arr
  }, [count, from])

  if (count === 0 || opacity < 0.01) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.08} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// --- Capacitor ---
function Capacitor({ energy }: { energy: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = energy * 2 + Math.sin(clock.getElapsedTime() * 8) * energy * 0.3
    }
  })
  return (
    <group position={[-2.5, 0, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={energy * 2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={energy * 2} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Field lines */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} ref={i === 1 ? meshRef : undefined}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={energy * 3} transparent opacity={energy * 0.9} />
        </mesh>
      ))}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  )
}

// --- Inductor ---
function Inductor({ energy }: { energy: number }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += energy * delta * 4
  })
  return (
    <group position={[2.5, 0, 0]}>
      <group ref={groupRef}>
        {[-0.5, -0.25, 0, 0.25, 0.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.45, 0.07, 12, 30]} />
            <meshStandardMaterial color="#9a3412" emissive="#f97316" emissiveIntensity={energy * 2.5} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  )
}

// --- Resistor with heat shimmer ---
function Resistor({ loss }: { loss: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = loss * 2 + Math.sin(clock.getElapsedTime() * 12) * loss * 0.5
    }
  })
  return (
    <group position={[0, -2, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#7f1d1d" emissive="#ef4444" emissiveIntensity={loss * 2} metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Resistor bands */}
      {[-0.4, -0.1, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.26]}>
          <boxGeometry args={[0.12, 0.52, 0.02]} />
          <meshStandardMaterial color={['#fbbf24', '#10b981', '#f97316'][i]} />
        </mesh>
      ))}
    </group>
  )
}

// --- Wires connecting components ---
function CircuitWire({ from, to }: { from: [number,number,number], to: [number,number,number] }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#4b5563" linewidth={2} />
    </line>
  )
}

// --- Main Scene ---
export default function ThreeScene() {
  const timeIndex = useRLCStore((s) => s.timeIndex)
  const result = useRLCStore((s) => s.result)
  const oscMode = useRLCStore((s) => s.oscMode)

  const t = Math.min(timeIndex, result.t.length - 1)
  const E0 = result.E_total[0] || 1
  const E_cap_norm = Math.max(0, result.E_cap[t] / E0)
  const E_ind_norm = Math.max(0, result.E_ind[t] / E0)
  const loss_norm = Math.min(1, result.loss_percent / 100)

  const capParticles = Math.floor(E_cap_norm * 25)
  const indParticles = Math.floor(E_ind_norm * 25)
  const heatParticles = Math.floor(loss_norm * 15)

  const bg = oscMode ? '#000000' : '#030712'

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-800" style={{ height: 280, background: bg }}>
      <Canvas camera={{ position: [0, 2.5, 8], fov: 45 }}>
        <color attach="background" args={[bg]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 5, 5]} intensity={1} color={oscMode ? '#00ff41' : '#ffffff'} />
        <pointLight position={[-5, 0, 0]} intensity={0.3} color="#3b82f6" />
        <pointLight position={[5, 0, 0]} intensity={0.3} color="#f97316" />

        <Capacitor energy={E_cap_norm} />
        <Inductor energy={E_ind_norm} />
        <Resistor loss={loss_norm} />

        {/* Circuit wires */}
        <CircuitWire from={[-1.9, -0.7, 0]} to={[-1.9, -2, 0]} />
        <CircuitWire from={[-1.9, -2, 0]} to={[-0.75, -2, 0]} />
        <CircuitWire from={[0.75, -2, 0]} to={[1.9, -2, 0]} />
        <CircuitWire from={[1.9, -2, 0]} to={[1.9, -1, 0]} />
        <CircuitWire from={[-2.5, 0.7, 0]} to={[-2.5, 1.5, 0]} />
        <CircuitWire from={[-2.5, 1.5, 0]} to={[2.5, 1.5, 0]} />
        <CircuitWire from={[2.5, 1.5, 0]} to={[2.5, 0.7, 0]} />

        {/* Energy particles */}
        <FlowParticles from={[-1.5,1.5,0]} to={[1.5,1.5,0]}
          count={capParticles} speed={1.5 + E_cap_norm} color="#60a5fa" opacity={E_cap_norm * 0.9} />
        <FlowParticles from={[1.5,1.5,0]} to={[-1.5,1.5,0]}
          count={indParticles} speed={1.5 + E_ind_norm} color="#fb923c" opacity={E_ind_norm * 0.9} />
        <FlowParticles from={[0,1.5,0]} to={[0,-1.75,0]}
          count={heatParticles} speed={2} color="#ef4444" opacity={loss_norm * 0.8} />

        {oscMode && <Stars radius={20} depth={5} count={500} factor={2} saturation={0} fade />}
        <Grid position={[0, -3, 0]} args={[20, 20]} cellColor={oscMode ? '#003300' : '#1f2937'} sectionColor={oscMode ? '#006600' : '#374151'} />
        <OrbitControls enablePan={false} maxDistance={15} minDistance={4} />
      </Canvas>
    </div>
  )
}
```

**Checklist:**
- [ ] Particles visibly flow between capacitor and inductor
- [ ] Red particles drain toward resistor
- [ ] Inductor rotation speed tied to E_ind
- [ ] All glow intensities change with timeIndex
- [ ] Scene works in both normal and oscilloscope mode

---

### TASK 2.2 — Bloch Sphere (Hour 24–32)

```tsx
// components/BlochSphere.tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

function StateVector({ coherence }: { coherence: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const theta = coherence * Math.PI * 0.4  // angle from |0⟩ axis

  const direction = new THREE.Vector3(
    Math.sin(theta) * 0.6,
    Math.cos(theta),
    0
  ).normalize()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.8
    }
  })

  return (
    <group ref={ref}>
      {/* Arrow shaft */}
      <mesh position={direction.clone().multiplyScalar(coherence * 0.5)}>
        <cylinderGeometry args={[0.02, 0.02, coherence * 1, 8]} />
        <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={2} />
      </mesh>
      {/* Arrow head */}
      <mesh position={direction.clone().multiplyScalar(coherence)}>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial color="#a5b4fc" emissive="#818cf8" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

export default function BlochSphere({ coherence }: { coherence: number }) {
  // coherence: 0..1 (maps from 1 - loss_percent/100)
  return (
    <div style={{ width: '100%', height: 200 }}>
      <Canvas camera={{ position: [0, 0, 3.5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1} />

        {/* Sphere outline */}
        <mesh>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#1e1b4b" transparent opacity={0.15} wireframe={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.01, 16, 16]} />
          <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.25} />
        </mesh>

        {/* Equator circle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.008, 8, 64]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
        </mesh>

        {/* Axes */}
        <arrowHelper args={[new THREE.Vector3(1,0,0), new THREE.Vector3(-1.2,0,0), 2.4, '#ef4444', 0.15, 0.08]} />
        <arrowHelper args={[new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1.2,0), 2.4, '#10b981', 0.15, 0.08]} />
        <arrowHelper args={[new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1.2), 2.4, '#3b82f6', 0.15, 0.08]} />

        {/* State vector */}
        <StateVector coherence={Math.max(0.05, coherence)} />

        <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
      </Canvas>
      <p className="text-center text-xs text-indigo-400 mt-1">
        |ψ⟩ coherence: {(coherence * 100).toFixed(1)}%
      </p>
    </div>
  )
}
```

**Checklist:**
- [ ] Bloch sphere renders with wireframe outer shell
- [ ] State vector arrow shrinks as loss_percent increases
- [ ] Auto-rotates slowly to look dynamic
- [ ] Shows percentage label below

---
---

## 👤 MEMBER 3 — Data Visualization + Audio

**You own all 2D charts. You add FFT, phase portrait, time cursor, and audio.**
**Target: Charts upgraded by Hour 16, audio + export by Hour 28**

---

### TASK 3.1 — Time Cursor on Existing Plots (Hour 4–6)

In `PlotPanel.tsx`, import `ReferenceLine` and add to both charts:
```tsx
import { ..., ReferenceLine } from 'recharts'
const { timeIndex, result } = useRLCStore()
const currentT = parseFloat((result.t[timeIndex] ?? 0).toFixed(4))

// Inside each LineChart:
<ReferenceLine x={currentT} stroke="#facc15" strokeWidth={2}
  label={{ value: '▼', position: 'top', fill: '#facc15', fontSize: 10 }} />
```

**Checklist:**
- [ ] Yellow cursor moves on both plots as timeIndex changes
- [ ] Cursor visible during playback

---

### TASK 3.2 — FFT Plot (Hour 6–10)

Create `components/FFTPlot.tsx` — see implementation plan for full code.

Key validation:
```typescript
// After building, verify in browser console:
// For R=10, L=0.1, C=0.001:
// omega0 = 1/sqrt(0.1 * 0.001) = 100 rad/s
// f0 = 100/(2*PI) ≈ 15.9 Hz
// The FFT peak must appear near 15.9 Hz
console.log('Expected peak:', result.omega0 / (2 * Math.PI), 'Hz')
```

**Checklist:**
- [ ] FFT renders without crash
- [ ] Peak frequency visible for underdamped
- [ ] Overdamped shows DC hump (no sharp peak)
- [ ] Axis label says "Hz"
- [ ] Expected frequency shown as annotation

---

### TASK 3.3 — Phase Portrait (Hour 10–14)

Create `components/PhasePortrait.tsx` — full code in implementation plan.

Visual validation:
- Underdamped → spiral inward (oscillating + decaying)
- Critical → straight line to origin (no spiral)
- Overdamped → curved line, no loops

**Checklist:**
- [ ] Scatter plot renders V(t) vs I(t) as a path
- [ ] Current point highlighted in yellow (synced to timeIndex)
- [ ] Shape visibly differs for each damping mode
- [ ] Tooltip shows V and I values on hover

---

### TASK 3.4 — Export PNG (Hour 14–16)

```tsx
// Add export button to PlotPanel.tsx
import html2canvas from 'html2canvas'

// npm install html2canvas

const exportRef = useRef<HTMLDivElement>(null)

async function handleExport() {
  if (!exportRef.current) return
  const canvas = await html2canvas(exportRef.current)
  const link = document.createElement('a')
  link.download = 'rlc-plots.png'
  link.href = canvas.toDataURL()
  link.click()
}

// Wrap plots in <div ref={exportRef}>
// Add button: <button onClick={handleExport}>⬇ Export PNG</button>
```

Also add CSV export:
```tsx
function exportCSV(result: RLCResult) {
  const rows = result.t.map((t, i) =>
    `${t},${result.V[i]},${result.I[i]},${result.E_cap[i]},${result.E_ind[i]},${result.E_total[i]}`
  )
  const csv = 'time,voltage,current,E_cap,E_ind,E_total\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'rlc-data.csv'; a.click()
}
```

**Checklist:**
- [ ] Export PNG downloads a screenshot of all 4 plots
- [ ] Export CSV has correct column headers
- [ ] CSV data validates (V[0] ≈ V0, V[final] ≈ 0 for long enough run)

---

### TASK 3.5 — Audio Sonification (Hour 24–28)

Create `lib/audioEngine.ts` (see implementation plan) and add to UI:
```tsx
// In MetricsPanel or a dedicated button:
import { AudioEngine } from '@/lib/audioEngine'
const audio = new AudioEngine()

<button onClick={() => audio.start(result.omega0, result.alpha)}
  className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded">
  🔊 Hear the Decay
</button>
```

**Checklist:**
- [ ] Click plays a tone that fades (exponential gain decay)
- [ ] Underdamped → audible tone
- [ ] Overdamped → very short click/pop (low Q)
- [ ] High R → faster fade

---
---

## 👤 MEMBER 4 — UX, Story, Presentation

**You own the full user experience. You make judges say "wow" in the first 10 seconds.**
**Target: Timeline bar + osc skin by Hour 12, Story mode by Hour 28**

---

### TASK 4.1 — Timeline Bar (Hour 4–8)

Create `components/TimelineBar.tsx` — full code in implementation plan.

Add `useAnimationLoop()` call at top of `TimelineBar`:
```tsx
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
export default function TimelineBar() {
  useAnimationLoop()  // ← this is the only place this is called
  // ... rest of component
}
```

**Checklist:**
- [ ] Play button starts animation
- [ ] Pause stops at current frame
- [ ] Scrubber lets manual time selection
- [ ] Speed dropdown works (0.25× to 5×)
- [ ] Resets when R/L/C/V0 changes (because store resets timeIndex)

---

### TASK 4.2 — Oscilloscope Skin (Hour 8–12)

```tsx
// In page.tsx, add theme context based on oscMode

const oscMode = useRLCStore((s) => s.oscMode)

// Apply to root div:
<main className={`min-h-screen p-4 transition-all duration-500 ${
  oscMode
    ? 'bg-black font-mono'
    : 'bg-gray-950 font-sans'
} text-white`}>

// Pass oscMode to PlotPanel as prop — it switches stroke colors:
// oscMode: stroke="#00ff41" grid="#003300"
// normal:  stroke="#60a5fa" grid="#374151"

// CRT overlay (add inside main when oscMode):
{oscMode && (
  <div className="pointer-events-none fixed inset-0 z-40" style={{
    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)',
  }} />
)}

// Toggle button in header:
<button onClick={() => useRLCStore.getState().toggleOscMode()}
  className={`px-3 py-1 rounded text-xs border ${oscMode ? 'border-green-500 text-green-400' : 'border-gray-600 text-gray-400'}`}>
  {oscMode ? '📡 SCOPE' : '⚙ SCOPE'}
</button>
```

**Checklist:**
- [ ] Toggle switches background to black
- [ ] Chart strokes switch to phosphor green
- [ ] CRT scanline overlay visible
- [ ] Font switches to monospace
- [ ] Toggle button changes label

---

### TASK 4.3 — Story Mode (Hour 16–24)

Create `components/StoryMode.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRLCStore } from '@/store/rlcStore'

const CHAPTERS = [
  {
    id: 1,
    title: "⚡ The Ideal Circuit",
    tagline: "What if resistance was zero?",
    description: "In a perfect LC circuit, energy oscillates forever between the capacitor (electric field) and inductor (magnetic field). The voltage never decays. This is the theoretical ideal.",
    params: { R: 0.5, L: 0.1, C: 0.001, V0: 10 },
    insight: "Notice: envelope is nearly flat. Q → ∞. No energy is lost.",
    quantum: false,
  },
  {
    id: 2,
    title: "🔥 Reality: Resistance Enters",
    tagline: "Every real circuit has loss.",
    description: "Add resistance. The oscillation envelope now decays exponentially. Energy transfers from the circuit to heat in the resistor. This is ring-down.",
    params: { R: 15, L: 0.1, C: 0.001, V0: 10 },
    insight: "Damping ratio ζ = 0.24. System is underdamped. Energy loss = ~90% by end.",
    quantum: false,
  },
  {
    id: 3,
    title: "⚖️ Critical Damping",
    tagline: "The sweet spot engineers design for.",
    description: "At ζ = 1, the system returns to zero fastest without oscillating. Used in measuring instruments, door closers, and analog meters.",
    params: { R: 63.2, L: 0.1, C: 0.001, V0: 10 },
    insight: "ζ ≈ 1.0. No oscillation. Fastest possible decay. Q ≈ 0.5.",
    quantum: false,
  },
  {
    id: 4,
    title: "🐢 Overdamping",
    tagline: "Too much resistance slows everything.",
    description: "High resistance overdamps the system. Energy dissipates slowly without oscillation. Common in shock absorbers and heavy damping applications.",
    params: { R: 150, L: 0.1, C: 0.001, V0: 10 },
    insight: "ζ = 2.37. Exponential decay only. Phase portrait shows a straight line.",
    quantum: false,
  },
  {
    id: 5,
    title: "⚛️ The Quantum Bridge",
    tagline: "This is why quantum computers lose information.",
    description: "In a superconducting qubit, the excited state decays exponentially to ground state — exactly like RLC ring-down. Our damping coefficient α maps directly to 1/T₁, the qubit relaxation rate.",
    params: { R: 30, L: 0.1, C: 0.001, V0: 10 },
    insight: "α = R/2L = 150 s⁻¹ ↔ 1/T₁. Reducing resistance = extending qubit coherence.",
    quantum: true,
  },
]

export default function StoryMode() {
  const [chapter, setChapter] = useState(0)
  const { setR, setL, setC, setV0, toggleQuantumMode, quantumMode, toggleStoryMode } = useRLCStore()

  function goToChapter(idx: number) {
    setChapter(idx)
    const p = CHAPTERS[idx].params
    setR(p.R); setL(p.L); setC(p.C); setV0(p.V0)
    if (CHAPTERS[idx].quantum && !quantumMode) toggleQuantumMode()
    if (!CHAPTERS[idx].quantum && quantumMode) toggleQuantumMode()
  }

  const current = CHAPTERS[chapter]

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-95 z-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-gray-900 rounded-2xl p-8 border border-gray-700">
        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {CHAPTERS.map((c, i) => (
            <button key={i} onClick={() => goToChapter(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === chapter ? 'bg-blue-400 scale-125' : 'bg-gray-600 hover:bg-gray-400'}`} />
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-1">Chapter {current.id} of {CHAPTERS.length}</p>
        <h2 className="text-2xl font-bold text-white mb-1">{current.title}</h2>
        <p className="text-blue-400 text-sm mb-4">{current.tagline}</p>
        <p className="text-gray-300 mb-4 leading-relaxed">{current.description}</p>

        <div className="bg-gray-800 rounded-lg p-3 mb-6">
          <p className="text-yellow-400 text-sm">💡 {current.insight}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => chapter > 0 && goToChapter(chapter - 1)}
            disabled={chapter === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-sm text-white">
            ← Previous
          </button>
          {chapter < CHAPTERS.length - 1 ? (
            <button onClick={() => goToChapter(chapter + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-semibold">
              Next Chapter →
            </button>
          ) : (
            <button onClick={toggleStoryMode}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white font-semibold">
              ✓ Explore Freely
            </button>
          )}
          <button onClick={toggleStoryMode}
            className="ml-auto px-3 py-2 text-gray-500 hover:text-white text-sm">
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Checklist:**
- [ ] Story modal opens/closes from a "Story Mode" button
- [ ] Each chapter auto-sets sliders to correct R/L/C/V0
- [ ] Chapter 5 auto-enables quantum mode
- [ ] Progress dots navigate between chapters
- [ ] "Explore Freely" closes modal (params stay at last chapter's values)

---

### TASK 4.4 — Compare Mode (Hour 28–34)

Create `components/ComparePanel.tsx`:
```tsx
'use client'
import { useState, useMemo } from 'react'
import { solveRLC } from '@/lib/physics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PRESETS = {
  'Underdamped': { R: 10, L: 0.1, C: 0.001, V0: 10 },
  'Critical':    { R: 63.2, L: 0.1, C: 0.001, V0: 10 },
  'Overdamped':  { R: 150, L: 0.1, C: 0.001, V0: 10 },
  'High Q':      { R: 2, L: 0.1, C: 0.001, V0: 10 },
  'Low Q':       { R: 100, L: 0.1, C: 0.001, V0: 10 },
}

export default function ComparePanel() {
  const [presetA, setPresetA] = useState('Underdamped')
  const [presetB, setPresetB] = useState('Overdamped')

  const pA = PRESETS[presetA as keyof typeof PRESETS]
  const pB = PRESETS[presetB as keyof typeof PRESETS]
  const rA = useMemo(() => solveRLC(pA.R, pA.L, pA.C, pA.V0), [presetA])
  const rB = useMemo(() => solveRLC(pB.R, pB.L, pB.C, pB.V0), [presetB])

  const step = Math.max(1, Math.floor(rA.t.length / 150))
  const combined = rA.t.filter((_, i) => i % step === 0).map((t, j) => ({
    t: parseFloat(t.toFixed(4)),
    A: parseFloat(rA.V[j * step]?.toFixed(3) ?? '0'),
    B: parseFloat(rB.V[j * step]?.toFixed(3) ?? '0'),
  }))

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-300">⚖ Compare Mode</h2>
      <div className="flex gap-2">
        {(['A', 'B'] as const).map((side) => (
          <div key={side} className="flex-1">
            <label className={`text-xs ${side === 'A' ? 'text-blue-400' : 'text-orange-400'}`}>Config {side}</label>
            <select
              value={side === 'A' ? presetA : presetB}
              onChange={(e) => side === 'A' ? setPresetA(e.target.value) : setPresetB(e.target.value)}
              className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700 mt-1">
              {Object.keys(PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={combined}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="t" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#111827', border: 'none', color: '#e5e7eb' }} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
          <Line type="monotone" dataKey="A" stroke="#60a5fa" dot={false} strokeWidth={2} name={presetA} />
          <Line type="monotone" dataKey="B" stroke="#fb923c" dot={false} strokeWidth={2} name={presetB} />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-950 rounded p-2">
          <p className="text-blue-400 font-semibold">{presetA}</p>
          <p className="text-white">ζ = {rA.zeta.toFixed(3)}</p>
          <p className="text-white">Q = {rA.Q.toFixed(2)}</p>
          <p className="text-red-400">Loss: {rA.loss_percent.toFixed(1)}%</p>
        </div>
        <div className="bg-orange-950 rounded p-2">
          <p className="text-orange-400 font-semibold">{presetB}</p>
          <p className="text-white">ζ = {rB.zeta.toFixed(3)}</p>
          <p className="text-white">Q = {rB.Q.toFixed(2)}</p>
          <p className="text-red-400">Loss: {rB.loss_percent.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}
```

**Checklist:**
- [ ] Two dropdowns select different presets
- [ ] Both V(t) lines shown on same chart with different colors
- [ ] Metrics cards below each line
- [ ] Works without affecting main simulator state

---

### TASK 4.5 — Final Layout (Hour 34–40)

Upgrade `app/page.tsx` to include all new components:

```tsx
'use client'
import dynamic from 'next/dynamic'
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
import { useRLCStore } from '@/store/rlcStore'

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false })

export default function Home() {
  const { storyMode, compareMode, quantumMode, oscMode,
          toggleStoryMode, toggleCompareMode, result } = useRLCStore()

  const coherence = Math.max(0, 1 - result.loss_percent / 100)

  return (
    <main className={`min-h-screen p-4 transition-colors duration-300 ${oscMode ? 'bg-black font-mono' : 'bg-gray-950'} text-white`}>

      {/* CRT overlay */}
      {oscMode && <div className="pointer-events-none fixed inset-0 z-40" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)',
      }} />}

      {/* Story Mode Modal */}
      {storyMode && <StoryMode />}

      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${oscMode ? 'text-green-400' : 'text-blue-400'}`}>
            ⚡ RLC Ring-Down Energy Visualizer
          </h1>
          <p className="text-gray-500 text-xs">Interactive decay simulator · Classical ↔ Quantum Bridge</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleStoryMode} className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-xs text-white">📖 Story Mode</button>
          <button onClick={toggleCompareMode} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">⚖ Compare</button>
        </div>
      </header>

      {/* Timeline Bar — full width */}
      <div className="mb-4"><TimelineBar /></div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Controls */}
        <div className="col-span-3 space-y-3">
          <ControlPanel />
          <QuantumPanel />
          {compareMode && <ComparePanel />}
        </div>

        {/* Center: 3D + Plots */}
        <div className="col-span-6 space-y-3">
          <ThreeScene />
          <PlotPanel />
          <div className="grid grid-cols-2 gap-3">
            <FFTPlot />
            <PhasePortrait />
          </div>
        </div>

        {/* Right: Metrics + Quantum */}
        <div className="col-span-3 space-y-3">
          <MetricsPanel />
          {quantumMode && <BlochSphere coherence={coherence} />}
        </div>
      </div>
    </main>
  )
}
```

**Checklist:**
- [ ] Story Mode button opens modal
- [ ] Compare button toggles compare panel in left column
- [ ] Timeline bar full width above main grid
- [ ] Bloch sphere appears only in quantum mode
- [ ] FFT + phase portrait in 2-col grid below main plots
- [ ] CRT overlay applies in scope mode

---

## ✅ Final 48-Hour Submission Checklist

### Technical
- [ ] `npm run dev` runs with zero errors and zero console warnings
- [ ] All sliders update all panels simultaneously
- [ ] Play/Pause/Scrub works and syncs 3D scene + plots
- [ ] Mode switching: underdamped / critical / overdamped visually distinct
- [ ] FFT peak matches theoretical omega0/(2π)
- [ ] Phase portrait spiral visible for underdamped
- [ ] Quantum mode shows Bloch sphere shrinking
- [ ] Story mode walks through all 5 chapters
- [ ] Oscilloscope skin toggle works
- [ ] Compare mode shows two configs side by side

### Presentation
- [ ] Demo video recorded (4–5 min screen recording)
- [ ] Open with oscilloscope skin (first impression)
- [ ] Press PLAY in first 30 seconds
- [ ] Walk through story mode
- [ ] Toggle quantum mode — explain the bridge
- [ ] Open compare mode — underdamped vs overdamped
- [ ] Point to FFT peak — explain resonance frequency
- [ ] End: "Fully interactive, physics-accurate, quantum-connected"
