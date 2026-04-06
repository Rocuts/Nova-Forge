"use client"
import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"
import { BRAND_COLORS } from "@/lib/colors"

// Generador pseudo-aleatorio para distribuir puntos en una esfera
function generatePoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(Math.random() * 2 - 1)
    
    // Distorsión del radio para darle un aspecto orgánico (biotech)
    const r = radius * (0.8 + Math.random() * 0.4)
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  return positions
}

function Starfield() {
  const ref = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })
  
  // 5000 puntos en un radio inicial
  const sphere = useMemo(() => generatePoints(5000, 1.5), [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      // Rotación base contínua y elegante
      ref.current.rotation.x -= delta / 15
      ref.current.rotation.y -= delta / 20
      
      // Efecto fluido de atracción/parallax gravitacional con el mouse
      ref.current.position.x += (mouse.current.x * 0.5 - ref.current.position.x) * 0.05
      ref.current.position.y += (mouse.current.y * 0.5 - ref.current.position.y) * 0.05
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={BRAND_COLORS.cyan}
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  )
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Starfield />
      </Canvas>
    </div>
  )
}
