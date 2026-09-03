"use client"
import { Fragment } from "react"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["inventory"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

/**
 * Inventory & claim types. The claim taxonomy, one worked example from the
 * demo dataset (inputs → ranked output → reasoning chain → unknowns), and the
 * developer/project/tower hierarchy with its status.
 */
export function RealtyInventory({ content, labels }: Props) {
  const reduce = useReducedMotion()
  const { example, hierarchy } = content

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        {/* Claim taxonomy: one row of mono-labelled cells, stacked below lg. */}
        <p className="font-mono text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-6">
          {content.claimTypesTitle}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-white border border-[#e5e5e5] rounded-[6px] divide-y divide-[#e5e5e5] lg:divide-y-0 lg:divide-x mb-20 md:mb-24">
          {content.claimTypes.map((claim, i) => (
            <m.div
              key={claim.name}
              {...reveal(reduce, i)}
              className="p-6 md:p-7"
            >
              <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-[#0a0a0a] mb-3">
                {claim.name}
              </p>
              <p className="text-sm leading-relaxed text-[#525252]">{claim.description}</p>
            </m.div>
          ))}
        </div>

        {/* Worked example, 5/7 split: inputs on the left, the ranked answer,
            its reasoning chain and the unknowns on the right. */}
        <m.div
          {...reveal(reduce, 0)}
          className="bg-white border border-[#e5e5e5] rounded-[6px] overflow-hidden"
        >
          <div className="border-b border-[#e5e5e5] px-6 md:px-8 py-5">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-[#0a0a0a]">
              {example.title}
            </h3>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#e5e5e5] p-6 md:p-8 bg-[#f8f8f8]">
              <p className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-[#525252] mb-6">
                {example.inputsTitle}
              </p>
              <dl className="space-y-4">
                {example.inputs.map((input) => (
                  <div key={input.label} className="border-t border-[#e5e5e5] pt-4 first:border-t-0 first:pt-0">
                    <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070] mb-1.5">
                      {input.label}
                    </dt>
                    <dd className="text-sm font-medium text-[#0a0a0a]">{input.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-7 p-6 md:p-8">
              <p className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-[#525252] mb-6">
                {example.outputTitle}
              </p>
              <ol className="mb-12">
                {example.output.map((row, i) => (
                  <li
                    key={row.label}
                    className="border-t border-[#e5e5e5] py-4 first:border-t-0 first:pt-0 flex items-baseline gap-4 md:gap-6"
                  >
                    <span aria-hidden="true" className="font-mono text-[11px] text-[#707070] shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-sm font-medium text-[#0a0a0a]">{row.label}</span>
                        <span className="font-mono text-sm text-[#0a0a0a]">{row.value}</span>
                      </span>
                      <span className="block mt-1.5 text-xs leading-relaxed text-[#737373]">{row.note}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-[#525252] mb-6">
                {example.chainTitle}
              </p>
              <ol className="mb-12">
                {example.chain.map((link, i) => (
                  <li key={`${link.kind}-${i}`} className="relative pl-9 pb-7 last:pb-0">
                    {i < example.chain.length - 1 && (
                      <span aria-hidden="true" className="absolute left-[3px] top-3 bottom-0 w-[1px] bg-[#e5e5e5]" />
                    )}
                    <span aria-hidden="true" className="absolute left-0 top-[7px] w-[7px] h-[7px] bg-[#0a0a0a]" />
                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#737373] mb-1.5">
                      {link.kind}
                    </p>
                    <p className="text-sm leading-relaxed text-[#525252]">{link.text}</p>
                  </li>
                ))}
              </ol>

              <p className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-[#525252] mb-6">
                {example.unknownsTitle}
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {example.unknowns.map((unknown) => (
                  <li key={unknown} className="flex items-start gap-3 text-sm leading-relaxed text-[#525252]">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] w-[7px] h-[7px] shrink-0 border border-dashed border-[#0a0a0a]/40"
                    />
                    {unknown}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </m.div>

        {/* Hierarchy: a breadcrumb of the levels, with its own status. */}
        <m.div
          {...reveal(reduce, 1)}
          className="mt-8 bg-white border border-[#e5e5e5] rounded-[6px] p-6 md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-[#0a0a0a]">
              {hierarchy.title}
            </h3>
            <StatusChip status={hierarchy.status} labels={labels} />
          </div>
          <div
            aria-hidden="true"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 font-mono text-[10px] tracking-[0.22em] uppercase text-[#525252]"
          >
            {hierarchy.levels.map((level, i) => (
              <Fragment key={level}>
                {i > 0 && <span className="text-[#707070]">&rarr;</span>}
                <span className="border border-[#e5e5e5] rounded-[2px] px-3 py-1.5">{level}</span>
              </Fragment>
            ))}
          </div>
          <p className="sr-only">{hierarchy.levels.join(" — ")}</p>
          <p className="text-sm leading-relaxed text-[#525252] max-w-3xl">{hierarchy.description}</p>
        </m.div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
