# Plan de implementación — Home "Cartografía soberana" (fase 1)

**Fecha:** 2026-09-23 · **Rama:** `redesign/home`
**Contrato de diseño:** `docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md` (el "diseño").
**Decisiones técnicas y geometría:** `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md` (el "traspaso"). Donde el traspaso ajusta el diseño, manda el traspaso.

> **Para quien ejecute este plan:** cada tarea es autocontenida. Lee primero las secciones 0–4 de este documento (protocolo, grafo, contrato compartido); después, solo la sección de tu tarea. Escribe la prueba antes que el código y compruébala en rojo. No debilites, saltes ni desactives pruebas para ponerlas en verde.

**Objetivo:** llevar la home a la narrativa "infraestructura de IA para gobierno y empresas" con imagen fuerte y movimiento guiado por el scroll, sin cambiar la identidad monocroma de Orbexs, y corregir los fallos de auditoría que afectan a la home y al SEO.

**Arquitectura:** secciones de servidor con islas cliente solo donde hay movimiento (`m` + `LazyMotion strict`). El avance del scroll lo leen hooks de `motion/react` (`useScroll`); la altura larga y el `sticky` los pone CSS (`md:motion-safe:`), no JavaScript, para que no haya saltos de layout. Las imágenes y sus superposiciones SVG comparten un marco 3:2 (`FocalCover`) que se comporta como `object-fit: cover`.

**Stack:** Next 16.3 (App Router, Turbopack), React 19.2, Tailwind v4, `motion` 12, Playwright 1.58 + axe-core, `sharp` 0.35.3 (devDependency, solo para el pipeline de imágenes).

---

## 0. Estado previo (medido antes de tocar código)

| Comprobación | Resultado en `b65e497` |
|---|---|
| `npm run lint` | ✅ sin errores |
| `npx tsc --noEmit` | ✅ sin errores |
| `npm run build` | ✅ |
| `npx playwright test` (servidor de desarrollo) | ✅ 39/39 en 60 s |
| JS transferido al cargar `/es` (`next start`, 1440×900, caché desactivada, mediana de 3) | **239 002 bytes** en 15 scripts |
| LCP `/es`, Slow 4G (150 ms RTT, 1,6 Mbps) + CPU 4× | 900 ms (elemento LCP: el texto rotativo del H1) |
| CLS `/es` (mismas condiciones) | 0,007 |

**Entorno:** Playwright 1.58 espera Chromium rev. 1208 y el contenedor trae la 1194 preinstalada en `/opt/pw-browsers`. El entorno prohíbe `playwright install`, así que se enlazó la 1194 bajo los nombres de la 1208 (`/opt/pw-browsers/chromium-1208`, `chromium_headless_shell-1208`). Es un ajuste del contenedor, no del repositorio.

**Tarea 0 (hecha junto con este plan):** `playwright.config.ts` lee `PORT` (por defecto 3000) para que varios worktrees puedan correr la suite a la vez, cada uno con su servidor de desarrollo.

---

## 1. Protocolo de ejecución

### 1.1 Worktrees, puertos y ramas
- Cada tarea N se implementa en su propio worktree, creado **desde la punta actual de `redesign/home`** justo antes de empezar:
  ```bash
  git -C /home/user/Nova-Forge worktree add /home/user/wt/taskN -b wt/taskN redesign/home
  cp -al /home/user/Nova-Forge/node_modules /home/user/wt/taskN/node_modules   # enlaces duros: instantáneo y sin coste de disco
  ```
  (No usar un symlink de `node_modules`: Turbopack rechaza symlinks que salen de la raíz del proyecto.)
- Puerto del servidor de desarrollo de la tarea N: **`PORT=30N0`** (tarea 1 → 3010, tarea 10 → 3100, tarea 11 → 3110). Todas las órdenes de Playwright del worktree llevan ese `PORT`.
- El implementador hace commits en `wt/taskN` (los que quiera). **No hace push ni toca `/home/user/Nova-Forge`.**
- `next dev` puede reescribir el bloque `nextjs-agent-rules` de `AGENTS.md`; si aparece como cambio sin querer, se descarta con `git checkout AGENTS.md` (salvo en la tarea 11, que edita ese archivo a propósito).

