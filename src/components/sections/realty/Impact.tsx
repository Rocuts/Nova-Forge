"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["impact"]
  labels?: RealtyContent["statusLabels"]
  locale?: string
}

export function RealtyImpact({ content }: Props) {
  const reduced = useReducedMotion()
  const reveal = (i: number) => revealProps(reduced, i, 16)

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        {/* Outcomes as mechanisms — headless typographic grid, no numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
          {content.outcomes.map((outcome, i) => (
            <m.div key={outcome.title} {...reveal(i)}>
              <h3 className="text-2xl font-semibold tracking-tight text-[#0a0a0a] mb-4">
                {outcome.title}
              </h3>
              <p className="text-[#525252] leading-relaxed">{outcome.description}</p>
            </m.div>
          ))}
        </div>

        {/* Design target — the single figure on the page, qualified directly under it */}
        <m.div {...reveal(1)} className="mt-24 max-w-3xl">
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f8f8f8] p-8 md:p-12">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-6">
              {content.target.title}
            </p>
            <p className="font-heading text-5xl font-bold tracking-tight text-[#0a0a0a] mb-5">
              {content.target.value}
            </p>
            <p className="text-[#525252] leading-relaxed">{content.target.description}</p>
          </div>
          <Qualifier text={content.target.qualifier} />
        </m.div>
      </div>
    </section>
  )
}
