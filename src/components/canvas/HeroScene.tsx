"use client"

import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { Vector2 } from "three"
import * as THREE from "three"
import { BRAND_COLORS } from "@/lib/colors"
import { useIsMobile } from "@/lib/useIsMobile"

const CHROMATIC_OFFSET_DESKTOP = new Vector2(0.002, 0.002)
const CHROMATIC_OFFSET_NONE = new Vector2(0, 0)

/* ── Shaders (stable string references) ── */
const vertexShader = /* glsl */ `
  uniform float uProgress;
  varying float vDistance;

  void main() {
    vec3 exploded = position + normal * uProgress * 5.0;
    vec3 pos = mix(position, exploded, uProgress);

    vDistance = length(pos);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = max(3.0 * (1.0 - uProgress * 0.5) * (300.0 / -mvPosition.z), 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uProgress;
  varying float vDistance;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    vec3 color = mix(uColor, uEmissive, uProgress * 0.5);

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= max(1.0 - uProgress * vDistance * 0.15, 0.0);

    gl_FragColor = vec4(color, alpha);
  }
`

function DissolvingIcosahedron({ progress }: { progress: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { positions, normals } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 3)
    const pos = geo.attributes.position.array as Float32Array
    const norm = geo.attributes.normal.array as Float32Array
    geo.dispose()
    return { positions: new Float32Array(pos), normals: new Float32Array(norm) }
  }, [])

  // Memoize uniforms so Three.js reuses the same objects across renders
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color(BRAND_COLORS.orangeRed) },
      uEmissive: { value: new THREE.Color(BRAND_COLORS.cyan) },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!pointsRef.current || !materialRef.current) return
    pointsRef.current.rotation.y += delta * 0.2
    pointsRef.current.rotation.x += delta * 0.1
    materialRef.current.uniforms.uProgress.value = progress.current
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[normals, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Float>
  )
}

interface HeroSceneProps {
  scrollProgressRef?: React.MutableRefObject<number>
}

export default function HeroScene({ scrollProgressRef }: HeroSceneProps) {
  const fallbackRef = useRef(0)
  const progressRef = scrollProgressRef ?? fallbackRef
  const isMobile = useIsMobile()

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} color={BRAND_COLORS.cyan} intensity={1} />

        <DissolvingIcosahedron progress={progressRef} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} mipmapBlur={true} intensity={isMobile ? 1.0 : 2.0} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={isMobile ? CHROMATIC_OFFSET_NONE : CHROMATIC_OFFSET_DESKTOP}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
