"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["omnichannel"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

/**
 * Channels section. One buyer, one commercial context, many channels — the
 * grid states each channel's reality next to its name, never after it.
 */
export function RealtyOmnichannel({ content, labels }: Props) {
  const reduce = useReducedMotion()

  // The hairline grid draws its rules from the container background, so a short
  // last row would leave a grey block. Fill it with white cells, per breakpoint.
  const count = content.channels.length
  const fillMd = (2 - (count % 2)) % 2
  const fillLg = (3 - (count % 3)) % 3
  const fillers = Array.from({ length: Math.max(fillMd, fillLg) }, (_, i) => ({
    index: i,
    className: `${i < fillMd ? "hidden md:block" : "hidden"} ${i < fillLg ? "lg:block" : "lg:hidden"}`,
  }))

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        <m.p
          {...reveal(reduce, 0)}
          className="max-w-4xl border-l border-[#d4d4d4] pl-6 md:pl-10 mb-14 md:mb-16 font-heading text-2xl sm:text-3xl md:text-[2.5rem] font-medium tracking-tight leading-[1.25] text-[#0a0a0a]"
        >
          {content.principle}
        </m.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e5e5] border border-[#e5e5e5]">
          {content.channels.map((channel, i) => (
            <m.article
              key={channel.name}
              {...reveal(reduce, i)}
              className="bg-white p-8 md:p-10 flex flex-col"
            >
              <h3 className="font-heading text-xl font-semibold tracking-tight text-[#0a0a0a] mb-4">
                {channel.name}
              </h3>
              <div className="mb-5">
                <StatusChip status={channel.status} labels={labels} />
              </div>
              <p className="text-sm leading-relaxed text-[#525252]">{channel.description}</p>
            </m.article>
          ))}
          {fillers.map((filler) => (
            <div key={`filler-${filler.index}`} aria-hidden="true" className={`bg-white ${filler.className}`} />
          ))}
        </div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
