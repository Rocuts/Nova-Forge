import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import { effectiveOpacity } from './helpers'

/**
 * Títulos visibles y reducir movimiento (diseño §9.3 y §11; plan §3.6).
 *
 * (a) Sin JavaScript, el h1 de cada página de producto y de Live Studio está en
 *     el HTML del servidor, con el texto del diccionario, y se ve: ni
 *     ScrambleText (que lo duplica y oculta la copia visible con
 *     `visibility: hidden` hasta hidratar) ni un contenedor `m.*` cuyo
 *     `initial` lo deja en `opacity: 0`.
 * (b) Las barras del medidor de Live Studio animan `scaleY` (nunca `height`) y
 *     se detienen con reducir movimiento, sin desajuste de hidratación.
 * (c) MotionConfig reducedMotion="user": con reducir movimiento, los
 *     desplazamientos de entrada saltan a su destino en vez de interpolarse.
 */

const studio = es.liveStudio
const STUDIO_ROUTE = '/es/estudio-tiktok-live'

/** Los 7 ProductLanding, DataEnrichmentLanding y la portada de Live Studio. */
const HEADLINES = [
  { route: '/es/soberania-ia', title: es.products.sovereignAI.title },
  { route: '/es/ciberseguridad', title: es.products.cybersecurity.title },
  { route: '/es/fuerza-digital', title: es.products.digitalWorkforce.title },
  { route: '/es/sistemas-criticos', title: es.products.systemsArchitecture.title },
  { route: '/es/inteligencia-operativa', title: es.products.operationalIntelligence.title },
  { route: '/es/automatizacion-gobierno', title: es.products.governmentAutomation.title },
  { route: '/es/extraccion-datos', title: es.products.dataExtraction.title },
  { route: '/es/enriquecimiento-datos', title: es.products.dataEnrichment.title },
  { route: STUDIO_ROUTE, title: `${studio.titleLead} ${studio.titleAccent} ${studio.titleTail}` },
]

/** Transformaciones calculadas de todas las barras, en una sola lectura. */
function barTransforms(bars: Locator): Promise<string> {
  return bars.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transform).join(' | ')
  )
}

/** Escala vertical calculada de un elemento (1 si no tiene transform). */
function scaleYOf(locator: Locator): Promise<number> {
  return locator.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).d)
}

/** Acumula los errores de hidratación que React escriba en la consola. */
function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text())
  })
  return errors
}

test.describe('títulos visibles sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  for (const { route, title } of HEADLINES) {
    test(`h1 de ${route}`, async ({ page }) => {
      await page.goto(route)

      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toHaveCount(1)
      // Texto exacto: ScrambleText lo duplicaba (copia sr-only + copia oculta).
      await expect(h1).toHaveText(title)
      await expect(h1).toBeVisible()
      // toBeVisible() acepta opacity: 0; se multiplica la de todos los ancestros.
      expect(await effectiveOpacity(h1)).toBe(1)
    })
  }
})

test.describe('Live Studio: medidor con reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('las barras saltan a su nivel y se quedan quietas', async ({ page }) => {
    const hydrationErrors = collectHydrationErrors(page)
    await page.goto(STUDIO_ROUTE)

    const bars = page.locator('[data-eq-bar]')
    await expect(bars.first()).toBeAttached()
    const first = bars.first()
    const level = Number(await first.getAttribute('data-eq-level'))
    expect(level).toBeGreaterThan(0)

    // Al hidratar, la barra pasa del reposo del HTML del servidor a su nivel
    // fijo, sin bucle. Esto también confirma que la página ya hidrató.
    await expect.poll(() => scaleYOf(first), { timeout: 15000 }).toBeCloseTo(level, 3)

    // Cada barra, no solo la primera, queda en SU nivel (y no en el reposo).
    const levels = await bars.evaluateAll((elements) =>
      elements.map((element) => ({
        level: Number(element.getAttribute('data-eq-level')),
        scaleY: new DOMMatrixReadOnly(getComputedStyle(element).transform).d,
      }))
    )
    expect(levels.length).toBeGreaterThan(1)
    for (const bar of levels) {
      expect(bar.level).toBeGreaterThan(0)
      expect(bar.scaleY).toBeCloseTo(bar.level, 3)
    }

    // Quietas durante ~600 ms. Aquí sí se espera tiempo: lo que se mide es la
    // AUSENCIA de movimiento, que no tiene un atributo observable.
    const before = await barTransforms(bars)
    await page.waitForTimeout(300)
    expect(await barTransforms(bars)).toBe(before)
    await page.waitForTimeout(300)
    expect(await barTransforms(bars)).toBe(before)

    expect(hydrationErrors).toEqual([])
  })
})

