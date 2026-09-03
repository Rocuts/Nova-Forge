"use client"
// The only module in the bundle that imports @elevenlabs/react.
//
// It is reached exclusively through `next/dynamic(..., { ssr: false })` from
// VoiceDemo.tsx, and only once the visitor has pressed "Hablar con el asesor"
// and the server has issued a signed URL. Nothing here runs on the server and
// nothing here is in the landing's initial payload: RealTy is an SSG page read
// mostly by people who will never open a microphone, and the voice SDK is far
// too large to charge them for it.
//
// Every string comes from `realty.voice.demo` in the dictionaries. No message,
// label or caveat is authored in this file (CLAUDE.md, RealTy block).
import { useCallback, useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { ConversationProvider, useConversation } from "@elevenlabs/react"
import { Button } from "@/components/ui/Button"
import type { RealtyContent } from "./shared"
// Type-only, so it is erased at compile time: no runtime edge back to the
// module that dynamically imports this one.
import type { VoiceSession } from "./VoiceDemo"

type DemoContent = RealtyContent["voice"]["demo"]

export type VoiceDemoLiveProps = {
  content: DemoContent
  /**
   * The session granted by /api/realty/voice-session, already validated there.
   * It carries either a signed URL (private agent) or an agent id (public
   * agent), plus the hard ceiling in seconds the server allowed.
   */
  session: VoiceSession
  /** The socket is up and the advisor is on the line. */
  onConnected: () => void
  /** Terminal: hang-up, countdown exhaustion, or the advisor closing the call. */
  onEnded: (elapsedSeconds: number) => void
  /** Terminal: the session never came up, or dropped with an error. */
  onFailed: () => void
}

/** Bars of the level meter. Thin, monochrome, no glow (Orbexs design system). */
const BAR_COUNT = 28

/**
 * Static per-bar envelope: taller in the middle, shorter at the edges, so the
 * meter reads as a voice rather than as a progress bar. Deterministic — the
 * shape never depends on `Math.random()`, which would make two renders differ.
 */
const ENVELOPE = Array.from({ length: BAR_COUNT }, (_, i) =>
  0.32 + 0.68 * Math.sin((Math.PI * (i + 0.5)) / BAR_COUNT)
)

const MIN_BAR_PX = 2
const MAX_BAR_PX = 26
/** Level the meter freezes at when the visitor asked for reduced motion. */
const STATIC_LEVEL = 0.45

function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

/**
 * Input/output level, as thin bars.
 *
 * The heights are written straight onto the DOM nodes from an interval: at ten
 * frames a second, re-rendering twenty-eight React elements would be pure
 * waste, and the meter carries no information React needs to know about.
 */
function LevelMeter({
  getInputVolume,
  getOutputVolume,
  active,
}: {
  getInputVolume: () => number
  getOutputVolume: () => number
  active: boolean
}) {
  const reduced = useReducedMotion()
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = barsRef.current
    if (!container) return

    const paint = (level: number) => {
      const bars = container.children
      for (let i = 0; i < bars.length; i += 1) {
        const height = MIN_BAR_PX + level * ENVELOPE[i] * (MAX_BAR_PX - MIN_BAR_PX)
        ;(bars[i] as HTMLElement).style.height = `${Math.round(height)}px`
      }
    }

    // Reduced motion: one static frame, no interval at all.
    if (reduced || !active) {
      paint(active && reduced ? STATIC_LEVEL : 0)
      return
    }

    const id = window.setInterval(() => {
      paint(Math.min(1, Math.max(getInputVolume(), getOutputVolume())))
    }, 100)
    return () => window.clearInterval(id)
  }, [active, reduced, getInputVolume, getOutputVolume])

  return (
    <div ref={barsRef} aria-hidden="true" className="flex h-[26px] items-end gap-[3px]">
      {ENVELOPE.map((_, i) => (
        <span key={i} className="w-[2px] bg-[#0a0a0a]" style={{ height: `${MIN_BAR_PX}px` }} />
      ))}
    </div>
  )
}

