"use client"
import { useEffect, useState } from "react"
import { m, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { Qualifier, SectionHeading, StatusChip, resolveHref, reveal } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["experience"]
  labels: RealtyContent["statusLabels"]
  locale: string
}

/** Playback cadence of the scripted transcript once the user presses play, in milliseconds. */
const TURN_MS = 2400

/** Entry fade of a turn. Short, and it always ends at full opacity. */
const FADE_S = 0.25

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Scripted demonstration conversation. The transcript is a client island: it
 * reveals one turn at a time, either on a timer (play) or step by step (next).
 * The timer lives in a single effect so it is cleared on pause, at the last
 * turn and on unmount. Nothing here is live — the turns come from the
 * dictionary and mirror the product's tool contracts.
 *
 * NOTHING AUTOPLAYS. The transcript mounts paused with the first turn already
 * visible, and only advances when the reader presses play or next. Scrolling
 * past used to arm the timer, which (a) moved content nobody asked to move and
 * (b) meant an automated contrast audit could sample a turn mid-fade and read a
 * blended, lighter colour than the one that is actually rendered at rest.
 */
export function RealtyExperience({ content, labels, locale }: Props) {
  const reduced = useReducedMotion() === true
  const total = content.turns.length
  const [visible, setVisible] = useState(1)
  const [playing, setPlaying] = useState(false)

  const atEnd = visible >= total
  // Derived, so the transcript stops at the last turn without a second effect.
  const isPlaying = playing && !atEnd

  useEffect(() => {
    if (!isPlaying) return
    const id = window.setInterval(() => {
      setVisible((n) => Math.min(n + 1, total))
    }, TURN_MS)
    return () => window.clearInterval(id)
  }, [isPlaying, total])

  const handleToggle = () => setPlaying((p) => !p)

  const handleNext = () => {
    setPlaying(false)
    setVisible((n) => Math.min(n + 1, total))
  }

  // Restart returns to the opening turn and leaves playback stopped — the same
  // state the section mounts in. Playing again is always an explicit press.
  const handleRestart = () => {
    setVisible(1)
    setPlaying(false)
  }

  const revealProps = reveal(reduced, 0)

  return (
    <section id={content.id} className="bg-[#f8f8f8] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} />

        <m.div
          {...revealProps}
          className="max-w-4xl border border-[#e5e5e5] rounded-[6px] bg-white overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] px-5 py-3 md:px-6">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#737373]">
              {content.scenarioLabel}
            </p>
            <p aria-hidden="true" className="font-mono text-[10px] tracking-[0.28em] text-[#737373]">
              {pad(Math.min(visible, total))} / {pad(total)}
            </p>
          </div>

          <ol
            aria-live="polite"
            aria-label={content.transcriptLabel}
            className="bg-[#f5f5f5] px-4 py-6 md:px-6 md:py-8 space-y-4 min-h-[20rem] md:min-h-[26rem]"
          >
            {content.turns.slice(0, visible).map((turn, i) => (
              // `initial` never branches on `reduced` — see reveal() in ./shared:
              // useReducedMotion() is false during SSR, so branching the inline
              // style it produces is a hydration mismatch. The fade is driven by
              // `animate` (not `whileInView`), so a turn always resolves to
              // opacity 1 whether or not it is on screen: no text is ever left
              // half-transparent at rest, and the colour a contrast audit reads
              // is the final one. Reduced motion collapses the fade to 0s.
              <m.li
                key={`${turn.kind}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : FADE_S, ease: "easeOut" }}
                className={`flex ${turn.kind === "buyer" ? "justify-end" : "justify-start"}`}
              >
                {turn.kind === "tool" ? (
                  <div className="w-full border border-[#d4d4d4] rounded-[6px] bg-white px-4 py-4 md:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#737373]">
                          {content.toolLabel}
                        </span>
                        <span aria-hidden="true" className="font-mono text-[10px] text-[#707070]">
                          &middot;
                        </span>
                        <span className="font-mono text-xs text-[#0a0a0a] break-all">
                          {turn.name}({turn.args})
                        </span>
                      </div>
                      <StatusChip status={turn.status} labels={labels} />
                    </div>
                    <p className="mt-3 font-mono text-xs leading-relaxed text-[#525252] break-words">
                      <span aria-hidden="true" className="mr-2 text-[#737373]">
                        &rarr;
                      </span>
                      {turn.result}
                    </p>
                  </div>
                ) : (
                  // Who speaks is carried by a visible mono caption, not by the
                  // bubble colour alone — colour is not an accessible cue.
                  <div className={`max-w-[88%] sm:max-w-[78%] ${turn.kind === "buyer" ? "text-right" : "text-left"}`}>
                    <p className="mb-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]">
                      {turn.kind === "buyer" ? content.speakerLabels.buyer : content.speakerLabels.advisor}
                    </p>
                    <div
                      className={`rounded-[6px] px-5 py-4 text-left text-sm leading-relaxed ${
                        turn.kind === "buyer"
                          ? "border border-[#e5e5e5] bg-white text-[#0a0a0a]"
                          : "bg-[#0a0a0a] text-white"
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                )}
              </m.li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#e5e5e5] px-5 py-4 md:px-6">
            <Button variant="secondary" size="sm" onClick={handleToggle} disabled={atEnd}>
              {isPlaying ? content.controls.pause : content.controls.play}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNext} disabled={atEnd}>
              {content.controls.next}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRestart} disabled={visible === 1 && !isPlaying}>
              {content.controls.restart}
            </Button>
          </div>
        </m.div>

        <div className="mt-10">
          <Button href={resolveHref(locale, content.action.href)} size="lg">
            {content.action.label}
          </Button>
        </div>

        <Qualifier text={content.qualifier} />
      </div>
    </section>
  )
}
