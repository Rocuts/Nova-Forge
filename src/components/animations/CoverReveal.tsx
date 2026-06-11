"use client"
import { useEffect, useRef, useState } from "react"
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
  /**
   * Above-the-fold / LCP content: the text is visible in the server-rendered
   * HTML (no hidden phase), and the overlay sweeps across it after hydration.
   * Keeps first paint fast — use for hero headlines.
   */
  priority?: boolean
}

/**
 * Palantir-style cover reveal: an overlay sweeps in from the left (covering),
 * then slides off to the right (revealing the content underneath).
 *
 * Uses a vanilla IntersectionObserver that disconnects after first trigger
 * to avoid re-triggering when overlays (e.g. mega menu) cover the page.
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
  priority = false,
}: CoverRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasRevealed, setHasRevealed] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    queueMicrotask(() => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
      setIsMobile(window.innerWidth < 768)
    })
  }, [])

  // Vanilla IntersectionObserver — disconnects after first trigger
  useEffect(() => {
    const el = wrapperRef.current
    if (!el || prefersReducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const overlayColor = variant === "dark" ? "#ffffff" : "#0a0a0a"
  const halfDuration = duration / 2

  // Reduced motion: render static
  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>
  }

  // Priority content stays visible on mobile — never gate the LCP paint
  if (priority && isMobile) {
    return <Tag className={className}>{children}</Tag>
  }

  // Mobile: simple FadeInUp (uses IntersectionObserver via hasRevealed)
  if (isMobile) {
    return (
      <motion.div
        ref={wrapperRef}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={hasRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Tag>{children}</Tag>
      </motion.div>
    )
  }

  // Desktop: two-phase cover reveal using translateX
  return (
    <motion.div
      ref={wrapperRef}
      className="relative overflow-hidden"
      initial="hidden"
      animate={hasRevealed ? "visible" : "hidden"}
    >
      {/* Content — priority content is painted from SSR; otherwise it fades
          in at the midpoint when the overlay covers it */}
      <motion.div
        variants={
          priority
            ? undefined
            : {
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.01, delay: delay + halfDuration * 0.85 },
                },
              }
        }
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
