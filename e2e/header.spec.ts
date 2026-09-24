import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { buildLocalePath } from '../src/lib/i18n'
import { scrollToY, waitForFrames, waitForHydration } from './helpers'

/**
 * Encabezado y mega menú (diseño §6 y §12 prueba 3; traspaso "Encabezado").
 * Contrato §3.4: `.site-header[data-tone]` (ausente antes de hidratar; después
 * light | dark | menu), `[data-scrolled="true"]`, `[data-header-start="dark"]`
 * y el panel `#site-mega-menu`.
 */

const MEGA_MENU = '#site-mega-menu'
// Para el encabezado, toda sección que no está marcada como oscura es clara.
const LIGHT_SECTION = 'main section:not([data-header-theme="dark"])'
const investors = es.footer.companyLinks.find((link) => link.href === '/inversores')!
// Nombres accesibles de las dos <nav> (getNavLandmarkLabels en header/types.ts;
// las pruebas no importan componentes, contrato §3.4 y decisión 2 de la tarea 5).
const NAV_NAMES = { header: 'Principal', menu: 'Menú del sitio' }
const menuTriggers = es.nav.items.flatMap((item) => ('opensMenu' in item ? [item.name] : []))
// Primer enlace que recibe el foco al abrir el menú con cada botón: "Servicios"
// entra por el principio del panel y "Productos", por su bloque (RealTy).
const firstFocused: Record<string, string> = {
  [es.nav.items[0].name]: es.nav.platformLinks[0].name,
  [es.nav.items[1].name]: es.nav.productLinks[0].name,
}

/** Posición en el documento (px) del borde superior del primer elemento que casa con `selector`. */
function documentTop(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
}

test.describe('tono del encabezado', () => {
  test('al navegar de /es a /es/inversores por el footer, el encabezado queda oscuro', async ({ page }) => {
    await page.goto('/es')
    const header = page.locator('.site-header')
    // Antes de hidratar, el efecto de montaje de SmoothScroll desharía el scroll.
    await waitForHydration(page)

    // Sobre la primera sección clara de la home el tono es claro.
    await scrollToY(page, (await documentTop(page, LIGHT_SECTION)) + 1)
    await expect(header).toHaveAttribute('data-tone', 'light')

    // Marca en window: si el clic recargara la página, desaparecería.
    await page.evaluate(() => {
      Object.assign(window, { __clientNavigation: true })
    })
    await page.getByRole('contentinfo').getByRole('link', { name: investors.name, exact: true }).click()
    await expect(page).toHaveURL(/\/es\/inversores$/)
    // La página nueva empieza arriba (SmoothScroll, paso 2.11): el tono oscuro es el de su portada.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(header).toHaveAttribute('data-tone', 'dark')
    expect(await page.evaluate(() => '__clientNavigation' in window)).toBe(true)

    // El hook ya observa las secciones de la página nueva: una clara lo aclara y la portada lo oscurece.
    await scrollToY(page, (await documentTop(page, LIGHT_SECTION)) + 1)
    await expect(header).toHaveAttribute('data-tone', 'light')
    await expect(header).toHaveAttribute('data-scrolled', 'true')
    await scrollToY(page, 0)
    await expect(header).toHaveAttribute('data-tone', 'dark')
    await expect(header).not.toHaveAttribute('data-scrolled')
  })

  test('dos secciones oscuras contiguas mantienen el tono oscuro al pasar de una a otra', async ({ page }) => {
    await page.goto('/es/estudio-tiktok-live')
    const header = page.locator('.site-header')
    await expect(header).toHaveAttribute('data-tone', 'dark')

    // La portada del estudio va seguida de la franja del marquee, también oscura.
    await expect(page.locator('[data-header-start="dark"] + section')).toHaveAttribute('data-header-theme', 'dark')
    const heroBottom = await page
      .locator('[data-header-start="dark"]')
      .evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY)

    // 1) El borde entre las dos cruza la franja del encabezado: ambas quedan debajo.
    await scrollToY(page, heroBottom - 20)
    await expect(header).toHaveAttribute('data-tone', 'dark')
    // 2) La portada sale de la franja y llega sola en su callback; la siguiente sigue debajo.
    //    Decidir solo con las entradas del callback pintaría aquí el encabezado claro.
    await scrollToY(page, heroBottom + 10)
    await waitForFrames(page)
    await expect(header).toHaveAttribute('data-tone', 'dark')
  })

  test('sobre el footer, que es oscuro, el encabezado queda oscuro', async ({ page }) => {
    // En móvil el footer va en una columna y es más alto que la pantalla: su
    // borde superior puede llegar a la franja del encabezado.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/es/nosotros')
    const header = page.locator('.site-header')
    await waitForHydration(page)
    await expect(header).toHaveAttribute('data-tone', 'light')

    await scrollToY(page, (await documentTop(page, 'footer.site-footer')) + 1)
    await expect(header).toHaveAttribute('data-tone', 'dark')
  })

  test('el primer render del cliente coincide con el del servidor en /es/inversores', async ({ page }) => {
    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) hydrationErrors.push(message.text())
    })
    await page.goto('/es/inversores')
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', 'dark')
    expect(hydrationErrors).toEqual([])
  })
})

