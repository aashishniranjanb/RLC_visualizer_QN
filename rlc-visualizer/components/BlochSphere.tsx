'use client'
// components/BlochSphere.tsx
// MEMBER 2 — Qubit Visualization
// Represents the quantum state mapping classical RLC decay to qubit decoherence.

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function StateVector({ coherence }: { coherence: number }) {
  const arrowRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (arrowRef.current) {
      // Rotate to look dynamic
      const time = state.clock.getElapsedTime()
      arrowRef.current.rotation.y = time * 2
      arrowRef.current.rotation.z = Math.sin(time * 0.5) * 0.2
      // Scaled by coherence
      arrowRef.current.scale.set(coherence, coherence, coherence)
    }
  })

  return (
    <group ref={arrowRef}>
      {/* State arrow */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.1, 0.2]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={4} />
      </mesh>
    </group>
  )
}

function BlochAxes() {
  return (
    <group>
      {/* X Axis */}
      <gridHelper args={[4, 1, 0x374151, 0x374151]} rotation={[Math.PI / 2, 0, 0]} />
      {/* Sphere shell */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.05} 
          wireframe 
        />
      </mesh>
      {/* Labels placeholder can be added with Drei's Text, but keeping it clean for now */}
    </group>
  )
}

export default function BlochSphere({ coherence }: { coherence: number }) {
  return (
    <div className="w-full h-64 bg-gray-950/50 rounded-2xl border border-white/5 relative overflow-hidden glass shadow-inner">
      <div className="absolute top-3 left-4 z-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Bloch Sphere Representation</h3>
        <p className="text-[8px] text-gray-500 font-bold tracking-wider">RELAXATION: |ψ⟩ → |0⟩</p>
      </div>

      <Canvas dpr={[1, 2]} gl={{ alpha: true }}>
        <PerspectiveCamera makeDefault position={[4, 4, 4]} fov={40} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <BlochAxes />
        <StateVector coherence={Math.max(0.1, coherence)} />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-3 right-4 z-10 text-right">
        <p className="text-[10px] font-mono text-blue-300">Coherence (1 - loss): {(coherence * 100).toFixed(1)}%</p>
      </div>
    </div>
  )
}
