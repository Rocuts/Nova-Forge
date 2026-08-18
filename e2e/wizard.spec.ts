import { test, expect, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'

const wizard = es.diagnostic
const options = es.diagnosticOptions

// API budget: /api/diagnostic rate-limits at 10 req/min per IP and counts every
// request (even invalid ones). api.spec.ts spends 3; this file spends exactly 2
// (one submit per report test, the validation test never submits) → 5 per full
// suite run, leaving half the budget as headroom.

// Values chosen once so the report assertions can check they are echoed back.
const chosen = {
  industry: options.industries[0],
  teamSize: options.teamSizes[1],
  stack: options.techStack[4],
  painPoint: options.painPoints[0],
  goal: options.goals[1],
  budget: options.budgetRanges[0],
  contactName: 'María QA',
  contactEmail: 'qa@empresa.com',
}

function nextButton(page: Page) {
  return page.getByRole('button', { name: wizard.next })
}

function radio(page: Page, groupLabel: string, option: string) {
  return page.getByRole('radiogroup', { name: groupLabel }).getByRole('radio', { name: option })
}

function chip(page: Page, groupLabel: string, option: string) {
  return page.getByRole('group', { name: groupLabel }).getByRole('button', { name: option })
}

/** Fills all five steps and stops on the contact step without submitting. */
async function fillWizard(page: Page, { companyName = '', notes = '' } = {}) {
  await page.goto('/es/diagnostico')

  // Step 1 — company profile
  await expect(page.getByRole('heading', { name: wizard.stepCompany.title })).toBeVisible()
  if (companyName) {
    await page.getByLabel(wizard.stepCompany.companyLabel).fill(companyName)
  }
  await radio(page, wizard.stepCompany.industryLabel, chosen.industry).click()
  await radio(page, wizard.stepCompany.teamSizeLabel, chosen.teamSize).click()
  await nextButton(page).click()

  // Step 2 — tech stack
  await expect(page.getByRole('heading', { name: wizard.stepStack.title })).toBeVisible()
  await chip(page, wizard.stepStack.stackLabel, chosen.stack).click()
  await nextButton(page).click()

  // Step 3 — pain points (group is labeled with the step title)
  await expect(page.getByRole('heading', { name: wizard.stepPainPoints.title })).toBeVisible()
  await chip(page, wizard.stepPainPoints.title, chosen.painPoint).click()
  await nextButton(page).click()

  // Step 4 — goals + budget
  await expect(page.getByRole('heading', { name: wizard.stepGoals.title })).toBeVisible()
  await chip(page, wizard.stepGoals.title, chosen.goal).click()
  await radio(page, wizard.stepGoals.budgetLabel, chosen.budget).click()
  await nextButton(page).click()

  // Step 5 — contact
  await expect(page.getByRole('heading', { name: wizard.stepContact.title })).toBeVisible()
  await page.getByLabel(wizard.stepContact.nameLabel).fill(chosen.contactName)
  await page.getByLabel(wizard.stepContact.emailLabel).fill(chosen.contactEmail)
  if (notes) {
    await page.getByLabel(wizard.stepContact.notesLabel).fill(notes)
  }
}

/** Submits the wizard and waits for the generated report to render. */
async function submitAndGetReport(page: Page) {
  await page.getByRole('button', { name: wizard.submit }).click()
  // The prose container wraps the dangerouslySetInnerHTML report output; it is
  // the only stable hook around the injected markup.
  const report = page.locator('.prose')
  await expect(report.getByRole('heading', { name: 'Resumen Ejecutivo' })).toBeVisible({ timeout: 30_000 })
  return report
}

test('wizard happy path: five steps end in a personalized report', async ({ page }) => {
  const companyName = 'Acme Corp SAS'
  await fillWizard(page, { companyName })
  const report = await submitAndGetReport(page)

  // The report title greets the contact by name
  await expect(
    page.getByRole('heading', { name: es.diagnosticReport.titleTemplate.replace('{name}', chosen.contactName) })
  ).toBeVisible()

  // The chosen answers are echoed back in the report body
  await expect(report.getByText(companyName).first()).toBeVisible()
  await expect(report.getByText(chosen.industry).first()).toBeVisible()
  await expect(report.getByText(chosen.stack).first()).toBeVisible()
  await expect(report.getByText(chosen.painPoint).first()).toBeVisible()
  await expect(report.getByText(chosen.goal).first()).toBeVisible()
})

test('XSS regression: user-provided markup is escaped, never executed', async ({ page }) => {
  const payload = `<img src=x onerror="document.title='pwned'">`

  await fillWizard(page, { companyName: payload, notes: payload })
  const titleBefore = await page.title()
  const report = await submitAndGetReport(page)

  // (b) no element was injected — neither inside the report nor anywhere else
  await expect(report.locator('img')).toHaveCount(0)
  await expect(page.locator('img[src="x"]')).toHaveCount(0)

  // (d) the payload survives as escaped, visible text (companyName is
  // interpolated into the fallback report's executive summary)
  await expect(report.getByText(payload).first()).toBeVisible()

  // (c) the onerror handler never ran
  await expect(page).toHaveTitle(titleBefore)
  expect(titleBefore).not.toBe('pwned')
})

test('step validation blocks advancing until required answers are given', async ({ page }) => {
  await page.goto('/es/diagnostico')
  await expect(page.getByRole('heading', { name: wizard.stepCompany.title })).toBeVisible()

  // The wizard disables navigation via pointer-events, not the disabled attribute
  const next = nextButton(page)
  await expect(next).toHaveCSS('pointer-events', 'none')

  // Company name alone is not enough — industry and team size are required
  await page.getByLabel(wizard.stepCompany.companyLabel).fill('Empresa Incompleta')
  await radio(page, wizard.stepCompany.industryLabel, chosen.industry).click()
  await expect(next).toHaveCSS('pointer-events', 'none')

  await radio(page, wizard.stepCompany.teamSizeLabel, chosen.teamSize).click()
  await expect(next).toHaveCSS('pointer-events', 'auto')
  await next.click()

  // Step 2 requires at least one stack selection before advancing again
  await expect(page.getByRole('heading', { name: wizard.stepStack.title })).toBeVisible()
  await expect(next).toHaveCSS('pointer-events', 'none')
  await chip(page, wizard.stepStack.stackLabel, chosen.stack).click()
  await expect(next).toHaveCSS('pointer-events', 'auto')

  // Going back is always allowed and preserves the earlier answers
  await page.getByRole('button', { name: wizard.prev }).click()
  await expect(page.getByRole('heading', { name: wizard.stepCompany.title })).toBeVisible()
  await expect(page.getByLabel(wizard.stepCompany.companyLabel)).toHaveValue('Empresa Incompleta')
  await expect(radio(page, wizard.stepCompany.industryLabel, chosen.industry)).toHaveAttribute('aria-checked', 'true')
})
