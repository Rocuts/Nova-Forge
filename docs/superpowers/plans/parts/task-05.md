## Tarea 5 — Navegación y encabezado

**Objetivo:** la nav pasa a "Servicios · Productos · Empresa" (los dos primeros abren el mismo mega menú, que gana el bloque PRODUCTOS bajo Soluciones), el encabezado se pinta con variables CSS según `data-tone` / `data-scrolled` y nace con el tono correcto desde el servidor (también sin JavaScript), el hook de secciones oscuras se corrige (conjunto de secciones + nueva suscripción en cada ruta) y el footer, `seo.ts` y `llms.txt` leen la nueva forma de la nav. Diseño §6 y §12 (prueba 3); traspaso "Encabezado" y "Navegación y footer".

**Depende de:** T3 y T4, ya integradas en `redesign/home` (T3 toca `es.ts`/`en.ts`; T4 toca `live-studio/Hero.tsx` y crea `e2e/helpers.ts` con `effectiveOpacity` y `scrollToY`). Va en paralelo con T2: no comparten archivos.

**Archivos compartidos** (plan §2): `es.ts`/`en.ts` (T3 antes; T6–T11 después), `src/app/globals.css` (T6 y T10 después), `e2e/smoke.spec.ts` (T6, T7, T9 y T10 después), `live-studio/Hero.tsx` (T4 antes), `e2e/helpers.ts` (T4 lo crea; esta tarea le añade `waitForFrames`), `realty/Hero.tsx` (T9 después exporta `ConsoleFrame`), `e2e/a11y.spec.ts` (solo esta tarea). Los bloques "Antes" de esta sección se tomaron de `b65e497`; T3 y T4 no tocan esas líneas. Si alguno no casa exacto, aplicar el mismo cambio sobre el código vigente sin tocar lo demás.

**Worktree y puerto:**
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task5 -b wt/task5 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task5/node_modules
cd /home/user/wt/task5            # todas las órdenes de esta tarea, desde aquí
# Servidor de desarrollo de esta tarea: PORT=3050 (Playwright lo arranca solo).
```

**API verificada en `node_modules`** (Next 16.3.1, React 19.2.3, motion 12.35.2, Tailwind 4.2.1, tailwind-merge 3.5.0, Playwright 1.58.2, eslint-plugin-react-hooks 7.0.1):
- `usePathname` se importa de `next/navigation` y es un hook de cliente (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md`). Con rewrites (los slugs ingleses), el valor del cliente puede diferir del del servidor. Por eso aquí solo sirve como dependencia del efecto y para comparar, y nunca se pinta en el HTML. No hay `cacheComponents`, así que no requiere `Suspense` (`SmoothScroll` y `LanguageSwitcher` ya lo usan en el layout).
- `AnimatePresence`, `useScroll` y `useMotionValueEvent` salen de `motion/react`, y `m.div` acepta `ref` (React 19).
- `tailwind-merge` 3.5: `cn("bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] focus-visible:ring-[#0a0a0a] …", "bg-[color:var(--hdr-cta-bg)] text-[color:var(--hdr-cta-fg)] hover:bg-[color:var(--hdr-cta-bg-hover)] focus-visible:ring-[color:var(--hdr-focus)]")` elimina los cuatro colores del `Button` (comprobado con node).
- Tailwind 4.2 compila `aria-expanded:text-[color:var(…)]` → `&[aria-expanded="true"]`, `data-[scrolled=true]:backdrop-blur-sm` → `&[data-scrolled="true"]` y `[&_a]:border-[color:var(…)]` → `& a`, con especificidad (0,1,1). Esta última gana a `text-[#525252]` y `border-[#e5e5e5]` del `LanguageSwitcher`, que son (0,1,0), sin tocar ese componente.
- Playwright 1.58: `expect(locator).toHaveAttribute(name)` sin valor comprueba presencia (`not.` para ausencia). `javaScriptEnabled` es opción de primer nivel de `test.use`.
- Reglas activas de `react-hooks` 7 (`set-state-in-effect`, `refs`, `immutability`, `purity`…): el código de esta sección pasa `eslint` y `tsc --noEmit` en una copia del árbol con estos cambios y el `e2e/helpers.ts` de T4.

### Archivos
- **Crear:** `e2e/header.spec.ts`
- **Reescribir (código completo abajo):** `src/components/layout/Header.tsx`, `src/components/layout/header/MegaMenu.tsx`, `src/components/layout/header/types.ts`, `src/components/layout/header/useDarkSectionDetection.ts`, `src/components/layout/Footer.tsx`, `e2e/a11y.spec.ts`
- **Modificar (bloques Antes → Después):** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts`, `src/app/globals.css`, `src/lib/seo.ts`, `src/app/llms.txt/route.ts`, `src/components/sections/realty/Hero.tsx`, `src/components/sections/InvestorsPage.tsx`, `src/components/sections/live-studio/Hero.tsx`, `e2e/smoke.spec.ts`, `e2e/helpers.ts`
- **Sin cambios:** `src/components/layout/header/HamburgerIcon.tsx`, `src/components/ui/LanguageSwitcher.tsx`, `src/components/ui/Button.tsx` y `src/app/[locale]/layout.tsx` (sigue pasando `dict.nav` y `dict.footer`)
- **Borrar:** —

---

### Paso 1 — Prueba primero

#### 1.1 `e2e/helpers.ts`: añadir `waitForFrames`

Añadir al final del archivo que creó T4, que ya importa `type { Locator, Page }` de `@playwright/test`. No hace falta ningún import nuevo.

```ts
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
```

#### 1.2 Crear `e2e/header.spec.ts`

```ts
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import { scrollToY, waitForFrames } from './helpers'

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
const menuTriggers = es.nav.items.flatMap((item) => ('opensMenu' in item ? [item.name] : []))

/** Posición en el documento (px) del borde superior del primer elemento que casa con `selector`. */
function documentTop(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
}

