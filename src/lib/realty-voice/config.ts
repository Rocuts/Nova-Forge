// Server-only configuration for the RealTy voice demo. Nothing here is logged —
// `readVoiceDemoConfig()` returns a secret, callers must only test it for
// presence.
//
// Two modes, picked by what the environment holds:
//  * "signed"  — an API key is set, the agent is private, and the browser gets
//    a per-session signed URL. The key and the agent id never leave the server.
//  * "public"  — no API key. The agent is public in ElevenLabs and protected by
//    its domain allowlist there, so the browser gets the agent id and connects
//    on its own. The route still gates every request (origin + quotas).

export type VoiceDemoMode = "signed" | "public"

export type VoiceDemoConfig = {
  /** `REALTY_VOICE_DEMO_ENABLED === "true"`. Anything else keeps the demo off. */
  enabled: boolean
  /** "signed" when an API key is present, "public" otherwise. */
  mode: VoiceDemoMode
  /** ElevenLabs API key. Empty string in public mode. */
  apiKey: string
  /** ElevenLabs agent id (`agent_…`). Required in both modes; empty → 503. */
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
  const apiKey = env.ELEVENLABS_API_KEY?.trim() ?? ""
  return {
    enabled: env.REALTY_VOICE_DEMO_ENABLED === "true",
    mode: apiKey.length > 0 ? "signed" : "public",
    apiKey,
    agentId: env.ELEVENLABS_AGENT_ID?.trim() ?? "",
    maxSeconds: readInt(env.REALTY_VOICE_DEMO_MAX_SECONDS, DEFAULTS.maxSeconds, RANGES.maxSeconds),
    dailyMinutes: readInt(env.REALTY_VOICE_DEMO_DAILY_MINUTES, DEFAULTS.dailyMinutes, RANGES.dailyMinutes),
    perBrowser: readInt(env.REALTY_VOICE_DEMO_PER_BROWSER, DEFAULTS.perBrowser, RANGES.perBrowser),
    perIp: readInt(env.REALTY_VOICE_DEMO_PER_IP, DEFAULTS.perIp, RANGES.perIp),
  }
}

/**
 * True when the demo can actually run. Both modes need the agent id; "signed"
 * additionally needs the API key, which is what selected that mode to begin
 * with — so the agent id is the real gate.
 */
export function isVoiceDemoConfigured(config: VoiceDemoConfig): boolean {
  if (config.agentId.length === 0) return false
  return config.mode === "public" || config.apiKey.length > 0
}
