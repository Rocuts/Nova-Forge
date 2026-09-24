import { test, expect, type Locator, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { buildLocalePath } from '../src/lib/i18n'
import {
  DOSSIER_FIELD_COUNT,
  DOSSIER_STEP_MS,
  extractionAt,
  extractionAtStep,
  extractionComplete,
  fieldState,
  type FieldState,
} from '../src/components/sections/home/dossier-progress'
import { countVisibleBlue, effectiveOpacity, ORBEXS_BLUE, scrollToY, settledTopOffset, waitForHydration } from './helpers'

/**
 * Home "Cartografía soberana". Un `describe` por sección; T6 crea la portada y
 * las tareas 7–10 agregan sus bloques al final, con sus propios helpers locales.
 */

// ── Helpers de la portada ───────────────────────────────────────────────

const HERO = '#inicio'

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type Viewport = { width: number; height: number }
type Box = { x: number; y: number; width: number; height: number }

function expectInside(box: Box | null, viewport: Viewport, what: string, top = 0) {
  expect(box, `${what}: sin caja (¿oculto?)`).not.toBeNull()
  const { x, y, width, height } = box!
  expect(x, `${what}: se sale por la izquierda`).toBeGreaterThanOrEqual(0)
  expect(y, `${what}: queda por encima de ${top}px`).toBeGreaterThanOrEqual(top)
  expect(x + width, `${what}: se sale por la derecha`).toBeLessThanOrEqual(viewport.width)
  expect(y + height, `${what}: se sale por abajo`).toBeLessThanOrEqual(viewport.height)
}

/** Posición de scroll para un avance `p` (0–1) del escenario ["start start", "end end"]. */
async function stageScrollY(page: Page, p: number) {
  return page.locator(HERO).evaluate((stage, progress) => {
    const box = stage.getBoundingClientRect()
    const top = box.top + window.scrollY
    return Math.round(top + (box.height - window.innerHeight) * progress)
  }, p)
}

/**
 * ¿Pinta la ruta algún píxel dentro de `clip`? Compara dos capturas del mismo
 * recorte, con la ruta y sin ella (visibility: hidden en el <svg>): con el
 * resto de la escena quieta, cualquier diferencia es la ruta, también a través
 * de máscaras y velos. Sirve para afirmar que se ve y que no se ve.
 */
async function routePaints(page: Page, clip: Box) {
  const area = {
    x: Math.floor(clip.x),
    y: Math.floor(clip.y),
    width: Math.ceil(clip.width),
    height: Math.ceil(clip.height),
  }
  const route = page.locator(`${HERO} [data-hero-route]`)
  // El indicador de next dev (abajo a la izquierda) no es de la página y puede
  // animarse entre las dos capturas: fuera.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  const withRoute = await page.screenshot({ clip: area })
  await route.evaluate((svg: SVGElement) => (svg.style.visibility = 'hidden'))
  const withoutRoute = await page.screenshot({ clip: area })
  await route.evaluate((svg: SVGElement) => (svg.style.visibility = ''))
  return !withRoute.equals(withoutRoute)
}

/** Cajas del texto de la fila de índice y de la capa de instrumento (las dos filas del pie). */
async function footerTextBoxes(page: Page) {
  const stage = page.locator(HERO)
  const index = stage.getByRole('list')
  const items = await index.getByRole('listitem').all()
  const labels = [stage.getByText(es.hero.imageLabel, { exact: true }), stage.getByText(es.hero.scrollHint, { exact: true })]
  const boxes: { what: string; box: Box }[] = []
  for (const [i, item] of items.entries()) boxes.push({ what: `índice /0${i + 1}`, box: (await item.boundingBox())! })
  for (const label of labels) boxes.push({ what: (await label.textContent())!, box: (await label.boundingBox())! })
  return boxes
}

async function expectNoRouteOverFooter(page: Page, when: string) {
  for (const { what, box } of await footerTextBoxes(page)) {
    expect(await routePaints(page, box), `la ruta cruza «${what}» (${when})`).toBe(false)
  }
}

async function lineCount(locator: Locator) {
  return locator.evaluate((element) => {
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
    return Math.round(element.getBoundingClientRect().height / lineHeight)
  })
}

// ── Portada (T6) ────────────────────────────────────────────────────────

test.describe('portada · HTML del servidor', () => {
  test('el h1 llega en el HTML del servidor', async ({ request }) => {
    const response = await request.get('/es')
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toMatch(new RegExp(`<h1[^>]*>${escapeRegExp(es.hero.title)}</h1>`))
    expect(html).toContain('data-header-start="dark"')

    // LCP: la imagen de la portada va en el HTML y se pide ya, con prioridad alta.
    const heroImage = html.match(/<img[^>]*>/g)?.find((tag) => /fetchpriority="high"/i.test(tag))
    expect(heroImage, 'la imagen de la portada se pide con prioridad alta').toBeDefined()
    expect(heroImage).toContain('loading="eager"')
  })

  test('la portada pesa ≤ 250 KB en AVIF a 1920 px (diseño §7)', async ({ request }) => {
    const html = await (await request.get('/es')).text()
    const tag = html.match(/<img[^>]*fetchpriority="high"[^>]*>/i)![0]
    const srcset = tag.match(/srcset="([^"]+)"/i)![1].replace(/&amp;/g, '&')
    const candidate = srcset
      .split(',')
      .map((entry) => entry.trim().split(' '))
      .find(([, width]) => width === '1920w')
    expect(candidate, 'el srcset de la portada ofrece 1920w').toBeDefined()
    // El optimizador de next dev también codifica AVIF (next.config.ts, T1).
    const response = await request.get(candidate![0], { headers: { accept: 'image/avif,image/webp,*/*' } })
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/avif')
    expect((await response.body()).length).toBeLessThanOrEqual(250 * 1024)
  })

  // Presupuesto de JS (P1, plan §3.8): las imágenes se renderizan en el servidor y
  // llegan a las islas como slot (`media`). Un import estático de imagen dentro de
  // una isla mete su objeto (ruta, medidas y blurDataURL) en el JS del cliente.
  test('ningún script de /es lleva un import estático de imagen: van como slot del servidor (P1)', async ({ request }) => {
    const html = await (await request.get('/es')).text()
    const sources = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(([, src]) => src.replace(/&amp;/g, '&'))
    expect(sources.length, 'scripts de /es').toBeGreaterThan(0)
    for (const src of sources.filter((source) => source.startsWith('/_next/'))) {
      const response = await request.get(src)
      expect(response.status(), src).toBe(200)
      const images = (await response.text()).match(/\/_next\/static\/media\/[\w.-]+\.(?:avif|gif|jpe?g|png|webp)/g)
      expect(images, `${src} importa ${images?.join(', ')}`).toBeNull()
    }
  })
})

test.describe('portada · sin JavaScript (revisión 4)', () => {
  test.use({ javaScriptEnabled: false })

  test('el título se ve y el encabezado ya es claro sobre la portada oscura', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveText(es.hero.title)
    expect(await effectiveOpacity(h1)).toBe(1)

    // El logo pinta --hdr-fg: blanco sobre la portada, sobre fondo transparente.
    const header = page.locator('.site-header')
    const background = await header.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(background).toMatch(/^(transparent|rgba\(\d+, \d+, \d+, 0\))$/)
    await expect(header.locator('a[href="/es"]').first()).toHaveCSS('color', 'rgb(255, 255, 255)')
  })

  test('la portada es un bloque normal: sin sticky ni scroll muerto (revisión de T6)', async ({ page }) => {
    // Sin JavaScript nada se anima: la variante stage: exige (scripting: enabled).
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')

    const stage = page.locator(HERO)
    const frame = stage.locator('[data-stage-frame]')
    await expect(frame).not.toHaveCSS('position', 'sticky')
    const [section, frameBox] = await Promise.all([stage.boundingBox(), frame.boundingBox()])
    expect(section!.height).toBe(frameBox!.height)
  })

  test('la ruta está dibujada y la cumbre encendida: el estado final (revisión de T6, ronda 2)', async ({ page }) => {
    // El HTML del servidor trae el avance 0 (ruta sin dibujar, cumbre a 0);
    // sin JS, @media (scripting: none) de globals.css muestra el estado final.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')

    const stage = page.locator(HERO)
    await expect(stage.locator('[data-hero-route] path')).toHaveCSS('stroke-dasharray', 'none')
    expect(await effectiveOpacity(stage.locator('[data-hero-summit]'))).toBe(1)
    expect(await countVisibleBlue(page)).toBe(1)
  })
})

test.describe('portada · reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('la ruta ya está dibujada, modo static y sin sticky', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')

    const stage = page.locator(HERO)
    // Margen amplio: con la suite completa en paralelo, la hidratación puede pasar de 5 s.
    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true', { timeout: 15_000 })
    await expect(stage).toHaveAttribute('data-stage-mode', 'static')
    await expect(stage.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')
    await expect.poll(() => effectiveOpacity(stage.locator('[data-hero-summit]'))).toBe(1)
    expect(await countVisibleBlue(page)).toBe(1)
  })
})

