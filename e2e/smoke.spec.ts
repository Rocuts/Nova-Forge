import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'

const heroContent = es.hero
const navItems = es.nav.items

test('homepage loads and renders all sections', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/NovaForge/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(heroContent.titleLead)
  await expect(page.locator('#servicios')).toBeAttached()
  await expect(page.locator('#metodologia')).toBeAttached()
  await expect(page.locator('#faq')).toBeAttached()
})

test('navigation links exist and work on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await expect(page.getByRole('link', { name: navItems[0].name })).toBeVisible()
  await expect(page.getByRole('link', { name: navItems[1].name })).toBeVisible()
  await expect(page.getByRole('link', { name: navItems[3].name })).toBeVisible()
})

test('mobile hamburger menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  // Desktop nav should not be visible at mobile width
  const desktopNav = page.locator('nav.hidden.md\\:flex')
  await expect(desktopNav).not.toBeVisible()

  // Hamburger button should be visible
  const hamburger = page.getByRole('button', { name: /navegación|Menú/i })
  await expect(hamburger).toBeVisible()

  // Click hamburger and expect mobile menu links to appear
  await hamburger.click()
  await expect(page.getByRole('link', { name: navItems[0].name })).toBeVisible()
  await expect(page.getByRole('link', { name: navItems[1].name })).toBeVisible()
  await expect(page.getByRole('link', { name: navItems[3].name })).toBeVisible()
})

test('CTA buttons have real destinations', async ({ page }) => {
  await page.goto('/')

  // Check scheduling CTAs link to cal.com
  const schedulingLinks = page.getByRole('link', { name: /Agendar|diagnóstico/i })
  const count = await schedulingLinks.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(schedulingLinks.nth(i)).toHaveAttribute('href', /cal\.com/)
  }

  const servicesLink = page.getByRole('link', { name: heroContent.secondaryAction.label })
  await expect(servicesLink).toHaveAttribute('href', heroContent.secondaryAction.href)
})
