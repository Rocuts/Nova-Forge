# Traspaso: rediseño de la home (fase 1)

**Fecha:** 2026-09-23 · **Rama:** `redesign/home`
**Documento de diseño aprobado:** `docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md`

Este archivo recoge lo que se decidió y midió al preparar el plan de implementación, que quedó a medio escribir. Léelo junto con el documento de diseño antes de escribir el plan.

---

## 1. Estado

| Paso | Estado |
|---|---|
| Auditoría del sitio y análisis de 15 competidores | Hecho (resumido en el documento de diseño) |
| Imágenes generadas por el usuario en ChatGPT | Hecho: `design/moodboard/` |
| Documento de diseño | Aprobado por el usuario, commit `d9985a4` |
| **Plan de implementación** | **Pendiente.** Siguiente paso. |
| Implementación | No empezada. No se ha tocado código de producto. |

**Proceso acordado con el usuario:**
1. Escribir el plan en `docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md`, con el skill `superpowers:writing-plans` si está disponible.
2. El usuario lo revisa y elige el modo de ejecución. **No se implementa nada antes de esa aprobación.**
3. Implementar tarea por tarea, con commit por tarea en `redesign/home`.
4. **Nunca** hacer merge a `main` ni publicar en Vercel sin aprobación explícita.

El usuario escribe en español; responderle en español.

## 2. Imágenes (en `design/moodboard/`)

| Archivo actual | Nombre destino en `design/source/` | Uso |
|---|---|---|
| `A1-v2.png` | `relieve.png` | Portada, cierre, fondo de las imágenes para redes |
| `A2-v2.png` | `lamina.png` | Capacidades |
| `C1-v2.png` | `expediente.png` | Del papel al dato |
| `B1.png` | `arquitectura.png` | Fase 2 (RealTy o Nosotros), no se usa ahora |

- Las cuatro miden 1536×1024.
- A1-v2, A2-v2 y C1-v2 ya son grises neutros (croma medio < 1,1 sobre 255). B1 es a color y el proceso la convertirá.
- El papel de A2-v2 tiene valores 252–254: el proceso debe llevarlo a 255 (percentil 95 → 255).
- El usuario validó las cuatro imágenes. Las versiones anteriores ya se borraron.

## 3. Geometría medida (espacio de píxeles 1536×1024 de cada imagen)

Cada coordenada se verificó dibujándola sobre la imagen.

**Ruta de la portada** (`relieve`): sendero en zigzag que sube por el macizo de la derecha hasta la cumbre.
```ts
export const ROUTE_PATH = "M 1040 1024 C 1049.7 1014.7 1091 986.7 1098 968 C 1105 949.3 1074 929 1082 912 C 1090 895 1125.7 882.7 1146 866 C 1166.3 849.3 1197.3 831 1204 812 C 1210.7 793 1181.3 769.3 1186 752 C 1190.7 734.7 1218.7 722.7 1232 708 C 1245.3 693.3 1264 680 1266 664 C 1268 648 1243.3 629 1244 612 C 1244.7 595 1261.3 577 1270 562 C 1278.7 547 1295 536 1296 522 C 1297 508 1278.2 494.8 1276 478 C 1273.8 461.2 1281.8 430.5 1283 421"
export const ROUTE_SUMMIT = { x: 1283, y: 421 } as const
```
Usar `strokeLinecap="butt"`: con `round`, un trazo de longitud 0 dibuja un punto visible.

**Nodos de Capacidades** (`lamina`), en el orden de `dict.services.items`. Todos caen dentro de x 490–1060, así que un recorte vertical centrado los muestra siempre.
```ts
export const CAPABILITY_NODES = [
  { x: 490, y: 190 }, { x: 640, y: 128 }, { x: 700, y: 340 }, { x: 990, y: 330 },
  { x: 860, y: 470 }, { x: 1060, y: 580 }, { x: 800, y: 700 }, { x: 610, y: 620 },
] as const
```

**Campos del expediente** (`expediente`, página izquierda), en el orden de `dict.dossier.fields`. Cada recuadro envuelve el valor tecleado. La página está levemente inclinada: los valores quedan unos 12 px por encima de su etiqueta.
```ts
export const DOSSIER_FIELDS = [
  { x: 448, y: 265, width: 103, height: 23 }, // Nombre
  { x: 452, y: 336, width: 101, height: 23 }, // Fecha de nacimiento
  { x: 454, y: 384, width: 101, height: 23 }, // Domicilio
  { x: 455, y: 432, width: 101, height: 23 }, // Correo electrónico
  { x: 458, y: 522, width: 104, height: 23 }, // Tipo de trámite
  { x: 460, y: 572, width: 103, height: 23 }, // Fecha de solicitud
] as const
```

## 4. Decisiones técnicas tomadas al preparar el plan

Todas son compatibles con el documento de diseño. Donde lo ajustan, se indica.

