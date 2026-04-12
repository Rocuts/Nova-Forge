"use client"

import { useRef } from "react"
import { useScroll, useTransform, useSpring } from "motion/react"

/**
 * Scroll-linked parallax: element moves by `distance` px over its viewport traversal.
 * Positive distance = moves down relative to scroll; negative = moves up.
 */
export function useParallax(distance: number = 30) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const rawY = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const y = useSpring(rawY, { stiffness: 100, damping: 30, mass: 0.5 })

  return { ref, y, scrollYProgress }
}

/**
 * Scroll-linked scale: element scales from `from` to `to` as it enters viewport.
 */
export function useScrollScale(from: number = 0.97, to: number = 1) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.8"],
  })

  const rawScale = useTransform(scrollYProgress, [0, 1], [from, to])
  const scale = useSpring(rawScale, { stiffness: 100, damping: 30 })

  return { ref, scale, scrollYProgress }
}

/**
 * Scroll-linked opacity: fades in as element enters viewport.
 */
export function useScrollOpacity(start: number = 0, end: number = 1) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.7"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [start, end, end])

  return { ref, opacity, scrollYProgress }
}

/**
 * Combined parallax + scale for subtle section entrances.
 */
export function useSectionEntrance() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [30, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.8, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1])

  const smoothY = useSpring(y, { stiffness: 80, damping: 25 })
  const smoothScale = useSpring(scale, { stiffness: 80, damping: 25 })

  return { ref, y: smoothY, opacity, scale: smoothScale, scrollYProgress }
}
