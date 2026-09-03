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
  '/es/realty',
  '/en/realty',
  '/es/diagnostico',
  '/es/agendar',
  '/es/nosotros',
  '/es/inversores',
]

const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

for (const route of ROUTES) {
  test(`no serious/critical a11y violations on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })

    // Las secciones entran con `whileInView`: mientras no se hayan revelado
    // siguen en `opacity: 0` y axe no las evalua. Sin este scroll el gate solo
    // audita el primer viewport, que es como se colaron fallos de contraste
    // por debajo del pliegue. Bajamos en pasos de una pantalla para disparar
    // cada IntersectionObserver, y volvemos arriba antes de escanear.
    //
    // `behavior: 'instant'` es obligatorio: globals.css declara
    // `html { scroll-behavior: smooth }`, asi que un `window.scrollTo(x, y)`
    // ANIMA, el bucle encadena animaciones y en una pagina larga nunca llega al
    // pie — axe no veria las ultimas secciones. Se comprueba con `scrollY` al
    // final para que un fallo de scroll rompa el test en vez de silenciarlo.
    const reachedBottom = await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8)
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
      await new Promise((resolve) => setTimeout(resolve, 300))
      const max = document.documentElement.scrollHeight - window.innerHeight
      const bottom = Math.round(window.scrollY) >= max - 2
      window.scrollTo({ top: 0, behavior: 'instant' })
      return bottom
    })
    expect(reachedBottom, 'el scroll no llego al pie: axe auditaria una pagina parcial').toBe(true)

    // Las secciones entran con animaciones (motion/RevealText). Un margen
    // extra tras el scroll deja que los reveals terminen y que el DOM
    // alcance su estado estable antes de escanear.
    await page.waitForTimeout(1500)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // WCAG 1.4.3 exceptua los logotipos del minimo de contraste. El unico
      // nodo marcado asi es el wordmark de marca del TrustBar, atenuado para
      // igualar los logos <img> vecinos. Es una exencion nominal y auditable,
      // no un relajamiento del gate.
      .exclude('[data-brand-wordmark]')
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
