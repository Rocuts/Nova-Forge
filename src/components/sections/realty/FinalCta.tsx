"use client"
import { m, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { trackEvent } from "@/lib/analytics"
import { resolveHref, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["cta"]
  locale: string
}

/**
 * Closing section. Dark, centred, two actions.
 *
 * `content.note` is the page's last honesty line — one sentence, authored in
 * the dictionary, naming what is still simulated and that the voice advisor is
 * validated but not switched on. It replaces the long disclaimer of v1: the
 * detail now lives in the status section, which the secondary action links to.
 */
export function RealtyFinalCta({ content, locale }: Props) {
  const reduced = useReducedMotion()
  const reveal = revealProps(reduced, 0)

  return (
    <section className="bg-[#0a0a0a] py-28 md:py-36" data-header-theme="dark">
      <m.div {...reveal} className="mx-auto max-w-3xl px-6 text-center">
        <RevealText
          as="h2"
          className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8"
        >
          {content.title}
        </RevealText>

        <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
          {content.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            href={resolveHref(locale, content.action.href)}
            onClick={() => trackEvent("realty_demo_click", { placement: "footer" })}
            className="bg-white text-[#0a0a0a] hover:bg-[#e5e5e5]"
          >
            {content.action.label}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            href={resolveHref(locale, content.secondary.href)}
            className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
          >
            {content.secondary.label}
          </Button>
        </div>

        <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl mx-auto mt-16">{content.note}</p>
      </m.div>
    </section>
  )
}