test.describe('portada · pantallas extremas (revisión 1)', () => {
  // Con reducir movimiento la ruta está completa desde el montaje: la cumbre se puede medir sin hacer scroll.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  const HEADER_HEIGHT = 64

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1366, height: 657 }, // 1366×768 real, descontada la barra del navegador
    { width: 2560, height: 1080 },
    { width: 820, height: 1180 }, // tableta en vertical: banda de 73 svh (revisión de T6)
    { width: 1024, height: 1366 }, // iPad Pro en vertical: ≥ lg sin banda; la cumbre no puede salirse (revisión de T6)
  ]) {
    test(`todo el primer pliegue y la cumbre caben a ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/es')

      const stage = page.locator(HERO)
      // Margen amplio: con la suite completa en paralelo, la hidratación puede pasar de 5 s.
      await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true', { timeout: 15_000 })

      const h1 = stage.getByRole('heading', { level: 1 })
      expect(await lineCount(h1), 'el h1 debe quedar en dos líneas').toBe(2)

      expectInside(await stage.getByText(es.hero.eyebrow).boundingBox(), viewport, 'eyebrow', HEADER_HEIGHT)
      expectInside(await h1.boundingBox(), viewport, 'h1', HEADER_HEIGHT)
      for (const label of [es.hero.primaryAction.label, es.hero.secondaryAction.label]) {
        expectInside(await stage.getByRole('link', { name: label, exact: true }).boundingBox(), viewport, label, HEADER_HEIGHT)
      }
      expectInside(await stage.getByRole('link', { name: es.hero.nurtureCta.label }).boundingBox(), viewport, 'enlace de sector público', HEADER_HEIGHT)
      expectInside(await stage.getByRole('list').boundingBox(), viewport, 'fila de índice', HEADER_HEIGHT)
      expectInside(await stage.getByText(es.hero.imageLabel, { exact: true }).boundingBox(), viewport, 'etiqueta de imagen', HEADER_HEIGHT)
      expectInside(await stage.locator('[data-hero-summit]').boundingBox(), viewport, 'cumbre', HEADER_HEIGHT)

      // La ruta no cruza el índice ni la capa de instrumento: .hero-route la
      // desvanece antes del pie (revisión de T6, ronda 2: el suelo del velo solo
      // la atenuaba, y a 1366×768 y 1024×1366 cruzaba «/04 SISTEMAS CRÍTICOS»).
      await expectNoRouteOverFooter(page, 'reducir movimiento')
    })
  }
})

test.describe('portada · scrub en escritorio', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('la ruta se dibuja con el scroll y deja un solo elemento azul', async ({ page }) => {
    await page.goto('/es')
    // Lo que se afirma primero ya es cierto en el HTML del servidor: sin esta
    // espera, el scroll de abajo llegaría antes de hidratar y SmoothScroll lo desharía.
    await waitForHydration(page)

    const stage = page.locator(HERO)
    const route = stage.locator('[data-hero-route]')
    const summit = stage.locator('[data-hero-summit]')
    await expect(stage).toHaveAttribute('data-stage-mode', 'scrub')
    await expect(stage.locator('[data-stage-frame]')).toHaveCSS('position', 'sticky')

    // Avance 0: ruta sin dibujar, cumbre apagada, ningún azul a la vista.
    await expect(route).toHaveAttribute('data-complete', 'false')
    expect(await effectiveOpacity(summit)).toBe(0)
    expect(await countVisibleBlue(page)).toBe(0)

    // Avance 0,75: la ruta termina en 0,68 y la cumbre se enciende entre 0,66 y 0,74.
    await scrollToY(page, await stageScrollY(page, 0.75))
    await expect(route).toHaveAttribute('data-complete', 'true')
    await expect.poll(() => effectiveOpacity(summit)).toBe(1)
    expect(await countVisibleBlue(page)).toBe(1)

    // Volver arriba deshace el dibujo: el scroll manda en los dos sentidos.
    await scrollToY(page, 0)
    await expect(route).toHaveAttribute('data-complete', 'false')
  })

  test('el texto sube 140 px y la fila de índice se queda sobre el suelo (revisión de T6)', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)

    const stage = page.locator(HERO)
    const eyebrow = stage.getByText(es.hero.eyebrow)
    const index = stage.getByRole('list')
    const eyebrowAtRest = (await eyebrow.boundingBox())!.y
    const indexAtRest = (await index.boundingBox())!.y

    // Rango del traspaso (§4, "Portada"): y 0 → −140 px; a mitad de escenario, −70.
    await scrollToY(page, await stageScrollY(page, 0.5))
    await expect.poll(async () => eyebrowAtRest - (await eyebrow.boundingBox())!.y).toBeCloseTo(70, 0)
    // La fila de índice se desvanece con el texto, pero no sube: el suelo de
    // .hero-veil (fijo) la sigue cubriendo y la ruta no la cruza.
    expect((await index.boundingBox())!.y).toBeCloseTo(indexAtRest, 0)
  })

  test('al final del escenario el texto oculto no recibe clics y vuelve a verse con el foco (revisión de T6)', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)

    const stage = page.locator(HERO)
    const eyebrow = stage.getByText(es.hero.eyebrow)
    const eyebrowAtRest = (await eyebrow.boundingBox())!.y
    const endY = await stageScrollY(page, 1)
    await scrollToY(page, endY)

    // Texto desvanecido: sus enlaces siguen en el viewport, pero no reciben clics.
    const primary = stage.getByRole('link', { name: es.hero.primaryAction.label, exact: true })
    await expect.poll(() => effectiveOpacity(primary)).toBe(0)
    await expect(primary).toHaveCSS('pointer-events', 'none')

    // Mayús+Tab desde lo primero enfocable tras la portada (sin mover la ventana)
    // lleva el foco al enlace de sector público: tiene que verse (WCAG 2.4.7).
    await page.evaluate(() => {
      const hero = document.querySelector('#inicio')!
      const next = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).find(
        (element) => !hero.contains(element) && hero.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
      )
      next!.focus({ preventScroll: true })
    })
    await page.keyboard.press('Shift+Tab')
    const focused = page.locator('*:focus')
    await expect(focused).toHaveAccessibleName(es.hero.nurtureCta.label)
    expect(await page.evaluate(() => window.scrollY)).toBe(endY)
    expect(await effectiveOpacity(focused)).toBe(1)
    // ...y el bloque vuelve a su sitio de reposo: sin la subida de 140 px, el
    // eyebrow quedaba bajo el encabezado fijo (ronda 2).
    expect((await eyebrow.boundingBox())!.y).toBeCloseTo(eyebrowAtRest, 0)
    // La fila de índice, que se desvanece con el texto, vuelve con él: no
    // queda a medio fundir bajo el texto entero (ronda 3).
    expect(await effectiveOpacity(stage.getByRole('list'))).toBe(1)
  })
})

test.describe('portada · scrub en tableta vertical grande (revisión de T6, ronda 2)', () => {
  // ≥ lg y vertical (iPad Pro): imagen a pantalla completa, con el índice sobre la ruta.
  test.use({ viewport: { width: 1024, height: 1366 } })

  test('la ruta no cruza el índice ni la capa de instrumento a mitad de escena', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    await expect(page.locator(HERO)).toHaveAttribute('data-stage-mode', 'scrub')

    for (const progress of [0.3, 0.7]) {
      await scrollToY(page, await stageScrollY(page, progress))
      await expectNoRouteOverFooter(page, `avance ${progress}`)
    }
  })
})

test.describe('portada · scrub en tableta vertical (revisión de T6)', () => {
  // < lg y vertical: la imagen es una banda de 73 svh y el texto empieza en 36 svh.
  const viewport = { width: 820, height: 1180 }
  test.use({ viewport })

  test('el texto no sube: sigue bajo el velo de la banda y la cumbre queda por encima', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)

    const stage = page.locator(HERO)
    await expect(stage).toHaveAttribute('data-stage-mode', 'scrub')
    const eyebrow = stage.getByText(es.hero.eyebrow)
    const atRest = (await eyebrow.boundingBox())!.y
    // El velo de la banda llega a 0,85 al 49 % de sus 73 svh (globals.css).
    const veilTop = 0.73 * 0.49 * viewport.height
    expect(atRest).toBeGreaterThanOrEqual(veilTop)

    for (const progress of [0.3, 0.5, 0.75]) {
      await scrollToY(page, await stageScrollY(page, progress))
      expect((await eyebrow.boundingBox())!.y, `eyebrow con avance ${progress}`).toBeCloseTo(atRest, 0)
    }

    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true')
    await expect.poll(() => countVisibleBlue(page)).toBe(1)
    const summit = (await stage.locator('[data-hero-summit]').boundingBox())!
    expect(summit.y + summit.height, 'la cumbre queda por encima del texto').toBeLessThan(atRest)
  })

  test('la ruta se ve dibujándose durante el scroll, no solo al final (revisión de T6, ronda 2)', async ({ page }) => {
    // La máscara de la banda solo deja ver el 11 % final del trazado: el dibujo
    // se reparte sobre ese tramo. Antes, hasta el avance 0,61 no se veía nada.
    await page.goto('/es')
    await waitForHydration(page)

    const stage = page.locator(HERO)
    await expect(stage).toHaveAttribute('data-stage-mode', 'scrub')
    const eyebrowTop = (await stage.getByText(es.hero.eyebrow).boundingBox())!.y
    // Entre el encabezado y el final de la máscara (49 % de la banda), por encima del texto.
    const bottom = Math.min(0.73 * 0.49 * viewport.height, eyebrowTop)
    const band = { x: 0, y: 64, width: viewport.width, height: bottom - 64 }

    expect(await routePaints(page, band), 'avance 0: sin ruta').toBe(false)
    for (const progress of [0.3, 0.5]) {
      await scrollToY(page, await stageScrollY(page, progress))
      await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'false')
      expect(await routePaints(page, band), `avance ${progress}: la ruta asoma sobre la banda`).toBe(true)
    }
  })
})

test.describe('portada · scrub en portátil bajo (revisión de T6)', () => {
  test.use({ viewport: { width: 1366, height: 657 } })

  test('el texto no se mete bajo el encabezado mientras tiene opacidad 1', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)

    const stage = page.locator(HERO)
    await expect(stage).toHaveAttribute('data-stage-mode', 'scrub')
    const eyebrow = stage.getByText(es.hero.eyebrow)
    const header = (await page.locator('.site-header').boundingBox())!
    const atRest = (await eyebrow.boundingBox())!.y
    // Garantía (decisión 13 de T6): hasta 0,62, donde empieza el fundido, el
    // texto tiene opacidad 1 y el eyebrow no llega al encabezado. Se mide en
    // 0,61: la posición de scroll se redondea a px y 0,62 exacto puede caer
    // ya dentro del fundido.
    for (const progress of [0.3, 0.61]) {
      await scrollToY(page, await stageScrollY(page, progress))
      expect(await effectiveOpacity(eyebrow), `opacidad con avance ${progress}`).toBe(1)
      expect((await eyebrow.boundingBox())!.y, `eyebrow con avance ${progress}`).toBeGreaterThanOrEqual(header.y + header.height)
    }

    // Después sigue subiendo, ya desvaneciéndose: subida = min(140, (reposo − 4,5rem) / 0,62).
    // El código toma el reposo con offsetTop (bloque + eyebrow: px enteros,
    // sin el transform); la subida se calcula aquí con esa misma medida y se
    // resta del reposo real (fraccionario). Con el reposo de boundingBox en la
    // fórmula, el redondeo movía el resultado hasta 0,66 px (ronda 3).
    const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
    const layoutRest = await eyebrow.evaluate((element: HTMLElement) => {
      const text = element.parentElement!.parentElement!
      return text.offsetTop + element.offsetTop
    })
    expect(Math.abs(layoutRest - atRest), 'offsetTop y boundingBox miden el mismo reposo').toBeLessThan(1)
    const rise = Math.min(140, (layoutRest - 4.5 * rem) / 0.62)
    await scrollToY(page, await stageScrollY(page, 0.8))
    expect((await eyebrow.boundingBox())!.y, 'eyebrow con avance 0,8').toBeCloseTo(atRest - 0.8 * rise, 0)
  })
})

test.describe('portada · letra del navegador a 20 px (revisión de T6, ronda 2)', () => {
  // Las media queries en rem se calculan sobre la letra por defecto del
  // navegador. Con 20 px, 37,5rem son 750 px: a 1440×700 CSS no aplica stage:
  // y JavaScript tampoco puede entrar en scrub (antes, con 600px, sí entraba:
  // sin sticky, la portada se "terminaba" con el primer golpe de rueda).
  for (const { viewport, mode } of [
    { viewport: { width: 1440, height: 700 }, mode: 'inView' },
    { viewport: { width: 1440, height: 900 }, mode: 'scrub' },
  ]) {
    test(`a ${viewport.width}×${viewport.height} el modo (${mode}) y el sticky coinciden`, async ({ page }) => {
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Page.setFontSizes', { fontSizes: { standard: 20 } })
      await page.setViewportSize(viewport)
      await page.goto('/es')
      await waitForHydration(page)

      const stage = page.locator(HERO)
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('20px')
      await expect(stage).toHaveAttribute('data-stage-mode', mode)
      const frame = stage.locator('[data-stage-frame]')
      if (mode === 'scrub') await expect(frame).toHaveCSS('position', 'sticky')
      else await expect(frame).not.toHaveCSS('position', 'sticky')

      if (mode === 'scrub') {
        // El encabezado también crece (81 px): el eyebrow sigue sin llegar a él mientras se ve entero.
        const header = (await page.locator('.site-header').boundingBox())!
        const eyebrow = stage.getByText(es.hero.eyebrow)
        await scrollToY(page, await stageScrollY(page, 0.61))
        expect(await effectiveOpacity(eyebrow)).toBe(1)
        expect((await eyebrow.boundingBox())!.y).toBeGreaterThanOrEqual(header.y + header.height)
      }
    })
  }
})

test.describe('portada · celular', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('modo inView: sin sticky y la ruta se dibuja sola al cargar', async ({ page }) => {
    await page.goto('/es')

    const stage = page.locator(HERO)
    // El HTML del servidor dice "scrub": esta espera cubre también la hidratación.
    await expect(stage).toHaveAttribute('data-stage-mode', 'inView', { timeout: 15_000 })
    await expect(stage.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')
    // 0,3 s de espera + 1,8 s de dibujo
    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true', { timeout: 15_000 })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.hero.title)
  })
})

test.describe('portada · celular apaisado (poco alto)', () => {
  // ≥ 768 px de ancho pero < 600 px de alto: inView, no scrub (contrato §3.6).
  test.use({ viewport: { width: 844, height: 390 } })

  test('≥ 768 px de ancho y < 600 px de alto → inView, sin sticky', async ({ page }) => {
    await page.goto('/es')

    const stage = page.locator(HERO)
    // El HTML del servidor dice "scrub": esta espera cubre también la hidratación.
    await expect(stage).toHaveAttribute('data-stage-mode', 'inView', { timeout: 15_000 })
    await expect(stage.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')
    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true', { timeout: 15_000 })
  })
})

test.describe('portada · inglés (revisión 5)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('muestra las claves nuevas traducidas', async ({ page }) => {
    await page.goto('/en')

    const stage = page.locator(HERO)
    const h1 = stage.getByRole('heading', { level: 1 })
    await expect(h1).toHaveText(en.hero.title)
    expect(await lineCount(h1), 'el h1 inglés también va en dos líneas').toBe(2)
    await expect(stage.getByText(en.hero.indexItems[0], { exact: true })).toBeVisible()
    await expect(stage.getByText(en.hero.imageLabel, { exact: true })).toBeVisible()
    await expect(stage.getByText(en.hero.scrollHint, { exact: true })).toBeVisible()
    await expect(stage.getByRole('link', { name: en.hero.nurtureCta.label })).toHaveAttribute('href', en.hero.nurtureCta.href)
    await expect(stage.getByRole('link', { name: en.hero.primaryAction.label })).toHaveAttribute('href', '/en/diagnostic')
  })
})

// ── Tarea 7 — Tesis y Capacidades ──────────────────────────────────────────

test.describe('T7 · Tesis y Capacidades · sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('el h2, la tesis y los 8 enlaces llegan visibles desde el servidor', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.services.sectionId}`)
    const heading = section.getByRole('heading', { level: 2 })
    await expect(heading).toHaveText(es.services.title)
    await expect(heading).toBeVisible()
    expect(await effectiveOpacity(heading)).toBe(1)
    await expect(section).toHaveAttribute('data-header-theme', 'light')

    await expect(page.locator('p:has([data-thesis-word])')).toHaveText(es.thesis.text)

    const links = section.locator('[data-capability-row] a')
    await expect(links).toHaveCount(es.services.items.length)
    for (const [i, item] of es.services.items.entries()) {
      await expect(links.nth(i)).toHaveAttribute('href', buildLocalePath('es', item.href))
      await expect(links.nth(i)).toContainText(`/${String(i + 1).padStart(2, '0')}`)
      await expect(links.nth(i)).toContainText(item.title)
      await expect(links.nth(i)).toContainText(item.benefit)
    }
    // Las viñetas (bullets) no se muestran en la home (diseño §5.3)
    await expect(section).not.toContainText(es.services.items[0].bullets[0])
    await expect(section.locator('figcaption')).toContainText(es.services.imageLabel)
  })

  test('se pinta el estado final: tesis en negro, red completa, sin azul ni contador', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.services.sectionId}`)
    // Como en la portada (@media (scripting: none)): el mismo estado que con reducir movimiento
    const words = page.locator('[data-thesis-word]')
    await expect(words.first()).toHaveCSS('color', 'rgb(10, 10, 10)')
    await expect(words.last()).toHaveCSS('color', 'rgb(10, 10, 10)')
    const circles = section.locator('[data-node] > circle')
    await expect(circles).toHaveCount(es.services.items.length)
    for (let i = 0; i < es.services.items.length; i++) {
      await expect(circles.nth(i)).toHaveCSS('fill', 'rgb(10, 10, 10)')
    }
    const edges = section.locator('[data-capability-edge]')
    await expect(edges).toHaveCount(es.services.items.length - 1)
    for (let i = 0; i < es.services.items.length - 1; i++) {
      await expect(edges.nth(i)).toHaveCSS('stroke-dasharray', 'none')
    }
    await expect(section.locator('[data-capability-row] a').first().locator(':scope > :first-child')).toHaveCSS(
      'color',
      'rgb(10, 10, 10)'
    )
    // «00 / 08» no significaría nada sin scroll que seguir
    await expect(section.locator('[data-capabilities-counter]')).toBeHidden()
    await section.locator('figure').scrollIntoViewIfNeeded()
    expect(await countVisibleBlue(page)).toBe(0)
  })
})

test.describe('T7 · Tesis y Capacidades · reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1440, height: 900 } })

  test('red completa en negro, ningún nodo activo, tesis entera y sin sticky', async ({ page }) => {
    const total = es.services.items.length
    const words = es.thesis.text.split(' ').length
    await page.goto('/es')
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'static')
    await expect(section.locator('[data-node]')).toHaveCount(total)
    await expect(section.locator('[data-node][data-lit="true"]')).toHaveCount(total)
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(0)
    await expect(section.locator('[data-capabilities-counter]')).toHaveText('08 / 08')
    await expect(section.locator('figure')).toHaveCSS('position', 'static')
    // Red completa en negro: cada arista trazada entera (pathLength 1 → guion 1, desfase 0)
    // y cada nodo relleno de #0a0a0a
    const edges = section.locator('[data-capability-edge]')
    await expect(edges).toHaveCount(total - 1)
    for (let i = 0; i < total - 1; i++) {
      await expect(edges.nth(i)).toHaveAttribute('pathLength', '1')
      await expect(edges.nth(i)).toHaveCSS('stroke-dasharray', '1px, 1px')
      await expect(edges.nth(i)).toHaveCSS('stroke-dashoffset', '0px')
    }
    const circles = section.locator('[data-node] > circle')
    await expect(circles).toHaveCount(total)
    for (let i = 0; i < total; i++) {
      await expect(circles.nth(i)).toHaveCSS('fill', 'rgb(10, 10, 10)')
    }
    await section.locator('figure').scrollIntoViewIfNeeded()
    expect(await countVisibleBlue(page)).toBe(0)

    await expect(page.locator('section:has([data-thesis-word])')).toHaveAttribute('data-stage-mode', 'static')
    await expect(page.locator('[data-thesis-word]')).toHaveCount(words)
    await expect(page.locator('[data-thesis-word][data-active="true"]')).toHaveCount(words)
  })
})

test.describe('T7 · Tesis y Capacidades · scrub (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('la tesis pasa de #737373 a #0a0a0a palabra a palabra', async ({ page }) => {
    await page.goto('/es')
    // data-stage-mode="scrub" ya está en el HTML del servidor: sin esta espera, el
    // scroll llegaría antes de hidratar y SmoothScroll lo desharía (§3.7).
    await waitForHydration(page)
    const thesis = page.locator('p:has([data-thesis-word])')
    await expect(page.locator('section:has([data-thesis-word])')).toHaveAttribute('data-stage-mode', 'scrub')
    await expect(page.locator('[data-thesis-word][data-active="true"]')).toHaveCount(0)
    await expect(thesis.locator('[data-thesis-word]').first()).toHaveCSS('color', 'rgb(115, 115, 115)')

    // A mitad del recorrido (offset "start 0.85" → "end 0.5"), las palabras activas son
    // las k primeras, con 0 < k < total: se encienden palabra a palabra, no de golpe.
    const mid = await thesis.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const start = window.scrollY + rect.top - window.innerHeight * 0.85
      const end = window.scrollY + rect.bottom - window.innerHeight * 0.5
      return (start + end) / 2
    })
    await scrollToY(page, mid)
    await expect
      .poll(() =>
        thesis
          .locator('[data-thesis-word]')
          .evaluateAll((words) => words.map((word) => (word.getAttribute('data-active') === 'true' ? '1' : '0')).join(''))
      )
      .toMatch(/^1+0+$/)
    const activeWords = thesis.locator('[data-thesis-word][data-active="true"]')
    await expect(activeWords.last()).toHaveCSS('color', 'rgb(10, 10, 10)')
    await expect(thesis.locator('[data-thesis-word][data-active="false"]').first()).toHaveCSS(
      'color',
      'rgb(115, 115, 115)'
    )

    // Borde inferior de la frase al 40 % del viewport → avance 1 (offset "end 0.5")
    const y = await thesis.evaluate((el) => window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight * 0.4)
    await scrollToY(page, y)
    await expect(page.locator('[data-thesis-word][data-active="false"]')).toHaveCount(0)
    await expect(thesis.locator('[data-thesis-word]').last()).toHaveCSS('color', 'rgb(10, 10, 10)')
  })

  test('con la fila 3 en el centro se encienden los nodos 0–2 y hay un solo azul', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
    await expect(section.locator('figure')).toHaveCSS('position', 'sticky')
    const rows = section.locator('[data-capability-row]')
    await expect(rows).toHaveCount(es.services.items.length)

    // Centro de la fila 3 sobre el centro del viewport: su borde superior queda por
    // encima del centro y el de la fila 4 por debajo → índice activo 2.
    const y = await rows.nth(2).evaluate((row) => {
      const rect = row.getBoundingClientRect()
      return window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    })
    await scrollToY(page, y)

    const nodes = section.locator('[data-node]')
    await expect(nodes.nth(2)).toHaveAttribute('data-active', 'true')
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(1)
    for (let i = 0; i < es.services.items.length; i++) {
      await expect(nodes.nth(i)).toHaveAttribute('data-lit', i <= 2 ? 'true' : 'false')
    }
    await expect(section.locator('[data-capabilities-counter]')).toHaveText('03 / 08')
    await expect(nodes.nth(2).locator('circle').first()).toHaveCSS('fill', 'rgb(37, 99, 235)')
    await expect.poll(() => countVisibleBlue(page)).toBe(1)
  })
})

// La red se completa cuando el borde inferior de la última fila cruza el centro. En ese
// momento la lámina tiene que seguir fija (top-24) y entera, del ancho de su columna y con
// el contador alineado a su borde derecho y en una línea. 1366×657 y 768×600: lámina
// limitada por el alto; 768×600: además «Imagen ilustrativa» en dos líneas.
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 657 },
  { width: 1024, height: 768 },
  { width: 768, height: 600 },
  { width: 768, height: 1024 },
]) {
  test.describe(`T7 · Capacidades · final del scrub (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport })

    test('red completa sin azul, con la lámina fija, entera y alineada con su leyenda', async ({ page }) => {
      await page.goto('/es')
      await waitForHydration(page)
      const section = page.locator(`#${es.services.sectionId}`)
      await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
      const last = section.locator('[data-capability-row]').last()
      const y = await last.evaluate(
        (row) => Math.ceil(window.scrollY + row.getBoundingClientRect().bottom - window.innerHeight / 2) + 1
      )
      await scrollToY(page, y)

      await expect(section.locator('[data-capabilities-counter]')).toHaveText('08 / 08')
      await expect(section.locator('[data-node][data-lit="true"]')).toHaveCount(es.services.items.length)
      await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(0)
      await expect.poll(() => countVisibleBlue(page)).toBe(0)

      const box = await section.locator('figure').evaluate((figure) => {
        const lamina = figure.firstElementChild!.getBoundingClientRect()
        const counter = figure.querySelector('figcaption')!.lastElementChild!
        const counterRect = counter.getBoundingClientRect()
        return {
          figureTop: figure.getBoundingClientRect().top,
          figureBottom: figure.getBoundingClientRect().bottom,
          figureWidth: figure.getBoundingClientRect().width,
          laminaWidth: lamina.width,
          laminaRight: lamina.right,
          counterRight: counterRect.right,
          counterLines: counterRect.height / parseFloat(getComputedStyle(counter).lineHeight),
          viewportHeight: window.innerHeight,
          rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
        }
      })
      // Fija en top-24 (6rem) y entera dentro del viewport
      expect(Math.abs(box.figureTop - 6 * box.rem)).toBeLessThanOrEqual(1)
      expect(box.figureBottom).toBeLessThanOrEqual(box.viewportHeight)
      // Del ancho de la columna (no más estrecha por el max-h) y con el contador a su borde derecho
      expect(Math.abs(box.laminaWidth - box.figureWidth)).toBeLessThanOrEqual(1)
      expect(Math.abs(box.counterRight - box.laminaRight)).toBeLessThanOrEqual(1)
      // El contador nunca se parte en dos líneas
      expect(box.counterLines).toBeLessThan(1.5)
    })
  })
}

