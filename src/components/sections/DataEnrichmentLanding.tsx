"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { ScrambleText } from "@/components/ui/ScrambleText"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface DataEnrichmentContent {
  eyebrow: string
  title: string
  subtitle: string
  description: string
  stats: readonly { value: string; label: string }[]
  processTitle: string
  process: readonly {
    step: string
    title: string
    stat: string
    statLabel: string
    description: string
    details: readonly string[]
  }[]
  features: readonly { title: string; description: string }[]
  capabilities: readonly { title: string; items: readonly string[] }[]
  cta: {
    title: string
    description: string
    action: { label: string; href: string }
  }
}

const stagger = (i: number) => ({
  delay: 0.15 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

const viewportConfig = { once: true, margin: "-100px" as const }

function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) return href
  return buildLocalePath(locale as Locale, href)
}

export function DataEnrichmentLanding({
  content,
  locale,
}: {
  content: DataEnrichmentContent
  locale: string
}) {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(0)}
            className="flex items-center gap-4 mb-10"
          >
            <span className="w-12 h-[1px] bg-[#0a0a0a] opacity-30" />
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#0a0a0a] opacity-90">
              {content.eyebrow}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1)}
            className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8"
          >
            <ScrambleText as="h1" className="text-[#0a0a0a]" delay={0.15} duration={1400}>
              {content.title}
            </ScrambleText>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="font-heading text-2xl md:text-4xl text-[#a3a3a3] font-medium tracking-tight mb-10"
          >
            {content.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(3)}
            className="text-fluid-p text-[#525252] max-w-2xl leading-relaxed mb-14"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(4)}
          >
            <Button size="lg" variant="primary" href={resolveHref(locale, content.cta.action.href)}>
              {content.cta.action.label}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-16 border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {content.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
              >
                <p className="text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a]">
                  {stat.value}
                </p>
                <p className="text-sm text-[#a3a3a3] mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Pipeline ── */}
      <section className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mb-16"
          >
            {content.processTitle}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {content.process.map((step, i) => {
              const borders = [
                "",
                "border-t md:border-t-0 md:border-l border-[#e5e5e5]",
                "border-t lg:border-t-0 lg:border-l border-[#e5e5e5]",
                "border-t md:border-l lg:border-t-0 border-[#e5e5e5]",
              ]
              return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className={`py-8 md:px-8 first:md:pl-0 last:md:pr-0 ${borders[i]}`}
              >
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#a3a3a3]">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold text-[#0a0a0a] tracking-tight mt-4 mb-6">
                  {step.title}
                </h3>
                <p className="text-4xl font-bold text-[#0a0a0a] tracking-tight">
                  {step.stat}
                </p>
                <p className="text-xs text-[#a3a3a3] tracking-wide uppercase mt-1 mb-6">
                  {step.statLabel}
                </p>
                <p className="text-sm text-[#525252] leading-relaxed mb-6">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="text-sm text-[#525252]">
                      <span className="mr-2 text-[#a3a3a3]">&mdash;</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-32 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="p-8 bg-white border border-[#e5e5e5] rounded-lg hover:border-[#a3a3a3] transition-colors"
              >
                <h3 className="text-lg font-semibold text-[#0a0a0a] tracking-tight mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities — Dark ── */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {content.capabilities.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
              >
                <h3 className="text-lg font-semibold text-white tracking-tight mb-6">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-[#a3a3a3] text-sm leading-relaxed"
                    >
                      <span className="mr-3 text-[#525252]">&mdash;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <RevealText
            as="h2"
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-[#0a0a0a] mb-8"
          >
            {content.cta.title}
          </RevealText>

          <p className="text-lg md:text-xl text-[#525252] leading-relaxed mb-14 max-w-2xl mx-auto">
            {content.cta.description}
          </p>

          <Button size="lg" variant="primary" href={resolveHref(locale, content.cta.action.href)}>
            {content.cta.action.label}
          </Button>
        </motion.div>
      </section>
    </div>
  )
}
