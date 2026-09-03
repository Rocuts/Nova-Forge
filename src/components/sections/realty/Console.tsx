"use client"
import { useState } from "react"
import { m, useReducedMotion } from "motion/react"
import { DemoTag, Qualifier, SectionHeading, reveal } from "./shared"
import type { RealtyContent, RealtyStatus } from "./shared"
import { Meter } from "./viz"

/**
 * Props of `RealtyConsole`.
 *
 * `statusLabels` is used for the one legend that explains the hatched rows of
 * the close ledger — the only texture on the page. `metLabel` / `unmetLabel`
 * are optional screen-reader words for the ledger's filled / empty square; the
 * dictionary has no key for them yet, so without them the state is carried by
 * the square plus the ledger summary line ("3 of 6 states met").
 */
export interface RealtyConsoleProps {
  content: RealtyContent["console"]
  statusLabels: Record<RealtyStatus, string>
  demoLabel: string
  demoSrText: string
  metLabel?: string
  unmetLabel?: string
}

const CARD = "rounded-[6px] border border-[#1a1a1a] bg-[#141414]"
const CARD_TITLE =
  "font-mono text-[10px] tracking-[0.26em] uppercase text-[#a3a3a3]"
const CELL = "px-5 py-4 align-middle"
/* The opportunities table is wider than its card until xl. A right-edge mask
   makes the cut read as "there is more here", not as a broken layout. */
const SCROLL_HINT =
  "[mask-image:linear-gradient(to_right,black_calc(100%_-_28px),transparent)] xl:[mask-image:none]"
/* The one texture on this page: it marks a simulated row of the close ledger. */
const HATCH =
  "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 5px)"

/** Two decimals, dot separator — the same reading the product's console gives. */
const score = (value: number) => value.toFixed(2)

function FrameHeader({
  title,
  demoLabel,
  demoSrText,
}: {
  title: string
  demoLabel: string
  demoSrText: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] px-5 py-4">
      <h3 className={CARD_TITLE}>{title}</h3>
      <DemoTag label={demoLabel} srText={demoSrText} tone="dark" />
    </div>
  )
}

/**
 * The commercial console, in three frames: the opportunities table, the buying
 * maturity card for the featured buyer, and the close ledger. Structure mirrors
 * the product's own screens so the demo tells the same story the landing does.
 */
