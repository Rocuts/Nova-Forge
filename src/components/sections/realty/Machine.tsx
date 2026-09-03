"use client"
import { ArrowDown, ArrowRight, Building2, FileCheck, ListChecks, Megaphone, MessageSquare, RefreshCw } from "lucide-react"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["machine"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

/**
 * Connector visibility per stage index. The flow reflows 1 → 3 → 6 columns, so
 * each cell needs its own rule about which edge carries the arrow:
 * at lg every cell but the last points right; at md the row wraps after index 2,
 * so that cell points down instead; stacked, every cell but the last points down.
 */
const ARROW_RIGHT = [
  "hidden md:block",
  "hidden md:block",
  "hidden lg:block",
  "hidden md:block",
  "hidden md:block",
  "hidden",
]

const ARROW_DOWN = [
  "block md:hidden",
  "block md:hidden",
  "block lg:hidden",
  "block md:hidden",
  "block md:hidden",
  "hidden",
]

/**
 * One lucide glyph per stage, chosen by index: a scanning aid beside the mono
 * step number, aria-hidden because the stage title already names the stage.
 */
const STAGE_ICONS = [Megaphone, MessageSquare, ListChecks, Building2, RefreshCw, FileCheck]

export function RealtyMachine({ content, labels }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#e5e5e5] border border-[#e5e5e5]">
          {content.stages.map((stage, i) => {
            const Icon = STAGE_ICONS[i] ?? Megaphone
            return (
              <m.div
                key={stage.step}
                {...reveal(reduced, i)}
                className="relative bg-white p-6 lg:p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#737373]">
                    {stage.step}
                  </span>
                  <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="text-[#525252] shrink-0" />
                  <span aria-hidden="true" className="flex-1 h-[1px] bg-[#e5e5e5]" />
                </div>

                <h3 className="text-base lg:text-[17px] font-semibold text-[#0a0a0a] tracking-tight mb-4">
                  {stage.title}
                </h3>

                <div className="mb-4">
                  <StatusChip status={stage.status} labels={labels} tone="light" />
                </div>

                <p className="text-sm text-[#525252] leading-relaxed mb-6">{stage.description}</p>

                <p className="mt-auto pt-4 border-t border-[#e5e5e5] text-xs leading-relaxed text-[#707070]">
                  {stage.detail}
                </p>

                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 bg-white px-1 py-1 text-[#707070] ${ARROW_RIGHT[i] ?? "hidden"}`}
                >
                  <ArrowRight size={14} strokeWidth={1.5} />
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10 bg-white px-1 py-1 text-[#707070] ${ARROW_DOWN[i] ?? "hidden"}`}
                >
                  <ArrowDown size={14} strokeWidth={1.5} />
                </span>
              </m.div>
            )
          })}
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
