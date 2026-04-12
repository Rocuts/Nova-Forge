"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
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

const stagger = (i: number) => ({ delay: 0.15 * i, duration: 0.6, ease: "easeOut" as const })

const ROTATE_INTERVAL = 3000

export function Hero({ content: heroContent }: { content: HeroContent }) {
  const phrases = heroContent.titleRotating ?? [heroContent.titleHighlight]
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % phrases.length)
  }, [phrases.length])

  useEffect(() => {
    if (phrases.length <= 1) return
    const timer = setInterval(next, ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [next, phrases.length])

  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(0)}
          className="flex items-center gap-4 mb-10"
        >
          <span className="w-12 h-[1px] bg-[#0a0a0a] opacity-30" />
          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#0a0a0a] opacity-90">
            {heroContent.eyebrow}
          </p>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(1)}
          className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-10"
        >
          <span className="block text-[#0a0a0a]">{heroContent.titleLead}</span>
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
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(2)}
          className="text-fluid-p text-[#525252] max-w-2xl mb-14 leading-relaxed"
        >
          {heroContent.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(3)}
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
      </div>
    </section>
  )
}