### 1.2 Revisión
Un subagente revisor, distinto del implementador, lee `git diff redesign/home...wt/taskN` y comprueba:
1. **Cumplimiento:** el diseño, el traspaso, este plan (contrato §3 y la sección de la tarea) y CLAUDE.md (honestidad, RealTy, Live Studio, partnerships, tipografía, regla del azul).
2. **Calidad:** tipos, accesibilidad, hidratación (nada que dependa del cliente en el primer render), rendimiento (solo `transform`/`opacity`/`pathLength`), código muerto, estilo del código vecino.

Los hallazgos se corrigen en el mismo worktree antes de integrar.

### 1.3 Integración (siempre en serie, en `/home/user/Nova-Forge`)
```bash
cd /home/user/Nova-Forge
git merge --squash wt/taskN
npm run lint && npx tsc --noEmit
npx playwright test          # suite completa, puerto 3000
git commit                   # mensaje de §1.4
git push -u origin redesign/home
git worktree remove /home/user/wt/taskN --force && git branch -D wt/taskN
```
Si algo falla tras el merge, se corrige en `/home/user/Nova-Forge` antes del commit (causa raíz, nunca debilitando la prueba).

### 1.4 Mensaje de commit
```
<tipo>(home): <resumen en español, imperativo>

<qué cambia y por qué, 2–6 líneas>

Decisiones:
- <ambigüedad resuelta y su porqué>   (omitir el bloque si no hubo)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
```

### 1.5 Órdenes estándar de verificación (en el worktree)
```bash
npm run lint
npx tsc --noEmit
PORT=30N0 npx playwright test e2e/<spec-de-la-tarea>.spec.ts --reporter=line
PORT=30N0 npx playwright test --reporter=line      # suite completa antes de entregar
```
`npm run build` solo en las tareas que lo indiquen (1, 2, 6, 11): es lento y comparte CPU con otros worktrees.

---

## 2. Grafo de dependencias y archivos compartidos

```
T1 imágenes+logo ─────────┬─► T2 metadatos+OG ─┐
T3 copy de riesgo ──┐     │                    ├─► T6 ─► T7 ─► T8 ─► T9 ─► T10 ─► T11
T4 títulos+motion ──┴─────┴─► T5 nav+header ───┘
```
- **Oleada A (paralelo):** T1 ∥ T3 ∥ T4 — no comparten archivos.
- **Oleada B (paralelo):** T2 (tras T1) ∥ T5 (tras T3 y T4) — no comparten archivos.
- **Home (en serie):** T6 → T7 → T8 → T9 → T10. Luego T11.

| Archivo compartido (obliga a ir en serie) | Tareas que lo tocan |
|---|---|
| `src/content/dictionaries/es.ts` / `en.ts` | T3, T5, T6, T7, T8, T9, T10, T11 |
| `src/app/globals.css` | T5, T6, T10 |
| `e2e/smoke.spec.ts` | T5, T6, T7, T9, T10 |
| `src/app/[locale]/page.tsx` | T2 (metadatos), T6, T7, T8, T9, T10 |
| `src/components/sections/live-studio/Hero.tsx` | T4, T5 |
| `src/config/site.ts` | T1, T2 |
| `e2e/seo.spec.ts` | T1 (crea), T2 |
| `e2e/home.spec.ts` | T6 (crea), T7, T8, T9, T10 |
| `e2e/helpers.ts` | T4 (crea), T5–T10 |
| `src/lib/page-meta.ts` | T2 (crea), T6 (título de la home) |
| `src/components/sections/TechStack.tsx` | T6 (logos), T10 |
| `src/components/sections/realty/Hero.tsx` | T5 (`data-header-start`), T9 (exporta `ConsoleFrame`) |
| `e2e/a11y.spec.ts` | T5 |
| `e2e/realty.spec.ts` | T9 (exporta listas negras a `e2e/helpers.ts`) |

---

