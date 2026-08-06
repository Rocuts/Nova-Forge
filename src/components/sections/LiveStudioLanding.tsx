"use client"
import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { CoverReveal } from "@/components/animations/CoverReveal"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface TitledItem {
  title: string
  description: string
}

export interface LiveStudioContent {
  eyebrow: string
  status: string
  onAir: string
  titleLead: string
  titleAccent: string
  titleTail: string
  subtitle: string
  description: string
  primaryAction: { label: string }
  secondaryAction: { label: string; href: string }
  whatsappMessage: string
  marqueeLabel: string
  marquee: readonly string[]
  stats: readonly { value: string; label: string; description: string }[]
  thesis: { eyebrow: string; title: string; paragraphs: readonly string[] }
  program: {
    eyebrow: string
    title: string
    description: string
    steps: readonly { step: string; title: string; description: string; details: readonly string[] }[]
  }
  modalities: {
    eyebrow: string
    title: string
    description: string
    providesLabel: string
    requiresLabel: string
    items: readonly {
      tag: string
      title: string
      description: string
      provides: readonly string[]
      requires: readonly string[]
    }[]
  }
  infrastructure: { eyebrow: string; title: string; description: string; items: readonly TitledItem[] }
  creators: { eyebrow: string; title: string; items: readonly TitledItem[] }
  brands: {
    eyebrow: string
    title: string
    description: string
    items: readonly TitledItem[]
    action: { label: string; href: string }
  }
  faq: { title: string; subtitle: string; items: readonly { question: string; answer: string }[] }
  cta: {
    title: string
    description: string
    action: { label: string }
    secondary: { label: string; href: string }
  }
  disclaimer: string
}

const viewportConfig = { once: true, margin: "-100px" as const }

const stagger = (i: number) => ({
  delay: 0.08 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

/** Deterministic bar heights — no Math.random, so SSR and hydration agree. */
const EQ_BARS = [38, 72, 54, 88, 46, 64, 30, 78, 58, 42]

/**
 * Per-cell dividers for the 4-step pipeline. The grid reflows 1 → 2 → 4 columns,
 * so each cell needs its own rule about which edge carries the hairline.
 */
const PROGRAM_BORDERS = [
  "",
  "border-t md:border-t-0 md:border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-t md:border-l lg:border-t-0",
]

function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) return href
  return buildLocalePath(locale as Locale, href)
}

function applyHref(message: string): string {
  return `${siteConfig.links.whatsapp}?text=${encodeURIComponent(message)}`
}

/** Eyebrow with the spectral hairline the rest of the studio surfaces repeat. */
function Eyebrow({ children, tone = "dark" }: { children: string; tone?: "dark" | "light" }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="w-12 live-rule" />
      <p
        className={`text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase ${
          tone === "dark" ? "text-white/70" : "text-[#0a0a0a]/70"
        }`}
      >
        {children}
      </p>
    </div>
  )
}

