import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { waitForHydration } from './helpers'

const hero = es.hero
const nav = es.nav

test('homepage loads and renders all sections', async ({ page }) => {
  await page.goto('/es')
  await expect(page).toHaveTitle(/Orbexs/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(hero.title)
  await expect(page.locator(`#${es.services.sectionId}`)).toBeAttached()
  await expect(page.locator(`#${es.caseStudy.sectionId}`)).toBeAttached()
  await expect(page.locator(`#${es.methodology.sectionId}`)).toBeAttached()
  await expect(page.locator(`#${es.techStack.sectionId}`)).toBeAttached()
  await expect(page.locator(`#${es.faq.sectionId}`)).toBeAttached()
})

test('root redirects to default locale', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/es$/)
})

test('navigation works on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/es')

  // "Servicios" and "Productos" open the mega menu; "Empresa" is a direct link
  const servicesTrigger = page.getByRole('navigation').getByRole('button', { name: nav.items[0].name, exact: true })
  await expect(servicesTrigger).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('button', { name: nav.items[1].name, exact: true })).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link', { name: nav.items[2].name })).toHaveAttribute('href', '/es/nosotros')

  // Opening the mega menu reveals platform links
  await servicesTrigger.click()
  const firstPlatformLink = nav.platformLinks[0]
  await expect(page.locator('#site-mega-menu').getByRole('link', { name: new RegExp(firstPlatformLink.name) })).toBeVisible()
})

test('mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/es')
  // The click must reach a hydrated header: nothing else opens the panel
  await waitForHydration(page)

  // Desktop nav should not be visible at mobile width
  const desktopNav = page.locator('nav.hidden.md\\:flex')
  await expect(desktopNav).not.toBeVisible()

  // Hamburger button opens the full menu
  const hamburger = page.getByRole('button', { name: nav.menuLabel })
  await expect(hamburger).toBeVisible()
  await hamburger.click()

  await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  // Scoped to the panel: the same link name also exists in <main> and the footer
  const firstPlatformLink = nav.platformLinks[0]
  await expect(page.locator('#site-mega-menu').getByRole('link', { name: new RegExp(firstPlatformLink.name) })).toBeVisible()
})

test('CTA buttons have real destinations', async ({ page }) => {
  await page.goto('/es')

  // Header scheduling CTA → internal scheduling page
  const headerSchedule = page.getByRole('link', { name: nav.schedule, exact: true }).first()
  await expect(headerSchedule).toHaveAttribute('href', '/es/agendar')

  // Hero primary CTA → diagnostic flow
  await expect(page.getByRole('link', { name: hero.primaryAction.label })).toHaveAttribute('href', '/es/diagnostico')

  // Hero secondary CTA → capabilities anchor
  await expect(page.getByRole('link', { name: hero.secondaryAction.label })).toHaveAttribute('href', hero.secondaryAction.href)
})

test('live studio page renders and routes in both locales', async ({ page }) => {
  await page.goto('/es/estudio-tiktok-live')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(es.liveStudio.titleAccent)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es\/estudio-tiktok-live$/)

  // Creator CTA opens the WhatsApp application flow with a prefilled message
  const apply = page.getByRole('link', { name: es.liveStudio.primaryAction.label }).first()
  await expect(apply).toHaveAttribute('href', /wa\.me\/.*\?text=/)

  // FAQPage schema is generated from the studio dictionary
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = jsonLd.flatMap((s) => {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed.map((e) => e['@type']) : [parsed['@type']]
  })
  expect(types).toContain('FAQPage')
  expect(types).toContain('Service')

  // English slug is served through the rewrite
  await page.goto('/en/tiktok-live-studio')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/tiktok-live-studio$/)
})

test('realty page renders and routes in both locales', async ({ page }) => {
  await page.goto('/es/realty')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(es.realty.hero.title)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es\/realty$/)

  // Hero CTA books a demo through the internal scheduling page
  const demo = page.getByRole('link', { name: es.realty.hero.primaryAction.label }).first()
  await expect(demo).toHaveAttribute('href', '/es/agendar')

  // Service + FAQPage + BreadcrumbList schemas, FAQ generated from the dictionary
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = jsonLd.flatMap((s) => {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed.map((e) => e['@type']) : [parsed['@type']]
  })
  expect(types).toContain('Service')
  expect(types).toContain('FAQPage')
  expect(types).toContain('BreadcrumbList')

  // Same slug in both locales — no rewrite involved
  await page.goto('/en/realty')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/realty$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(en.realty.hero.title)
})

test('home page links to the live studio division', async ({ page }) => {
  await page.goto('/es')

  // The nav reaches the studio through the mega menu's Products block
  await page.getByRole('navigation').getByRole('button', { name: nav.items[1].name, exact: true }).click()
  const studio = nav.productLinks.find((link) => link.href === '/estudio-tiktok-live')!
  await expect(page.locator('#site-mega-menu').getByRole('link', { name: studio.name })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
  await page.keyboard.press('Escape')

  await expect(page.getByRole('link', { name: es.liveStudioTeaser.action.label })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
})

test('llms.txt lists the platform, solutions and products from the nav', async ({ request }) => {
  const body = await (await request.get('/llms.txt')).text()
  expect(body).toContain('## Productos (Español)')
  expect(body).toContain('## Products (English)')
  for (const link of [...nav.platformLinks, ...nav.solutionsLinks, ...nav.productLinks]) {
    expect(body).toContain(`- [${link.name}](`)
  }
})

test('SEO essentials are present', async ({ page }) => {
  await page.goto('/es')

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es$/)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/)

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = jsonLd.map((s) => JSON.parse(s)['@type'])
  expect(types).toContain('Organization')
  expect(types).toContain('FAQPage')
})