### Imágenes
- **Ajuste a §7:** las imágenes procesadas van en `src/assets/images/{relieve,lamina,expediente}.jpg`, no en `public/images/home/`. Importarlas de forma estática da a `next/image` ancho, alto y `blurDataURL` automáticos. El fondo para redes sí va en `public/images/og/relieve-og.jpg` (1200×630), porque la ruta de imagen para redes lo lee con `fs`.
- **Proceso:** `scripts/process-images.mjs` con `npm run images`, más un verificador `scripts/verify-images.mjs` con `npm run images:verify` que sirve de prueba (dimensiones, 1 canal, blanco del papel). `sharp` se fija como devDependency en la versión exacta `0.35.3`, la misma que trae Next.
- **Orden de operaciones de `sharp`:** no depende del orden de las llamadas. Por eso los niveles se aplican sobre el buffer crudo en JS, y después se escala a 2560 px (lanczos3) y se exporta a JPEG mozjpeg calidad 88.
- `public/logo.svg`: dos rectángulos de 16×7 en `x=4`, `y=4` y `y=13`, rotados 45° sobre (12, 12), `fill="#0a0a0a"`, `viewBox="-4 -4 32 32"`. `public/logo.png` (512×512, fondo blanco) se genera desde ese SVG en el mismo script. `siteConfig.images.logo` → `/logo.png`.
- `next.config.ts`: `images: { formats: ["image/avif", "image/webp"] }`.
- **Next 16:** `priority` está obsoleto. La portada usa `loading="eager"` + `fetchPriority="high"`. `images.qualities` por defecto es `[75]`.

### Alinear imagen y SVG: `FocalCover`
`object-position` no se puede reproducir en SVG, así que la imagen y su superposición van dentro de un mismo envoltorio 3:2 que se comporta como `object-fit: cover`:
```css
.focal-frame { position: absolute; inset: 0; overflow: hidden; container-type: size; }
.focal-cover {
  position: absolute; left: var(--fx, 50%); top: var(--fy, 50%);
  width: max(100cqw, 150cqh); aspect-ratio: 3 / 2;
  translate: calc(var(--fx, 50%) * -1) calc(var(--fy, 50%) * -1);
}
```
Dentro van `next/image fill object-cover` y un `<svg viewBox="0 0 1536 1024" class="absolute inset-0 h-full w-full">`. El punto focal se fija con clases, por ejemplo `[--fx:92%] md:[--fx:80%] lg:[--fx:50%]`.

| Uso | Encuadre |
|---|---|
| Portada | `--fx` 92 % en base, 80 % en `md`, 50 % en `lg`, para que la ruta de la derecha se vea en celular. El zoom del scroll va en un `m.div` interno con `transformOrigin` en la cumbre (83,5 % 41,1 %). |
| Lámina de Capacidades | `aspect-[4/5] md:aspect-[3/4] md:max-h-[calc(100svh-8rem)] md:sticky md:top-24`. Siempre deja ver al menos x 384–1152. |
| Expediente | `aspect-[4/5] md:aspect-auto md:h-[min(78svh,48rem)]` con `[--fx:10%]`, para centrar la página izquierda. |

### Modo de animación
- `useStageMode()` en `src/hooks/useStageProgress.ts` devuelve `"scrub"` en el servidor y en el primer render del cliente, para que la hidratación coincida. Después del montaje consulta `matchMedia`:
  - `(prefers-reduced-motion: reduce)` → `static`
  - `(min-width: 768px) and (prefers-reduced-motion: no-preference)` → `scrub`
  - cualquier otro caso → `inView`

  Escucha los cambios y usa `queueMicrotask` para el `setState`, siguiendo el patrón del código actual.
- `useStageProgress(ref, offset)` = `useStageMode()` + `useScroll({ target, offset })`. El tipo de `offset` se deriva de `Parameters<typeof useScroll>[0]`.
- **Layout sin saltos (CLS):** la altura larga y el `sticky` se aplican **solo con clases CSS** `md:motion-safe:` (`md:motion-safe:h-[160svh]` / `md:motion-safe:h-[250svh]`; marco `md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh`). El JavaScript solo decide la animación.
- Cada sección animada expone `data-stage-mode` para las pruebas.
- `ScrollStage` es un componente simple (sin hooks) con las props `ref`, `id`, `track: "short" | "long"`, `mode`, `theme`, `startsDark`, `className`, `frameClassName`. Renderiza `data-header-theme`, `data-header-start` (si `startsDark`) y `data-stage-mode`.

### Portada
- **Rangos del scroll** (`progress` 0→1):
  - escala 1 → 1,12;
  - texto `y` 0 → −140 px;
  - opacidad del texto 1 → 0 entre 0,62 y 0,95;
  - ruta 0 → 1 entre 0,06 y 0,68;
  - punto azul 0 → 1 entre 0,66 y 0,74;
  - degradado inferior 0 → 1 entre 0,55 y 1.
- En los modos `inView` y `static` la ruta usa un `useMotionValue` propio: `animate(..., { duration: 1.8, delay: 0.3 })` o `.set(1)`.
- El SVG expone `data-hero-route` y `data-complete="true|false"`. El punto azul lleva `data-hero-summit`.
- El H1 usa `max-w-[18ch] text-balance`, para que "Construimos / soberanía digital." quede en dos líneas. `text-fluid-hero`, blanco.
- El `href` del enlace de sector público se pasa tal cual (`#gobierno` en es, `#government` en en), sin `buildLocalePath`.

### Capacidades
- El nodo activo se calcula **por posición**, no con IntersectionObserver ni centinelas, que fallan con scroll rápido.
  - En cada cambio de `scrollY`, se busca la última fila `[data-capability-row]` cuyo `top` ≤ centro del viewport.
  - Si la última fila ya pasó el centro, el valor es N (red completa, sin azul). Si ninguna llegó, es −1.
- En el modo `inView` (celular): al entrar la lámina en pantalla se enciende una secuencia temporizada (220 ms por nodo) que termina en N.
- En el modo `static`: N.
- Nodos: `<g data-node data-lit data-active>`. Las aristas usan `m.line` con `pathLength`.

