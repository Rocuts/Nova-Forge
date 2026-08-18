"use client"
import { m } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { trackEvent } from "@/lib/analytics"
import { applyHref, resolveHref, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = Pick<LiveStudioContent, "onAir" | "cta" | "disclaimer" | "whatsappMessage"> & {
  locale: string
}

export function LiveStudioFinalCta({ onAir, cta, disclaimer, whatsappMessage, locale }: Props) {
  const applyLink = applyHref(whatsappMessage)

  return (
    <section
      className="relative bg-[#0a0a0a] py-28 md:py-36 overflow-hidden"
      data-header-theme="dark"
    >
      <div aria-hidden="true" className="absolute inset-0 live-aurora opacity-80" />
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportConfig}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <span className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5 mb-10">
          <span className="live-dot" />
          <span className="font-mono text-[10px] tracking-[0.28em] text-white">
            {onAir}
          </span>
        </span>

        <RevealText
          as="h2"
          className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8"
        >
          {cta.title}
        </RevealText>

        <p className="text-lg md:text-xl text-white/55 leading-relaxed mb-12 max-w-2xl mx-auto">
          {cta.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            href={applyLink}
            onClick={() => trackEvent("live_studio_apply_click", { placement: "footer" })}
            className="bg-white text-[#0a0a0a] hover:bg-white/85"
          >
            {cta.action.label}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            href={resolveHref(locale, cta.secondary.href)}
            className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
          >
            {cta.secondary.label}
          </Button>
        </div>

        {/* LIVE agency application is under review — this disclaimer must stay (CLAUDE.md) */}
        <p className="text-xs text-white/30 leading-relaxed max-w-2xl mx-auto mt-16">
          {disclaimer}
        </p>
      </m.div>
    </section>
  )
}
