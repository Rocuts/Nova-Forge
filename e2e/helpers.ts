import { expect, type Locator, type Page } from '@playwright/test'

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

/**
 * Espera a que la página haya hidratado. `SmoothScroll` (layout) lleva la
 * ventana al tope en su efecto de montaje: un `scrollToY` o un clic hechos
 * antes de hidratar se pierden. `.site-header[data-tone]` falta en el HTML del
 * servidor y aparece después de ese efecto (el Header es hijo de SmoothScroll
 * y el tono llega en un callback posterior), así que sirve de señal. Hace
 * falta cuando lo primero que se afirma (p. ej. `data-stage-mode="scrub"`)
 * ya es cierto en el HTML del servidor.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark|menu)$/, { timeout: 15_000 })
}

/**
 * Espera `count` frames del navegador. Sirve para afirmar que un estado NO
 * cambia: deja llegar un callback pendiente (p. ej., de IntersectionObserver)
 * y el render de React que provoca antes de comprobar el atributo.
 */
export async function waitForFrames(page: Page, count = 2): Promise<void> {
  await page.evaluate(
    (frames) =>
      new Promise<void>((resolve) => {
        let left = frames
        const tick = () => {
          left -= 1
          if (left <= 0) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
    count
  )
}
