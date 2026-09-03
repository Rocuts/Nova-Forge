"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["journey"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

const COLUMN_LABEL = "font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]"

export function RealtyJourney({ content, labels }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        {/* Ledger column headers. Shown once at lg; below that each row carries
            its own labels, so the two never reach assistive tech together. */}
        <div className="hidden lg:grid grid-cols-12 gap-8 pb-4 border-b border-[#e5e5e5]">
          <div className="col-span-4" />
          <p className={`col-span-4 ${COLUMN_LABEL}`}>{content.systemLabel}</p>
          <p className={`col-span-4 ${COLUMN_LABEL}`}>{content.buyerLabel}</p>
        </div>

        <div className="border-t border-[#e5e5e5] lg:border-t-0">
          {content.steps.map((step, i) => (
            <m.div
              key={step.step}
              /* The ledger is ten rows tall and each row reveals on its own
                 entry, so the delay ladder is kept short rather than cumulative. */
              {...reveal(reduced, i % 3, 16)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-8 md:py-10 border-b border-[#e5e5e5]"
            >
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#707070]">
                    {step.step}
                  </span>
                  <span aria-hidden="true" className="w-8 h-[1px] bg-[#e5e5e5]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0a0a0a] tracking-tight mb-4">
                  {step.title}
                </h3>
                <StatusChip status={step.status} labels={labels} tone="light" />
              </div>

              <div className="lg:col-span-4">
                <p className={`lg:hidden mb-2 ${COLUMN_LABEL}`}>{content.systemLabel}</p>
                <p className="text-sm text-[#525252] leading-relaxed">{step.system}</p>
              </div>

              <div className="lg:col-span-4">
                <p className={`lg:hidden mb-2 ${COLUMN_LABEL}`}>{content.buyerLabel}</p>
                <p className="text-sm text-[#525252] leading-relaxed">{step.buyer}</p>
              </div>
            </m.div>
          ))}
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
