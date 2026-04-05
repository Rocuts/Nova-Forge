"use client"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CharReveal } from "@/components/ui/RevealText"
import { heroContent } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"

const HeroCanvas = dynamic(() => import("../canvas/HeroScene"), { ssr: false })

export function Hero() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const scrollProgressRef = useRef(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  // Sync motion value to ref so the Canvas can read it without React context
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      scrollProgressRef.current = v
    })
    return unsubscribe
  }, [scrollYProgress])

  // Text rises faster than scroll — creates depth separation
  const textY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -200]),
    { stiffness: 60, damping: 20 }
  )
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Canvas sinks slower — background layer effect
  const canvasY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 150]),
    { stiffness: 60, damping: 20 }
  )
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  // Radial glow expands as you scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0])
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.5])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    // Use queueMicrotask to avoid synchronous setState in effect body
    queueMicrotask(() => {
      setMounted(true)
      setReduceMotion(mq.matches)
    })
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] flex items-start pt-32 pb-16 overflow-hidden">
      {/* Background System — moves SLOWER (parallax depth layer) */}
      <motion.div className="absolute inset-0 z-0" style={{ y: canvasY, scale: canvasScale }}>
        {mounted && !reduceMotion ? (
          <HeroCanvas scrollProgressRef={scrollProgressRef} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50" />
        )}
      </motion.div>

      {/* Radial Gradient Overlay — fades and expands on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-cyan-dim via-transparent to-transparent"
        style={{ opacity: glowOpacity, scale: glowScale }}
        aria-hidden="true"
      />

      {/* Fade to Background Overlay */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 pointer-events-none -z-10 bg-gradient-to-t from-surface-base to-transparent"
        aria-hidden="true"
      />

      {/* Content — moves FASTER (foreground parallax layer) */}
      <motion.div
        className="container px-4 mx-auto relative z-10 w-full max-w-7xl pointer-events-none"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
          className="max-w-4xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-border bg-surface-elevated/50 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary-cyan text-glow animate-pulse"></span>
            <span className="text-sm font-medium tracking-wide text-primary-cyan">
              {heroContent.eyebrow}
            </span>
          </motion.div>

          <div className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.0] mb-6">
            <CharReveal as="span" className="inline" delay={0.3}>
              {heroContent.titleLead}
            </CharReveal>
            <br className="hidden md:block"/>
            <CharReveal as="span" className="inline gradient-brand gradient-text" delay={0.5}>
              {heroContent.titleHighlight}
            </CharReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-10 leading-relaxed font-light"
          >
            {heroContent.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              href={heroContent.primaryAction.href}
              onClick={() => trackEvent(heroContent.primaryAction.analyticsEvent)}
            >
              {heroContent.primaryAction.label}
            </Button>
            <Button
              size="lg"
              variant="glass"
              href={heroContent.secondaryAction.href}
              onClick={() => trackEvent(heroContent.secondaryAction.analyticsEvent)}
            >
              {heroContent.secondaryAction.label}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
