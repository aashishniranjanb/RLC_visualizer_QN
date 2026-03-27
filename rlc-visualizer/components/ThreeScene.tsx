'use client'
// components/ThreeScene.tsx
// MEMBER 2 — Phase 2: Animated Energy Flow & Particles

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Grid, ContactShadows } from '@react-three/drei'
import { useRef, useMemo, useState, useEffect } from 'react'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useRLCStore } from '@/store/rlcStore'

// ─────────────────────────────────────────────────────────────
// Animated Particles Layer
// ─────────────────────────────────────────────────────────────

function FlowParticles({
  from, to, count, speed, color, opacity, curve = 0.5
}: {
  from: [number, number, number],
  to: [number, number, number],
  count: number,
  speed: number,
  color: string,
  opacity: number,
  curve?: number
}) {
  const ref = useRef<THREE.Points>(null)
  
  // Initial random offsets for each particle
  // eslint-disable-next-line
  const offsets = useMemo(() => new Float32Array(count).map(() => Math.random()), [count])
  
  const positions = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((state) => {
    if (!ref.current || count === 0) return
    const posAttr = ref.current.geometry.attributes.position
    const pos = posAttr.array as Float32Array
    const time = state.clock.getElapsedTime() * speed

    for (let i = 0; i < count; i++) {
      const progress = (offsets[i] + time) % 1
      
      // Arc path calculation
      const x = from[0] + (to[0] - from[0]) * progress
      const y = from[1] + (to[1] - from[1]) * progress + Math.sin(progress * Math.PI) * curve
      const z = from[2] + (to[2] - from[2]) * progress
      
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
    }
    posAttr.needsUpdate = true
  })

  if (count === 0 || opacity < 0.05) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        {/* @ts-expect-error R3F types mismatch with React 19 */}
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={0.08} 
        transparent 
        opacity={opacity} 
        sizeAttenuation 
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─────────────────────────────────────────────────────────────
// Physical Components with Time-Sync Glow
// ─────────────────────────────────────────────────────────────

function Capacitor({ energyNorm }: { energyNorm: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      // Pulse effect on top of base energy glow
      mat.emissiveIntensity = energyNorm * 6 + Math.sin(clock.getElapsedTime() * 10) * energyNorm * 1.5
    }
  })

  return (
    <group position={[-2.5, 0.5, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.4, 0.12, 1]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={energyNorm * 4} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[1.4, 0.12, 1]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={energyNorm * 4} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Dynamic dielectric field lines */}
      {[ -0.4, -0.2, 0, 0.2, 0.4 ].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} ref={i === 2 ? meshRef : null}>
          <cylinderGeometry args={[0.015, 0.015, 0.7]} />
          <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={energyNorm * 8} transparent opacity={energyNorm * 0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Inductor({ energyNorm }: { energyNorm: number }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Rotation speed tied to energy
      groupRef.current.rotation.y += energyNorm * delta * 8
    }
  })

  return (
    <group position={[2.5, 0.5, 0]} ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      {[0.6, 0.3, 0, -0.3, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.45, 0.08, 16, 40]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={energyNorm * 10} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Resistor({ lossNorm }: { lossNorm: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      // Heat shimmer/flicker
      mat.emissiveIntensity = lossNorm * 4 + Math.sin(clock.getElapsedTime() * 20) * lossNorm * 1.0
    }
  })

  return (
    <group position={[0, -1.8, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.7, 0.6, 0.6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={lossNorm * 3} roughness={0.8} />
      </mesh>
      {/* Resistance bands */}
      {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.31]}>
          <boxGeometry args={[0.15, 0.62, 0.02]} />
          <meshStandardMaterial color={['#fbbf24', '#10b981', '#f97316', '#7c3aed'][i]} />
        </mesh>
      ))}
    </group>
  )
}

function CircuitLayout() {
  const { result, timeIndex, oscMode } = useRLCStore()
  
  // Snyc to current playback time
  const idx = Math.min(timeIndex, result.t.length - 1)
  const E0 = result.E_total[0] || 1
  const E_cap_norm = Math.max(0, result.E_cap[idx] / E0)
  const E_ind_norm = Math.max(0, result.E_ind[idx] / E0)
  const loss_norm = Math.min(1, result.loss_percent / 100)

  // Energy transfer direction particles
  const capToIndCount = Math.floor(E_cap_norm * 30)
  const indToCapCount = Math.floor(E_ind_norm * 30)
  const drainToResCount = Math.floor(loss_norm * 20)

  return (
    <group>
      <Capacitor energyNorm={E_cap_norm} />
      <Inductor energyNorm={E_ind_norm} />
      <Resistor lossNorm={loss_norm} />

      {/* Energy flow C -> L */}
      <FlowParticles 
        from={[-2.5, 1.5, 0]} to={[2.5, 1.5, 0]} 
        count={capToIndCount} speed={2} color="#60a5fa" opacity={E_cap_norm} 
      />
      {/* Energy flow L -> C */}
      <FlowParticles 
        from={[2.5, 1.5, 0]} to={[-2.5, 1.5, 0]} 
        count={indToCapCount} speed={2} color="#f97316" opacity={E_ind_norm} 
      />
      {/* Heat drain to Resistor */}
      <FlowParticles 
        from={[0, 1.5, 0]} to={[0, -1.5, 0]} 
        count={drainToResCount} speed={1.5} color="#ef4444" opacity={loss_norm} curve={0.1}
      />

      {/* Connection Wires */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 5]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
      <mesh position={[-2.5, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
      <mesh position={[2.5, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={5} color="#000000" />
      {oscMode && <Grid position={[0, -2.5, 0]} args={[20, 20]} cellColor="#052e16" sectionColor="#14532d" fadeDistance={15} />}
      {oscMode && <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />}
    </group>
  )
}

export default function ThreeScene() {
  const [mounted, setMounted] = useState(false)
  const { result, oscMode } = useRLCStore()

  // eslint-disable-next-line
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <div className="w-full h-80 rounded-3xl bg-gray-950 flex items-center justify-center border border-white/5">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Synchronising Neural Core</p>
      </div>
    </div>
  )

  const modeColors = { underdamped: '#60a5fa', critical: '#facc15', overdamped: '#f87171' }

  return (
    <div className="w-full h-[450px] relative rounded-[2.5rem] overflow-hidden group">
      {/* HUD Overlays */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none space-y-2">
        <div className="glass px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-xl">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: modeColors[result.mode] }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {result.mode} MODE
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="flex flex-col gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Electric Field (Cap)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Magnetic Field (Ind)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Thermal Dissipation
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 2, 9], fov: 40 }}
        shadows
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[oscMode ? '#000000' : '#030712']} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[5, -5, 5]} intensity={0.5} color="#f97316" />
        
        <CircuitLayout />
        
        {/* @ts-expect-error R3F types updated */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.2} />
          <Noise opacity={0.03} />
          <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
        </EffectComposer>
        
        <OrbitControls 
          enablePan={false} 
          maxDistance={15} 
          minDistance={5} 
          dampingFactor={0.05} 
          autoRotate={!oscMode}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
