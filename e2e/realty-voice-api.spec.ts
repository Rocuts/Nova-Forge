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

test('(c) POST with same-origin and no API key is 503 not_configured (404 while the flag is off; the enabled branch is covered in production)', async ({
  request,
}) => {
  const res = await request.post(ENDPOINT, {
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    data: { locale: 'es', consent: true },
  })
  // 200/429 would mean this environment has real ElevenLabs credentials; the
  // contract under test is the unconfigured one.
  expect([404, 503]).toContain(res.status())
  const body = await res.json()
  expect(body.error).toBe(res.status() === 404 ? 'disabled' : 'not_configured')
})

test('(e) Permissions-Policy opens the microphone only on the RealTy landing', async ({ request }) => {
  const realty = await request.get('/es/realty')
  expect(realty.headers()['permissions-policy']).toContain('microphone=(self)')

  const home = await request.get('/es')
  expect(home.headers()['permissions-policy']).toContain('microphone=()')
  expect(home.headers()['permissions-policy']).not.toContain('microphone=(self)')
})
