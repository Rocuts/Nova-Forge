"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["followUp"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

/**
 * Follow-up. Two typographic columns; each item carries the status of the
 * thing it describes, so built engines and planned cadences never blur.
 */
export function RealtyFollowUp({ content, labels }: Props) {
  const reduce = useReducedMotion()

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        <div className="grid md:grid-cols-2 gap-x-16 lg:gap-x-20 gap-y-12 md:gap-y-16">
          {content.items.map((item, i) => (
            <m.article
              key={item.title}
              {...reveal(reduce, i)}
              className="border-t border-[#e5e5e5] pt-8"
            >
              <div className="mb-5">
                <StatusChip status={item.status} labels={labels} />
              </div>
              <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-[#0a0a0a] mb-4">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-[#525252]">{item.description}</p>
            </m.article>
          ))}
        </div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
