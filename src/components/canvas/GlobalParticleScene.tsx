"use client"

import { useMemo, useRef, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"
import { BRAND_COLORS } from "@/lib/colors"
import { useIsMobile } from "@/lib/useIsMobile"

const PARTICLE_COUNT_DESKTOP = 2000
const PARTICLE_COUNT_MOBILE = 500

function createParticlePositions(count: number) {
  const array = new Float32Array(count * 3)
  for (let i = 0; i < array.length; i++) {
    array[i] = (Math.random() - 0.5) * 30
    if (i % 3 === 1) {
      array[i] = (Math.random() - 0.5) * 40
    }
  }
  return array
}

function createParticleTexture() {
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
  return new THREE.CanvasTexture(canvas)
}

function ParticleField({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const scrollSpeedRef = useRef(0)
  const prevScrollRef = useRef(0)

  const particlesCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP

  const positions = useMemo(() => createParticlePositions(particlesCount), [particlesCount])

  const particleTexture = useMemo(() => createParticleTexture(), [])

  // Dispose the CanvasTexture on unmount to prevent GPU memory leak
  useEffect(() => {
    return () => {
      particleTexture.dispose()
    }
  }, [particleTexture])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    // Track scroll velocity to make particles react
    const currentScroll = window.scrollY
    const scrollDelta = currentScroll - prevScrollRef.current
    prevScrollRef.current = currentScroll

    // Smooth the scroll speed (eased accumulation)
    scrollSpeedRef.current += (Math.abs(scrollDelta) * 0.003 - scrollSpeedRef.current) * 0.1

    // Base rotation + scroll-boosted rotation
    const scrollBoost = 1 + scrollSpeedRef.current * 8
    pointsRef.current.rotation.y += delta * 0.02 * scrollBoost
    pointsRef.current.rotation.x += delta * 0.01 * scrollBoost

    // Scroll direction tilts the particle field
    const targetTiltZ = scrollDelta * 0.0003
    pointsRef.current.rotation.z += (targetTiltZ - pointsRef.current.rotation.z) * 0.05

    // Mouse tracking (skip on mobile — pointer data is unreliable there)
    if (!isMobile) {
      const targetX = state.pointer.x * 2.0
      const targetY = state.pointer.y * 2.0
      pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.02
      pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.02
    }

    // Subtle size pulse based on scroll velocity
    const material = pointsRef.current.material as THREE.PointsMaterial
    const targetSize = 0.08 + scrollSpeedRef.current * 0.15
    material.size += (targetSize - material.size) * 0.1
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
        color={BRAND_COLORS.cyan}
        map={particleTexture}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function GlobalParticleScene() {
  const isMobile = useIsMobile()

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <ParticleField isMobile={isMobile} />
        <EffectComposer multisampling={isMobile ? 0 : 4}>
          <Bloom
            luminanceThreshold={0.5}
            mipmapBlur={!isMobile}
            intensity={isMobile ? 0.3 : 1.5}
          />
          <Vignette eskil={false} offset={0.1} darkness={isMobile ? 0 : 0.8} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
