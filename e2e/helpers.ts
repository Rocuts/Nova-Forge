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

/** El azul de Orbexs (#2563eb) tal como lo devuelve getComputedStyle. */
export const ORBEXS_BLUE = 'rgb(37, 99, 235)'

/**
 * Regla del azul (plan §3.1): cuenta los elementos que se ven en el viewport y
 * pintan #2563eb (con cualquier alfa > 0) en color, fill, stroke, fondo o
 * borde. Un elemento cuenta si su caja toca el viewport, no está oculto y su
 * opacidad efectiva (producto con la de sus ancestros) es mayor que 0. Una
 * propiedad solo cuenta en el elemento que la declara, no en los descendientes
 * que la heredan: un <g fill> con tres círculos es un elemento azul, no cuatro.
 */
export async function countVisibleBlue(page: Page): Promise<number> {
  return page.evaluate((blue) => {
    const properties = [
      'color',
      'fill',
      'stroke',
      'background-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
    ]
    // Mismo color con cualquier alfa > 0: se compara el rgb(...) sin el alfa.
    const isBlue = (value: string) => {
      const match = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(value)
      return match !== null && `rgb(${match[1]}, ${match[2]}, ${match[3]})` === blue && Number(match[4] ?? 1) > 0
    }
    const opacityOf = (element: Element) => {
      let opacity = 1
      for (let node: Element | null = element; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity)
      }
      return opacity
    }

    let count = 0
    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      const style = getComputedStyle(element)
      const parentStyle = element.parentElement ? getComputedStyle(element.parentElement) : null
      const paintsBlue = properties.some((property) => {
        const value = style.getPropertyValue(property)
        return isBlue(value) && parentStyle?.getPropertyValue(property) !== value
      })
      if (!paintsBlue) continue
      if (style.display === 'none' || style.visibility !== 'visible') continue
      const box = element.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) continue
      if (box.right <= 0 || box.bottom <= 0 || box.left >= window.innerWidth || box.top >= window.innerHeight) continue
      if (opacityOf(element) <= 0) continue
      count++
    }
    return count
  }, ORBEXS_BLUE)
}

// ── T8 ──────────────────────────────────────────────────────────────────────

/**
 * |top| del elemento respecto al borde superior del viewport, medido solo cuando
 * el scroll lleva dos frames quieto; mientras se mueve devuelve Infinity.
 * Pensado para `expect.poll` tras un scroll suave (globals.css tiene
 * `scroll-behavior: smooth`, así que un clic en un ancla anima el scroll).
 */
export async function settledTopOffset(locator: Locator): Promise<number> {
  return locator.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const startY = window.scrollY
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const moving = window.scrollY !== startY
            resolve(moving ? Number.POSITIVE_INFINITY : Math.abs(element.getBoundingClientRect().top))
          })
        })
      })
  )
}
