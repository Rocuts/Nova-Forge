"use client"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
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
 * Palantir-style cover reveal: an overlay sweeps in from the left (covering),
 * then slides off to the right (revealing the content underneath).
 *
 * Uses whileInView + variants for reliable triggering.
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
  const halfDuration = duration / 2

  // Reduced motion: render static
  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>
  }

  // Mobile: simple FadeInUp
  if (isMobile) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Tag>{children}</Tag>
      </motion.div>
    )
  }

  // Desktop: two-phase cover reveal using translateX
  return (
    <motion.div
      className="relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Content — fades in at the midpoint when overlay covers it */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.01, delay: delay + halfDuration * 0.85 },
          },
        }}
      >
        <Tag className={`block ${className}`}>{children}</Tag>
      </motion.div>

      {/* Overlay: slides in from left, then exits to right */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{ backgroundColor: overlayColor }}
        variants={{
          hidden: { x: "-101%" },
          visible: {
            x: ["-101%", "0%", "0%", "101%"],
            transition: {
              duration,
              delay,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.4, 0.55, 1],
            },
          },
        }}
      />
    </motion.div>
  )
}
