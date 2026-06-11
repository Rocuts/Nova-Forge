import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'

const hero = es.hero
const nav = es.nav

test('homepage loads and renders all sections', async ({ page }) => {
  await page.goto('/es')
  await expect(page).toHaveTitle(/Orbexs/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(hero.titleLead)
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

  // First nav item has children → rendered as a mega-menu trigger button
  const servicesTrigger = page.getByRole('navigation').getByRole('button', { name: nav.items[0].name })
  await expect(servicesTrigger).toBeVisible()

  // Second nav item is a direct link
  await expect(page.getByRole('navigation').getByRole('link', { name: nav.items[1].name })).toBeVisible()

  // Opening the mega menu reveals platform links
  await servicesTrigger.click()
  const firstPlatformLink = nav.items[0].platformChildren![0]
  await expect(page.getByRole('link', { name: new RegExp(firstPlatformLink.name) }).first()).toBeVisible()
})

test('mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/es')

  // Desktop nav should not be visible at mobile width
  const desktopNav = page.locator('nav.hidden.md\\:flex')
  await expect(desktopNav).not.toBeVisible()

  // Hamburger button opens the full menu
  const hamburger = page.getByRole('button', { name: nav.menuLabel })
  await expect(hamburger).toBeVisible()
  await hamburger.click()

  const firstPlatformLink = nav.items[0].platformChildren![0]
  await expect(page.getByRole('link', { name: new RegExp(firstPlatformLink.name) }).first()).toBeVisible()
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

test('SEO essentials are present', async ({ page }) => {
  await page.goto('/es')

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es$/)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/)

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = jsonLd.map((s) => JSON.parse(s)['@type'])
  expect(types).toContain('Organization')
  expect(types).toContain('FAQPage')
})
