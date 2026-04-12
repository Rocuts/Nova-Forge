"use client"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import type { ElementType } from "react"

/* -- shared types --------------------------------------------------------- */
interface RevealTextProps {
  children: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  className?: string
  delay?: number
}

/* -- word-level reveal (sections) ----------------------------------------- */
const wordContainerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.06, delayChildren: delay },
  }),
}

const wordVariants = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function RevealText({
  children,
  as: Tag = "h2",
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

  return (
    <MotionTag
      className={className}
      variants={wordContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10px" }}
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

/* -- character-level reveal (hero) ---------------------------------------- */
const charContainerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.02, delayChildren: delay },
  }),
}

const charVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
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
      variants={charContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10px" }}
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
