"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { MouseEvent } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react"

export const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateXBase = useMotionValue(0)
  const rotateYBase = useMotionValue(0)
  const contentXBase = useMotionValue(0)
  const contentYBase = useMotionValue(0)

  const rotateX = useSpring(rotateXBase, { stiffness: 150, damping: 20 })
  const rotateY = useSpring(rotateYBase, { stiffness: 150, damping: 20 })
  const contentX = useSpring(contentXBase, { stiffness: 150, damping: 20 })
  const contentY = useSpring(contentYBase, { stiffness: 150, damping: 20 })

  // Hoist useMotionTemplate to component body (hooks cannot be called in JSX)
  const glowBackground = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(0, 240, 255, 0.15),
      transparent 80%
    )
  `

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (prefersReducedMotion) return
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)

    // Normalized -1 to 1
    const normalizedX = ((clientX - left) / width - 0.5) * 2
    const normalizedY = ((clientY - top) / height - 0.5) * 2

    // rotateX is driven by Y mouse position (inverted), rotateY by X
    rotateXBase.set(-normalizedY * 8)
    rotateYBase.set(normalizedX * 8)

    // Content moves opposite to mouse for depth
    contentXBase.set(-normalizedX * 4)
    contentYBase.set(-normalizedY * 4)
  }

  function handleMouseLeave() {
    rotateXBase.set(0)
    rotateYBase.set(0)
    contentXBase.set(0)
    contentYBase.set(0)
  }

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("relative group rounded-[var(--radius-lg)]", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 800,
      }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glow overlay */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[var(--radius-lg)] opacity-0 transition duration-500 group-hover:opacity-100 z-0"
          style={{
            background: glowBackground,
          }}
        />
        {/* Content with counter-movement */}
        <motion.div
          className="relative h-full w-full glass-panel rounded-[var(--radius-lg)] p-8 z-10 transition-colors duration-500 group-hover:bg-surface-elevated/40"
          style={{ x: contentX, y: contentY }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