## 3. Contrato compartido

Todo lo de esta sección es vinculante para todas las tareas: nombres, tipos, textos y atributos. Si una tarea necesita cambiar algo de aquí, lo documenta en su commit.

### 3.1 Colores, contraste y la regla del azul
| Uso | Valor |
|---|---|
| Fondo oscuro / elevado / borde | `#0a0a0a` / `#141414` / `#1a1a1a` |
| Fondo claro / gris / borde | `#ffffff` / `#f8f8f8` / `#e5e5e5` |
| Texto claro | `#0a0a0a`, `#525252`; en oscuro `#ffffff`, `#a3a3a3` |
| **Azul** `#2563eb` = `rgb(37, 99, 235)` | **solo** "lo que el sistema está procesando ahora": punto de la cumbre (portada), nodo activo (Capacidades), recuadro del campo activo (Del papel al dato). **Nunca más de un elemento azul visible a la vez.** |
| Capa de instrumento | Geist Mono 10–11 px, mayúsculas, `tracking-[0.3em]`. Sobre blanco o `#f8f8f8`: `#707070`; sobre oscuro: `#a3a3a3`. |
| Tesis (palabra inactiva → activa) | `#737373` → `#0a0a0a` (el `#a3a3a3` del diseño daría 2,5:1) |
| Fases inactivas de Metodología | `#737373` |
| Recuadro de campo terminado (Del papel al dato) | `#0a0a0a` (se dibuja sobre papel claro); activo: `#2563eb`, trazo 3 |
| Panel del expediente | `#141414`, borde `#1a1a1a`; fila en espera `#a3a3a3`, terminada `#ffffff`. Nada azul en el panel. |

Sin sombras, sin glow, sin grano, sin degradados de color. Radios del design system (`rounded-[2px]`, `[6px]`).

### 3.2 Diccionarios (`es.ts` / `en.ts`)
El español es la referencia; el inglés se mantiene en paralelo y con **la misma forma** (mismas claves y longitudes de arrays). Tras cada tarea, `typeof es` y `typeof en` siguen siendo compatibles (`tsc` lo vigila vía `Dictionary`).

**T3 — copy de riesgo** (texto exacto en la sección de T3): `products.dataExtraction.features[2]`, `features[3]`, `capabilities[0].items`, y la respuesta 4 de `faq.items`.

**T5 — navegación y footer:**
```ts
nav: {
  items: [
    { name: "Servicios", opensMenu: true },          // en: "Services"
    { name: "Productos", opensMenu: true },          // en: "Products"
    { name: "Empresa", href: "/nosotros" },          // en: "Company"
  ],
  platformLinks: [ /* los 5 platformChildren actuales, SIN RealTy, mismos textos */ ],
  solutionsLinks: [ /* los 3 solutionsChildren actuales */ ],
  productLinks: [
    { name: "RealTy", href: "/realty",
      description: "Infraestructura de ventas con IA para promotores inmobiliarios" },
      // en: "AI sales infrastructure for real-estate developers"
    { name: "Orbexs Live Studio", href: "/estudio-tiktok-live",
      description: "Estudio de producción en vivo para creadores de LATAM" },
      // en: "Live production studio for LATAM creators"
  ],
  contact, schedule, menuLabel,                        // sin cambios
},
footer: {
  tagline, platform,                                   // sin cambios
  platformLinks: [ /* los 5 actuales, SIN RealTy */ ],
  solutions: "Soluciones",                             // en: "Solutions"
  solutionsLinks: [ /* Sistemas Críticos, Inteligencia Operativa, Automatización de Gobierno, con sus href */ ],
  products: "Productos",                               // en: "Products"
  productLinks: [
    { name: "RealTy", href: "/realty" },
    { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
    { name: "Programa para creadores", href: "/estudio-tiktok-live" },   // en: "Creator program"
    { name: "Marcas y campañas", href: "/agendar" },                     // en: "Brands and campaigns"
  ],
  company, companyLinks, legal, privacy, terms, copyright,   // sin cambios
  // se eliminan: studio, studioLinks
}
```
Se elimina el placeholder `children: [{ name: "", href: "" }]`, `platformChildren`, `solutionsChildren` y `accent`.

