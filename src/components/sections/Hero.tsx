"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { m, AnimatePresence } from "motion/react"
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
  nurtureCta?: { label: string; href: string; analyticsEvent: string }
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
        <div className="hero-enter flex items-center gap-4 mb-10">
          <span
            ref={eyebrowLineRef}
            className="block w-12 h-[1px] bg-[#0a0a0a] opacity-30 origin-left"
          />
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a] opacity-90">
            {heroContent.eyebrow}
          </p>
        </div>

        {/* Headline with CoverReveal */}
        <h1 className="font-heading text-fluid-hero font-bold tracking-[-0.04em] leading-[1.05] mb-10">
          <CoverReveal as="span" className="text-[#0a0a0a]" delay={0.1} duration={0.9} priority>
            {heroContent.titleLead}
          </CoverReveal>
          <span className="sr-only">{heroContent.titleHighlight}</span>
          <span aria-hidden="true" className="block overflow-hidden relative" style={{ height: "1.15em" }}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={phrases[index]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[#525252]"
              >
                {phrases[index]}
              </m.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Description */}
        <p
          className="hero-enter text-fluid-p text-[#525252] max-w-2xl mb-8 sm:mb-14 leading-relaxed"
          style={{ animationDelay: "0.4s" }}
        >
          {heroContent.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-5">
          <div className="hero-enter w-full sm:w-auto" style={{ animationDelay: "0.55s" }}>
            <Button
              size="lg"
              variant="primary"
              href={heroContent.primaryAction.href}
              onClick={() => trackEvent(heroContent.primaryAction.analyticsEvent)}
              className="w-full sm:w-auto"
            >
              {heroContent.primaryAction.label}
            </Button>
          </div>
          <div className="hero-enter w-full sm:w-auto" style={{ animationDelay: "0.65s" }}>
            <Button
              size="lg"
              variant="secondary"
              href={heroContent.secondaryAction.href}
              onClick={() => trackEvent(heroContent.secondaryAction.analyticsEvent)}
              className="w-full sm:w-auto"
            >
              {heroContent.secondaryAction.label}
            </Button>
          </div>
        </div>

        {/* Nurture CTA — low-commitment link for evaluation-phase visitors */}
        {heroContent.nurtureCta && (
          <div className="hero-enter mt-6" style={{ animationDelay: "0.85s" }}>
            <a
              href={heroContent.nurtureCta.href}
              onClick={() => trackEvent(heroContent.nurtureCta!.analyticsEvent)}
              className="inline-flex items-center gap-2 text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors duration-200"
            >
              <span className="text-base">→</span>
              {heroContent.nurtureCta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
