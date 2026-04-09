"use client"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CharReveal } from "@/components/ui/RevealText"
import { Typewriter } from "@/components/ui/Typewriter"
import { heroContent } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"
import { useIsMobile } from "@/lib/useIsMobile"

const HeroCanvas = dynamic(() => import("../canvas/HeroScene"), { ssr: false })

export function Hero() {
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

  // Text rises faster than scroll — creates depth separation
  const textY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -200]),
    { stiffness: isMobile ? 40 : 60, damping: 20 }
  )
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Canvas sinks slower — background layer effect
  const canvasY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 150]),
    { stiffness: isMobile ? 40 : 60, damping: 20 }
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
      <motion.div 
        className="absolute inset-0 z-0 will-change-transform" 
        style={{ y: canvasY, scale: canvasScale }}
      >
        {mounted && !reduceMotion ? (
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50 animate-pulse" />}>
            <HeroCanvas scrollProgressRef={scrollProgressRef} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50" />
        )}
      </motion.div>

      {/* Subtlest background mesh — replaces red/yellow noise */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_#00f0ff05_0%,_transparent_50%)]"
        aria-hidden="true"
      />
      {/* 30% Black Overlay to crush aggressive glow and enhance text legibility */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black/30" />

      {/* Content — moves FASTER (foreground parallax layer) */}
      <motion.div
        className="container px-4 mx-auto relative z-10 w-full max-w-7xl pointer-events-none will-change-transform"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
          className="max-w-5xl pointer-events-auto relative"
        >
          {/* Radial mask for text contrast */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-surface-base/50 blur-[120px] rounded-full pointer-events-none -z-10" />
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="group relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-12 cursor-default"
          >
            {/* Animated Gradient Border using background origin */}
            <div className="absolute inset-0 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-white/5 group-hover:border-primary-cyan/30 transition-colors duration-500 shadow-[inset_0_4px_20px_rgba(255,255,255,0.03),0_0_15px_rgba(0,229,255,0.05)] group-hover:shadow-[inset_0_4px_20px_rgba(255,255,255,0.05),0_0_30px_rgba(0,229,255,0.15)]" />
            
            {/* Glowing Dot / Pulse Container */}
            <div className="relative flex items-center justify-center w-2 h-2 z-10 shrink-0">
              <span className="absolute w-full h-full rounded-full bg-primary-cyan/50 animate-ping" style={{ animationDuration: '3s' }} />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            </div>

            {/* Text with dynamic glow and typewriter effect */}
            <span className="relative z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-300 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Typewriter text={heroContent.eyebrow} speed={85} deleteSpeed={40} delayBeforeDelete={4000} />
            </span>
          </motion.div>

          <div className="font-heading text-5xl md:text-7xl lg:text-[100px] font-bold tracking-tight leading-[1.05] mb-10 text-white drop-shadow-2xl">
            <CharReveal as="span" className="inline" delay={0.3}>
              {heroContent.titleLead}
            </CharReveal>
            {" "}
            <CharReveal as="span" className="inline" delay={0.5}>
              {heroContent.titleHighlight}
            </CharReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-zinc-200 font-medium max-w-3xl mb-14 leading-relaxed"
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
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="mt-12 flex items-center gap-4 w-fit px-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary-cyan/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan shadow-[0_0_10px_#00f0ff] animate-pulse" />
            </div>
            <span className="text-zinc-300 text-sm font-semibold tracking-wide drop-shadow-md">
              {heroContent.trustLine}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