### Del papel al dato
- `extractionAt(p)`: `s = min(1, p·1,1)·6`; `done = floor(s)`; `active = done < 6 && s − done > 0,15 ? done : null`.
- **Ajuste a §5.4:** el recuadro terminado es **`#0a0a0a`**, no blanco, porque se dibuja sobre papel claro. Mientras está activo es azul `#2563eb` con trazo 3.
- Filas del panel: `data-dossier-row data-state`. Texto en espera `#a3a3a3` sobre `#141414` (7,3:1); terminado en blanco. Nada azul en el panel: el único azul es el recuadro.
- En el modo `inView`, al entrar el marco en pantalla, cada campo avanza cada 700 ms.

### Contraste (detectado al preparar las pruebas)
La prueba de axe escanea con la página arriba, con todo en su estado inicial:
- **Tesis:** de `#737373` a `#0a0a0a` (el `#a3a3a3` del diseño daría 2,5:1 y fallaría).
- **Fases inactivas de Metodología:** `#737373`.
- Etiquetas de instrumento sobre blanco o `#f8f8f8`: `#707070`; sobre oscuro: `#a3a3a3`.

### Encabezado
- Se pinta con **variables CSS** (`--hdr-bg`, `--hdr-border`, `--hdr-fg`, `--hdr-link`, `--hdr-link-hover`, `--hdr-control-*`, `--hdr-cta-*`) según `data-tone="light|dark|menu"` y `data-scrolled`.
- Antes de hidratar no hay `data-tone`, y rige:
  ```css
  body:has([data-header-start="dark"]) .site-header:not([data-tone]) { /* variables oscuras */ }
  ```
- Llevan `data-header-start="dark"` en su primera sección: la portada nueva, `realty/Hero.tsx`, la primera sección de `InvestorsPage.tsx` y `live-studio/Hero.tsx`.
- En las clases de Tailwind con variables usar el indicador de tipo, por ejemplo `bg-[color:var(--hdr-cta-bg)]` y `text-[color:var(--hdr-link)]`. Sin él, `tailwind-merge` no reemplaza los colores del `Button`.
- `useDarkSectionDetection(pathname)`:
  - Guarda un `Set` de secciones visibles. El código actual calcula solo con las entradas que cambiaron, lo que es un segundo bug.
  - Se vuelve a suscribir cuando cambia `pathname`.
- `aria-controls` se pone solo con el menú abierto; axe marca un id que no existe.
- Escape cierra el menú y devuelve el foco al botón que lo abrió. Al abrirse, el foco va al primer enlace.
- Se quita `initial={{ y: -100 }}`.

### Navegación y footer (diccionarios es/en)
- `nav.items`: `[{ name: "Servicios", opensMenu: true }, { name: "Productos", opensMenu: true }, { name: "Empresa", href: "/nosotros" }]`, más `platformLinks` (sin RealTy), `solutionsLinks` y `productLinks`:
  - RealTy — "Infraestructura de ventas con IA para promotores inmobiliarios";
  - Orbexs Live Studio — "Estudio de producción en vivo para creadores de LATAM".
- `MEGA_MENU_ID = "site-mega-menu"`.
- Mega menú: la columna 2 tiene Soluciones y debajo Productos. Todos los grises `#525252` pasan a `#a3a3a3`. Se agrega `labels.products` en `getMegaMenuLabels`.
- **Footer:**
  - `studio`/`studioLinks` se reemplazan por `solutions`/`solutionsLinks` y `products`/`productLinks` (RealTy, Orbexs Live Studio, Programa para creadores, Marcas y campañas).
  - Rejilla `lg:grid-cols-7`, `key` por nombre y sin punto magenta.

### Metadatos e imágenes para redes
- `src/lib/page-meta.ts`:
  - `PAGE_PATHS` (las 17 rutas del sitemap) y `type InternalPath`.
  - `getPageMeta(dict, path) → { title, absoluteTitle, description, eyebrow, cardTitle }`, con un type guard para las 8 páginas de producto (`dict.products[key]`).
  - `realtyTitle` y `realtyMetaDescription` se mueven aquí desde `realty/page.tsx`.
- `src/lib/metadata.ts`: `pageMetadata(locale, path)` genera:
  - `og:title` "Título | Orbexs" (la home usa título absoluto);
  - `og:url` canónica;
  - `og:locale` es_ES / en_US;
  - `twitter: { card: "summary_large_image" }` (X usa `og:image` si falta `twitter:image`).
- Un `opengraph-image.tsx` por ruta (17 archivos idénticos salvo el path), que llama a `renderPageSocialImage({ locale, path })` en `src/lib/social-image.tsx`.
  - Esa función usa el relieve como fondo, un degradado, el logo SVG, el eyebrow y el `cardTitle`.
  - Se eliminan `src/app/opengraph-image.tsx` y `twitter-image.tsx`. En el layout, `openGraph` queda mínimo.
- **Bug adicional encontrado:** hoy, el `openGraph` de una página reemplaza al del layout. Por eso /agendar, /diagnostico, /realty y Live Studio **no tienen og:image**.
- Las URLs `/en/<slug-es>/opengraph-image` funcionan porque los redirects de `next.config.ts` son de ruta exacta.
- CLAUDE.md ("Rutas nuevas"): agregar que una página nueva también va en `PAGE_PATHS`, en `getPageMeta` y con su `opengraph-image.tsx`.

