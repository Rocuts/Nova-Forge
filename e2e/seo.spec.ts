import { test, expect, type Page } from '@playwright/test'

type JsonLdNode = { '@type'?: string; [key: string]: unknown }

/** Every JSON-LD node on the page (arrays and @graph flattened). */
async function readJsonLd(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block) as JsonLdNode | JsonLdNode[]
    const nodes = Array.isArray(parsed) ? parsed : [parsed]
    return nodes.flatMap((node) => (Array.isArray(node['@graph']) ? (node['@graph'] as JsonLdNode[]) : [node]))
  })
}

test('/logo.svg and /logo.png respond 200', async ({ request }) => {
  const svg = await request.get('/logo.svg')
  expect(svg.status()).toBe(200)
  expect(svg.headers()['content-type']).toContain('image/svg+xml')

  const png = await request.get('/logo.png')
  expect(png.status()).toBe(200)
  expect(png.headers()['content-type']).toContain('image/png')
})

test('Organization JSON-LD points its logo at /logo.png', async ({ page, request }) => {
  await page.goto('/es')
  const organization = (await readJsonLd(page)).find((node) => node['@type'] === 'Organization')
  expect(organization).toBeDefined()

  const logo = new URL(String(organization?.logo))
  expect(logo.pathname).toBe('/logo.png')
  expect((await request.get(logo.pathname)).status()).toBe(200)
})