test.describe('T7 · Tesis y Capacidades · celular (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('la tesis se revela entera al entrar en pantalla', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const thesis = page.locator('p:has([data-thesis-word])')
    await expect(page.locator('section:has([data-thesis-word])')).toHaveAttribute('data-stage-mode', 'inView')
    await expect(page.locator('[data-thesis-word][data-active="true"]')).toHaveCount(0)

    const y = await thesis.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.2)
    await scrollToY(page, y)
    await expect(page.locator('[data-thesis-word][data-active="false"]')).toHaveCount(0, { timeout: 10_000 })
    await expect(thesis.locator('[data-thesis-word]').last()).toHaveCSS('color', 'rgb(10, 10, 10)')
  })

  test('la secuencia de la red, una vez disparada, termina en N aunque la lámina salga de pantalla', async ({
    page,
  }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')
    await expect(section.locator('figure')).toHaveCSS('position', 'static')
    const counter = section.locator('[data-capabilities-counter]')
    await expect(counter).toHaveText('00 / 08')

    const figureY = await section
      .locator('figure')
      .evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 80)
    await scrollToY(page, figureY)
    // Arranca: un nodo activo (azul)…
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(1)
    // …y la lámina sale de pantalla a mitad de la secuencia
    const below = await section.evaluate((el) => window.scrollY + el.getBoundingClientRect().bottom)
    await scrollToY(page, below)
    await expect(counter).toHaveText('08 / 08', { timeout: 10_000 })
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(0)
    await expect(section.locator('[data-node][data-lit="true"]')).toHaveCount(es.services.items.length)

    await scrollToY(page, figureY)
    await expect.poll(() => countVisibleBlue(page)).toBe(0)
  })
})

