"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

export function IntroSequence() {
  const [show, setShow] = useState(true)
  const [animationPhase, setAnimationPhase] = useState<
    "text" | "reveal" | "done"
  >("text")

  useEffect(() => {
    // Respect prefers-reduced-motion: skip intro entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setShow(false))
      return
    }

    // Only show on first visit per session
    try {
      if (sessionStorage.getItem("intro-seen")) {
        queueMicrotask(() => setShow(false))
        return
      }
      sessionStorage.setItem("intro-seen", "1")
    } catch {
      // sessionStorage unavailable (private browsing, restricted iframe, etc.)
      // Show the intro anyway and continue
    }

    // Phase timeline:
    // 0–1s     Text stagger reveal + progress line
    // 1–1.2s   Brief hold
    // 1.2–2s   Clip-path shrink to reveal site
    const timer1 = setTimeout(() => setAnimationPhase("reveal"), 1200)
    const timer2 = setTimeout(() => {
      setAnimationPhase("done")
      setShow(false)
    }, 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (!show) return null

  const letters = "NOVAFORGE".split("")

  return (
    <AnimatePresence>
      {animationPhase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9998] bg-black flex items-center justify-center"
          animate={
            animationPhase === "reveal"
              ? {
                  clipPath: "circle(0% at 50% 50%)",
                  transition: {
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }
              : { clipPath: "circle(150% at 50% 50%)" }
          }
          exit={{
            clipPath: "circle(0% at 50% 50%)",
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className="text-center">
            <div className="font-heading text-4xl md:text-6xl font-black tracking-widest text-white flex overflow-hidden justify-center">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.06,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            {/* Progress line */}
            <motion.div
              className="h-[2px] bg-[#0a0a0a] mt-4 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
