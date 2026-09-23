import { test, expect, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { siteConfig } from '../src/config/site'
import { buildLocalePath, locales } from '../src/lib/i18n'
import { PAGE_PATHS, getPageMeta, type InternalPath, type PageMeta } from '../src/lib/page-meta'
import type { Dictionary } from '../src/content/dictionaries'

const dictionaries = { es, en } as const

/**
 * Independent oracle for getPageMeta(): the dictionary entry behind each route
 * whose title, description and eyebrow are plain fields. The Open Graph matrix
 * reads getPageMeta() itself, so it would stay green if two routes were swapped
 * there (say /privacidad and /terminos); this list would not.
 */
const DICTIONARY_ENTRIES: readonly [InternalPath, (dict: Dictionary) => Pick<PageMeta, 'title' | 'description' | 'eyebrow'>][] = [
  ['/agendar', (d) => ({ title: d.schedule.pageTitle, description: d.schedule.pageSubtitle, eyebrow: d.schedule.badge })],
  [
    '/diagnostico',
    (d) => ({ title: d.diagnosticPage.pageTitle, description: d.diagnosticPage.pageSubtitle, eyebrow: d.diagnosticPage.badge }),
  ],
  ['/privacidad', (d) => ({ title: d.privacy.title, description: d.privacy.description, eyebrow: d.legalPage.badge })],
  ['/terminos', (d) => ({ title: d.terms.title, description: d.terms.description, eyebrow: d.legalPage.badge })],
  ['/soberania-ia', (d) => d.products.sovereignAI],
  ['/ciberseguridad', (d) => d.products.cybersecurity],
  ['/fuerza-digital', (d) => d.products.digitalWorkforce],
  ['/sistemas-criticos', (d) => d.products.systemsArchitecture],
  ['/inteligencia-operativa', (d) => d.products.operationalIntelligence],
  ['/automatizacion-gobierno', (d) => d.products.governmentAutomation],
  ['/enriquecimiento-datos', (d) => d.products.dataEnrichment],
  ['/extraccion-datos', (d) => d.products.dataExtraction],
  [
    '/inversores',
    (d) => ({ title: d.investorsPage.title, description: d.investorsPage.subtitle, eyebrow: d.investorsPage.eyebrow }),
  ],
  ['/nosotros', (d) => ({ title: d.aboutPage.title, description: d.aboutPage.subtitle, eyebrow: d.aboutPage.eyebrow })],
]

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

test('each locale gives every route a distinct title and social-card title', () => {
  for (const locale of locales) {
    const metas = PAGE_PATHS.map((path) => getPageMeta(dictionaries[locale], path))
    expect(new Set(metas.map((meta) => meta.title)).size).toBe(PAGE_PATHS.length)
    expect(new Set(metas.map((meta) => meta.cardTitle)).size).toBe(PAGE_PATHS.length)
  }
})

test('getPageMeta reads each plain route from its own dictionary entry', () => {
  for (const locale of locales) {
    const dict = dictionaries[locale]
    for (const [path, read] of DICTIONARY_ENTRIES) {
      const { title, description, eyebrow } = getPageMeta(dict, path)
      const expected = read(dict)
      expect({ title, description, eyebrow }, `${locale} ${path}`).toEqual({
        title: expected.title,
        description: expected.description,
        eyebrow: expected.eyebrow,
      })
    }
  }
})

for (const locale of locales) {
  test(`RealTy (${locale}) leads its meta description and social card with the demo qualifier`, () => {
    const realty = dictionaries[locale].realty
    // The qualifier is the last segment of statusLine (realtyQualifier). cta.note states the same
    // scope in a sentence, so a reordered statusLine, with the slogan last, fails here.
    const qualifier = realty.statusLine.split('·').at(-1)!.trim().toLowerCase()
    expect(qualifier).not.toBe('')
    expect(realty.cta.note.toLowerCase()).toContain(qualifier)

    // The Open Graph matrix checks that the page emits this description as-is.
    const meta = getPageMeta(dictionaries[locale], '/realty')
    expect(meta.description.toLowerCase().startsWith(`${qualifier}.`)).toBe(true)
    expect(meta.eyebrow.toLowerCase()).toContain(qualifier)
  })

  test(`Live Studio (${locale}) social card carries the agency-application status`, () => {
    const dict = dictionaries[locale]
    expect(getPageMeta(dict, '/estudio-tiktok-live').eyebrow).toContain(dict.liveStudio.status)
  })
}

test('sitemap lists exactly PAGE_PATHS in both locales', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  const expected = locales.flatMap((locale) => PAGE_PATHS.map((path) => buildLocalePath(locale, path)))
  expect(listed.sort()).toEqual(expected.sort())
})

