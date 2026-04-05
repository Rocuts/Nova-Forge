"use client"
import { useEffect, useState } from "react"
import { useScroll, useVelocity, useTransform, useSpring, useMotionValue, type MotionValue } from "motion/react"

export function useScrollVelocitySkew(): MotionValue<number> {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    queueMicrotask(() =>
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    )
  }, [])

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)

  // Map velocity to skew degrees, clamped
  const skewY = useTransform(scrollVelocity, [-3000, 0, 3000], [-2, 0, 2])

  // Spring for smooth return
  const smoothSkew = useSpring(skewY, { stiffness: 100, damping: 30 })

  // Return a static zero when reduced motion is preferred
  const zero = useMotionValue(0)

  return prefersReducedMotion ? zero : smoothSkew
}