test.describe('navegación de cliente con scroll suave', () => {
  test('Next no avisa de scroll-behavior: smooth y la página nueva empieza arriba', async ({ page }) => {
    // Next 16 solo desactiva el scroll suave de <html> durante su propio scroll de
    // navegación si <html> lleva data-scroll-behavior="smooth"; si no, avisa en desarrollo.
    const scrollWarnings: string[] = []
    page.on('console', (message) => {
      if (/scroll-behavior/i.test(message.text())) scrollWarnings.push(message.text())
    })
    await page.goto('/es')
    await waitForHydration(page)
    await expect(page.locator('html')).toHaveAttribute('data-scroll-behavior', 'smooth')

    await scrollToY(page, (await documentTop(page, LIGHT_SECTION)) + 1)
    await page.getByRole('navigation').getByRole('link', { name: es.nav.items[2].name, exact: true }).click()
    await expect(page).toHaveURL(/\/es\/nosotros$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await waitForFrames(page)
    expect(scrollWarnings).toEqual([])
  })
})

test.describe('tono del encabezado sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('en /es/inversores nace oscuro: texto blanco sobre fondo transparente', async ({ page }) => {
    await page.goto('/es/inversores')
    const header = page.locator('.site-header')
    await expect(header).not.toHaveAttribute('data-tone')
    await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('en /es/inversores, al bajar de la portada, el encabezado se vuelve una barra oscura legible', async ({ page }) => {
    await page.goto('/es/inversores')
    const header = page.locator('.site-header')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    // Debajo de la portada hay secciones claras: sin data-scrolled (nadie lo
    // pone sin JavaScript), un encabezado transparente quedaría blanco sobre blanco.
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    await expect(header).toHaveCSS('background-color', 'rgba(10, 10, 10, 0.9)')
    await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)')
  })

  test('en /es/nosotros, que empieza en claro, nace claro', async ({ page }) => {
    await page.goto('/es/nosotros')
    const header = page.locator('.site-header')
    await expect(header).toHaveCSS('color', 'rgb(10, 10, 10)')
    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  })
})