**T6 — portada** (se eliminan `titleLead`, `titleHighlight`, `titleRotating`, `trustLine`; `trustBar.label` se conserva, ahora lo usa TechStack):
```ts
hero: {
  eyebrow: "INFRAESTRUCTURA DE MISIÓN CRÍTICA",       // sin cambios; el índice "/0.1 · " lo pinta el componente
  title: "Construimos soberanía digital.",            // en: "We build digital sovereignty."
  description: /* sin cambios */,
  primaryAction: /* sin cambios */,
  secondaryAction: /* sin cambios: href "#capacidades" */,
  nurtureCta: {
    label: "Ver casos de uso para sector público",   // en: sin cambios
    href: "#gobierno",                                // en: "#government"
    analyticsEvent: "hero_nurture_cta",
  },
  indexItems: ["IA SOBERANA", "DEFENSA CIBERNÉTICA", "OPERACIONES AUTÓNOMAS", "SISTEMAS CRÍTICOS"],
  // en: ["SOVEREIGN AI", "CYBER DEFENSE", "AUTONOMOUS OPERATIONS", "CRITICAL SYSTEMS"]
  imageLabel: "Imagen ilustrativa",                   // en: "Illustrative image"
  scrollHint: "Desplazar",                            // en: "Scroll"   (la flecha ↓ la pinta el componente, aria-hidden)
},
```

**T7 — tesis y capacidades** (se elimina `flagshipAI`):
```ts
thesis: {
  text: "Diseñamos, desplegamos y operamos sistemas de software, inteligencia artificial y ciberseguridad para organizaciones donde la falla no es una opción.",
  // en: "We design, deploy and operate software, artificial intelligence and cybersecurity systems for organizations where failure is not an option."
},
services: { /* sin cambios */ ..., imageLabel: "Imagen ilustrativa" /* en: "Illustrative image" */ },
```

**T8 — del papel al dato:**
```ts
dossier: {
  sectionId: "gobierno",                              // en: "government"
  eyebrow: "GOBIERNO Y DATOS",                        // en: "GOVERNMENT & DATA"
  title: "Del expediente al dato estructurado.",      // en: "From case file to structured data."
  description: "Automatizamos trámites y registros: los documentos entran, cada campo se identifica y se valida, y cada dato queda con su trazabilidad.",
  // en: "We automate procedures and records: documents come in, every field is identified and validated, and every data point keeps its audit trail."
  fields: ["Nombre", "Fecha de nacimiento", "Domicilio", "Correo electrónico", "Tipo de trámite", "Fecha de solicitud"],
  // en: ["Name", "Date of birth", "Address", "Email", "Procedure type", "Application date"]
  status: { idle: "En espera", active: "Procesando", done: "Extraído" },
  // en: { idle: "Waiting", active: "Processing", done: "Extracted" }
  counterLabel: "Campos extraídos",                   // en: "Fields extracted"
  imageAlt: "Expediente de solicitud abierto sobre un escritorio, con formularios mecanografiados",
  // en: "Open application case file on a desk, with typed forms"
  imageLabel: "Ilustración · datos ficticios",        // en: "Illustration · fictitious data"
  links: [
    { label: "Automatización de gobierno", href: "/automatizacion-gobierno" },   // en: "Government automation"
    { label: "Extracción de datos", href: "/extraccion-datos" },                // en: "Data extraction"
  ],
},
```

