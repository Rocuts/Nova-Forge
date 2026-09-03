"use client"
import { useState } from "react"
import { m, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { trackEvent } from "@/lib/analytics"
import { DemoTag, resolveHref } from "./shared"
import type { RealtyContent } from "./shared"
import { Funnel, StatTile } from "./viz"

/** Deterministic ambient rulers — no Math.random, so SSR and hydration agree. */
const RULERS = ["18%", "38%", "62%", "84%"]

/**
 * Props of `RealtyHero`.
 *
 * `eyebrow`, `demoLabel` and `demoSrText` are the top-level dictionary strings
 * (`realty.eyebrow`, `realty.demoLabel`, `realty.demoSrText`); everything else
 * comes from `realty.hero`. `statusLine` is deliberately NOT rendered here —
 * v2 drops the disclaimer strip above the headline and lets the console frame's
 * single demo tag carry that job (page.tsx still uses it for the meta
 * description).
 */
export interface RealtyHeroProps {
  content: RealtyContent["hero"]
  /** Product eyebrow, e.g. "RealTy". */
  eyebrow: string
  /** One demo-data tag for the whole console frame. */
  demoLabel: string
  demoSrText: string
  locale: string
}

/**
 * The console "Overview" screen, rendered as the hero visual: hero figure,
 * a 2×2 grid of stat tiles with sparklines, and the pipeline funnel underneath.
 * Same three-part structure as the product's own overview, in Orbexs ink.
 */
function ConsoleFrame({
  console: overview,
  demoLabel,
  demoSrText,
  drawn,
}: {
  console: RealtyContent["hero"]["console"]
  demoLabel: string
  demoSrText: string
  drawn: boolean
}) {
  const funnelLabel = `${overview.funnel.label}: ${overview.funnel.stages
    .map((stage) => `${stage.name} ${stage.count}`)
    .join(", ")}`

  return (
    <div className="relative isolate mx-auto w-full max-w-[520px] select-none lg:mx-0">
      <div className="relative rounded-[6px] border border-[#1a1a1a] bg-[#141414]">
        {/* Frame header: the screen's name, and the one demo-data tag. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] px-5 py-4">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3]">{overview.label}</span>
          <DemoTag label={demoLabel} srText={demoSrText} tone="dark" />
        </div>

        {/* Hero figure — exactly one per screen. */}
        <div className="border-b border-[#1a1a1a] px-5 py-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a3a3a3]">
            {overview.headline.label}
          </p>
          <p className="mt-3 font-heading text-[clamp(1.85rem,4.5vw,2.6rem)] font-bold leading-none tracking-tight text-white">
            {overview.headline.value}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#a3a3a3]">{overview.headline.caption}</p>
        </div>

        {/* Stat tiles: hairline-separated, two up. */}
        <div className="grid grid-cols-2 border-b border-[#1a1a1a]">
          {overview.tiles.map((tile, i) => (
            <StatTile
              key={tile.label}
              label={tile.label}
              value={tile.value}
              series={tile.series}
              tone="dark"
              drawn={drawn}
              delayMs={140 * i}
              className={`${i % 2 === 0 ? "border-r border-[#1a1a1a]" : ""} ${
                i < overview.tiles.length - 2 ? "border-b border-[#1a1a1a]" : ""
              }`}
            />
          ))}
        </div>

        {/* Pipeline funnel — the same nine stages the product uses. */}
        <div className="px-5 py-5">
          <Funnel
            stages={overview.funnel.stages}
            label={overview.funnel.label}
            ariaLabel={funnelLabel}
            tone="dark"
            drawn={drawn}
          />
        </div>
      </div>

      {/* Offset ghost frame — the stack of open screens behind this one. */}
      <div aria-hidden="true" className="absolute -right-3 top-5 bottom-5 -z-10 w-full rounded-[6px] border border-white/[0.06]" />
    </div>
  )
}

export function RealtyHero({ content, eyebrow, demoLabel, demoSrText, locale }: RealtyHeroProps) {
  const reduced = useReducedMotion()
  // The charts draw once the frame is observed in the viewport (immediately, in
  // practice — it is above the fold). `drawn` starts false for everyone and only
  // changes from an event callback, never from a render-time branch or an
  // effect, so the server markup and the first client render agree.
  const [drawn, setDrawn] = useState(false)

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#0a0a0a]" data-header-theme="dark">
      {/* Ambient hairline rulers */}
      <div aria-hidden="true" className="absolute inset-0">
        {RULERS.map((left) => (
          <span key={left} className="absolute top-0 bottom-0 w-px bg-white/[0.04]" style={{ left }} />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-32 md:py-40">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="hero-enter mb-10 flex items-center gap-4">
              <span aria-hidden="true" className="h-[1px] w-12 bg-white opacity-30" />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70 md:text-[11px]">
                {eyebrow}
              </p>
            </div>

            <h1
              className="hero-enter mb-8 text-balance font-heading text-[clamp(2.25rem,4.6vw,4rem)] font-bold leading-[1.04] tracking-tight text-white"
              style={{ animationDelay: "0.1s" }}
            >
              {content.title}
            </h1>

            <p
              className="hero-enter mb-8 max-w-2xl font-heading text-xl font-medium tracking-tight text-[#a3a3a3] md:text-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              {content.subtitle}
            </p>

            <p
              className="hero-enter mb-12 max-w-2xl text-base leading-relaxed text-[#a3a3a3] md:text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              {content.description}
            </p>

            <div className="hero-enter flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "0.4s" }}>
              <Button
                size="lg"
                href={resolveHref(locale, content.primaryAction.href)}
                onClick={() => trackEvent("realty_demo_click", { placement: "hero" })}
                className="bg-white text-[#0a0a0a] hover:bg-[#e5e5e5]"
              >
                {content.primaryAction.label}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                href={resolveHref(locale, content.secondaryAction.href)}
                className="border-white/25 text-white hover:border-white/45 hover:bg-white/10"
              >
                {content.secondaryAction.label}
              </Button>
            </div>
          </div>

          <m.div
            // `initial` is identical for everyone (see reveal() in ./shared):
            // it lands in the server markup, and useReducedMotion() is false
            // during SSR, so branching it is a hydration mismatch. Reduced
            // motion collapses the transition instead.
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.35, ease: "easeOut" }}
            viewport={{ once: true }}
            onViewportEnter={() => setDrawn(true)}
            className="lg:col-span-6"
          >
            <ConsoleFrame
              console={content.console}
              demoLabel={demoLabel}
              demoSrText={demoSrText}
              drawn={drawn}
            />
          </m.div>
        </div>
      </div>
    </section>
  )
}