test.describe('Live Studio: medidor sin reducir movimiento (control)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  test('las barras se mueven con scaleY, nunca con height', async ({ page }) => {
    const hydrationErrors = collectHydrationErrors(page)
    await page.goto(STUDIO_ROUTE)

    const bars = page.locator('[data-eq-bar]')
    await expect(bars.first()).toBeAttached()

    // Sin este control, la prueba anterior pasaría con unas barras que no se
    // mueven nunca (o que se mueven con height, que no cambia transform).
    await expect
      .poll(
        async () => {
          const before = await barTransforms(bars)
          await page.waitForTimeout(150)
          return (await barTransforms(bars)) !== before
        },
        { timeout: 15000 }
      )
      .toBe(true)

    // Diseño §11: nada anima height. Todas miden lo mismo en el layout.
    const heights = await bars.evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).offsetHeight)
    )
    expect(new Set(heights).size).toBe(1)

    expect(hydrationErrors).toEqual([])
  })
})

test.describe('MotionConfig: reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('las entradas no interpolan el desplazamiento', async ({ page }) => {
    // Registra en cada frame, desde antes del primer byte, el desplazamiento
    // vertical del subtítulo (el <p> que sigue al h1). Con MotionConfig
    // reducedMotion="user", `y` salta de 20 px a 0 en un solo paso; sin él se
    // interpola durante 0,6 s y aparecen valores intermedios.
    await page.addInitScript(() => {
      const samples: number[] = []
      Object.assign(window, { __subtitleY: samples })
      const tick = () => {
        const subtitle = document.querySelector('main h1 + p')
        if (subtitle) samples.push(new DOMMatrixReadOnly(getComputedStyle(subtitle).transform).m42)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await page.goto('/es/soberania-ia')

    const subtitle = page.locator('main h1 + p')
    await expect(subtitle).toHaveText(es.products.sovereignAI.subtitle)
    // La opacidad sí se anima: cuando llega a 1, la entrada terminó.
    await expect.poll(() => effectiveOpacity(subtitle), { timeout: 15000 }).toBe(1)

    const samples = await page.evaluate(
      () => (window as unknown as { __subtitleY?: number[] }).__subtitleY ?? []
    )
    expect(samples.length).toBeGreaterThan(0)
    const intermediate = samples.filter((y) => Math.abs(y) > 0.01 && Math.abs(y - 20) > 0.01)
    expect(intermediate, 'desplazamientos intermedios con reducir movimiento').toEqual([])
  })
})

test.describe('Indicador de avance del scroll', () => {
  test.use({ viewport: { width: 1280, height: 800 }, contextOptions: { reducedMotion: 'no-preference' } })

  test('avanza con scaleY, nunca con height', async ({ page }) => {
    await page.goto('/es/nosotros')
    const fill = page.locator('[data-scroll-progress-fill]')
    await expect(fill).toBeAttached({ timeout: 15000 })

    const expected = await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const top = Math.round(max / 2)
      window.scrollTo({ top, behavior: 'instant' })
      return max > 0 ? top / max : 0
    })
    expect(expected).toBeGreaterThan(0)

    await expect.poll(() => scaleYOf(fill)).toBeCloseTo(expected, 2)
    // Diseño §11: el relleno mide siempre la pista entera; solo cambia su escala.
    const heights = await fill.evaluate((element) => ({
      fill: (element as HTMLElement).offsetHeight,
      track: (element.parentElement as HTMLElement).offsetHeight,
    }))
    expect(heights.fill).toBe(heights.track)
  })
})

test.describe('Indicador de avance del scroll con reducir movimiento', () => {
  test.use({ viewport: { width: 1280, height: 800 }, contextOptions: { reducedMotion: 'reduce' } })

  test('no se muestra', async ({ page }) => {
    await page.goto('/es/nosotros')
    // El indicador se monta tras hidratar (ver la prueba anterior): se espera a
    // que la red quede quieta para no darlo por ausente antes de tiempo.
    await expect(page.locator('main')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-scroll-progress-fill]')).toHaveCount(0)
  })
})