test.describe('Open Graph per route and locale', () => {
  // 34 pages plus their images, each compiled on first request by the dev server.
  test.describe.configure({ mode: 'parallel', timeout: 90_000 })

  for (const locale of locales) {
    for (const path of PAGE_PATHS) {
      const url = buildLocalePath(locale, path)

      test(`${url} has its own title, description, og:url and social image`, async ({ page, request }) => {
        await page.goto(url)

        // og:title: the page's own title (the layout used to stamp "Orbexs" on every page)
        const meta = getPageMeta(dictionaries[locale], path)
        const expectedTitle = meta.absoluteTitle ? meta.title : `${meta.title} | ${siteConfig.name}`
        await expect(page).toHaveTitle(expectedTitle)
        const ogTitle = page.locator('meta[property="og:title"]')
        await expect(ogTitle).toHaveCount(1)
        await expect(ogTitle).toHaveAttribute('content', expectedTitle)

        // og:url: absolute and equal to this page's canonical (it used to be the home for everyone)
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
        expect(canonical).toMatch(/^https?:\/\//)
        expect(new URL(canonical!).pathname).toBe(url)
        const ogUrl = page.locator('meta[property="og:url"]')
        await expect(ogUrl).toHaveCount(1)
        await expect(ogUrl).toHaveAttribute('content', canonical!)
        await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
          'content',
          dictionaries[locale].meta.ogLocale,
        )

        // description: the page's own, in the document and in both social cards
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', meta.description)
        await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', meta.description)
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
        await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', expectedTitle)
        await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', meta.description)

        // og:image: this route's own opengraph-image.tsx (internal Spanish segment under the locale)
        const ogImage = page.locator('meta[property="og:image"]')
        await expect(ogImage).toHaveCount(1)
        const ogImageContent = (await ogImage.getAttribute('content'))!
        const imageUrl = new URL(ogImageContent)
        expect(imageUrl.pathname).toBe(`/${locale}${path === '/' ? '' : path}/opengraph-image`)
        const image = await request.get(imageUrl.pathname + imageUrl.search)
        expect(image.status()).toBe(200)
        expect(image.headers()['content-type']).toBe('image/png')

        // twitter:image: the same card, copied by Next (pageMetadata() sets no twitter.images)
        const twitterImage = page.locator('meta[name="twitter:image"]')
        await expect(twitterImage).toHaveCount(1)
        await expect(twitterImage).toHaveAttribute('content', ogImageContent)
      })
    }
  }
})

for (const locale of locales) {
  test(`home FAQPage JSON-LD (${locale}) has exactly dict.faq.items.length questions`, async ({ page }) => {
    await page.goto(buildLocalePath(locale, '/'))
    const faqPages = (await readJsonLd(page)).filter((node) => node['@type'] === 'FAQPage')
    expect(faqPages).toHaveLength(1)

    const items = dictionaries[locale].faq.items
    const questions = faqPages[0].mainEntity as { name: string }[]
    expect(questions).toHaveLength(items.length)
    expect(questions.map((question) => question.name)).toEqual(items.map((item) => item.question))
  })
}