**T9 — lo que ya construimos** (se elimina `liveStudioTeaser`; `caseStudy` se queda porque lo usa `llms.txt`):
```ts
built: {
  sectionId: "construido",                            // en: "built"
  eyebrow: "PRODUCTOS PROPIOS",                       // en: "OUR OWN PRODUCTS"
  title: "Productos que ya construimos.",             // en: "Products we have already built."
  realtyName: "RealTy",                               // en: "RealTy"
  realtyCta: "Conocer RealTy",                        // en: "Explore RealTy"
  studioCta: { label: "Conocer el estudio", href: "/estudio-tiktok-live" },  // en: "Explore the studio"
},
caseStudy: {
  /* claves actuales sin cambios */,
  ownership: "Lo construimos primero para nuestra propia división, Orbexs Live Studio.",
  // en: "We built it first for our own division, Orbexs Live Studio."
  summary: {
    context: "Un estudio que transmite en vivo en TikTok no puede quedarse fuera del aire, y su mesa de ayuda dependía de tener un técnico disponible en el momento exacto del incidente.",
    // en: "A studio broadcasting live on TikTok cannot go off the air, and its help desk depended on having a technician available at the exact moment of the incident."
    solution: "Un agente de IA opera la mesa de ayuda: diagnostica y remedia incidentes durante la transmisión, y escala a un técnico humano solo cuando la remediación automática no basta.",
    // en: "An AI agent runs the help desk: it diagnoses and remediates incidents during the broadcast, and escalates to a human technician only when automated remediation is not enough."
    outcome: "La infraestructura se mantiene operativa durante las transmisiones y el equipo técnico se dedica a producir en lugar de hacer soporte reactivo.",
    // en: "The infrastructure stays up throughout broadcasts, and the technical team focuses on production instead of reactive support."
  },
},
```
*Decisión:* el diseño pide "contexto, solución y resultado actuales, resumidos". El resumen condensa el texto existente sin añadir capacidades ni cifras.

**T10:** sin claves nuevas (Metodología, Tecnologías, FAQ y Cierre usan las actuales).

**T11:** elimina cualquier clave que haya quedado sin uso (comprobar con `grep` sobre `src/` y `e2e/`).

### 3.3 Módulos nuevos y sus firmas

