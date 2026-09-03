"use client"
import Link from "next/link"
import { m } from "motion/react"
import { CoverReveal } from "@/components/animations/CoverReveal"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface CaseStudyContent {
  sectionId: string
  eyebrow: string
  industry: string
  title: string
  context: string
  solution: string
  outcome: string
  capabilitiesTitle: string
  capabilities: readonly string[]
  cta: { label: string; href: string }
}

export function CaseStudy({ content, locale }: { content: CaseStudyContent; locale: string }) {
  return (
    <m.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-16 sm:py-32 bg-white border-t border-[#e5e5e5] relative z-10"
      id={content.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Eyebrow + industry tag */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-14">
          <div className="flex items-center gap-4">
            <span className="block w-12 h-[1px] bg-[#0a0a0a] opacity-30" />
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a] opacity-90">
              {content.eyebrow}
            </p>
          </div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#707070]">
            {content.industry}
          </p>
        </div>

        <div className="mb-10 sm:mb-16 max-w-3xl">
          <CoverReveal as="h2" className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a]">
            {content.title}
          </CoverReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Narrative */}
          <div className="lg:col-span-3 space-y-6">
            <p className="text-lg text-[#525252] leading-relaxed">{content.context}</p>
            <p className="text-lg text-[#525252] leading-relaxed">{content.solution}</p>
            <p className="text-lg text-[#0a0a0a] leading-relaxed font-medium">{content.outcome}</p>

            <Link
              href={buildLocalePath(locale as Locale, content.cta.href)}
              className="inline-flex items-center gap-2 pt-4 text-sm font-medium text-[#0a0a0a] hover:text-[#525252] transition-colors"
            >
              {content.cta.label} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Capabilities panel */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="lg:col-span-2 bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 sm:p-10 h-fit"
          >
            <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#525252] mb-8">
              {content.capabilitiesTitle}
            </h3>
            <ul className="space-y-4">
              {content.capabilities.map((capability, i) => (
                <m.li
                  key={capability}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  }}
                  className="flex items-start gap-4 text-sm text-[#525252] leading-relaxed"
                >
                  <span className="font-mono text-[10px] text-[#707070] tabular-nums pt-[3px] select-none" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {capability}
                </m.li>
              ))}
            </ul>
          </m.div>
        </div>
      </div>
    </m.section>
  )
}