test.describe('T7 · Capacidades · de escritorio a celular (revisión 3)', () => {
  test('pasa a inView sin errores y completa la red', async ({ page }) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    // data-stage-mode="scrub" ya viene del servidor: sin esta espera, el cambio de
    // tamaño llegaría antes de hidratar y la isla arrancaría directamente en inView.
    await waitForHydration(page)
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
    // Componente hidratado y en marcha en scrub (fila 4 en el centro) antes de pasar a celular
    const row = section.locator('[data-capability-row]').nth(3)
    const rowY = await row.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    })
    await scrollToY(page, rowY)
    await expect(section.locator('[data-node]').nth(3)).toHaveAttribute('data-active', 'true')
    await expect(section.locator('[data-capabilities-counter]')).toHaveText('04 / 08')

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')

    const y = await section.locator('figure').evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 80)
    await scrollToY(page, y)
    // 9 pasos de 220 ms: la secuencia termina con la red completa y sin azul
    await expect(section.locator('[data-node][data-lit="true"]')).toHaveCount(es.services.items.length, {
      timeout: 10_000,
    })
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(0)
    await expect(section.locator('[data-capabilities-counter]')).toHaveText('08 / 08')
    expect(errors).toEqual([])
  })
})

// Ronda 2 · 320 px: la tesis (2,25rem por debajo de 22,5rem) y los títulos de
// capacidad (text-xl) caben en su caja; a 2,5rem y text-2xl, «organizaciones»,
// «ciberseguridad», «Automatización» y «Enriquecimiento» se salían.
test.describe('T7 · Tesis y Capacidades · 320 px', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  for (const locale of ['es', 'en'] as const) {
    test(`${locale}: ninguna palabra de la tesis ni título de capacidad se sale de su caja`, async ({ page }) => {
      await page.goto(`/${locale}`)
      const overflow = await page.evaluate(() => {
        const thesis = document.querySelector('p:has([data-thesis-word])')!
        const right = thesis.getBoundingClientRect().right
        const words = Array.from(thesis.querySelectorAll('[data-thesis-word]'))
          .filter((word) => word.getBoundingClientRect().right > right + 0.5)
          .map((word) => word.textContent)
        const titles = Array.from(document.querySelectorAll('[data-capability-row] h3'))
          .filter((title) => title.scrollWidth > title.clientWidth)
          .map((title) => title.textContent)
        return { words, titles, pageOverflow: document.documentElement.scrollWidth > window.innerWidth }
      })
      expect(overflow).toEqual({ words: [], titles: [], pageOverflow: false })
    })
  }
})

// Ronda 2 · el `sizes` de la lámina es una cota superior ajustada del marco 3:2 que
// se pinta (FocalCover). Una imagen de prueba con el mismo `sizes` y un srcset denso
// (un candidato por píxel) revela el ancho de ranura que calcula el navegador: tiene
// que cubrir el marco y no pasarlo en más de un 5 %. 844×390: celular apaisado, marco
// limitado por el alto (76vw pedía 641 px para un marco de ~390).
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 657 },
  { width: 1024, height: 768 },
  { width: 844, height: 390 },
  { width: 390, height: 844 },
]) {
  test.describe(`T7 · Capacidades · tamaño de la imagen de la lámina (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport })

    test('el sizes cubre el marco sin pedir de más', async ({ page }) => {
      await page.route('**/__sizes-probe/**', (route) => route.fulfill({ status: 204 }))
      await page.goto('/es')
      const { frame, slot } = await page.locator(`#${es.services.sectionId} figure img`).evaluate(async (img) => {
        const frameWidth = img.closest('.focal-cover')!.getBoundingClientRect().width
        const probe = new Image()
        probe.sizes = img.getAttribute('sizes') ?? ''
        const candidates: string[] = []
        for (let width = 100; width <= 4000; width += 1) candidates.push(`/__sizes-probe/${width}.png ${width}w`)
        probe.srcset = candidates.join(', ')
        for (let i = 0; i < 100 && !probe.currentSrc; i++) await new Promise((resolve) => setTimeout(resolve, 20))
        return { frame: frameWidth, slot: Number(/__sizes-probe\/(\d+)/.exec(probe.currentSrc)?.[1]) }
      })
      expect(slot).toBeGreaterThanOrEqual(Math.floor(frame))
      expect(slot).toBeLessThanOrEqual(frame * 1.05)
    })
  })
}

// Ronda 2 · celular apaisado: la lámina mide ~262 px de alto. Las aristas van a 4
// unidades del viewBox (≈ 1 px) y cada nodo se escala ×1,5 sobre su centro: el
// punto azul activo ronda los 9 px, como en un celular vertical, y no los 6 px.
test.describe('T7 · Capacidades · celular apaisado (844×390)', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('nodos de ~9 px sobre los extremos de sus aristas, y aristas de ~1 px', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')
    const y = await section.locator('figure').evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 72)
    await scrollToY(page, y)
    await expect(section.locator('[data-node][data-active="true"]')).toHaveCount(1)

    const geometry = await section.locator('svg').evaluate((svg) => {
      const svgElement = svg as SVGSVGElement
      const scale = svgElement.getScreenCTM()!.a
      const circles = Array.from(svg.querySelectorAll('[data-node] > circle:first-child'))
      const centers = circles.map((circle) => {
        const rect = circle.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, diameter: rect.width }
      })
      const edges = Array.from(svg.querySelectorAll<SVGLineElement>('[data-capability-edge]'))
      const offsets = edges.map((edge, k) => {
        const start = new DOMPoint(edge.x1.baseVal.value, edge.y1.baseVal.value).matrixTransform(edge.getScreenCTM()!)
        const end = new DOMPoint(edge.x2.baseVal.value, edge.y2.baseVal.value).matrixTransform(edge.getScreenCTM()!)
        return Math.max(
          Math.hypot(start.x - centers[k].x, start.y - centers[k].y),
          Math.hypot(end.x - centers[k + 1].x, end.y - centers[k + 1].y)
        )
      })
      const ring = svg.querySelector('[data-node][data-active="true"] > circle + circle')!.getBoundingClientRect()
      return {
        minDiameter: Math.min(...centers.map((center) => center.diameter)),
        ring: ring.width,
        maxOffset: Math.max(...offsets),
        edgeWidth: parseFloat(getComputedStyle(edges[0]).strokeWidth) * scale,
      }
    })
    expect(geometry.minDiameter).toBeGreaterThanOrEqual(9)
    expect(geometry.ring).toBeGreaterThanOrEqual(18)
    // Escalados sobre su propio centro: siguen en los extremos de las aristas
    expect(geometry.maxOffset).toBeLessThanOrEqual(0.5)
    expect(geometry.edgeWidth).toBeGreaterThanOrEqual(1)
  })
})

