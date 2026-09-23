import type { Locator, Page } from '@playwright/test'

/**
 * Utilidades compartidas de las pruebas e2e (plan §3.7). Las crea la tarea 4;
 * las tareas siguientes las amplían aquí, nunca las duplican.
 */

/**
 * Opacidad efectiva: el producto de la opacidad calculada del elemento y de
 * todos sus ancestros.
 *
 * `toBeVisible()` da por visible un elemento con `opacity: 0`, o dentro de un
 * contenedor con `opacity: 0`, así que no basta para afirmar que un título se
 * ve de verdad. Funciona también con `javaScriptEnabled: false`: la evaluación
 * de Playwright no depende de los scripts de la página.
 */
export async function effectiveOpacity(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    let opacity = 1
    for (let node: Element | null = element; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity)
    }
    return opacity
  })
}

/**
 * Lleva la ventana a `y` sin animación y espera dos frames, para que los
 * observadores de scroll y de intersección hayan reaccionado.
 *
 * `behavior: 'instant'` es obligatorio: `globals.css` declara
 * `html { scroll-behavior: smooth }`, y un `scrollTo` normal ANIMA el
 * desplazamiento.
 */
export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate(async (top) => {
    window.scrollTo({ top, behavior: 'instant' })
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  }, y)
}