### Contenido
- Copy exacto de §9.1 y §9.2 del diseño (es: `es.ts` líneas 307, 793, 794 y 799; en: `en.ts` las mismas líneas).
- Claves nuevas:
  - `hero.title`, `hero.indexItems`, `hero.imageLabel`, `hero.scrollHint`;
  - `thesis.text`;
  - `dossier` (con `sectionId` `gobierno` / `government`, `status { idle, active, done }`, `fields`, `links`, `counterLabel`, `imageAlt`, `imageLabel`);
  - `built` (`sectionId` `construido` / `built`, `realtyCta`, `studioCta { label, href }`);
  - `caseStudy.ownership`: "Lo construimos primero para nuestra propia división, Orbexs Live Studio." / "We built it first for our own division, Orbexs Live Studio."
- `caseStudy` **se queda**, porque `src/app/llms.txt/route.ts` lo usa.
- Se eliminan `flagshipAI`, `liveStudioTeaser`, `hero.titleLead`, `hero.titleHighlight`, `hero.titleRotating` y `hero.trustLine` cuando sus componentes desaparecen. Ojo: `liveStudio.titleLead` es otra clave y se queda.
- `TrustBar` pasa a `src/components/ui/TrustLogos.tsx` (sin sección ni fundido; conserva `data-brand-wordmark`) y se muestra dentro de TechStack.
- `ConsoleFrame` de `realty/Hero.tsx` se exporta para reutilizarlo en la tarjeta de RealTy.
- Preguntas frecuentes pasa a `bg-white`, para no tener dos secciones grises seguidas. "Lo que ya construimos" lleva `border-t border-[#1a1a1a]`.

### Pruebas (Playwright, servidor de desarrollo en el puerto 3000)
- `toBeVisible()` considera visible un elemento con `opacity: 0`. Para verificar que un título se ve de verdad, multiplicar la opacidad de todos sus ancestros.
- Las pruebas de scroll usan `window.scrollTo({ behavior: "instant" })`, porque `globals.css` tiene `scroll-behavior: smooth`.
- `smoke.spec.ts` usa `hero.titleLead`, `caseStudy.sectionId`, `liveStudioTeaser` y `nav.items[0].platformChildren`: hay que actualizarlo en la tarea donde cambie cada cosa.
- A `a11y.spec.ts` se le agrega un escaneo con el mega menú abierto (`#site-mega-menu`).
- En la tarjeta de RealTy de la home aplica la lista negra de `e2e/realty.spec.ts`. No aplica al caso de Live Studio, que dice "endpoints" legítimamente.

## 5. Desglose previsto del plan (11 tareas)

1. Proceso de imágenes y logo.
2. Metadatos por página e imágenes para redes (`e2e/seo.spec.ts`).
3. Copy de riesgo (`e2e/copy.spec.ts`).
4. Títulos visibles y reducir movimiento (`e2e/motion.spec.ts`).
5. Navegación y encabezado (`e2e/header.spec.ts`, más smoke y a11y).
6. Primitivas y portada (`e2e/home.spec.ts`). TrustLogos va a TechStack y se borra `sections/Hero.tsx`.
7. Tesis y Capacidades. Se borran `Services.tsx`, `FlagshipAI.tsx` y la clave `flagshipAI`.
8. Del papel al dato.
9. Lo que ya construimos. Se borran `CaseStudy.tsx`, `LiveStudioTeaser.tsx` y la clave `liveStudioTeaser`.
10. Metodología con línea, cierre con relieve y FAQ con `h3 > button`. Se borra `Methodology.tsx`.
11. Limpieza, docs (CLAUDE.md, AGENTS.md) y verificación final:
    - lint, `tsc` y build;
    - todas las pruebas e2e;
    - capturas a 1440×900 y 390×844;
    - LCP con red 4G y CPU 4× lenta.

**Revisiones que el plan debe cubrir con pruebas** (Review Focus):
1. Pantallas 1366×768 y 2560×1080: los CTA caben y el punto de la cumbre queda en pantalla.
2. Enlace `#gobierno` desde la portada: la sección queda arriba del viewport.
3. Cambio de tamaño de escritorio a celular: Capacidades pasa a `inView` sin errores y completa la red.
4. Sin JavaScript: el título se ve y el encabezado ya es claro sobre la portada negra.
5. La home en inglés muestra las claves nuevas traducidas.

## 6. Datos del entorno

- `OPENAI_API_KEY` está vacía en `.env.local` del usuario. Por eso, en local, el diagnóstico con IA devuelve el informe de respaldo.
- `orbexs.tech` no resuelve DNS y `orbexs-alpha.vercel.app` da 404 (proyecto de Vercel `nova-forge`). No es tarea de código; hay que avisarle al usuario.
- Next 16 ya no imprime el peso de JavaScript por ruta al compilar. Para comparar, medir los bytes de JS transferidos al cargar `/es` con `next start`, en `main` y en esta rama.
- La documentación de Next 16 está en `node_modules/next/dist/docs/`. Consultarla antes de usar cualquier API (lo pide AGENTS.md).

## 7. Estado a la pausa (2026-09-23, sesión 1)

La ejecución se detuvo a petición del usuario para continuar en otra sesión. Esta sección manda sobre §1 y §2 (desactualizadas: el plan ya existe y las imágenes están en `design/source/`).

### Hecho y publicado en `origin/redesign/home`
| Paso | Commit | Resultado |
|---|---|---|
| Plan completo (11 tareas, contrato §3), revisión cruzada con 32 hallazgos corregidos | `6cc0b01`, `637c1be` | `docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md` |
| Tarea 0: `PORT` configurable en Playwright | `e826c94` | — |
| **T1** imágenes y logo | `233446e` | lint/tsc ✅, `images:verify` ✅, e2e 41/41 |
| **T3** copy de riesgo | `748567c` | lint/tsc ✅, e2e 46/46 (prueba verificada con mutación) |
| **T4** títulos visibles y reducir movimiento | `2e61a3b` | lint/tsc ✅, e2e 60/60 |

