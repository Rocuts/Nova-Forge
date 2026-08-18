"use client"
import { m } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { TeamRows } from "./TeamRows"
import { Button } from "@/components/ui/Button"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface InvestorsPageContent {
  eyebrow: string
  title: string
  subtitle: string
  thesis: {
    title: string
    paragraphs: readonly string[]
  }
  market: {
    title: string
    description: string
    segments: readonly { title: string; description: string }[]
  }
  team: {
    title: string
    description: string
    members: readonly { name: string; initials: string; role: string; bio: string }[]
  }
  vision: {
    quote: string
    author: string
    role: string
  }
  cta: {
    title: string
    description: string
    email: string
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

export function InvestorsPage({ content, locale }: { content: InvestorsPageContent; locale: string }) {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="min-h-[70vh] flex items-center bg-[#0a0a0a]" data-header-theme="dark">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(0)}
            className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#a3a3a3] mb-8"
          >
            {content.eyebrow}
          </m.p>

          <RevealText
            as="h1"
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
          >
            {content.title}
          </RevealText>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="text-xl text-[#a3a3a3] max-w-3xl leading-relaxed"
          >
            {content.subtitle}
          </m.p>
        </div>
      </section>

      {/* ── Investment Thesis ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-12"
            >
              {content.thesis.title}
            </RevealText>

            {content.thesis.paragraphs.map((paragraph, i) => (
              <m.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="text-lg text-[#525252] leading-[1.8] mb-8 last:mb-0"
              >
                {paragraph}
              </m.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Market Opportunity ── */}
      <section className="py-32 bg-[#f8f8f8]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-3xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.market.title}
            </RevealText>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(0)}
              className="text-lg text-[#525252] leading-relaxed"
            >
              {content.market.description}
            </m.p>
          </div>

          <m.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {content.market.segments.map((segment) => (
              <m.div
                key={segment.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
              >
                <h3 className="text-xl font-semibold text-[#0a0a0a] mb-4 tracking-tight">
                  {segment.title}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {segment.description}
                </p>
              </m.div>
            ))}
          </m.div>
        </div>
      </section>

      {/* ── Leadership Team ── */}
      <TeamRows title={content.team.title} description={content.team.description} members={content.team.members} />

      {/* ── Vision Quote ── */}
      <section className="py-32 bg-[#0a0a0a]" data-header-theme="dark">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <m.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-3xl md:text-4xl text-white italic leading-relaxed mb-10">
              &ldquo;{content.vision.quote}&rdquo;
            </p>
            <footer className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-[#525252]" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {content.vision.author}
                </p>
                <p className="text-sm text-[#a3a3a3]">{content.vision.role}</p>
              </div>
            </footer>
          </m.blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.cta.title}
            </RevealText>
            <p className="text-lg text-[#525252] leading-relaxed max-w-2xl mx-auto mb-8">
              {content.cta.description}
            </p>
            <p className="text-xl font-semibold text-[#0a0a0a] mb-10">
              {content.cta.email}
            </p>
            <Button
              size="lg"
              variant="primary"
              href={resolveHref(locale, content.cta.action.href)}
            >
              {content.cta.action.label}
            </Button>
          </m.div>
        </div>
      </section>
    </div>
  )
}