```ts
// src/hooks/useStageProgress.ts  ("use client")               — T6
export type StageMode = "scrub" | "inView" | "static"
export function useStageMode(): StageMode
//   "scrub" en el servidor y en el primer render del cliente (hidratación idéntica).
//   Tras montar: (prefers-reduced-motion: reduce) → "static";
//   (min-width: 768px) and (prefers-reduced-motion: no-preference) → "scrub"; si no → "inView".
//   Escucha los cambios de ambas media queries; setState dentro de queueMicrotask.
type ScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>
export type StageOffset = ScrollOptions["offset"]
export function useStageProgress(
  ref: React.RefObject<HTMLElement | null>,
  offset?: StageOffset,               // por defecto ["start start", "end end"]
): { progress: MotionValue<number>; mode: StageMode }

// src/components/ui/InstrumentLabel.tsx  (sin hooks)          — T6
export function InstrumentLabel(props: {
  children: React.ReactNode
  tone?: "light" | "dark"             // tono de la SUPERFICIE: light → #707070, dark → #a3a3a3 (por defecto "dark")
  as?: "span" | "p" | "div"
  className?: string
}): JSX.Element                        // font-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em]

// src/components/ui/FocalCover.tsx  (sin hooks)               — T6
export function FocalCover(props: {
  className?: string                   // marco: posición absoluta + punto focal, p. ej. "[--fx:92%] md:[--fx:80%] lg:[--fx:50%]"
  children: React.ReactNode            // <Image fill className="object-cover" …/> + <svg viewBox="0 0 1536 1024" …/>
}): JSX.Element                        // <div class="focal-frame {className}"><div class="focal-cover">{children}</div></div>

// src/components/ui/ScrollStage.tsx  (sin hooks; se usa desde islas cliente)   — T6
export function ScrollStage(props: {
  ref?: React.Ref<HTMLElement>
  id?: string
  track: "short" | "long"             // short → md:motion-safe:h-[160svh]; long → md:motion-safe:h-[250svh]
  mode: StageMode                      // → data-stage-mode
  theme: "light" | "dark"             // → data-header-theme
  startsDark?: boolean                 // → data-header-start="dark"
  className?: string                   // <section>
  frameClassName?: string              // marco: "relative md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh md:motion-safe:overflow-hidden" + esto
  children: React.ReactNode
}): JSX.Element

// src/components/sections/home/geometry.ts                     — T6 (T7 y T8 lo leen; ya trae los 3 bloques)
export const IMAGE_WIDTH = 1536, IMAGE_HEIGHT = 1024
export const VIEWBOX = "0 0 1536 1024"
export const ROUTE_PATH: string        // literal del traspaso §3
export const ROUTE_SUMMIT: { readonly x: 1283; readonly y: 421 }
export const CAPABILITY_NODES: readonly { x: number; y: number }[]   // 8, orden de dict.services.items
export const DOSSIER_FIELDS: readonly { x: number; y: number; width: number; height: number }[]  // 6, orden de dict.dossier.fields

// src/components/ui/TrustLogos.tsx  ("use client" no es necesario)            — T6
export function TrustLogos(props: { label: string; className?: string }): JSX.Element
//   Fila de logos de TrustBar SIN <section>, sin fundido de entrada; conserva data-brand-wordmark="vercel".

// src/lib/page-meta.ts                                         — T2 (T6 cambia el cardTitle de la home)
export const PAGE_PATHS: readonly [ "/", "/agendar", "/diagnostico", "/privacidad", "/terminos",
  "/soberania-ia", "/ciberseguridad", "/fuerza-digital", "/sistemas-criticos", "/inteligencia-operativa",
  "/automatizacion-gobierno", "/enriquecimiento-datos", "/extraccion-datos", "/estudio-tiktok-live",
  "/realty", "/inversores", "/nosotros" ]           // mismo orden que src/app/sitemap.ts
export type InternalPath = (typeof PAGE_PATHS)[number]
export interface PageMeta {
  title: string            // sin sufijo de marca (el layout aplica "%s | Orbexs")
  absoluteTitle: boolean   // true solo en la home: su title ya es "Orbexs — {titleSuffix}"
  description: string
  eyebrow: string          // capa de instrumento de la imagen para redes
  cardTitle: string        // título grande de la imagen para redes
}
export function getPageMeta(dict: Dictionary, path: InternalPath): PageMeta
export function realtyTitle(realty: Dictionary["realty"]): string          // movido desde realty/page.tsx
export function realtyMetaDescription(realty: Dictionary["realty"]): string // ídem (antes metaDescription)

// src/lib/metadata.ts                                          — T2
export async function pageMetadata(locale: string, path: InternalPath): Promise<Metadata>
//   {} si el locale no es válido. Devuelve title (o { absolute }), description, alternates (buildAlternates),
//   openGraph { type: "website", siteName: "Orbexs", locale: es_ES|en_US, alternateLocale, url canónica absoluta,
//   title: "Título | Orbexs" (home: título absoluto), description } y twitter { card: "summary_large_image", title, description }.
//   Nunca fija images: las inyecta la convención opengraph-image.tsx.

// src/lib/social-image.tsx                                     — T2
export const socialImageSize = { width: 1200, height: 630 }
export async function renderPageSocialImage(opts: { locale: string; path: InternalPath }): Promise<ImageResponse>
//   Fondo public/images/og/relieve-og.jpg (leído con fs), degradado a #0a0a0a, logo Orbexs en SVG (las 2 losas),
//   eyebrow en mono y cardTitle. Sin el monograma "NF".
```