T1, T3 y T4 pasaron por implementador, dos revisores independientes (cumplimiento y calidad, ambos aprobados) y un integrador. Sus hallazgos menores se corrigieron al integrar (ver cada commit).

**Línea base (antes de tocar código, `b65e497`):** e2e 39/39; JS de `/es` = 239 002 bytes (15 scripts, `next start`, 1440×900, sin caché, mediana de 3); LCP 900 ms con Slow 4G (150 ms RTT, 1,6 Mbps) + CPU 4×; CLS 0,007. La tarea 11 compara con el mismo método (`scripts/measure-home.mjs`, que crea T11).

### Pendiente
T2 (metadatos e imágenes para redes) ∥ T5 (navegación y encabezado); después T6 → T7 → T8 → T9 → T10; después T11 (limpieza, docs y verificación final). Todas las dependencias de T2 y T5 ya están integradas.

### Preparar un contenedor nuevo
1. `npm ci` en la raíz (Node 22).
2. **Chromium de Playwright:** Playwright 1.58 espera la revisión 1208. Si `ls $PLAYWRIGHT_BROWSERS_PATH` no la tiene y el entorno prohíbe `playwright install`, enlazar la revisión preinstalada R (en la sesión 1 era 1194):
   ```bash
   B=$PLAYWRIGHT_BROWSERS_PATH; R=1194
   mkdir -p $B/chromium-1208 $B/chromium_headless_shell-1208
   ln -sfn $B/chromium-$R/chrome-linux $B/chromium-1208/chrome-linux64
   ln -sfn headless_shell $B/chromium_headless_shell-$R/chrome-linux/chrome-headless-shell
   ln -sfn $B/chromium_headless_shell-$R/chrome-linux $B/chromium_headless_shell-1208/chrome-headless-shell-linux64
   touch $B/chromium-1208/{INSTALLATION_COMPLETE,DEPENDENCIES_VALIDATED} $B/chromium_headless_shell-1208/{INSTALLATION_COMPLETE,DEPENDENCIES_VALIDATED}
   ```
3. Comprobar la punta: `npm run lint`, `npx tsc --noEmit` y `npx playwright test` deben dar 60/60 en `2e61a3b`.
4. Por worktree (plan §1.1): `cp -al` de `node_modules` (nunca `npm install` dentro: comparte inodos), `npx next typegen` y `PORT=30N0`. Para tocar el lockfile: `npx -y npm@11 install … --package-lock-only` (npm 10.9.7 corrompe los campos `libc`).

### Lecciones de la sesión 1 (aplicarlas)
- **Tailwind v4 escanea los `.md`:** T1 añadió `@source not "../../docs"`. No escribir clases con valores elididos en ningún archivo.
- **Correctores interrumpidos:** un corrector de T3 se cortó a mitad de una prueba de mutación y dejó `es.ts` alterado. Si un agente se interrumpe, revisar su diff antes de integrar.
- **Condición de carrera en la a11y de `/es`:** el H1 rotativo antiguo puede fallar el escaneo de contraste a media transición (~1 de cada 6). Desaparece en T6; hasta entonces, si falla solo esa prueba, repetirla una vez para confirmarlo, y dejarlo anotado.
- **Carga de CPU:** con 4 CPU, cada `next dev` más Playwright satura la máquina. Limitar a dos ejecuciones de e2e o build a la vez (p. ej. `flock /tmp/e2e-slot-{1,2}.lock`), y no ejecutar un build en paralelo con e2e. Antes de cada ejecución, comprobar con `ss -ltnp` que el puerto está libre, porque `reuseExistingServer` reutilizaría el servidor de otro worktree.
- `next dev` reescribe el bloque `nextjs-agent-rules` de `AGENTS.md`: `git checkout AGENTS.md` antes de cada commit (salvo en T11).
- `test.use({ reducedMotion })` no compila en Playwright 1.58: usar `contextOptions: { reducedMotion }`.

### Paralelismo recomendado para lo que falta
Esta es una propuesta de la auditoría de la sesión 1 que se aparta de la secuencia estricta del plan §2. Las secciones de la home se implementan en paralelo y solo la integración va en serie:
```
F1  T2 ∥ T5                      → integrar T2, luego T5
F2  T6 (sola; incluye build)     → integrar
F3  T7 ∥ T8 ∥ T9 ∥ T10a          (worktrees desde el commit de T6; cada una con su propio spec temporal)
F4  integrar en serie T7 → T8 → T9 → T10a (resolver page.tsx, diccionarios y helpers.ts; fundir los specs en e2e/home.spec.ts)
    → T10b: pruebas de la home completa (orden de secciones, h2 sin JS, regla del azul en todo el scroll)
F5  T11 (verificación con revisores visuales y de rama en paralelo)
```
T10a abarca Metodología, CTA, FAQ y TechStack, con sus pruebas. T10b añade las tres pruebas de la home completa, que necesitan todas las secciones integradas.

Riesgos y cómo cubrirlos:
- Los anclajes "Antes" del plan suponen el estado secuencial. El integrador escribe el `page.tsx` final con el orden del contrato §3.5.
- En `helpers.ts`, T8 y T9 añaden al final del archivo. Se conservan ambos bloques, nunca duplicados.
- Algunas cosas solo se ven integradas: la regla del azul entre secciones, el ancla `#gobierno` y el peso de JS. Se verifican tras cada integración, y el JS se mide después de T9 y de T10.

## 8. Estado a la pausa 2 (2026-09-24, sesión 2 → se continúa en el Mac)