test.describe('mega menú', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Servicios y Productos abren el mismo menú: aria, foco y Escape', async ({ page }) => {
    expect(menuTriggers).toEqual([es.nav.items[0].name, es.nav.items[1].name])
    await page.goto('/es')
    const header = page.locator('.site-header')
    await expect(header).toHaveAttribute('data-tone', /^(light|dark)$/)
    const menu = page.locator(MEGA_MENU)

    for (const name of menuTriggers) {
      const trigger = page.getByRole('navigation').getByRole('button', { name, exact: true })
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).not.toHaveAttribute('aria-controls')
      await expect(menu).toHaveCount(0)

      await trigger.click()
      await expect(menu).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(trigger).toHaveAttribute('aria-controls', 'site-mega-menu')
      await expect(header).toHaveAttribute('data-tone', 'menu')
      await expect(menu.getByRole('link', { name: firstFocused[name] })).toBeFocused()

      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).not.toHaveAttribute('aria-controls')
      await expect(trigger).toBeFocused()
    }

    // El foco vuelve al botón que abrió el menú, también cuando fue la hamburguesa.
    const hamburger = page.getByRole('button', { name: es.nav.menuLabel })
    await hamburger.click()
    await expect(hamburger).toHaveAttribute('aria-controls', 'site-mega-menu')
    await expect(menu.getByRole('link').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(hamburger).toBeFocused()
  })

  test('con teclado, el anillo de foco se ve blanco en el panel y en el footer', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    /** Enlace con el foco: si casa con :focus-visible y el estilo, grosor y color de su contorno. */
    const focusRing = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        const style = getComputedStyle(el)
        return {
          name: el.textContent?.trim() ?? '',
          visible: el.matches(':focus-visible'),
          style: style.outlineStyle,
          width: style.outlineWidth,
          color: style.outlineColor,
        }
      })
    // Un anillo que se ve: contorno sólido de 2 px (globals.css) y blanco sobre #0a0a0a.
    const whiteRing = { visible: true, style: 'solid', width: '2px', color: 'rgb(255, 255, 255)' }

    // Enter sobre "Productos" abre el panel (fondo #0a0a0a) y Tab recorre sus enlaces.
    await page.getByRole('navigation').getByRole('button', { name: es.nav.items[1].name, exact: true }).focus()
    await page.keyboard.press('Enter')
    const menu = page.locator(MEGA_MENU)
    await expect(menu.getByRole('link', { name: es.nav.productLinks[0].name })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(menu.getByRole('link', { name: es.nav.productLinks[1].name })).toBeFocused()
    await expect.poll(focusRing).toMatchObject(whiteRing)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)

    // El footer también es oscuro.
    const footerLinks = page.getByRole('contentinfo').getByRole('link')
    await footerLinks.first().focus()
    await page.keyboard.press('Tab')
    await expect(footerLinks.nth(1)).toBeFocused()
    // Sus enlaces llevan transition-colors, que también anima outline-color: se espera al color final.
    await expect.poll(focusRing).toMatchObject(whiteRing)
  })

  test('con el menú abierto, Tab no deja el foco en el contenido oculto bajo el panel', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    await page.getByRole('navigation').getByRole('button', { name: es.nav.items[0].name, exact: true }).focus()
    await page.keyboard.press('Enter')
    const menu = page.locator(MEGA_MENU)
    await expect(menu.getByRole('link').first()).toBeFocused()

    // Recorre el panel entero y un poco más: el foco sale del último enlace.
    const steps = (await menu.getByRole('link').count()) + 3
    for (let step = 0; step < steps; step++) {
      await page.keyboard.press('Tab')
      const underPanel = await page.evaluate(
        () => document.activeElement?.closest('main, footer')?.tagName ?? null
      )
      expect(underPanel, `Tab n.º ${step + 1}`).toBeNull()
    }

    // Al cerrarse, el contenido vuelve a ser alcanzable.
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    await expect(page.locator('footer.site-footer')).not.toHaveAttribute('inert')
  })

  test('con el menú abierto, «Empresa» navega y cierra el menú', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    const nav = page.getByRole('navigation')
    const company = nav.getByRole('link', { name: es.nav.items[2].name, exact: true })
    const menu = page.locator(MEGA_MENU)

    await nav.getByRole('button', { name: es.nav.items[0].name, exact: true }).click()
    await expect(menu).toBeVisible()
    await company.click()
    await expect(page).toHaveURL(/\/es\/nosotros$/)
    // La página nueva queda a la vista y utilizable: sin panel, sin inert y con scroll.
    await expect(menu).toHaveCount(0)
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    await expect(page.locator('footer.site-footer')).not.toHaveAttribute('inert')
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
    await expect(page.locator('.site-header')).not.toHaveAttribute('data-tone', 'menu')

    // Ya en /es/nosotros, «Empresa» apunta a la página actual: la ruta no cambia y el clic lo cierra igual.
    await nav.getByRole('button', { name: es.nav.items[1].name, exact: true }).click()
    await expect(menu).toBeVisible()
    await company.click()
    await expect(menu).toHaveCount(0)
    await expect(page.locator('main')).not.toHaveAttribute('inert')
  })

  test('con el menú abierto, Atrás vuelve a la página anterior y cierra el menú', async ({ page }) => {
    await page.goto('/es')
    await waitForHydration(page)
    await page.getByRole('navigation').getByRole('link', { name: es.nav.items[2].name, exact: true }).click()
    await expect(page).toHaveURL(/\/es\/nosotros$/)
    // Marca en window: Atrás debe ser una navegación de cliente (sin recarga), con el encabezado montado.
    await page.evaluate(() => {
      Object.assign(window, { __clientNavigation: true })
    })

    const menu = page.locator(MEGA_MENU)
    await page.getByRole('button', { name: es.nav.menuLabel }).click()
    await expect(menu).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/\/es$/)
    await expect(menu).toHaveCount(0)
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
    expect(await page.evaluate(() => '__clientNavigation' in window)).toBe(true)
  })

  test('el bloque Productos enlaza RealTy y Orbexs Live Studio, sin punto magenta', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark)$/)
    await page.getByRole('navigation').getByRole('button', { name: es.nav.items[1].name, exact: true }).click()
    const menu = page.locator(MEGA_MENU)
    await expect(menu).toBeVisible()

    const [realty, studio] = es.nav.productLinks
    await expect(menu.getByRole('link', { name: realty.name })).toHaveAttribute('href', '/es/realty')
    await expect(menu.getByRole('link', { name: studio.name })).toHaveAttribute('href', '/es/estudio-tiktok-live')
    // RealTy salió de Plataforma: aparece una sola vez en todo el menú.
    await expect(menu.getByRole('link', { name: realty.name })).toHaveCount(1)
    // Live Studio pierde el punto magenta en la nav, el menú y el footer.
    await expect(page.locator(`.site-header .live-dot, ${MEGA_MENU} .live-dot, footer .live-dot`)).toHaveCount(0)
  })

  test('el panel es una región de navegación con nombre propio, también en móvil', async ({ page }) => {
    const menu = page.locator(MEGA_MENU)
    await page.goto('/es')
    await waitForHydration(page)

    // Escritorio, menú abierto: conviven la nav del encabezado y la del panel, cada una con su nombre.
    await page.getByRole('navigation').getByRole('button', { name: es.nav.items[1].name, exact: true }).click()
    await expect(menu).toBeVisible()
    await expect(page.getByRole('navigation')).toHaveCount(2)
    await expect(page.getByRole('banner').getByRole('navigation', { name: NAV_NAMES.header, exact: true })).toBeVisible()
    await expect(menu.getByRole('navigation', { name: NAV_NAMES.menu, exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)

    // Móvil: la nav del encabezado no se muestra y el panel de la hamburguesa es la navegación.
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('navigation')).toHaveCount(0)
    await page.getByRole('button', { name: es.nav.menuLabel }).click()
    const menuNav = page.getByRole('navigation', { name: NAV_NAMES.menu, exact: true })
    await expect(menuNav).toBeVisible()
    await expect(menuNav.getByRole('link', { name: es.nav.platformLinks[0].name })).toBeVisible()
    await expect(menuNav.getByRole('link', { name: es.nav.productLinks[0].name })).toHaveAttribute('href', '/es/realty')
  })
})

