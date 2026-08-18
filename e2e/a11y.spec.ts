import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Gate de accesibilidad automatizado (WCAG 2.0/2.1 A + AA).
 *
 * Escanea las rutas públicas clave y FALLA si axe-core reporta cualquier
 * violación de impacto `serious` o `critical`. Las violaciones `moderate`
 * y `minor` no bloquean el gate, pero se imprimen en consola para que
 * queden visibles en el reporte de CI.
 */

const ROUTES = [
  '/es',
  '/es/estudio-tiktok-live',
  '/es/diagnostico',
  '/es/agendar',
  '/es/nosotros',
  '/es/inversores',
]

const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

for (const route of ROUTES) {
  test(`no serious/critical a11y violations on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })
    // Las secciones entran con animaciones (motion/RevealText). Un margen
    // extra tras networkidle deja que los reveals terminen y que el DOM
    // alcance su estado estable antes de escanear.
    await page.waitForTimeout(1500)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(
      (v) => v.impact && BLOCKING_IMPACTS.has(v.impact)
    )
    const advisory = results.violations.filter(
      (v) => !v.impact || !BLOCKING_IMPACTS.has(v.impact)
    )

    // No bloquean el gate, pero deben quedar visibles en el log de CI.
    if (advisory.length > 0) {
      console.log(
        `[a11y advisory] ${route}:`,
        advisory.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`).join(', ')
      )
    }

    expect(
      blocking.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 10),
      }))
    ).toEqual([])
  })
}
