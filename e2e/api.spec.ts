import { test, expect } from '@playwright/test'

test('diagnostic API rejects a non-JSON body', async ({ request }) => {
  const res = await request.post('/api/diagnostic', {
    headers: { 'content-type': 'application/json' },
    data: 'not json',
  })
  expect(res.status()).toBe(400)
})

test('diagnostic API rejects oversized free-text fields', async ({ request }) => {
  const res = await request.post('/api/diagnostic', {
    data: { additionalNotes: 'x'.repeat(5000) },
  })
  expect(res.status()).toBe(400)
})

test('diagnostic API returns a report for valid answers', async ({ request }) => {
  const res = await request.post('/api/diagnostic', {
    data: {
      companyName: 'Acme',
      industry: 'Salud',
      teamSize: '11-50',
      painPoints: ['Procesos manuales'],
      goals: ['Automatizar operaciones'],
    },
  })
  expect(res.ok()).toBeTruthy()
  expect(await res.text()).toContain('Resumen Ejecutivo')
})
