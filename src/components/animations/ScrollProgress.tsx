"use client"
import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"

/**
 * Vertical scroll progress indicator on the right side of the viewport.
 * A thin line that fills proportionally to page scroll.
 * Hidden on mobile and when prefers-reduced-motion is active.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768
    const prefersMotion = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    queueMicrotask(() => setVisible(isDesktop && prefersMotion))
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      aria-hidden
    >
      {/* Track */}
      <div className="w-[1px] h-[120px] bg-[#0a0a0a] opacity-[0.08] relative">
        {/* Fill */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-[#0a0a0a] opacity-60"
          style={{ height }}
        />
      </div>
    </div>
  )
}
