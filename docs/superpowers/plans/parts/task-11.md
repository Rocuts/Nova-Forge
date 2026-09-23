## Tarea 11 — Limpieza, documentación y verificación final

**Depende de:** T10 integrada (toda la home en `redesign/home`).
**Archivos compartidos:** `es.ts`/`en.ts` (solo borrado de claves muertas), `CLAUDE.md`, `AGENTS.md`, documento de traspaso.
**Worktree y puerto:** `/home/user/wt/task11`, `PORT=3110` para e2e; `next start` de medición en el puerto `3111`.

### Archivos
- **Crear:**
  - `scripts/measure-home.mjs` — bytes de JS, LCP y CLS de una URL con red y CPU limitadas.
  - `scripts/capture-home.mjs` — capturas de la home en varios puntos del scroll.
  - `docs/superpowers/verification/2026-09-23/` — salidas de lint, `tsc`, build, e2e y mediciones (texto y JSON; las capturas **no** se versionan, pesan demasiado).
- **Modificar:** `CLAUDE.md`, `AGENTS.md`, `package.json` (scripts `measure:home` y `capture:home`), `es.ts`/`en.ts` (solo si quedan claves sin uso), `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md` (sección "Estado al cierre").
- **Borrar:** cualquier archivo o clave que las tareas 1–10 hayan dejado sin uso y que el diseño mande retirar (§5 "Sale de la home", §10 "Eliminados").

### Paso 1 — Prueba primero: inventario de restos
Ejecuta y guarda la salida. Cada línea que aparezca es trabajo de esta tarea (salvo las que se justifican abajo).
```bash
cd /home/user/wt/task11
# Claves y componentes que el diseño retira
grep -rnE "flagshipAI|liveStudioTeaser|titleLead|titleHighlight|titleRotating|trustLine|studioLinks|platformChildren|solutionsChildren|accent: true" src e2e
grep -rnE "sections/(Hero|Services|FlagshipAI|CaseStudy|LiveStudioTeaser|Methodology|TrustBar)\"" src e2e
ls src/app/opengraph-image.tsx src/app/twitter-image.tsx 2>&1
grep -rn "images.social\|images.twitter\|NF<" src
# ScrambleText ya no debe aparecer en títulos de la home ni de ProductLanding/DataEnrichmentLanding
grep -rn "ScrambleText" src/components/sections
```
**Esperado antes de limpiar:** solo coincidencias legítimas. `liveStudio.titleLead` (Live Studio, otra clave) es legítima y se queda; `ScrambleText` puede seguir en `ScheduleForm.tsx` (fuera del alcance de fase 1). Cualquier otra coincidencia se elimina en el paso 2.

### Paso 2 — Implementación

#### 2.1 Limpieza
1. Borra las claves de diccionario sin uso que liste el paso 1 (en **ambos** diccionarios, misma forma).
2. Borra imports y archivos muertos que el paso 1 detecte.
3. `npm run lint && npx tsc --noEmit` en verde.

#### 2.2 `CLAUDE.md`
Sustituye la regla **"Rutas nuevas"** por:
```md
- **Rutas nuevas:** una página se registra en cinco lugares — la carpeta `src/app/[locale]/<slug-es>/` (con su `page.tsx` y su `opengraph-image.tsx`, que llama a `renderPageSocialImage` de `src/lib/social-image.tsx`), `pathMap` en `src/lib/i18n.ts`, el array `pages` de `src/app/sitemap.ts`, y `PAGE_PATHS` + `getPageMeta()` en `src/lib/page-meta.ts`. Su `generateMetadata` devuelve `pageMetadata(locale, "<ruta>")` de `src/lib/metadata.ts` (título, descripción, `canonical`/`hreflang`, Open Graph y Twitter). Los rewrites del slug inglés y los redirects 308 se derivan automáticamente de `pathMap` en `next.config.ts` — no añadir entradas manuales ahí. Omitir cualquiera de estos pasos rompe el hreflang, el sitemap o la imagen para redes (`e2e/seo.spec.ts` lo detecta).
```
Añade, después de la regla de tipografía, una regla nueva:
```md
- **Home "Cartografía soberana"** (`src/components/sections/home/`): monocromo Orbexs. El azul `#2563eb` significa "lo que el sistema está procesando ahora" y solo lo llevan el punto de la cumbre (portada), el nodo activo (Capacidades) y el recuadro del campo activo (Del papel al dato); nunca hay más de un elemento azul visible a la vez (`e2e/home.spec.ts` lo verifica). Las imágenes viven en `design/source/` y se procesan con `npm run images` (salida en `src/assets/images/` y `public/images/og/`); no se generan imágenes nuevas y las ilustraciones llevan la etiqueta "Imagen ilustrativa". Las superposiciones SVG usan `viewBox="0 0 1536 1024"` dentro de `FocalCover` y sus coordenadas viven en `home/geometry.ts`. El movimiento solo anima `transform`, `opacity` y `pathLength`; la altura larga y el `sticky` los pone CSS (`md:motion-safe:`), y `useStageMode()` decide `scrub` / `inView` / `static`.
```
Revisa la regla **"NO DESTRUYAS EL SEO"**: sigue siendo cierta (el `FAQPage` de la home se genera desde `dict.faq.items` en `src/app/[locale]/page.tsx`). Si alguna tarea cambió el nombre o la ubicación de algo que la regla cita, actualízala.

#### 2.3 `AGENTS.md`
Es el espejo de `CLAUDE.md` para Codex y está desactualizado (cita `src/app/page.tsx` y `@studio-freight/lenis`). Reemplaza **solo** el bloque de reglas anterior a `<!-- BEGIN:nextjs-agent-rules -->` por el mismo contenido de "Reglas de Arquitectura" de `CLAUDE.md` (cambiando "Claude" por "Codex" en los títulos). El bloque `nextjs-agent-rules` queda intacto.

#### 2.4 `scripts/measure-home.mjs`
```js
// Mide bytes de JS transferidos, LCP y CLS de una página contra un servidor ya levantado
// (idealmente `next start`). Tres ejecuciones con caché desactivada; informa la mediana.
//
//   node scripts/measure-home.mjs --url http://localhost:3111/es --viewport desktop --throttle --out perf.json
//
// --throttle aplica el perfil "Slow 4G" de Lighthouse (150 ms RTT, 1,6 Mbps de bajada,
// 750 Kbps de subida) y CPU 4× más lenta.
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const url = option('url', 'http://localhost:3111/es')
const viewportName = option('viewport', 'desktop')
const out = option('out', null)
const throttle = flag('throttle')
const RUNS = Number(option('runs', '3'))

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
}

