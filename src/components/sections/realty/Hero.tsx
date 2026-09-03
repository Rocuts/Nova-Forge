"use client"
import { m, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { trackEvent } from "@/lib/analytics"
import { SimValue, resolveHref } from "./shared"
import type { RealtyContent } from "./shared"

/** Deterministic ambient rulers — no Math.random, so SSR and hydration agree. */
const RULERS = ["18%", "38%", "62%", "84%"]

/**
 * The console dossier schematic: label strip → readiness row → rows ledger →
 * close ledger → live column. Decorative (aria-hidden); every string comes from
 * the dictionary, every rule is a 1px hairline.
 */
function CommandFrame({
  frame,
  simToken,
  simSrText,
}: {
  frame: RealtyContent["hero"]["frame"]
  simToken: string
  simSrText: string
}) {
  return (
    <div aria-hidden="true" className="relative isolate w-full max-w-[460px] mx-auto lg:mx-0 select-none">
      <div className="relative rounded-[6px] border border-[#1a1a1a] bg-[#141414]">
        {/* Label strip */}
        <div className="flex items-center justify-between gap-4 px-5 h-11 border-b border-white/[0.08]">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/75">{frame.label}</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-white/40" />
            <span className="inline-block w-1.5 h-1.5 border border-white/40" />
            <span className="inline-block w-1.5 h-1.5 border border-dotted border-white/40" />
          </span>
        </div>

        {/* Readiness row */}
        <div className="flex items-baseline justify-between gap-4 px-5 py-5 border-b border-white/[0.08]">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            {frame.readinessLabel}
          </span>
          <span className="font-mono text-lg leading-none">
            <SimValue token={simToken} srText={simSrText}>
              {frame.readinessValue}
            </SimValue>
          </span>
        </div>

        {/* Rows ledger */}
        <div>
          {frame.rows.map((row, i) => (
            <div
              key={row.key}
              className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-white/[0.06]"
            >
              <span className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/55">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] text-white/50 truncate">{row.key}</span>
              </span>
              <span className="font-mono text-[12px] text-white whitespace-nowrap">
                {row.simulated ? (
                  <SimValue token={simToken} srText={simSrText}>
                    {row.value}
                  </SimValue>
                ) : (
                  row.value
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Close ledger line */}
        <div className="flex items-baseline justify-between gap-4 px-5 py-4 border-b border-white/[0.08]">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">{frame.closeLabel}</span>
          <span className="font-mono text-[11px] tracking-[0.12em] text-white/80">{frame.closeValue}</span>
        </div>

        {/* Live column */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">{frame.liveLabel}</span>
          <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 px-2.5 py-1">
            <span className="inline-block w-1.5 h-1.5 bg-white/60" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/75">
              {frame.liveIndicator}
            </span>
          </span>
        </div>
      </div>

      {/* Offset ghost frame — the stack of open dossiers */}
      <div className="absolute -right-3 top-5 bottom-5 w-full rounded-[6px] border border-white/[0.06] -z-10" />
    </div>
  )
}

export function RealtyHero({
  content,
  eyebrow,
  statusLine,
  simToken,
  simSrText,
  locale,
}: {
  content: RealtyContent["hero"]
  eyebrow: string
  statusLine: string
  simToken: string
  simSrText: string
  locale: string
}) {
  const reduced = useReducedMotion()

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0a0a]"
      data-header-theme="dark"
    >
      {/* Ambient hairline rulers */}
      <div aria-hidden="true" className="absolute inset-0">
        {RULERS.map((left) => (
          <span key={left} className="absolute top-0 bottom-0 w-px bg-white/[0.04]" style={{ left }} />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            {/* Eyebrow + status line */}
            <div className="hero-enter flex flex-wrap items-center gap-x-4 gap-y-3 mb-10">
              <span aria-hidden="true" className="w-12 h-[1px] bg-white opacity-30" />
              <p className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-white/70">
                {eyebrow}
              </p>
              <span aria-hidden="true" className="hidden sm:block w-px h-3 bg-white/15" />
              <p className="font-mono text-[10px] md:text-[11px] tracking-[0.1em] text-white/55">{statusLine}</p>
            </div>

            <h1
              className="hero-enter font-heading text-fluid-hero font-bold tracking-tight leading-[1.02] text-white mb-8 text-balance"
              style={{ animationDelay: "0.1s" }}
            >
              {content.title}
            </h1>

            <p
              className="hero-enter font-heading text-2xl md:text-3xl text-white/55 font-medium tracking-tight mb-10 max-w-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              {content.subtitle}
            </p>

            <p
              className="hero-enter text-fluid-p text-white/60 max-w-2xl leading-relaxed mb-14"
              style={{ animationDelay: "0.3s" }}
            >
              {content.description}
            </p>

            <div
              className="hero-enter flex flex-col sm:flex-row gap-4"
              style={{ animationDelay: "0.4s" }}
            >
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
                className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
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
            className="lg:col-span-5"
          >
            <CommandFrame frame={content.frame} simToken={simToken} simSrText={simSrText} />
          </m.div>
        </div>
      </div>
    </section>
  )
}
