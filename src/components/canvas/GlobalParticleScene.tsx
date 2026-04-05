"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { BRAND_COLORS } from "@/lib/colors"

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const particlesCount = 3000

  // useMemo and Math.random can trigger impurity warnings. Using useState lazy initializer instead.
  const [positions] = useState(() => {
    const array = new Float32Array(particlesCount * 3)
    for (let i = 0; i < array.length; i++) {
      // Range from -15 to 15 to cover larger global screen area
      array[i] = (Math.random() - 0.5) * 30 
      // Distribute more vertically
      if (i % 3 === 1) {
        array[i] = (Math.random() - 0.5) * 40
      }
    }
    return array
  })

  // Create a procedural soft circle texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext("2d")
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      
      context.fillStyle = gradient
      context.beginPath()
      context.arc(32, 32, 32, 0, Math.PI * 2)
      context.fill()
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    
    // Animation: Slow global rotation on its axes
    pointsRef.current.rotation.y += delta * 0.02
    pointsRef.current.rotation.x += delta * 0.01

    // Interactivity: the container moves subtly towards the mouse
    const targetX = state.pointer.x * 2.0 // Increased amplifier due to global scale
    const targetY = state.pointer.y * 2.0
    
    // Linear interpolation for smoother movement
    pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.02
    pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.02
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={BRAND_COLORS.amber}
        map={particleTexture}
        transparent
        opacity={0.6} // Slightly more transparent for global overlay
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function GlobalParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }} // Pulled back to see more particles
      dpr={[1, 1.5]} // Optimized max dpr for full-screen particles
      gl={{ antialias: false, alpha: true }} 
      style={{ pointerEvents: 'none' }} // Crucial: Let clicks pass through to HTML
      eventSource={typeof document !== 'undefined' ? document.body : undefined} // Track mouse globally
    >
      {/* Soft Ambient to illuminate particles if they had standard material, but PointsMaterial uses absolute color mostly */}
      <ambientLight intensity={0.5} />
      <ParticleField />
    </Canvas>
  )
}