async function measureOnce() {
  const browser = await chromium.launch()
  const context = await browser.newContext(VIEWPORTS[viewportName])
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  if (throttle) {
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  }

  const responses = new Map()
  const sizes = new Map()
  cdp.on('Network.responseReceived', (e) => responses.set(e.requestId, { url: e.response.url, type: e.type, mime: e.response.mimeType }))
  cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength))

  await page.addInitScript(() => {
    window.__perf = { lcp: 0, lcpElement: '', cls: 0 }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.lcp = entry.startTime
        const el = entry.element
        window.__perf.lcpElement = el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} ${entry.url || ''}`.trim() : entry.url || ''
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__perf.cls += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })

  await page.goto(url, { waitUntil: 'networkidle', timeout: 180_000 })
  await page.waitForTimeout(1500)
  const perf = await page.evaluate(() => window.__perf)

  let jsBytes = 0
  let jsFiles = 0
  let imageBytes = 0
  let totalBytes = 0
  for (const [id, response] of responses) {
    const size = sizes.get(id) ?? 0
    totalBytes += size
    if (response.type === 'Script' || /javascript/.test(response.mime)) {
      jsBytes += size
      jsFiles += 1
    }
    if (response.type === 'Image') imageBytes += size
  }
  await browser.close()
  return { ...perf, jsBytes, jsFiles, imageBytes, totalBytes }
}

const runs = []
for (let i = 0; i < RUNS; i++) runs.push(await measureOnce())
const median = (key) => {
  const sorted = runs.map((r) => r[key]).sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
const result = {
  url,
  viewport: viewportName,
  throttle,
  median: {
    lcp: Math.round(median('lcp')),
    cls: Number(median('cls').toFixed(4)),
    jsBytes: median('jsBytes'),
    jsFiles: median('jsFiles'),
    imageBytes: median('imageBytes'),
    totalBytes: median('totalBytes'),
  },
  lcpElement: runs[Math.floor(runs.length / 2)].lcpElement,
  runs,
}
if (out) writeFileSync(out, JSON.stringify(result, null, 2))
console.log(JSON.stringify({ viewport: result.viewport, throttle, ...result.median, lcpElement: result.lcpElement }))
```

#### 2.5 `scripts/capture-home.mjs`
```js
// Capturas del viewport de la home en puntos repartidos por todo el scroll, para revisar
// el diseño a ojo. Por defecto: 1440×900 y 390×844, con y sin "reducir movimiento".
//
//   node scripts/capture-home.mjs --url http://localhost:3111/es --out /ruta/capturas --points 12
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const url = option('url', 'http://localhost:3111/es')
const outDir = option('out', 'captures')
const POINTS = Number(option('points', '12'))

const PASSES = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' },
  { name: 'desktop-reduced', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' },
  { name: 'mobile-reduced', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const index = []

for (const pass of PASSES) {
  const { name, reducedMotion, ...contextOptions } = pass
  const context = await browser.newContext({ ...contextOptions, reducedMotion })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 })
  await page.waitForTimeout(1200)

  // Recorre la página una vez para que las secciones `inView` se disparen como lo haría un visitante.
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  for (let i = 0; i < POINTS; i++) {
    const y = Math.round((max * i) / (POINTS - 1))
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    // useScroll actualiza en el siguiente frame; las secuencias `inView` tardan hasta ~1,8 s.
    await page.waitForTimeout(reducedMotion === 'reduce' ? 400 : 1400)
    const section = await page.evaluate(() => {
      const probe = window.innerHeight / 2
      const sections = [...document.querySelectorAll('main > section, main section[id]')]
      const hit = sections.find((s) => {
        const r = s.getBoundingClientRect()
        return r.top <= probe && r.bottom >= probe
      })
      return hit ? hit.id || hit.getAttribute('data-header-theme') || 'section' : 'none'
    })
    const file = join(outDir, `${name}-${String(i + 1).padStart(2, '0')}-${y}.png`)
    await page.screenshot({ path: file })
    index.push({ pass: name, point: i + 1, scrollY: y, section, file })
  }
  if (errors.length) index.push({ pass: name, errors })
  await context.close()
}

await browser.close()
console.log(JSON.stringify(index, null, 2))
```

#### 2.6 `package.json`
```json
"measure:home": "node scripts/measure-home.mjs",
"capture:home": "node scripts/capture-home.mjs"
```

### Paso 3 — Verificación final (obligatoria)
Todas las salidas se guardan en `docs/superpowers/verification/2026-09-23/`.
```bash
cd /home/user/wt/task11
V=docs/superpowers/verification/2026-09-23 && mkdir -p $V
npm run lint            2>&1 | tee $V/lint.log
npx tsc --noEmit        2>&1 | tee $V/tsc.log
npm run images:verify   2>&1 | tee $V/images-verify.log
npm run build           2>&1 | tee $V/build.log
PORT=3110 npx playwright test --reporter=list 2>&1 | tee $V/e2e.log
```
**Esperado:** lint y `tsc` sin salida de error; build con todas las rutas generadas; e2e con 0 fallos (el total de pruebas lo fija el log).

Medición contra el build de producción:
```bash
npx next start -p 3111 &            # anotar el PID y matarlo al terminar (kill <PID>)
for vp in desktop mobile; do
  node scripts/measure-home.mjs --url http://localhost:3111/es --viewport $vp --throttle --out $V/perf-$vp-throttled.json
  node scripts/measure-home.mjs --url http://localhost:3111/es --viewport $vp --out $V/perf-$vp.json
done
```
**Esperado:** LCP (mediana) < 2 500 ms con Slow 4G + CPU 4× en `desktop` y `mobile`; CLS < 0,1. Comparar `jsBytes` con la línea base del §0 (239 002 bytes, medida con el mismo método en `desktop` sin limitar): el diseño limita el JS nuevo de las islas de la home a ≤ 30 KB gzip. Si se supera, identificar el bloque con `jsFiles`/`runs` y reducirlo (p. ej. `next/dynamic` para islas bajo el pliegue) antes de cerrar.

Capturas y revisión visual:
```bash
node scripts/capture-home.mjs --url http://localhost:3111/es --out <scratchpad>/captures --points 12
```
Son 48 capturas (12 puntos × 4 pasadas). Se revisan **una por una** contra el diseño (§4 identidad, §5 secciones, §3.1 del plan): encuadre de las imágenes, alineación de las superposiciones con la imagen (ruta sobre la cresta, nodos sobre la lámina, recuadros sobre los valores del expediente), un solo azul, contraste, textos cortados, saltos, estados finales con reducir movimiento. Todo lo que no cuadre se corrige y se vuelve a capturar.

### Paso 4 — Estado al cierre y commit
Añade al final de `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md` la sección **"## 7. Estado al cierre"**: qué se hizo (tabla de tareas y commits), qué se decidió y por qué (las "Decisiones" de cada commit), resultados de verificación con cifras (lint, `tsc`, build, e2e, LCP, CLS, JS antes/después), desviaciones del diseño, pendientes (fase 2 y lo que no se pudo hacer: dominio, Vercel, credenciales) y cómo retomarlo.

Commit:
```
chore(home): limpieza final, documentación y verificación de la fase 1

Retira claves y componentes sin uso, actualiza CLAUDE.md y AGENTS.md con las
reglas de rutas (PAGE_PATHS, getPageMeta, opengraph-image) y de la home, añade
los scripts de medición y capturas, y guarda la verificación final.

Decisiones:
- <las que surjan>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
```

### Decisiones
- Las capturas no se versionan (≈ 48 PNG de varios cientos de KB); se versionan los logs y las mediciones en JSON.
- `AGENTS.md` se sincroniza con `CLAUDE.md` porque ya contradecía el código (Lenis, `src/app/page.tsx`); el resto de la documentación (README, `plan.md`, `docs/architecture-3d.md`) queda para la fase 2, como fija el diseño §3.
- La medición usa el mismo método que la línea base del §0 para que los bytes de JS sean comparables.
