"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["status"]
  statusLabels: RealtyContent["statusLabels"]
  /**
   * `REALTY_VOICE_DEMO_ENABLED === "true"` at build time (see page.tsx). When
   * true the `key: "voice"` row states the reality the visitor can verify two
   * sections above — a live demo in the browser — instead of "validated".
   */
  voiceDemoEnabled: boolean
}

/**
 * "Qué está construido hoy y qué se activa en el piloto."
 *
 * The single place where the whole product states its reality in one view, in
 * business words: one row per capability, its status chip, and one sentence of
 * note. This section is what the honesty contract (CLAUDE.md, RealTy block)
 * concentrates in one place instead of scattering caveats down the page.
 *
 * The activation card holds the ONLY performance figure the page is allowed —
 * "48–72 h" — and its qualifier sits directly under it, never a scroll away.
 */
export function RealtyStatus({ content, statusLabels, voiceDemoEnabled }: Props) {
  const reduced = useReducedMotion()

  // The table is the page's single source of reality, so the voice row cannot
  // keep saying "validated" while a working demo sits on the same page.
  const rows = content.rows.map((row) =>
    voiceDemoEnabled && row.key === "voice"
      ? { ...row, status: content.liveVoiceRow.status, note: content.liveVoiceRow.note }
      : row
  )

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        <m.div
          {...revealProps(reduced, 0, 16)}
          /* The table scrolls sideways below md. axe's `scrollable-region-focusable`
             requires a scroll container to be reachable by keyboard, so it takes
             a tabstop of its own — without it, a keyboard-only reader can see the
             first two columns and nothing else. */
          tabIndex={0}
          className="overflow-x-auto rounded-[6px] border border-[#e5e5e5] bg-white [mask-image:linear-gradient(to_right,black_calc(100%_-_28px),transparent)] md:[mask-image:none]"
        >
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                {content.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-6 py-4 font-mono text-[10px] font-normal tracking-[0.24em] uppercase text-[#707070]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.component} className="border-b border-[#e5e5e5] last:border-b-0">
                  <th scope="row" className="px-6 py-5 align-top text-sm font-medium text-[#0a0a0a]">
                    {row.component}
                  </th>
                  <td className="px-6 py-5 align-top">
                    <StatusChip status={row.status} labels={statusLabels} tone="light" />
                  </td>
                  <td className="px-6 py-5 align-top text-sm leading-relaxed text-[#525252]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </m.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activation target — the one figure on the page, qualified in place. */}
          <m.div
            {...revealProps(reduced, 1, 16)}
            className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 md:p-10"
          >
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-6">
              {content.activation.title}
            </p>
            <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-5">
              {content.activation.value}
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#525252]">
              {content.activation.description}
            </p>
            <p className="mt-6 text-xs leading-relaxed text-[#707070]">{content.activation.qualifier}</p>
          </m.div>

          {/* Technologies we build with — never a partnership or a certification. */}
          <m.div
            {...revealProps(reduced, 2, 16)}
            className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 md:p-10"
          >
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070] mb-6">
              {content.builtWith.title}
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#525252]">{content.builtWith.text}</p>
          </m.div>
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