// Ronda 2 · el indicador global de avance (ScrollProgress) iba en right-6, justo sobre
// el borde derecho de la lámina en anchos ≤ 80rem. Ahora va en el margen, y su relleno
// lleva el alfa en el color (antes quedaba multiplicado por la opacidad de la pista).
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
]) {
  test.describe(`T7 · Capacidades · indicador de avance junto a la lámina (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport, contextOptions: { reducedMotion: 'no-preference' } })

    test('queda en el margen, fuera de la lámina, y su relleno se ve', async ({ page }) => {
      await page.goto('/es')
      await waitForHydration(page)
      const fill = page.locator('[data-scroll-progress-fill]')
      await expect(fill).toBeAttached({ timeout: 15_000 })
      const section = page.locator(`#${es.services.sectionId}`)
      const y = await section.locator('figure').evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 96)
      await scrollToY(page, y)

      const layout = await fill.evaluate((element, sectionId) => {
        const track = element.parentElement!.getBoundingClientRect()
        const laminaRect = document.querySelector(`#${sectionId} figure`)!.getBoundingClientRect()
        // Alfa del color de fondo, sea cual sea su sintaxis (rgb, oklab…)
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')!
        context.fillStyle = getComputedStyle(element).backgroundColor
        context.fillRect(0, 0, 1, 1)
        return {
          trackLeft: track.left,
          trackRight: track.right,
          trackTop: track.top,
          trackBottom: track.bottom,
          laminaRight: laminaRect.right,
          laminaTop: laminaRect.top,
          laminaBottom: laminaRect.bottom,
          viewportWidth: window.innerWidth,
          fillAlpha: context.getImageData(0, 0, 1, 1).data[3] / 255,
        }
      }, es.services.sectionId)
      // A la altura de la lámina, pero a su derecha y dentro del viewport
      expect(layout.trackTop).toBeLessThan(layout.laminaBottom)
      expect(layout.trackBottom).toBeGreaterThan(layout.laminaTop)
      expect(layout.trackLeft).toBeGreaterThan(layout.laminaRight + 8)
      expect(layout.trackRight).toBeLessThanOrEqual(layout.viewportWidth)
      expect(await effectiveOpacity(fill)).toBe(1)
      expect(layout.fillAlpha).toBeGreaterThanOrEqual(0.5)
    })
  })
}

test.describe('T7 · Tesis y Capacidades · inglés (revisión 5)', () => {
  test('/en muestra la tesis, el título y la etiqueta de la lámina traducidos', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('p:has([data-thesis-word])')).toHaveText(en.thesis.text)
    const section = page.locator(`#${en.services.sectionId}`)
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(en.services.title)
    await expect(section.locator('figcaption')).toContainText(en.services.imageLabel)
    await expect(section.locator('[data-capability-row] a').first()).toHaveAttribute(
      'href',
      buildLocalePath('en', en.services.items[0].href)
    )
  })
})

// ── Tarea 8 — Del papel al dato ────────────────────────────────────────────

/**
 * Etiqueta de estado que VE el usuario en cada fila del panel. Cada fila apila
 * sus tres etiquetas (ancho constante) y solo deja visible la actual, así que su
 * textContent contiene las tres: se comprueba qué etiqueta se ve, no qué texto
 * contiene (revisión de T8, ronda 2).
 */
async function expectVisibleStatus(rows: Locator, states: readonly FieldState[]) {
  await expect(rows).toHaveCount(states.length)
  for (const [i, state] of states.entries()) {
    for (const option of ['idle', 'active', 'done'] as const) {
      const label = rows.nth(i).getByText(es.dossier.status[option], { exact: true })
      if (option === state) await expect(label, `fila ${i}: se ve «${es.dossier.status[option]}»`).toBeVisible()
      else await expect(label, `fila ${i}: no se ve «${es.dossier.status[option]}»`).toBeHidden()
    }
  }
}

test.describe('T8 · Del papel al dato · extractionAt (módulo puro)', () => {
  test('tabla de estados del recorrido', () => {
    expect(extractionAt(0)).toEqual({ done: 0, active: null })
    expect(extractionAt(0.02)).toEqual({ done: 0, active: null }) // s = 0,132: todavía sin azul
    expect(extractionAt(0.03)).toEqual({ done: 0, active: 0 }) // s = 0,198
    expect(extractionAt(1.1 / 6.6)).toEqual({ done: 1, active: null }) // s = 1,1: respiro entre campos
    expect(extractionAt(2.5 / 6.6)).toEqual({ done: 2, active: 2 })
    expect(extractionAt(0.95)).toEqual({ done: 6, active: null })
    expect(extractionAt(1)).toEqual({ done: 6, active: null })
    const mid = extractionAt(2.5 / 6.6)
    expect([0, 1, 2, 3, 4, 5].map((i) => fieldState(i, mid))).toEqual([
      'done',
      'done',
      'active',
      'idle',
      'idle',
      'idle',
    ])
  })

  test('secuencia de celular, estado final y un nombre por recuadro (revisión de T8)', () => {
    expect(extractionAtStep(-1)).toEqual({ done: 0, active: null }) // todavía no entró en pantalla
    expect(extractionAtStep(0)).toEqual({ done: 0, active: 0 })
    expect(extractionAtStep(3)).toEqual({ done: 3, active: 3 })
    expect(extractionAtStep(6)).toEqual({ done: 6, active: null })
    expect(extractionAtStep(9)).toEqual({ done: 6, active: null })
    expect(extractionComplete()).toEqual({ done: 6, active: null })
    // Contador «0N / 06», recuadros y filas del panel salen del mismo número
    expect(DOSSIER_FIELD_COUNT).toBe(6)
    expect(es.dossier.fields).toHaveLength(DOSSIER_FIELD_COUNT)
    expect(en.dossier.fields).toHaveLength(DOSSIER_FIELD_COUNT)
  })
})

test.describe('T8 · Del papel al dato · sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('el h2, el panel y los enlaces llegan visibles desde el servidor', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-header-theme', 'dark')
    const heading = section.getByRole('heading', { level: 2 })
    await expect(heading).toHaveText(es.dossier.title)
    await expect(heading).toBeVisible()
    expect(await effectiveOpacity(heading)).toBe(1)

    const rows = section.locator('[data-dossier-row]')
    await expect(rows).toHaveCount(es.dossier.fields.length)
    for (const [i, field] of es.dossier.fields.entries()) {
      await expect(rows.nth(i)).toContainText(field)
    }
    await expect(section).toContainText(es.dossier.imageLabel)
    for (const link of es.dossier.links) {
      await expect(section.getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        buildLocalePath('es', link.href)
      )
    }
  })

  test('se pinta el estado final, como con reducir movimiento: recuadros y filas «Extraído», sin azul ni contador (revisión de T8, ronda 3)', async ({
    page,
  }) => {
    // El HTML del servidor trae el primer render (scrub, avance 0): recuadros
    // transparentes, «00 / 06» y «En espera» ×6, como un proceso que nunca
    // arrancó. @media (scripting: none) de globals.css pinta el estado final,
    // igual que en la portada y en Capacidades.
    await page.goto('/es')
    const section = page.locator(`#${es.dossier.sectionId}`)
    const fields = section.locator('[data-dossier-field]')
    await expect(fields).toHaveCount(DOSSIER_FIELD_COUNT)
    expect(await fields.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))).toEqual(
      Array(DOSSIER_FIELD_COUNT).fill('1')
    )
    // Terminados: trazo #0a0a0a, ninguno azul
    for (let i = 0; i < DOSSIER_FIELD_COUNT; i++) {
      await expect(fields.nth(i)).toHaveCSS('stroke', 'rgb(10, 10, 10)')
    }
    // Cada fila dice «Extraído» (lo que se ve, no solo el texto) y su nombre va en blanco
    const rows = section.locator('[data-dossier-row]')
    await expectVisibleStatus(rows, Array(es.dossier.fields.length).fill('done'))
    for (const [i, field] of es.dossier.fields.entries()) {
      await expect(rows.nth(i).getByText(field, { exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)')
    }
    // Sin scroll que seguir, el contador del primer render («00 / 06») no se
    // muestra (como el de Capacidades); «Campos extraídos» queda como título.
    const counter = section.locator('[data-dossier-counter]')
    await expect(counter).toHaveText('00 / 06')
    await expect(counter).toBeHidden()
    await expect(section.getByText(es.dossier.counterLabel, { exact: true })).toBeVisible()
  })
})

test.describe('T8 · Del papel al dato · reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1440, height: 900 } })

  test('los 6 campos quedan extraídos, sin azul y sin sticky', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'static')
    await expect(section.locator('[data-dossier-row][data-state="done"]')).toHaveCount(es.dossier.fields.length)
    await expect(section.locator('[data-dossier-field][data-state="done"]')).toHaveCount(es.dossier.fields.length)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06')
    await expect(section.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')
    // Terminados y además visibles: un recuadro en opacity 0 no se vería (revisión de T8)
    await expect
      .poll(() => section.locator('[data-dossier-field]').evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)))
      .toEqual(Array(es.dossier.fields.length).fill('1'))
    // El panel dice «Extraído» en las 6 filas (lo que se ve, no solo data-state)
    await expectVisibleStatus(section.locator('[data-dossier-row]'), Array(es.dossier.fields.length).fill('done'))

    const y = await section.evaluate((el) => window.scrollY + el.getBoundingClientRect().top)
    await scrollToY(page, y)
    await expect.poll(() => countVisibleBlue(page)).toBe(0)
  })
})

test.describe('T8 · Del papel al dato · enlace de la portada (revisión 2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('el enlace de sector público deja #gobierno arriba del viewport', async ({ page }) => {
    expect(es.hero.nurtureCta.href).toBe(`#${es.dossier.sectionId}`)
    await page.goto('/es')
    // Un clic antes de hidratar puede quedar deshecho por el scroll al tope de SmoothScroll.
    await waitForHydration(page)
    await page.getByRole('link', { name: es.hero.nurtureCta.label }).click()
    const section = page.locator(`#${es.dossier.sectionId}`)
    // El scroll al ancla es suave: se mide solo cuando lleva dos frames quieto
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    await expect(page).toHaveURL(new RegExp(`#${es.dossier.sectionId}$`))
  })
})

