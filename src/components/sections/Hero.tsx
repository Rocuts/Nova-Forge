"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CharReveal } from "@/components/ui/RevealText"
import { trackEvent } from "@/lib/analytics"
import HeroCanvas from "@/components/3d/HeroCanvas"
import { Suspense } from "react"

interface HeroContent {
  eyebrow: string
  titleLead: string
  titleHighlight: string
  description: string
  trustLine: string
  primaryAction: { label: string; href: string; analyticsEvent: string }
  secondaryAction: { label: string; href: string; analyticsEvent: string }
}

const stagger = (i: number) => ({ delay: 0.15 * i, duration: 0.6, ease: "easeOut" as const })

export function Hero({ content: heroContent }: { content: HeroContent }) {
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>

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
          <CharReveal as="span" className="block text-[#0a0a0a]" delay={0.15}>
            {heroContent.titleLead}
          </CharReveal>
          <CharReveal as="span" className="block text-[#525252]" delay={0.3}>
            {heroContent.titleHighlight}
          </CharReveal>
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