test.describe('foco y ancho del encabezado', () => {
  test('el logo no añade una parada de tabulación: del enlace del logo se pasa a «Servicios»', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/es/inversores')
    await waitForHydration(page)
    const logoLink = page.getByRole('banner').getByRole('link').first()
    await expect(logoLink).toHaveAttribute('href', '/es')

    await logoLink.focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('navigation').getByRole('button', { name: es.nav.items[0].name, exact: true })).toBeFocused()
  })

  test('a 320 px (WCAG 1.4.10) las acciones no tocan el logo ni el margen derecho', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    for (const locale of ['es', 'en'] as const) {
      await page.goto(buildLocalePath(locale, '/'))
      await waitForHydration(page)
      const box = await page.evaluate(() => {
        const bar = document.querySelector('.site-header > div')!
        const [logo, , actions] = Array.from(bar.children).map((child) => child.getBoundingClientRect())
        return { logoRight: logo.right, actionsLeft: actions.left, actionsRight: actions.right }
      })
      // px-4: 16 px de margen a cada lado; al menos 8 px entre el logo y las acciones.
      expect(box.actionsLeft - box.logoRight, locale).toBeGreaterThanOrEqual(8)
      expect(box.actionsRight, locale).toBeLessThanOrEqual(320 - 16)
      expect(await page.evaluate(() => document.documentElement.scrollWidth), locale).toBe(320)
    }
  })
})

test.describe('navegación en inglés (revisión 5 del traspaso)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('la nav, el mega menú y el footer de /en muestran las claves nuevas traducidas', async ({ page }) => {
    await page.goto('/en')
    await waitForHydration(page)
    const nav = page.getByRole('navigation')
    const [services, products, company] = en.nav.items
    await expect(nav.getByRole('button', { name: services.name, exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: products.name, exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: company.name, exact: true })).toHaveAttribute('href', buildLocalePath('en', '/nosotros'))

    await nav.getByRole('button', { name: products.name, exact: true }).click()
    const menu = page.locator(MEGA_MENU)
    await expect(menu).toBeVisible()
    for (const link of en.nav.productLinks) {
      const item = menu.getByRole('link', { name: link.name })
      await expect(item).toHaveAttribute('href', buildLocalePath('en', link.href))
      await expect(item).toContainText(link.description)
    }
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)

    const footer = page.getByRole('contentinfo')
    await expect(footer).toContainText(en.footer.solutions)
    await expect(footer).toContainText(en.footer.products)
    for (const link of en.footer.productLinks) {
      await expect(footer.getByRole('link', { name: link.name, exact: true }).first()).toHaveAttribute('href', buildLocalePath('en', link.href))
    }
  })
})
