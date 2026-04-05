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

      {/* Subtlest background mesh — replaces red/yellow noise */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_#00f0ff05_0%,_transparent_50%)]"
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
          className="max-w-5xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-12"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-cyan/80">
              {heroContent.eyebrow}
            </span>
          </motion.div>

          <div className="font-heading text-6xl md:text-8xl lg:text-[110px] font-bold tracking-tight leading-[0.9] mb-10">
            <CharReveal as="span" className="inline block" delay={0.3}>
              {heroContent.titleLead}
            </CharReveal>
            <CharReveal as="span" className="inline block text-text-secondary" delay={0.5}>
              {heroContent.titleHighlight}
            </CharReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mb-14 leading-relaxed font-normal"
          >
            {heroContent.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Button
              size="lg"
              variant="primary"
              href={heroContent.primaryAction.href}
              onClick={() => trackEvent(heroContent.primaryAction.analyticsEvent)}
            >
              {heroContent.primaryAction.label}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href={heroContent.secondaryAction.href}
              onClick={() => trackEvent(heroContent.secondaryAction.analyticsEvent)}
            >
              {heroContent.secondaryAction.label}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex items-center gap-2 text-text-secondary/60 text-sm font-medium tracking-tight"
          >
            <div className="w-1 h-1 rounded-full bg-primary-cyan/40" />
            {heroContent.trustLine}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
