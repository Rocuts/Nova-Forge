"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["proof"]
  labels: RealtyContent["statusLabels"]
  locale?: string
}

export function RealtyProof({ content, labels }: Props) {
  const reduced = useReducedMotion()
  const reveal = (i: number) => revealProps(reduced, i, 16)

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        {/* Reality table — component · status · note */}
        <m.div
          {...reveal(0)}
          className="overflow-x-auto rounded-[6px] border border-[#e5e5e5] bg-white [mask-image:linear-gradient(to_right,black_calc(100%_-_28px),transparent)] md:[mask-image:none]"
        >
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                {content.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-6 py-4 font-mono text-[10px] font-normal tracking-[0.24em] uppercase text-[#737373]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row) => (
                <tr key={row.component} className="border-b border-[#e5e5e5] last:border-b-0">
                  <th
                    scope="row"
                    className="px-6 py-5 align-top text-sm font-medium text-[#0a0a0a]"
                  >
                    {row.component}
                  </th>
                  <td className="px-6 py-5 align-top">
                    <StatusChip status={row.status} labels={labels} />
                  </td>
                  <td className="px-6 py-5 align-top text-sm leading-relaxed text-[#525252]">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </m.div>

        {/* Technologies we build with — never a partnership claim */}
        <m.div {...reveal(1)} className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-6">
            {content.builtWith.title}
          </p>
          <ul className="flex flex-wrap gap-3">
            {content.builtWith.items.map((item) => (
              <li
                key={item}
                className="rounded-[2px] border border-[#e5e5e5] bg-white px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-[#525252]"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#707070]">
            {content.builtWith.note}
          </p>
        </m.div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