test.describe('tono del encabezado', () => {
  test('al navegar de /es a /es/inversores por el footer, el encabezado queda oscuro', async ({ page }) => {
    await page.goto('/es')
    const header = page.locator('.site-header')

    // Sobre la primera sección clara de la home el tono es claro (y el encabezado ya hidrató).
    await scrollToY(page, (await documentTop(page, LIGHT_SECTION)) + 1)
    await expect(header).toHaveAttribute('data-tone', 'light')

    // Marca en window: si el clic recargara la página, desaparecería.
    await page.evaluate(() => {
      Object.assign(window, { __clientNavigation: true })
    })
    await page.getByRole('contentinfo').getByRole('link', { name: investors.name, exact: true }).click()
    await expect(page).toHaveURL(/\/es\/inversores$/)
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

test.describe('tono del encabezado sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('en /es/inversores nace oscuro: texto blanco sobre fondo transparente', async ({ page }) => {
    await page.goto('/es/inversores')
    const header = page.locator('.site-header')
    await expect(header).not.toHaveAttribute('data-tone')
    await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
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
      await expect(menu.getByRole('link').first()).toBeFocused()

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
})
```

Qué cubre cada prueba:
- **Navegación de cliente** (diseño §12, prueba 3): el clic en "Inversores" del footer es un `TransitionLink` (`router.push`); la marca en `window` demuestra que no hubo recarga. Después comprueba que el hook observa las secciones de la página nueva (el bug original seguía observando las de `/es`).
- **Secciones oscuras contiguas** (segundo bug del traspaso): en `/es/estudio-tiktok-live` la portada y el marquee son oscuros y se tocan. En el paso 2 el callback trae solo la portada saliendo; el código actual pintaría el encabezado claro. `waitForFrames` deja llegar ese callback y el render de React antes de afirmar que sigue oscuro.
- **Hidratación:** el hook devuelve `null` hasta saber; el primer render del cliente no lleva `data-tone`, igual que el HTML del servidor.
- **Sin JavaScript** (revisión 4 del traspaso, parte de páginas no-home; la home la cubre T6): regla `body:has([data-header-start="dark"]) .site-header:not([data-tone])` en `/es/inversores`, y el caso claro en `/es/nosotros` para verificar que la regla no se aplica de más.
- **Mega menú:** `aria-expanded`, `aria-controls` solo con el panel abierto, foco al primer enlace, Escape cierra y devuelve el foco al botón que lo abrió (los tres disparadores), bloque Productos y ausencia del punto magenta.

#### 1.3 `e2e/smoke.spec.ts`

**(a)** Test `navigation works on desktop` completo. Antes:
```ts
test('navigation works on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/es')

  // First nav item has children → rendered as a mega-menu trigger button
  const servicesTrigger = page.getByRole('navigation').getByRole('button', { name: nav.items[0].name })
  await expect(servicesTrigger).toBeVisible()

  // Second nav item is a direct link
  await expect(page.getByRole('navigation').getByRole('link', { name: nav.items[1].name })).toBeVisible()

  // Opening the mega menu reveals platform links
  await servicesTrigger.click()
  const firstPlatformLink = nav.items[0].platformChildren![0]
  await expect(page.getByRole('link', { name: new RegExp(firstPlatformLink.name) }).first()).toBeVisible()
})
```
Después:
```ts
test('navigation works on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/es')

  // "Servicios" and "Productos" open the mega menu; "Empresa" is a direct link
  const servicesTrigger = page.getByRole('navigation').getByRole('button', { name: nav.items[0].name, exact: true })
  await expect(servicesTrigger).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('button', { name: nav.items[1].name, exact: true })).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link', { name: nav.items[2].name })).toHaveAttribute('href', '/es/nosotros')

  // Opening the mega menu reveals platform links
  await servicesTrigger.click()
  const firstPlatformLink = nav.platformLinks[0]
  await expect(page.locator('#site-mega-menu').getByRole('link', { name: new RegExp(firstPlatformLink.name) })).toBeVisible()
})
```

**(b)** Test `mobile menu works` (tras aplicar (a), esta línea es la única que queda con `platformChildren`). Antes:
```ts
  const firstPlatformLink = nav.items[0].platformChildren![0]
```
Después:
```ts
  const firstPlatformLink = nav.platformLinks[0]
