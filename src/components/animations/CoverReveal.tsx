"use client"
import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "motion/react"
import type { ReactNode } from "react"

interface CoverRevealProps {
  children: ReactNode
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div"
  className?: string
  delay?: number
  /** "dark" uses a white overlay (for dark backgrounds), "light" uses a dark overlay */
  variant?: "light" | "dark"
  /** Duration of the full reveal cycle in seconds */
  duration?: number
}

/**
 * Palantir-style cover reveal: an overlay sweeps in from the left,
 * then slides off to the right — revealing the content underneath.
 *
 * On mobile (<768px) falls back to a simple FadeInUp.
 * Respects prefers-reduced-motion.
 */
export function CoverReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  variant = "light",
  duration = 0.9,
}: CoverRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
      setIsMobile(window.innerWidth < 768)
    })
  }, [])

  const overlayColor = variant === "dark" ? "#ffffff" : "#0a0a0a"

  // Reduced motion: render static
  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>
  }

  // Mobile: simple FadeInUp using motion.div wrapper
  if (isMobile) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Tag>{children}</Tag>
      </motion.div>
    )
  }

  // Desktop: two-phase cover reveal
  const halfDuration = duration / 2

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Content — hidden until overlay midpoint, then visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 0.01, delay: delay + halfDuration * 0.9 }}
      >
        <Tag className={`block ${className}`}>{children}</Tag>
      </motion.div>

      {/* Sliding overlay: sweeps left→right to cover, then left→right to reveal */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{ backgroundColor: overlayColor }}
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={
          isInView
            ? {
                scaleX: [0, 1, 1, 0],
                transformOrigin: ["left", "left", "right", "right"],
              }
            : { scaleX: 0 }
        }
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.45, 0.55, 1],
        }}
      />
    </div>
  )
}
