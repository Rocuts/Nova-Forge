"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { BRAND_COLORS } from "@/lib/colors"

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    // Continuous rotation on Y axis
    meshRef.current.rotation.y += delta * 0.2
    // Continuous rotation on X axis
    meshRef.current.rotation.x += delta * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshPhysicalMaterial
          wireframe={true}
          color={BRAND_COLORS.orangeRed}
          emissive={BRAND_COLORS.cyan}
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]} // Reasonable limit for performance
      gl={{ antialias: false, powerPreference: "high-performance" }} // Bloom often doesn't need native antialiasing
    >
      {/* Black transparent background if needed, but the wrapper is already black. */}
      {/* <color attach="background" args={['#050505']} /> */}
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} color={BRAND_COLORS.cyan} intensity={1} />
      
      {/* Elements */}
      <AbstractShape />
      
      {/* Post-processing */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur={true} 
          intensity={1.5} 
        />
      </EffectComposer>
    </Canvas>
  )
}
