"use client"
import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import type { ElementType } from "react"

/* ── shared types ────────────────────────────────────────────────── */
interface RevealTextProps {
  children: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  className?: string
  delay?: number
  /** Animate font-weight from 300→700 as element scrolls into view (requires variable font) */
  animateWeight?: boolean
}

/* ── word-level reveal (sections) ────────────────────────────────── */
const wordContainerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
}

const wordVariants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function RevealText({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  animateWeight = false,
}: RevealTextProps) {
  const MotionTag = motion.create(Tag as ElementType) as React.ComponentType<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    queueMicrotask(() =>
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    )
  }, [])

  const weightRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: animateWeight ? weightRef : undefined,
    offset: ["start end", "end 0.5"],
  })
  const fontWeight = useTransform(scrollYProgress, [0, 1], [300, 700])

  const words = children.split(" ")

  if (prefersReducedMotion) {
    return (
      <MotionTag
        ref={animateWeight ? weightRef : undefined}
        className={className}
        style={animateWeight ? { fontWeight } : undefined}
        aria-label={children}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      ref={animateWeight ? weightRef : undefined}
      className={className}
      style={animateWeight ? { fontWeight } : undefined}
      variants={wordContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      aria-label={children}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span className="inline-block" variants={wordVariants}>
            {word}
          </motion.span>
          {i < words.length - 1 && (
            <span className="inline-block w-[0.3em]" />
          )}
        </span>
      ))}
    </MotionTag>
  )
}

/* ── character-level reveal (hero) ───────────────────────────────── */
const charContainerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.015, delayChildren: delay },
  }),
}

const charVariants = {
  hidden: {
    y: "100%",
    rotateX: 90,
    opacity: 0,
    filter: "blur(4px)",
  },
  visible: {
    y: "0%",
    rotateX: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function CharReveal({
  children,
  as: Tag = "h1",
  className = "",
  delay = 0,
}: RevealTextProps) {
  const MotionTag = motion.create(Tag as ElementType) as React.ComponentType<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    queueMicrotask(() =>
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    )
  }, [])

  const words = children.split(" ")

  if (prefersReducedMotion) {
    return (
      <MotionTag className={className} aria-label={children}>
        {children}
      </MotionTag>
    )
  }

  let charIndex = 0

  return (
    <MotionTag
      className={className}
      style={{ perspective: 800 }}
      variants={charContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      aria-label={children}
    >
      {words.map((word, wi) => (
        <span key={`word-${wi}`} className="inline-flex overflow-hidden align-bottom whitespace-nowrap">
          {word.split("").map((char) => {
            const ci = charIndex++
            return (
              <span
                key={`${char}-${ci}`}
                className="inline-block overflow-hidden align-bottom"
                style={{ perspective: 800 }}
              >
                <motion.span
                  className="inline-block"
                  style={{ transformOrigin: "bottom center" }}
                  variants={charVariants}
                >
                  {char}
                </motion.span>
              </span>
            )
          })}
          {wi < words.length - 1 && (
            <span className="inline-block w-[0.3em]" />
          )}
        </span>
      ))}
    </MotionTag>
  )
}
