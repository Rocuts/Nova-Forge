"use client"
// The quota-capped voice demo of the RealTy landing.
//
// Rendered inside Voice.tsx, below the demonstration conversation, and ONLY
// when `REALTY_VOICE_DEMO_ENABLED=true` reached the page at build time. With
// the flag off nothing here is mounted, so the voice SDK's dynamic import is
// never even reached (see Voice.tsx).
//
// This file holds the whole state machine but imports nothing from
// @elevenlabs/react: the SDK lives in ./VoiceDemoLive, pulled in by
// next/dynamic with `ssr: false` the moment the visitor presses the button.
//
// Two orderings matter and are deliberate:
//  1. The microphone is requested BEFORE the session is asked for. A visitor
//     who blocks the microphone must not burn one of the day's sessions.
//  2. The probe stream is stopped the instant permission is granted. The SDK
//     opens its own capture stream; leaving this one running would light the
//     recording indicator twice over.
//
// Every string comes from `realty.voice.demo` in the dictionaries.
import dynamic from "next/dynamic"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/Button"
import { trackEvent } from "@/lib/analytics"
import { resolveHref } from "./shared"
import type { RealtyContent } from "./shared"

const VoiceDemoLive = dynamic(() => import("./VoiceDemoLive"), { ssr: false })

type DemoContent = RealtyContent["voice"]["demo"]

type Phase =
  | "idle"
  | "requesting"
  | "connecting"
  | "live"
  | "ended"
  | "quota"
  | "error"
  | "micDenied"

type Session = { signedUrl: string; maxSeconds: number }

const SESSION_PATH = "/api/realty/voice-session"
const FALLBACK_MAX_SECONDS = 120
const MIN_MAX_SECONDS = 30
const CEILING_MAX_SECONDS = 600

/** Server payload of a granted session. Narrowed before it is trusted. */
function readSession(body: unknown): Session | null {
  if (typeof body !== "object" || body === null) return null
  const record = body as Record<string, unknown>
  if (typeof record.signedUrl !== "string" || record.signedUrl.length === 0) return null
  const granted = typeof record.maxSeconds === "number" ? record.maxSeconds : FALLBACK_MAX_SECONDS
  const maxSeconds = Number.isFinite(granted)
    ? Math.min(CEILING_MAX_SECONDS, Math.max(MIN_MAX_SECONDS, Math.round(granted)))
    : FALLBACK_MAX_SECONDS
  return { signedUrl: record.signedUrl, maxSeconds }
}

function readError(body: unknown): { code: string; retryAfterSeconds: number } {
  const record = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
  const retry = typeof record.retryAfterSeconds === "number" ? record.retryAfterSeconds : 0
  return {
    code: typeof record.error === "string" ? record.error : "unknown",
    retryAfterSeconds: Number.isFinite(retry) && retry > 0 ? retry : 0,
  }
}

