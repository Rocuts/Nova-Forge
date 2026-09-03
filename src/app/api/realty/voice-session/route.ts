import { createHash } from "node:crypto"
import { isVoiceDemoConfigured, readVoiceDemoConfig } from "@/lib/realty-voice/config"
import { ElevenLabsError, getSignedUrl } from "@/lib/realty-voice/elevenlabs"
import { getQuotaStore, secondsUntilUtcMidnight, utcDay } from "@/lib/realty-voice/quota"

// Node runtime: the quota store and the sha256 hashing both want Node APIs, and
// the ElevenLabs key must never reach an edge bundle shared with the client.
export const runtime = "nodejs"
// Every answer depends on headers, cookies and a live counter — nothing here is
// ever cacheable.
export const dynamic = "force-dynamic"

const COOKIE_NAME = "realty_voice_demo"
const COOKIE_MAX_AGE = 86_400
const COOKIE_PATH = "/api/realty"
/** The signed URL is valid ~15 min upstream; hand out a 10 min window. */
const SESSION_TTL_MS = 10 * 60 * 1000
const LOCALES = new Set(["es", "en"])

type ErrorCode =
  | "bad_request"
  | "forbidden_origin"
  | "disabled"
  | "method_not_allowed"
  | "quota_browser"
  | "quota_ip"
  | "quota_daily"
  | "upstream"
  | "not_configured"

const NO_STORE = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" }

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...NO_STORE, ...extraHeaders } })
}

function fail(error: ErrorCode, status: number, extraHeaders: Record<string, string> = {}): Response {
  return json({ error }, status, extraHeaders)
}

function quotaExceeded(error: "quota_browser" | "quota_ip" | "quota_daily", retryAfterSeconds: number): Response {
  return json({ error, retryAfterSeconds }, 429, { "Retry-After": String(retryAfterSeconds) })
}

/**
 * Same-origin guard. The demo is only ever called by the RealTy landing on this
 * host, so a missing or foreign `Origin` is rejected outright — this is what
 * stops a third-party page from spending the daily budget.
 */
function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  if (!host) return false
  const stated = request.headers.get("origin") ?? request.headers.get("referer")
  if (!stated) return false
  try {
    return new URL(stated).host === host
  } catch {
    return false
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie")
  if (!header) return null
  for (const part of header.split(";")) {
    const separator = part.indexOf("=")
    if (separator === -1) continue
    if (part.slice(0, separator).trim() !== name) continue
    return decodeURIComponent(part.slice(separator + 1).trim())
  }
  return null
}

/** The cookie counter is a soft cap, not a security boundary: anyone can clear
 * it. It only needs to survive being garbage, so invalid values read as 0. */
function readBrowserCount(request: Request): number {
  const raw = readCookie(request, COOKIE_NAME)
  if (!raw) return 0
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 0) return 0
  return parsed
}

function browserCookie(count: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${COOKIE_NAME}=${count}; Path=${COOKIE_PATH}; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`
}

/** Hashed before it becomes a key so no raw IP is ever written to the store. */
function hashedIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown"
  return createHash("sha256").update(ip).digest("hex").slice(0, 16)
}

function parseBody(body: unknown): { locale: string } | null {
  if (typeof body !== "object" || body === null) return null
  const { locale, consent } = body as { locale?: unknown; consent?: unknown }
  if (consent !== true) return null
  if (typeof locale !== "string" || !LOCALES.has(locale)) return null
  return { locale }
}

export async function POST(request: Request): Promise<Response> {
  const config = readVoiceDemoConfig()

  // 1. Flag.
  if (!config.enabled) return fail("disabled", 404)

  // 2. Origin.
  if (!isSameOrigin(request)) return fail("forbidden_origin", 403)

  // 3. Body.
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return fail("bad_request", 400)
  }
  if (!parseBody(raw)) return fail("bad_request", 400)

  // 4. Configuration.
  if (!isVoiceDemoConfigured(config)) return fail("not_configured", 503)

  const store = getQuotaStore()
  const now = new Date()
  const day = utcDay(now)
  const retryAfterSeconds = secondsUntilUtcMidnight(now)

  // 5. Per-browser cap (cookie).
  const browserCount = readBrowserCount(request)
  if (browserCount >= config.perBrowser) return quotaExceeded("quota_browser", retryAfterSeconds)

  // 6. Per-IP cap.
  const ipDecision = await store.countIp(hashedIp(request), day, config.perIp)
  if (!ipDecision.allowed) return quotaExceeded("quota_ip", retryAfterSeconds)

  // 7. Global daily budget. Pessimistic: the whole session length is reserved
  // up front, and only an upstream failure gives it back.
  const dailyDecision = await store.reserveDaily(day, config.maxSeconds, config.dailyMinutes * 60)
  if (!dailyDecision.allowed) return quotaExceeded("quota_daily", retryAfterSeconds)

  const session = {
    maxSeconds: config.maxSeconds,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  }
  const grant = { "Set-Cookie": browserCookie(browserCount + 1) }

  // 8a. Public mode: the agent is public in ElevenLabs and fenced by its domain
  // allowlist there, so there is no upstream call and no 502 branch. The quota
  // is still spent — this route is what rations the account's minutes.
  if (config.mode === "public") {
    return json({ mode: "public", agentId: config.agentId, ...session }, 200, grant)
  }

  // 8b. Signed mode: private agent, per-session signed URL.
  let signedUrl: string
  try {
    signedUrl = await getSignedUrl(config.apiKey, config.agentId)
  } catch (error) {
    await store.releaseDaily(day, config.maxSeconds)
    const detail = error instanceof ElevenLabsError ? `${error.reason}${error.status ? ` (${error.status})` : ""}` : "unknown"
    console.error(`[realty-voice] signed-url request failed: ${detail}`)
    return fail("upstream", 502)
  }

  return json({ mode: "signed", signedUrl, ...session }, 200, grant)
}

/** Method check runs before everything else, so this answers even with the flag off. */
function methodNotAllowed(): Response {
  return fail("method_not_allowed", 405, { Allow: "POST" })
}

export const GET = methodNotAllowed
export const PUT = methodNotAllowed
export const PATCH = methodNotAllowed
export const DELETE = methodNotAllowed
export const OPTIONS = methodNotAllowed
export const HEAD = methodNotAllowed
