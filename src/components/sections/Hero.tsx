"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CoverReveal } from "@/components/animations/CoverReveal"
import { trackEvent } from "@/lib/analytics"

interface HeroContent {
  eyebrow: string
  titleLead: string
  titleHighlight: string
  titleRotating?: readonly string[]
  description: string
  trustLine: string
  primaryAction: { label: string; href: string; analyticsEvent: string }
  secondaryAction: { label: string; href: string; analyticsEvent: string }
}

const ROTATE_INTERVAL = 3000

export function Hero({ content: heroContent }: { content: HeroContent }) {
  const phrases = heroContent.titleRotating ?? [heroContent.titleHighlight]
  const [index, setIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowLineRef = useRef<HTMLSpanElement>(null)

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % phrases.length)
  }, [phrases.length])

  useEffect(() => {
    if (phrases.length <= 1) return
    // Delay rotation start so it doesn't clash with CoverReveal animation
    let intervalId: ReturnType<typeof setInterval>
    const startDelay = setTimeout(() => {
      intervalId = setInterval(next, ROTATE_INTERVAL)
    }, 1500)
    return () => {
      clearTimeout(startDelay)
      clearInterval(intervalId)
    }
  }, [next, phrases.length])

  // Eyebrow line: animate scaleX 0→1 via vanilla JS
  useEffect(() => {
    const el = eyebrowLineRef.current
    if (!el) return
    el.style.transform = "scaleX(0)"
    el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
    const timer = setTimeout(() => {
      el.style.transform = "scaleX(1)"
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Scroll-linked hero fade: vanilla scroll listener
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    function onScroll() {
      const scrolled = window.scrollY
      const heroHeight = section!.offsetHeight
      const opacity = Math.max(0, 1 - (scrolled / heroHeight) * 1.5)
      section!.style.opacity = String(opacity)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-white overflow-hidden" data-header-theme="light">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-4 mb-10"
        >
          <span
            ref={eyebrowLineRef}
            className="block w-12 h-[1px] bg-[#0a0a0a] opacity-30 origin-left"
          />
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a] opacity-90">
            {heroContent.eyebrow}
          </p>
        </motion.div>

        {/* Headline with CoverReveal */}
        <div className="font-heading text-fluid-hero font-bold tracking-[-0.04em] leading-[1.05] mb-10">
          <CoverReveal as="span" className="text-[#0a0a0a]" delay={0.1} duration={0.9}>
            {heroContent.titleLead}
          </CoverReveal>
          <span className="block overflow-hidden relative" style={{ height: "1.15em" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={phrases[index]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[#525252]"
              >
                {phrases[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="text-fluid-p text-[#525252] max-w-2xl mb-14 leading-relaxed"
        >
          {heroContent.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
          >
            <Button
              size="lg"
              variant="primary"
              href={heroContent.primaryAction.href}
              onClick={() => trackEvent(heroContent.primaryAction.analyticsEvent)}
            >
              {heroContent.primaryAction.label}
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
          >
            <Button
              size="lg"
              variant="secondary"
              href={heroContent.secondaryAction.href}
              onClick={() => trackEvent(heroContent.secondaryAction.analyticsEvent)}
            >
              {heroContent.secondaryAction.label}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