export function VoiceDemo({ content, locale }: { content: DemoContent; locale: string }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [session, setSession] = useState<Session | null>(null)
  /** Composed on the client because it can carry a local reset time. */
  const [quotaMessage, setQuotaMessage] = useState("")

  const quotaText = useCallback(
    (code: string, retryAfterSeconds: number) => {
      const base =
        code === "quota_ip"
          ? content.quota.ip
          : code === "quota_daily"
            ? content.quota.daily
            : content.quota.browser
      if (retryAfterSeconds <= 0) return base
      const at = new Date(Date.now() + retryAfterSeconds * 1000)
      const time = at.toLocaleTimeString(locale === "en" ? "en-GB" : "es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
      return `${base} ${content.quota.resetsAt.replace("{time}", time)}`
    },
    [content.quota, locale]
  )

  const start = useCallback(async () => {
    setQuotaMessage("")
    setPhase("requesting")

    // (1) Microphone first — a denial must never spend a session.
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("error")
      trackEvent("realty_voice_error", { reason: "no_microphone_api" })
      return
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setPhase("micDenied")
      trackEvent("realty_voice_error", { reason: "mic_denied" })
      return
    }
    // (2) Release the probe at once; the SDK opens its own capture stream.
    for (const track of stream.getTracks()) track.stop()

    try {
      const response = await fetch(SESSION_PATH, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, consent: true }),
      })
      const body: unknown = await response.json().catch(() => null)

      if (response.ok) {
        const granted = readSession(body)
        if (!granted) {
          setPhase("error")
          trackEvent("realty_voice_error", { reason: "bad_response" })
          return
        }
        setSession(granted)
        setPhase("connecting")
        trackEvent("realty_voice_start", { locale, maxSeconds: granted.maxSeconds })
        return
      }

      const { code, retryAfterSeconds } = readError(body)

      // 429 is the only status the visitor gets a specific explanation for:
      // the demo is capped on purpose and saying so is more honest than a
      // generic failure. 404 (flag off), 403 (origin), 502 (upstream) and 503
      // (not configured) all read the same from the outside — the page must
      // not narrate its own plumbing.
      if (response.status === 429) {
        setQuotaMessage(quotaText(code, retryAfterSeconds))
        setPhase("quota")
        trackEvent("realty_voice_quota", { reason: code })
        return
      }

      setPhase("error")
      trackEvent("realty_voice_error", { reason: code, status: response.status })
    } catch {
      setPhase("error")
      trackEvent("realty_voice_error", { reason: "network" })
    }
  }, [locale, quotaText])

  const handleEnded = useCallback((elapsedSeconds: number) => {
    setSession(null)
    setPhase("ended")
    trackEvent("realty_voice_end", { seconds: Math.round(elapsedSeconds) })
  }, [])

  const handleFailed = useCallback(() => {
    setSession(null)
    setPhase("error")
    trackEvent("realty_voice_error", { reason: "session_dropped" })
  }, [])

  const handleConnected = useCallback(() => setPhase("live"), [])

  // One polite region for every phase the live panel does not own. From
  // `connecting` onwards the panel below carries its own status line, so this
  // one goes silent rather than announcing the same thing twice.
  const notice =
    phase === "requesting"
      ? content.status.requesting
      : phase === "ended"
        ? content.status.ended
        : phase === "micDenied"
          ? content.micDenied
          : phase === "quota"
            ? quotaMessage
            : phase === "error"
              ? content.unavailable
              : ""

  const busy = phase === "requesting" || phase === "connecting"
  const showStart = phase === "idle" || busy
  const showRetry = phase === "ended" || phase === "micDenied"
  const showSchedule = phase === "ended" || phase === "quota" || phase === "error"

  return (
    <div
      data-voice-demo-state={phase}
      className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-6 md:p-8"
    >
      <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#707070]">
        {content.demoLabel}
      </p>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-[#0a0a0a]">{content.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#525252]">{content.description}</p>
      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[#707070]">{content.consent}</p>

      {phase !== "live" && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {showStart && (
            <Button size="md" onClick={start} disabled={busy}>
              {content.start}
            </Button>
          )}
          {showRetry && (
            // Alone (a blocked microphone) retrying IS the action; next to the
            // scheduling CTA (a finished demo) it steps back to secondary.
            <Button size="md" variant={showSchedule ? "secondary" : "primary"} onClick={start}>
              {content.retry}
            </Button>
          )}
          {showSchedule && (
            <Button
              size="md"
              variant={showRetry ? "primary" : "secondary"}
              href={resolveHref(locale, content.schedule.href)}
              onClick={() => trackEvent("realty_demo_click", { placement: "voice_demo" })}
            >
              {content.schedule.label}
            </Button>
          )}
        </div>
      )}

      <p role="status" aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm text-[#525252]">
        {notice}
      </p>

      {session && (phase === "connecting" || phase === "live") && (
        <VoiceDemoLive
          content={content}
          signedUrl={session.signedUrl}
          maxSeconds={session.maxSeconds}
          onConnected={handleConnected}
          onEnded={handleEnded}
          onFailed={handleFailed}
        />
      )}
    </div>
  )
}
