"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"
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

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % phrases.length)
  }, [phrases.length])

  useEffect(() => {
    if (phrases.length <= 1) return
    const timer = setInterval(next, ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [next, phrases.length])

  // Scroll-linked fade: hero fades out as user scrolls down
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-white overflow-hidden" data-header-theme="light">
      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-4 mb-10"
        >
          <motion.span
            className="block w-12 h-[1px] bg-[#0a0a0a] opacity-30 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
      </motion.div>
    </section>
  )
}