test.describe('T8 · Del papel al dato · las anclas de la portada y el historial (revisión de T8, ronda 5)', () => {
  // Las anclas de la portada (#gobierno, #capacidades) son <a> nativos. La
  // entrada del historial que crea el navegador nacía sin estado, y el App
  // Router de Next ignora un popstate sin estado: tras seguir un enlace de la
  // sección a otra página, Atrás cambiaba la URL a /es#gobierno pero dejaba a
  // la vista la otra página. SmoothScroll le copia el estado del router.
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`a ${viewport.width}×${viewport.height}, Atrás desde un enlace del expediente vuelve a la home con #gobierno arriba`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto('/es')
      await waitForHydration(page)
      await page.getByRole('link', { name: es.hero.nurtureCta.label }).click()
      const section = page.locator(`#${es.dossier.sectionId}`)
      await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)

      const [link] = es.dossier.links
      await section.getByRole('link', { name: link.label }).click()
      await expect(page).toHaveURL(new RegExp(`${buildLocalePath('es', link.href)}$`))
      await page.goBack()
      await expect(page).toHaveURL(new RegExp(`/es#${es.dossier.sectionId}$`))
      // La home, no la página del enlace con la URL de la home
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.hero.title)
      await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    })
  }

  test('a 1440×900, lo mismo con «Ver Capacidades de Ingeniería» (#capacidades)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await waitForHydration(page)
    expect(es.hero.secondaryAction.href).toBe(`#${es.services.sectionId}`)
    await page.getByRole('link', { name: es.hero.secondaryAction.label }).click()
    const capabilities = page.locator(`#${es.services.sectionId}`)
    await expect.poll(() => settledTopOffset(capabilities), { timeout: 10_000 }).toBeLessThanOrEqual(2)

    const link = capabilities.locator('a[href^="/es/"]').first()
    const href = await link.getAttribute('href')
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/es#${es.services.sectionId}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.hero.title)
    await expect.poll(() => settledTopOffset(capabilities), { timeout: 10_000 }).toBeLessThanOrEqual(2)
  })

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`a ${viewport.width}×${viewport.height}, abrir /es#gobierno (un enlace compartido) o recargar deja la sección arriba`, async ({
      page,
    }) => {
      // El efecto de montaje de SmoothScroll devolvía la ventana al tope aunque
      // la URL trajera un ancla. Tras waitForHydration ese efecto ya corrió.
      await page.setViewportSize(viewport)
      await page.goto(`/es#${es.dossier.sectionId}`)
      await waitForHydration(page)
      const section = page.locator(`#${es.dossier.sectionId}`)
      await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
      await page.reload()
      await waitForHydration(page)
      await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    })
  }

  test('a 1440×900, el ancla sigue siendo nativa: con teclado el Tab siguiente entra en el expediente, y un segundo clic vuelve a bajar', async ({
    page,
  }) => {
    // Lo que se perdería con <Link> (comprobado): el foco seguiría en la
    // portada y el Tab siguiente subiría a Capacidades; y un segundo clic en el
    // mismo ancla ya no bajaría (Next no desplaza si el hash no cambia).
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.dossier.sectionId}`)
    const nurture = page.getByRole('link', { name: es.hero.nurtureCta.label })
    await nurture.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    await page.keyboard.press('Tab')
    await expect(section.getByRole('link', { name: es.dossier.links[0].label })).toBeFocused()

    await scrollToY(page, 0)
    await nurture.click()
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
  })

  test('a 1440×900, tras un segundo clic en el mismo ancla, Atrás desde el expediente sigue volviendo a la home', async ({
    page,
  }) => {
    // El segundo clic no cambia la URL ni dispara hashchange. En Chromium la
    // entrada conserva su estado (medido); un navegador que siga la
    // especificación la sustituye sin estado, y ahí lo repone el setTimeout de
    // SmoothScroll: el estado guardado va ligado a la URL del ancla, que ya era
    // la actual. Aquí se comprueba que ese camino no rompe Atrás (revisión de
    // T8, ronda 6).
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.dossier.sectionId}`)
    const nurture = page.getByRole('link', { name: es.hero.nurtureCta.label })
    await nurture.click()
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    await scrollToY(page, 0)
    await nurture.click()
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)

    const [link] = es.dossier.links
    await section.getByRole('link', { name: link.label }).click()
    await expect(page).toHaveURL(new RegExp(`${buildLocalePath('es', link.href)}$`))
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/es#${es.dossier.sectionId}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.hero.title)
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
  })

  // Un clic en el ancla que no navega en esta pestaña dejaba guardado el estado
  // del router de la home, y SmoothScroll se lo daba a la primera entrada sin
  // estado que apareciera, aunque fuera de otra página (un fragmento escrito a
  // mano): con Adelante, Next pintaba la home bajo la URL de esa página
  // (revisión de T8, ronda 6). Ctrl o Cmd+clic ya no guarda nada, y lo guardado
  // solo vale para una entrada con la URL exacta del ancla.
  for (const variant of ['Ctrl o Cmd+clic', 'un clic que cancela otro manejador'] as const) {
    test(`a 1440×900, tras ${variant} en el ancla, una entrada de otra página no recibe el estado de la home`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/es')
      await waitForHydration(page)
      const nurture = page.getByRole('link', { name: es.hero.nurtureCta.label })
      if (variant === 'Ctrl o Cmd+clic') {
        // Se abre en otra pestaña, y esta sigue en /es
        const popup = page.context().waitForEvent('page')
        await nurture.click({ modifiers: ['ControlOrMeta'] })
        await (await popup).close()
      } else {
        await nurture.evaluate((el) => el.addEventListener('click', (event) => event.preventDefault()))
        await nurture.click()
      }
      await expect(page).toHaveURL(/\/es$/)

      // Otra página, y en ella un fragmento escrito a mano: una entrada nueva sin estado
      const [link] = es.dossier.links
      await page.locator(`#${es.dossier.sectionId}`).getByRole('link', { name: link.label }).click()
      await expect(page).toHaveURL(new RegExp(`${buildLocalePath('es', link.href)}$`))
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toHaveText(es.products.governmentAutomation.title)
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            window.addEventListener('hashchange', () => resolve(), { once: true })
            window.location.hash = 'detalle'
          })
      )
      await page.goBack()
      await expect(page).toHaveURL(new RegExp(`${buildLocalePath('es', link.href)}$`))
      await page.goForward()
      await expect(page).toHaveURL(new RegExp(`${buildLocalePath('es', link.href)}#detalle$`))
      // Con el estado de la home, Next la pintaría tras el popstate, en una
      // transición: la espera es a propósito (se comprueba que la página NO
      // cambia) y la lectura, inmediata, sin reintentos.
      await page.waitForTimeout(1000)
      expect(await heading.textContent(), 'Adelante muestra la página de la URL').toBe(
        es.products.governmentAutomation.title
      )
    })
  }
})

test.describe('T8 · Del papel al dato · scrub (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('con 2 campos extraídos y 1 en proceso, el único azul es el recuadro activo', async ({ page }) => {
    await page.goto('/es')
    // data-stage-mode="scrub" ya está en el HTML del servidor (§3.7, waitForHydration).
    await waitForHydration(page)
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
    await expect(section.locator('[data-stage-frame]')).toHaveCSS('position', 'sticky')

    // s = 2,5 → 2 campos terminados y el tercero (índice 2) activo
    const progress = 2.5 / 6.6
    expect(extractionAt(progress)).toEqual({ done: 2, active: 2 })
    const y = await section.evaluate((el, p) => {
      const rect = el.getBoundingClientRect()
      return window.scrollY + rect.top + p * (rect.height - window.innerHeight)
    }, progress)
    await scrollToY(page, y)

    const fields = section.locator('[data-dossier-field]')
    await expect(fields.nth(2)).toHaveAttribute('data-state', 'active')
    await expect(section.locator('[data-dossier-field][data-state="done"]')).toHaveCount(2)
    await expect(section.locator('[data-dossier-field][data-state="active"]')).toHaveCount(1)
    await expect(fields.nth(2)).toHaveCSS('stroke', 'rgb(37, 99, 235)')
    await expect(section.locator('[data-dossier-row]').nth(2)).toHaveAttribute('data-state', 'active')
    await expect(section.locator('[data-dossier-row][data-state="done"]')).toHaveCount(2)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('02 / 06')
    // Capa de instrumento (diseño §4, contrato §3.1): #a3a3a3 sobre oscuro, como
    // «Campos extraídos» y el contador de Capacidades (revisión de T8, ronda 4)
    await expect(section.locator('[data-dossier-counter]')).toHaveCSS('color', 'rgb(163, 163, 163)')
    // Lo que se lee en el panel casa con el estado: Extraído ×2, Procesando, En espera ×3
    await expectVisibleStatus(section.locator('[data-dossier-row]'), ['done', 'done', 'active', 'idle', 'idle', 'idle'])
    // Un solo azul visible, y es el recuadro activo (que sí es azul): el panel no tiene azul
    await expect.poll(() => countVisibleBlue(page)).toBe(1)
  })

  test('con teclado, el anillo de foco de los enlaces se ve blanco sobre el fondo oscuro (revisión de T8)', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.dossier.sectionId}`)
    const [first, second] = es.dossier.links.map((link) => section.getByRole('link', { name: link.label }))
    /** :focus-visible y contorno del enlace. El global (colors.accent) es #0a0a0a, igual que el fondo. */
    const ring = (link: typeof first) =>
      link.evaluate((el) => {
        const style = getComputedStyle(el)
        return { visible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor }
      })
    const whiteRing = { visible: true, style: 'solid', width: '2px', color: 'rgb(255, 255, 255)' }

    // Se llega a cada enlace con el teclado (Mayús+Tab y Tab): así casa :focus-visible
    await second.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(first).toBeFocused()
    // transition-colors también anima outline-color: se espera al color final
    await expect.poll(() => ring(first)).toEqual(whiteRing)
    await page.keyboard.press('Tab')
    await expect(second).toBeFocused()
    await expect.poll(() => ring(second)).toEqual(whiteRing)
  })
})

test.describe('T8 · Del papel al dato · scrub en pantallas bajas (§3.6: scrub desde 600 px de alto)', () => {
  // `fits`: 'panel' si cabe el panel entero; 'rows' si caben las 6 filas pero a
  // 600 px de alto el marco, más alto que la pantalla, deja bajo el borde parte
  // del relleno inferior del panel (hasta 8 px a 1024×600 y 13 px en la franja
  // md estrecha). Nunca una fila.
  for (const { viewport, fits } of [
    { viewport: { width: 1280, height: 600 }, fits: 'panel' }, // el alto mínimo del modo scrub
    { viewport: { width: 1366, height: 657 }, fits: 'panel' }, // 1366×768 con la barra del navegador
    { viewport: { width: 1024, height: 600 }, fits: 'rows' }, // tableta apaisada: el marco crece
    { viewport: { width: 1024, height: 768 }, fits: 'panel' }, // entre 45 y 48rem de alto (revisión de T8, ronda 2)
    // Franja md estrecha (hasta 56rem de ancho; revisión de T8, ronda 6): la
    // columna del texto y del panel mide 272–325 px y, sin compactar más, el
    // marco fijo dejaba hasta tres filas bajo el borde durante todo el recorrido
    { viewport: { width: 768, height: 600 }, fits: 'rows' },
    { viewport: { width: 853, height: 600 }, fits: 'rows' },
    { viewport: { width: 800, height: 790 }, fits: 'panel' }, // entre 48 y 54rem de alto
    { viewport: { width: 768, height: 800 }, fits: 'panel' },
  ] as const) {
    test(`a ${viewport.width}×${viewport.height} nada queda bajo el encabezado ni recortado`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/es')
      await waitForHydration(page)
      const section = page.locator(`#${es.dossier.sectionId}`)
      await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
      /** Scroll al avance `progress` (0→1) del contenedor fijo. */
      const scrollToProgress = async (progress: number) =>
        scrollToY(
          page,
          await section.evaluate((el, p) => {
            const rect = el.getBoundingClientRect()
            return window.scrollY + rect.top + p * (rect.height - window.innerHeight)
          }, progress)
        )
      await scrollToProgress(0.5)

      // El marco sticky no recorta: si el contenido no cabe, crece (stage:h-auto)
      const frame = section.locator('[data-stage-frame]')
      expect(await frame.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true)
      const eyebrow = await section.getByText(es.dossier.eyebrow, { exact: true }).boundingBox()
      expect(eyebrow!.y, 'el eyebrow queda bajo el encabezado fijo de 64 px').toBeGreaterThanOrEqual(64)
      const lastRow = await section.locator('[data-dossier-row]').last().boundingBox()
      expect(lastRow!.y + lastRow!.height, 'la última fila del panel se sale del viewport').toBeLessThanOrEqual(viewport.height)
      if (fits === 'panel') {
        // Y el panel entero, con su relleno y su borde inferior: si no, parece cortado
        const panel = await section.locator('ol').locator('..').boundingBox()
        expect(panel!.y + panel!.height, 'el pie del panel se sale del viewport').toBeLessThanOrEqual(viewport.height)
      }

      // Con el último campo en proceso (el recuadro azul en el papel), su fila
      // «Procesando» se ve entera, bajo el encabezado y dentro de la pantalla
      const last = 5.5 / 6.6
      expect(extractionAt(last)).toEqual({ done: DOSSIER_FIELD_COUNT - 1, active: DOSSIER_FIELD_COUNT - 1 })
      await scrollToProgress(last)
      const activeRow = section.locator('[data-dossier-row]').last()
      await expect(activeRow).toHaveAttribute('data-state', 'active')
      await expect(section.locator('[data-dossier-field]').last()).toHaveCSS('stroke', ORBEXS_BLUE)
      await expect(activeRow.getByText(es.dossier.status.active, { exact: true })).toBeVisible()
      const box = await activeRow.boundingBox()
      expect(box!.y, 'la fila activa queda bajo el encabezado fijo de 64 px').toBeGreaterThanOrEqual(64)
      expect(box!.y + box!.height, 'la fila activa se sale del viewport').toBeLessThanOrEqual(viewport.height)
    })
  }
})

