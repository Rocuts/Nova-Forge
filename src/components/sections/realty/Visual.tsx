"use client"
import { m, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["visual"]
  labels: RealtyContent["statusLabels"]
  locale?: string
}

export function RealtyVisual({ content, labels }: Props) {
  const reduced = useReducedMotion()
  const reveal = (i: number) => revealProps(reduced, i, 16)

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        {/* Show-then-tell loop — four numbered cells joined by hairline arrows */}
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-8">
          {content.loopTitle}
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
          {content.loop.map((item, i) => (
            <m.li key={item.step} {...reveal(i)} className="relative">
              <span className="block w-full h-[1px] bg-[#d4d4d4]" aria-hidden="true" />
              <p className="font-mono text-[10px] tracking-[0.28em] text-[#707070] mt-5 mb-3">
                {item.step}
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-[#0a0a0a] mb-3">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#525252]">{item.description}</p>
              {i < content.loop.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="hidden lg:block absolute -right-8 top-4 w-4 h-4 text-[#707070]"
                />
              )}
            </m.li>
          ))}
        </ol>

        {/* Prototype — bordered white panel */}
        <m.div
          {...reveal(1)}
          className="mt-20 rounded-[6px] border border-[#e5e5e5] bg-white p-8 md:p-12"
        >
          <h3 className="font-heading text-2xl font-bold tracking-tight text-[#0a0a0a] mb-6">
            {content.prototype.title}
          </h3>
          <div className="max-w-3xl space-y-5">
            {content.prototype.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-[#525252] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </m.div>

        {/* Roadmap — every line carries the planned chip */}
        <m.div {...reveal(2)} className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-6">
            {content.roadmapTitle}
          </p>
          <ul className="border-t border-[#e5e5e5]">
            {content.roadmap.map((entry) => (
              <li
                key={entry}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e5e5] py-5"
              >
                <span className="text-[#0a0a0a] leading-relaxed">{entry}</span>
                <StatusChip status="planned" labels={labels} />
              </li>
            ))}
          </ul>
        </m.div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
