"use client"

import { Button } from "@/components/ui/Button"
import { ctaSection } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"

export function CTA() {
  return (
    <section className="py-32 bg-surface-base relative border-t border-surface-border z-10 overflow-hidden">
      {/* Glow subtle de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-cyan/10 blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="container px-4 mx-auto max-w-4xl text-center relative z-10">
        <h2 className="font-heading text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
          Hablemos de lo que tu negocio <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan via-accent-amber to-accent-amber/50">
            {ctaSection.highlight}
          </span>
        </h2>

        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
          {ctaSection.description}
        </p>

        <Button
          size="lg"
          href={ctaSection.action.href}
          onClick={() => trackEvent(ctaSection.action.analyticsEvent)}
        >
          {ctaSection.action.label}
        </Button>
      </div>
    </section>
  )
}
