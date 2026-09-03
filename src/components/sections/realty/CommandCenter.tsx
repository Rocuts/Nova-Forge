"use client"
import { m, useReducedMotion } from "motion/react"
import { Check, Minus } from "lucide-react"
import { Qualifier, SectionHeading, SimValue, stagger, viewportConfig } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["commandCenter"]
  labels: RealtyContent["statusLabels"]
  locale: string
  simToken?: string
  simSrText?: string
}

const CARD = "rounded-[6px] border border-[#1a1a1a] bg-[#141414]"
const CARD_TITLE = "font-mono text-[10px] tracking-[0.26em] uppercase text-white/55"
const CELL = "px-5 py-4 align-middle"
/* The opportunities table is wider than the card until xl. A right-edge mask
   makes the cut read as "there is more here", not as a broken layout. */
const SCROLL_HINT =
  "[mask-image:linear-gradient(to_right,black_calc(100%_-_28px),transparent)] xl:[mask-image:none]"
const HATCH = "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 5px)"

/**
 * Dark schematic of the RealTy sales console: simulation band, opportunities
 * table, readiness ledger, close ledger and live column. Every figure is a
 * fixture, so every figure is rendered through SimValue.
 */
export function RealtyCommandCenter({ content, simToken, simSrText }: Props) {
  const reduced = useReducedMotion()
  // Same contract as reveal() in ./shared: `initial` reaches the server markup,
  // so it must be identical for everyone — only the transition may branch on
  // reduced motion, which collapses the reveal to an instant appearance.
  const from = { opacity: 0, y: 20 }
  const enter = (i: number) => (reduced ? { duration: 0, delay: 0 } : stagger(i))
  const token = simToken ?? content.simToken
  const srText = simSrText ?? content.simSrText

  const sim = (value: string) => (
    <SimValue token={token} srText={srText} tone="dark">
      {value}
    </SimValue>
  )

  return (
    <section id={content.id} className="bg-[#0a0a0a] py-24 md:py-32" data-header-theme="dark">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="dark" />

        {/* Simulation band: hatched ground, mono type — the register used for every fixture below. */}
        <m.div
          initial={from}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={enter(0)}
          className={`relative overflow-hidden ${CARD} px-5 py-4 md:px-6 md:py-5 mb-4`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 text-white opacity-[0.07]"
            style={{ backgroundImage: HATCH }}
          />
          <p className="relative font-mono text-[11px] leading-relaxed tracking-[0.08em] text-white/65">
            {content.band}
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Opportunities table */}
          <m.div
            initial={from}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={enter(1)}
            className={`${CARD} md:col-span-12 lg:col-span-8 overflow-hidden contain-layout`}
          >
            <div className="border-b border-[#1a1a1a] px-5 py-4">
              <h3 className={CARD_TITLE}>{content.opportunities.title}</h3>
            </div>
            <div className={`overflow-x-auto ${SCROLL_HINT}`}>
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {content.opportunities.columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="px-5 py-3 font-mono text-[10px] font-normal tracking-[0.2em] uppercase text-white/55 whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.opportunities.rows.map((row) => (
                    <tr key={row.lead} className="border-b border-[#1a1a1a] last:border-b-0">
                      <td className={`${CELL} text-sm text-white whitespace-nowrap`}>{row.lead}</td>
                      <td className={`${CELL} font-mono text-[11px] tracking-[0.14em] uppercase text-white/55`}>
                        {row.country}
                      </td>
                      <td className={`${CELL} text-sm text-white/70 whitespace-nowrap`}>{row.stage}</td>
                      <td className={`${CELL} font-mono text-[12px] whitespace-nowrap`}>{sim(row.readiness)}</td>
                      <td className={`${CELL} font-mono text-[10px] tracking-[0.2em] uppercase text-white/55 whitespace-nowrap`}>
                        {row.band}
                      </td>
                      <td className={`${CELL} font-mono text-[12px] whitespace-nowrap`}>{sim(row.close)}</td>
                      <td className={`${CELL} font-mono text-[11px] tracking-[0.14em] uppercase text-white/55`}>
                        {row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </m.div>

          {/* Readiness ledger */}
          <m.div
            initial={from}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={enter(2)}
            className={`${CARD} md:col-span-12 lg:col-span-4`}
          >
            <div className="border-b border-[#1a1a1a] px-5 py-4">
              <h3 className={CARD_TITLE}>{content.readiness.title}</h3>
            </div>
            <div className="px-5 py-6">
              <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white">
                {sim(content.readiness.score)}
              </p>
              <p className="mt-3 font-mono text-[10px] tracking-[0.26em] uppercase text-white/55">
                {content.readiness.scoreLabel}
              </p>
            </div>
            <ul className="border-t border-[#1a1a1a]">
              {content.readiness.components.map((component) => (
                <li key={component.name} className="border-b border-[#1a1a1a] px-5 py-4 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-white/80">{component.name}</span>
                    <span className="font-mono text-[12px] whitespace-nowrap">{sim(component.weight)}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">{component.note}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#1a1a1a] px-5 py-5">
              <h4 className={CARD_TITLE}>{content.readiness.blockersTitle}</h4>
              <ul className="mt-4 space-y-2.5">
                {content.readiness.blockers.map((blocker) => (
                  <li key={blocker} className="flex gap-3 text-xs leading-relaxed text-white/55">
                    <span aria-hidden="true" className="mt-[6px] inline-block h-[1px] w-3 shrink-0 bg-white/30" />
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          </m.div>

          {/* Close ledger */}
          <m.div
            initial={from}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={enter(3)}
            className={`${CARD} md:col-span-6 lg:col-span-5`}
          >
            <div className="border-b border-[#1a1a1a] px-5 py-4">
              <h3 className={CARD_TITLE}>{content.closeLedger.title}</h3>
            </div>
            <ul>
              {content.closeLedger.states.map((state) => (
                <li
                  key={state.name}
                  className="flex items-center gap-3 border-b border-[#1a1a1a] px-5 py-3.5 last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border ${
                      state.met ? "border-white/40 text-white" : "border-white/15 text-white/55"
                    }`}
                  >
                    {state.met ? <Check size={12} strokeWidth={1.5} /> : <Minus size={12} strokeWidth={1.5} />}
                  </span>
                  <span className={`text-sm ${state.met ? "text-white/85" : "text-white/55"}`}>{state.name}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#1a1a1a] px-5 py-4">
              <p className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-white/70">
                {sim(content.closeLedger.summary)}
              </p>
            </div>
          </m.div>

          {/* Live column */}
          <m.div
            initial={from}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={enter(4)}
            className={`${CARD} md:col-span-6 lg:col-span-7`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] px-5 py-4">
              <h3 className={CARD_TITLE}>{content.live.title}</h3>
              <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] uppercase text-white/70 whitespace-nowrap">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-white/50" />
                {content.live.indicator}
              </span>
            </div>
            <ul>
              {content.live.events.map((event) => (
                <li
                  key={`${event.lane}-${event.text}`}
                  className="flex flex-col gap-1 border-b border-[#1a1a1a] px-5 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-5"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/55 sm:w-32 sm:shrink-0">
                    {event.lane}
                  </span>
                  <span className="text-sm leading-relaxed text-white/70">{event.text}</span>
                </li>
              ))}
            </ul>
          </m.div>
        </div>

        <Qualifier text={content.qualifier} tone="dark" />
      </div>
    </section>
  )
}
