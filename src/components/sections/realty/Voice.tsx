"use client"
import { m, useReducedMotion } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal as revealProps } from "./shared"
import type { RealtyContent, TranscriptTurn } from "./shared"

type Props = {
  content: RealtyContent["voice"]
  statusLabels: RealtyContent["statusLabels"]
}

const SPEAKER_LABEL = "font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]"

/**
 * One turn of the demonstration conversation.
 *
 * A `check` turn is the advisor confirming a fact against the inventory before
 * answering. It is rendered as a quiet inset line — never as a function call,
 * an argument list or anything else that reads as code (CLAUDE.md forbids the
 * engineering vocabulary on this page): a label, what was checked, and what
 * came back.
 */
function Turn({
  turn,
  labels,
}: {
  turn: TranscriptTurn
  labels: RealtyContent["voice"]["transcript"]["speakerLabels"]
}) {
  if (turn.kind === "check") {
    return (
      <div className="border-l border-[#d4d4d4] bg-white rounded-r-[4px] px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]">{labels.check}</p>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#525252]">{turn.text}</p>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#0a0a0a]">
          <span aria-hidden="true" className="mr-2 text-[#707070]">
            &rarr;
          </span>
          {turn.result}
        </p>
      </div>
    )
  }

  const isBuyer = turn.kind === "buyer"

  return (
    <div className={isBuyer ? "" : "border-l border-[#0a0a0a] pl-5"}>
      <p className={`mb-2 ${SPEAKER_LABEL}`}>{isBuyer ? labels.buyer : labels.advisor}</p>
      <p
        className={`text-sm leading-relaxed ${
          isBuyer ? "text-[#525252]" : "text-[#0a0a0a]"
        }`}
      >
        {turn.text}
      </p>
    </div>
  )
}

/**
 * "Un asesor que solo dice lo que su inventario confirma."
 *
 * The status card is the honesty anchor of the section: the voice advisor is
 * configured and tested but NOT deployed, so it always carries the `validated`
 * chip and the sentence that says it goes live with the pilot's credentials.
 * Nothing here may claim it is on calls.
 */
export function RealtyVoice({ content, statusLabels }: Props) {
  const reduced = useReducedMotion()

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Argument */}
          <div className="lg:col-span-5">
            <SectionHeading head={content} tone="light" />

            <div className="border-t border-[#e5e5e5]">
              {content.points.map((point, i) => (
                <m.div key={point.title} {...revealProps(reduced, i, 16)} className="border-b border-[#e5e5e5] py-6">
                  <h3 className="text-base font-semibold tracking-tight text-[#0a0a0a] mb-2">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-[#525252]">{point.description}</p>
                </m.div>
              ))}
            </div>

            <m.div
              {...revealProps(reduced, 1, 16)}
              className="mt-10 bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-6 md:p-8"
            >
              <StatusChip status={content.state.status} labels={statusLabels} tone="light" />
              <h3 className="mt-5 text-base font-semibold tracking-tight text-[#0a0a0a] mb-2">
                {content.state.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#525252]">{content.state.text}</p>
            </m.div>
          </div>

          {/* Demonstration conversation */}
          <m.div
            {...revealProps(reduced, 0, 20)}
            className="lg:col-span-7 bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] overflow-hidden"
          >
            <div className="border-b border-[#e5e5e5] px-5 py-4 md:px-7">
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070]">
                {content.transcript.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#525252]">{content.transcript.scenario}</p>
            </div>

            <ol aria-label={content.transcript.label} className="px-5 py-7 md:px-7 md:py-9 space-y-6">
              {content.transcript.turns.map((turn, i) => (
                // The turns stagger in on viewport entry, once. `reveal()` keeps
                // the server markup identical for every user — the reduced-motion
                // branch lives in `transition`, never in `initial` (see ./shared).
                <m.li key={`${turn.kind}-${i}`} {...revealProps(reduced, i, 12)}>
                  <Turn turn={turn} labels={content.transcript.speakerLabels} />
                </m.li>
              ))}
            </ol>
          </m.div>
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