/** One side of a modality card: who supplies what. Both columns share this shape. */
function ModeList({ label, entries }: { label: string; entries: readonly string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold tracking-[0.26em] uppercase text-[#a3a3a3] pb-3 mb-4 border-b border-[#e5e5e5]">
        {label}
      </p>
      <ul className="space-y-2.5">
        {entries.map((entry) => (
          <li key={entry} className="text-sm text-[#525252] leading-snug flex gap-2">
            <span className="text-[#a3a3a3] shrink-0" aria-hidden="true">
              &mdash;
            </span>
            {entry}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The 9:16 booth frame — corner brackets, scanline sweep, level meter. */
function BroadcastFrame({ onAir }: { onAir: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative isolate w-full max-w-[280px] aspect-[9/16] mx-auto lg:mx-0 select-none"
    >
      {/* Frame body */}
      <div className="absolute inset-0 rounded-[10px] border border-white/12 bg-white/[0.02] overflow-hidden">
        <div className="absolute inset-0 live-frame-grid opacity-70" />
        {/* Scanline sweep */}
        <div className="absolute inset-x-0 top-0 h-px live-scan bg-gradient-to-r from-transparent via-[#25f4ee]/70 to-transparent" />

        {/* Top strip: ON AIR + timecode */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 h-9 border-b border-white/8">
          <span className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/85">{onAir}</span>
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/35">9:16</span>
        </div>

        {/* Center: framing brackets around the studio mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-1/2 aspect-square flex items-center justify-center">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#25f4ee]/60" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#fe2c55]/60" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#fe2c55]/60" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#25f4ee]/60" />
            <span className="font-mono text-[9px] tracking-[0.3em] text-white/25 text-center leading-5">
              ORBEXS
              <br />
              LIVE
            </span>
          </div>
        </div>

        {/* Bottom strip: audio level meter */}
        <div className="absolute bottom-0 inset-x-0 h-14 border-t border-white/8 px-3 flex items-end gap-[3px] pb-3">
          {EQ_BARS.map((height, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-[1px] bg-gradient-to-t from-[#25f4ee]/50 to-[#fe2c55]/50"
              initial={{ height: 4 }}
              animate={{ height: [4, height * 0.28, 6, height * 0.2, 4] }}
              transition={{
                duration: 1.6 + (i % 4) * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.07,
              }}
            />
          ))}
        </div>
      </div>

      {/* Offset ghost frames — the stack of a vertical feed */}
      <div className="absolute -right-3 top-6 bottom-6 w-full rounded-[10px] border border-white/[0.06] -z-10" />
      <div className="absolute -right-6 top-12 bottom-12 w-full rounded-[10px] border border-white/[0.03] -z-20" />
    </div>
  )
}

function FaqItem({ item, index }: { item: { question: string; answer: string }; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={stagger(index)}
      className="border-b border-[#e5e5e5]"
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) trackEvent("live_studio_faq_expand", { question: item.question })
            return !prev
          })
        }}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-8 py-7 text-left group"
      >
        <span className="text-lg md:text-xl font-medium text-[#0a0a0a] tracking-tight">
          {item.question}
        </span>
        <span
          className={`shrink-0 mt-1 text-[#a3a3a3] transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="text-[#525252] leading-relaxed max-w-3xl pb-8 pr-10">{item.answer}</p>
      </motion.div>
    </motion.div>
  )
}

export function LiveStudioLanding({
  content,
  locale,
}: {
  content: LiveStudioContent
  locale: string
}) {
  const applyLink = applyHref(content.whatsappMessage)
  const onApply = (placement: string) => () =>
    trackEvent("live_studio_apply_click", { placement })

  return (
    <div className="bg-[#0a0a0a]">
      {/* ── Hero ── */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0a0a]"
        data-header-theme="dark"
      >
        <div aria-hidden="true" className="absolute inset-0 live-aurora" />
        <div aria-hidden="true" className="absolute inset-0 live-frame-grid opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent"
        />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-wrap items-center gap-3 mb-10"
              >
                <span className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5">
                  <span className="live-dot" />
                  <span className="font-mono text-[10px] tracking-[0.28em] text-white">
                    {content.onAir}
                  </span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">
                  {content.status}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
                className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.02] text-white mb-8"
              >
                {content.titleLead}{" "}
                <span className="chroma-text">{content.titleAccent}</span>{" "}
                {content.titleTail}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16, ease: "easeOut" }}
                className="font-heading text-2xl md:text-3xl text-white/55 font-medium tracking-tight mb-10 max-w-2xl"
              >
                {content.subtitle}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24, ease: "easeOut" }}
                className="text-fluid-p text-white/60 max-w-2xl leading-relaxed mb-14"
              >
                {content.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  href={applyLink}
                  onClick={onApply("hero")}
                  className="bg-white text-[#0a0a0a] hover:bg-white/85"
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
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <BroadcastFrame onAir={content.onAir} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section
        className="bg-[#0a0a0a] border-y border-white/8 py-6 overflow-hidden"
        data-header-theme="dark"
        aria-label={content.marqueeLabel}
      >
        <div className="marquee-mask">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                {content.marquee.map((entry) => (
                  <span
                    key={`${copy}-${entry}`}
                    className="flex items-center font-mono text-[11px] tracking-[0.24em] uppercase text-white/45 px-8"
                  >
                    {entry}
                    <span className="ml-8 text-[#fe2c55]/50" aria-hidden="true">
                      &bull;
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Operating commitments ── */}
      <section className="bg-[#0a0a0a] py-24 md:py-32" data-header-theme="dark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 border border-white/8">
            {content.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="bg-[#0a0a0a] p-8 md:p-10"
              >
                <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#25f4ee]/80 mb-4">
                  {stat.label}
                </p>
                <p className="text-sm text-white/50 leading-relaxed">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thesis ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-5">
              <Eyebrow tone="light">{content.thesis.eyebrow}</Eyebrow>
              <CoverReveal
                as="h2"
                className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] leading-[1.1]"
              >
                {content.thesis.title}
              </CoverReveal>
            </div>
            <div className="lg:col-span-7 space-y-6">
              {content.thesis.paragraphs.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportConfig}
                  transition={stagger(i)}
                  className="text-lg text-[#525252] leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Creator program pipeline ── */}
      <section className="bg-white py-24 md:py-32 border-t border-[#e5e5e5]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-16">
            <Eyebrow tone="light">{content.program.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-6">
              {content.program.title}
            </h2>
            <p className="text-lg text-[#525252] leading-relaxed">{content.program.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {content.program.steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className={`py-8 md:px-8 first:md:pl-0 last:lg:pr-0 border-[#e5e5e5] ${PROGRAM_BORDERS[i] ?? ""}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#a3a3a3]">
                    {step.step}
                  </span>
                  <span className="flex-1 live-rule opacity-60" />
                </div>
                <h3 className="text-xl font-semibold text-[#0a0a0a] tracking-tight mb-4">
                  {step.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed mb-6">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="text-sm text-[#525252] leading-snug">
                      <span className="mr-2 text-[#a3a3a3]" aria-hidden="true">
                        &mdash;
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two modalities ── */}
      <section className="bg-[#f8f8f8] py-24 md:py-32 border-t border-[#e5e5e5]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-16">
            <Eyebrow tone="light">{content.modalities.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-6">
              {content.modalities.title}
            </h2>
            <p className="text-lg text-[#525252] leading-relaxed">{content.modalities.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {content.modalities.items.map((mode, i) => (
              <motion.div
                key={mode.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="bg-white border border-[#e5e5e5] rounded-[6px] p-8 md:p-10 flex flex-col"
              >
                <span className="self-start font-mono text-[10px] font-bold tracking-[0.3em] uppercase bg-[#0a0a0a] text-white px-3 py-1.5 rounded-[2px]">
                  {mode.tag}
                </span>
                <h3 className="font-heading text-2xl font-semibold text-[#0a0a0a] tracking-tight mt-6 mb-4">
                  {mode.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed mb-8">{mode.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ModeList label={content.modalities.providesLabel} entries={mode.provides} />
                  <ModeList label={content.modalities.requiresLabel} entries={mode.requires} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infrastructure edge — dark ── */}
      <section className="bg-[#0a0a0a] py-24 md:py-32 relative overflow-hidden" data-header-theme="dark">
        <div aria-hidden="true" className="absolute inset-0 live-frame-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-16">
            <Eyebrow>{content.infrastructure.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              {content.infrastructure.title}
            </h2>
            <p className="text-lg text-white/55 leading-relaxed">
              {content.infrastructure.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8">
            {content.infrastructure.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="group bg-[#0a0a0a] p-8 md:p-10 transition-colors duration-300 hover:bg-[#111111]"
              >
                <span
                  aria-hidden="true"
                  className="block w-8 live-rule opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-5"
                />
                <h3 className="text-lg font-semibold text-white tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What creators get ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-16">
            <Eyebrow tone="light">{content.creators.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a]">
              {content.creators.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.creators.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                whileHover={{ y: -2 }}
                className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 hover:border-[#a3a3a3] transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-[#0a0a0a] tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For brands — dark ── */}
      <section className="bg-[#0a0a0a] py-24 md:py-32" data-header-theme="dark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-5">
              <Eyebrow>{content.brands.eyebrow}</Eyebrow>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                {content.brands.title}
              </h2>
              <p className="text-lg text-white/55 leading-relaxed mb-10">
                {content.brands.description}
              </p>
              <Button
                size="lg"
                variant="secondary"
                href={resolveHref(locale, content.brands.action.href)}
                className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
              >
                {content.brands.action.label}
              </Button>
            </div>

            <div className="lg:col-span-7">
              <div className="border-t border-white/10">
                {content.brands.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={stagger(i)}
                    className="py-7 border-b border-white/10 flex gap-6"
                  >
                    <span className="font-mono text-[10px] tracking-[0.26em] text-white/25 pt-1.5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-4">
            {content.faq.title}
          </h2>
          <p className="text-lg text-[#525252] mb-14">{content.faq.subtitle}</p>

          <div className="border-t border-[#e5e5e5]">
            {content.faq.items.map((item, i) => (
              <FaqItem key={item.question} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="relative bg-[#0a0a0a] py-28 md:py-36 overflow-hidden"
        data-header-theme="dark"
      >
        <div aria-hidden="true" className="absolute inset-0 live-aurora opacity-80" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <span className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5 mb-10">
            <span className="live-dot" />
            <span className="font-mono text-[10px] tracking-[0.28em] text-white">
              {content.onAir}
            </span>
          </span>

          <RevealText
            as="h2"
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8"
          >
            {content.cta.title}
          </RevealText>

          <p className="text-lg md:text-xl text-white/55 leading-relaxed mb-12 max-w-2xl mx-auto">
            {content.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              href={applyLink}
              onClick={onApply("footer")}
              className="bg-white text-[#0a0a0a] hover:bg-white/85"
            >
              {content.cta.action.label}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href={resolveHref(locale, content.cta.secondary.href)}
              className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
            >
              {content.cta.secondary.label}
            </Button>
          </div>

          <p className="text-xs text-white/30 leading-relaxed max-w-2xl mx-auto mt-16">
            {content.disclaimer}
          </p>
        </motion.div>
      </section>
    </div>
  )
}
