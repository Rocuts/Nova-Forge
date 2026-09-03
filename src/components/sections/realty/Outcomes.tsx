"use client"
import { m, useReducedMotion } from "motion/react"
import { SectionHeading, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["outcomes"]
}

/**
 * "Lo que cambia para su equipo comercial" — the commercial promise of the
 * page, stated before any screen is shown.
 *
 * Four claims, no numbers: the honesty contract (CLAUDE.md, RealTy block)
 * forbids percentages, multipliers and client counts, so each card carries a
 * mechanism instead of a metric. No third-party icons either — the house
 * language is typographic.
 */
export function RealtyOutcomes({ content }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.items.map((item, i) => (
            <m.article
              key={item.title}
              {...revealProps(reduced, i, 16)}
              className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 md:p-10"
            >
              <h3 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-[#0a0a0a] mb-4">
                {item.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-[#525252]">{item.description}</p>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  )
}