test.describe('T8 · Del papel al dato · tableta vertical en scrub (revisión de T8)', () => {
  // Entre 768 y ~870 px de ancho el panel mide unos 270–300 px: el contador se
  // partía en dos líneas y el alto de cada fila dependía de su estado, así que
  // el bloque centrado saltaba unos 8 px con cada campo terminado.
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 820, height: 1180 },
  ]) {
    test(`a ${viewport.width}×${viewport.height} el contador ocupa una línea y nada salta al avanzar`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/es')
      await waitForHydration(page)
      const section = page.locator(`#${es.dossier.sectionId}`)
      await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
      const counter = section.locator('[data-dossier-counter]')

      const layoutAt = async (progress: number, expectedCounter: string) => {
        const y = await section.evaluate((el, p) => {
          const rect = el.getBoundingClientRect()
          return window.scrollY + rect.top + p * (rect.height - window.innerHeight)
        }, progress)
        await scrollToY(page, y)
        await expect(counter).toHaveText(expectedCounter)
        return section.evaluate((el) => {
          const counterEl = el.querySelector('[data-dossier-counter]')!
          const range = document.createRange()
          range.selectNodeContents(counterEl)
          // El h2 se mide respecto al marco fijo, no al viewport: en p = 0 el sticky
          // puede no haberse enganchado aún por una fracción de píxel (según dónde
          // caiga #gobierno en el documento) y el redondeo cambiaría 1 px sin salto real.
          const frameTop = el.querySelector('[data-stage-frame]')!.getBoundingClientRect().top
          return {
            // Líneas del contador: una caja por línea de texto
            counterLines: new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size,
            h2Top: Math.round(el.querySelector('h2')!.getBoundingClientRect().top - frameTop),
            rows: Array.from(el.querySelectorAll('[data-dossier-row]'), (row) => Math.round(row.getBoundingClientRect().height)),
          }
        })
      }

      const start = await layoutAt(0, '00 / 06')
      const middle = await layoutAt(2.5 / 6.6, '02 / 06')
      const end = await layoutAt(0.95, '06 / 06')
      expect(start.counterLines).toBe(1)
      expect(middle.counterLines).toBe(1)
      expect(end.counterLines).toBe(1)
      expect(middle).toEqual(start)
      expect(end).toEqual(start)
    })
  }
})

test.describe('T8 · Del papel al dato · celular', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('imagen sobre el panel y los campos avanzan solos al entrar en pantalla', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')

    const image = await section.getByRole('img', { name: es.dossier.imageAlt }).boundingBox()
    const panel = await section.locator('[data-dossier-row]').first().boundingBox()
    expect(image && panel && image.y + image.height <= panel.y).toBe(true)

    const y = await section
      .locator('[data-dossier-field]')
      .first()
      .evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 200)
    await scrollToY(page, y)
    // Algún recuadro llega a estar activo, y en azul
    const active = section.locator('[data-dossier-field][data-state="active"]')
    await expect(active).toHaveCount(1)
    await expect(active).toHaveCSS('stroke', ORBEXS_BLUE)
    // El primer campo al entrar en pantalla y otro cada 700 ms (4,2 s en total).
    // Mientras avanza, nunca hay más de un azul visible (regla del azul, revisión de T8).
    const blues: number[] = []
    await expect
      .poll(
        async () => {
          blues.push(await countVisibleBlue(page))
          return section.locator('[data-dossier-row][data-state="done"]').count()
        },
        { timeout: 10_000, intervals: [100] }
      )
      .toBe(es.dossier.fields.length)
    expect(Math.max(...blues), `azules visibles durante la secuencia: ${blues.join(',')}`).toBeLessThanOrEqual(1)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06')
    await expectVisibleStatus(section.locator('[data-dossier-row]'), Array(es.dossier.fields.length).fill('done'))
  })

  test('en celular apaisado (667×375) la secuencia también arranca y termina (revisión de T8, ronda 2)', async ({ page }) => {
    const viewport = { width: 667, height: 375 }
    await page.setViewportSize(viewport)
    await page.goto('/es')
    await waitForHydration(page)
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')

    // El marco (aspect-[4/5] a todo el ancho) mide más del doble del viewport:
    // nunca se ve al 50 %, así que el disparador no puede depender de su alto.
    const frame = section.locator('.focal-frame').locator('..')
    const frameBox = await frame.boundingBox()
    expect(frameBox!.height).toBeGreaterThan(2 * viewport.height)
    // Centro del marco en el centro del viewport
    const y = await frame.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    })
    await scrollToY(page, y)

    await expect(section.locator('[data-dossier-field][data-state="active"]')).toHaveCount(1)
    await expect
      .poll(() => section.locator('[data-dossier-row][data-state="done"]').count(), { timeout: 10_000 })
      .toBe(es.dossier.fields.length)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06')
    await expectVisibleStatus(section.locator('[data-dossier-row]'), Array(es.dossier.fields.length).fill('done'))
  })
})

/** /es a ese tamaño, hidratada, con la sección en modo inView. */
async function openDossierInView(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport)
  await page.goto('/es')
  // Tras hidratar: el efecto de montaje de SmoothScroll ya no deshace los scrolls de la prueba.
  await waitForHydration(page)
  const section = page.locator(`#${es.dossier.sectionId}`)
  await expect(section).toHaveAttribute('data-stage-mode', 'inView')
  return section
}

/** Borde superior (respecto al viewport) de la región que ocupan los 6 recuadros. */
function fieldsTop(section: Locator) {
  return section
    .locator('[data-dossier-field]')
    .evaluateAll((els) => Math.min(...els.map((el) => el.getBoundingClientRect().top)))
}

/**
 * Scroll que deja el borde superior de la región de los campos `inset` px dentro
 * de la franja central (margen de −25 % arriba y abajo: el disparador de inView).
 */
async function fieldsIntoBandY(page: Page, section: Locator, viewportHeight: number, inset = 10) {
  const bandBottom = viewportHeight * 0.75
  return (await page.evaluate(() => window.scrollY)) + (await fieldsTop(section)) - (bandBottom - inset)
}

/**
 * WebKit no calculaba la caja de los destinos SVG en IntersectionObserver: en
 * IntersectionObserver.cpp, «FIXME: Implement for SVG etc.» y una caja vacía
 * (aún en la rama safari-7624-branch, de Safari 26; los navegadores de iOS usan
 * WebKit). Un hijo del <svg>, como un <rect>, no se cruza nunca con nada. Se
 * emula en Chromium: observe() ignora esos destinos (revisión de T8, ronda 4).
 */
async function emulateWebKitSvgTargets(page: Page) {
  await page.addInitScript(() => {
    const observe = IntersectionObserver.prototype.observe
    IntersectionObserver.prototype.observe = function (this: IntersectionObserver, target: Element) {
      if (target instanceof SVGElement && !(target instanceof SVGSVGElement)) return
      observe.call(this, target)
    }
  })
}

/**
 * Baja sin parar a `speed` px/s (un scroll instantáneo por frame), desde que la
 * sección asoma por abajo hasta dejar el panel a 80 px del borde superior. Por
 * recuadro, dice si se vio entero bajo el encabezado fijo de 64 px al encenderse
 * en azul y también al terminar su fundido de 200 ms (fadeDuration de
 * DossierStage). Un recuadro que no llega a encenderse cuenta como no visto.
 */
async function scrollThroughDossier(page: Page, section: Locator, speed: number): Promise<boolean[]> {
  const panel = section.locator('ol').locator('..')
  const from = await section.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - window.innerHeight)
  const to = await panel.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 80)
  await scrollToY(page, from)
  return section.evaluate(
    (el, { from, to, speed, header, fade, patience }) =>
      new Promise<boolean[]>((resolve) => {
        const fields = Array.from(el.querySelectorAll('[data-dossier-field]'))
        const whole = (field: Element) => {
          const rect = field.getBoundingClientRect()
          return rect.top >= header && rect.bottom <= window.innerHeight
        }
        const lit = new Set<number>()
        const seen = new Map<number, boolean>()
        const report = () => {
          observer.disconnect()
          resolve(fields.map((_, i) => seen.get(i) ?? false))
        }
        let scrolled = false
        const settle = () => {
          if (scrolled && seen.size === fields.length) report()
        }
        const observer = new MutationObserver(() => {
          fields.forEach((field, i) => {
            if (lit.has(i) || field.getAttribute('data-state') !== 'active') return
            lit.add(i)
            const atStart = whole(field)
            window.setTimeout(() => {
              seen.set(i, atStart && whole(field))
              settle()
            }, fade)
          })
        })
        observer.observe(el, { attributes: true, attributeFilter: ['data-state'], subtree: true })
        const start = performance.now()
        const frame = (now: number) => {
          const y = Math.min(to, from + (Math.max(0, now - start) / 1000) * speed)
          window.scrollTo({ top: y, behavior: 'instant' })
          if (y < to) {
            requestAnimationFrame(frame)
            return
          }
          scrolled = true
          settle()
          // Si algún recuadro no llega a encenderse, no se espera sin fin
          window.setTimeout(report, patience)
        }
        requestAnimationFrame(frame)
      }),
    { from, to, speed, header: 64, fade: 200, patience: (DOSSIER_FIELD_COUNT + 2) * DOSSIER_STEP_MS }
  )
}

