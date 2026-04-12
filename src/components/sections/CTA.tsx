"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { trackEvent } from "@/lib/analytics"

interface CTAContent {
  lead: string
  highlight: string
  description: string
  action: { label: string; href: string; analyticsEvent: string }
}

export function CTA({ content: ctaSection }: { content: CTAContent }) {
  return (
    <section className="py-32 bg-[#0a0a0a] relative z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-5xl px-6 text-center"
      >
        <div className="font-heading text-5xl md:text-7xl font-bold mb-10 tracking-tight leading-[1.1]">
          <RevealText as="span" className="inline text-white">
            {ctaSection.lead}
          </RevealText>
          <br className="hidden md:block" />
          <span className="text-[#a3a3a3]">{ctaSection.highlight}</span>
        </div>

        <p className="text-lg md:text-xl text-[#a3a3a3] mb-14 max-w-2xl mx-auto leading-relaxed">
          {ctaSection.description}
        </p>

        <Button
          size="lg"
          variant="primary"
          href={ctaSection.action.href}
          onClick={() => trackEvent(ctaSection.action.analyticsEvent)}
          className="bg-white text-[#0a0a0a] hover:bg-[#e5e5e5] border-white"
        >
          {ctaSection.action.label}
        </Button>
      </motion.div>
    </section>
  )
}
