// Minimal ElevenLabs client: one call, one shape. The agent is private, so the
// browser never sees the agent id or the API key — it only gets the signed URL
// returned here, which ElevenLabs keeps valid for ~15 minutes.

const SIGNED_URL_ENDPOINT = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
const TIMEOUT_MS = 8_000

export type ElevenLabsFailure = "timeout" | "http_error" | "bad_response" | "network"

/** Typed failure so the route can answer 502 without leaking upstream detail. */
export class ElevenLabsError extends Error {
  readonly reason: ElevenLabsFailure
  readonly status?: number

  constructor(reason: ElevenLabsFailure, message: string, status?: number) {
    super(message)
    this.name = "ElevenLabsError"
    this.reason = reason
    this.status = status
  }
}

/**
 * Requests a per-session signed WebSocket URL for the configured agent.
 *
 * No retries: the caller has already reserved quota, and a retry would double
 * the latency of a request the user is waiting on with their microphone open.
 * A failure releases the reservation instead.
 */
export async function getSignedUrl(apiKey: string, agentId: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(agentId)}`, {
      method: "GET",
      headers: { "xi-api-key": apiKey },
      signal: controller.signal,
      cache: "no-store",
    })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ElevenLabsError("timeout", `Signed-URL request timed out after ${TIMEOUT_MS} ms`)
    }
    throw new ElevenLabsError("network", error instanceof Error ? error.message : "Network failure")
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new ElevenLabsError("http_error", `Signed-URL request failed`, response.status)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ElevenLabsError("bad_response", "Signed-URL response was not JSON", response.status)
  }

  const signedUrl =
    typeof payload === "object" && payload !== null && "signed_url" in payload
      ? (payload as { signed_url: unknown }).signed_url
      : undefined

  if (typeof signedUrl !== "string" || signedUrl.length === 0) {
    throw new ElevenLabsError("bad_response", "Signed-URL response had no signed_url", response.status)
  }

  return signedUrl
}