### 3.4 Atributos para pruebas (`data-*`)
| Atributo | Dónde | Valores |
|---|---|---|
| `data-header-theme` | toda sección nueva de la home (T6–T10) y las secciones oscuras existentes (las claras de otras páginas pueden omitirlo: sin atributo cuenta como clara) | `light` \| `dark` |
| `data-header-start="dark"` | primera sección de: portada de la home, `realty/Hero.tsx`, primera sección de `InvestorsPage.tsx`, `live-studio/Hero.tsx` | — |
| `.site-header[data-tone]` | `<header>` | ausente antes de hidratar; luego `light` \| `dark` \| `menu` |
| `.site-header[data-scrolled="true"]` | `<header>` | presente tras 50 px de scroll |
| `#site-mega-menu` | panel del mega menú | — |
| `data-stage-mode` | `<section>` de cada sección animada de la home (portada, tesis, capacidades, expediente, construido, metodología, cierre) | `scrub` \| `inView` \| `static` |
| `data-stage-frame` | marco `sticky` de `ScrollStage` | — |
| `data-hero-route`, `data-complete` | `<svg>` de la ruta de la portada | `data-complete="true"` cuando la ruta está entera |
| `data-hero-summit` | punto azul de la cumbre | — |
| `data-thesis-word`, `data-active` | cada palabra de la tesis | `true` \| `false` |
| `data-capability-row` | cada `<li>` de Capacidades | — |
| `data-node`, `data-lit`, `data-active` | cada `<g>` de nodo | `true` \| `false` |
| `data-capabilities-counter` | contador `0N / 08` | — |
| `data-dossier-field`, `data-state` | cada `<rect>` de campo | `idle` \| `active` \| `done` |
| `data-dossier-row`, `data-state` | cada fila del panel | `idle` \| `active` \| `done` |
| `data-dossier-counter` | contador `0N / 06` | — |
| `data-built-card` | tarjeta de RealTy y de Live Studio | `realty` \| `studio` |
| `data-studio-step`, `data-lit` | cada capacidad `01`–`06` del caso | `true` \| `false` |
| `data-method-phase`, `data-active` | cada fase de Metodología | `true` \| `false` |
| `data-method-line` | línea de Metodología | — |
| `data-brand-wordmark` | wordmark de Vercel (exento de contraste, ya excluido en axe) | `vercel` |

### 3.5 Orden y tema de las secciones de la home (resultado de T10)
| # | Sección | `id` es / en | Tema | Componente |
|---|---|---|---|---|
| 1 | Portada | `inicio` / `inicio` | oscuro, `data-header-start="dark"` | `home/HomeHero.tsx` + `HeroRoute.tsx` |
| 2 | Tesis | — | claro | `home/Thesis.tsx` |
| 3 | Capacidades | `capacidades` / `capacidades` | claro | `home/CapabilitiesIndex.tsx` |
| 4 | Del papel al dato | `gobierno` / `government` | oscuro | `home/Dossier.tsx` |
| 5 | Lo que ya construimos | `construido` / `built` | oscuro, `border-t border-[#1a1a1a]` | `home/BuiltProof.tsx` (+ islas) |
| 6 | Metodología | `metodologia` / `metodologia` | claro | `home/MethodologyLine.tsx` |
| 7 | Tecnologías | `tecnologias` / `technologies` | `#f8f8f8` | `TechStack.tsx` (+ `TrustLogos`) |
| 8 | Preguntas frecuentes | `faq` / `faq` | `bg-white` | `FAQ.tsx` (`h3 > button`) |
| 9 | Cierre | — | oscuro, relieve inferior | `CTA.tsx` |

`src/app/[locale]/page.tsx` conserva el JSON-LD `FAQPage` generado desde `dict.faq.items` y su `generateMetadata` pasa a `pageMetadata(locale, "/")` (T2).

### 3.6 Reglas de movimiento (todas las secciones animadas)
- Solo se animan `transform`, `opacity` y `pathLength` (y `stroke`/`fill`/`color` como cambio de estado discreto, sin interpolar en bucle).
- `static` (reducir movimiento): estado final, sin sticky (lo quita CSS), sin zoom.
- `inView` (< 768 px): sin sticky; la animación se dispara una vez al entrar en pantalla.
- `scrub` (≥ 768 px): el avance del contenedor (0→1) controla la animación.
- `h1`/`h2` visibles desde el servidor: nunca `opacity: 0` ni `visibility: hidden` en ellos ni en sus ancestros.
- Superposiciones SVG: `viewBox="0 0 1536 1024"`, `preserveAspectRatio="xMidYMid slice"`, `aria-hidden="true"`, dentro de `FocalCover`. Trazos con `vectorEffect="non-scaling-stroke"`.
- Hidratación: nada que dependa de `window`, `matchMedia` o `useReducedMotion` puede cambiar el HTML del primer render; los `initial` de `m.*` son idénticos para todos.