test.describe('T8 · Del papel al dato · celular: una vez disparada, la secuencia llega al final (revisión de T8, ronda 3)', () => {
  // En celular el panel va debajo de la imagen: quien baja a leerlo saca los
  // campos de la mitad central del viewport antes de que terminen los ~4 s de
  // la secuencia. Antes se pausaba y el panel se quedaba a medias (p. ej.
  // «02 / 06» con una fila «Procesando» fija); y si se llegaba al panel de un
  // salto, ni arrancaba.
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 667, height: 375 }, // celular apaisado: el marco mide más del doble del viewport
  ]) {
    test(`a ${viewport.width}×${viewport.height}, bajando hasta el panel a ritmo de lectura, termina en «06 / 06»`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      const counter = section.locator('[data-dossier-counter]')
      await expect(counter).toHaveText('00 / 06')
      // Desde que la sección asoma por abajo hasta dejar el panel entero bajo el
      // encabezado (borde superior a 80 px), 60 px cada ~100 ms: unos 450 px/s.
      const panel = section.locator('ol').locator('..')
      const from = await section.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - window.innerHeight)
      const to = await panel.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 80)
      for (let y = from; y < to; y += 60) {
        await scrollToY(page, y)
        await page.waitForTimeout(100) // el ritmo del lector, no la espera de un estado
      }
      await scrollToY(page, to)
      // Los campos ya quedaron por encima de la franja central, y el panel entero a la vista
      expect(await fieldsTop(section)).toBeLessThan(0)
      const box = await panel.boundingBox()
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
      await expect(counter).toHaveText('06 / 06', { timeout: 10_000 })
      await expectVisibleStatus(section.locator('[data-dossier-row]'), Array(es.dossier.fields.length).fill('done'))
    })

    test(`a ${viewport.width}×${viewport.height}, llegando al panel de un salto, arranca y termina en «06 / 06»`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      const counter = section.locator('[data-dossier-counter]')
      await expect(counter).toHaveText('00 / 06')
      // Directo al panel (buscar en la página, volver desde abajo…), sin pasar por los campos
      const panel = section.locator('ol').locator('..')
      await scrollToY(page, await panel.evaluate((el) => window.scrollY + el.getBoundingClientRect().top - 80))
      const lastField = await section.locator('[data-dossier-field]').last().boundingBox()
      expect(lastField!.y + lastField!.height, 'los campos quedan por encima de la franja central').toBeLessThan(
        viewport.height * 0.25
      )
      await expect(counter).toHaveText('06 / 06', { timeout: 10_000 })
      await expectVisibleStatus(section.locator('[data-dossier-row]'), Array(es.dossier.fields.length).fill('done'))
    })
  }

  // En celular apaisado (< 768 px de ancho) el marco mide 774–865 px y los campos
  // están entre el 26 % y el 58 % de su alto: cuando su borde superior entra en
  // la franja central, los campos siguen por debajo de la pantalla.
  for (const viewport of [
    { width: 667, height: 375 },
    { width: 740, height: 360 },
  ]) {
    test(`a ${viewport.width}×${viewport.height} arranca con los campos en pantalla, no al asomar el marco`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      const counter = section.locator('[data-dossier-counter]')
      const active = section.locator('[data-dossier-field][data-state="active"]')
      const bandBottom = viewport.height * 0.75

      // Borde superior del marco 10 px dentro de la franja (donde arrancaba antes)
      const frame = section.locator('.focal-frame').locator('..')
      await scrollToY(
        page,
        await frame.evaluate((el, b) => window.scrollY + el.getBoundingClientRect().top - (b - 10), bandBottom)
      )
      expect(await fieldsTop(section), 'los campos siguen bajo la pantalla').toBeGreaterThan(viewport.height)
      // Quien se detiene aquí a leer el texto y los enlaces no se pierde la
      // extracción: en más de dos pasos de la secuencia no arranca nada. La espera
      // es a propósito (se comprueba que el estado NO cambia), y la lectura es
      // inmediata, sin reintentos: un toHaveCount(0) esperaría a que la secuencia
      // terminara y pasaría igual.
      await page.waitForTimeout(2 * DOSSIER_STEP_MS + 300)
      expect(await active.count(), 'ningún recuadro activo con los campos fuera de la pantalla').toBe(0)
      expect(await counter.textContent()).toBe('00 / 06')

      // Al bajar hasta que la región de los campos entra 10 px en la franja,
      // arranca: el primer recuadro en activarse está en pantalla y bajo el
      // encabezado fijo de 64 px
      const scrollY = await page.evaluate(() => window.scrollY)
      await scrollToY(page, scrollY + (await fieldsTop(section)) - (bandBottom - 10))
      await expect(active).toHaveCount(1)
      const fields = section.locator('[data-dossier-field]')
      await expect(fields.first()).not.toHaveAttribute('data-state', 'idle')
      const first = await fields.first().boundingBox()
      expect(first!.y).toBeGreaterThanOrEqual(64)
      expect(first!.y + first!.height).toBeLessThanOrEqual(viewport.height)
      await expect(counter).toHaveText('06 / 06', { timeout: 10_000 })
    })
  }

  // El disparador es la franja central y es «una vez» (IN_VIEW_TRIGGER). Las
  // pruebas anteriores terminan con el panel dentro de la franja, que vuelve a
  // disparar: seguían en verde con una secuencia que se pausa al salir de ella
  // (el mayor de la ronda 3) o que arranca con asomar los campos (revisión de
  // T8, ronda 5).
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 667, height: 375 },
  ]) {
    test(`a ${viewport.width}×${viewport.height}, con los campos bajo la franja no arranca, y una vez disparada termina aunque se vuelva arriba`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      const counter = section.locator('[data-dossier-counter]')
      const active = section.locator('[data-dossier-field][data-state="active"]')
      const bandBottom = viewport.height * 0.75
      /** La región de los campos a la vista, pero bajo la franja: su borde superior al 90 % del alto. */
      const belowBand = async () => {
        await scrollToY(page, (await page.evaluate(() => window.scrollY)) + (await fieldsTop(section)) - viewport.height * 0.9)
        const top = await fieldsTop(section)
        expect(top, 'los campos asoman por abajo').toBeLessThan(viewport.height)
        expect(top, 'los campos quedan bajo la franja central').toBeGreaterThan(bandBottom)
        const panel = await section.locator('ol').locator('..').boundingBox()
        expect(panel!.y, 'el panel queda bajo la franja central').toBeGreaterThan(bandBottom)
      }

      // Los campos se ven, pero no han llegado a la franja: no arranca. La
      // espera es a propósito (se comprueba que el estado NO cambia) y las
      // lecturas, inmediatas, sin reintentos: un toHaveCount(0) esperaría a
      // que la secuencia terminara y pasaría igual.
      await belowBand()
      await page.waitForTimeout(2 * DOSSIER_STEP_MS + 300)
      expect(await active.count(), 'ningún recuadro activo con los campos bajo la franja').toBe(0)
      expect(await counter.textContent()).toBe('00 / 06')

      // Llegan a la franja: arranca
      await scrollToY(page, await fieldsIntoBandY(page, section, viewport.height))
      await expect(active).toHaveCount(1)

      // Se vuelve arriba, al mismo sitio: ni los campos ni el panel están en la
      // franja, y la secuencia sigue hasta el final en lugar de pausarse. Aquí
      // el estado SÍ cambia: se espera con reintentos (§3.7). Una secuencia
      // pausada se queda en «00 / 06» y agota el plazo.
      await belowBand()
      await expect(counter, 'una vez disparada, la secuencia llega al final').toHaveText('06 / 06', {
        timeout: 10_000,
      })
      await expect(active, 'y no deja ningún recuadro activo').toHaveCount(0)
    })
  }
})

test.describe('T8 · Del papel al dato · celular con el IntersectionObserver de WebKit (revisión de T8, ronda 4)', () => {
  // Con la región de los campos como <rect> dentro del SVG, en WebKit ese
  // disparador no se cruzaba nunca: la extracción solo arrancaba cuando el panel
  // llegaba a la franja central, con los campos ya fuera de la vista (en celular
  // apaisado, entre 300 y 600 px por encima de la pantalla).
  test.beforeEach(async ({ page }) => {
    await emulateWebKitSvgTargets(page)
  })

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 667, height: 375 },
    { width: 740, height: 360 },
  ]) {
    test(`a ${viewport.width}×${viewport.height}, arranca cuando los campos llegan a la franja central, sin esperar al panel`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      await scrollToY(page, await fieldsIntoBandY(page, section, viewport.height))
      const panel = await section.locator('ol').locator('..').boundingBox()
      expect(panel!.y, 'el panel sigue por debajo de la franja central').toBeGreaterThan(viewport.height * 0.75)

      await expect(section.locator('[data-dossier-field][data-state="active"]')).toHaveCount(1)
      const first = section.locator('[data-dossier-field]').first()
      await expect(first).not.toHaveAttribute('data-state', 'idle')
      const box = await first.boundingBox()
      expect(box!.y, 'el primer recuadro queda bajo el encabezado fijo de 64 px').toBeGreaterThanOrEqual(64)
      expect(box!.y + box!.height, 'y dentro de la pantalla').toBeLessThanOrEqual(viewport.height)
      await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06', { timeout: 10_000 })
    })
  }
})

test.describe('T8 · Del papel al dato · celular: el primer recuadro se enciende al dispararse (revisión de T8, ronda 4)', () => {
  // Antes el primer campo se encendía un paso después del disparo (el primer tic
  // de setInterval, a los 700 ms). Bajando sin parar, en celular apaisado los
  // campos ya estaban bajo el encabezado o fuera de la pantalla, y la extracción
  // entera, con el único azul, pasaba fuera de la vista.
  test('a 667×375, el primer recuadro se enciende en cuanto los campos entran en la franja central', async ({ page }) => {
    const viewport = { width: 667, height: 375 }
    const section = await openDossierInView(page, viewport)
    const target = await fieldsIntoBandY(page, section, viewport.height)
    // Tiempo desde el scroll hasta el primer recuadro activo, medido en la página
    const delay = await section.evaluate(
      (el, { target, timeout }) =>
        new Promise<number>((resolve) => {
          const start = performance.now()
          const finish = (value: number) => {
            observer.disconnect()
            window.clearTimeout(guard)
            resolve(value)
          }
          const observer = new MutationObserver(() => {
            if (el.querySelector('[data-dossier-field][data-state="active"]')) finish(performance.now() - start)
          })
          observer.observe(el, { attributes: true, attributeFilter: ['data-state'], subtree: true })
          const guard = window.setTimeout(() => finish(Number.POSITIVE_INFINITY), timeout)
          window.scrollTo({ top: target, behavior: 'instant' })
        }),
      { target, timeout: 2 * DOSSIER_STEP_MS }
    )
    expect(delay, `ms hasta el primer azul (un paso son ${DOSSIER_STEP_MS} ms)`).toBeLessThan(DOSSIER_STEP_MS / 2)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06', { timeout: 10_000 })
  })

  for (const viewport of [
    { width: 667, height: 375 },
    { width: 740, height: 360 },
  ]) {
    test(`a ${viewport.width}×${viewport.height}, bajando sin parar a ~250 px/s, algún recuadro se enciende entero a la vista`, async ({
      page,
    }) => {
      const section = await openDossierInView(page, viewport)
      const seen = await scrollThroughDossier(page, section, 250)
      expect(
        seen.filter(Boolean).length,
        `recuadros enteros bajo el encabezado al encenderse y tras su fundido: ${seen.map((s) => (s ? 'sí' : 'no')).join(', ')}`
      ).toBeGreaterThanOrEqual(1)
      await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06', { timeout: 10_000 })
    })
  }
})

test.describe('T8 · Del papel al dato · inglés (revisión 5)', () => {
  test('/en muestra el expediente traducido en #government', async ({ page }) => {
    expect(en.dossier.sectionId).toBe('government') // contrato §3.5
    expect(en.hero.nurtureCta.href).toBe(`#${en.dossier.sectionId}`)
    await page.goto('/en')
    const section = page.locator(`#${en.dossier.sectionId}`)
    await expect(section).toBeAttached()
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(en.dossier.title)
    await expect(section).toContainText(en.dossier.eyebrow)
    await expect(section).toContainText(en.dossier.counterLabel)
    await expect(section.locator('[data-dossier-row]').first()).toContainText(en.dossier.fields[0])
    await expect(section.getByRole('img', { name: en.dossier.imageAlt })).toBeAttached()
    await expect(section.getByRole('link', { name: en.dossier.links[0].label })).toHaveAttribute(
      'href',
      buildLocalePath('en', en.dossier.links[0].href)
    )
  })
})