function LiveSession({ content, session, onConnected, onEnded, onFailed }: VoiceDemoLiveProps) {
  const { maxSeconds } = session
  const [turns, setTurns] = useState<{ id: number; who: "user" | "agent"; text: string }[]>([])
  const [remaining, setRemaining] = useState(maxSeconds)
  const [connected, setConnected] = useState(false)

  const turnId = useRef(0)
  const remainingRef = useRef(maxSeconds)
  /** One terminal callback per session, whichever path gets there first. */
  const settled = useRef(false)

  const finish = useCallback(() => {
    if (settled.current) return
    settled.current = true
    onEnded(maxSeconds - remainingRef.current)
  }, [maxSeconds, onEnded])

  const fail = useCallback(() => {
    if (settled.current) return
    settled.current = true
    onFailed()
  }, [onFailed])

  const conversation = useConversation({
    onConnect: () => {
      setConnected(true)
      onConnected()
    },
    onDisconnect: () => finish(),
    onError: () => fail(),
    onMessage: ({ message, role, source }) => {
      if (!message) return
      // `role` is the current field; `source` is its deprecated predecessor and
      // still arrives from older server builds — take whichever is present.
      const speaker = (role ?? (source === "ai" ? "agent" : "user")) === "agent" ? "agent" : "user"
      turnId.current += 1
      setTurns((previous) => [...previous, { id: turnId.current, who: speaker, text: message }])
    },
  })

  const { startSession, endSession, isSpeaking, getInputVolume, getOutputVolume } = conversation

  // Open the session on mount.
  //
  // The start is deferred by one macrotask on purpose: React's development
  // double-invoke mounts, unmounts and remounts this component, and the
  // provider ends any connection that was already in flight when it unmounts —
  // a session opened synchronously would be torn down and never replaced. A
  // cancellable timeout collapses the two passes into a single start.
  useEffect(() => {
    let cancelled = false
    const id = window.setTimeout(() => {
      if (cancelled) return
      startSession(
        session.mode === "signed"
          ? { signedUrl: session.signedUrl, connectionType: "websocket" }
          : { agentId: session.agentId, connectionType: "websocket" }
      )
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [startSession, session])

  const hangUp = useCallback(() => {
    endSession()
    finish()
  }, [endSession, finish])

  // Countdown. It starts on connection, never on mount: the seconds the visitor
  // is shown are the seconds they actually get to speak.
  useEffect(() => {
    if (!connected) return
    const deadline = Date.now() + remainingRef.current * 1000
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      remainingRef.current = left
      setRemaining(left)
      if (left === 0) {
        window.clearInterval(id)
        endSession()
        finish()
      }
    }, 500)
    return () => window.clearInterval(id)
  }, [connected, endSession, finish])

  const stateLine = connected
    ? isSpeaking
      ? content.status.speaking
      : content.status.listening
    : content.status.connecting

  return (
    <div className="mt-7 border-t border-[#e5e5e5] pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <LevelMeter
            getInputVolume={getInputVolume}
            getOutputVolume={getOutputVolume}
            active={connected}
          />
          <p role="status" aria-live="polite" className="text-sm text-[#0a0a0a]">
            {stateLine}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p
            role="timer"
            aria-label={content.countdownLabel}
            className="font-mono text-sm tabular-nums text-[#525252]"
          >
            {formatClock(remaining)}
          </p>
          <Button size="sm" variant="secondary" onClick={hangUp}>
            {content.hangUp}
          </Button>
        </div>
      </div>

      {turns.length > 0 && (
        <ol
          aria-live="polite"
          aria-label={content.demoLabel}
          /* Scrollable, so it needs a tabstop of its own: axe's
             scrollable-region-focusable rule, and a keyboard-only reader who
             would otherwise never reach the older turns. */
          tabIndex={0}
          className="mt-6 max-h-56 space-y-4 overflow-y-auto rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-4"
        >
          {turns.map((turn) => (
            <li key={turn.id}>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#707070]">
                {turn.who === "agent" ? content.speakerLabels.agent : content.speakerLabels.user}
              </p>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  turn.who === "agent" ? "text-[#0a0a0a]" : "text-[#525252]"
                }`}
              >
                {turn.text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/**
 * `useConversation` reads from `ConversationProvider`, so the provider has to
 * sit above the component that uses it — hence the two-layer default export
 * rather than a single hook call.
 */
export default function VoiceDemoLive(props: VoiceDemoLiveProps) {
  return (
    <ConversationProvider>
      <LiveSession {...props} />
    </ConversationProvider>
  )
}
