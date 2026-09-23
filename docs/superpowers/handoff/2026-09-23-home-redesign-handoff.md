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