export function RealtyConsole({
  content,
  statusLabels,
  demoLabel,
  demoSrText,
  metLabel,
  unmetLabel,
}: RealtyConsoleProps) {
  const reduced = useReducedMotion()
  // Bars grow once, when the section scrolls into view. `drawn` only ever
  // changes after hydration, so the server markup never branches on it.
  const [drawn, setDrawn] = useState(false)
  const { opportunities, readiness, closeLedger } = content
  const readinessColumn = opportunities.columns[3] ?? readiness.title

  return (
    <section
      id={content.id}
      className="bg-[#0a0a0a] py-24 md:py-32"
      data-header-theme="dark"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="dark" />

        {/* Environment band — plain rule and mono type, no texture. */}
        <m.div
          {...reveal(reduced, 0)}
          className={`${CARD} mb-4 px-5 py-4 md:px-6 md:py-5`}
        >
          <p className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-[#a3a3a3]">
            {content.band}
          </p>
        </m.div>

        <m.div
          {...reveal(reduced, 1)}
          onViewportEnter={() => setDrawn(true)}
          className="flex flex-col gap-4"
        >
          {/* Opportunities — full width, so the last column never needs an
              internal scroll on a laptop; the overflow is a mobile safety net. */}
          <div className={`${CARD} overflow-hidden`}>
            <FrameHeader
              title={opportunities.title}
              demoLabel={demoLabel}
              demoSrText={demoSrText}
            />
            {/* A scrollable region needs to be focusable, or a keyboard user
                never reaches the columns past the right edge (axe:
                scrollable-region-focusable). Named, so the focus stop says
                what it is. */}
            <div
              role="region"
              aria-label={opportunities.title}
              tabIndex={0}
              className={`overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60 ${SCROLL_HINT}`}
            >
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {opportunities.columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap px-5 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-[#a3a3a3]"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {opportunities.rows.map((row) => (
                    <tr
                      key={row.lead}
                      className="border-b border-[#1a1a1a] last:border-b-0"
                    >
                      <th
                        scope="row"
                        className={`${CELL} whitespace-nowrap text-left text-sm font-normal text-white`}
                      >
                        {row.lead}
                      </th>
                      <td
                        className={`${CELL} font-mono text-[11px] uppercase tracking-[0.14em] text-[#a3a3a3]`}
                      >
                        {row.country}
                      </td>
                      <td
                        className={`${CELL} whitespace-nowrap text-sm text-[#a3a3a3]`}
                      >
                        {row.stage}
                      </td>
                      <td className={CELL}>
                        {/* min-w-max: without it the flex row reports a
                            min-content width the table can under-allocate,
                            and the band label spills over the next column. */}
                        <div className="flex min-w-max items-center gap-3">
                          <Meter
                            value={row.readiness}
                            max={1}
                            ariaLabel={`${readinessColumn}: ${score(row.readiness)} · ${row.band}`}
                            tone="dark"
                            drawn={drawn}
                            className="w-16 shrink-0"
                          />
                          <span className="font-mono text-[12px] tabular-nums text-white">
                            {score(row.readiness)}
                          </span>
                          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-[#a3a3a3]">
                            {row.band}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${CELL} whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-white`}
                      >
                        {row.unit}
                      </td>
                      <td
                        className={`${CELL} min-w-[190px] text-sm text-[#a3a3a3]`}
                      >
                        {row.next}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {/* Buying maturity */}
            <div className={CARD}>
              <FrameHeader
                title={readiness.title}
                demoLabel={demoLabel}
                demoSrText={demoSrText}
              />
              <div className="border-b border-[#1a1a1a] px-5 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3a3a3]">
                  {readiness.lead}
                </p>
                <p className="mt-3 font-heading text-4xl font-bold leading-none tracking-tight text-white md:text-5xl">
                  {score(readiness.score)}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3a3a3]">
                  {readiness.band}
                </p>
                <Meter
                  value={readiness.score}
                  max={1}
                  ariaLabel={`${readiness.lead} — ${readiness.title}: ${score(readiness.score)} · ${readiness.band}`}
                  tone="dark"
                  accent
                  drawn={drawn}
                  className="mt-5"
                />
              </div>
              <ul>
                {readiness.components.map((component, i) => (
                  <li
                    key={component.name}
                    className="border-b border-[#1a1a1a] px-5 py-4 last:border-b-0"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-white">
                        {component.name}
                      </span>
                      <span className="whitespace-nowrap font-mono text-[12px] tabular-nums text-[#a3a3a3]">
                        {component.value} / {component.max}
                      </span>
                    </div>
                    <Meter
                      value={component.value}
                      max={component.max}
                      ariaLabel={`${component.name}: ${component.value} / ${component.max}`}
                      tone="dark"
                      drawn={drawn}
                      delayMs={60 * i}
                      className="mt-2.5"
                    />
                    <p className="mt-2.5 text-xs leading-relaxed text-[#a3a3a3]">
                      {component.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: close ledger + the three guarantees, so both columns land at a similar height. */}
            <div className="grid gap-4">
              <div className={`${CARD} overflow-hidden`}>
                <FrameHeader
                  title={closeLedger.title}
                  demoLabel={demoLabel}
                  demoSrText={demoSrText}
                />
                <ul>
                  {closeLedger.states.map((state) => (
                    <li
                      key={state.name}
                      className="relative flex items-center gap-3 border-b border-[#1a1a1a] px-5 py-3.5 last:border-b-0"
                    >
                      {state.simulated ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 text-white opacity-[0.06]"
                          style={{ backgroundImage: HATCH }}
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className={`relative inline-block h-3 w-3 shrink-0 rounded-[1px] border ${
                          state.met
                            ? "border-white bg-white"
                            : "border-[#a3a3a3] bg-transparent"
                        }`}
                      />
                      <span
                        className={`relative text-sm ${state.met ? "text-white" : "text-[#a3a3a3]"}`}
                      >
                        {state.name}
                      </span>
                      {metLabel && unmetLabel ? (
                        <span className="sr-only">
                          {state.met ? metLabel : unmetLabel}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1a1a1a] px-5 py-4">
                  <p className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-white">
                    {closeLedger.summary}
                  </p>
                  {/* The legend that gives the hatch its meaning. */}
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a3a3a3]">
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-4 rounded-[1px] border border-[#2a2a2a] text-white opacity-60"
                      style={{ backgroundImage: HATCH }}
                    />
                    {statusLabels.simulated}
                  </span>
                </div>
              </div>

              {/* Three guarantees, in plain words. */}
              <ul className={CARD}>
                {content.principles.map((principle) => (
                  <li
                    key={principle.title}
                    className="border-b border-[#1a1a1a] px-5 py-5 last:border-b-0"
                  >
                    <h3 className="font-heading text-base font-semibold tracking-tight text-white">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {principle.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </m.div>

        <Qualifier text={content.qualifier} tone="dark" />
      </div>
    </section>
  )
}
