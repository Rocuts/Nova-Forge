"use client"
import { useRef, useState, useEffect, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  magneticStrength?: number
}

export function MagneticButton({
  children,
  className,
  magneticStrength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    queueMicrotask(() => setIsEnabled(isPointerFine && !prefersReducedMotion))
  }, [])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const textX = useMotionValue(0)
  const textY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15 }
  const sx = useSpring(x, springConfig)
  const sy = useSpring(y, springConfig)
  const stx = useSpring(textX, springConfig)
  const sty = useSpring(textY, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEnabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)

    if (distance < 100) {
      x.set(distX * magneticStrength)
      y.set(distY * magneticStrength)
      // Text moves in opposite direction for parallax
      textX.set(distX * magneticStrength * -0.5)
      textY.set(distY * magneticStrength * -0.5)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    textX.set(0)
    textY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ x: stx, y: sty }}>
        {children}
      </motion.div>
    </motion.div>
  )
}