### 3.7 Convenciones de pruebas e2e
- `e2e/helpers.ts` (lo crea T4; los demás lo amplían, nunca lo duplican):
  - `effectiveOpacity(locator)` → producto de la opacidad calculada del elemento y todos sus ancestros (`toBeVisible()` considera visible un elemento con `opacity: 0`).
  - `scrollToY(page, y)` → `window.scrollTo({ top: y, behavior: "instant" })` + espera de dos frames (`globals.css` tiene `scroll-behavior: smooth`).
- Pruebas sin JavaScript: `test.use({ javaScriptEnabled: false })` en un `describe` propio.
- Reducir movimiento: `test.use({ contextOptions: { reducedMotion: 'reduce' } })` (en Playwright 1.58 `reducedMotion` no es una opción de primer nivel de `test.use`: `tsc` da TS2353) o `page.emulateMedia({ reducedMotion: 'reduce' })` **antes** de `goto`.
- Textos esperados siempre desde los diccionarios (`import es from '../src/content/dictionaries/es'`), nunca literales duplicados.
- Nada de `waitForTimeout` para esperar estados que tienen un atributo observable: usar `expect.poll` o `toHaveAttribute`.

---

## 4. Índice de tareas

| # | Tarea | Prueba nueva | Crea | Borra |
|---|---|---|---|---|
| 1 | Proceso de imágenes y logo | `e2e/seo.spec.ts` (logos), `npm run images:verify` | `scripts/process-images.mjs`, `scripts/verify-images.mjs`, `design/source/*`, `src/assets/images/*`, `public/images/og/relieve-og.jpg`, `public/logo.{svg,png}` | `design/moodboard/*` (se mueve) |
| 2 | Metadatos por página e imágenes para redes | `e2e/seo.spec.ts` | `src/lib/page-meta.ts`, `src/lib/metadata.ts`, 17 × `opengraph-image.tsx` | `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx` |
| 3 | Copy de riesgo | `e2e/copy.spec.ts` | — | — |
| 4 | Títulos visibles y reducir movimiento | `e2e/motion.spec.ts` | `e2e/helpers.ts` | — |
| 5 | Navegación y encabezado | `e2e/header.spec.ts` (+ smoke, a11y) | — | — |
| 6 | Primitivas y portada | `e2e/home.spec.ts` | hook, `InstrumentLabel`, `FocalCover`, `ScrollStage`, `TrustLogos`, `home/{geometry,HomeHero,HeroRoute}` | `sections/Hero.tsx`, `sections/TrustBar.tsx` |
| 7 | Tesis y Capacidades | `e2e/home.spec.ts` | `home/{Thesis,CapabilitiesIndex}.tsx` | `Services.tsx`, `FlagshipAI.tsx`, clave `flagshipAI` |
| 8 | Del papel al dato | `e2e/home.spec.ts` | `home/Dossier.tsx` | — |
| 9 | Lo que ya construimos | `e2e/home.spec.ts` | `home/BuiltProof.tsx` (+ islas) | `CaseStudy.tsx`, `LiveStudioTeaser.tsx`, clave `liveStudioTeaser` |
| 10 | Metodología, cierre y FAQ | `e2e/home.spec.ts` | `home/MethodologyLine.tsx` | `Methodology.tsx` |
| 11 | Limpieza, docs y verificación final | informe de verificación | `scripts/measure-home.mjs`, `scripts/capture-home.mjs` | claves y archivos muertos |

Revisiones del traspaso (§5 "Review Focus") y dónde se prueban:
1. 1366×768 y 2560×1080: CTA caben y la cumbre queda en pantalla → **T6**.
2. Enlace `#gobierno` desde la portada deja la sección arriba del viewport → **T8**.
3. Escritorio → celular: Capacidades pasa a `inView` sin errores y completa la red → **T7**.
4. Sin JavaScript: título visible y encabezado claro sobre la portada negra → **T6** (y T5 en `/es/inversores`).
5. La home en inglés muestra las claves nuevas traducidas → **T6–T9** (cada una añade las suyas).

---
