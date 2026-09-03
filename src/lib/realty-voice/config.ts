// Server-only configuration for the RealTy voice demo. Never expose any of
// this to the client: the browser only ever receives a per-session signed URL.
// Nothing here is logged — `readVoiceDemoConfig()` returns secrets, callers
// must only test them for presence.

export type VoiceDemoConfig = {
  /** `REALTY_VOICE_DEMO_ENABLED === "true"`. Anything else keeps the demo off. */
  enabled: boolean
  /** ElevenLabs API key. Empty string when unset → route answers 503. */
  apiKey: string
  /** ElevenLabs agent id (`agent_…`). Empty string when unset → route answers 503. */
  agentId: string
  /** Seconds granted per session, also the amount reserved from the daily budget. */
  maxSeconds: number
  /** Global daily budget in minutes. */
  dailyMinutes: number
  /** Sessions per browser per day (soft cap, cookie based). */
  perBrowser: number
  /** Sessions per hashed IP per day. */
  perIp: number
}

const DEFAULTS = {
  maxSeconds: 120,
  dailyMinutes: 15,
  perBrowser: 3,
  perIp: 4,
} as const

const RANGES = {
  maxSeconds: { min: 60, max: 600 },
  dailyMinutes: { min: 1, max: 600 },
  perBrowser: { min: 1, max: 100 },
  perIp: { min: 1, max: 100 },
} as const

/**
 * Reads an integer env var, falling back to `fallback` when absent, malformed
 * or out of range. Out-of-range values are clamped rather than rejected so a
 * typo in the dashboard can never take the route down.
 */
function readInt(raw: string | undefined, fallback: number, range: { min: number; max: number }): number {
  if (!raw) return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  const int = Math.trunc(parsed)
  if (int < range.min) return range.min
  if (int > range.max) return range.max
  return int
}

/** Reads the voice-demo configuration from the environment on every request. */
export function readVoiceDemoConfig(): VoiceDemoConfig {
  const env = process.env
  return {
    enabled: env.REALTY_VOICE_DEMO_ENABLED === "true",
    apiKey: env.ELEVENLABS_API_KEY?.trim() ?? "",
    agentId: env.ELEVENLABS_AGENT_ID?.trim() ?? "",
    maxSeconds: readInt(env.REALTY_VOICE_DEMO_MAX_SECONDS, DEFAULTS.maxSeconds, RANGES.maxSeconds),
    dailyMinutes: readInt(env.REALTY_VOICE_DEMO_DAILY_MINUTES, DEFAULTS.dailyMinutes, RANGES.dailyMinutes),
    perBrowser: readInt(env.REALTY_VOICE_DEMO_PER_BROWSER, DEFAULTS.perBrowser, RANGES.perBrowser),
    perIp: readInt(env.REALTY_VOICE_DEMO_PER_IP, DEFAULTS.perIp, RANGES.perIp),
  }
}

/** True when the demo is fully wired (flag on plus both ElevenLabs secrets). */
export function isVoiceDemoConfigured(config: VoiceDemoConfig): boolean {
  return config.apiKey.length > 0 && config.agentId.length > 0
}
