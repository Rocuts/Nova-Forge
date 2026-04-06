"use client"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CharReveal } from "@/components/ui/RevealText"
import { trackEvent } from "@/lib/analytics"
import { useIsMobile } from "@/lib/useIsMobile"

const HeroCanvas = dynamic(() => import("../canvas/HeroScene"), { ssr: false })

interface HeroContent {
  eyebrow: string
  titleLead: string
  titleHighlight: string
  description: string
  trustLine: string
  primaryAction: { label: string; href: string; analyticsEvent: string }
  secondaryAction: { label: string; href: string; analyticsEvent: string }
}

export function Hero({ content: heroContent }: { content: HeroContent }) {
  const isMobile = useIsMobile()
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

  // Text rises faster than scroll — cinematic depth separation
  const textY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -200]),
    { stiffness: isMobile ? 80 : 50, damping: isMobile ? 25 : 20, mass: isMobile ? 0.3 : 0.8 }
  )
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Canvas background — fades to subtle as you scroll past hero, never fully hidden
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.4, 0.25])

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
      {/* Background System — fixed so the supernova stays visible throughout the page */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none will-change-transform"
        style={{ scale: canvasScale, opacity: canvasOpacity }}
      >
        {mounted && !reduceMotion ? (
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50" />}>
            <HeroCanvas scrollProgressRef={scrollProgressRef} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50" />
        )}
      </motion.div>

      {/* Subtle dark veil — just enough contrast for text without killing the glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/25 via-black/15 to-black/30"
        aria-hidden="true"
      />

      {/* Radial glow — expands and fades as you scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_top,_#00f0ff08_0%,_transparent_50%)]"
        style={{ opacity: glowOpacity, scale: glowScale }}
        aria-hidden="true"
      />

      {/* Content — moves FASTER (foreground parallax layer) */}
      <motion.div
        className="container px-4 mx-auto relative z-10 w-full max-w-7xl pointer-events-none will-change-transform"
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

          <div className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-10 drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]">
            <CharReveal as="span" className="block text-white" delay={0.3}>
              {heroContent.titleLead}
            </CharReveal>
            <CharReveal as="span" className="block text-zinc-300" delay={0.5}>
              {heroContent.titleHighlight}
            </CharReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-fluid-p text-slate-100 max-w-3xl mb-14 leading-relaxed font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
          >
            {heroContent.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-5"
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