> **Trabajo nocturno tras el primer commit de esta sección (sesión 2, hasta ~11:00 UTC del 2026-09-24):** P1 y T7 ∥ T8 (con integración directa T7 → T8, specs temporales fundidos por el integrador) se ejecutan en el contenedor con el mismo workflow y los scripts portables. Al cierre, esta sección se actualiza con el estado real (§8.7), y el trabajo sin integrar queda como parches en `docs/superpowers/handoff/wip/`.

La sesión 2 se ejecutó en el contenedor de Claude Code on the web (4 CPU, 15 GB): con 4 CPU el runtime solo permitía **2 agentes simultáneos**, y cada fase tardaba horas. El usuario decidió continuar en su **MacBook Pro M5 Pro (24 GB)** desde VS Code con Claude Code. Esta sección manda sobre §7 en lo que se contradigan. El prompt para continuar está en `docs/superpowers/handoff/2026-09-24-prompt-continuacion-mac.md`.

### 8.1 Hecho y publicado en `origin/redesign/home`
| Paso | Commit | Resultado |
|---|---|---|
| Sesión 1: plan, T1, T3, T4 | `233446e`, `748567c`, `2e61a3b` | ver §7 |
| **T2** metadatos e imágenes para redes | `1bbd6ad` | lint/tsc ✅, e2e 103/103, build con las 34 imágenes prerenderizadas. 1 ronda de revisión (11 hallazgos menores, todos arreglados). |
| **T5** navegación y encabezado | `182001a` | lint/tsc ✅, e2e 123/123. 3 rondas de revisión (1 mayor de a11y en la 1.ª, 1 mayor en la 2.ª: «Empresa» y Atrás no cerraban el mega menú). |
| **T6** primitivas y portada | `5cf73de` | lint/tsc ✅, e2e 146/146, build ✅. 3 rondas de revisión con tres lentes (cumplimiento, calidad, visual): 5 mayores en la 1.ª (foco en enlaces invisibles, iPad Pro vertical sin cumbre, contraste en tabletas), 1 mayor en la 2.ª (media queries en px frente a rem), 0 en la 3.ª. |
| Materiales de traspaso | `(commit «docs(home): traspaso de la sesión 2…», el que añade esta sección)` | esta sección, investigación de JS, scripts portables, workflow guardado y prompt para el Mac |

Cada commit lleva un bloque «Decisiones» completo: **léelo** (`git show <commit>`) antes de tocar los archivos que cambió. Resumen de lo que se aparta del plan y ya está en el código (manda el código integrado):
- **T2:** la tarjeta para redes de Live Studio lleva `liveStudio.status` (solicitud en revisión) en el eyebrow; `realtyMetaDescription` recupera el calificador «Versión de demostración»; la plantilla de metadatos del skill `orbexs-design-system/layout.md` pasa a `pageMetadata()`; el título de las tarjetas usa `textWrap: "balance"`.
- **T5:** `SmoothScroll` conserva el `scrollTo(0,0)` suave al montar y salta con `behavior: "instant"` solo al cambiar de ruta; `<html data-scroll-behavior="smooth">`; sin JS el encabezado se oscurece con `animation-timeline: scroll(root)` y `@media (scripting: none)`; `nav.items[1].menuBlock = "products"` (el foco de «Productos» cae en RealTy); `<main>` y `.site-footer` quedan `inert` con el menú abierto; todo cambio de ruta cierra el menú; footer con `data-header-theme="dark"` y clase `site-footer`, siete columnas desde `xl`; `BrandLogo` con `tabIndex={-1}`.
- **T6:** `placeholder={coverPlaceholder(img)}` (`src/lib/image-placeholder.ts`) en lugar de `placeholder="blur"`: el SVG con `feGaussianBlur` a pantalla completa bloqueaba el hilo principal 6–8 s por fotograma sin GPU. Rondas de revisión (ver `git show 5cf73de`): encuadre `--fx` 50 % en lg solo con proporción ≥ 11:10; subida del texto acotada por la posición del eyebrow (0 en la banda vertical); la fila de índice no sube; máscara de la ruta en la banda vertical y en el pie; foco al final del escenario con `pointer-events` y `has-focus-visible`; `stage:` exige `(scripting: enabled)` y las media queries van en **rem** (con letra de 20 px, 768px y 48rem no coincidían); `sizes` con la banda vertical; `useMediaQuery` nuevo. **Pendiente para T11 (decisión 15 de T6): LCP móvil con DPR alto medido en revisión en 2,66–2,92 s, por encima de 2 500 ms** — P1 (imagen como slot) y T11 deben atacarlo.

