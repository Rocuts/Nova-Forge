"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["journey"]
  statusLabels: RealtyContent["statusLabels"]
}

const COLUMN_LABEL = "font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]"

const pad = (n: number) => String(n + 1).padStart(2, "0")

/**
 * Fill of one pipeline segment. Three states only, all monochrome except the
 * current stage, which is the single accent on the section (#2563eb).
 */
function segmentClass(index: number, current: number): string {
  if (index === current) return "bg-[#2563eb]"
  if (index < current) return "bg-[#0a0a0a]"
  return "bg-[#d4d4d4]"
}

/**
 * The nine real pipeline stages plus the two terminal outcomes, drawn with
 * hairline segments rather than a chart library — the same hand-built visual
 * language as the console.
 *
 * Desktop renders the bar; below `md` the same stages become a numbered list,
 * because eleven labels never fit a phone width legibly. Only one of the two is
 * in the layout at a time (`hidden` toggles `display`), so assistive tech never
 * hears the stages twice. The bar itself is a single `role="img"` node with a
 * descriptive label: the segments are a picture of a sequence, not eleven
 * separate things to tab through.
 */
function PipelineBar({ pipeline }: { pipeline: RealtyContent["journey"]["pipeline"] }) {
  const { stages, terminal, current, label } = pipeline
  const currentName = stages[current] ?? stages[0]
  const ariaLabel = `${label}: ${stages.join(" → ")} → ${terminal.join(" / ")}. ${currentName}.`

  return (
    <div className="mb-14 md:mb-16">
      <p className={`${COLUMN_LABEL} mb-5`}>{label}</p>

      {/* Desktop / tablet: the bar */}
      <div role="img" aria-label={ariaLabel} className="hidden md:flex items-start gap-3">
        <div className="flex flex-1 items-start gap-1">
          {stages.map((stage, i) => (
            <div key={stage} className="flex-1 min-w-0">
              <div aria-hidden="true" className={`h-2 rounded-[2px] ${segmentClass(i, current)}`} />
              <p
                className={`mt-3 font-mono text-[10px] leading-snug tracking-[0.08em] uppercase ${
                  i === current ? "text-[#2563eb]" : "text-[#525252]"
                }`}
              >
                {stage}
              </p>
            </div>
          ))}
        </div>

        {/* Hairline: the terminals are outcomes, not another stage in the row. */}
        <span aria-hidden="true" className="w-[1px] self-stretch bg-[#d4d4d4]" />

        <div className="flex w-[22%] shrink-0 items-start gap-1">
          {terminal.map((name) => (
            <div key={name} className="flex-1 min-w-0">
              <div aria-hidden="true" className="h-2 rounded-[2px] border border-[#a3a3a3]" />
              <p className="mt-3 font-mono text-[10px] leading-snug tracking-[0.08em] uppercase text-[#707070]">
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: the same sequence as a numbered list */}
      <ol className="md:hidden border-t border-[#e5e5e5]">
        {[...stages, ...terminal].map((name, i) => {
          const isTerminal = i >= stages.length
          const isCurrent = i === current
          return (
            <li
              key={name}
              className={`flex items-center gap-4 border-b border-[#e5e5e5] py-3 ${
                isTerminal ? "border-t border-t-[#d4d4d4]" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block w-1.5 h-4 rounded-[1px] ${
                  isTerminal ? "border border-[#a3a3a3]" : segmentClass(i, current)
                }`}
              />
              <span className="font-mono text-[10px] tracking-[0.22em] text-[#707070]">
                {isTerminal ? "—" : pad(i)}
              </span>
              <span
                className={`text-sm ${isCurrent ? "text-[#2563eb] font-medium" : "text-[#525252]"}`}
              >
                {name}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function RealtyJourney({ content, statusLabels }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        <PipelineBar pipeline={content.pipeline} />

        {/* Column headers, shown once at lg; below that each row carries its own
            labels, so the two never reach assistive tech together. */}
        <div className="hidden lg:grid grid-cols-12 gap-8 pb-4 border-b border-[#e5e5e5]">
          <div className="col-span-4" />
          <p className={`col-span-4 ${COLUMN_LABEL}`}>{content.systemLabel}</p>
          <p className={`col-span-4 ${COLUMN_LABEL}`}>{content.buyerLabel}</p>
        </div>

        <div className="border-t border-[#e5e5e5] lg:border-t-0">
          {content.steps.map((step, i) => (
            <m.div
              key={step.step}
              /* Each row reveals on its own entry, so the delay ladder is kept
                 short rather than cumulative down the list. */
              {...revealProps(reduced, i % 3, 16)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-8 md:py-10 border-b border-[#e5e5e5]"
            >
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#707070]">
                    {step.step}
                  </span>
                  <span aria-hidden="true" className="w-8 h-[1px] bg-[#d4d4d4]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#0a0a0a] tracking-tight mb-4">
                  {step.title}
                </h3>
                <StatusChip status={step.status} labels={statusLabels} tone="light" />
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
