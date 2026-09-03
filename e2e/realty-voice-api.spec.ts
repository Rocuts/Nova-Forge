import { test, expect } from '@playwright/test'

// The voice demo is gated by REALTY_VOICE_DEMO_ENABLED, which is off by default
// in local dev. Each test therefore accepts the "disabled" branch (404) as well
// as the enabled one, so the suite is meaningful in both environments.

const ENDPOINT = '/api/realty/voice-session'
const ORIGIN = 'http://localhost:3000'

test('(a) voice-session rejects GET with 405 and Allow: POST', async ({ request }) => {
  const res = await request.get(ENDPOINT)
  expect(res.status()).toBe(405)
  expect(res.headers()['allow']).toBe('POST')
  expect(res.headers()['cache-control']).toContain('no-store')
})

test('(b) POST without Origin is 403 when enabled, 404 when the flag is off', async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    headers: { 'content-type': 'application/json' },
    data: { locale: 'es', consent: true },
  })
  expect([403, 404]).toContain(res.status())
  const body = await res.json()
  expect(body.error).toBe(res.status() === 404 ? 'disabled' : 'forbidden_origin')
  expect(res.headers()['cache-control']).toContain('no-store')
})

test('(c) POST with same-origin returns a public-mode grant, or 503 without an agent id (404 while the flag is off)', async ({
  request,
}) => {
  const res = await request.post(ENDPOINT, {
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    data: { locale: 'es', consent: true },
  })
  expect([200, 404, 503]).toContain(res.status())
  const body = await res.json()

  if (res.status() === 404) {
    // Flag off — the default locally. The enabled branch runs in production.
    expect(body.error).toBe('disabled')
    return
  }
  if (res.status() === 503) {
    // Flag on but no agent id configured.
    expect(body.error).toBe('not_configured')
    return
  }

  expect(body.maxSeconds).toBeGreaterThan(0)
  expect(typeof body.expiresAt).toBe('string')
  if (body.mode === 'public') {
    // No API key: the browser gets the public agent id, never a signed URL.
    expect(body.agentId).toMatch(/^agent_/)
    expect(body.signedUrl).toBeUndefined()
  } else {
    expect(body.mode).toBe('signed')
    expect(typeof body.signedUrl).toBe('string')
    expect(body.agentId).toBeUndefined()
  }
})

test('(e) Permissions-Policy opens the microphone only on the RealTy landing', async ({ request }) => {
  const realty = await request.get('/es/realty')
  expect(realty.headers()['permissions-policy']).toContain('microphone=(self)')

  const home = await request.get('/es')
  expect(home.headers()['permissions-policy']).toContain('microphone=()')
  expect(home.headers()['permissions-policy']).not.toContain('microphone=(self)')
})