### 8.2 Presupuesto de JS: hallazgo principal y tarea P1
Informe completo: `docs/superpowers/research/2026-09-24-presupuesto-js.md` (5 agentes, builds y mediciones reales).
- **Todo el JS del sitio salía compilado a ES5**: `browserslist: ["last 2 … versions"]` se resuelve a versiones (Chrome 151, Safari 26.4…) que Turbopack no conoce, y SWC activa todas las transformaciones (vercel/next.js#92091, abierto). Con versiones fijas (`chrome 111`, `edge 111`, `firefox 111`, `safari 16.4`, el objetivo por defecto de Next) la salida es moderna.
- Medido sobre T6 (`32836e8`), con `scripts/agent/measure-js.mjs` (mismo método que la línea base): **250 331 B → 219 972 B (−30 359 B)** aplicando cuatro cambios: browserslist fijo (−23 582), `animateSingleValue` en lugar de `animate()` en `HeroRoute` (−4 988), quitar `MagneticButton` (código muerto) de `Button` (−2 900) e imports estáticos en `page.tsx` en lugar de `next/dynamic` (−2 578). El HTML del servidor no cambia.
- **P1** (tarea de rendimiento, *antes* de la Fase 3): esos cuatro cambios + la imagen de la portada renderizada en el servidor y pasada a `HomeHero` como prop `media` (sin `next/image` dentro de la isla) + `scripts/check-modern-js.mjs` con `npm run check:modern-js` (falla si la salida vuelve a ES5). Especificación: §4 del informe; parches de referencia en `docs/superpowers/research/p1-parches/` (hechos sobre `32836e8`: adáptalos al código de T6 integrado). Revisión con las tres lentes (el cambio de browserslist también altera el CSS que genera Lightning CSS: capturas antes/después).
- **Evolución del JS de `/es`:** 239 002 B (línea base `b65e497`, ES5) → 233 003 B (T5) → 250 331 B (T6 sin corregir) → ≈ 250 KB tras T6 (250 331 B medidos sobre 32836e8; las rondas 2–3 no se midieron) → ≈ 220 KB esperado tras P1 → ≈ 221–230 KB proyectado al cerrar T10 (tope 269 722 B).
- **Reglas para T7–T10** (obligatorias; detalle y topes por tarea en §5 del informe): imágenes con `<Image … placeholder={coverPlaceholder(img)}>` renderizadas en el servidor y pasadas a la isla como `media`; nunca `placeholder="blur"`; motion solo `m`, `useScroll`/`useStageProgress`, `useTransform`, `useMotionValue`, `useMotionValueEvent`, `useInView`, `animateSingleValue` (prohibidos `animate`, `useAnimate`, `useSpring`, `stagger`, `AnimatePresence`, `domMax`, `motion.*`); sin dependencias nuevas ni `next/dynamic`; T9 saca `ConsoleFrame` a `src/components/sections/realty/ConsoleFrame.tsx` **sin** `"use client"`. Topes: T7 +4 000 B, T8 +3 000 B, T9 +2 500 B, T10 +3 000 B sobre la medida anterior. Cada tarea mide al cerrar y lo anota.
- **Descartado** (ver §6 del informe): quitar cabeceras de seguridad de `/_next/static` (solo baja la métrica local), hidratar en diferido (no baja el total), `next/dynamic` desde servidor (no divide y añade ~2,6 KB), reemplazar la arquitectura del plan por animaciones CSS ligadas al scroll (Firefox estable aún no las trae; quedan como técnica para fases futuras). **Opcionales para T11, solo si el usuario los quiere:** `tailwind-merge` fuera del cliente (−9 KB), `AnimatePresence` fuera del mega menú (−2 KB), `next/image` fuera de `/es` (−6 KB, rutas internas de Next).

### 8.3 Lo que falta, en orden
1. **P1 · rendimiento** (§8.2). Worktree desde la punta, `PORT=3130`, lentes `compliance`, `quality`, `visual`, `build` e `integBuild`.
2. **F3 · T7 ∥ T8 ∥ T9 ∥ T10a** en worktrees desde el commit de P1, cada una con su spec temporal (`e2e/home-t7.spec.ts`, `home-t8`, `home-t9`, `home-t10.spec.ts`), **sin integrar**. Argumentos listos en `docs/superpowers/handoff/2026-09-24-args-f3.json` (recalcula antes las líneas de cada sección: `grep -n '^## Tarea' docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md`; las tareas documentan decisiones en el plan y los números se desplazan). T10a = T10 sin los tres `describe` que necesitan la home entera («todos los h2 de la home se ven sin JavaScript», «T10 · Orden de la home», «T10 · Regla del azul en toda la home»).
3. **F4 · integración en serie** T7 → T8 → T9 → T10a en `redesign/home`: `page.tsx` con el orden del contrato §3.5; unir las claves de diccionario (cada tarea añade o borra solo las suyas); en `e2e/helpers.ts` conservar sin duplicar los añadidos (T8 `settledTopOffset`, T9 `FORBIDDEN_*`); fundir cada spec temporal en `e2e/home.spec.ts` (sin duplicar helpers locales) y borrarlo; lint, tsc, e2e **completo**, build tras T9 y T10a; medir el JS tras T9 y tras T10a. Después **T10b**: los tres `describe` de la home completa (regla del azul a 1440×900 y 390×844, con y sin reducir movimiento), con su revisión. Solo integrados se ven: la regla del azul entre secciones, el ancla `#gobierno` y el peso total.
4. **F5 · T11** (sección del plan) + lo que la investigación deja para T11 (§5 del informe: borrar `MagneticButton.tsx`, `CustomCursor`, `IntroSequence`, `SoundToggle`, `HeroCanvas`, `GlobalParticles`, `HeroScene` si siguen sin importadores; corregir el comentario de `MotionProvider`; proponer al usuario la línea de CLAUDE.md sobre browserslist) + **lo prometido al usuario en la sesión 2**:
   - `docs/superpowers/playbooks/rediseno-scroll-animado.md`: proceso (diseño → plan con contrato → tareas en worktrees → revisores independientes → integración en serie), patrones reutilizables (`FocalCover`, `ScrollStage`, `useStageProgress` y sus tres modos, variante `stage:`, velos de contraste medidos, regla del azul, `coverPlaceholder`, imagen como slot), presupuesto de JS y buenas prácticas 2026 con cifras, y los tropiezos de las sesiones 1 y 2.
   - Lista de preparación para el usuario antes de cada producto: qué imágenes hacen falta y cómo generarlas (prompts de ejemplo, 1536×1024, grises, nunca fotos falsas de equipo/clientes/despliegues), dónde dejarlas (`design/source/`), con qué nombres, y cómo se miden las coordenadas de las superposiciones (traspaso §3).
   - Workflow guardado `.claude/workflows/home-task-cycle.js` (ya existe: revisar y mejorar con lo aprendido en F3–F5).
   - Referencia de movimiento y scroll en el skill `.claude/skills/orbexs-design-system/` (lo usan los agentes de todos los productos Orbexs).
   - Verificación final (plan T11 paso 3 y prompt original §6): lint, tsc, build, `check:modern-js`, e2e completo; capturas (1440×900, 390×844, 10+ puntos, reducir movimiento, 1920×1080, 2560×1440) revisadas una a una; LCP < 2 500 ms y CLS < 0,1 con Slow 4G + CPU 4× en escritorio y móvil; JS − 239 002 ≤ 30 720; revisores visuales (escritorio, móvil, reducir movimiento, 1920/2560) y de rama (cumplimiento, calidad, rendimiento, a11y) en paralelo. Salidas en `docs/superpowers/verification/2026-09-23/`.
   - Sección «Estado al cierre» en este traspaso e informe final en español para el usuario (tareas y commits, pruebas con cifras, LCP y JS antes/después, desviaciones, pendientes: dominio `orbexs.tech`, 404 de `orbexs-alpha.vercel.app`, fase 2).

### 8.4 Preparar el Mac
```bash
git clone https://github.com/Rocuts/Nova-Forge.git && cd Nova-Forge   # o: git fetch && git checkout redesign/home && git pull
git checkout redesign/home
node -v                      # Node 22 (el contenedor usó 22.22)
npm ci
npx playwright install chromium          # en el Mac sí se permite (en el contenedor web no)
npx next typegen >/dev/null
export HEAVY_SLOTS=3                                  # procesos pesados a la vez (24 GB)
export CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS=8   # antes de abrir Claude Code
npm run lint && npx tsc --noEmit && npx playwright test   # debe quedar en verde (146 pruebas)
```
- Worktrees en `../wt/` (por defecto del workflow: carpeta hermana del repo). `scripts/agent/new-worktree.sh` clona `node_modules` con `cp -cR` (copy-on-write de APFS).
- `.env.local` no se versiona: sin `OPENAI_API_KEY` el diagnóstico devuelve el informe de respaldo (lo esperado en local); sin `REALTY_VOICE_DEMO_ENABLED` la demo de voz queda apagada, que es lo que prueban los e2e.
- Si una ejecución deja candados colgados: `rm -rf "${TMPDIR:-/tmp}/heavy-slots"`.

### 8.5 Cómo se ejecuta cada fase
Workflow guardado: `Workflow({ name: "home-task-cycle", args })`. Argumentos (cabecera del script): `repo` (ruta absoluta del checkout en el Mac), `wtRoot`, `agentBin` (por defecto `<repo>/scripts/agent`), `branch` (`redesign/home`), `integrate`, `maxRounds`, `machineNote`, `tasks[]` con `id`, `title`, `lines`, `port`, `build`, `integBuild`, `visual`, `visualHint`, `lenses`, `extra` e `impl` (para retomar una implementación ya hecha). Garantías: un revisor o corrector que no responde (p. ej. límite de uso) deja la tarea **sin integrar**; el integrador solo actúa con todas las revisiones recibidas y sin hallazgos bloqueantes ni mayores.
- **P1:** `integrate: true`, una tarea (`id: "P1"`, `lines`: las de §0–§4 del plan, `extra` = §4 del informe de JS).
- **F3:** `integrate: false`, las cuatro tareas de `2026-09-24-args-f3.json`.
- **F4:** escribir un workflow propio (integradores en serie + revisión del resultado integrado) y luego `home-task-cycle` para T10b.
- **F5:** workflow propio para T11 (implementador + revisores visuales y de rama en paralelo + corrector).

### 8.6 Lecciones de la sesión 2
- **Límite de uso de la cuenta:** a las 01:30 UTC se agotó; los tres revisores de T6 y su integrador fallaron al instante y la primera versión del script tomó «0 hallazgos» como aprobación (el integrador no llegó a actuar). Corregido: sin todas las revisiones no se integra, y se retoma con `tasks[i].impl`. Con más agentes en paralelo (Mac) el límite llega antes.
- **Los revisores encuentran fallos reales**: en T6, iPad Pro vertical (la cumbre fuera de pantalla), tabletas en scrub (contraste del texto que sube fuera del velo), foco en enlaces ya invisibles, `px` frente a `rem` entre `useStageMode` y la variante `stage:` (con letra grande del navegador, JS y CSS no coincidían). Mantén la lente `visual` en toda tarea que se vea, con viewports 1440×900, 1366×768, 1920×1080, 2560×1440, 2560×1080, 1024×1366, 820×1180, 390×844 y 844×390.
- **Medir antes de optimizar:** el peso de JS no venía de motion sino de una configuración (browserslist). Dos agentes independientes lo confirmaron con la misma cifra.
- **El contenedor web no trae `ss`** (se usó `/proc/net/tcp`) y **macOS no trae `flock`**: `scripts/agent/heavy.sh` usa candados con `mkdir` y funciona en ambos.
- Durante una integración, el checkout principal tiene cambios sin commitear (el `merge --squash`): es lo esperado; no los commitees a mano.
- Las líneas de las secciones del plan se desplazan cuando una tarea documenta decisiones en él: recalcula con `grep -n '^## Tarea'` antes de cada fase.
- e2e al cierre de la sesión 2: 146 pruebas en verde.
