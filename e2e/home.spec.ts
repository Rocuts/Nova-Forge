import { test, expect, type Locator, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { countVisibleBlue, effectiveOpacity, scrollToY, waitForHydration } from './helpers'

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
