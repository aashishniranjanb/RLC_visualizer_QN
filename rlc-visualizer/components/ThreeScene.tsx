'use client'
// components/ThreeScene.tsx
// MEMBER 2 — 3D Visualization
// React Three Fiber scene with animated RLC circuit components

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useRLCStore } from '@/store/rlcStore'

// ─────────────────────────────────────────────────────────────
// Capacitor — two flat blue plates with electric field lines
// ─────────────────────────────────────────────────────────────
function Capacitor({ energyNorm }: { energyNorm: number }) {
  const glowIntensity = energyNorm * 3
  const fieldOpacity = energyNorm * 0.9

  return (
    <group position={[-2.2, 0, 0]}>
      {/* Top plate */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.1, 0.09, 0.85]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={glowIntensity}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Bottom plate */}
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[1.1, 0.09, 0.85]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={glowIntensity}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Electric field lines between plates */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) =>
        [-0.25, 0, 0.25].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.008, 0.008, 0.55, 6]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#93c5fd"
              emissiveIntensity={fieldOpacity * 2}
              transparent
              opacity={fieldOpacity}
            />
          </mesh>
        ))
      )}

      {/* Label */}
      <Text position={[0, -0.85, 0]} fontSize={0.18} color="#60a5fa" anchorX="center">
        C
      </Text>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// Inductor — stacked coils (torus) that rotate by energy level
// ─────────────────────────────────────────────────────────────
function Inductor({ energyNorm }: { energyNorm: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Rotation speed proportional to energy in inductor
      groupRef.current.rotation.y += energyNorm * delta * 4
    }
  })

  const glowIntensity = energyNorm * 3
  const ringYPositions = [-0.6, -0.3, 0, 0.3, 0.6]

  return (
    <group position={[2.2, 0, 0]} ref={groupRef}>
      {ringYPositions.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.42, 0.07, 12, 28]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={glowIntensity}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Core cylinder */}
      <mesh>
        <cylinderGeometry args={[0.10, 0.10, 1.4, 10]} />
        <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.2} />
      </mesh>

      <Text position={[0, -1.05, 0]} fontSize={0.18} color="#fb923c" anchorX="center">
        L
      </Text>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// Resistor — red box with heat shimmer proportional to loss%
// ─────────────────────────────────────────────────────────────
function Resistor({ lossNorm }: { lossNorm: number }) {
  const heatRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (heatRef.current) {
      // Subtle heat shimmer oscillation
      const pulse = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 8 * (lossNorm + 0.1))
      heatRef.current.scale.y = pulse
    }
  })

  const glowIntensity = lossNorm * 2

  return (
    <group position={[0, -1.8, 0]}>
      {/* Main resistor body */}
      <mesh ref={heatRef}>
        <boxGeometry args={[1.3, 0.45, 0.45]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={glowIntensity}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>

      {/* End caps / leads */}
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} rotation-z={Math.PI / 2} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Heat particles (animated dots rising) */}
      {lossNorm > 0.3 && [0].map((_, i) => (
        <HeatParticles key={i} intensity={lossNorm} />
      ))}

      <Text position={[0, -0.6, 0]} fontSize={0.18} color="#f87171" anchorX="center">
        R
      </Text>
    </group>
  )
}

// Animated heat particles that rise from resistor when loss is high
function HeatParticles({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Points>(null)
  const count = 12

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 1.0
      arr[i * 3 + 1] = Math.random() * 0.8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += 0.008 * intensity
        if (pos[i * 3 + 1] > 1.2) {
          pos[i * 3 + 1] = 0
          pos[i * 3] = (Math.random() - 0.5) * 1.0
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#fbbf24" size={0.06} transparent opacity={intensity * 0.8} />
    </points>
  )
}

// ─────────────────────────────────────────────────────────────
// Energy Flow Lines — animated lines between components
// ─────────────────────────────────────────────────────────────
function EnergyFlowLines({ energyNorm, mode }: { energyNorm: number; mode: string }) {
  const lineRef = useRef<THREE.Line>(null)

  useFrame((state) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial
      // Pulse for underdamped, steady fade for others
      const pulse = mode === 'underdamped'
        ? energyNorm * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 6))
        : energyNorm * 0.7
      mat.opacity = Math.max(0.05, pulse)
    }
  })

  // Triangle: Capacitor → Inductor → Resistor → Capacitor
  const points = [
    new THREE.Vector3(-2.2, 0, 0),
    new THREE.Vector3(2.2, 0, 0),
    new THREE.Vector3(0, -1.8, 0),
    new THREE.Vector3(-2.2, 0, 0),
  ]

  return (
    <Line
      points={points}
      color={mode === 'underdamped' ? '#6366f1' : mode === 'critical' ? '#eab308' : '#ef4444'}
      lineWidth={1.5}
      transparent
      opacity={energyNorm * 0.6}
      dashed={mode !== 'underdamped'}
      dashSize={0.2}
      gapSize={0.1}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// Scene Background Grid
// ─────────────────────────────────────────────────────────────
function GridFloor() {
  return (
    <gridHelper
      args={[12, 12, '#1f2937', '#111827']}
      position={[0, -2.8, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// Animated Scene — reads current frame index from useFrame
// ─────────────────────────────────────────────────────────────
function AnimatedScene() {
  const { result } = useRLCStore()
  const frameRef = useRef(0)
  const N = result.t.length

  useFrame((state) => {
    // Advance through time array at a comfortable speed (one lap = ~4s)
    frameRef.current = Math.floor(
      (state.clock.elapsedTime / 4) * N
    ) % N
  })

  // Normalize energy values relative to initial energy
  const E0 = result.E_total[0] || 1

  const idx = frameRef.current
  const E_cap_norm = result.E_cap[idx] / E0
  const E_ind_norm = result.E_ind[idx] / E0
  const loss_norm = result.loss_percent / 100
  const total_norm = result.E_total[idx] / E0

  return (
    <>
      <Capacitor energyNorm={Math.max(0, Math.min(1, E_cap_norm))} />
      <Inductor energyNorm={Math.max(0, Math.min(1, E_ind_norm))} />
      <Resistor lossNorm={Math.max(0, Math.min(1, loss_norm))} />
      <EnergyFlowLines energyNorm={Math.max(0, Math.min(1, total_norm))} mode={result.mode} />
      <GridFloor />
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Main ThreeScene Export
// ─────────────────────────────────────────────────────────────
export default function ThreeScene() {
  const { result } = useRLCStore()

  const modeColors = {
    underdamped: '#60a5fa',
    critical: '#facc15',
    overdamped: '#f87171',
  }

  const modeLabels = {
    underdamped: 'Underdamped — Oscillating Decay',
    critical: 'Critically Damped — Fastest Decay',
    overdamped: 'Overdamped — Slow Exponential Decay',
  }

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%)', border: '1px solid #1e293b' }}>

      {/* Mode badge overlay */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: modeColors[result.mode] }}
        />
        <span className="text-xs font-semibold" style={{ color: modeColors[result.mode] }}>
          {modeLabels[result.mode]}
        </span>
      </div>

      {/* Energy indicators overlay */}
      <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1 text-xs">
        <span style={{ color: '#60a5fa' }}>● E_cap</span>
        <span style={{ color: '#fb923c' }}>● E_ind</span>
        <span style={{ color: '#ef4444' }}>● Heat</span>
      </div>

      <Canvas
        camera={{ position: [0, 2.5, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting for premium look */}
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-5, -3, -2]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#f97316" />

        <AnimatedScene />

        <OrbitControls
          enablePan={false}
          maxDistance={12}
          minDistance={4}
          enableDamping
          dampingFactor={0.08}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
