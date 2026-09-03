import { Redis } from "@upstash/redis"

// Quota accounting for the RealTy voice demo.
//
// Two counters, both keyed by UTC day:
//  * `realty:voice:day:<day>`  — seconds reserved out of the global budget.
//  * `realty:voice:ip:<hash>:<day>` — sessions granted to one hashed IP.
//
// Accounting is pessimistic: a session reserves its full `maxSeconds` the
// moment it is granted, and the route hands the seconds back only when the
// upstream call fails. Increments are read-modify-write free (INCRBY returns
// the new total) so two concurrent requests can never both slip past a limit.

const DAY_SECONDS = 86_400

export type QuotaDecision = {
  /** False when the counter would exceed the limit; the increment is rolled back. */
  allowed: boolean
  /** Counter value after the (possibly rolled back) increment. */
  used: number
  /** The limit that was tested. */
  limit: number
}

export type QuotaStore = {
  /** Reserves `seconds` from the day's budget. Rolls the reservation back when it would exceed `limitSeconds`. */
  reserveDaily(day: string, seconds: number, limitSeconds: number): Promise<QuotaDecision>
  /** Returns previously reserved seconds to the day's budget (upstream failure). */
  releaseDaily(day: string, seconds: number): Promise<void>
  /** Counts one session against a hashed IP for the day. Rolls back when over `limit`. */
  countIp(ipKey: string, day: string, limit: number): Promise<QuotaDecision>
}

/** UTC day as `YYYY-MM-DD`, the partition key for every counter. */
export function utcDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** Seconds until 00:00 UTC of the next day — what a 429 puts in `Retry-After`. */
export function secondsUntilUtcMidnight(now: Date = new Date()): number {
  const nextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  )
  return Math.max(1, Math.ceil((nextMidnight - now.getTime()) / 1000))
}

function dayKey(day: string): string {
  return `realty:voice:day:${day}`
}

function ipKeyFor(ipKey: string, day: string): string {
  return `realty:voice:ip:${ipKey}:${day}`
}

// --- Redis-backed store ------------------------------------------------------

class RedisQuotaStore implements QuotaStore {
  constructor(private readonly redis: Redis) {}

  private async bump(key: string, amount: number, ttlSeconds: number, limit: number): Promise<QuotaDecision> {
    // INCRBY + EXPIRE in one MULTI so a crash between them cannot leave a
    // counter without a TTL. INCRBY returns the post-increment total, which is
    // what the limit is tested against.
    const [used] = await this.redis.multi().incrby(key, amount).expire(key, ttlSeconds).exec<[number, 0 | 1]>()
    if (used > limit) {
      await this.redis.decrby(key, amount)
      return { allowed: false, used: used - amount, limit }
    }
    return { allowed: true, used, limit }
  }

  reserveDaily(day: string, seconds: number, limitSeconds: number): Promise<QuotaDecision> {
    // 48 h TTL: the counter outlives its day so a late release still lands.
    return this.bump(dayKey(day), seconds, DAY_SECONDS * 2, limitSeconds)
  }

  async releaseDaily(day: string, seconds: number): Promise<void> {
    await this.redis.decrby(dayKey(day), seconds)
  }

  countIp(ipKey: string, day: string, limit: number): Promise<QuotaDecision> {
    return this.bump(ipKeyFor(ipKey, day), 1, DAY_SECONDS, limit)
  }
}

// --- In-memory fallback ------------------------------------------------------

type MemoryEntry = { day: string; value: number }

/**
 * Per-instance fallback for local dev and preview deploys without Redis. Counts
 * are lost on cold start and never shared between instances, so it is a
 * best-effort brake, not a budget guarantee.
 */
class MemoryQuotaStore implements QuotaStore {
  private readonly counters = new Map<string, MemoryEntry>()

  private bump(key: string, day: string, amount: number, limit: number): QuotaDecision {
    this.prune(day)
    const entry = this.counters.get(key)
    const current = entry && entry.day === day ? entry.value : 0
    const used = current + amount
    if (used > limit) {
      this.counters.set(key, { day, value: current })
      return { allowed: false, used: current, limit }
    }
    this.counters.set(key, { day, value: used })
    return { allowed: true, used, limit }
  }

  /** Day-based expiry: anything not from today is dead weight. */
  private prune(day: string): void {
    for (const [key, entry] of this.counters) {
      if (entry.day !== day) this.counters.delete(key)
    }
  }

  async reserveDaily(day: string, seconds: number, limitSeconds: number): Promise<QuotaDecision> {
    return this.bump(dayKey(day), day, seconds, limitSeconds)
  }

  async releaseDaily(day: string, seconds: number): Promise<void> {
    const key = dayKey(day)
    const entry = this.counters.get(key)
    if (entry && entry.day === day) {
      this.counters.set(key, { day, value: Math.max(0, entry.value - seconds) })
    }
  }

  async countIp(ipKey: string, day: string, limit: number): Promise<QuotaDecision> {
    return this.bump(ipKeyFor(ipKey, day), day, 1, limit)
  }
}

// --- Store selection ---------------------------------------------------------

/** Upstash and Vercel KV expose the same REST pair under different prefixes. */
function readRedisCredentials(): { url: string; token: string } | null {
  const env = process.env
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return { url, token }
}

let store: QuotaStore | null = null
let warned = false

/** Returns the process-wide quota store, building it on first use. */
export function getQuotaStore(): QuotaStore {
  if (store) return store
  const credentials = readRedisCredentials()
  if (credentials) {
    store = new RedisQuotaStore(new Redis({ url: credentials.url, token: credentials.token }))
  } else {
    if (!warned) {
      warned = true
      console.warn(
        "[realty-voice] No Redis credentials (UPSTASH_REDIS_REST_* / KV_REST_API_*); quota falls back to an in-memory counter that is per-instance and lost on cold start.",
      )
    }
    store = new MemoryQuotaStore()
  }
  return store
}

/** Test seam: drops the cached store so the next call re-reads the environment. */
export function resetQuotaStoreForTests(): void {
  store = null
  warned = false
}