```

**(c)** Test `home page links to the live studio division` (el enlace del teaser se conserva hasta T9; la parte de la nav sale del mega menú) y test nuevo de `llms.txt` justo después. Antes:
```ts
test('home page links to the live studio division', async ({ page }) => {
  await page.goto('/es')
  const navLink = page.getByRole('navigation').getByRole('link', { name: /Live Studio/ })
  await expect(navLink).toHaveAttribute('href', '/es/estudio-tiktok-live')
  await expect(page.getByRole('link', { name: es.liveStudioTeaser.action.label })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
})
```
Después:
```ts
test('home page links to the live studio division', async ({ page }) => {
  await page.goto('/es')

  // The nav reaches the studio through the mega menu's Products block
  await page.getByRole('navigation').getByRole('button', { name: nav.items[1].name, exact: true }).click()
  const studio = nav.productLinks.find((link) => link.href === '/estudio-tiktok-live')!
  await expect(page.locator('#site-mega-menu').getByRole('link', { name: studio.name })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
  await page.keyboard.press('Escape')

  await expect(page.getByRole('link', { name: es.liveStudioTeaser.action.label })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
})

test('llms.txt lists the platform, solutions and products from the nav', async ({ request }) => {
  const body = await (await request.get('/llms.txt')).text()
  expect(body).toContain('## Productos (Español)')
  expect(body).toContain('## Products (English)')
  for (const link of [...nav.platformLinks, ...nav.solutionsLinks, ...nav.productLinks]) {
    expect(body).toContain(`- [${link.name}](`)
  }
})
```

#### 1.4 `e2e/a11y.spec.ts` (archivo completo)

La lógica de filtrado y reporte pasa a `expectNoBlockingViolations` para reutilizarla en el escaneo nuevo con el mega menú abierto (diseño §12, prueba 8). El bucle de rutas no cambia de comportamiento.

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import es from '../src/content/dictionaries/es'
import { effectiveOpacity } from './helpers'

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

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>

function expectNoBlockingViolations(label: string, results: AxeResults) {
  const blocking = results.violations.filter(
    (v) => v.impact && BLOCKING_IMPACTS.has(v.impact)
  )
  const advisory = results.violations.filter(
    (v) => !v.impact || !BLOCKING_IMPACTS.has(v.impact)
  )

  // No bloquean el gate, pero deben quedar visibles en el log de CI.
  if (advisory.length > 0) {
    console.log(
      `[a11y advisory] ${label}:`,
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
}

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
      .withTags(WCAG_TAGS)
      // WCAG 1.4.3 exceptua los logotipos del minimo de contraste. El unico
      // nodo marcado asi es el wordmark de marca del TrustBar, atenuado para
      // igualar los logos <img> vecinos. Es una exencion nominal y auditable,
      // no un relajamiento del gate.
      .exclude('[data-brand-wordmark]')
      .analyze()

    expectNoBlockingViolations(route, results)
  })
}

test('no serious/critical a11y violations on /es with the mega menu open', async ({ page }) => {
  await page.goto('/es', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: es.nav.menuLabel }).click()

  const menu = page.locator('#site-mega-menu')
  await expect(menu).toBeVisible()
  // El panel entra con un fundido y el encabezado cambia de tono con una
  // transición de color: se escanea con ambos en su estado final, no a medias.
  await expect.poll(() => effectiveOpacity(menu)).toBe(1)
  await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(10, 10, 10)')

  // Con el menú abierto, lo que queda debajo del panel no se ve: se escanean
  // el panel y el encabezado (con sus botones en aria-expanded="true").
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .include('#site-mega-menu')
    .include('.site-header')
    .analyze()

  expectNoBlockingViolations('/es + mega menú', results)
})
```

#### 1.5 Comprobar el rojo

```bash
PORT=3050 npx playwright test e2e/header.spec.ts e2e/smoke.spec.ts e2e/a11y.spec.ts --reporter=line
```

Fallos esperados (y por estas razones, no por errores de sintaxis de la prueba):
- `header.spec.ts`: **7 de 7**. Las de tono esperan `.site-header` con `data-tone` y el elemento no existe (hoy el `<header>` no tiene esa clase); las de sin JavaScript fallan en `toHaveCSS` por lo mismo; `Servicios y Productos…` falla en `expect(menuTriggers).toEqual(…)` (hoy ningún ítem tiene `opensMenu`: `[]` frente a `["Servicios", "Live Studio"]`); `el bloque Productos…` agota el tiempo buscando un botón "Live Studio" (hoy es un enlace).
- `smoke.spec.ts`: **4** — `navigation works on desktop` (no hay botón "Live Studio"), `mobile menu works` (`TypeError`: `nav.platformLinks` es `undefined`), `home page links to the live studio division` (no hay botón "Live Studio") y `llms.txt lists…` (falta `## Productos (Español)`). El resto pasa.
- `a11y.spec.ts`: **1** — el escaneo con el mega menú abierto (`#site-mega-menu` no existe). Los 8 escaneos de rutas pasan.

`npx tsc --noEmit` también falla en este punto (`Property 'platformLinks' does not exist…` en `smoke.spec.ts`, `Property 'productLinks'…` en `header.spec.ts`): es esperado hasta el paso 2.

Commit opcional en `wt/task5`: `test(home): pruebas de navegación y encabezado (rojo)`.

---

### Paso 2 — Implementación

#### 2.1 Diccionarios: `nav` y `footer` (contrato §3.2, T5)

`src/content/dictionaries/es.ts`, bloque `nav`. Antes:
```ts
  nav: {
    items: [
      {
        name: "Servicios",
        children: [{ name: "", href: "" }],
        platformChildren: [
          { name: "IA Soberana", href: "/soberania-ia", description: "Infraestructura de IA bajo su control total" },
          { name: "Ciberseguridad", href: "/ciberseguridad", description: "Defensa autónoma con agentes de IA" },
          { name: "Fuerza Digital", href: "/fuerza-digital", description: "Asistentes ejecutivos en todos sus canales" },
          { name: "Enriquecimiento de Datos", href: "/enriquecimiento-datos", description: "Inteligencia accionable desde fuentes verificadas" },
          { name: "Extracción de Datos", href: "/extraccion-datos", description: "Scrapers con IA para OSINT y registros públicos" },
          { name: "RealTy", href: "/realty", description: "Infraestructura de ventas con IA para promotores inmobiliarios" },
        ],
        solutionsChildren: [
          { name: "Sistemas Críticos", href: "/sistemas-criticos", description: "Arquitectura de alta disponibilidad" },
          { name: "Inteligencia Operativa", href: "/inteligencia-operativa", description: "Centros de comando y datos unificados" },
          { name: "Automatización de Gobierno", href: "/automatizacion-gobierno", description: "Workflows gubernamentales digitalizados" },
        ],
      },
      { name: "Live Studio", href: "/estudio-tiktok-live", accent: true },
      { name: "Empresa", href: "/nosotros" },
    ],
```
Después (siguen sin cambios `contact`, `schedule` y `menuLabel`):
```ts
  nav: {
    items: [
      { name: "Servicios", opensMenu: true },
      { name: "Productos", opensMenu: true },
      { name: "Empresa", href: "/nosotros" },
    ],
    platformLinks: [
      { name: "IA Soberana", href: "/soberania-ia", description: "Infraestructura de IA bajo su control total" },
      { name: "Ciberseguridad", href: "/ciberseguridad", description: "Defensa autónoma con agentes de IA" },
      { name: "Fuerza Digital", href: "/fuerza-digital", description: "Asistentes ejecutivos en todos sus canales" },
      { name: "Enriquecimiento de Datos", href: "/enriquecimiento-datos", description: "Inteligencia accionable desde fuentes verificadas" },
      { name: "Extracción de Datos", href: "/extraccion-datos", description: "Scrapers con IA para OSINT y registros públicos" },
    ],
    solutionsLinks: [
      { name: "Sistemas Críticos", href: "/sistemas-criticos", description: "Arquitectura de alta disponibilidad" },
      { name: "Inteligencia Operativa", href: "/inteligencia-operativa", description: "Centros de comando y datos unificados" },
      { name: "Automatización de Gobierno", href: "/automatizacion-gobierno", description: "Workflows gubernamentales digitalizados" },
    ],
    productLinks: [
      { name: "RealTy", href: "/realty", description: "Infraestructura de ventas con IA para promotores inmobiliarios" },
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live", description: "Estudio de producción en vivo para creadores de LATAM" },
    ],
```

`src/content/dictionaries/es.ts`, bloque `footer` (desde el último enlace de `platformLinks` hasta el cierre de `studioLinks`). Antes:
```ts
      { name: "Extracción de Datos", href: "/extraccion-datos" },
      { name: "RealTy", href: "/realty" },
    ],
    studio: "Live Studio",
    studioLinks: [
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Programa para creadores", href: "/estudio-tiktok-live" },
      { name: "Marcas y campañas", href: "/agendar" },
    ],
```
Después (siguen sin cambios `tagline`, `platform`, `company`, `companyLinks`, `legal`, `privacy`, `terms`, `copyright`):
```ts
      { name: "Extracción de Datos", href: "/extraccion-datos" },
    ],
    solutions: "Soluciones",
    solutionsLinks: [
      { name: "Sistemas Críticos", href: "/sistemas-criticos" },
      { name: "Inteligencia Operativa", href: "/inteligencia-operativa" },
      { name: "Automatización de Gobierno", href: "/automatizacion-gobierno" },
    ],
    products: "Productos",
    productLinks: [
      { name: "RealTy", href: "/realty" },
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Programa para creadores", href: "/estudio-tiktok-live" },
      { name: "Marcas y campañas", href: "/agendar" },
    ],
```

`src/content/dictionaries/en.ts`, bloque `nav`. Antes:
```ts
  nav: {
    items: [
      {
        name: "Services",
        children: [{ name: "", href: "" }],
        platformChildren: [
          { name: "Sovereign AI", href: "/soberania-ia", description: "AI infrastructure under your total control" },
          { name: "Cybersecurity", href: "/ciberseguridad", description: "Autonomous defense with AI agents" },
          { name: "Digital Workforce", href: "/fuerza-digital", description: "Executive assistants across all channels" },
          { name: "Data Enrichment", href: "/enriquecimiento-datos", description: "Actionable intelligence from verified sources" },
          { name: "Data Extraction", href: "/extraccion-datos", description: "AI scrapers for OSINT and public records" },
          { name: "RealTy", href: "/realty", description: "AI sales infrastructure for real-estate developers" },
        ],
        solutionsChildren: [
          { name: "Critical Systems", href: "/sistemas-criticos", description: "High-availability architecture" },
          { name: "Operational Intelligence", href: "/inteligencia-operativa", description: "Command centers and unified data" },
          { name: "Government Automation", href: "/automatizacion-gobierno", description: "Digitized government workflows" },
        ],
      },
      { name: "Live Studio", href: "/estudio-tiktok-live", accent: true },
      { name: "Company", href: "/nosotros" },
    ],
```
Después:
```ts
  nav: {
    items: [
      { name: "Services", opensMenu: true },
      { name: "Products", opensMenu: true },
      { name: "Company", href: "/nosotros" },
    ],
    platformLinks: [
      { name: "Sovereign AI", href: "/soberania-ia", description: "AI infrastructure under your total control" },
      { name: "Cybersecurity", href: "/ciberseguridad", description: "Autonomous defense with AI agents" },
      { name: "Digital Workforce", href: "/fuerza-digital", description: "Executive assistants across all channels" },
      { name: "Data Enrichment", href: "/enriquecimiento-datos", description: "Actionable intelligence from verified sources" },
      { name: "Data Extraction", href: "/extraccion-datos", description: "AI scrapers for OSINT and public records" },
    ],
    solutionsLinks: [
      { name: "Critical Systems", href: "/sistemas-criticos", description: "High-availability architecture" },
      { name: "Operational Intelligence", href: "/inteligencia-operativa", description: "Command centers and unified data" },
      { name: "Government Automation", href: "/automatizacion-gobierno", description: "Digitized government workflows" },
    ],
    productLinks: [
      { name: "RealTy", href: "/realty", description: "AI sales infrastructure for real-estate developers" },
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live", description: "Live production studio for LATAM creators" },
    ],
```

`src/content/dictionaries/en.ts`, bloque `footer`. Antes:
```ts
      { name: "Data Extraction", href: "/extraccion-datos" },
      { name: "RealTy", href: "/realty" },
    ],
    studio: "Live Studio",
    studioLinks: [
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Creator program", href: "/estudio-tiktok-live" },
      { name: "Brands and campaigns", href: "/agendar" },
    ],
```
Después:
```ts
      { name: "Data Extraction", href: "/extraccion-datos" },
    ],
    solutions: "Solutions",
    solutionsLinks: [
      { name: "Critical Systems", href: "/sistemas-criticos" },
      { name: "Operational Intelligence", href: "/inteligencia-operativa" },
      { name: "Government Automation", href: "/automatizacion-gobierno" },
    ],
    products: "Products",
    productLinks: [
      { name: "RealTy", href: "/realty" },
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Creator program", href: "/estudio-tiktok-live" },
      { name: "Brands and campaigns", href: "/agendar" },
    ],
```

Con esto desaparecen el placeholder `children: [{ name: "", href: "" }]`, `platformChildren`, `solutionsChildren`, `accent`, `studio` y `studioLinks`. Las dos formas (`es`/`en`) siguen siendo idénticas.

#### 2.2 `src/components/layout/header/types.ts` (completo)

`NavChild` pasa a llamarse `NavLink` (solo lo importaba `MegaMenu.tsx`). `NavItem` es una unión discriminada: con `opensMenu: true` abre el menú; si no, tiene `href`.

```ts
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

export interface NavLink {
  name: string
  href: string
  description?: string
}

/** A top-level nav entry: it either opens the mega menu or links straight to a page. */
export type NavItem =
  | { name: string; opensMenu: true; href?: never }
  | { name: string; href: string; opensMenu?: never }

export interface NavContent {
  items: readonly NavItem[]
  platformLinks: readonly NavLink[]
  solutionsLinks: readonly NavLink[]
  productLinks: readonly NavLink[]
  contact: string
  schedule: string
  menuLabel: string
}

/** Value of `.site-header[data-tone]` (globals.css). Absent until the client knows the section under the header. */
export type HeaderTone = "light" | "dark" | "menu"

/** id of the mega menu panel. The triggers point at it with aria-controls only while it is open. */
export const MEGA_MENU_ID = "site-mega-menu"

export const megaMenuEase = [0.22, 1, 0.36, 1] as const

export function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#")) return href
  return buildLocalePath(locale as Locale, href)
}

export function getMegaMenuLabels(locale: string) {
  const isEN = locale === "en"
  return {
    platform: isEN ? "PLATFORM" : "PLATAFORMA",
    solutions: isEN ? "SOLUTIONS" : "SOLUCIONES",
    products: isEN ? "PRODUCTS" : "PRODUCTOS",
    about: isEN ? "ABOUT ORBEXS" : "SOBRE ORBEXS",
    contact: isEN ? "CONTACT" : "CONTACTO",
    learnMore: isEN ? "Learn more" : "Conocer más",
    aboutText: isEN
      ? "We build software infrastructure, sovereign AI, and agentic cybersecurity for governments and organizations operating under the most demanding standards."
      : "Construimos infraestructura de software, IA soberana y ciberseguridad agéntica para gobiernos y organizaciones que operan bajo los estándares más exigentes.",
    company: isEN ? "Company" : "Empresa",
  }
}
```

#### 2.3 `src/components/layout/header/useDarkSectionDetection.ts` (completo)

```ts
"use client"
import { useEffect, useState } from "react"

type Reading = { pathname: string; isDark: boolean }

/**
 * Tells whether a dark section (`[data-header-theme="dark"]`) is under the
 * header strip — the top 5 % of the viewport.
 *
 * - Keeps the set of dark sections inside the strip. Deciding from the entries
 *   of a single callback is wrong: when two dark sections touch, the one that
 *   leaves arrives alone and would paint the header light over the other.
 * - Subscribes again on every route change: the sections it observed belong to
 *   the previous page, and the new page brings its own.
 * - Returns null until the observer has reported for the current pathname. The
 *   server HTML and the first client render then agree (no data-tone), and in
 *   the meantime globals.css picks the tone from `data-header-start`.
 */
export function useDarkSectionDetection(pathname: string): boolean | null {
  const [reading, setReading] = useState<Reading | null>(null)

  useEffect(() => {
    let active = true
    const publish = (isDark: boolean) => {
      if (!active) return
      setReading((prev) =>
        prev?.pathname === pathname && prev.isDark === isDark ? prev : { pathname, isDark }
      )
    }

    const sections = document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]')
    if (sections.length === 0) {
      // Nothing to observe means no callback will ever come: the page is light.
      queueMicrotask(() => publish(false))
      return () => {
        active = false
      }
    }

    const underHeader = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) underHeader.add(entry.target)
          else underHeader.delete(entry.target)
        }
        publish(underHeader.size > 0)
      },
      // Only the strip at the top of the viewport, where the header lives.
      { rootMargin: "0px 0px -95% 0px", threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))

    return () => {
      active = false
      observer.disconnect()
    }
  }, [pathname])

  return reading?.pathname === pathname ? reading.isDark : null
}
```

Notas: `setReading` solo se llama desde el callback del observador o desde `queueMicrotask` (regla `react-hooks/set-state-in-effect`, patrón del código actual). La lectura va ligada a la ruta: justo después de navegar, la lectura antigua ya no vale, el hook devuelve `null`, el `<header>` pierde `data-tone` y decide el CSS con la página nueva, sin parpadeo del tono anterior.

#### 2.4 `src/components/layout/header/MegaMenu.tsx` (completo)

Todos los grises `#525252` pasan a `#a3a3a3` (7,8:1 sobre `#0a0a0a`). Las flechas `↳` y el separador `·` llevan `aria-hidden`. Desaparecen `directItems` y el punto magenta. El separador superior lo dibuja ahora el borde del encabezado en tono `menu`.

```tsx
"use client"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { m } from "motion/react"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { MEGA_MENU_ID, getMegaMenuLabels, megaMenuEase, resolveHref } from "./types"
import type { NavLink } from "./types"

const blockTitleClass = "text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3]"

/** One titled list of links: Platform, Solutions or Products. */
function MenuBlock({
  title,
  links,
  locale,
  onClose,
}: {
  title: string
  links: readonly NavLink[]
  locale: string
  onClose: () => void
}) {
  return (
    <div>
      <h3 className={`${blockTitleClass} mb-8`}>{title}</h3>
      <div className="flex flex-col">
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={resolveHref(locale, link.href)}
            onClick={onClose}
            className={`block py-4 group/desc ${i < links.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
              <span aria-hidden="true" className="text-[#a3a3a3] mr-1.5">&#8627;</span>
              {link.name}
            </span>
            {link.description && (
              <span className="block text-sm text-[#a3a3a3] mt-1">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

/**
 * The dark overlay panel. It only mounts while the menu is open (it was never
 * part of the server HTML). On mount it moves focus to its first link; Header
 * owns Escape and gives focus back to the button that opened the menu.
 */
export function MegaMenu({
  locale,
  platformLinks,
  solutionsLinks,
  productLinks,
  onClose,
}: {
  locale: string
  platformLinks: readonly NavLink[]
  solutionsLinks: readonly NavLink[]
  productLinks: readonly NavLink[]
  onClose: () => void
}) {
  const labels = getMegaMenuLabels(locale)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true })
  }, [])

  return (
    <m.div
      ref={panelRef}
      id={MEGA_MENU_ID}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: megaMenuEase }}
      className="fixed inset-0 top-16 z-40 bg-[#0a0a0a] text-white overflow-y-auto"
    >
      {/* The hairline above the panel is the header's own bottom border (tone "menu"). */}
      <div className="container px-6 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: PLATFORM — core technology services */}
          <MenuBlock title={labels.platform} links={platformLinks} locale={locale} onClose={onClose} />

          {/* Column 2: SOLUTIONS (use-case oriented) and, below, the PRODUCTS we build and run */}
          <div className="flex flex-col gap-12">
            <MenuBlock title={labels.solutions} links={solutionsLinks} locale={locale} onClose={onClose} />
            <MenuBlock title={labels.products} links={productLinks} locale={locale} onClose={onClose} />
          </div>

          {/* Column 3: ABOUT + CONTACT */}
          <div>
            <h3 className={`${blockTitleClass} mb-8`}>{labels.about}</h3>
            <p className="text-base text-[#a3a3a3] leading-relaxed mb-6">{labels.aboutText}</p>
            <Link
              href={resolveHref(locale, "/nosotros")}
              onClick={onClose}
              className="inline-block text-sm text-white hover:text-[#a3a3a3] border-b border-white/20 pb-0.5 transition-colors"
            >
              <span aria-hidden="true" className="text-[#a3a3a3] mr-1.5">&#8627;</span>
              {labels.learnMore}
            </Link>

            <div className="mt-10">
              <h3 className={`${blockTitleClass} mb-4`}>{labels.contact}</h3>
              <a
                href={siteConfig.links.contact}
                onClick={() => {
                  trackEvent("contact_click")
                  onClose()
                }}
                className="text-base font-medium text-white hover:text-[#a3a3a3] transition-colors"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 mt-12">
        <div className="container px-6 mx-auto max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#a3a3a3]">
            &copy; {new Date().getFullYear()} {siteConfig.legalName}
          </span>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              Twitter / X
            </a>
            <span aria-hidden="true" className="text-white/10">&middot;</span>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </m.div>
  )
}
```

#### 2.5 `src/components/layout/Header.tsx` (completo)

`<m.header initial={{ y: -100 }}>` pasa a `<header>`: sin la entrada ya no hay nada que animar, y el encabezado es visible desde el HTML del servidor. Los colores salen de las variables `--hdr-*`. En las clases de Tailwind se usa el indicador de tipo `color:`, sin el cual `tailwind-merge` no reemplaza `bg-[#0a0a0a]`, `text-white`, `hover:bg-[#1a1a1a]` ni `focus-visible:ring-[#0a0a0a]` del `Button`.

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import type { MouseEvent } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { MegaMenu } from "./header/MegaMenu"
import { HamburgerIcon } from "./header/HamburgerIcon"
import { useDarkSectionDetection } from "./header/useDarkSectionDetection"
import { MEGA_MENU_ID, resolveHref } from "./header/types"
import type { HeaderTone, NavContent } from "./header/types"

// Every color comes from the --hdr-* variables that globals.css sets per
// data-tone / data-scrolled. The `color:` hint in the arbitrary values is what
// lets tailwind-merge (cn, inside Button) replace the variant's own colors.
const navLinkClass =
  "nav-link-hover px-4 py-2 transition-colors duration-200 text-[color:var(--hdr-link)] hover:text-[color:var(--hdr-link-hover)] aria-expanded:text-[color:var(--hdr-link-hover)]"

// MegaMenu is imported statically on purpose. It only mounts while the menu is
// open, so loading it through next/dynamic({ ssr: false }) looked attractive —
// but measured on this build it is a net loss: the overlay is 4.3 kB while the
// next/dynamic loader runtime costs ~5.3 kB, and because Header lives in the
// root layout that runtime lands in the shared bundle of *every* route.
// See the note in next.config.ts for the matching CSP trade-off.
export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  // The button that opened the menu ("Servicios", "Productos" or the
  // hamburger): Escape gives focus back to it.
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const { scrollY } = useScroll()
  const isDarkSection = useDarkSectionDetection(pathname)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  // Trigger logo CSS glitch once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      logoRef.current?.classList.add("logo-glitch")
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const closeMegaMenu = useCallback(() => setIsMegaMenuOpen(false), [])

  const toggleMegaMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!isMegaMenuOpen) openerRef.current = event.currentTarget
      trackEvent(isMegaMenuOpen ? "mega_menu_close" : "mega_menu_open")
      setIsMegaMenuOpen(!isMegaMenuOpen)
    },
    [isMegaMenuOpen]
  )

  // Escape closes the menu and gives focus back to the button that opened it
  useEffect(() => {
    if (!isMegaMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setIsMegaMenuOpen(false)
      openerRef.current?.focus()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMegaMenuOpen])

  // Lock body scroll when mega menu is open
  useEffect(() => {
    if (isMegaMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMegaMenuOpen])

  const schedulingHref = buildLocalePath(locale as Locale, "/agendar")

  // The open menu wins; otherwise the section under the header decides. While
  // that is unknown (server, first client render, right after a route change)
  // the attribute stays off and globals.css reads data-header-start instead.
  const tone: HeaderTone | undefined = isMegaMenuOpen
    ? "menu"
    : isDarkSection === null
      ? undefined
      : isDarkSection
        ? "dark"
        : "light"

  // "Servicios", "Productos" and the hamburger open the same panel.
  // aria-controls only while the panel exists: axe flags an id that is not there.
  const menuTriggerProps = {
    onClick: toggleMegaMenu,
    "aria-expanded": isMegaMenuOpen,
    "aria-controls": isMegaMenuOpen ? MEGA_MENU_ID : undefined,
  }

  return (
    <>
      <header
        data-tone={tone}
        data-scrolled={isScrolled ? "true" : undefined}
        className="site-header fixed top-0 w-full z-50 border-b border-[color:var(--hdr-border)] bg-[color:var(--hdr-bg)] text-[color:var(--hdr-fg)] transition-colors duration-300 data-[scrolled=true]:backdrop-blur-sm"
      >
        <div className="container px-4 mx-auto max-w-7xl h-16 flex items-center justify-between">
          {/* Left: Logo (inherits --hdr-fg) */}
          <TransitionLink
            href={buildLocalePath(locale as Locale, "/")}
            onClick={closeMegaMenu}
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight group"
          >
            {/* Logo with CSS micro-glitch on load (once) */}
            <div ref={logoRef}>
              <BrandLogo size={24} />
            </div>
            <span>{siteConfig.name}</span>
          </TransitionLink>

          {/* Center: Desktop nav — "Servicios" and "Productos" open the mega menu */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) =>
              item.opensMenu ? (
                <button key={item.name} type="button" {...menuTriggerProps} className={navLinkClass}>
                  {item.name}
                </button>
              ) : (
                <Link key={item.name} href={resolveHref(locale, item.href)} className={navLinkClass}>
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="[&_a]:text-[color:var(--hdr-link)] [&_a]:border-[color:var(--hdr-control-border)] [&_a:hover]:text-[color:var(--hdr-link-hover)] [&_a:hover]:border-[color:var(--hdr-control-border-hover)]">
              <LanguageSwitcher locale={locale} />
            </div>
            <Button
              size="sm"
              className="border border-[color:var(--hdr-cta-border)] bg-[color:var(--hdr-cta-bg)] text-[color:var(--hdr-cta-fg)] hover:border-[color:var(--hdr-cta-border-hover)] hover:bg-[color:var(--hdr-cta-bg-hover)] focus-visible:ring-[color:var(--hdr-focus)] focus-visible:ring-offset-[color:var(--hdr-focus-offset)]"
              href={schedulingHref}
              onClick={() => {
                trackEvent("scheduling_click")
                closeMegaMenu()
              }}
            >
              {nav.schedule}
            </Button>
            <button
              type="button"
              {...menuTriggerProps}
              aria-label={nav.menuLabel}
              className="w-11 h-11 rounded-[6px] flex items-center justify-center border border-[color:var(--hdr-control-border)] bg-[color:var(--hdr-control-bg)] text-[color:var(--hdr-control-fg)] hover:bg-[color:var(--hdr-control-bg-hover)] hover:text-[color:var(--hdr-control-fg-hover)] transition-colors duration-200"
            >
              <HamburgerIcon isOpen={isMegaMenuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mega menu overlay — DARK */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <MegaMenu
            key="mega-menu"
            locale={locale}
            platformLinks={nav.platformLinks}
            solutionsLinks={nav.solutionsLinks}
            productLinks={nav.productLinks}
            onClose={closeMegaMenu}
          />
        )}
      </AnimatePresence>
    </>
  )
}
```

#### 2.6 `src/app/globals.css`: variables del encabezado

Insertar justo después del bloque `.nav-link-hover`. Antes:
```css
.nav-link-hover:active::after,
.nav-link-hover[aria-expanded="true"]::after {
  transform: scaleX(0);
}
```
Después:
```css
.nav-link-hover:active::after,
.nav-link-hover[aria-expanded="true"]::after {
  transform: scaleX(0);
}

/* ── Site header ─────────────────────────────────────────────────────
   Header.tsx takes every color from these variables (Tailwind arbitrary
   values with the `color:` hint). The tone comes from data-tone
   ("light" | "dark" | "menu"), which the client sets once it knows the
   section under the header, plus data-scrolled="true" past 50 px.
   Before hydration there is no data-tone: a page whose first section
   carries data-header-start="dark" gets the dark tone from CSS alone, so
   the server HTML is already right — also with JavaScript disabled.
   Contrast (WCAG AA, text): light — #0a0a0a 19.8:1 and #525252 7.8:1 on
   #fff, #525252 7.1:1 on the #f5f5f5 control; dark / menu — #fff 19.8:1
   and #a3a3a3 7.8:1 on #0a0a0a, still ≥ 6:1 on the 90 % scrolled bars. */
.site-header {
  --hdr-bg: #ffffff;
  --hdr-border: transparent;
  --hdr-fg: #0a0a0a;
  --hdr-link: #525252;
  --hdr-link-hover: #0a0a0a;
  --hdr-control-bg: #f5f5f5;
  --hdr-control-bg-hover: #e5e5e5;
  --hdr-control-fg: #525252;
  --hdr-control-fg-hover: #0a0a0a;
  --hdr-control-border: #e5e5e5;
  --hdr-control-border-hover: rgba(10, 10, 10, 0.3);
  --hdr-cta-bg: #0a0a0a;
  --hdr-cta-bg-hover: #1a1a1a;
  --hdr-cta-fg: #ffffff;
  --hdr-cta-border: #0a0a0a;
  --hdr-cta-border-hover: #1a1a1a;
  --hdr-focus: #0a0a0a;
  --hdr-focus-offset: #ffffff;
}
.site-header[data-scrolled="true"] {
  --hdr-bg: rgba(255, 255, 255, 0.9);
  --hdr-border: #e5e5e5;
}
.site-header[data-tone="dark"],
.site-header[data-tone="menu"],
body:has([data-header-start="dark"]) .site-header:not([data-tone]) {
  --hdr-bg: transparent;
  --hdr-border: transparent;
  --hdr-fg: #ffffff;
  --hdr-link: #a3a3a3;
  --hdr-link-hover: #ffffff;
  --hdr-control-bg: rgba(255, 255, 255, 0.1);
  --hdr-control-bg-hover: rgba(255, 255, 255, 0.16);
  --hdr-control-fg: #ffffff;
  --hdr-control-fg-hover: #ffffff;
  --hdr-control-border: rgba(255, 255, 255, 0.2);
  --hdr-control-border-hover: rgba(255, 255, 255, 0.4);
  --hdr-cta-bg: transparent;
  --hdr-cta-bg-hover: rgba(255, 255, 255, 0.1);
  --hdr-cta-fg: #ffffff;
  --hdr-cta-border: rgba(255, 255, 255, 0.3);
  --hdr-cta-border-hover: rgba(255, 255, 255, 0.5);
  --hdr-focus: #ffffff;
  --hdr-focus-offset: #0a0a0a;
}
.site-header[data-tone="dark"][data-scrolled="true"],
body:has([data-header-start="dark"]) .site-header:not([data-tone])[data-scrolled="true"] {
  --hdr-bg: rgba(10, 10, 10, 0.9);
  --hdr-border: rgba(255, 255, 255, 0.1);
}
.site-header[data-tone="menu"] {
  --hdr-bg: #0a0a0a;
  --hdr-border: rgba(255, 255, 255, 0.1);
}
/* The global focus ring is #0a0a0a: invisible on the dark tones. */
.site-header :focus-visible {
  outline-color: var(--hdr-focus);
}
```

Especificidad (por qué el orden importa): la regla del tono claro con scroll `.site-header[data-scrolled="true"]` (0,2,0) va antes que los tonos oscuros (0,2,0), así que el tono oscuro la pisa por orden. El oscuro con scroll (0,3,0) y la variante `:has()` con scroll (0,4,1) ganan por especificidad. `[data-tone="menu"]` va al final y fija el fondo opaco. Sin JavaScript nunca hay `data-scrolled`, así que la variante `:has()` con scroll solo actúa en el instante entre una navegación y el primer callback del observador. Las variables no llevan capa: nada más las define, y los estilos los aplican utilidades de Tailwind (capa `utilities`). La regla `:focus-visible` sin capa solo cambia `outline-color`, sin tocar el `outline-style: none` del `Button`.

#### 2.7 `src/components/layout/Footer.tsx` (completo)

Rejilla `lg:grid-cols-7` (marca en 2 columnas y 5 columnas de enlaces), `key` por nombre y sin punto magenta. "Legal" pasa por la misma `FooterColumn`, con los mismos `href` que antes. Se quita la prop `nav?: unknown`, que no se usaba.

```tsx
import Link from "next/link"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { siteConfig } from "@/config/site"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface FooterLink {
  name: string
  href: string
}

interface FooterContent {
  tagline: string
  platform: string
  platformLinks: readonly FooterLink[]
  solutions: string
  solutionsLinks: readonly FooterLink[]
  products: string
  productLinks: readonly FooterLink[]
  company: string
  companyLinks: readonly FooterLink[]
  legal: string
  privacy: string
  terms: string
  copyright: string
}

const linkClass = "hover:text-white transition-colors"

/** In-page anchors stay plain links; pages go through TransitionLink with the locale prefix. */
function FooterLinkItem({ link, locale }: { link: FooterLink; locale: string }) {
  if (link.href.startsWith("#")) {
    return (
      <Link href={link.href} className={linkClass}>
        {link.name}
      </Link>
    )
  }
  return (
    <TransitionLink href={buildLocalePath(locale as Locale, link.href)} className={linkClass}>
      {link.name}
    </TransitionLink>
  )
}

function FooterColumn({ title, links, locale }: { title: string; links: readonly FooterLink[]; locale: string }) {
  return (
    <div>
      <h4 className="font-medium text-white mb-4">{title}</h4>
      <ul className="space-y-3 text-[#a3a3a3]">
        {/* key by name: two product links share the studio's href */}
        {links.map((link) => (
          <li key={link.name}>
            <FooterLinkItem link={link} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer({ content, locale }: { content: FooterContent; locale: string }) {
  const currentYear = new Date().getFullYear()
  const legalLinks: readonly FooterLink[] = [
    { name: content.privacy, href: "/privacidad" },
    { name: content.terms, href: "/terminos" },
  ]

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-[#1a1a1a] pt-16 pb-8">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-x-8 gap-y-12 mb-16">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-heading text-xl font-semibold text-white mb-4">
              {siteConfig.name}
            </h3>
            <p className="text-[#a3a3a3] max-w-sm mb-6 leading-relaxed">
              {content.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="py-2 text-[#a3a3a3] hover:text-white transition-colors">Twitter X</a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="py-2 text-[#a3a3a3] hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>

          <FooterColumn title={content.platform} links={content.platformLinks} locale={locale} />
          <FooterColumn title={content.solutions} links={content.solutionsLinks} locale={locale} />
          <FooterColumn title={content.products} links={content.productLinks} locale={locale} />
          <FooterColumn title={content.company} links={content.companyLinks} locale={locale} />
          <FooterColumn title={content.legal} links={legalLinks} locale={locale} />
        </div>

        <div className="pt-8 border-t border-[#1a1a1a] text-center text-[#a3a3a3] text-sm">
          &copy; {currentYear} {siteConfig.legalName}. {content.copyright}
        </div>
      </div>
    </footer>
  )
}
```

#### 2.8 `src/lib/seo.ts`: `serviceNameForPath`

Antes:
```ts
/** Resolves the human-readable service name for an internal path from the nav dictionary. */
export function serviceNameForPath(dict: Dictionary, internalPath: string): string | undefined {
  for (const item of dict.nav.items) {
    if ("platformChildren" in item) {
      const all = [...(item.platformChildren ?? []), ...(item.solutionsChildren ?? [])]
      const match = all.find((child) => child.href === internalPath)
      if (match) return match.name
    }
  }
  return undefined
}
```
Después:
```ts
/** Resolves the human-readable service or product name for an internal path from the nav dictionary. */
export function serviceNameForPath(dict: Dictionary, internalPath: string): string | undefined {
  const { platformLinks, solutionsLinks, productLinks } = dict.nav
  const links: readonly { name: string; href: string }[] = [...platformLinks, ...solutionsLinks, ...productLinks]
  return links.find((link) => link.href === internalPath)?.name
}
```
El nombre del JSON-LD `Service` de `/realty` sigue siendo "RealTy": ahora lo encuentra en `productLinks`.

#### 2.9 `src/app/llms.txt/route.ts`

**(a)** Eliminar `navChildren` y la línea en blanco que lo sigue. Antes:
```ts
function navChildren(dict: Dictionary) {
  for (const item of dict.nav.items) {
    if ("platformChildren" in item) {
      return {
        platform: item.platformChildren ?? [],
        solutions: item.solutionsChildren ?? [],
      }
    }
  }
  return { platform: [], solutions: [] }
}

```
Después: nada (el archivo sigue con `function serviceLines…`; el import de `Dictionary` se queda porque lo usa `serviceLines`).

**(b)** Antes:
```ts
export async function GET() {
  const es = await getDictionary("es")
  const en = await getDictionary("en")
  const esNav = navChildren(es)
  const enNav = navChildren(en)
```
Después:
```ts
export async function GET() {
  const es = await getDictionary("es")
  const en = await getDictionary("en")
```

**(c)** Antes:
```text
## Plataforma (Español)
${serviceLines(es, "es", esNav.platform)}

## Soluciones (Español)
${serviceLines(es, "es", esNav.solutions)}

## Platform (English)
${serviceLines(en, "en", enNav.platform)}

## Solutions (English)
${serviceLines(en, "en", enNav.solutions)}
```
Después:
```text
## Plataforma (Español)
${serviceLines(es, "es", es.nav.platformLinks)}

## Soluciones (Español)
${serviceLines(es, "es", es.nav.solutionsLinks)}

## Productos (Español)
${serviceLines(es, "es", es.nav.productLinks)}

## Platform (English)
${serviceLines(en, "en", en.nav.platformLinks)}

## Solutions (English)
${serviceLines(en, "en", en.nav.solutionsLinks)}

## Products (English)
${serviceLines(en, "en", en.nav.productLinks)}
```

La salida queda equivalente: las secciones Plataforma y Soluciones (es/en) son idénticas salvo que la línea de RealTy sale de Plataforma/Platform. Hay dos secciones nuevas, cada una con dos líneas (`- [RealTy](…/es/realty): …` y `- [Orbexs Live Studio](…/es/estudio-tiktok-live): …`, y sus equivalentes en inglés). Todo lo demás (bloques de Live Studio, RealTy, casos, FAQ, cumplimiento y empresa) no cambia.

#### 2.10 `data-header-start="dark"` en la primera sección de tres páginas

`src/components/sections/realty/Hero.tsx`. Antes:
```tsx
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#0a0a0a]" data-header-theme="dark">
```
Después:
```tsx
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#0a0a0a]" data-header-theme="dark" data-header-start="dark">
```

`src/components/sections/InvestorsPage.tsx` (sección `── Hero ──`). Antes:
```tsx
      <section className="min-h-[70vh] flex items-center bg-[#0a0a0a]" data-header-theme="dark">
```
Después:
```tsx
      <section className="min-h-[70vh] flex items-center bg-[#0a0a0a]" data-header-theme="dark" data-header-start="dark">
```

`src/components/sections/live-studio/Hero.tsx` (la `<section>` raíz; T4 no toca estas líneas, pero si cambió su formato, añadir el atributo a esa misma `<section>`). Antes:
```tsx
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0a0a]"
      data-header-theme="dark"
    >
```
Después:
```tsx
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0a0a]"
      data-header-theme="dark"
      data-header-start="dark"
    >
```

La portada de la home recibe el atributo en T6 (`ScrollStage startsDark`). `AboutPage.tsx` empieza en claro y no lo lleva.

---

### Paso 3 — Verificación

```bash
npm run lint                                   # 0 errores
npx tsc --noEmit                               # 0 errores
PORT=3050 npx playwright test e2e/header.spec.ts --reporter=line    # 7 passed
PORT=3050 npx playwright test e2e/smoke.spec.ts e2e/a11y.spec.ts --reporter=line   # todo verde (a11y: 9 passed)
PORT=3050 npx playwright test --reporter=line  # suite completa en verde antes de entregar
```

Comprobaciones de limpieza (cada una debe **no** imprimir nada, salvo la última):
```bash
grep -rnE "platformChildren|solutionsChildren|studioLinks|accent: true" src e2e
grep -rn "live-dot" src/components/layout
grep -n "#525252" src/components/layout/header/MegaMenu.tsx
grep -rn "y: -100" src/components/layout
grep -rn "directItems\|NavChild\b" src
grep -rln 'data-header-start="dark"' src        # exactamente: realty/Hero.tsx, InvestorsPage.tsx, live-studio/Hero.tsx
```

Revisión manual rápida (no bloqueante, con `PORT=3050 npm run dev`):
- `/es/inversores` y `/es/realty` recargadas: el encabezado aparece transparente con texto blanco desde el primer pintado (sin destello blanco).
- Tab por el encabezado en una página oscura: el anillo de foco se ve blanco. Abrir el menú con Enter sobre "Productos", Escape: el foco vuelve a "Productos".
- 390×844: la hamburguesa abre el panel en una columna (Plataforma → Soluciones → Productos → Sobre Orbexs).
- `http://localhost:3050/llms.txt`: secciones "Productos (Español)" y "Products (English)" con RealTy y Orbexs Live Studio.

Si `next dev` reescribe `AGENTS.md`, descartarlo con `git checkout AGENTS.md` (plan §1.1).

---

### Paso 4 — Commit

```bash
git add -A
git commit -F - <<'EOF'
feat(home): navegación Servicios · Productos · Empresa y encabezado por tono

"Servicios" y "Productos" abren el mismo mega menú, que suma Productos (RealTy,
Orbexs Live Studio) bajo Soluciones; RealTy deja Plataforma y se va el punto magenta.
El encabezado se pinta con variables según data-tone/data-scrolled y nace oscuro sin
JavaScript vía :has([data-header-start="dark"]); el hook de secciones oscuras usa un
Set y se suscribe de nuevo en cada ruta. Mega menú con aria-expanded/aria-controls,
foco y Escape. Footer, seo.ts y llms.txt adoptan la nueva forma de la nav.

Decisiones:
- El mega menú ya no lista enlaces directos: "Empresa" ya está en la columna Sobre Orbexs (Conocer más → /nosotros).
- <header> simple en lugar de m.header: sin initial={{ y: -100 }} motion no animaba nada.
- Variables --hdr-focus/--hdr-focus-offset y .site-header :focus-visible: el anillo global #0a0a0a no se veía en los tonos oscuros.
- Enlaces y selector de idioma en tono oscuro a #a3a3a3 (antes white/60–70): token del design system, 7,8:1.
- CTA y hamburguesa con borde de 1 px en todos los tonos: mismo tamaño al cambiar de tono.
- El hook devuelve null también justo tras navegar: decide el CSS con la página nueva, sin arrastrar el tono anterior.
- llms.txt: secciones nuevas Productos / Products; la línea de RealTy sale de Plataforma. serviceNameForPath busca también en productLinks.
- Pruebas: "sección clara" = toda section sin data-header-theme="dark" (hoy solo la portada vieja lleva "light"); helper nuevo waitForFrames.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```

---

### Decisiones

1. **El mega menú deja de listar enlaces directos** (`directItems`). El traspaso fija la columna 2 como "Soluciones y debajo Productos". El único ítem directo que queda en la nav es "Empresa" (`/nosotros`), y ya lo cubre la columna 3 ("Sobre Orbexs → Conocer más"). Así, en móvil, la hamburguesa sigue llegando a las tres entradas de la nav. (El `layout.md` del design system describe "Solutions + direct links": el traspaso manda.)
2. **Tipos:** `NavItem` pasa a ser una unión discriminada (`{ opensMenu: true }` | `{ href }`), `NavChild` pasa a llamarse `NavLink`, y `types.ts` exporta `MEGA_MENU_ID` y `HeaderTone`. Las pruebas escriben `'site-mega-menu'` literal (contrato §3.4) para que `e2e/` siga importando solo diccionarios y `helpers.ts`.
3. **`<header>` simple en lugar de `m.header`:** quitar `initial={{ y: -100 }}` deja a motion sin nada que animar. El `trackEvent` del toggle sale del *updater* de `setState` (antes se ejecutaba dos veces en StrictMode). Escape sigue sin registrar evento, como antes.
4. **Nombres concretos de variables** (el traspaso solo da las familias `--hdr-control-*` y `--hdr-cta-*`): `--hdr-control-{bg,bg-hover,fg,fg-hover,border,border-hover}` y `--hdr-cta-{bg,bg-hover,fg,border,border-hover}`. **Se añaden** `--hdr-focus` y `--hdr-focus-offset`, más la regla `.site-header :focus-visible { outline-color }`: el anillo global es `#0a0a0a` y no se veía en los tonos oscuros ni en `menu`. Esto importa porque Escape devuelve el foco al disparador.
5. **Colores del tono oscuro:** los enlaces y el selector de idioma pasan a `#a3a3a3` (antes `white/60` y `white/70`), el token `text-on-dark-secondary`, igual que el mega menú. Contraste de texto (AA ≥ 4,5:1): claro `#0a0a0a` 19,8, `#525252` 7,8 sobre blanco y 7,2 sobre `#f5f5f5`; oscuro/menú: blanco 19,8, `#a3a3a3` 7,85 sobre `#0a0a0a`; barras al 90 % con scroll: 6,3 en el peor caso; aurora de Live Studio: ≥ 5,7.
6. **Mismo tamaño de caja en todos los tonos:** el CTA y la hamburguesa llevan siempre borde de 1 px (en claro, el del CTA es del color de su fondo y el de la hamburguesa `#e5e5e5`, como el selector de idioma), y el `<header>` siempre lleva `border-b` (transparente cuando no toca). Cambiar de tono no mueve nada. El CTA en claro queda 2 px más alto y más ancho que antes. El panel (`top-16`) casa con el borde del encabezado, por eso sale su separador propio.
7. **El hook** conserva la franja superior del 5 % (`rootMargin: "0px 0px -95% 0px"`). Devuelve `null` en el servidor, en el primer render y justo después de cada navegación (la lectura va ligada al `pathname`), así que en ese intervalo manda `:has()`. Si la página no tiene secciones oscuras, publica `false` con `queueMicrotask`, porque ningún callback llegará.
8. **El logo y el CTA "Agendar" cierran el menú al pulsarse.** Antes, navegar desde el logo con el menú abierto lo dejaba abierto sobre la página nueva.
9. **`llms.txt`** gana "## Productos (Español)" y "## Products (English)" desde `nav.productLinks`. RealTy sale de Plataforma/Platform y el resto de la salida no cambia. **`serviceNameForPath`** busca también en `productLinks`, así que el `Service` de `/realty` sigue llamándose "RealTy". Una prueba de humo nueva vigila `llms.txt`.
10. **Footer:** "Legal" usa la misma `FooterColumn` (mismos `href`) y se quita la prop `nav?: unknown`, que no se usaba. La clase `.live-dot` se queda en `globals.css` porque la usa la página de Live Studio.
11. **Pruebas:** (a) "sección clara" es toda `main section:not([data-header-theme="dark"])`: aunque §3.4 pide `data-header-theme` en todas las secciones, hoy solo la portada vieja lleva `"light"`, y entre T6 y T7 la home podría no tener ninguna marcada. (b) El bug del conjunto se prueba en `/es/estudio-tiktok-live`, donde portada y marquee son oscuros y contiguos. (c) El escaneo axe con el menú abierto se limita a `#site-mega-menu` y `.site-header`: lo de debajo del panel no se ve. Espera a que el fondo del encabezado sea `rgb(10, 10, 10)` para no medir colores a mitad de transición. (d) Helper nuevo `waitForFrames(page, count)` en `e2e/helpers.ts`.
12. **Para T6:** en tono oscuro el encabezado es transparente sobre el relieve. Los 64 px superiores de la portada deben mantener `#a3a3a3` y el blanco con ≥ 4,5:1 (degradado superior si hace falta). La portada debe llevar `data-header-start="dark"` (vía `ScrollStage startsDark`) para que `:has()` actúe en `/es` sin JavaScript.
