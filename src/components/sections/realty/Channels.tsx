"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["channels"]
  statusLabels: RealtyContent["statusLabels"]
}

/**
 * "Un comprador, muchas puertas, un solo expediente."
 *
 * Every channel states its reality next to its name, never after it: two of the
 * five are live today, the rest are on the roadmap, and the chip says so before
 * the description does.
 */
export function RealtyChannels({ content, statusLabels }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {content.items.map((item, i) => (
            <m.article
              key={item.name}
              {...revealProps(reduced, i, 16)}
              className="flex flex-col bg-white border border-[#e5e5e5] rounded-[6px] p-6 md:p-7"
            >
              <h3 className="font-heading text-lg font-semibold tracking-tight text-[#0a0a0a] mb-3">
                {item.name}
              </h3>
              <p className="text-sm leading-relaxed text-[#525252] mb-6">{item.description}</p>
              {/* The chip is `whitespace-nowrap` by default, which overflows a
                  fifth-of-a-row card once the label is as long as "Validado ·
                  se activa en el piloto". Cards are the one place it may wrap. */}
              <div className="mt-auto [&>span]:whitespace-normal [&>span]:items-baseline">
                <StatusChip status={item.status} labels={statusLabels} tone="light" />
              </div>
            </m.article>
          ))}
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
