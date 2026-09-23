# Plan de implementación — Home "Cartografía soberana" (fase 1)

**Fecha:** 2026-09-23 · **Rama:** `redesign/home`
**Contrato de diseño:** `docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md` (el "diseño").
**Decisiones técnicas y geometría:** `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md` (el "traspaso"). Donde el traspaso ajusta el diseño, manda el traspaso.

> **Para quien ejecute este plan:** cada tarea es autocontenida. Lee primero las secciones 0–4 de este documento (protocolo, grafo, contrato compartido); después, solo la sección de tu tarea. Escribe la prueba antes que el código y compruébala en rojo. No debilites, saltes ni desactives pruebas para ponerlas en verde.

**Objetivo:** llevar la home a la narrativa "infraestructura de IA para gobierno y empresas" con imagen fuerte y movimiento guiado por el scroll, sin cambiar la identidad monocroma de Orbexs, y corregir los fallos de auditoría que afectan a la home y al SEO.

**Arquitectura:** secciones de servidor con islas cliente solo donde hay movimiento (`m` + `LazyMotion strict`). El avance del scroll lo leen hooks de `motion/react` (`useScroll`); la altura larga y el `sticky` los pone CSS (`stage:`), no JavaScript, para que no haya saltos de layout. Las imágenes y sus superposiciones SVG comparten un marco 3:2 (`FocalCover`) que se comporta como `object-fit: cover`.

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
//   (min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference) → "scrub"; si no → "inView".
//   Es la misma condición que la variante CSS `stage:` (§3.6).
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
  track: "short" | "long"             // short → stage:h-[160svh]; long → stage:h-[250svh]
  mode: StageMode                      // → data-stage-mode
  theme: "light" | "dark"             // → data-header-theme
  startsDark?: boolean                 // → data-header-start="dark"
  className?: string                   // <section>
  frameClassName?: string              // marco: "relative stage:sticky stage:top-0 stage:h-svh stage:overflow-hidden" + esto
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
- `inView` (< 768 px de ancho, o < 600 px de alto como un celular apaisado): sin sticky; la animación se dispara una vez al entrar en pantalla.
- `scrub` (≥ 768 px de ancho **y** ≥ 600 px de alto, sin reducir movimiento): el avance del contenedor (0→1) controla la animación.
- **Variante CSS `stage:`** (la crea T6 en `globals.css`): `@custom-variant stage (@media (min-width: 48rem) and (min-height: 37.5rem) and (prefers-reduced-motion: no-preference));`. Toda altura larga, `sticky` o ajuste propio del modo `scrub` usa `stage:` (nunca `md:motion-safe:`), para que CSS y `useStageMode()` coincidan siempre. *Decisión:* sin el requisito de alto, un celular apaisado de ≥ 768 px de ancho (844×390) entraba en `scrub` y el marco `h-svh` con `overflow-hidden` recortaba el contenido.
- `h1`/`h2` visibles desde el servidor: nunca `opacity: 0` ni `visibility: hidden` en ellos ni en sus ancestros.
- Superposiciones SVG: `viewBox="0 0 1536 1024"`, `preserveAspectRatio="xMidYMid slice"`, `aria-hidden="true"`, dentro de `FocalCover`.
- Trazos: **nunca** combinar `vectorEffect="non-scaling-stroke"` con un trazo animado por `pathLength` (en Chromium el guion se calcula en unidades de la imagen y se pinta en píxeles de pantalla: una línea al 50 % a media escala sale entera, y la ruta de la portada se quedaría en ~60–80 % en pantallas grandes). Los trazos animados con `pathLength` fijan su grosor en unidades de la imagen (≈ 1,1 unidades ≈ 1 px a 1440 px de ancho). `non-scaling-stroke` solo en trazos que no usan `pathLength` (p. ej. los recuadros del expediente, que aparecen con un fundido).
- Hidratación: nada que dependa de `window`, `matchMedia` o `useReducedMotion` puede cambiar el HTML del primer render; los `initial` de `m.*` son idénticos para todos.

### 3.7 Convenciones de pruebas e2e
- `e2e/helpers.ts` (lo crea T4; los demás lo amplían, nunca lo duplican):
  - `effectiveOpacity(locator)` → producto de la opacidad calculada del elemento y todos sus ancestros (`toBeVisible()` considera visible un elemento con `opacity: 0`).
  - `scrollToY(page, y)` → `window.scrollTo({ top: y, behavior: "instant" })` + espera de dos frames (`globals.css` tiene `scroll-behavior: smooth`).
  - `waitForFrames(page, count)` → espera `count` frames de animación (T5).
  - `countVisibleBlue(page): Promise<number>` → cuenta los elementos **visibles dentro del viewport** cuyo `color`, `fill`, `stroke`, `background-color` o `border-color` calculado es `rgb(37, 99, 235)` (T6).
  - `settledTopOffset(locator)` → distancia del elemento al borde superior del viewport, medida cuando el scroll lleva dos frames quieto; para usar con `expect.poll` (T8).
  - `FORBIDDEN_STEMS`, `FORBIDDEN_WORDS`, `findForbiddenTerms(text)` → lista negra de RealTy compartida con `e2e/realty.spec.ts` (T9).
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

## Tarea 1 — Proceso de imágenes y logo

**Depende de:** nada. Va en la oleada A, en paralelo con T3 y T4, sin archivos en común.
**Archivos compartidos:** `src/config/site.ts` (T2 lo vuelve a tocar) y `e2e/seo.spec.ts` (T1 lo crea y T2 lo amplía). En este plan, `package.json` y `package-lock.json` solo los toca T1.
**Worktree y puerto:** `/home/user/wt/task1` (rama `wt/task1`), `PORT=3010`.

```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task1 -b wt/task1 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task1/node_modules
cd /home/user/wt/task1
```

**Objetivo:** llevar las cuatro imágenes aprobadas a `design/source/` como PNG en gris de 8 bits y de un canal, y generar a partir de ellas lo que usarán T2 y T6–T10:
- las imágenes de la home (`src/assets/images/*.jpg`);
- el fondo de las imágenes para redes;
- el logo en SVG y en PNG.

Además, se corrige el JSON-LD `Organization`, que hoy apunta a un `/logo.svg` que no existe (404).

### Archivos

| Acción | Ruta |
|---|---|
| Crear | `scripts/process-images.mjs`, `scripts/verify-images.mjs` |
| Crear (binarios, generados) | `design/source/{relieve,lamina,expediente,arquitectura}.png`, `src/assets/images/{relieve,lamina,expediente}.jpg`, `public/images/og/relieve-og.jpg`, `public/logo.png` |
| Crear | `public/logo.svg`, `e2e/seo.spec.ts` |
| Modificar | `package.json`, `package-lock.json`, `src/config/site.ts`, `next.config.ts` |
| Borrar (se mueven) | `design/moodboard/A1-v2.png`, `A2-v2.png`, `B1.png`, `C1-v2.png` |

| Fuente actual | Destino | Uso |
|---|---|---|
| `design/moodboard/A1-v2.png` | `design/source/relieve.png` | portada, cierre, fondo de las imágenes para redes |
| `design/moodboard/A2-v2.png` | `design/source/lamina.png` | Capacidades |
| `design/moodboard/C1-v2.png` | `design/source/expediente.png` | Del papel al dato |
| `design/moodboard/B1.png` | `design/source/arquitectura.png` | fase 2 (no se procesa ahora) |

### Paso 1 — Prueba primero

La prueba tiene dos partes:
- `npm run images:verify` comprueba las imágenes: dimensiones, 1 canal, 8 bits, papel de la lámina en `#ffffff` y logo opaco sobre blanco.
- `e2e/seo.spec.ts` comprueba el diseño §12, prueba 5 (`/logo.svg` y `/logo.png` responden 200) y que el JSON-LD `Organization` apunte a `/logo.png`.

**1.1** En `package.json`, añade los dos scripts.

Antes:
```json
    "lint": "eslint .",
    "test:e2e": "npx playwright test"
  },
```
Después:
```json
    "lint": "eslint .",
    "test:e2e": "npx playwright test",
    "images": "node scripts/process-images.mjs",
    "images:verify": "node scripts/verify-images.mjs"
  },
```

**1.2** Crea `scripts/verify-images.mjs`:
```js
// Prueba del pipeline de imágenes: `npm run images:verify`.
// Comprueba fuentes y salidas de scripts/process-images.mjs (diseño §7; traspaso §4).
// Sale con código 1 y la lista de fallos si algo no cuadra.
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))

const SOURCE = { width: 1536, height: 1024, channels: 1, format: "png" }
const PROCESSED = { width: 2560, height: 1707, channels: 1, format: "jpeg" }

const EXPECTED = [
  { path: "design/source/relieve.png", ...SOURCE },
  { path: "design/source/lamina.png", ...SOURCE },
  { path: "design/source/expediente.png", ...SOURCE },
  { path: "design/source/arquitectura.png", ...SOURCE },
  { path: "src/assets/images/relieve.jpg", ...PROCESSED },
  { path: "src/assets/images/lamina.jpg", ...PROCESSED, paperWhite: "design/source/lamina.png" },
  { path: "src/assets/images/expediente.jpg", ...PROCESSED },
  { path: "public/images/og/relieve-og.jpg", width: 1200, height: 630, channels: 1, format: "jpeg" },
  { path: "public/logo.png", width: 512, height: 512, format: "png", whiteCorner: true },
]

const failures = []
const fail = (path, message) => failures.push(`${path}: ${message}`)

/** Valor por debajo del cual queda la fracción `p` de los píxeles (imagen de 1 canal). */
function percentile(data, p) {
  const histogram = new Uint32Array(256)
  for (const value of data) histogram[value]++
  const target = Math.ceil(data.length * p)
  let seen = 0
  for (let value = 0; value < 256; value++) {
    seen += histogram[value]
    if (seen >= target) return value
  }
  return 255
}

/** Proporción de píxeles que cumplen `test`. */
function share(data, test) {
  let count = 0
  for (const value of data) if (test(value)) count++
  return count / data.length
}

if (existsSync(fromRoot("design/moodboard"))) {
  fail("design/moodboard", "debe moverse a design/source (ya no debe existir)")
}

for (const expected of EXPECTED) {
  const file = fromRoot(expected.path)
  if (!existsSync(file)) {
    fail(expected.path, "no existe")
    continue
  }
  const meta = await sharp(file).metadata()
  if (meta.format !== expected.format) fail(expected.path, `formato ${meta.format}, se esperaba ${expected.format}`)
  if (meta.width !== expected.width || meta.height !== expected.height) {
    fail(expected.path, `mide ${meta.width}×${meta.height}, se esperaba ${expected.width}×${expected.height}`)
  }
  if (expected.channels !== undefined && meta.channels !== expected.channels) {
    fail(expected.path, `${meta.channels} canales, se esperaba ${expected.channels} (gris neutro)`)
  }
  if (expected.channels === 1 && meta.depth !== "uchar") fail(expected.path, `profundidad ${meta.depth}, se esperaban 8 bits`)

  if (expected.paperWhite) {
    // Papel #ffffff: todo lo que en la fuente está en el percentil 95 o por encima
    // (el papel, 252–254) tiene que salir blanco puro. Sin el estiramiento de
    // niveles, la salida tiene bastantes menos píxeles a 255 que esa proporción.
    const source = await sharp(fromRoot(expected.paperWhite)).raw().toBuffer()
    const whitePoint = percentile(source, 0.95)
    const paperShare = share(source, (value) => value >= whitePoint)
    const output = await sharp(file).raw().toBuffer()
    const whiteShare = share(output, (value) => value === 255)
    if (whiteShare < paperShare) {
      fail(
        expected.path,
        `el papel no es #ffffff: ${(whiteShare * 100).toFixed(1)} % de píxeles a 255, se esperaba ≥ ${(paperShare * 100).toFixed(1)} %`,
      )
    }
  }

  if (expected.whiteCorner) {
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
    if (meta.hasAlpha) fail(expected.path, "tiene canal alfa; el fondo debe ser blanco opaco")
    const corner = Array.from(data.subarray(0, info.channels))
    if (corner.some((value) => value !== 255)) fail(expected.path, `la esquina no es blanca: ${corner.join(",")}`)
    const { channels } = await sharp(file).stats()
    if (channels[0].min > 16) fail(expected.path, `no hay trazo oscuro (#0a0a0a): mínimo ${channels[0].min}`)
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} fallo(s) en las imágenes:\n  - ${failures.join("\n  - ")}`)
  process.exit(1)
}
console.log(`✓ ${EXPECTED.length} imágenes verificadas`)
```

**1.3** Crea `e2e/seo.spec.ts`:
```ts
import { test, expect, type Page } from '@playwright/test'

type JsonLdNode = { '@type'?: string; [key: string]: unknown }

/** Every JSON-LD node on the page (arrays and @graph flattened). */
async function readJsonLd(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block) as JsonLdNode | JsonLdNode[]
    const nodes = Array.isArray(parsed) ? parsed : [parsed]
    return nodes.flatMap((node) => (Array.isArray(node['@graph']) ? (node['@graph'] as JsonLdNode[]) : [node]))
  })
}

test('/logo.svg and /logo.png respond 200', async ({ request }) => {
  const svg = await request.get('/logo.svg')
  expect(svg.status()).toBe(200)
  expect(svg.headers()['content-type']).toContain('image/svg+xml')

  const png = await request.get('/logo.png')
  expect(png.status()).toBe(200)
  expect(png.headers()['content-type']).toContain('image/png')
})

test('Organization JSON-LD points its logo at /logo.png', async ({ page, request }) => {
  await page.goto('/es')
  const organization = (await readJsonLd(page)).find((node) => node['@type'] === 'Organization')
  expect(organization).toBeDefined()

  const logo = new URL(String(organization?.logo))
  expect(logo.pathname).toBe('/logo.png')
  expect((await request.get(logo.pathname)).status()).toBe(200)
})
```

**1.4** Ejecuta las pruebas y comprueba que fallan:
```bash
npm run images:verify
PORT=3010 npx playwright test e2e/seo.spec.ts --reporter=line
```
**Fallo esperado.**

`images:verify` sale con código 1 y esta lista, porque todavía no hay fuentes ni salidas y `design/moodboard` sigue existiendo:
```
✗ 10 fallo(s) en las imágenes:
  - design/moodboard: debe moverse a design/source (ya no debe existir)
  - design/source/relieve.png: no existe
  - design/source/lamina.png: no existe
  - design/source/expediente.png: no existe
  - design/source/arquitectura.png: no existe
  - src/assets/images/relieve.jpg: no existe
  - src/assets/images/lamina.jpg: no existe
  - src/assets/images/expediente.jpg: no existe
  - public/images/og/relieve-og.jpg: no existe
  - public/logo.png: no existe
```

Playwright: **2 failed**.
- `/logo.svg and /logo.png respond 200`: `Expected: 200, Received: 404` (`public/logo.svg` no existe).
- `Organization JSON-LD points its logo at /logo.png`: `Expected: "/logo.png", Received: "/logo.svg"`.

### Paso 2 — Implementación

**2.1 `sharp` como devDependency exacta.** `sharp` 0.35.3 ya está en `node_modules` porque lo trae Next. `--package-lock-only` escribe solo `package.json` y `package-lock.json`, sin tocar `node_modules`, que en el worktree son enlaces duros al repositorio principal:
```bash
npm install -D -E sharp@0.35.3 --package-lock-only
grep -n '"sharp"' package.json   # → "sharp": "0.35.3" dentro de devDependencies
```

**2.2 Mueve las fuentes a `design/source/` en gris de 8 bits y un canal.** Es un paso único y no se guarda como script. Después se borra `design/moodboard`:
```bash
mkdir -p design/source
node --input-type=module -e '
import sharp from "sharp"
const renames = [["A1-v2", "relieve"], ["A2-v2", "lamina"], ["C1-v2", "expediente"], ["B1", "arquitectura"]]
for (const [from, to] of renames) {
  await sharp(`design/moodboard/${from}.png`)
    .grayscale()
    .toColourspace("b-w")
    .png({ compressionLevel: 9 })
    .toFile(`design/source/${to}.png`)
}
'
git rm -r -q design/moodboard
ls -l design/source   # ≈ 1,0–1,1 MB cada una (antes 2,7–4,1 MB en RGB)
```

**2.3** Crea `public/logo.svg`. Son las dos losas de `BrandLogo`: 16×7 en `x=4`, `y=4` y `y=13`, rotadas 45° sobre (12, 12), con `viewBox="-4 -4 32 32"` para que las esquinas giradas no se corten:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-4 -4 32 32" fill="none">
  <g transform="rotate(45 12 12)">
    <rect x="4" y="4" width="16" height="7" fill="#0a0a0a" />
    <rect x="4" y="13" width="16" height="7" fill="#0a0a0a" />
  </g>
</svg>
```

**2.4** Crea `scripts/process-images.mjs`:
```js
// Pipeline de imágenes de la home (diseño §7; traspaso §4 "Imágenes").
//
//   npm run images          → regenera todas las salidas
//   npm run images:verify   → las comprueba (scripts/verify-images.mjs)
//
// Entradas:  design/source/{relieve,lamina,expediente}.png  (grises de 8 bits, 1 canal, 1536×1024)
//            public/logo.svg
// Salidas:   src/assets/images/{relieve,lamina,expediente}.jpg  (2560 px de ancho, 1 canal)
//            public/images/og/relieve-og.jpg                     (1200×630, fondo de las imágenes para redes)
//            public/logo.png                                     (512×512, fondo blanco)
//
// sharp no aplica las operaciones en el orden en que se encadenan, así que los
// niveles de `lamina` se calculan y aplican en JS sobre el buffer crudo, y solo
// después se escala y se codifica.
import { mkdir, readFile } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const OUTPUT_WIDTH = 2560
const OG_SIZE = { width: 1200, height: 630 }
const LOGO_SIZE = 512
const LOGO_VIEWBOX = 32 // viewBox="-4 -4 32 32" de public/logo.svg
const PAPER_PERCENTILE = 0.95
const JPEG_OPTIONS = { quality: 88, mozjpeg: true }

const IMAGES = [
  { name: "relieve", paperWhite: false },
  { name: "lamina", paperWhite: true },
  { name: "expediente", paperWhite: false },
]

/** Ruta absoluta a partir de la raíz del repositorio. */
const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))

async function ensureDir(file) {
  await mkdir(dirname(file), { recursive: true })
}

/** Lee una fuente como gris neutro de 1 canal: { data, info } crudos. */
async function readGray(name) {
  const { data, info } = await sharp(fromRoot(`design/source/${name}.png`))
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  if (info.channels !== 1) throw new Error(`${name}: se esperaba 1 canal y hay ${info.channels}`)
  return { data, info }
}

/** Valor por debajo del cual queda la fracción `p` de los píxeles. */
function percentile(data, p) {
  const histogram = new Uint32Array(256)
  for (const value of data) histogram[value]++
  const target = Math.ceil(data.length * p)
  let seen = 0
  for (let value = 0; value < 256; value++) {
    seen += histogram[value]
    if (seen >= target) return value
  }
  return 255
}

/** Estira los niveles para que `whitePoint` pase a 255 (el negro se queda en 0). */
function stretchToWhite(data, whitePoint) {
  const lut = new Uint8Array(256)
  for (let value = 0; value < 256; value++) {
    lut[value] = Math.min(255, Math.round((value * 255) / whitePoint))
  }
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) out[i] = lut[data[i]]
  return out
}

/** Vuelve a sharp desde el buffer crudo; la salida se mantiene en 1 canal (gris). */
function fromRaw({ data, info }) {
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 1 } }).toColourspace("b-w")
}

async function processImage({ name, paperWhite }) {
  const gray = await readGray(name)
  if (paperWhite) {
    const whitePoint = percentile(gray.data, PAPER_PERCENTILE)
    gray.data = stretchToWhite(gray.data, whitePoint)
    console.log(`${name}: percentil ${PAPER_PERCENTILE * 100} = ${whitePoint} → 255`)
  }

  const out = fromRoot(`src/assets/images/${name}.jpg`)
  await ensureDir(out)
  const info = await fromRaw(gray)
    .resize({ width: OUTPUT_WIDTH, kernel: "lanczos3" })
    .jpeg(JPEG_OPTIONS)
    .toFile(out)
  console.log(`${name}.jpg ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
  return gray
}

async function processSocialBackground(relieve) {
  const out = fromRoot("public/images/og/relieve-og.jpg")
  await ensureDir(out)
  const info = await fromRaw(relieve)
    .resize({ ...OG_SIZE, fit: "cover", position: "centre", kernel: "lanczos3" })
    .jpeg(JPEG_OPTIONS)
    .toFile(out)
  console.log(`relieve-og.jpg ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
}

async function processLogo() {
  const svg = await readFile(fromRoot("public/logo.svg"))
  const info = await sharp(svg, { density: 72 * (LOGO_SIZE / LOGO_VIEWBOX) })
    .resize(LOGO_SIZE, LOGO_SIZE)
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(fromRoot("public/logo.png"))
  console.log(`logo.png ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
}

const processed = {}
for (const image of IMAGES) processed[image.name] = await processImage(image)
await processSocialBackground(processed.relieve)
await processLogo()
```

**2.5** Genera las salidas:
```bash
npm run images
```
Salida esperada (los tamaños pueden variar ±1 KB):
```
relieve.jpg 2560×1707 525 KB
lamina: percentil 95 = 254 → 255
lamina.jpg 2560×1707 964 KB
expediente.jpg 2560×1707 478 KB
relieve-og.jpg 1200×630 138 KB
logo.png 512×512 3 KB
```

**2.6** En `src/config/site.ts`, el logo del JSON-LD `Organization` (`src/lib/seo.ts` lo lee de aquí) pasa a ser el PNG. `social` y `twitter` se quedan: T2 los elimina junto con las rutas que usan.

Antes:
```ts
    logo: "/logo.svg",
```
Después:
```ts
    logo: "/logo.png",
```

**2.7** En `next.config.ts`, activa AVIF y WebP para `next/image` (diseño §7). El estilo de este archivo lleva `;`, pero el bloque nuevo no tiene sentencias.

Antes:
```ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
```
Después:
```ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // AVIF first, WebP as fallback (design §7). Next 16's default quality
    // allowlist ([75]) is kept: enough for the greyscale home imagery.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
```

### Paso 3 — Verificación

```bash
npm run images:verify
git add -A design src/assets public scripts
npm run images >/dev/null && git diff --quiet -- src/assets public && echo "pipeline determinista"
npm run lint
npx tsc --noEmit
PORT=3010 npx playwright test e2e/seo.spec.ts --reporter=line
PORT=3010 npx playwright test --reporter=line
npm run build
```

Resultados esperados:
- `images:verify` → `✓ 9 imágenes verificadas` (código 0).
- Volver a generar produce los mismos bytes, y se imprime `pipeline determinista`. `sharp` está fijado a una versión exacta y mozjpeg es determinista.
- `lint`: sin errores ni avisos nuevos. ESLint también revisa `scripts/*.mjs`.
- `tsc`: sin errores.
- `seo.spec.ts`: **2 passed**.
- Suite completa: todo en verde. Son las 39 pruebas previas más estas 2, más las de las tareas que ya estén integradas.
- `npm run build`: sin errores. `images.formats` es válido en Next 16.3.
- Revisión visual rápida: abre `public/logo.png` (losas `#0a0a0a` sobre blanco) y `public/images/og/relieve-og.jpg` (horizonte y crestas, cielo oscuro arriba).
- `git status`:
  - sin cambios en `AGENTS.md` (si `next dev` lo tocó, `git checkout AGENTS.md`);
  - sin nada en `node_modules`;
  - `design/moodboard/*` aparece como borrado.

### Paso 4 — Commit

```bash
git add -A package.json package-lock.json design scripts src/assets src/config/site.ts next.config.ts public/logo.svg public/logo.png public/images e2e/seo.spec.ts
git status --short   # solo esos archivos; nada de AGENTS.md ni node_modules
git commit -F - <<'EOF'
feat(home): pipeline de imágenes en gris y logo de Orbexs

Mueve las cuatro imágenes aprobadas a design/source como PNG en gris de 8 bits
y un canal. npm run images (scripts/process-images.mjs) genera las de la home en
src/assets/images, el fondo de las imágenes para redes y public/logo.png desde
public/logo.svg; npm run images:verify las comprueba. El JSON-LD Organization
apunta a /logo.png (antes a un /logo.svg inexistente) y next/image sirve AVIF/WebP.

Decisiones:
- sharp 0.35.3 exacto como devDependency con --package-lock-only: Next ya lo instala y así no se tocan los enlaces duros de node_modules.
- Las salidas JPEG se fuerzan a un canal con toColourspace("b-w"); sin eso sharp escribe sRGB de 3 canales.
- El papel #ffffff se verifica por proporción de blancos puros frente al percentil 95 de la fuente: el percentil 95 de la salida ya vale 255 sin estirar (rebote de lanczos3 y JPEG), así que no discrimina.
- relieve-og.jpg recorta el centro del relieve: horizonte y crestas, con cielo oscuro arriba para el logo.
- logo.png queda en RGB opaco sobre blanco, por compatibilidad como logo del JSON-LD.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```

### Decisiones

- **`--package-lock-only`.** `sharp@0.35.3` ya está instalado como dependencia de Next. Con la bandera, `npm` no reescribe nada dentro del `node_modules` del worktree, que son enlaces duros al del repositorio principal, y el protocolo (§1.1) prohíbe tocarlo. La orden pedida (`npm install -D -E sharp@0.35.3`) se mantiene tal cual; solo se le añade la bandera.
- **Salidas de un canal.** `sharp` convierte a sRGB de 3 canales al escribir JPEG desde un buffer crudo de 1 canal. `fromRaw()` añade `.toColourspace("b-w")` para que las salidas sean gris de verdad (un canal y un tercio del peso), y `images:verify` lo comprueba.
- **Criterio del "papel #ffffff".** El percentil 95 de `lamina.jpg` ya vale 255 aunque no se estiren los niveles, por el rebote de lanczos3 al ampliar de 1536 a 2560 px y por el JPEG. Por eso esa comprobación no sirve de prueba. En su lugar, la proporción de píxeles a 255 en la salida debe ser al menos la de la fuente en su percentil 95 o por encima:
  - con el estiramiento: 21,5 % ≥ 15,0 %;
  - sin él: 12,5 %, y la prueba falla (medido).
- **Encuadre de `relieve-og.jpg`.** Es el centro del relieve: `fit: cover` y `position: centre` a 1200×630, que conserva las filas ≈ 109–915. Mantiene el horizonte, las crestas y cielo oscuro arriba para el logo. T2 superpone un degradado a `#0a0a0a` para el texto.
- **`logo.svg`** lleva `width`/`height="32"` para tener un tamaño intrínseco razonable como archivo suelto. No lleva el `rx="1"` de `icon.svg`: sigue a `BrandLogo` y al traspaso.
- **`logo.png`** queda en RGB opaco (3 canales) y no en gris, para máxima compatibilidad como logo del JSON-LD. `images:verify` comprueba 512×512, sin alfa, esquina blanca y trazo oscuro.
- **La conversión a `design/source/` es de una sola vez** (paso 2.2) y no queda como script: el pipeline parte de `design/source/`. `verify-images` falla si `design/moodboard` reaparece.
- **La prueba del JSON-LD** compara la ruta (`/logo.png`) y no la URL completa, porque `siteConfig.url` depende de variables `VERCEL_*` que el servidor de desarrollo puede leer de `.env.local` y el proceso de Playwright no.

---

## Tarea 2 — Metadatos por página e imágenes para redes

**Depende de:** T1, ya integrada en `redesign/home`. T2 usa `public/images/og/relieve-og.jpg`, `siteConfig.images.logo` y `e2e/seo.spec.ts`. Va en la oleada B, en paralelo con T5. No comparten archivos: T2 **no toca los diccionarios** ni `src/lib/seo.ts`, `globals.css` o componentes.
**Archivos compartidos:**
- `src/app/[locale]/page.tsx`: aquí solo `generateMetadata` e imports; T6–T10 reescriben el resto.
- `src/config/site.ts`: viene de T1.
- `e2e/seo.spec.ts`: lo creó T1.
- `src/lib/page-meta.ts`: T6 cambia el `cardTitle` de la home.
- `src/app/[locale]/layout.tsx`: aquí solo `generateMetadata` e imports. No figura en la tabla §2, y T5 no necesita tocarlo.

**Worktree y puerto:** `/home/user/wt/task2` (rama `wt/task2`), `PORT=3020`.

```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task2 -b wt/task2 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task2/node_modules
cd /home/user/wt/task2
test -f public/images/og/relieve-og.jpg && grep -q '"/logo.png"' src/config/site.ts && echo "T1 presente"
```

**Objetivo:** cada ruta, en cada idioma, tiene su título, descripción, canonical/hreflang, `og:title`, `og:url` canónica, `og:locale` e imagen para redes propia (diseño §8, traspaso §4).

**Qué se corrige.** Hoy el layout impone a todas las páginas lo mismo:
- `og:title = "Orbexs"`;
- el `og:url` de la home;
- una imagen única con el monograma "NF" que quedó de NovaForge.

Además, las páginas que definen `openGraph` (`/agendar`, `/diagnostico`, `/realty` y Live Studio) reemplazan el del layout y se quedan **sin `og:image`**.

> **Nota para T6:** en T2 todavía no existe `hero.title`. El `cardTitle` de la home es `` `${dict.hero.titleLead} ${dict.hero.titleHighlight}` ``. T6 debe cambiarlo a `dict.hero.title` en `src/lib/page-meta.ts` (caso `"/"`, marcado con un comentario) **antes** de borrar `titleLead` y `titleHighlight`.
>
> **Nota para T11:** la regla "Rutas nuevas" de `CLAUDE.md` debe decir que una página nueva también se registra:
> - en `PAGE_PATHS` y con su caso en `getPageMeta()` (`src/lib/page-meta.ts`);
> - con su `opengraph-image.tsx`;
> - y que su `generateMetadata` es `pageMetadata(locale, path)`.
>
> La regla "NO DESTRUYAS EL SEO" también debe decir que canonical y hreflang ahora llegan vía `pageMetadata()`, que usa `buildAlternates()`. T2 no edita `CLAUDE.md`.

### Archivos

| Acción | Ruta |
|---|---|
| Crear | `src/lib/page-meta.ts`, `src/lib/metadata.ts` |
| Crear (17) | `src/app/[locale]/opengraph-image.tsx` y `src/app/[locale]/<slug>/opengraph-image.tsx` para `agendar`, `diagnostico`, `privacidad`, `terminos`, `soberania-ia`, `ciberseguridad`, `fuerza-digital`, `sistemas-criticos`, `inteligencia-operativa`, `automatizacion-gobierno`, `enriquecimiento-datos`, `extraccion-datos`, `estudio-tiktok-live`, `realty`, `inversores`, `nosotros` |
| Reescribir | `src/lib/social-image.tsx`, `src/app/[locale]/realty/page.tsx` |
| Modificar | `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` y las 15 `page.tsx` restantes de la tabla anterior (todas salvo `[...rest]`), `src/config/site.ts`, `src/proxy.ts`, `e2e/seo.spec.ts` |
| Borrar | `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx` |

### Paso 1 — Prueba primero

**1.1** Crea primero `src/lib/page-meta.ts` con el código del paso 2.1. La prueba importa `PAGE_PATHS` y `getPageMeta`. Es un módulo de datos puro y todavía ninguna página lo usa, así que no cambia el comportamiento del sitio.

**1.2** Reemplaza `e2e/seo.spec.ts` completo. Conserva las dos pruebas de T1 y añade:
- el diseño §12, prueba 4 (matriz de 17 rutas × 2 idiomas);
- la prueba 6 (`FAQPage` de la home);
- dos guardas: títulos distintos por idioma, y sitemap = `PAGE_PATHS`.

```ts
import { test, expect, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { siteConfig } from '../src/config/site'
import { buildLocalePath, locales } from '../src/lib/i18n'
import { PAGE_PATHS, getPageMeta } from '../src/lib/page-meta'

const dictionaries = { es, en } as const

type JsonLdNode = { '@type'?: string; [key: string]: unknown }

/** Every JSON-LD node on the page (arrays and @graph flattened). */
async function readJsonLd(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block) as JsonLdNode | JsonLdNode[]
    const nodes = Array.isArray(parsed) ? parsed : [parsed]
    return nodes.flatMap((node) => (Array.isArray(node['@graph']) ? (node['@graph'] as JsonLdNode[]) : [node]))
  })
}

test('/logo.svg and /logo.png respond 200', async ({ request }) => {
  const svg = await request.get('/logo.svg')
  expect(svg.status()).toBe(200)
  expect(svg.headers()['content-type']).toContain('image/svg+xml')

  const png = await request.get('/logo.png')
  expect(png.status()).toBe(200)
  expect(png.headers()['content-type']).toContain('image/png')
})

test('Organization JSON-LD points its logo at /logo.png', async ({ page, request }) => {
  await page.goto('/es')
  const organization = (await readJsonLd(page)).find((node) => node['@type'] === 'Organization')
  expect(organization).toBeDefined()

  const logo = new URL(String(organization?.logo))
  expect(logo.pathname).toBe('/logo.png')
  expect((await request.get(logo.pathname)).status()).toBe(200)
})

test('each locale gives every route a distinct title and social-card title', () => {
  for (const locale of locales) {
    const metas = PAGE_PATHS.map((path) => getPageMeta(dictionaries[locale], path))
    expect(new Set(metas.map((meta) => meta.title)).size).toBe(PAGE_PATHS.length)
    expect(new Set(metas.map((meta) => meta.cardTitle)).size).toBe(PAGE_PATHS.length)
  }
})

test('sitemap lists exactly PAGE_PATHS in both locales', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  const expected = locales.flatMap((locale) => PAGE_PATHS.map((path) => buildLocalePath(locale, path)))
  expect(listed.sort()).toEqual(expected.sort())
})

test.describe('Open Graph per route and locale', () => {
  // 34 pages plus their images, each compiled on first request by the dev server.
  test.describe.configure({ mode: 'parallel', timeout: 90_000 })

  for (const locale of locales) {
    for (const path of PAGE_PATHS) {
      const url = buildLocalePath(locale, path)

      test(`${url} has its own og:title, og:url and og:image`, async ({ page, request }) => {
        await page.goto(url)

        // og:title: the page's own title (the layout used to stamp "Orbexs" on every page)
        const meta = getPageMeta(dictionaries[locale], path)
        const expectedTitle = meta.absoluteTitle ? meta.title : `${meta.title} | ${siteConfig.name}`
        await expect(page).toHaveTitle(expectedTitle)
        const ogTitle = page.locator('meta[property="og:title"]')
        await expect(ogTitle).toHaveCount(1)
        await expect(ogTitle).toHaveAttribute('content', expectedTitle)

        // og:url: absolute and equal to this page's canonical (it used to be the home for everyone)
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
        expect(canonical).toMatch(/^https?:\/\//)
        expect(new URL(canonical!).pathname).toBe(url)
        const ogUrl = page.locator('meta[property="og:url"]')
        await expect(ogUrl).toHaveCount(1)
        await expect(ogUrl).toHaveAttribute('content', canonical!)
        await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
          'content',
          dictionaries[locale].meta.ogLocale,
        )

        // og:image: this route's own opengraph-image.tsx (internal Spanish segment under the locale)
        const ogImage = page.locator('meta[property="og:image"]')
        await expect(ogImage).toHaveCount(1)
        const imageUrl = new URL((await ogImage.getAttribute('content'))!)
        expect(imageUrl.pathname).toBe(`/${locale}${path === '/' ? '' : path}/opengraph-image`)
        const image = await request.get(imageUrl.pathname + imageUrl.search)
        expect(image.status()).toBe(200)
        expect(image.headers()['content-type']).toBe('image/png')
      })
    }
  }
})

for (const locale of locales) {
  test(`home FAQPage JSON-LD (${locale}) has exactly dict.faq.items.length questions`, async ({ page }) => {
    await page.goto(buildLocalePath(locale, '/'))
    const faqPages = (await readJsonLd(page)).filter((node) => node['@type'] === 'FAQPage')
    expect(faqPages).toHaveLength(1)

    const items = dictionaries[locale].faq.items
    const questions = faqPages[0].mainEntity as { name: string }[]
    expect(questions).toHaveLength(items.length)
    expect(questions.map((question) => question.name)).toEqual(items.map((item) => item.question))
  })
}
```

**1.3** Ejecuta la prueba y comprueba que falla:
```bash
PORT=3020 npx playwright test e2e/seo.spec.ts --reporter=line
```
**Fallo esperado:** **34 failed, 6 passed**.

Pasan las dos pruebas de logos de T1, la de títulos distintos, la del sitemap y las dos de `FAQPage`. Esas cuatro últimas son guardas que ya se cumplen y que protegen a T6–T10.

Fallan las 34 de "Open Graph per route and locale". El primer fallo de cada una es:
- `/es`, `/en`, páginas de producto, `/inversores`, `/nosotros`, `/privacidad`, `/terminos`: `og:title` recibe `"Orbexs"`, el del layout. Si se avanza, `og:url` es el de la home y `og:image` es `/opengraph-image`, el de la raíz.
- `/agendar`, `/diagnostico`: `og:url`, `toHaveCount(1)` recibe 0. Su `openGraph` reemplaza el del layout y no hay `og:url` ni `og:image`.
- `/realty`, Live Studio: `og:title` sin `" | Orbexs"`, y tampoco tienen `og:image`.

### Paso 2 — Implementación

**2.1** `src/lib/page-meta.ts` (creado en 1.1):
```ts
import { siteConfig } from "@/config/site"
import type { Dictionary } from "@/content/dictionaries"

/**
 * Every indexable route, in the same order as the `pages` array of
 * src/app/sitemap.ts. A new page is registered here as well, with its case in
 * getPageMeta() and its own opengraph-image.tsx.
 */
export const PAGE_PATHS = [
  "/",
  "/agendar",
  "/diagnostico",
  "/privacidad",
  "/terminos",
  "/soberania-ia",
  "/ciberseguridad",
  "/fuerza-digital",
  "/sistemas-criticos",
  "/inteligencia-operativa",
  "/automatizacion-gobierno",
  "/enriquecimiento-datos",
  "/extraccion-datos",
  "/estudio-tiktok-live",
  "/realty",
  "/inversores",
  "/nosotros",
] as const

export type InternalPath = (typeof PAGE_PATHS)[number]

export interface PageMeta {
  /** Page title without the brand suffix (the layout template adds " | Orbexs"). */
  title: string
  /** True only for the home, whose title already is "Orbexs — {titleSuffix}". */
  absoluteTitle: boolean
  description: string
  /** Instrument-layer line of the social image. */
  eyebrow: string
  /** Large title of the social image. */
  cardTitle: string
}

/** The eight service pages share one dictionary shape under `products`. */
const PRODUCT_KEYS = {
  "/soberania-ia": "sovereignAI",
  "/ciberseguridad": "cybersecurity",
  "/fuerza-digital": "digitalWorkforce",
  "/sistemas-criticos": "systemsArchitecture",
  "/inteligencia-operativa": "operationalIntelligence",
  "/automatizacion-gobierno": "governmentAutomation",
  "/enriquecimiento-datos": "dataEnrichment",
  "/extraccion-datos": "dataExtraction",
} as const satisfies Partial<Record<InternalPath, keyof Dictionary["products"]>>

type ProductPath = keyof typeof PRODUCT_KEYS

function isProductPath(path: InternalPath): path is ProductPath {
  return path in PRODUCT_KEYS
}

const REALTY_NAME = "RealTy"
const DESCRIPTION_MAX = 160

/**
 * The EN H1 carries a non-breaking hyphen (U+2011) in "real\u2011estate" so the
 * flagship headline cannot wrap mid-compound. Search engines, share cards and
 * the social image must still receive the plain ASCII hyphen.
 */
function plainHyphens(text: string): string {
  return text.replace(/\u2011/g, "-")
}

/** Page title of /realty: "RealTy — {hero title}" without the closing period. */
export function realtyTitle(realty: Dictionary["realty"]): string {
  return `${REALTY_NAME} — ${plainHyphens(realty.hero.title).replace(/[.]$/, "")}`
}

/**
 * Meta description of /realty: the scope qualifier ("Versión de demostración" /
 * "Demo version", the last segment of `statusLine`) followed by the hero
 * description. The qualifier leads so the honesty contract survives a search
 * result, where nothing else on the page does. The qualifier and the first
 * sentence are always kept, then whole further sentences are appended while
 * they fit DESCRIPTION_MAX, so the cut never lands mid-sentence.
 */
export function realtyMetaDescription(realty: Dictionary["realty"]): string {
  const qualifier = realtyQualifier(realty).replace(/[.]$/, "")
  const scope = qualifier.charAt(0).toLocaleUpperCase() + qualifier.slice(1)
  const description = realty.hero.description
  const sentences = description.match(/[^.]+\.(?:\s+|$)/g)?.map((s) => s.trim()) ?? [description]

  let out = `${scope}. ${sentences[0]}`
  for (const sentence of sentences.slice(1)) {
    const next = `${out} ${sentence}`
    if (next.length > DESCRIPTION_MAX) break
    out = next
  }
  return out
}

/** "versión de demostración" / "demo version": the last segment of `statusLine`. */
function realtyQualifier(realty: Dictionary["realty"]): string {
  return realty.statusLine.split("·").at(-1)?.trim() ?? ""
}

function entry(title: string, description: string, eyebrow: string, cardTitle: string = title): PageMeta {
  return { title, absoluteTitle: false, description, eyebrow, cardTitle }
}

/** Title, description and social-image copy of a route, straight from its dictionary. */
export function getPageMeta(dict: Dictionary, path: InternalPath): PageMeta {
  if (isProductPath(path)) {
    const product = dict.products[PRODUCT_KEYS[path]]
    return entry(product.title, product.description, product.eyebrow)
  }

  switch (path) {
    case "/":
      return {
        title: `${siteConfig.name} — ${dict.meta.titleSuffix}`,
        absoluteTitle: true,
        description: dict.meta.description,
        eyebrow: dict.hero.eyebrow,
        // Task 6 switches this to dict.hero.title when the fixed H1 lands.
        cardTitle: `${dict.hero.titleLead} ${dict.hero.titleHighlight}`,
      }
    case "/agendar":
      return entry(dict.schedule.pageTitle, dict.schedule.pageSubtitle, dict.schedule.badge)
    case "/diagnostico":
      return entry(dict.diagnosticPage.pageTitle, dict.diagnosticPage.pageSubtitle, dict.diagnosticPage.badge)
    case "/privacidad":
      return entry(dict.privacy.title, dict.privacy.description, dict.legalPage.badge)
    case "/terminos":
      return entry(dict.terms.title, dict.terms.description, dict.legalPage.badge)
    case "/estudio-tiktok-live": {
      const studio = dict.liveStudio
      return entry(
        `Orbexs Live Studio — ${studio.subtitle}`,
        studio.description,
        studio.eyebrow,
        `${studio.titleLead} ${studio.titleAccent} ${studio.titleTail}`,
      )
    }
    case "/realty": {
      const realty = dict.realty
      const qualifier = realtyQualifier(realty)
      return entry(
        realtyTitle(realty),
        realtyMetaDescription(realty),
        qualifier ? `${realty.eyebrow} · ${qualifier}` : realty.eyebrow,
        plainHyphens(realty.hero.title),
      )
    }
    case "/inversores":
      return entry(dict.investorsPage.title, dict.investorsPage.subtitle, dict.investorsPage.eyebrow)
    case "/nosotros":
      return entry(dict.aboutPage.title, dict.aboutPage.subtitle, dict.aboutPage.eyebrow)
  }
}
```

**2.2** Crea `src/lib/metadata.ts`:
```ts
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { buildAlternates, buildLocalePath, isValidLocale } from "@/lib/i18n"
import { getPageMeta } from "@/lib/page-meta"
import type { InternalPath } from "@/lib/page-meta"

/**
 * generateMetadata() of every page under [locale]: title, description,
 * canonical + hreflang, and its own Open Graph and Twitter tags.
 *
 * A page's `openGraph` replaces the layout's as a whole, so each page states
 * all of it here. `images` is deliberately absent: the route's
 * opengraph-image.tsx injects og:image, and X falls back to og:image when
 * twitter:image is missing.
 */
export async function pageMetadata(locale: string, path: InternalPath): Promise<Metadata> {
  if (!isValidLocale(locale)) return {}

  const dict = await getDictionary(locale)
  const meta = getPageMeta(dict, path)
  const socialTitle = meta.absoluteTitle ? meta.title : `${meta.title} | ${siteConfig.name}`

  return {
    title: meta.absoluteTitle ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: dict.meta.ogLocale,
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      url: `${siteConfig.url}${buildLocalePath(locale, path)}`,
      title: socialTitle,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: meta.description,
    },
  }
}
```

**2.3** Reescribe `src/lib/social-image.tsx` completo. Desaparecen `createSocialImage` y el monograma "NF":
```tsx
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import { getPageMeta } from "@/lib/page-meta"
import type { InternalPath } from "@/lib/page-meta"

export const socialImageSize = { width: 1200, height: 630 }

/** og:image:alt — the card shows the Orbexs mark plus the page title, which og:title already carries. */
export const socialImageAlt = siteConfig.name

// Written by `npm run images` (scripts/process-images.mjs) from design/source/relieve.png.
const BACKGROUND_FILE = join(process.cwd(), "public/images/og/relieve-og.jpg")

let background: Promise<string> | undefined

/** The relief backdrop as a data URL, read once per server process. */
function loadBackground(): Promise<string> {
  background ??= readFile(BACKGROUND_FILE, "base64").then((data) => `data:image/jpeg;base64,${data}`)
  return background
}

/**
 * Social image of one route in one locale: the relief at night, a fade to
 * #0a0a0a, the Orbexs mark (the two slabs of BrandLogo) and the page's eyebrow
 * and title from its dictionary. Every opengraph-image.tsx under
 * src/app/[locale] calls this with its own path.
 */
export async function renderPageSocialImage({
  locale,
  path,
}: {
  locale: string
  path: InternalPath
}): Promise<ImageResponse> {
  if (!isValidLocale(locale)) notFound()

  const [dict, backgroundSrc] = await Promise.all([getDictionary(locale), loadBackground()])
  const { eyebrow, cardTitle } = getPageMeta(dict, path)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders a plain <img>, not next/image */}
        <img
          src={backgroundSrc}
          alt=""
          width={socialImageSize.width}
          height={socialImageSize.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.55) 45%, #0a0a0a 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="-4 -4 32 32" fill="none">
              <g transform="rotate(45 12 12)" fill="#ffffff">
                <rect x="4" y="4" width="16" height="7" />
                <rect x="4" y="13" width="16" height="7" />
              </g>
            </svg>
            <div style={{ fontSize: 30, letterSpacing: "-0.01em" }}>{siteConfig.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
            {/* Instrument layer. next/og only ships Geist Regular (no Geist Mono), so the
                eyebrow keeps the caps, the 0.3em tracking and #a3a3a3, not the mono face. */}
            <div
              style={{
                fontSize: 17,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#a3a3a3",
              }}
            >
              {eyebrow}
            </div>
            <div style={{ fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{cardTitle}</div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  )
}
```

**2.4** Crea los 17 `opengraph-image.tsx`. Son idénticos salvo el `path`. Así queda `src/app/[locale]/agendar/opengraph-image.tsx`:
```tsx
import { locales } from "@/lib/i18n"
import { renderPageSocialImage, socialImageAlt, socialImageSize } from "@/lib/social-image"

export const alt = socialImageAlt
export const size = socialImageSize
export const contentType = "image/png"

// Route handlers do not inherit the layout's generateStaticParams; without this
// the image would be rendered on request instead of at build time.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return renderPageSocialImage({ locale, path: "/agendar" })
}
```
Genera los 17 con este bucle desde la raíz del worktree. `"/"` va en `src/app/[locale]/`; el resto, en su carpeta:
```bash
for path in / /agendar /diagnostico /privacidad /terminos /soberania-ia /ciberseguridad /fuerza-digital \
  /sistemas-criticos /inteligencia-operativa /automatizacion-gobierno /enriquecimiento-datos /extraccion-datos \
  /estudio-tiktok-live /realty /inversores /nosotros; do
  dir="src/app/[locale]${path%/}"
  test -f "$dir/page.tsx" || { echo "falta $dir/page.tsx"; break; }
  cat > "$dir/opengraph-image.tsx" <<EOF
import { locales } from "@/lib/i18n"
import { renderPageSocialImage, socialImageAlt, socialImageSize } from "@/lib/social-image"

export const alt = socialImageAlt
export const size = socialImageSize
export const contentType = "image/png"

// Route handlers do not inherit the layout's generateStaticParams; without this
// the image would be rendered on request instead of at build time.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return renderPageSocialImage({ locale, path: "$path" })
}
EOF
done
find "src/app/[locale]" -name opengraph-image.tsx | wc -l   # → 17 (las de la raíz se borran en 2.5)
```

**2.5** Borra las imágenes de la raíz. Con ellas desaparece el único uso de `createSocialImage`:
```bash
git rm -q src/app/opengraph-image.tsx src/app/twitter-image.tsx
```

**2.6** En `src/app/[locale]/layout.tsx`, el `openGraph`/`twitter` del layout queda mínimo: sin `images`, sin `url` y sin `title`.

Import. Antes:
```ts
import { isValidLocale, locales, localePrefix } from "@/lib/i18n"
```
Después:
```ts
import { isValidLocale, locales } from "@/lib/i18n"
```
Bloque `openGraph`/`twitter` dentro de `generateMetadata`. Antes:
```ts
    openGraph: {
      type: "website",
      locale: dict.meta.ogLocale,
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      url: `${siteConfig.url}${localePrefix[locale]}`,
      title: siteConfig.name,
      description: dict.meta.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${dict.meta.titleSuffix}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: dict.meta.description,
      images: [`${siteConfig.url}/twitter-image`],
    },
```
Después:
```ts
    // Fallback for routes without metadata of their own (the 404 page). Every
    // page sets its title, og:url and description through pageMetadata()
    // (src/lib/metadata.ts), and its opengraph-image.tsx adds og:image.
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: dict.meta.ogLocale,
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary_large_image",
    },
```
`title`, `description`, `metadataBase` e `icons` no cambian.

**2.7** Cambia `generateMetadata` en cada página por `pageMetadata(locale, path)`.

**a) Home, `src/app/[locale]/page.tsx`.** El JSON-LD `FAQPage` y el resto del archivo no cambian.

Import. Antes:
```ts
import { isValidLocale, buildLocalePath, buildAlternates } from "@/lib/i18n"
```
Después:
```ts
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
```
`generateMetadata`. Antes:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  return {
    alternates: buildAlternates("/", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/")
}
```

**b) `src/app/[locale]/agendar/page.tsx`.** En `diagnostico/page.tsx` el cambio es el mismo, con `diagnosticPage` y `"/diagnostico"`; los bloques de ese archivo van después de estos. `siteConfig` deja de usarse y su import se reemplaza por el de `pageMetadata`.

Imports. Antes:
```ts
import { isValidLocale, buildAlternates } from "@/lib/i18n"
```
```ts
import { siteConfig } from "@/config/site"
```
Después:
```ts
import { isValidLocale } from "@/lib/i18n"
```
```ts
import { pageMetadata } from "@/lib/metadata"
```
`generateMetadata`. Antes:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.schedule.pageTitle,
    description: dict.schedule.pageSubtitle,
    alternates: buildAlternates("/agendar", locale),
    openGraph: {
      title: `${dict.schedule.pageTitle} | ${siteConfig.name}`,
      description: dict.schedule.pageSubtitle,
    },
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/agendar")
}
```
`src/app/[locale]/diagnostico/page.tsx`: los mismos dos imports; `generateMetadata` antes:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.diagnosticPage.pageTitle,
    description: dict.diagnosticPage.pageSubtitle,
    alternates: buildAlternates("/diagnostico", locale),
    openGraph: {
      title: `${dict.diagnosticPage.pageTitle} | ${siteConfig.name}`,
      description: dict.diagnosticPage.pageSubtitle,
    },
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/diagnostico")
}
```

**c) `src/app/[locale]/privacidad/page.tsx`.** `terminos/page.tsx` es igual, con `terms` y `"/terminos"`; sus bloques van a continuación.

Import (idéntico en privacidad, terminos, las 8 páginas de producto, inversores y nosotros). Antes:
```ts
import { isValidLocale, buildAlternates } from "@/lib/i18n"
```
Después:
```ts
import { isValidLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
```
`generateMetadata` de privacidad. Antes:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.privacy.title,
    description: dict.privacy.description,
    alternates: buildAlternates("/privacidad", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/privacidad")
}
```
`generateMetadata` de terminos. Antes:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.terms.title,
    description: dict.terms.description,
    alternates: buildAlternates("/terminos", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/terminos")
}
```

**d) Las 8 páginas de producto.** Llevan el mismo import de (c) y el mismo `generateMetadata`, cambiando solo la clave de `dict.products` y el slug:

| Archivo | Clave | Path |
|---|---|---|
| `src/app/[locale]/soberania-ia/page.tsx` | `sovereignAI` | `"/soberania-ia"` |
| `src/app/[locale]/ciberseguridad/page.tsx` | `cybersecurity` | `"/ciberseguridad"` |
| `src/app/[locale]/fuerza-digital/page.tsx` | `digitalWorkforce` | `"/fuerza-digital"` |
| `src/app/[locale]/sistemas-criticos/page.tsx` | `systemsArchitecture` | `"/sistemas-criticos"` |
| `src/app/[locale]/inteligencia-operativa/page.tsx` | `operationalIntelligence` | `"/inteligencia-operativa"` |
| `src/app/[locale]/automatizacion-gobierno/page.tsx` | `governmentAutomation` | `"/automatizacion-gobierno"` |
| `src/app/[locale]/enriquecimiento-datos/page.tsx` | `dataEnrichment` | `"/enriquecimiento-datos"` |
| `src/app/[locale]/extraccion-datos/page.tsx` | `dataExtraction` | `"/extraccion-datos"` |

Ejemplo verbatim, `soberania-ia/page.tsx`. Antes:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: dict.products.sovereignAI.title,
    description: dict.products.sovereignAI.description,
    alternates: buildAlternates("/soberania-ia", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/soberania-ia")
}
```
En las otras siete, el bloque viejo es idéntico salvo `sovereignAI` y `"/soberania-ia"`, que se sustituyen por la clave y el path de la tabla. El nuevo solo cambia el path.

**e) `src/app/[locale]/inversores/page.tsx`** y **`nosotros/page.tsx`.** Llevan el import de (c). `generateMetadata` de inversores. Antes:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: dict.investorsPage.title,
    description: dict.investorsPage.subtitle,
    alternates: buildAlternates("/inversores", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/inversores")
}
```
`generateMetadata` de nosotros. Antes:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: dict.aboutPage.title,
    description: dict.aboutPage.subtitle,
    alternates: buildAlternates("/nosotros", locale),
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/nosotros")
}
```

**f) `src/app/[locale]/estudio-tiktok-live/page.tsx`.** Conserva su formato de título, `"Orbexs Live Studio — {subtitle}"`, que ahora sale de `getPageMeta`. `siteConfig`, `buildLocalePath` y el JSON-LD `FAQPage` siguen en uso.

Import. Antes:
```ts
import { isValidLocale, buildAlternates, buildLocalePath } from "@/lib/i18n"
```
Después:
```ts
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
```
`generateMetadata`. Antes:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  const studio = dict.liveStudio
  return {
    title: `Orbexs Live Studio — ${studio.subtitle}`,
    description: studio.description,
    alternates: buildAlternates(INTERNAL_PATH, locale),
    openGraph: {
      title: `Orbexs Live Studio — ${studio.subtitle}`,
      description: studio.description,
      url: `${siteConfig.url}${buildLocalePath(locale, INTERNAL_PATH)}`,
    },
  }
}
```
Después:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  // The title keeps its "Orbexs Live Studio — {subtitle}" format (see getPageMeta).
  return pageMetadata(locale, INTERNAL_PATH)
}
```

**g) Reescribe `src/app/[locale]/realty/page.tsx` completo.**
- `realtyTitle` y `metaDescription` se mueven a `page-meta.ts`, la segunda con el nombre `realtyMetaDescription`.
- Desaparecen `DESCRIPTION_MAX` y los imports que ya no se usan: `buildAlternates`, `buildLocalePath` y `Dictionary`.
- El comentario de `VOICE_DEMO_ENABLED` se conserva literal.
- El JSON-LD `FAQPage` generado desde `dict.realty.faq.items` no cambia.

```tsx
import { RealtyLanding } from "@/components/sections/realty/RealtyLanding"
import { JsonLd } from "@/components/ui/JsonLd"
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { realtyMetaDescription } from "@/lib/page-meta"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const INTERNAL_PATH = "/realty"
const PRODUCT_NAME = "RealTy"

/**
 * Live voice demo switch, read from the environment while this page is
 * prerendered. It is intentionally NOT a NEXT_PUBLIC variable and not read in
 * the browser: the route stays static, and the flag is baked into the HTML.
 *
 * Consequence to remember: flipping REALTY_VOICE_DEMO_ENABLED requires a
 * redeploy (or a dev-server restart). Changing it in the dashboard alone does
 * nothing to the already-built page — although `/api/realty/voice-session`
 * reads it per request, so the route follows the environment immediately.
 */
const VOICE_DEMO_ENABLED = process.env.REALTY_VOICE_DEMO_ENABLED === "true"

// Title and meta description (realtyTitle / realtyMetaDescription) live in
// src/lib/page-meta.ts, shared with the social image of this route.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, INTERNAL_PATH)
}

export default async function RealtyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const realty = dict.realty
  const description = realtyMetaDescription(realty)

  // FAQPage schema — generated from dict.realty.faq.items, stays in sync
  // automatically when the copy changes (see CLAUDE.md).
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: realty.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            dict,
            internalPath: INTERNAL_PATH,
            locale: locale as Locale,
            fallbackName: PRODUCT_NAME,
            description,
          }),
          faqJsonLd,
          breadcrumbJsonLd(locale as Locale, [
            { name: siteConfig.name, internalPath: "/" },
            { name: PRODUCT_NAME, internalPath: INTERNAL_PATH },
          ]),
        ]}
      />
      <RealtyLanding content={realty} locale={locale} voiceDemoEnabled={VOICE_DEMO_ENABLED} />
    </>
  )
}
```

**2.8** En `src/config/site.ts` quitas `social` y `twitter`, que quedan sin uso al borrar las rutas de la raíz y las `images` del layout.

Antes:
```ts
  images: {
    logo: "/logo.png",
    social: "/opengraph-image",
    twitter: "/twitter-image",
  },
```
Después:
```ts
  images: {
    logo: "/logo.png",
  },
```
En `src/proxy.ts` quitas de `SKIP_PATHS` las dos rutas borradas. `/opengraph-image` pasa a redirigir a `/es/opengraph-image`, que existe.

Antes:
```ts
const SKIP_PATHS = ["/_next", "/api", "/opengraph-image", "/twitter-image", "/favicon", "/logo", "/robots", "/sitemap"]
```
Después:
```ts
const SKIP_PATHS = ["/_next", "/api", "/favicon", "/logo", "/robots", "/sitemap"]
```

### Paso 3 — Verificación

```bash
npm run lint
npx tsc --noEmit
grep -rnE 'images\.(social|twitter)|createSocialImage|twitter-image|buildAlternates\(' src e2e
find src/app -name opengraph-image.tsx | wc -l
PORT=3020 npx playwright test e2e/seo.spec.ts --reporter=line
PORT=3020 npx playwright test --reporter=line
npm run build
```

Resultados esperados:
- `lint` y `tsc`: sin errores ni avisos nuevos. Los imports sin uso ya se quitaron en 2.7.
- `grep`: solo `src/lib/metadata.ts` (la llamada a `buildAlternates(path, locale)`) y la definición en `src/lib/i18n.ts`. Ni rastro de `images.social`, `images.twitter`, `createSocialImage` ni `twitter-image`.
- `find … | wc -l`: `17`.
- `seo.spec.ts`: **40 passed**.
- Suite completa: todo en verde. `smoke.spec.ts` sigue viendo el canonical y el hreflang de la home, Live Studio y RealTy, y los JSON-LD.
- `npm run build`: sin errores. En la tabla de rutas, las 17 `/[locale]/…/opengraph-image` aparecen como prerenderizadas (`●`), con sus variantes `/es/…` y `/en/…`. Si aparecen como dinámicas (`ƒ`), revisa que el archivo exporte `generateStaticParams`.
- Revisión visual, recomendada:
  1. Con `npm run dev -- --port 3020` en otra terminal, descarga dos imágenes:
     ```bash
     curl -s localhost:3020/es/opengraph-image -o /tmp/og-es.png
     curl -s localhost:3020/en/realty/opengraph-image -o /tmp/og-en-realty.png
     ```
  2. Ábrelas y comprueba:
     - relieve nocturno con degradado a `#0a0a0a`;
     - arriba a la izquierda, las dos losas y "Orbexs" en blanco;
     - abajo, el eyebrow gris en mayúsculas espaciadas y el título blanco en 1–2 líneas;
     - la de RealTy dice `REALTY · DEMO VERSION`;
     - no aparece "NF" en ninguna.
- `git status`: sin cambios en `AGENTS.md` (si `next dev` lo tocó, `git checkout AGENTS.md`) ni en diccionarios.

### Paso 4 — Commit

```bash
git add -A src/lib src/app src/config/site.ts src/proxy.ts e2e/seo.spec.ts
git status --short   # sin diccionarios, AGENTS.md ni node_modules
git commit -F - <<'EOF'
feat(home): metadatos e imagen para redes propios en cada página

Cada página arma título, descripción, canonical/hreflang, og:title, og:url
canónica y og:locale con pageMetadata() (src/lib/metadata.ts), que lee el copy
del diccionario vía getPageMeta() (src/lib/page-meta.ts). Cada ruta y cada idioma
tienen su opengraph-image.tsx: relieve nocturno, logo, eyebrow y título, sin el
monograma "NF". El layout deja de imponer og:title "Orbexs", el og:url de la home
y una imagen única que /agendar, /diagnostico, /realty y Live Studio perdían.

Decisiones:
- Solo opengraph-image.tsx, como fija el traspaso: Next copia og:image a twitter:image cuando falta.
- Cada opengraph-image.tsx exporta generateStaticParams: los Route Handlers no heredan el del layout, y así las 34 imágenes se generan en el build.
- El eyebrow de la imagen va en Geist con mayúsculas y tracking de 0,3 em: next/og solo trae Geist Regular y Satori no lee el woff2 de Geist Mono.
- La tarjeta de RealTy lleva "versión de demostración" (último tramo de statusLine) en el eyebrow.
- realtyMetaDescription vuelve a encabezar la meta descripción con "Versión de demostración" (último tramo de statusLine). Desde e1d7d37 tomaba el primer tramo, que ahora es el eslogan, y el calificador de honestidad se había perdido en los resultados de búsqueda.
- El og:title de RealTy y Live Studio gana el sufijo " | Orbexs", igual que su <title>.
- Se quitan images.social/twitter de siteConfig, y /opengraph-image y /twitter-image de SKIP_PATHS del proxy, porque quedan sin uso.
- Pruebas extra: títulos distintos por idioma y sitemap = PAGE_PATHS × idiomas.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```

### Decisiones

- **Solo `opengraph-image.tsx`, sin `twitter-image.tsx`.** Manda el traspaso ("un `opengraph-image.tsx` por ruta, 17 archivos") sobre el diseño §8, que pedía los dos. En `resolve-metadata.js`, `postProcessMetadata` copia `openGraph.images` a `twitter:image` cuando falta. `pageMetadata()` fija `twitter.card = "summary_large_image"`, `title` y `description`, sin `images`.
- **`generateStaticParams` en cada `opengraph-image.tsx`.** Una ruta de imagen es un Route Handler, que no hereda el `generateStaticParams` del layout. Turbopack reexporta los exports del archivo (`export * from`). Con él, las 34 imágenes se generan en el build: no se lee `public/` con `fs` en tiempo de ejecución, que en una función serverless podría no estar incluido. Para un locale no válido, `renderPageSocialImage` responde 404 con `notFound()`, que el proxy ya impide alcanzar.
- **`alt` de las imágenes.** `socialImageAlt = siteConfig.name`, un export extra en `social-image.tsx` que el contrato §3.3 no listaba. `alt` es un export estático y no puede variar por idioma sin `generateImageMetadata`, que cambiaría la URL a `/opengraph-image/<id>`. Se conserva `og:image:alt`, como en las imágenes anteriores.
- **Hueco del contrato: "eyebrow en mono".**
  - `next/og` solo trae Geist Regular (`@vercel/og/Geist-Regular.ttf`).
  - Geist Mono solo existe en `node_modules` como `woff2`, dentro de las devtools de Next, y Satori no lee `woff2`.
  - Solución: el eyebrow conserva las mayúsculas, el tracking de 0,3 em y el `#a3a3a3` de la capa de instrumento, en Geist.
  - Añadir un `.ttf` de Geist Mono al repositorio queda fuera de alcance.
- **Honestidad de RealTy.** La tarjeta de `/realty` lleva como eyebrow `REALTY · versión de demostración` (en: `demo version`). Es el último tramo de `realty.statusLine`, para que el calificador viaje con la imagen compartida.
- **`realtyMetaDescription` recupera el calificador (decisión del orquestador).** Desde `e1d7d37` tomaba el **primer** tramo de `statusLine`, que ahora es el eslogan ("Infraestructura de ventas con IA para promotores inmobiliarios"), y la meta descripción perdió "versión de demostración", justo lo que su comentario original decía proteger. Al moverla a `page-meta.ts` pasa a usar el **último** tramo (`realtyQualifier`), con la primera letra en mayúscula: "Versión de demostración. Cada comprador recibe…" / "Demo version. Every buyer…". Aplica la regla de honestidad de CLAUDE.md y no añade copy nuevo.
- **`og:title`** es `"{title} | Orbexs"` también en RealTy y Live Studio, que antes lo emitían sin sufijo. Coincide con el `<title>` del documento y con el contrato §3.3. La home usa el título absoluto `"Orbexs — {titleSuffix}"`.
- **El layout conserva `type`, `siteName`, `locale`, `alternateLocale` y `twitter.card`** como respaldo para la 404. La imagen de `[locale]/opengraph-image.tsx` también cuelga del segmento del layout, así que la 404 comparte la tarjeta de la home. Cada página la reemplaza con la suya: la prueba exige un solo `og:image` con la ruta propia.
- **Prueba independiente del dominio.** `og:url` se compara con el canonical que emite el propio servidor, más su `pathname`, y no con `siteConfig.url`. El servidor de desarrollo puede leer `VERCEL_*` de `.env.local` y el proceso de Playwright no.
- **`readJsonLd` es local a `seo.spec.ts`.** `e2e/helpers.ts` es de T4 y puede no estar integrado cuando empieza T2. No duplica ningún helper del contrato §3.7.
- **Pruebas añadidas fuera del diseño.** Son baratas y hacen cumplir que `PAGE_PATHS` siga el sitemap (regla "Rutas nuevas"):
  - títulos y `cardTitle` distintos por idioma;
  - sitemap = `PAGE_PATHS` × idiomas.
- **`SKIP_PATHS` del proxy.** Se quitan `/opengraph-image` y `/twitter-image`: eran código muerto tras borrar esas rutas.

---

## Tarea 3 — Copy de riesgo

**Depende de:** nada (oleada A, en paralelo con T1 y T4).
**Archivos compartidos:** `src/content/dictionaries/es.ts` / `en.ts` (después los tocan T5–T11, en serie: T3 debe estar integrada antes de que empiece T5). En la oleada A nadie más los toca.
**Worktree y puerto:** `/home/user/wt/task3`, `PORT=3030`.

```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task3 -b wt/task3 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task3/node_modules
cd /home/user/wt/task3
```

> **Copy aprobado:** el diseño (§13 y §14) pedía que el usuario confirmara el copy nuevo de §9.1. El 2026-09-23 el usuario aprobó el diseño completo y autorizó ejecutar el plan sin más confirmaciones, así que esta tarea aplica el texto del diseño tal cual y se integra sin esperar. Queda anotado como decisión en el commit y en el informe final.

### Archivos
- **Crear:** `e2e/copy.spec.ts`
- **Modificar:** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts`
- **Borrar:** —

No hace falta tocar nada más:
- el `FAQPage` JSON-LD de `src/app/[locale]/page.tsx` se genera desde `dict.faq.items`;
- `src/app/llms.txt/route.ts` imprime `es.faq.items` y `en.faq.items` desde el diccionario, y no imprime `products.dataExtraction`.

### Barrido del repositorio (hecho al preparar la tarea)

`grep -rniE "prox(y|ies)|dark ?web|captcha|clearance|cleared|residencial|residential|headless|sin bloqueos|unblocked|agencias de inteligencia|intelligence agencies"` sobre todo el repositorio, sin contar `node_modules`, `.next`, `.git` ni `docs/superpowers`:

| Coincidencia | ¿Entra en el alcance del diseño? | Acción |
|---|---|---|
| `es.ts` / `en.ts` línea 307: `faq.items[3].answer` ("clearance apropiado" / "appropriately cleared personnel") | Sí (§9.2) | Se cambia |
| `es.ts` / `en.ts` líneas 793–794: `products.dataExtraction.features[2]` y `[3]` (proxies residenciales, dark web, agencias de inteligencia) | Sí (§9.1) | Se cambia |
| `es.ts` / `en.ts` línea 799: `products.dataExtraction.capabilities[0].items` (Proxies, Headless Browser, CAPTCHAs) | Sí (§9.1) | Se cambia |
| `src/proxy.ts:7` `export function proxy(` | No: es la convención de archivo de Next 16, no copy | Nada |
| `CLAUDE.md:19` "Proxy (ex-middleware)" | No: documentación de la convención | Nada |
| `es.ts`/`en.ts` 328 y 634: "Threat Intelligence", "Threat Intelligence Feeds" (Tecnologías y Ciberseguridad) | No: término legítimo de defensa, sin dark web ni evasión | Nada |
| `es.ts`/`en.ts` 18 y 163: "Scrapers con IA para OSINT y registros públicos", "Scrapers Adaptativos con IA" | No está en la lista del diseño | Nada (se reporta, fase 2 si el usuario quiere) |
| `es.ts`/`en.ts` 854 "<60 s" y 1047 "crecimiento exponencial" / "exponentially growing" | No: el diseño §3 los deja para la fase 2 | Nada |
| `e2e/*` | No hay coincidencias | — |
| `src/app/llms.txt/route.ts` | Sin literales propios. Hereda la respuesta 4 de la FAQ desde el diccionario, así que queda corregido con el diccionario. La prueba lo vigila. | — |
| `.agents/skills/**` ("headless", "CAPTCHA") | No: documentación de skills, no es el sitio | Nada |

### Paso 1 — Prueba primero

Crear `e2e/copy.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'

/**
 * Copy de riesgo (diseño §9.1 y §9.2).
 *
 * Extracción de datos no puede volver a prometer infraestructura de evasión
 * (proxies residenciales, resolución de CAPTCHAs) ni recolección en la dark
 * web, y la home no puede insinuar personal con habilitación de seguridad
 * ("clearance"). Orbexs no puede respaldar ninguna de esas afirmaciones.
 *
 * Excepción deliberada a la convención del plan (§3.7, "textos esperados desde
 * los diccionarios"): el copy aprobado se fija aquí como literal, porque vigilar
 * ESE texto es el propósito del archivo. Leerlo del diccionario haría que la
 * prueba pasara con cualquier copy. Quien lo cambie, lo cambia aquí a conciencia.
 */

const dictionaries = { es, en } as const

type LocaleKey = keyof typeof dictionaries

const EXTRACTION_ROUTE: Record<LocaleKey, string> = {
  es: '/es/extraccion-datos',
  en: '/en/data-extraction',
}

/** Lo que Extracción de datos no puede mostrar, ni en el texto ni en el JSON-LD. */
const EXTRACTION_FORBIDDEN = [/\bprox(?:y|ies)\b/i, /\bdark\s+web\b/i, /captcha/i]

/** Habilitación de seguridad que la FAQ de la home no puede afirmar. */
const CLEARANCE = /\bclearance\b|\bcleared\b/i

interface ApprovedCopy {
  /** Títulos de `features[2]` y `features[3]`. */
  features: readonly [string, string]
  /** `capabilities[0].items`. */
  collection: readonly [string, string, string]
  /** Frase nueva de `faq.items[3].answer`. */
  confidentiality: string
}

const APPROVED: Record<LocaleKey, ApprovedCopy> = {
  es: {
    features: ['Portales y Registros Públicos', 'OSINT de Fuentes Abiertas'],
    collection: ['Colectores Programados', 'Renderizado de Páginas Dinámicas', 'Detección de Cambios en la Fuente'],
    confidentiality: 'un equipo dedicado bajo acuerdos de confidencialidad',
  },
  en: {
    features: ['Public Portals & Registries', 'Open-Source OSINT'],
    collection: ['Scheduled Collectors', 'Dynamic Page Rendering', 'Source Change Detection'],
    confidentiality: 'a dedicated team bound by confidentiality agreements',
  },
}

/** Entidades JSON-LD de la página, aplanadas (un <script> puede traer un array). */
async function jsonLdEntities(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block)
    return Array.isArray(parsed) ? parsed : [parsed]
  })
}

for (const locale of ['es', 'en'] as LocaleKey[]) {
  const dict = dictionaries[locale]
  const approved = APPROVED[locale]

  test.describe(`copy de riesgo (${locale})`, () => {
    test('Extracción de datos no promete evasión ni dark web', async ({ page }) => {
      const product = dict.products.dataExtraction

      // El copy nuevo está en su sitio del diccionario…
      expect([product.features[2].title, product.features[3].title]).toEqual(approved.features)
      expect(product.capabilities[0].items).toEqual(approved.collection)

      // …y la página lo muestra, sin rastro del copy anterior.
      await page.goto(EXTRACTION_ROUTE[locale])
      const main = page.locator('main')
      await expect(main).toContainText(product.subtitle)

      const visible = await main.innerText()
      const structured = JSON.stringify(await jsonLdEntities(page))
      for (const pattern of EXTRACTION_FORBIDDEN) {
        expect(visible, `${pattern} en el texto visible`).not.toMatch(pattern)
        expect(structured, `${pattern} en el JSON-LD`).not.toMatch(pattern)
      }
      for (const text of [...approved.features, ...approved.collection]) {
        expect(visible).toContain(text)
      }
    })

    test('la FAQ de la home no habla de clearance', async ({ page }) => {
      const item = dict.faq.items[3]
      expect(item.answer).not.toMatch(CLEARANCE)
      expect(item.answer).toContain(approved.confidentiality)

      await page.goto(`/${locale}`)

      // Datos estructurados (lo que leen los buscadores): FAQPage desde dict.faq.items.
      const faqPage = (await jsonLdEntities(page)).find((entity) => entity['@type'] === 'FAQPage')
      expect(faqPage, 'la home publica un FAQPage').toBeDefined()
      const structured = JSON.stringify(faqPage)
      expect(structured).not.toMatch(CLEARANCE)
      expect(structured).toContain(approved.confidentiality)

      // Texto visible: la respuesta solo se monta al abrir su pregunta.
      const faqSection = page.locator(`#${dict.faq.sectionId}`)
      await faqSection.getByRole('button', { name: item.question }).click()
      await expect(faqSection).toContainText(approved.confidentiality)
      await expect(faqSection).not.toContainText(CLEARANCE)
    })
  })
}

test('llms.txt no repite el copy de riesgo', async ({ request }) => {
  const response = await request.get('/llms.txt')
  expect(response.ok()).toBe(true)

  const body = await response.text()
  expect(body).not.toMatch(CLEARANCE)
  for (const pattern of EXTRACTION_FORBIDDEN) {
    expect(body).not.toMatch(pattern)
  }
  expect(body).toContain(APPROVED.es.confidentiality)
  expect(body).toContain(APPROVED.en.confidentiality)
})
```

Ejecutar:

```bash
PORT=3030 npx playwright test e2e/copy.spec.ts --reporter=line
```

**Fallo esperado (5 de 5 en rojo):**
- `copy de riesgo (es|en) › Extracción de datos…`: el primer `toEqual` recibe `["Infraestructura de Proxies Global", "OSINT e Inteligencia de Amenazas"]` (en: `["Global Proxy Infrastructure", "OSINT & Threat Intelligence"]`).
- `copy de riesgo (es|en) › la FAQ de la home…`: `expect(item.answer).not.toMatch(/\bclearance\b|\bcleared\b/i)` encuentra "clearance apropiado" (en: "appropriately cleared personnel").
- `llms.txt no repite el copy de riesgo`: el cuerpo contiene las dos respuestas antiguas de la FAQ, así que `not.toMatch(CLEARANCE)` falla.

### Paso 2 — Implementación

Cuatro sustituciones exactas por diccionario, con el texto de §9.1 y §9.2 del diseño. Cada bloque "Buscar" aparece una sola vez en su archivo. Las líneas 793, 794 y 799 llevan 8 espacios de sangría.

#### 2.1 `src/content/dictionaries/es.ts`

**(a)** Respuesta 4 de la FAQ (`faq.items[3].answer`, dentro de la línea 307). Se sustituye solo este fragmento:

Buscar:
```
y asignación de equipo con clearance apropiado.
```
Reemplazar por:
```
y asignación de un equipo dedicado bajo acuerdos de confidencialidad.
```

**(b)** `products.dataExtraction.features[2]` y `[3]` (líneas 793–794):

Buscar:
```ts
        { title: "Infraestructura de Proxies Global", description: "Red global de proxies residenciales para recolección continua sin bloqueos." },
        { title: "OSINT e Inteligencia de Amenazas", description: "Recolección sistemática de foros, redes sociales y superficies de la dark web para agencias de inteligencia." },
```
Reemplazar por:
```ts
        { title: "Portales y Registros Públicos", description: "Extracción desde portales gubernamentales, registros públicos y documentos escaneados." },
        { title: "OSINT de Fuentes Abiertas", description: "Recolección sistemática de medios, foros y redes sociales públicas para análisis de riesgo y reputación." },
```

**(c)** `products.dataExtraction.capabilities[0].items` (línea 799):

Buscar:
```ts
        { title: "Infraestructura de Recolección", items: ["Red Global de Proxies", "Renderizado Headless Browser", "Resolución Automática de CAPTCHAs"] },
```
Reemplazar por:
```ts
        { title: "Infraestructura de Recolección", items: ["Colectores Programados", "Renderizado de Páginas Dinámicas", "Detección de Cambios en la Fuente"] },
```

#### 2.2 `src/content/dictionaries/en.ts`

**(a)** Respuesta 4 de la FAQ (dentro de la línea 307):

Buscar:
```
and assignment of appropriately cleared personnel.
```
Reemplazar por:
```
and a dedicated team bound by confidentiality agreements.
```

**(b)** `products.dataExtraction.features[2]` y `[3]` (líneas 793–794):

Buscar:
```ts
        { title: "Global Proxy Infrastructure", description: "Global residential proxy network for continuous, unblocked collection." },
        { title: "OSINT & Threat Intelligence", description: "Systematic collection from forums, social media, and dark web surfaces for intelligence agencies." },
```
Reemplazar por:
```ts
        { title: "Public Portals & Registries", description: "Extraction from government portals, public registries, and scanned documents." },
        { title: "Open-Source OSINT", description: "Systematic collection from media outlets, forums, and public social media for risk and reputation analysis." },
```

**(c)** `products.dataExtraction.capabilities[0].items` (línea 799):

Buscar:
```ts
        { title: "Collection Infrastructure", items: ["Global Proxy Network", "Headless Browser Rendering", "Automatic CAPTCHA Resolution"] },
```
Reemplazar por:
```ts
        { title: "Collection Infrastructure", items: ["Scheduled Collectors", "Dynamic Page Rendering", "Source Change Detection"] },
```

Resultado: los títulos de `capabilities[0]` no cambian ("Infraestructura de Recolección" / "Collection Infrastructure"). Tampoco cambia la forma de los diccionarios (mismas claves y longitudes), así que `Dictionary` sigue siendo compatible. Los `key={feature.title}` y `key={item}` de `ProductLanding` siguen siendo únicos.

### Paso 3 — Verificación

```bash
cd /home/user/wt/task3
npm run lint                                                          # sin errores
npx tsc --noEmit                                                      # sin errores
PORT=3030 npx playwright test e2e/copy.spec.ts --reporter=line        # 5 passed
grep -rniE "prox(y|ies)|dark ?web|captcha|clearance|cleared" src e2e \
  --include=*.ts --include=*.tsx --exclude=copy.spec.ts
#   esperado: una sola línea, src/proxy.ts:7 (convención de archivo de Next 16, no es copy)
PORT=3030 npx playwright test --reporter=line                         # suite completa en verde (39 previas + 5 nuevas)
git status --short
#   esperado: M src/content/dictionaries/es.ts, M src/content/dictionaries/en.ts, ?? e2e/copy.spec.ts
#   (si aparece AGENTS.md reescrito por `next dev`: git checkout AGENTS.md)
```

### Paso 4 — Commit

```bash
cd /home/user/wt/task3
git add src/content/dictionaries/es.ts src/content/dictionaries/en.ts e2e/copy.spec.ts
git commit -F - <<'EOF'
fix(home): reformula el copy de riesgo de Extracción de datos y la FAQ

Extracción de datos deja de prometer proxies residenciales, resolución de
CAPTCHAs y recolección en la dark web. Las dos funciones y la primera columna
de capacidades describen ahora lo que el sitio ya declara: portales y
registros públicos, OSINT de fuentes abiertas y colectores programados. La
respuesta 4 de la FAQ de la home cambia "clearance" por un equipo dedicado
bajo acuerdos de confidencialidad. es y en en paralelo; el FAQPage JSON-LD y
llms.txt se actualizan solos desde el diccionario.

Decisiones:
- Inglés traducido en paralelo con las etiquetas que sugiere el diseño (§9.1); "medios" → "media outlets" y "redes sociales públicas" → "public social media".
- e2e/copy.spec.ts fija el copy aprobado como literales, como excepción a la convención §3.7 del plan: leerlo del diccionario haría pasar la prueba con cualquier texto.
- La FAQ se verifica en el JSON-LD, en el acordeón abierto y en llms.txt; el parser de JSON-LD queda local porque e2e/helpers.ts lo crea T4 en paralelo.
- Fuera de alcance, sin cambios: "<60 s" y "crecimiento exponencial" (fase 2 según el diseño) y "Scrapers con IA" en nav/servicios.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```

### Decisiones
- **Inglés:** traducción paralela del español del diseño. Se usan las etiquetas que propone §9.1 ("Public Portals & Registries", "Open-Source OSINT", "Scheduled Collectors", "Dynamic Page Rendering", "Source Change Detection"), y la frase de §9.2 va literal. En la descripción de OSINT, "medios" pasa a "media outlets" para no leerse como "social media" repetido.
- **Literales en la prueba:** §3.7 del plan pide leer los textos esperados de los diccionarios. Aquí eso vaciaría la prueba: el diccionario es justo lo que se vigila. Los literales se limitan al copy aprobado. Las rutas, la pregunta, `sectionId` y el subtítulo sí salen del diccionario.
- **Dónde se mira:** en Extracción de datos, `main.innerText()`, que incluye el texto en `opacity: 0` de los bloques con `whileInView` (`innerText` solo excluye `display: none` y `visibility: hidden`), más el JSON-LD. En la home, el JSON-LD `FAQPage`, el acordeón abierto (la respuesta no está en el DOM hasta hacer clic) y `/llms.txt`.
- **La prueba sobrevive a T4 y T10:** no depende del `h1` (que en este worktree aún pasa por ScrambleText) ni del marcado del acordeón. El botón se busca por rol y por la pregunta, así que el `h3 > button` de T10 no la rompe.
- **Sin `e2e/helpers.ts`:** T4 lo crea en paralelo, así que el lector de JSON-LD queda local en este archivo.

---

## Tarea 4 — Títulos visibles y reducir movimiento

**Depende de:** nada (oleada A, en paralelo con T1 y T3).
**Archivos compartidos:**
- `src/components/sections/live-studio/Hero.tsx`: después lo toca T5, que añade `data-header-start="dark"` a su `<section>`. **Esta tarea no hace ese cambio.**
- `e2e/helpers.ts`: lo crea esta tarea. T5–T10 lo amplían, nunca lo duplican.

**Worktree y puerto:** `/home/user/wt/task4`, `PORT=3040`.

```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task4 -b wt/task4 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task4/node_modules
cd /home/user/wt/task4
```

**API verificada en `node_modules` (motion 12.35.2, Playwright 1.58.2):**
- `MotionConfig` y `useReducedMotion` se exportan desde `motion/react`, que reexporta `framer-motion`.
- `MotionConfigProps.reducedMotion?: "always" | "never" | "user"`. El valor por defecto del contexto es `"never"`, así que hoy el sitio **ignora** reducir movimiento.
- Con `"user"`, `animateTarget` (motion-dom `visual-element-target.mjs`) cambia la transición a `{ type: false }` para toda clave de `positionalKeys`: `width`, `height`, `top`, `left`, `right`, `bottom` y todas las transformaciones (`x`, `y`, `scale`, `scaleY`…). El valor salta a su último fotograma. `opacity` y el color se siguen animando.
- `useReducedMotion(): boolean | null` devuelve `null` en el servidor (`prefersReducedMotion.current` empieza en `null` y solo se lee si hay `window`) y `true`/`false` en el primer render del cliente. Por eso solo puede decidir `animate` y `transition`, nunca `initial` ni atributos del DOM.
- Playwright 1.58 **no** tiene la opción `reducedMotion` en `test.use()` (no está en `PlaywrightTestOptions`: `test.use({ reducedMotion })` falla en `tsc`). Se usa `test.use({ contextOptions: { reducedMotion: 'reduce' } })`. `javaScriptEnabled` sí es opción de primer nivel.
- Esta tarea no usa ninguna API de Next 16.

### Archivos
- **Crear:** `e2e/helpers.ts`, `e2e/motion.spec.ts`
- **Modificar:** `src/components/providers/MotionProvider.tsx`, `src/components/sections/ProductLanding.tsx`, `src/components/sections/DataEnrichmentLanding.tsx`, `src/components/sections/live-studio/Hero.tsx`
- **Borrar:** — (`src/components/ui/ScrambleText.tsx` se queda: lo siguen usando `CTA.tsx`, hasta T10, y `ScheduleForm.tsx`, fuera de alcance)

### Auditoría de valores ligados al scroll (§9.3, hecha al preparar la tarea)

`grep -rn "useScroll\|useTransform\|useParallax\|useSpring\|useMotionValueEvent\|useVelocity" src`:

| Archivo | Uso | ¿Necesita cambio? |
|---|---|---|
| `src/components/layout/Header.tsx` | `useScroll()` + `useMotionValueEvent` → solo `setIsScrolled(latest > 50)`, un booleano | No: no anima ningún valor con el scroll |
| `src/hooks/useParallax.ts` (`useParallax`, `useScrollScale`, `useScrollOpacity`, `useSectionEntrance`) | `useScroll` + `useTransform` + `useSpring` | No: **no tiene consumidores** (código muerto; candidato a borrarse en T11) |
| `src/hooks/useScrollVelocity.ts` (`useScrollVelocitySkew`) | ídem, y ya devuelve 0 con reducir movimiento | No: **no tiene consumidores** (candidato a T11) |
| `src/components/animations/ScrollProgress.tsx` | listener nativo de `scroll` que escribe `style.height` | No en esta tarea: ya devuelve `null` con reducir movimiento o en móvil. Anima `height`, contra §11, pero queda fuera de la home rediseñada (se reporta) |
| `MagneticButton.tsx`, `CustomCursor.tsx` | `useSpring` sobre el puntero, no sobre el scroll | No |

Conclusión: hoy **ningún componente en uso** anima valores ligados al scroll. Los nuevos (T6–T10) los obtienen de `useStageProgress`, que ya incluye reducir movimiento (§3.3).

### Paso 1 — Prueba primero

#### 1.1 Crear `e2e/helpers.ts` (contrato §3.7)

```ts
import type { Locator, Page } from '@playwright/test'

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
```

#### 1.2 Crear `e2e/motion.spec.ts`

```ts
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
```

Ejecutar:

```bash
PORT=3040 npx playwright test e2e/motion.spec.ts --reporter=line
```

**Fallo esperado (12 de 12 en rojo):**
- `títulos visibles sin JavaScript › h1 de /es/<producto>` (las 7 de ProductLanding y `/es/enriquecimiento-datos`): `toHaveText` recibe el título **dos veces seguidas**. ScrambleText, sin hidratar, pinta la copia `sr-only` y la copia `aria-hidden` con `visibility: hidden`. (Si llegara al `effectiveOpacity`, daría 0 por el `m.div` con `opacity: 0`.)
- `… › h1 de /es/estudio-tiktok-live`: el texto coincide, pero `effectiveOpacity` devuelve **0**, porque el `m.h1` sale del servidor con `style="opacity:0;transform:translateY(20px)"`.
- `Live Studio: medidor con reducir movimiento` y `… (control)`: `toBeAttached` falla porque aún no existe `[data-eq-bar]`. Además, hoy las barras animan `height` y su `transform` calculado es siempre `none`.
- `MotionConfig: reducir movimiento`: `toHaveText` de `main h1 + p` no encuentra el elemento, porque hoy el subtítulo sigue al `m.div` que envuelve el h1, no al h1. Tras cambiar solo el h1 y sin `MotionConfig`, fallaría por los valores intermedios de `y`.

### Paso 2 — Implementación

#### 2.1 `src/components/providers/MotionProvider.tsx` (archivo completo)

```tsx
"use client"

import { LazyMotion, MotionConfig, domAnimation } from "motion/react"

// LazyMotion + `m` components keep the full motion renderer (~100+ kB raw)
// out of the shared First Load JS bundle: only the lightweight `m` factory is
// imported eagerly, and the domAnimation feature bundle loads async after
// hydration. `strict` makes any leftover `motion.*` component throw at
// runtime, so a regression cannot slip in silently.
//
// domAnimation covers everything this site uses (animate/exit/variants,
// whileHover/whileTap/whileInView). Nothing uses drag or layout animations —
// if that ever changes, switch to domMax.
//
// MotionConfig reducedMotion="user" honours the visitor's
// `prefers-reduced-motion`: under "reduce", every transform and layout value
// (x, y, scale, rotate, width, height…) jumps straight to its target, while
// opacity and colour still fade. Motion reads the preference when each
// component mounts, never during render, so the server markup and hydration
// are unaffected. Components that loop, or that scrub with the scroll, still
// branch on useReducedMotion() themselves to show a meaningful still state.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
```

#### 2.2 `src/components/sections/ProductLanding.tsx`

**(a)** Quitar el import de ScrambleText.

Buscar:
```tsx
import { RevealText } from "@/components/ui/RevealText"
import { ScrambleText } from "@/components/ui/ScrambleText"
import { buildLocalePath } from "@/lib/i18n"
```
Reemplazar por:
```tsx
import { RevealText } from "@/components/ui/RevealText"
import { buildLocalePath } from "@/lib/i18n"
```

**(b)** El h1 pasa a ser marcado plano. Hereda las clases tipográficas del antiguo contenedor y el color de ScrambleText.

Buscar:
```tsx
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1)}
            className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8"
          >
            <ScrambleText as="h1" className="text-[#0a0a0a]" delay={0.15} duration={1400}>
              {content.title}
            </ScrambleText>
          </m.div>
```
Reemplazar por:
```tsx
          {/* Plain h1: visible in the server HTML, with no opacity:0 entrance and no scramble (design §9.3). */}
          <h1 className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8 text-[#0a0a0a]">
            {content.title}
          </h1>
```

`m` y `stagger` siguen en uso: eyebrow, subtítulo, descripción, CTA y rejillas.

#### 2.3 `src/components/sections/DataEnrichmentLanding.tsx`

Las mismas dos sustituciones de 2.2. Los bloques "Buscar" son idénticos carácter a carácter en este archivo (imports en las líneas 4–6 y h1 en las líneas 67–76, con la misma sangría de 10 espacios):

**(a)** Buscar:
```tsx
import { RevealText } from "@/components/ui/RevealText"
import { ScrambleText } from "@/components/ui/ScrambleText"
import { buildLocalePath } from "@/lib/i18n"
```
Reemplazar por:
```tsx
import { RevealText } from "@/components/ui/RevealText"
import { buildLocalePath } from "@/lib/i18n"
```

**(b)** Buscar:
```tsx
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1)}
            className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8"
          >
            <ScrambleText as="h1" className="text-[#0a0a0a]" delay={0.15} duration={1400}>
              {content.title}
            </ScrambleText>
          </m.div>
```
Reemplazar por:
```tsx
          {/* Plain h1: visible in the server HTML, with no opacity:0 entrance and no scramble (design §9.3). */}
          <h1 className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8 text-[#0a0a0a]">
            {content.title}
          </h1>
```

#### 2.4 `src/components/sections/live-studio/Hero.tsx`

Cuatro sustituciones. No tocar la `<section>`: el `data-header-start="dark"` lo añade T5.

**(a)** Import (línea 2):

Buscar:
```tsx
import { m } from "motion/react"
```
Reemplazar por:
```tsx
import { m, useReducedMotion } from "motion/react"
```

**(b)** Caja de las barras y lectura de reducir movimiento (líneas 9–13):

Buscar:
```tsx
const EQ_BARS = [38, 72, 54, 88, 46, 64, 30, 78, 58, 42]

/** The 9:16 booth frame — corner brackets, scanline sweep, level meter. */
function BroadcastFrame({ onAir }: { onAir: string }) {
  return (
```
Reemplazar por:
```tsx
const EQ_BARS = [38, 72, 54, 88, 46, 64, 30, 78, 58, 42]

/**
 * Every bar sits in a fixed 28 px box (h-7) and animates `scaleY` from its
 * bottom edge — a compositor-only transform, never `height` (design §11). The
 * keyframes are the original pixel heights divided by that box; the tallest
 * peak, 88 × 0.28 ≈ 24.6 px, fits inside it.
 */
const EQ_BOX_PX = 28
const eqScale = (px: number) => px / EQ_BOX_PX

/** The 9:16 booth frame — corner brackets, scanline sweep, level meter. */
function BroadcastFrame({ onAir }: { onAir: string }) {
  // null on the server, a boolean on the client's first render. It only feeds
  // `animate` and `transition`, which never reach the server markup; `initial`
  // is the same for everyone, so hydration always matches.
  const reduceMotion = useReducedMotion()

  return (
```

**(c)** Barras (líneas 50–63):

Buscar:
```tsx
          {EQ_BARS.map((height, i) => (
            <m.span
              key={i}
              className="flex-1 rounded-[1px] bg-gradient-to-t from-[#25f4ee]/50 to-[#fe2c55]/50"
              initial={{ height: 4 }}
              animate={{ height: [4, height * 0.28, 6, height * 0.2, 4] }}
              transition={{
                duration: 1.6 + (i % 4) * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.07,
              }}
            />
          ))}
```
Reemplazar por:
```tsx
          {EQ_BARS.map((height, i) => {
            // Reduced motion: a still meter, each bar parked at its peak
            // (height × 0.28 px inside the 28 px box).
            const level = height / 100
            return (
              <m.span
                key={i}
                data-eq-bar
                data-eq-level={level}
                className="h-7 flex-1 origin-bottom rounded-[1px] bg-gradient-to-t from-[#25f4ee]/50 to-[#fe2c55]/50"
                initial={{ scaleY: eqScale(4) }}
                animate={
                  reduceMotion
                    ? { scaleY: level }
                    : { scaleY: [4, height * 0.28, 6, height * 0.2, 4].map(eqScale) }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 1.6 + (i % 4) * 0.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.07,
                      }
                }
              />
            )
          })}
```

Notas:
- La franja inferior mide `h-14` con `pb-3` y `border-t`, así que deja 43 px de contenido. Las barras de 28 px caben y se alinean abajo por el `items-end` del contenedor, que no cambia.
- El degradado cian→magenta se escala con la barra, así que se ve igual que antes.
- `origin-bottom` (Tailwind v4: `transform-origin: bottom`) no choca con motion: motion solo escribe `transform-origin` si se animan `originX`/`originY`.
- `data-eq-level` es determinista (`height / 100`), así que el servidor y el cliente pintan el mismo valor.

**(d)** h1 plano (líneas 135–144):

Buscar:
```tsx
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
              className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.02] text-white mb-8"
            >
              {titleLead}{" "}
              <span className="chroma-text">{titleAccent}</span>{" "}
              {titleTail}
            </m.h1>
```
Reemplazar por:
```tsx
            {/* Plain h1: visible in the server HTML, never behind an opacity:0 entrance (design §9.3). */}
            <h1 className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.02] text-white mb-8">
              {titleLead}{" "}
              <span className="chroma-text">{titleAccent}</span>{" "}
              {titleTail}
            </h1>
```

El resto del Hero (estado, subtítulo, descripción, CTA y marco) conserva su entrada `m.*`. Con reducir movimiento, `MotionConfig` anula su `y` y deja un fundido de opacidad. Las animaciones CSS de Live Studio (`.live-scan`, `.live-dot`, `.marquee-track`) ya se apagan con `@media (prefers-reduced-motion: reduce)` en `globals.css`.

### Paso 3 — Verificación

```bash
cd /home/user/wt/task4
npm run lint                                                          # sin errores
npx tsc --noEmit                                                      # sin errores
PORT=3040 npx playwright test e2e/motion.spec.ts --reporter=line      # 12 passed
grep -rn "ScrambleText" src
#   esperado: solo src/components/ui/ScrambleText.tsx, sections/CTA.tsx y sections/ScheduleForm.tsx
grep -nE "(initial|animate)=\{\{ ?height" src/components/sections/live-studio/Hero.tsx
#   esperado: sin salida (ya no se anima height)
grep -rn "m\.h1" src/components/sections/live-studio src/components/sections/ProductLanding.tsx src/components/sections/DataEnrichmentLanding.tsx
#   esperado: sin salida
PORT=3040 npx playwright test --reporter=line                         # suite completa en verde (39 previas + 12 nuevas)
git status --short
#   esperado: M en MotionProvider.tsx, ProductLanding.tsx, DataEnrichmentLanding.tsx, live-studio/Hero.tsx;
#             ?? e2e/helpers.ts, e2e/motion.spec.ts  (si aparece AGENTS.md: git checkout AGENTS.md)
```

Comprobaciones específicas del resultado:
- `smoke.spec.ts › live studio page renders…` sigue en verde: busca `titleAccent` dentro del h1, que no cambia.
- `a11y.spec.ts` sobre `/es/estudio-tiktok-live` sigue en verde: el h1 blanco sobre `#0a0a0a` ya no pasa por `opacity: 0`.
- Las pruebas (b) no registran errores de hidratación en ninguno de los dos modos (lo afirman ellas mismas).

### Paso 4 — Commit

```bash
cd /home/user/wt/task4
git add src/components/providers/MotionProvider.tsx src/components/sections/ProductLanding.tsx \
  src/components/sections/DataEnrichmentLanding.tsx src/components/sections/live-studio/Hero.tsx \
  e2e/helpers.ts e2e/motion.spec.ts
git commit -F - <<'EOF'
fix(home): títulos visibles desde el servidor y respeto a reducir movimiento

El h1 de ProductLanding (7 páginas), de DataEnrichmentLanding y de la portada
de Live Studio pasa a ser marcado plano, sin ScrambleText ni contenedor m.* en
opacity: 0, así que se lee y se ve en el HTML del servidor. MotionProvider
envuelve el sitio en <MotionConfig reducedMotion="user">. Las barras del
medidor de Live Studio animan scaleY en lugar de height y se detienen con
reducir movimiento. Crea e2e/helpers.ts (effectiveOpacity, scrollToY) y
e2e/motion.spec.ts.

Decisiones:
- El h1 de live-studio/Hero.tsx era un m.h1 con initial opacity 0, el mismo fallo que §9.3: se corrige igual.
- Barras: caja fija de 28 px con origin-bottom; los fotogramas en px se dividen por 28. Con reducir movimiento, cada barra queda quieta en su pico, no en reposo. useReducedMotion solo decide animate/transition; initial es igual para todos.
- Atributos nuevos data-eq-bar y data-eq-level (amplían §3.4 del plan) para medir las barras.
- Playwright 1.58 no acepta reducedMotion en test.use: se usa contextOptions: { reducedMotion } (ajuste a §3.7).
- Prueba extra de MotionConfig (registro por frame del desplazamiento del subtítulo): sin ella, el proveedor quedaba sin cubrir.
- Auditoría: ningún componente en uso anima valores ligados al scroll; useParallax.ts y useScrollVelocity.ts no tienen consumidores (T11).
- Fuera de alcance: h1 de /agendar (ScrambleText) y de /nosotros e /inversores (RevealText), y h2 de los CTA de producto.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```

### Decisiones
- **h1 de Live Studio:** era un `m.h1` con `initial={{ opacity: 0, y: 20 }}`, que es el mismo fallo de §9.3 (título invisible sin JavaScript y fuera del LCP hasta hidratar). Pasa a `<h1>` plano con las mismas clases. Se incluye en la prueba (a).
- **h1 de producto:** se quita el `m.div` contenedor y ScrambleText. El h1 hereda las clases del contenedor y el `text-[#0a0a0a]`. Los índices de `stagger` del resto no cambian: el subtítulo sigue entrando a 0,3 s. Así el cambio es mínimo, y el h1, ya presente, marca el ritmo.
- **Barras en `scaleY`:** §11 prohíbe animar `height`. Cada barra ocupa una caja fija de 28 px (`h-7`) y escala desde abajo, con los fotogramas originales divididos por 28. Así se ve igual que antes y no hay cambios de layout.
- **Estado quieto:** con reducir movimiento, la rama de `useReducedMotion()` fija cada barra en su pico (`height / 100`). Queda un medidor quieto que se sigue leyendo; en reposo serían 10 rayas iguales. Aunque `MotionConfig` ya congelaría `scaleY` en su último fotograma, la rama explícita da un estado final con sentido y cumple el "Las barras… se detienen" de §9.3 sin depender del proveedor.
- **Hidratación:** `useReducedMotion()` es `null` en el servidor y booleano en el cliente. Solo entra en `animate` y `transition`, que motion no pinta en el HTML: con `initial` presente, lo que se serializa es `initial`, igual para todos. Es el mismo patrón que documenta `realty/shared.tsx` (`reveal()`). Las pruebas (b) fallan si React registra un error de hidratación.
- **Atributos nuevos:** `data-eq-bar` y `data-eq-level` en cada barra. §3.4 del plan no los tenía. Hacen falta para esperar al estado quieto sin `waitForTimeout` (se sondea hasta que la escala calculada llega a `data-eq-level`) y para medir la quietud.
- **`reducedMotion` en Playwright:** §3.7 del plan dice `test.use({ reducedMotion: "reduce" })`, pero en Playwright 1.58 esa opción no existe en `test.use` (solo en `contextOptions` o en `page.emulateMedia`). Se usa `test.use({ contextOptions: { reducedMotion: 'reduce' } })`. T5–T10 deben hacer lo mismo, o usar `page.emulateMedia` antes de `goto`.
- **Prueba (c) de `MotionConfig`:** no la pedía el enunciado, pero sin ella el cambio en `MotionProvider` quedaba sin prueba. Un `addInitScript` registra por frame el `translateY` del subtítulo de `/es/soberania-ia` desde antes de hidratar. Con el proveedor, solo aparecen 20 y 0; sin él, valores intermedios durante 0,6 s. Es determinista: no depende de cuándo hidrata la página.
- **`waitForTimeout` en (b):** solo para medir la ausencia de movimiento durante unos 600 ms, que no tiene un atributo observable. La espera de estados se hace con `expect.poll`.
- **Auditoría de scroll (§9.3):** hoy no hay componentes en uso con valores ligados al scroll: `Header` solo deriva un booleano, y `useParallax.ts` y `useScrollVelocity.ts` no tienen consumidores. No se cambia nada. Se proponen para la limpieza de T11. `ScrollProgress` anima `height` por estilo, pero ya se desactiva con reducir movimiento; queda anotado.
- **Fuera de alcance (se reporta, no se toca):** mismo tipo de fallo en otros sitios. El h1 de `/agendar` (`ScheduleForm`, ScrambleText). Los h1 de `/nosotros` e `/inversores` (`RevealText as="h1"`: palabras en `y: 100%` dentro de `overflow-hidden`, recortadas sin JavaScript). Los h2 de los CTA de las páginas de producto (`RevealText` dentro de un `m.div` con `opacity: 0` hasta `whileInView`). §9.3 limita la tarea a ProductLanding y DataEnrichmentLanding; el diseño deja Nosotros e Inversores para la fase 2.

---

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

---

## Tarea 6 — Primitivas y portada

**Objetivo:** la home abre con el relieve andino a pantalla completa (es el LCP y sale del servidor), el H1 fijo "Construimos soberanía digital." y una ruta blanca que sube por la cresta hasta el único punto azul de la cumbre. De paso se crean las primitivas que usan T7–T10 (`useStageProgress`, `ScrollStage`, `FocalCover`, `InstrumentLabel` y `geometry.ts` con las tres geometrías medidas), y la fila de logos "Construimos con" pasa de debajo de la portada a Tecnologías.

**Depende de:**
- **T1:** `src/assets/images/relieve.jpg` (2560 px, gris). Con import estático, `next/image` recibe ancho, alto y `blurDataURL`.
- **T2:** `src/lib/page-meta.ts` y `src/lib/metadata.ts`. `generateMetadata` de la home ya llama a `pageMetadata(locale, "/")`.
- **T4:** `e2e/helpers.ts` con `effectiveOpacity(locator)` y `scrollToY(page, y)`. `MotionProvider` con `<MotionConfig reducedMotion="user">`.
- **T5:** encabezado pintado con variables CSS (`--hdr-*`), la regla `body:has([data-header-start="dark"]) .site-header:not([data-tone])`, `data-tone` / `data-scrolled`, `waitForFrames` en helpers, y `smoke.spec.ts` / `a11y.spec.ts` ya ajustados a la nav nueva.

**Archivos compartidos (van en serie, plan §2):** `es.ts` / `en.ts`, `globals.css`, `e2e/smoke.spec.ts`, `src/app/[locale]/page.tsx`, `e2e/home.spec.ts` (lo crea esta tarea), `e2e/helpers.ts`, `src/lib/page-meta.ts`, `TechStack.tsx` y `e2e/a11y.spec.ts` (solo un comentario).

**Worktree y puerto:**
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task6 -b wt/task6 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task6/node_modules
cd /home/user/wt/task6
export PORT=3060          # todas las órdenes de Playwright de esta tarea
```

Comprobación previa del estado que dejan T1–T5. Cada orden debe imprimir al menos una línea; si alguna no imprime nada, **para** y avisa: falta una tarea anterior.
```bash
ls src/assets/images/relieve.jpg
grep -n 'titleLead' src/lib/page-meta.ts                  # el cardTitle de la home que cambia esta tarea
grep -n 'pageMetadata(locale, "/")' 'src/app/[locale]/page.tsx'
grep -nE 'export (async )?function (effectiveOpacity|scrollToY)' e2e/helpers.ts
grep -n 'data-header-start="dark"' src/app/globals.css
```

### Archivos

| Acción | Archivo |
|---|---|
| Crear | `src/hooks/useStageProgress.ts` |
| Crear | `src/components/ui/InstrumentLabel.tsx`, `src/components/ui/FocalCover.tsx`, `src/components/ui/ScrollStage.tsx`, `src/components/ui/TrustLogos.tsx` |
| Crear | `src/components/sections/home/geometry.ts`, `src/components/sections/home/HomeHero.tsx`, `src/components/sections/home/HeroRoute.tsx` |
| Crear | `e2e/home.spec.ts` |
| Modificar | `src/app/[locale]/page.tsx` (completo), `src/components/sections/TechStack.tsx` (completo) |
| Modificar | `src/content/dictionaries/es.ts`, `en.ts` (bloque `hero`), `src/app/globals.css` (2 bloques), `src/lib/page-meta.ts` (1 expresión) |
| Modificar | `e2e/helpers.ts` (se agrega `countVisibleBlue`), `e2e/smoke.spec.ts` (1 línea), `e2e/a11y.spec.ts` (1 comentario) |
| Borrar | `src/components/sections/Hero.tsx`, `src/components/sections/TrustBar.tsx` |

---

### Paso 1 — Prueba primero

**1.1 `e2e/helpers.ts`:** agregar al final. `scrollToY(page, y)` ya recibe un `Page`, así que el archivo ya importa ese tipo desde `@playwright/test`. Si no lo importa, añade `import type { Page } from '@playwright/test'` sin duplicar un import que ya exista.

```ts
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
  return page.evaluate(() => {
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
    const isBlue = (value: string) => {
      const match = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(value)
      return match !== null && match[1] === '37' && match[2] === '99' && match[3] === '235' && Number(match[4] ?? 1) > 0
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
  })
}
```

**1.2 Crear `e2e/home.spec.ts`.** T7–T10 agregan sus `describe` al final, cada uno con sus helpers locales.

```ts
import { test, expect, type Locator, type Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { countVisibleBlue, effectiveOpacity, scrollToY } from './helpers'

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
})

test.describe('portada · reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('la ruta ya está dibujada, modo static y sin sticky', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')

    const stage = page.locator(HERO)
    await expect(stage).toHaveAttribute('data-stage-mode', 'static')
    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true')
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
  ]) {
    test(`todo el primer pliegue y la cumbre caben a ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/es')

      const stage = page.locator(HERO)
      await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true')

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
    })
  }
})

test.describe('portada · scrub en escritorio', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('la ruta se dibuja con el scroll y deja un solo elemento azul', async ({ page }) => {
    await page.goto('/es')

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
})

test.describe('portada · celular', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('modo inView: sin sticky y la ruta se dibuja sola al cargar', async ({ page }) => {
    await page.goto('/es')

    const stage = page.locator(HERO)
    await expect(stage).toHaveAttribute('data-stage-mode', 'inView')
    await expect(stage.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')
    // 0,3 s de espera + 1,8 s de dibujo
    await expect(stage.locator('[data-hero-route]')).toHaveAttribute('data-complete', 'true', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.hero.title)
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
```

**1.3 `e2e/smoke.spec.ts`:** el H1 ya no tiene `titleLead`.
```ts
// antes
  await expect(page.getByRole('heading', { level: 1 })).toContainText(hero.titleLead)
// después
  await expect(page.getByRole('heading', { level: 1 })).toContainText(hero.title)
```

**Orden:**
```bash
PORT=3060 npx playwright test e2e/home.spec.ts e2e/smoke.spec.ts --reporter=line
```

**Resultado esperado: ROJO.** Fallan las 9 pruebas de `home.spec.ts` y la primera de `smoke.spec.ts` ("homepage loads and renders all sections"), por estas razones:
- `es.hero.title` todavía no existe (`undefined`). `escapeRegExp(undefined)` lanza `TypeError`, y los `toHaveText(undefined)` / `toContainText(undefined)` fallan con *expected string*.
- No hay `#inicio`, `[data-hero-route]`, `[data-stage-mode]` ni `[data-hero-summit]`, así que los `toHaveAttribute` agotan su espera.
- La portada vieja es clara (`data-header-theme="light"`), así que el HTML del servidor no trae `data-header-start="dark"` ni una `<img>` con `fetchPriority="high"` (prueba del HTML del servidor).

Las demás pruebas de `smoke.spec.ts` siguen en verde.

`npx tsc --noEmit` también falla en este punto con `TS2339: Property 'title' does not exist`. Es lo esperado hasta el paso 2.

---

### Paso 2 — Implementación

#### 2.1 Diccionarios

`src/content/dictionaries/es.ts`, bloque `hero` completo (antes → después):
```ts
// antes
  hero: {
    eyebrow: "INFRAESTRUCTURA DE MISIÓN CRÍTICA",
    titleLead: "Construimos",
    titleHighlight: "soberanía digital.",
    titleRotating: [
      "soberanía digital.",
      "defensa cibernética.",
      "operaciones autónomas.",
      "sistemas críticos.",
    ],
    description:
      "Construimos infraestructura de IA soberana, sistemas de ciberseguridad agéntica y plataformas de operaciones autónomas para gobiernos y organizaciones que operan bajo los estándares más exigentes del mundo.",
    trustLine:
      "Ingeniería de precisión para operaciones críticas de estado y empresa.",
    primaryAction: {
      label: "Iniciar Consulta Técnica",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "Ver Capacidades de Ingeniería",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "Ver casos de uso para sector público",
      href: "/automatizacion-gobierno",
      analyticsEvent: "hero_nurture_cta",
    },
  },
// después
  hero: {
    eyebrow: "INFRAESTRUCTURA DE MISIÓN CRÍTICA",
    title: "Construimos soberanía digital.",
    description:
      "Construimos infraestructura de IA soberana, sistemas de ciberseguridad agéntica y plataformas de operaciones autónomas para gobiernos y organizaciones que operan bajo los estándares más exigentes del mundo.",
    primaryAction: {
      label: "Iniciar Consulta Técnica",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "Ver Capacidades de Ingeniería",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "Ver casos de uso para sector público",
      // Ancla de la sección "Del papel al dato" de esta misma página (id = dossier.sectionId)
      href: "#gobierno",
      analyticsEvent: "hero_nurture_cta",
    },
    indexItems: ["IA SOBERANA", "DEFENSA CIBERNÉTICA", "OPERACIONES AUTÓNOMAS", "SISTEMAS CRÍTICOS"],
    imageLabel: "Imagen ilustrativa",
    scrollHint: "Desplazar",
  },
```

`src/content/dictionaries/en.ts`, bloque `hero` completo (antes → después):
```ts
// antes
  hero: {
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
    titleLead: "We build",
    titleHighlight: "digital sovereignty.",
    titleRotating: [
      "digital sovereignty.",
      "cyber defense.",
      "autonomous operations.",
      "critical systems.",
    ],
    description:
      "We build sovereign AI infrastructure, agentic cybersecurity systems, and autonomous operations platforms for governments and organizations operating under the world's most demanding standards.",
    trustLine:
      "Precision engineering for critical state and enterprise operations.",
    primaryAction: {
      label: "Start Technical Consultation",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "View Engineering Capabilities",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "View use cases for public sector",
      href: "/automatizacion-gobierno",
      analyticsEvent: "hero_nurture_cta",
    },
  },
// después
  hero: {
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
    title: "We build digital sovereignty.",
    description:
      "We build sovereign AI infrastructure, agentic cybersecurity systems, and autonomous operations platforms for governments and organizations operating under the world's most demanding standards.",
    primaryAction: {
      label: "Start Technical Consultation",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "View Engineering Capabilities",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "View use cases for public sector",
      // Anchor of the "From case file to structured data" section on this page (id = dossier.sectionId)
      href: "#government",
      analyticsEvent: "hero_nurture_cta",
    },
    indexItems: ["SOVEREIGN AI", "CYBER DEFENSE", "AUTONOMOUS OPERATIONS", "CRITICAL SYSTEMS"],
    imageLabel: "Illustrative image",
    scrollHint: "Scroll",
  },
```

`trustBar` no cambia: su `label` lo usa ahora TechStack. Comprobación de que las claves borradas no se usan en ningún otro sitio:
```bash
grep -rnE "titleRotating|titleHighlight|trustLine" src e2e       # sin resultados
grep -rn "titleLead" src e2e                                     # solo liveStudio: LiveStudioLanding.tsx, live-studio/{shared,Hero}.tsx y el bloque liveStudio de es.ts/en.ts
```
Si `grep` encuentra `hero.titleLead` en otra prueba (por ejemplo en `e2e/motion.spec.ts` de T4), se cambia por `hero.title`. El H1 nuevo contiene ese texto.

#### 2.2 `src/lib/page-meta.ts`: título de la imagen para redes de la home
```ts
// antes (expresión del cardTitle de "/")
`${dict.hero.titleLead} ${dict.hero.titleHighlight}`
// después
dict.hero.title
```

#### 2.3 `src/app/globals.css`

Bloque 1. Variante de altura justo después del import (antes → después):
```css
/* antes */
@import "tailwindcss";

/* después */
@import "tailwindcss";

/* Viewport de poca altura (≤ 720 px): portátiles de 1366×768 con la barra del
   navegador (~657 px de alto). La portada compacta su ritmo vertical con `short:`. */
@custom-variant short (@media (max-height: 45rem));
/* Modo "scrub" de la home: escritorio o tableta con alto suficiente y movimiento
   permitido. Debe coincidir con SCRUB_QUERY de src/hooks/useStageProgress.ts. */
@custom-variant stage (@media (min-width: 48rem) and (min-height: 37.5rem) and (prefers-reduced-motion: no-preference));
```

Bloque 2. `FocalCover` y los velos de la portada, detrás de la animación `.hero-enter`. Esa animación **se queda**, porque la usa `realty/Hero.tsx`.
```css
/* antes */
.hero-enter {
  animation: heroEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
/* después */
.hero-enter {
  animation: heroEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── FocalCover ──────────────────────────────────────────────────────
   Marco 3:2 que se comporta como `object-fit: cover` con punto focal
   (--fx / --fy). La imagen y su superposición SVG (viewBox 1536×1024) van
   dentro y comparten caja: coinciden en cualquier proporción de pantalla.
   Punto focal con clases, p. ej. [--fx:92%] md:[--fx:80%] lg:[--fx:50%].
   Fuera de @layer: para cambiar su tamaño, se envuelve en otro contenedor. */
.focal-frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
}
.focal-cover {
  position: absolute;
  left: var(--fx, 50%);
  top: var(--fy, 50%);
  width: max(100cqw, 150cqh);
  aspect-ratio: 3 / 2;
  translate: calc(var(--fx, 50%) * -1) calc(var(--fy, 50%) * -1);
}

/* ── Portada de la home: velos de contraste ──────────────────────────
   AA garantizado para #a3a3a3 (4,5:1) sobre el píxel más claro del relieve
   (233/255): hace falta ≥ 0,785 de #0a0a0a debajo de cualquier texto.
   - .hero-veil-side (≥ lg o apaisado): 0,86–0,9 bajo la columna de texto,
     que termina como mucho en 50 % + 56 px (max-w-7xl centrado + max-w-2xl);
     se desvanece hacia la derecha. Va DEBAJO de la ruta: la ruta no se atenúa.
   - .hero-veil: franja del encabezado (≥ 0,8 en los 4,5rem superiores: el
     encabezado es transparente sobre la portada) y suelo de 6rem ≥ 0,8 para el
     índice y la capa de instrumento. Va ENCIMA de la ruta: la ruta no cruza el
     índice.
   - Vertical < lg: la imagen es una banda de 73 svh con la cumbre al 30 svh y
     el texto empieza en 36 svh; el velo sube a 0,85 justo antes del texto. */
.hero-veil-side,
.hero-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-veil-side {
  background: linear-gradient(
    to right,
    rgb(10 10 10 / 0.9),
    rgb(10 10 10 / 0.86) max(50% + 5rem, 45rem),
    rgb(10 10 10 / 0) max(75% + 5rem, 70rem)
  );
}
.hero-veil {
  background:
    linear-gradient(to bottom, rgb(10 10 10 / 0.85), rgb(10 10 10 / 0.8) 4.5rem, rgb(10 10 10 / 0) 11rem),
    linear-gradient(to top, rgb(10 10 10 / 0.92), rgb(10 10 10 / 0.8) 6rem, rgb(10 10 10 / 0) 16rem);
}
@media (width < 64rem) and (orientation: portrait) {
  .hero-veil-side {
    display: none;
  }
  .hero-veil {
    background:
      linear-gradient(to bottom, rgb(10 10 10 / 0.85), rgb(10 10 10 / 0.8) 4.5rem, rgb(10 10 10 / 0) 11rem),
      linear-gradient(
        to bottom,
        rgb(10 10 10 / 0) 44%,
        rgb(10 10 10 / 0.85) 49%,
        rgb(10 10 10 / 0.85) 80%,
        rgb(10 10 10) 100%
      );
  }
}
```

#### 2.4 `src/components/sections/home/geometry.ts` (nuevo; los tres bloques del traspaso §3, literales)
```ts
// Geometría de la home, medida sobre las imágenes fuente en su espacio de
// píxeles de 1536×1024 (traspaso §3; cada coordenada se verificó dibujándola
// sobre su imagen). Las superposiciones SVG usan este mismo espacio como
// viewBox, dentro de FocalCover, así que coinciden con la imagen en cualquier
// proporción de pantalla. No editar sin volver a medir.

export const IMAGE_WIDTH = 1536
export const IMAGE_HEIGHT = 1024
export const VIEWBOX = "0 0 1536 1024"

/**
 * Portada (`relieve`): sendero en zigzag que sube por el macizo de la derecha
 * hasta la cumbre. Se dibuja con `strokeLinecap="butt"`: con `round`, un trazo
 * de longitud 0 ya pinta un punto visible.
 */
export const ROUTE_PATH = "M 1040 1024 C 1049.7 1014.7 1091 986.7 1098 968 C 1105 949.3 1074 929 1082 912 C 1090 895 1125.7 882.7 1146 866 C 1166.3 849.3 1197.3 831 1204 812 C 1210.7 793 1181.3 769.3 1186 752 C 1190.7 734.7 1218.7 722.7 1232 708 C 1245.3 693.3 1264 680 1266 664 C 1268 648 1243.3 629 1244 612 C 1244.7 595 1261.3 577 1270 562 C 1278.7 547 1295 536 1296 522 C 1297 508 1278.2 494.8 1276 478 C 1273.8 461.2 1281.8 430.5 1283 421"
export const ROUTE_SUMMIT = { x: 1283, y: 421 } as const

/**
 * Capacidades (`lamina`), en el orden de `dict.services.items`. Todos caen
 * dentro de x 490–1060: un recorte vertical centrado los muestra siempre.
 */
export const CAPABILITY_NODES = [
  { x: 490, y: 190 }, { x: 640, y: 128 }, { x: 700, y: 340 }, { x: 990, y: 330 },
  { x: 860, y: 470 }, { x: 1060, y: 580 }, { x: 800, y: 700 }, { x: 610, y: 620 },
] as const

/**
 * Del papel al dato (`expediente`, página izquierda), en el orden de
 * `dict.dossier.fields`. Cada recuadro envuelve el valor tecleado; la página
 * está levemente inclinada, así que los valores quedan unos 12 px por encima
 * de su etiqueta.
 */
export const DOSSIER_FIELDS = [
  { x: 448, y: 265, width: 103, height: 23 }, // Nombre
  { x: 452, y: 336, width: 101, height: 23 }, // Fecha de nacimiento
  { x: 454, y: 384, width: 101, height: 23 }, // Domicilio
  { x: 455, y: 432, width: 101, height: 23 }, // Correo electrónico
  { x: 458, y: 522, width: 104, height: 23 }, // Tipo de trámite
  { x: 460, y: 572, width: 103, height: 23 }, // Fecha de solicitud
] as const
```

#### 2.5 `src/hooks/useStageProgress.ts` (nuevo)
```ts
"use client"

import { useEffect, useState } from "react"
import { useScroll } from "motion/react"
import type { MotionValue } from "motion/react"

/**
 * Cómo se anima una sección de la home (plan §3.6):
 * - `scrub`: ≥ 768 px y sin reducir movimiento. El avance del escenario (0→1)
 *   controla la animación; el `sticky` y la altura larga los pone CSS
 *   (`stage:`), no este hook.
 * - `inView`: < 768 px. Sin sticky; la animación se dispara una vez al entrar.
 * - `static`: reducir movimiento. Estado final, sin animar.
 */
export type StageMode = "scrub" | "inView" | "static"

type ScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>
export type StageOffset = ScrollOptions["offset"]

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"
// Misma condición que las variantes `stage:` de Tailwind: el modo que
// decide JavaScript coincide siempre con el layout que decide CSS.
const SCRUB_QUERY = "(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)"

// Offsets en texto a propósito: motion solo acelera con ViewTimeline los
// offsets de sus presets numéricos. Con texto, `progress` siempre lo calcula
// JavaScript y los MotionValue derivados (y `data-*` que las pruebas leen)
// reflejan el scroll real.
const DEFAULT_OFFSET: StageOffset = ["start start", "end end"]

/**
 * Devuelve "scrub" en el servidor y en el primer render del cliente, para que
 * la hidratación coincida; tras montar, consulta las media queries y escucha
 * sus cambios (girar el teléfono, redimensionar, activar reducir movimiento).
 */
export function useStageMode(): StageMode {
  const [mode, setMode] = useState<StageMode>("scrub")

  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_QUERY)
    const scrub = window.matchMedia(SCRUB_QUERY)
    let active = true

    // queueMicrotask: sin setState síncrono en el cuerpo del efecto (patrón del repo)
    const update = () =>
      queueMicrotask(() => {
        if (!active) return
        setMode(reduced.matches ? "static" : scrub.matches ? "scrub" : "inView")
      })

    update()
    reduced.addEventListener("change", update)
    scrub.addEventListener("change", update)
    return () => {
      active = false
      reduced.removeEventListener("change", update)
      scrub.removeEventListener("change", update)
    }
  }, [])

  return mode
}

/**
 * Avance del scroll dentro de un escenario (0 → 1) + modo de animación.
 * `ref` es el contenedor alto (`<section>` de ScrollStage).
 */
export function useStageProgress(
  ref: React.RefObject<HTMLElement | null>,
  offset: StageOffset = DEFAULT_OFFSET,
): { progress: MotionValue<number>; mode: StageMode } {
  const mode = useStageMode()
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { progress: scrollYProgress, mode }
}
```

#### 2.6 Primitivas de UI (nuevas)

`src/components/ui/InstrumentLabel.tsx`
```tsx
import { cn } from "@/lib/utils"

interface InstrumentLabelProps {
  children: React.ReactNode
  /** Tono de la SUPERFICIE sobre la que va la etiqueta (plan §3.1). */
  tone?: "light" | "dark"
  as?: "span" | "p" | "div"
  className?: string
}

/**
 * Capa de instrumento: índices (`/01`), contadores (`02 / 04`), eyebrows y
 * "Imagen ilustrativa". Geist Mono 10–11 px en mayúsculas.
 * Sobre blanco o #f8f8f8 → #707070 (4,66:1); sobre oscuro → #a3a3a3.
 */
export function InstrumentLabel({ children, tone = "dark", as: Tag = "span", className }: InstrumentLabelProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.3em] md:text-[11px]",
        tone === "dark" ? "text-[#a3a3a3]" : "text-[#707070]",
        className,
      )}
    >
      {children}
    </Tag>
  )
}
```

`src/components/ui/FocalCover.tsx`
```tsx
import { cn } from "@/lib/utils"

/**
 * Marco 3:2 que se comporta como `object-fit: cover` con punto focal
 * (`--fx` / `--fy`, por defecto 50 %). La imagen (`next/image` con `fill`) y su
 * superposición `<svg viewBox="0 0 1536 1024">` van dentro y comparten caja,
 * así que siempre coinciden. `object-position` no se puede reproducir en SVG:
 * por eso el encuadre lo hace el marco y no la imagen. CSS en globals.css.
 *
 * El padre debe estar posicionado (el marco es `absolute inset-0`).
 */
export function FocalCover({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("focal-frame", className)}>
      <div className="focal-cover">{children}</div>
    </div>
  )
}
```

`src/components/ui/ScrollStage.tsx`: `ref` se desestructura. Leer `props.ref` activa la regla `react-hooks/refs`.
```tsx
import { cn } from "@/lib/utils"
import type { StageMode } from "@/hooks/useStageProgress"

// La altura larga y el sticky los pone solo CSS (stage:), igual en el
// servidor y en el cliente: la hidratación no mueve el layout (CLS). En celular
// o con reducir movimiento la sección es un bloque normal.
const TRACK_CLASS = {
  short: "stage:h-[160svh]",
  long: "stage:h-[250svh]",
} as const

const FRAME_CLASS = "relative stage:sticky stage:top-0 stage:h-svh stage:overflow-hidden"

interface ScrollStageProps {
  ref?: React.Ref<HTMLElement>
  id?: string
  track: "short" | "long"
  mode: StageMode
  theme: "light" | "dark"
  /** Primera sección oscura de la página: el encabezado ya es claro antes de hidratar. */
  startsDark?: boolean
  className?: string
  frameClassName?: string
  children: React.ReactNode
}

/**
 * Escenario de scroll: contenedor alto + marco `sticky` (`top-0 h-svh`).
 * Sin hooks: el modo lo calcula la isla cliente que lo usa (useStageProgress)
 * y aquí solo se expone en `data-stage-mode` para las pruebas.
 */
export function ScrollStage({
  ref,
  id,
  track,
  mode,
  theme,
  startsDark = false,
  className,
  frameClassName,
  children,
}: ScrollStageProps) {
  return (
    <section
      ref={ref}
      id={id}
      data-header-theme={theme}
      data-header-start={startsDark ? "dark" : undefined}
      data-stage-mode={mode}
      className={cn("relative", TRACK_CLASS[track], className)}
    >
      <div data-stage-frame="" className={cn(FRAME_CLASS, frameClassName)}>
        {children}
      </div>
    </section>
  )
}
```

#### 2.7 Portada (nuevos)

`src/components/sections/home/HeroRoute.tsx`
```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { animate, m, useInView, useMotionValue, useMotionValueEvent, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import type { StageMode } from "@/hooks/useStageProgress"
import { ROUTE_PATH, ROUTE_SUMMIT, VIEWBOX } from "./geometry"

const COMPLETE_AT = 0.999
// Grosor en unidades de la imagen (≈ 1 px a 1440 px de ancho). Sin trazo
// "non-scaling-stroke": con pathLength, Chromium calcula el guion en unidades de
// la imagen y lo pinta en píxeles de pantalla, y la ruta "completa" se quedaría
// en ~60–80 % en pantallas grandes (plan §3.6).
const ROUTE_STROKE = 1.1

/**
 * Ruta de la portada: una línea blanca sube por la cresta y termina en el punto
 * azul de la cumbre, el único azul de la sección (plan §3.1).
 * `strokeLinecap="butt"`: con `round`, un trazo de longitud 0 ya pinta un punto.
 */
export function HeroRoute({ progress, mode }: { progress: MotionValue<number>; mode: StageMode }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true })

  // scrub: el avance del escenario dibuja la ruta y enciende la cumbre (traspaso §4)
  const scrubDraw = useTransform(progress, [0.06, 0.68], [0, 1])
  const scrubSummit = useTransform(progress, [0.66, 0.74], [0, 1])

  // inView / static: valor propio, animado una vez al entrar o fijado al final
  const ownDraw = useMotionValue(0)
  const ownSummit = useTransform(ownDraw, [0.95, 1], [0, 1])

  useEffect(() => {
    if (mode === "static") {
      ownDraw.set(1)
      return
    }
    if (mode !== "inView" || !inView) return
    const controls = animate(ownDraw, 1, { duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [mode, inView, ownDraw])

  const draw = mode === "scrub" ? scrubDraw : ownDraw
  const summit = mode === "scrub" ? scrubSummit : ownSummit

  // data-complete: estado observable para las pruebas (sin esperas por tiempo)
  const [complete, setComplete] = useState(false)
  useMotionValueEvent(draw, "change", (value) => setComplete(value >= COMPLETE_AT))
  useEffect(() => {
    // Al cambiar de modo cambia el valor que se lee: se sincroniza sin esperar a un "change".
    queueMicrotask(() => setComplete(draw.get() >= COMPLETE_AT))
  }, [draw])

  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-hero-route=""
      data-complete={complete ? "true" : "false"}
      className="absolute inset-0 h-full w-full"
    >
      <m.path
        d={ROUTE_PATH}
        fill="none"
        stroke="#ffffff"
        strokeWidth={ROUTE_STROKE}
        strokeLinecap="butt"
        style={{ pathLength: draw }}
      />
      <m.circle
        data-hero-summit=""
        cx={ROUTE_SUMMIT.x}
        cy={ROUTE_SUMMIT.y}
        r={6}
        fill="#2563eb"
        style={{ opacity: summit }}
      />
    </svg>
  )
}
```

`src/components/sections/home/HomeHero.tsx`
```tsx
"use client"

import { useRef } from "react"
import Image from "next/image"
import { m, useMotionValue, useTransform } from "motion/react"
import relieve from "@/assets/images/relieve.jpg"
import { Button } from "@/components/ui/Button"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { ScrollStage } from "@/components/ui/ScrollStage"
import { useStageProgress } from "@/hooks/useStageProgress"
import { trackEvent } from "@/lib/analytics"
import { HeroRoute } from "./HeroRoute"
import { IMAGE_HEIGHT, IMAGE_WIDTH, ROUTE_SUMMIT } from "./geometry"

interface HeroAction {
  label: string
  href: string
  analyticsEvent: string
}

export interface HomeHeroContent {
  eyebrow: string
  title: string
  description: string
  primaryAction: HeroAction
  secondaryAction: HeroAction
  nurtureCta: HeroAction
  indexItems: readonly string[]
  imageLabel: string
  scrollHint: string
}

// Encuadre (traspaso §4): la ruta de la derecha se ve también en celular.
const FOCAL_CLASS = "[--fx:92%] md:[--fx:80%] lg:[--fx:50%]"
// El zoom se ancla en la cumbre (83,5 % 41,1 %): el punto azul no se mueve al escalar.
const SUMMIT_ORIGIN = `${(ROUTE_SUMMIT.x / IMAGE_WIDTH) * 100}% ${(ROUTE_SUMMIT.y / IMAGE_HEIGHT) * 100}%`
// El marco 3:2 mide max(100vw, 150svh): en pantallas más altas que 3:2 es más
// ancho que el viewport, y la imagen debe pedirse a ese ancho.
const IMAGE_SIZES = "(max-aspect-ratio: 3/2) 150vh, 100vw"
// Foco visible sobre fondo oscuro (el anillo del Button y el outline global son #0a0a0a).
const DARK_FOCUS = "focus-visible:ring-white focus-visible:ring-offset-[#0a0a0a]"

/**
 * Portada de la home (diseño §5.1). Isla cliente, pero todo su contenido (h1,
 * imagen, CTA) sale en el HTML del servidor: el primer render es `scrub` con
 * avance 0, que es el estado de reposo y no oculta nada.
 *
 * Capas, de abajo arriba: relieve → velo lateral → ruta y cumbre → velo de
 * encabezado y suelo → empalme inferior → texto → capa de instrumento.
 * En vertical por debajo de lg (celular, tableta) la imagen es una banda de
 * 73 svh con la cumbre a 30 svh, y el texto empieza en 36 svh, debajo de ella.
 */
export function HomeHero({ content }: { content: HomeHeroContent }) {
  const stageRef = useRef<HTMLElement>(null)
  const { progress, mode } = useStageProgress(stageRef)
  const scrub = mode === "scrub"

  // scrub (traspaso §4, "Portada"): rangos sobre el avance del escenario de 160 svh
  const scrubScale = useTransform(progress, [0, 1], [1, 1.12])
  const scrubTextY = useTransform(progress, [0, 1], [0, -140])
  const scrubTextOpacity = useTransform(progress, [0.62, 0.95], [1, 0])
  const scrubFade = useTransform(progress, [0.55, 1], [0, 1])

  // inView / static: sin zoom ni desplazamiento; el empalme inferior, en su estado final
  const settled = useMotionValue(1)
  const still = useMotionValue(0)

  const scale = scrub ? scrubScale : settled
  const textY = scrub ? scrubTextY : still
  const textOpacity = scrub ? scrubTextOpacity : settled
  const fade = scrub ? scrubFade : settled

  return (
    // frameClassName: stage:h-auto sustituye al h-svh de ScrollStage (twMerge):
    // el marco mide al menos 100 svh y crece si el contenido no cabe (teléfono
    // apaisado, ≥ 768 × ~430). Así nada queda recortado por overflow-hidden,
    // tampoco la etiqueta "Imagen ilustrativa".
    <ScrollStage
      ref={stageRef}
      id="inicio"
      track="short"
      mode={mode}
      theme="dark"
      startsDark
      className="bg-[#0a0a0a] text-white"
      frameClassName="flex min-h-svh flex-col overflow-hidden stage:h-auto"
    >
      <div className="absolute inset-x-0 top-0 h-svh max-lg:portrait:h-[73svh] lg:h-full">
        {/* Relieve: es el LCP. Sale en el HTML del servidor y se pide con prioridad alta. */}
        <FocalCover className={FOCAL_CLASS}>
          <m.div className="absolute inset-0" style={{ scale, transformOrigin: SUMMIT_ORIGIN }}>
            <Image
              src={relieve}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              placeholder="blur"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </m.div>
        </FocalCover>

        {/* Velos de contraste AA (globals.css): el lateral por debajo de la ruta... */}
        <div aria-hidden="true" className="hero-veil-side" />

        {/* Ruta + cumbre: mismo marco y mismo zoom que la imagen */}
        <FocalCover className={FOCAL_CLASS}>
          <m.div className="absolute inset-0" style={{ scale, transformOrigin: SUMMIT_ORIGIN }}>
            <HeroRoute progress={progress} mode={mode} />
          </m.div>
        </FocalCover>

        {/* ...y el de encabezado y suelo por encima, para que la ruta no cruce el índice */}
        <div aria-hidden="true" className="hero-veil" />
      </div>

      {/* Empalme con la sección siguiente: crece hacia #0a0a0a al final del escenario */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent"
        style={{ opacity: fade }}
      />

      <m.div className="relative z-10 flex flex-1 flex-col" style={{ y: textY, opacity: textOpacity }}>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-24 pb-8 max-lg:portrait:justify-start max-lg:portrait:pt-[36svh] landscape:short:pt-20 short:pb-6">
          <InstrumentLabel as="p" className="mb-6 short:mb-4">
            /0.1 · {content.eyebrow}
          </InstrumentLabel>

          {/* text-fluid-hero con tope por altura (12svh) y 16ch: ver Decisiones de T6 */}
          <h1 className="mb-6 max-w-[16ch] text-balance font-heading text-[length:clamp(2.5rem,min(8vw,12svh),7rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white short:mb-4">
            {content.title}
          </h1>

          <p className="mb-8 max-w-2xl text-fluid-p leading-relaxed text-[#a3a3a3] short:mb-6 short:leading-normal">
            {content.description}
          </p>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Button
              size="lg"
              href={content.primaryAction.href}
              onClick={() => trackEvent(content.primaryAction.analyticsEvent)}
              className={`w-full bg-white text-[#0a0a0a] hover:bg-[#e5e5e5] sm:w-auto ${DARK_FOCUS}`}
            >
              {content.primaryAction.label}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href={content.secondaryAction.href}
              onClick={() => trackEvent(content.secondaryAction.analyticsEvent)}
              className={`w-full border-white/25 text-white hover:border-white/45 hover:bg-white/10 sm:w-auto ${DARK_FOCUS}`}
            >
              {content.secondaryAction.label}
            </Button>
          </div>

          {/* href tal cual (#gobierno / #government): ancla de esta misma página */}
          <a
            href={content.nurtureCta.href}
            onClick={() => trackEvent(content.nurtureCta.analyticsEvent)}
            className="mt-6 inline-flex items-center gap-2 self-start text-sm text-[#a3a3a3] transition-colors duration-200 hover:text-white focus-visible:outline-white short:mt-4"
          >
            <span aria-hidden="true">→</span>
            {content.nurtureCta.label}
          </a>
        </div>

        <div className="mx-auto w-full max-w-7xl px-6">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-4">
            {content.indexItems.map((item, i) => (
              <li key={item}>
                <InstrumentLabel>
                  <span aria-hidden="true" className="mr-2 text-white">
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </InstrumentLabel>
              </li>
            ))}
          </ul>
        </div>
      </m.div>

      {/* Capa de instrumento, esquinas inferiores. No se desvanece: la imagen sigue a la vista. */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 pt-3 pb-5">
        <InstrumentLabel>{content.imageLabel}</InstrumentLabel>
        <InstrumentLabel>
          <span>{content.scrollHint}</span>
          <span aria-hidden="true" className="ml-2">↓</span>
        </InstrumentLabel>
      </div>
    </ScrollStage>
  )
}
```

#### 2.8 `src/components/ui/TrustLogos.tsx` (nuevo; sale de TrustBar sin `<section>` ni fundido)
```tsx
import { cn } from "@/lib/utils"
import { InstrumentLabel } from "./InstrumentLabel"

// Tecnologías con las que construimos — no partnerships ni certificaciones
// (CLAUDE.md). La etiqueta la da el diccionario: `trustBar.label`.
//
// width/height match each SVG's aspect ratio at the rendered 20px height (h-5),
// so the row reserves its space before the images load (no CLS).
const TRUST_LOGOS = [
  { name: "Amazon Web Services", src: "/logos/aws.svg", width: 33, height: 20 },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", width: 40, height: 20 },
  { name: "Microsoft Azure", src: "/logos/azure.svg", width: 20, height: 20 },
  { name: "OpenAI", src: "/logos/openai.svg", width: 74, height: 20 },
]

const logoClass =
  "h-5 w-auto brightness-0 opacity-[0.35] hover:opacity-70 transition-opacity duration-200"

/* The Vercel lockup is the only one rendered as live text rather than an image,
   so the strip's 0.35 fade would put it at 2.43:1 — images are exempt from the
   contrast rule, real text is not. It carries its own slightly stronger fade
   (black at 0.55 over the #f8f8f8 of TechStack is #707070, 4.66:1) and keeps
   the same behaviour. */
const wordmarkClass =
  "h-5 w-auto brightness-0 opacity-[0.55] hover:opacity-80 transition-opacity duration-200"

/**
 * Fila de logos "Construimos con" (ex TrustBar). Sin sección propia ni fundido
 * de entrada: la monta TechStack, sobre fondo claro.
 */
export function TrustLogos({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-12", className)}>
      <InstrumentLabel tone="light" className="mr-4">
        {label}
      </InstrumentLabel>

      {TRUST_LOGOS.map((logo) => (
        // eslint-disable-next-line @next/next/no-img-element -- local SVGs; next/image would need dangerouslyAllowSVG for no optimization gain
        <img
          key={logo.name}
          src={logo.src}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          className={logoClass}
          draggable={false}
        />
      ))}

      {/* Vercel — inline SVG + text (official source is PNG only) */}
      <span className={`inline-flex items-center gap-1.5 ${wordmarkClass}`} role="img" aria-label="Vercel">
        <svg viewBox="0 0 76 65" className="h-3 w-auto" fill="black" aria-hidden="true">
          <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
        </svg>
        {/* Brand wordmark, dimmed to sit level with the four <img> logos beside
            it. WCAG 1.4.3 exempts logotypes from the contrast minimum; the hook
            below carries that exemption to the a11y gate, which cannot infer it. */}
        <span data-brand-wordmark="vercel" className="select-none text-[13px] font-semibold tracking-tight text-black">
          Vercel
        </span>
      </span>
    </div>
  )
}
```

#### 2.9 `src/components/sections/TechStack.tsx` (archivo completo)
```tsx
"use client"

import { m } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { TrustLogos } from "@/components/ui/TrustLogos"

interface TechStackContent {
  sectionId: string
  title: string
  categories: readonly {
    name: string
    items: readonly string[]
  }[]
  note?: string
}

function CategoryRow({
  category,
  index,
}: {
  category: { name: string; items: readonly string[] }
  index: number
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-8 border-b border-[#e5e5e5] last:border-b-0"
    >
      <div className="md:col-span-3 flex items-start gap-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#707070] tabular-nums pt-[3px]" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#525252] pt-[3px]">
          {category.name}
        </h3>
      </div>

      <ul className="md:col-span-9 flex flex-wrap gap-x-2 gap-y-3">
        {category.items.map((item, i) => (
          <li key={item} className="flex items-center text-sm font-medium text-[#0a0a0a] whitespace-nowrap">
            {item}
            {i < category.items.length - 1 && (
              <span className="ml-2 text-[#d4d4d4] select-none" aria-hidden="true">/</span>
            )}
          </li>
        ))}
      </ul>
    </m.div>
  )
}

export function TechStack({ content, trustLabel }: { content: TechStackContent; trustLabel: string }) {
  return (
    <section
      id={content.sectionId}
      className="py-16 sm:py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <RevealText
          as="h2"
          className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-10 sm:mb-16"
        >
          {content.title}
        </RevealText>

        {/* "Construimos con": tecnologías que usamos, no alianzas (CLAUDE.md). Antes era TrustBar bajo la portada. */}
        <TrustLogos label={trustLabel} className="mb-10 sm:mb-12" />

        <div className="bg-white border border-[#e5e5e5] rounded-[6px] px-6 sm:px-10">
          {content.categories.map((cat, i) => (
            <CategoryRow key={cat.name} category={cat} index={i} />
          ))}
        </div>

        {/* a11y: #737373 sobre #f8f8f8 daba 4.46:1 (< AA 4.5). #707070 da 4.66:1 sin cambio perceptible. */}
        {content.note && (
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#707070]">
            {content.note}
          </p>
        )}
      </div>
    </section>
  )
}
```

#### 2.10 `src/app/[locale]/page.tsx` (archivo completo)

Quedan **literales** las líneas en las que se anclan T7–T10:
- `import { getDictionary } …`;
- los `dynamic()` de Services, FlagshipAI, CaseStudy, LiveStudioTeaser y Methodology;
- sus cinco líneas JSX.

La línea JSX de TechStack cambia a `<TechStack content={dict.techStack} trustLabel={dict.trustBar.label} />`.
```tsx
import dynamic from "next/dynamic"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HomeHero } from "@/components/sections/home/HomeHero"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"

// La portada se importa de forma estática: es el LCP y su HTML tiene que salir
// del servidor sin esperar a ningún chunk. El resto de secciones, bajo el pliegue.
const Services = dynamic(() => import("@/components/sections/Services").then(m => ({ default: m.Services })))
const FlagshipAI = dynamic(() => import("@/components/sections/FlagshipAI").then(m => ({ default: m.FlagshipAI })))
const CaseStudy = dynamic(() => import("@/components/sections/CaseStudy").then(m => ({ default: m.CaseStudy })))
const LiveStudioTeaser = dynamic(() => import("@/components/sections/LiveStudioTeaser").then(m => ({ default: m.LiveStudioTeaser })))
const Methodology = dynamic(() => import("@/components/sections/Methodology").then(m => ({ default: m.Methodology })))
const TechStack = dynamic(() => import("@/components/sections/TechStack").then(m => ({ default: m.TechStack })))
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })))
const CTA = dynamic(() => import("@/components/sections/CTA").then(m => ({ default: m.CTA })))

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/")
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  // FAQPage schema — must stay in sync with dict.faq.items (see CLAUDE.md)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  // secondaryAction (#capacidades) y nurtureCta (#gobierno / #government) son
  // anclas de esta misma página: su href va tal cual, sin buildLocalePath.
  const heroContent = {
    ...dict.hero,
    primaryAction: {
      ...dict.hero.primaryAction,
      href: buildLocalePath(locale, "/diagnostico"),
    },
  }

  const ctaContent = {
    ...dict.cta,
    action: {
      ...dict.cta.action,
      href: buildLocalePath(locale, "/agendar"),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HomeHero content={heroContent} />
      <Services content={dict.services} locale={locale} />
      <FlagshipAI content={dict.flagshipAI} />
      <CaseStudy content={dict.caseStudy} locale={locale} />
      <LiveStudioTeaser content={dict.liveStudioTeaser} locale={locale} />
      <Methodology content={dict.methodology} />
      <TechStack content={dict.techStack} trustLabel={dict.trustBar.label} />
      <FAQ content={dict.faq} />
      <CTA content={ctaContent} />
    </>
  )
}
```

#### 2.11 Borrar la portada y la franja de logos antiguas
```bash
git rm src/components/sections/Hero.tsx src/components/sections/TrustBar.tsx
grep -rnE 'sections/(Hero|TrustBar)"|<TrustBar|<Hero ' src    # sin resultados
```

#### 2.12 `e2e/a11y.spec.ts`: el comentario de la exención nombra el componente nuevo
```ts
// antes
      // nodo marcado asi es el wordmark de marca del TrustBar, atenuado para
// después
      // nodo marcado asi es el wordmark de marca de TrustLogos, atenuado para
```

---

### Paso 3 — Verificación

```bash
cd /home/user/wt/task6
npm run lint                                   # 0 errores, 0 avisos nuevos
npx tsc --noEmit                               # sin salida (e2e/ incluido)
PORT=3060 npx playwright test e2e/home.spec.ts --reporter=line
#   → 9 passed
PORT=3060 npx playwright test e2e/smoke.spec.ts e2e/a11y.spec.ts --reporter=line
#   → todo passed; el escaneo "on /es" sin violaciones serious/critical
PORT=3060 npx playwright test --reporter=line
#   → suite completa en verde (las de T1–T5 + las 9 nuevas)
npm run build                                  # compila sin errores ni avisos de tipos
```

Comprobaciones estáticas (todas sin resultados):
```bash
grep -rn "vectorEffect" src/components/sections/home                       # la ruta anima pathLength: prohibido (§3.6)
grep -rn "<motion\." src/components/sections/home src/components/ui/ScrollStage.tsx src/hooks/useStageProgress.ts
grep -rn "priority" src/components/sections/home/HomeHero.tsx | grep -v fetchPriority
grep -rnE "#2563eb" src/components/sections/home | grep -v HeroRoute.tsx    # el único azul es la cumbre
```

**Coordinación con T5:** si `e2e/header.spec.ts` afirma que el encabezado de `/es` es claro al cargar (`data-tone="light"`), esa aserción describe la portada anterior. Se cambia a `dark`: la portada nueva es oscura y lleva `data-header-start="dark"` (contrato §3.4 y §3.5). La prueba de `/es/inversores` no cambia.

**Revisión visual (opcional, 2 min).** Levanta `PORT=3060 npm run dev` y abre `/es` y `/en`:
- **1440×900:** texto a la izquierda y cumbre a la derecha. Al bajar, la ruta se dibuja, aparece el punto azul, el texto sube y se desvanece, y el borde inferior funde a `#0a0a0a`.
- **390×844:** la imagen es una banda superior, la cumbre queda sobre el eyebrow y la ruta se dibuja sola.
- **Reducir movimiento:** todo quieto, con la ruta ya dibujada.

---

### Paso 4 — Commit

```
feat(home): portada con relieve, ruta a la cumbre y primitivas de escenario

La portada pasa a ser el relieve andino a pantalla completa, con el H1 fijo
"Construimos soberanía digital." servido desde el servidor (LCP) y una ruta
que se dibuja con el scroll hasta el único punto azul, en la cumbre. Se crean
las primitivas de las tareas 7–10 (useStageProgress, ScrollStage, FocalCover,
InstrumentLabel y geometry.ts con las tres geometrías medidas), y los logos
"Construimos con" pasan a Tecnologías como TrustLogos. Se borran Hero.tsx,
TrustBar.tsx y las claves hero.titleLead, titleHighlight, titleRotating y
trustLine.

Decisiones:
- H1 con tope por altura, clamp(2.5rem, min(8vw, 12svh), 7rem), y
  max-w-[16ch]: con text-fluid-hero no cabía a 1280×720, y con 18ch el
  título inglés quedaba a veces en una línea.
- Velos de contraste en globals.css: al menos 0,785 de #0a0a0a bajo todo
  texto, incluida la franja del encabezado transparente. Medido: ≥ 6,6:1
  para #a3a3a3 y ≥ 5,5:1 en la franja del encabezado.
- En vertical por debajo de lg, la imagen es una banda de 73 svh y el texto
  empieza bajo la cumbre, para que la ruta no cruce el texto.
- Variante short: (≤ 720 px de alto) y marco stage:h-auto: la
  portada cabe a 1366×657 y nada se recorta en teléfonos apaisados.
- La ruta fija su grosor en unidades de la imagen, sin non-scaling-stroke
  (plan §3.6).
- TechStack sigue siendo componente cliente (m.div whileInView + RevealText).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
```

---

### Decisiones

Las decisiones de layout y contraste se midieron antes de escribir este plan, sin levantar el servidor de la app. Se usó una maqueta estática con el CSS real de Tailwind v4 (la `globals.css` del repo más los bloques de §2.3), Geist y el relieve procesado, renderizada en Chromium (Playwright) a 9–14 viewports. El código de §2 compila (`tsc`) y pasa `eslint` en una copia del repo con el estado de T1–T5 simulado.

1. **Velos de contraste con AA garantizado por construcción** (diseño §11, traspaso "Contraste").
   - El píxel más claro del relieve es 233/255. Para que `#a3a3a3` llegue a 4,5:1 hace falta ≥ 0,785 de `#0a0a0a` debajo de cualquier texto.
   - `.hero-veil-side` (≥ lg o apaisado) cubre la columna de texto con 0,86–0,9 hasta `max(50% + 5rem, 45rem)`. La columna termina como mucho en 50 % + 56 px.
   - `.hero-veil` pone ≥ 0,8 en los 4,5rem superiores, porque el encabezado de T5 es transparente sobre la portada, y ≥ 0,8 en los 6rem inferiores (índice y capa de instrumento).
   - **Resultado medido:** el texto `#a3a3a3` queda ≥ 6,6:1; la franja del encabezado ≥ 5,5:1 (peor caso: 2560×1080 con el zoom de 1,12); el H1 ≥ 10:1.
   - axe no puede comprobar texto sobre `<img>`: lo deja como *incomplete*. Por eso la garantía está en los velos y no en la prueba.
2. **Orden de capas:** relieve → velo lateral → ruta y cumbre → velo de encabezado y suelo → empalme → texto → capa de instrumento.
   - Así la ruta no se atenúa al cruzar el degradado lateral, y tampoco cruza la fila de índice: el suelo la oscurece.
   - Imagen y ruta van en dos `FocalCover` idénticos, con el mismo `scale` y el mismo `transformOrigin`. Siguen alineadas con el zoom.
3. **Vertical por debajo de lg (celular y tableta): banda de 73 svh.**
   - A pantalla completa, a 390×844 la ruta y el punto azul caían detrás de la descripción y de los CTA.
   - Con la banda (`max-lg:portrait:h-[73svh]`), la cumbre queda a 30 svh y el texto empieza en 36 svh (`max-lg:portrait:pt-[36svh]`). El velo sube a 0,85 justo antes del texto.
   - El CTA primario sigue en el primer pliegue a 390×844.
   - En horizontal y en ≥ lg, la imagen ocupa todo el marco.
   - Los `--fx` del traspaso (92 / 80 / 50 %) no cambian. La media query de `.hero-veil` es la misma que `max-lg:portrait:`.
4. **H1: desviación de `text-fluid-hero` y de `max-w-[18ch]`.**
   - Con `text-fluid-hero` (8vw), 1366×768 cabía con 0 px de margen y 1280×720 no cabía. Se usa `text-[length:clamp(2.5rem,min(8vw,12svh),7rem)]`: a 1366×768 quedan 20 px.
   - 18ch mide ≈ 12,8em en Geist Bold, y "We build digital sovereignty." mide 12,7em: en inglés el H1 salía a una línea en algunos tamaños. Con 16ch (≈ 11,2em) queda en dos líneas en los dos idiomas. "soberanía digital." mide 7,8em y cabe.
   - Las pruebas comprueban dos líneas en `es` (1366×768, 1366×657 y 2560×1080) y en `en` (1440×900).
5. **Altura corta.**
   - `@custom-variant short (@media (max-height: 45rem))` compacta el ritmo vertical. La portada entra entera a 1366×657, que es un 1366×768 real con la barra del navegador. Está medido y la prueba lo incluye.
   - El marco de la portada lleva `stage:h-auto`, que `twMerge` pone en lugar del `h-svh` de `ScrollStage`: mide al menos 100 svh y crece si el contenido no cabe.
   - En teléfonos apaisados de ≥ 768 px de ancho (844×390, 932×430), el contrato los trata como `scrub`. Con `h-svh` y `overflow-hidden` se recortaban el índice y la etiqueta "Imagen ilustrativa".
   - **Resuelto en el contrato (§3.6):** el modo `scrub` exige además `min-height: 600px`, a la vez en `SCRUB_QUERY` y en la variante CSS `stage:` que crea esta tarea en `globals.css`. Así los escenarios de T7 y T8 no se recortan en celulares apaisados. El `stage:h-auto` del marco de la portada se mantiene como red de seguridad para alturas entre 600 y 720 px.
6. **Ruta (§3.6 actualizado):**
   - `m.path` con `pathLength`, `strokeWidth={1.1}` en unidades de la imagen, sin `non-scaling-stroke`, y `strokeLinecap="butt"`.
   - Comprobado en Chromium: `non-scaling-stroke` + `pathLength="1"` + `stroke-dasharray="1 1"` dibuja el 50 % de la línea a escala 2×.
   - La cumbre es un `m.circle` con `r=6` y `fill="#2563eb"`, con `data-hero-summit` en el propio círculo.
7. **Modos:**
   - En `inView` y `static` se enlazan `MotionValue` propios, no estilos fijos: zoom 1, texto quieto y empalme inferior en su estado final (1).
   - La ruta usa su propio valor: `animate(…, { duration: 1.8, delay: 0.3 })` cuando entra en pantalla (`useInView`, `once`) o `.set(1)` en `static`. La cumbre se enciende en el último 5 % de ese valor.
   - `data-complete` se actualiza con `useMotionValueEvent`, y se vuelve a sincronizar en un microtask cuando cambia el modo (al cambiar de modo cambia el valor que se lee).
   - Los offsets de `useStageProgress` se pasan como texto: motion no los acelera con ViewTimeline, y los `MotionValue` (y los `data-*` que leen las pruebas) reflejan el scroll real.
8. **Imagen:** `sizes="(max-aspect-ratio: 3/2) 150vh, 100vw"`, porque el marco mide `max(100vw, 150svh)`.
   - Como `sizes` contiene `100vw`, Next genera el `srcset` completo desde 640 px.
   - `loading="eager"` + `fetchPriority="high"`, sin `priority` ni `preload` (Next 16, `image.md`). La prueba del HTML del servidor lo comprueba.
9. **TechStack sigue siendo cliente.**
   - Usa `m.div` con `whileInView` y `RevealText`, y `m.div` no se puede usar desde un componente de servidor: Next no permite acceder a una propiedad de un módulo cliente ("cannot dot into a client module"). Convertirlo es trabajo de T10.
   - `TrustLogos` no tiene hooks, así que sirve en los dos lados. Va entre el título y el panel.
   - Su etiqueta usa `InstrumentLabel tone="light"`: `#707070` sobre `#f8f8f8` da 4,66:1.
10. **Pruebas:**
    - Reducir movimiento con `contextOptions` (§3.7).
    - El encabezado sin JavaScript se comprueba con el fondo de `.site-header` transparente y el color del enlace del logo (`a[href="/es"]`, que pinta `--hdr-fg`) en `rgb(255, 255, 255)`. Así no importa si `.site-header` declara `color` o no.
    - `countVisibleBlue` cuenta una propiedad solo en el elemento que la declara, no en los que la heredan: un `<g fill>` con tres círculos cuenta como un elemento azul. También cuenta azul con alfa > 0.
    - La prueba de celular espera hasta 6 s a `data-complete="true"`: 0,3 s de espera más 1,8 s de dibujo.
11. **Detalles de copy y accesibilidad:**
    - La fila de índice no lleva "·": los números `/0N` (blancos, `aria-hidden`) hacen de separador, y con `flex-wrap` un punto al principio de línea se veía roto en celular.
    - Foco visible sobre oscuro: anillo blanco con offset `#0a0a0a` en los botones y `outline` blanco en el enlace de sector público. El foco del `Button` y el global son `#0a0a0a` e invisibles sobre la portada.
    - `nurtureCta.href = "#gobierno"` / `"#government"` apunta a una sección que crea T8. Hasta entonces el ancla no lleva a ningún sitio. La revisión 2 se prueba en T8.

---

## Tarea 7 — Tesis y Capacidades

**Depende de:** T6 integrada en `redesign/home` (existen `src/assets/images/{lamina,expediente}.jpg`, `src/hooks/useStageProgress.ts`, `src/components/ui/{InstrumentLabel,FocalCover,ScrollStage}.tsx`, `src/components/sections/home/geometry.ts`, las clases `.focal-frame` / `.focal-cover` en `globals.css`, `e2e/home.spec.ts` y `e2e/helpers.ts` con `effectiveOpacity`, `scrollToY` y `countVisibleBlue`). La home renderiza `HomeHero` y después los antiguos `Services`, `FlagshipAI`, `CaseStudy`, `LiveStudioTeaser`, `Methodology`, `TechStack`, `FAQ` y `CTA`.

**Archivos compartidos (obligan a ir en serie):** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts`, `src/app/[locale]/page.tsx`, `e2e/home.spec.ts` (se añaden bloques al final). `e2e/smoke.spec.ts` no cambia (ver 2.6).

**Worktree y puerto:** `/home/user/wt/task7`, rama `wt/task7`, **`PORT=3070`**.
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task7 -b wt/task7 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task7/node_modules
cd /home/user/wt/task7
```

### Archivos
- **Crear:** `src/components/sections/home/Thesis.tsx`, `src/components/sections/home/CapabilitiesIndex.tsx`.
- **Modificar:** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts` (`thesis`, `services.imageLabel`, se elimina `flagshipAI`), `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`.
- **Borrar:** `src/components/sections/Services.tsx`, `src/components/sections/FlagshipAI.tsx`.

### Paso 1 — Prueba primero

**1.1 Importaciones.** En la cabecera de `e2e/home.spec.ts` deben quedar estas importaciones. Añade solo las que falten (no dupliques ninguna ya creada por T6; si T6 importa los helpers en otra línea, amplía esa línea):
```ts
import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { buildLocalePath } from '../src/lib/i18n'
import { countVisibleBlue, effectiveOpacity, scrollToY } from './helpers'
```
> `countVisibleBlue(page)` es el helper de T6. Este plan lo usa como `(page: Page) => Promise<number>` y asume que cuenta solo los elementos azules **visibles y dentro del viewport** (ver Decisiones). Si T6 lo creó con otra firma, adapta la llamada; no lo dupliques.

**1.2 Pega al final de `e2e/home.spec.ts`:**
```ts
// ── Tarea 7 — Tesis y Capacidades ──────────────────────────────────────────

test.describe('Tesis y Capacidades · sin JavaScript', () => {
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
})

test.describe('Tesis y Capacidades · reducir movimiento', () => {
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

    await expect(page.locator('section:has([data-thesis-word])')).toHaveAttribute('data-stage-mode', 'static')
    await expect(page.locator('[data-thesis-word]')).toHaveCount(words)
    await expect(page.locator('[data-thesis-word][data-active="true"]')).toHaveCount(words)
  })
})

test.describe('Tesis y Capacidades · scrub (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('la tesis pasa de #737373 a #0a0a0a palabra a palabra', async ({ page }) => {
    await page.goto('/es')
    const thesis = page.locator('p:has([data-thesis-word])')
    await expect(page.locator('section:has([data-thesis-word])')).toHaveAttribute('data-stage-mode', 'scrub')
    await expect(page.locator('[data-thesis-word][data-active="true"]')).toHaveCount(0)
    await expect(thesis.locator('[data-thesis-word]').first()).toHaveCSS('color', 'rgb(115, 115, 115)')

    // Borde inferior de la frase al 40 % del viewport → avance 1 (offset "end 0.5")
    const y = await thesis.evaluate((el) => window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight * 0.4)
    await scrollToY(page, y)
    await expect(page.locator('[data-thesis-word][data-active="false"]')).toHaveCount(0)
    await expect(thesis.locator('[data-thesis-word]').last()).toHaveCSS('color', 'rgb(10, 10, 10)')
  })

  test('con la fila 3 en el centro se encienden los nodos 0–2 y hay un solo azul', async ({ page }) => {
    await page.goto('/es')
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

test.describe('Capacidades · de escritorio a celular (revisión 3)', () => {
  test('pasa a inView sin errores y completa la red', async ({ page }) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    const section = page.locator(`#${es.services.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')

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

test.describe('Tesis y Capacidades · inglés (revisión 5)', () => {
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
```
Notas:
- Reducir movimiento se emula con `test.use({ contextOptions: { reducedMotion: 'reduce' } })`, como fija §3.7.
- Todo acceso a claves nuevas (`es.thesis`, `en.thesis`, `imageLabel`) está dentro de los `test(...)`, para que en rojo fallen solo estas pruebas y no el archivo entero.

**1.3 Ejecuta y comprueba el rojo:**
```bash
PORT=3070 npx playwright test e2e/home.spec.ts --reporter=line -g "Tesis|Capacidades"
```
**Fallo esperado:** 6 pruebas en rojo, ninguna por un error de sintaxis:
- `sin JavaScript` → falla en `effectiveOpacity` (*Expected: 1 · Received: 0*) o antes: el `h2` antiguo vive en un `m.section` con `opacity: 0` en el HTML del servidor.
- `reducir movimiento`, `scrub` (las dos) y `revisión 3` → *Timed out … toHaveAttribute / toHaveCount*: no existe `data-stage-mode`, `[data-node]` ni `[data-thesis-word]`.
- `inglés (revisión 5)` → `TypeError: Cannot read properties of undefined (reading 'text')` (`en.thesis` no existe).

Las pruebas de T6 del mismo archivo siguen en verde (`PORT=3070 npx playwright test e2e/home.spec.ts --reporter=line`). No ejecutes `tsc` en este paso: falla a propósito por `es.thesis`.

### Paso 2 — Implementación

#### 2.1 Diccionarios

**`src/content/dictionaries/es.ts`** — tesis e `imageLabel` de la lámina.

Antes (`src/content/dictionaries/es.ts`):
```ts
  services: {
    sectionId: "capacidades",
    title: "Capacidades de Ingeniería",
```
Después:
```ts
  thesis: {
    text: "Diseñamos, desplegamos y operamos sistemas de software, inteligencia artificial y ciberseguridad para organizaciones donde la falla no es una opción.",
  },
  services: {
    sectionId: "capacidades",
    title: "Capacidades de Ingeniería",
    imageLabel: "Imagen ilustrativa",
```

Se elimina `flagshipAI` entero (el bloque va desde `  flagshipAI: {` hasta el `  },` que precede a `  caseStudy: {`).

Antes (`src/content/dictionaries/es.ts`):
```ts
  flagshipAI: {
    sectionId: "sistemas-ia",
    title: "Despliegue de IA Soberana",
    description:
      "Su organización necesita inteligencia artificial que opere bajo sus reglas, en su infraestructura, con sus datos. No dependencias externas, no riesgos de terceros. Para soluciones que requieren integración con APIs de terceros, implementamos contratos de procesamiento de datos y arquitecturas de privacidad que mantienen el control operativo en su organización.",
    items: [
      {
        title: "Agentes de Defensa Cibernética",
        description:
          "IA que monitorea su superficie de ataque, identifica vulnerabilidades y ejecuta protocolos de respuesta sin intervención humana.",
        icon: "cyber",
      },
      {
        title: "Fuerza de Trabajo Digital",
        description:
          "Asistentes ejecutivos con IA desplegados en todos sus canales de comunicación: gestión de agenda, triaje de información y coordinación operativa.",
        icon: "workforce",
      },
      {
        title: "Infraestructura de IA On-Premise",
        description:
          "Modelos de lenguaje, pipelines de datos y agentes autónomos operando dentro de su perímetro de seguridad, con soberanía total sobre los datos.",
        icon: "infra",
      },
    ],
    caption:
      "Control total. Soberanía completa. Impacto medible.",
  },
```
Después: *(nada; el bloque desaparece y `caseStudy` queda justo después del cierre de `services`)*

**`src/content/dictionaries/en.ts`** — misma forma.

Antes (`src/content/dictionaries/en.ts`):
```ts
  services: {
    sectionId: "capacidades",
    title: "Engineering Capabilities",
```
Después:
```ts
  thesis: {
    text: "We design, deploy and operate software, artificial intelligence and cybersecurity systems for organizations where failure is not an option.",
  },
  services: {
    sectionId: "capacidades",
    title: "Engineering Capabilities",
    imageLabel: "Illustrative image",
```

Antes (`src/content/dictionaries/en.ts`):
```ts
  flagshipAI: {
    sectionId: "sistemas-ia",
    title: "Sovereign AI Deployment",
    description:
      "Your organization needs artificial intelligence that operates under your rules, on your infrastructure, with your data. No external dependencies, no third-party risks. For solutions requiring third-party API integration, we implement data processing agreements and privacy architectures that keep operational control within your organization.",
    items: [
      {
        title: "Cyber Defense Agents",
        description:
          "AI that monitors your attack surface, identifies vulnerabilities, and executes response protocols without human intervention.",
        icon: "cyber",
      },
      {
        title: "Digital Workforce",
        description:
          "AI executive assistants deployed across all your communication channels: calendar management, information triage, and operational coordination.",
        icon: "workforce",
      },
      {
        title: "On-Premise AI Infrastructure",
        description:
          "Language models, data pipelines, and autonomous agents operating within your security perimeter with total data sovereignty.",
        icon: "infra",
      },
    ],
    caption:
      "Total control. Complete sovereignty. Measurable impact.",
  },
```
Después: *(nada)*

Comprueba que `flagshipAI` no tiene otros usos (lo único que la leía era `FlagshipAI.tsx` y `page.tsx`):
```bash
grep -rn "flagshipAI\|FlagshipAI\|sistemas-ia" src e2e    # tras 2.4 y 2.5: sin salida
```

#### 2.2 `src/components/sections/home/Thesis.tsx` (nuevo)

Sección clara, sin `id`, sin sticky: la frase se lee mientras cruza la franja central y el `offset` sobre el propio `<p>` basta como recorrido. Texto real en el DOM; cada palabra es un `span` con `data-thesis-word` y `data-active`, y solo cambia su color (`#737373` → `#0a0a0a`, §3.1).

Archivo completo: `src/components/sections/home/Thesis.tsx`
```tsx
"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useInView, useMotionValueEvent } from "motion/react"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"

// La frase se lee mientras cruza la franja central del viewport: avance 0 cuando
// su borde superior llega al 85 % de la altura, 1 cuando su borde inferior llega
// al 50 %. No hace falta sticky: el propio desplazamiento de la frase es el recorrido.
const THESIS_OFFSET: StageOffset = ["start 0.85", "end 0.5"]
// Modo inView (celular): una palabra cada 60 ms (stagger de palabra del design system).
const WORD_STEP_MS = 60

export function Thesis({ text }: { text: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const { progress, mode } = useStageProgress(textRef, THESIS_OFFSET)
  const words = text.split(" ")
  const total = words.length

  // scrub: palabras activas = avance × total (cambio de color discreto, sin interpolar)
  const [scrubCount, setScrubCount] = useState(0)
  const onProgress = useCallback((latest: number) => setScrubCount(Math.round(latest * total)), [total])
  useMotionValueEvent(progress, "change", onProgress)

  // inView: al entrar en pantalla, una sola vez, palabra a palabra
  const inView = useInView(textRef, { once: true, amount: 0.5 })
  const [revealed, setRevealed] = useState(0)
  const revealedRef = useRef(0)
  useEffect(() => {
    if (mode !== "inView" || !inView || revealedRef.current >= total) return
    const timer = window.setInterval(() => {
      revealedRef.current = Math.min(revealedRef.current + 1, total)
      setRevealed(revealedRef.current)
      if (revealedRef.current >= total) window.clearInterval(timer)
    }, WORD_STEP_MS)
    return () => window.clearInterval(timer)
  }, [mode, inView, total])

  const activeCount = mode === "static" ? total : mode === "inView" ? revealed : scrubCount

  return (
    <section data-header-theme="light" data-stage-mode={mode} className="relative bg-white py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-6">
        <p
          ref={textRef}
          className="max-w-5xl font-heading text-fluid-h1 font-semibold leading-[1.08] tracking-tight"
        >
          {words.map((word, i) => {
            const active = i < activeCount
            return (
              <Fragment key={`${i}-${word}`}>
                <span
                  data-thesis-word=""
                  data-active={String(active)}
                  className={active ? "text-[#0a0a0a]" : "text-[#737373]"}
                >
                  {word}
                </span>
                {i < total - 1 ? " " : null}
              </Fragment>
            )
          })}
        </p>
      </div>
    </section>
  )
}
```

#### 2.3 `src/components/sections/home/CapabilitiesIndex.tsx` (nuevo)

Lista-índice de los 8 servicios (enlace por ítem, `/01`–`/08` en mono, nombre grande, `benefit` en gris, sin viñetas) y la lámina fija con la red de 8 nodos. Reglas:
- Índice activo **por posición** en cada cambio de `scrollY` (`useScroll` + `useMotionValueEvent`) y en cada `resize`.
- Nodo N encendido: círculo `#0a0a0a`; arista N−1→N con `m.line` y `pathLength`; nodo activo: el único azul (`#2563eb`).
- `inView`: secuencia de 220 ms por nodo al entrar la lámina en pantalla, que termina en N (red completa, sin azul). `static`: N.
- El `sticky` de la lámina lo pone CSS con `stage:` (reducir movimiento no tiene sticky); en celular la lámina va arriba y no se fija.

Archivo completo: `src/components/sections/home/CapabilitiesIndex.tsx`
```tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { m, useInView, useMotionValueEvent, useScroll } from "motion/react"
import lamina from "@/assets/images/lamina.jpg"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { useStageMode } from "@/hooks/useStageProgress"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { CAPABILITY_NODES, VIEWBOX } from "./geometry"

const INK = "#0a0a0a"
const BLUE = "#2563eb"
const NODE_COUNT = CAPABILITY_NODES.length
// Modo inView (celular): la red se enciende nodo a nodo, 220 ms por nodo.
const NODE_STEP_MS = 220
// Medidas en unidades del viewBox (1536×1024). Las aristas NO llevan
// vector-effect="non-scaling-stroke": con él, Chromium aplica mal pathLength
// (el trazo se dibuja de más o de menos según la escala de la imagen).
const NODE_RADIUS = 12
const RING_RADIUS = 24
const EDGE_WIDTH = 2.5

interface CapabilitiesContent {
  sectionId: string
  title: string
  imageLabel: string
  items: readonly { title: string; benefit: string; href: string }[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

// Índice activo por POSICIÓN (no IntersectionObserver: falla con scroll rápido).
// Última fila cuyo borde superior está en o sobre el centro del viewport;
// rows.length si la última fila ya pasó entera el centro (red completa, sin azul);
// -1 si ninguna llegó.
function indexAtCenter(rows: readonly HTMLElement[], center: number): number {
  const last = rows[rows.length - 1]
  if (!last) return -1
  if (last.getBoundingClientRect().bottom < center) return rows.length
  let index = -1
  rows.forEach((row, i) => {
    if (row.getBoundingClientRect().top <= center) index = i
  })
  return index
}

export function CapabilitiesIndex({ content, locale }: { content: CapabilitiesContent; locale: Locale }) {
  const mode = useStageMode()
  const listRef = useRef<HTMLOListElement>(null)
  const laminaRef = useRef<HTMLDivElement>(null)

  // scrub: se recalcula en cada cambio de scrollY y de tamaño de ventana
  const [scrubIndex, setScrubIndex] = useState(-1)
  const { scrollY } = useScroll()
  const measure = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-capability-row]"))
    setScrubIndex(indexAtCenter(rows, window.innerHeight / 2))
  }, [])
  useMotionValueEvent(scrollY, "change", measure)
  useEffect(() => {
    if (mode !== "scrub") return
    queueMicrotask(measure)
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [mode, measure])

  // inView: al entrar la lámina en pantalla, secuencia temporizada que termina en N
  const laminaInView = useInView(laminaRef, { amount: 0.4 })
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const sequenceRef = useRef(-1)
  useEffect(() => {
    if (mode !== "inView" || !laminaInView || sequenceRef.current >= NODE_COUNT) return
    const timer = window.setInterval(() => {
      sequenceRef.current = Math.min(sequenceRef.current + 1, NODE_COUNT)
      setSequenceIndex(sequenceRef.current)
      if (sequenceRef.current >= NODE_COUNT) window.clearInterval(timer)
    }, NODE_STEP_MS)
    return () => window.clearInterval(timer)
  }, [mode, laminaInView])

  // -1 = nada encendido · 0…7 = nodo activo (azul) · 8 = red completa en negro
  const activeIndex = mode === "static" ? NODE_COUNT : mode === "inView" ? sequenceIndex : scrubIndex
  const counter = activeIndex >= NODE_COUNT ? NODE_COUNT : activeIndex + 1
  const edgeDuration = mode === "static" ? 0 : 0.45

  return (
    <section
      id={content.sectionId}
      data-header-theme="light"
      data-stage-mode={mode}
      className="relative bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-[#0a0a0a] md:text-6xl">
          {content.title}
        </h2>

        <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-12">
          {/* Primero en el DOM: en celular la lámina va arriba. En md pasa a la derecha. */}
          <div className="md:col-span-5 md:col-start-8 md:row-start-1">
            <figure className="stage:sticky stage:top-24">
              <div
                ref={laminaRef}
                className="relative aspect-[4/5] overflow-hidden rounded-[6px] border border-[#e5e5e5] bg-white md:aspect-[3/4] md:max-h-[calc(100svh-8rem)]"
              >
                <FocalCover>
                  <Image
                    src={lamina}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 960px, 170vw"
                    className="object-cover"
                  />
                  <svg
                    viewBox={VIEWBOX}
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full"
                  >
                    {CAPABILITY_NODES.slice(1).map((node, k) => {
                      const from = CAPABILITY_NODES[k]
                      return (
                        <m.line
                          key={`edge-${k + 1}`}
                          x1={from.x}
                          y1={from.y}
                          x2={node.x}
                          y2={node.y}
                          stroke={INK}
                          strokeWidth={EDGE_WIDTH}
                          strokeLinecap="butt"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: k + 1 <= activeIndex ? 1 : 0 }}
                          transition={{ duration: edgeDuration, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )
                    })}
                    {CAPABILITY_NODES.map((node, i) => {
                      const lit = i <= activeIndex
                      const active = i === activeIndex
                      return (
                        <g key={`node-${i}`} data-node="" data-lit={String(lit)} data-active={String(active)}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={NODE_RADIUS}
                            fill={active ? BLUE : lit ? INK : "#ffffff"}
                            stroke={lit ? "none" : INK}
                            strokeWidth={1.5}
                            vectorEffect="non-scaling-stroke"
                          />
                          {active ? (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={RING_RADIUS}
                              fill="none"
                              stroke={INK}
                              strokeWidth={1}
                              vectorEffect="non-scaling-stroke"
                            />
                          ) : null}
                        </g>
                      )
                    })}
                  </svg>
                </FocalCover>
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-4">
                <InstrumentLabel tone="light">{content.imageLabel}</InstrumentLabel>
                <InstrumentLabel tone="light">
                  <span data-capabilities-counter="">{`${pad(counter)} / ${pad(NODE_COUNT)}`}</span>
                </InstrumentLabel>
              </figcaption>
            </figure>
          </div>

          <ol ref={listRef} className="md:col-span-7 md:col-start-1 md:row-start-1">
            {content.items.map((item, i) => {
              const lit = i <= activeIndex
              return (
                <li key={item.href} data-capability-row="" className="border-t border-[#e5e5e5] last:border-b">
                  <Link
                    href={buildLocalePath(locale, item.href)}
                    className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-8 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:py-10"
                  >
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.3em] md:text-[11px] ${lit ? "text-[#0a0a0a]" : "text-[#707070]"}`}
                    >
                      /{pad(i + 1)}
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold tracking-tight text-[#0a0a0a] md:text-3xl lg:text-4xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#525252]">{item.benefit}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-lg text-[#0a0a0a] transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
```

#### 2.4 `src/app/[locale]/page.tsx`

Tres reemplazos exactos. No toques el JSON-LD `FAQPage` ni `generateMetadata`.

Antes (`src/app/[locale]/page.tsx`):
```tsx
import { getDictionary } from "@/content/dictionaries"
```
Después:
```tsx
import { Thesis } from "@/components/sections/home/Thesis"
import { CapabilitiesIndex } from "@/components/sections/home/CapabilitiesIndex"
import { getDictionary } from "@/content/dictionaries"
```

Antes (`src/app/[locale]/page.tsx`):
```tsx
const Services = dynamic(() => import("@/components/sections/Services").then(m => ({ default: m.Services })))
const FlagshipAI = dynamic(() => import("@/components/sections/FlagshipAI").then(m => ({ default: m.FlagshipAI })))
```
Después: *(nada; las dos líneas desaparecen. `dynamic` sigue importado porque lo usan las secciones que quedan.)*

Antes (`src/app/[locale]/page.tsx`):
```tsx
      <Services content={dict.services} locale={locale} />
      <FlagshipAI content={dict.flagshipAI} />
```
Después:
```tsx
      <Thesis text={dict.thesis.text} />
      <CapabilitiesIndex content={dict.services} locale={locale} />
```
`locale` ya está estrechado a `Locale` por `if (!isValidLocale(locale)) notFound()` (el archivo ya se lo pasa así a `buildLocalePath`).

#### 2.5 Borrar los componentes que salen de la home
```bash
git rm src/components/sections/Services.tsx src/components/sections/FlagshipAI.tsx
```

#### 2.6 `e2e/smoke.spec.ts`
Sin cambios: no referencia `flagshipAI` ni `Services`, y su `#${es.services.sectionId}` (`#capacidades`) sigue existiendo (ahora en `CapabilitiesIndex`). Compruébalo:
```bash
grep -n "flagshipAI\|FlagshipAI\|services" e2e/smoke.spec.ts   # solo la línea de es.services.sectionId
```

### Paso 3 — Verificación
```bash
cd /home/user/wt/task7
npm run lint                     # 0 errores
npx tsc --noEmit                 # 0 errores
grep -rn "flagshipAI\|FlagshipAI\|sections/Services\|sistemas-ia" src e2e   # sin salida
PORT=3070 npx playwright test e2e/home.spec.ts --reporter=line               # T6 + T7 en verde
PORT=3070 npx playwright test e2e/smoke.spec.ts e2e/a11y.spec.ts --reporter=line
PORT=3070 npx playwright test --reporter=line                                # suite completa en verde
git status --short               # solo los archivos de "Archivos"; si aparece AGENTS.md: git checkout AGENTS.md
```
Resultado esperado: las 6 pruebas nuevas en verde; `a11y` sin violaciones `serious`/`critical` en `/es` (palabras de la tesis `#737373` sobre blanco = 4,7:1; índices `/0N` y leyendas `#707070` = 4,9:1; beneficios `#525252`).

### Paso 4 — Commit
```
feat(home): tesis palabra a palabra e índice de capacidades con lámina

La tesis pasa a ser una frase propia (thesis.text) que se enciende palabra a
palabra de #737373 a #0a0a0a con el scroll. Capacidades se vuelve una
lista-índice de los 8 servicios, con enlace a cada página, junto a la lámina
fija y una red de 8 nodos que se enciende según la fila que cruza el centro;
el nodo activo es el único azul. Salen Services, FlagshipAI y la clave
flagshipAI.

Decisiones:
- Aristas con pathLength sin vector-effect: con non-scaling-stroke Chromium
  normaliza mal pathLength (verificado); el grosor va en unidades del viewBox.
- La lámina se fija con stage:sticky: con reducir movimiento no hay sticky.
- "La última fila pasó el centro" = su borde inferior quedó sobre el centro.
- Tesis y Capacidades se importan de forma estática: en Next 16 next/dynamic
  desde un Server Component no divide el código del cliente.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
```

### Decisiones
1. **`pathLength` y `vector-effect="non-scaling-stroke"` no se combinan.** Comprobado en el Chromium de Playwright: con `non-scaling-stroke`, `pathLength="1"` normaliza el guion en unidades del usuario pero lo pinta en píxeles de pantalla. Con la imagen a escala 0,5, un trazo al 50 % sale completo; a escala 2, un trazo al 100 % sale al 50 % y se repite. Por eso las aristas (`m.line`) van **sin** `vectorEffect`, con `strokeWidth` 2,5 en unidades del viewBox (≈1,6 px en escritorio, ≈1,1 px en celular). Los círculos, que no usan `pathLength`, sí conservan `non-scaling-stroke`. Contradice la regla general de §3.6 solo para trazos con `pathLength`. **Afecta también a T6:** si `HeroRoute` combina los dos, la ruta completa se queda al ~80 % a 1920×1080 (escala 1,25) y al ~60 % a 2560×1440 (escala 1,67).
2. **Sticky de la lámina con `stage:sticky stage:top-24`**, no con el `md:sticky md:top-24` literal del traspaso. Así se cumple "reducir movimiento: sin sticky" (§5 del diseño, §3.6). La prueba de reducir movimiento lo verifica (`position: static`). Las medidas del marco son las del traspaso: `aspect-[4/5] md:aspect-[3/4] md:max-h-[calc(100svh-8rem)]`.
3. **"Si la última fila pasó el centro"** se interpreta como *su borde inferior quedó por encima del centro*. Si fuera "su borde superior", el nodo 8 nunca se vería activo.
4. **El contador `0N / 08`** muestra `activeIndex + 1`: `00` antes de empezar, `08` con la red completa. Va en el `figcaption`, sobre blanco liso, junto a la etiqueta "Imagen ilustrativa". Así el contraste lo mide axe y no depende de la imagen.
5. **Nodo activo:** un solo elemento azul (el círculo relleno, `stroke="none"`). El anillo de enfoque que lo rodea es `#0a0a0a`, para que `countVisibleBlue` cuente 1 aunque cuente por propiedad. La lámina es decorativa (`alt=""`): `services` no tiene `imageAlt` y el contrato no lo pide.
6. **Tesis sin sticky.** El `offset` `["start 0.85", "end 0.5"]` sobre el propio `<p>` da unos 850 px de recorrido a 1440×900. En celular (`inView`) se revela una vez, a 60 ms por palabra (el stagger por palabra del design system). Sin JavaScript todas las palabras quedan en `#737373`, que es legible.
7. **Claves que quedan sin uso:** `services.description` (idéntica a `thesis.text`, no se repite en Capacidades), `services.exploreLabel`, `items[].bullets` e `items[].icon`. §3.2 dice "services sin cambios", así que se quedan y las limpia T11 con su `grep`.
8. **Importación estática** de `Thesis` y `CapabilitiesIndex` en `page.tsx`. `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` dice que `next/dynamic` desde un Server Component no divide el código del cliente; las islas cliente ya se separan por sí solas.
9. **Hueco de contrato (§3.3/§3.7): `countVisibleBlue`.** El contrato no fija su firma. Estas pruebas lo llaman como `countVisibleBlue(page): Promise<number>` y dependen de que cuente solo los elementos azules visibles **dentro del viewport**. En modo `static`, la cumbre azul de la portada existe, pero queda fuera de pantalla cuando se mide Capacidades o el expediente.
10. **Validación del borrador:** los cuatro archivos nuevos, los bloques de prueba y el helper compilan con `tsc` y pasan el ESLint del repo (`react-hooks` v7 incluido). Se probaron contra stubs de las primitivas de T6 con las firmas de §3.3. Además, los 11 reemplazos "Antes/Después" de las dos tareas se aplicaron sobre una copia del repo, cada uno una sola vez.

---

## Tarea 8 — Del papel al dato

**Depende de:** T7 integrada (`page.tsx` ya renderiza `CapabilitiesIndex`; `e2e/home.spec.ts` ya importa `buildLocalePath`, `countVisibleBlue`, `effectiveOpacity` y `scrollToY`). También necesita que T6 haya puesto `hero.nurtureCta.href = "#gobierno"` / `"#government"` (§3.2 T6) y que `HomeHero` pinte ese enlace sin `buildLocalePath`.

**Archivos compartidos:** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts`, `src/app/[locale]/page.tsx`, `e2e/home.spec.ts` (se añaden bloques al final), `e2e/helpers.ts` (se amplía).

**Worktree y puerto:** `/home/user/wt/task8`, rama `wt/task8`, **`PORT=3080`**.
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task8 -b wt/task8 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task8/node_modules
cd /home/user/wt/task8
```

### Archivos
- **Crear:** `src/components/sections/home/dossier-progress.ts` (módulo puro), `src/components/sections/home/Dossier.tsx`.
- **Modificar:** `src/content/dictionaries/es.ts`, `src/content/dictionaries/en.ts` (clave `dossier`), `src/app/[locale]/page.tsx`, `e2e/helpers.ts` (`settledTopOffset`), `e2e/home.spec.ts`.
- **Borrar:** nada.

### Paso 1 — Prueba primero

**1.1 Helper nuevo.** Añade al final de `e2e/helpers.ts`. Si el archivo no importa ya el tipo `Locator`, amplía su `import type { … } from '@playwright/test'`.
```ts
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
```

**1.2 Importaciones.** Amplía la cabecera de `e2e/home.spec.ts` (sin duplicar):
```ts
import { extractionAt, fieldState } from '../src/components/sections/home/dossier-progress'
import { countVisibleBlue, effectiveOpacity, scrollToY, settledTopOffset } from './helpers'
```

**1.3 Pega al final de `e2e/home.spec.ts`:**
```ts
// ── Tarea 8 — Del papel al dato ────────────────────────────────────────────

test.describe('Del papel al dato · extractionAt (módulo puro)', () => {
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
})

test.describe('Del papel al dato · sin JavaScript', () => {
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
    await expect(section.locator('[data-dossier-counter]')).toHaveText('00 / 06')
    await expect(section).toContainText(es.dossier.imageLabel)
    for (const link of es.dossier.links) {
      await expect(section.getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        buildLocalePath('es', link.href)
      )
    }
  })
})

test.describe('Del papel al dato · reducir movimiento', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1440, height: 900 } })

  test('los 6 campos quedan extraídos, sin azul y sin sticky', async ({ page }) => {
    await page.goto('/es')
    const section = page.locator(`#${es.dossier.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'static')
    await expect(section.locator('[data-dossier-row][data-state="done"]')).toHaveCount(es.dossier.fields.length)
    await expect(section.locator('[data-dossier-field][data-state="done"]')).toHaveCount(es.dossier.fields.length)
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06')
    await expect(section.locator('[data-stage-frame]')).not.toHaveCSS('position', 'sticky')

    const y = await section.evaluate((el) => window.scrollY + el.getBoundingClientRect().top)
    await scrollToY(page, y)
    await expect.poll(() => countVisibleBlue(page)).toBe(0)
  })
})

test.describe('Del papel al dato · enlace de la portada (revisión 2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('el enlace de sector público deja #gobierno arriba del viewport', async ({ page }) => {
    expect(es.hero.nurtureCta.href).toBe(`#${es.dossier.sectionId}`)
    await page.goto('/es')
    await page.getByRole('link', { name: es.hero.nurtureCta.label }).click()
    const section = page.locator(`#${es.dossier.sectionId}`)
    // El scroll al ancla es suave: se mide solo cuando lleva dos frames quieto
    await expect.poll(() => settledTopOffset(section), { timeout: 10_000 }).toBeLessThanOrEqual(2)
    await expect(page).toHaveURL(new RegExp(`#${es.dossier.sectionId}$`))
  })
})

test.describe('Del papel al dato · scrub (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('con 2 campos extraídos y 1 en proceso, el único azul es el recuadro activo', async ({ page }) => {
    await page.goto('/es')
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
    // Un solo azul visible, y es el recuadro activo (que sí es azul): el panel no tiene azul
    await expect.poll(() => countVisibleBlue(page)).toBe(1)
  })
})

test.describe('Del papel al dato · celular', () => {
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
    // 7 pasos de 700 ms tras entrar en pantalla
    await expect(section.locator('[data-dossier-row][data-state="done"]')).toHaveCount(es.dossier.fields.length, {
      timeout: 10_000,
    })
    await expect(section.locator('[data-dossier-counter]')).toHaveText('06 / 06')
  })
})

test.describe('Del papel al dato · inglés (revisión 5)', () => {
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
```

**1.4 Ejecuta y comprueba el rojo:**
```bash
PORT=3080 npx playwright test e2e/home.spec.ts --reporter=line
```
**Fallo esperado:** el archivo no carga: `Error: Cannot find module '../src/components/sections/home/dossier-progress'`. Es el rojo correcto: el módulo puro aún no existe. Crea `dossier-progress.ts` (2.2) y repite:
```bash
PORT=3080 npx playwright test e2e/home.spec.ts --reporter=line -g "Del papel al dato"
```
Ahora pasa `extractionAt (módulo puro)` y fallan las otras 6: `TypeError: Cannot read properties of undefined (reading 'sectionId')` porque `es.dossier` / `en.dossier` no existen, o *timeout* porque `#gobierno` no existe. T6 y T7 siguen en verde.

### Paso 2 — Implementación

#### 2.1 Diccionarios (antes del `caseStudy` que T9 ampliará)

Antes (`src/content/dictionaries/es.ts`):
```ts
  caseStudy: {
    sectionId: "casos",
```
Después:
```ts
  dossier: {
    sectionId: "gobierno",
    eyebrow: "GOBIERNO Y DATOS",
    title: "Del expediente al dato estructurado.",
    description:
      "Automatizamos trámites y registros: los documentos entran, cada campo se identifica y se valida, y cada dato queda con su trazabilidad.",
    fields: [
      "Nombre",
      "Fecha de nacimiento",
      "Domicilio",
      "Correo electrónico",
      "Tipo de trámite",
      "Fecha de solicitud",
    ],
    status: { idle: "En espera", active: "Procesando", done: "Extraído" },
    counterLabel: "Campos extraídos",
    imageAlt: "Expediente de solicitud abierto sobre un escritorio, con formularios mecanografiados",
    imageLabel: "Ilustración · datos ficticios",
    links: [
      { label: "Automatización de gobierno", href: "/automatizacion-gobierno" },
      { label: "Extracción de datos", href: "/extraccion-datos" },
    ],
  },
  caseStudy: {
    sectionId: "casos",
```

Antes (`src/content/dictionaries/en.ts`):
```ts
  caseStudy: {
    sectionId: "casos",
```
Después:
```ts
  dossier: {
    sectionId: "government",
    eyebrow: "GOVERNMENT & DATA",
    title: "From case file to structured data.",
    description:
      "We automate procedures and records: documents come in, every field is identified and validated, and every data point keeps its audit trail.",
    fields: ["Name", "Date of birth", "Address", "Email", "Procedure type", "Application date"],
    status: { idle: "Waiting", active: "Processing", done: "Extracted" },
    counterLabel: "Fields extracted",
    imageAlt: "Open application case file on a desk, with typed forms",
    imageLabel: "Illustration · fictitious data",
    links: [
      { label: "Government automation", href: "/automatizacion-gobierno" },
      { label: "Data extraction", href: "/extraccion-datos" },
    ],
  },
  caseStudy: {
    sectionId: "casos",
```
(Los `href` de `links` son rutas internas; `buildLocalePath` las traduce a `/en/government-automation` y `/en/data-extraction`.)

#### 2.2 `src/components/sections/home/dossier-progress.ts` (nuevo, puro)

Sin React ni DOM, para que las pruebas lo importen y para poder razonar sobre él de forma aislada.

Archivo completo: `src/components/sections/home/dossier-progress.ts`
```ts
// Estado de extracción del expediente ("Del papel al dato", §5.4 del diseño).
// Módulo puro, sin React ni DOM: lo usan Dossier.tsx y e2e/home.spec.ts.

export const DOSSIER_FIELD_COUNT = 6
// Modo inView (celular): un campo cada 700 ms tras entrar en pantalla.
export const DOSSIER_STEP_MS = 700

export type FieldState = "idle" | "active" | "done"

export interface Extraction {
  /** Campos terminados, 0…count. Los índices < done están "done". */
  done: number
  /** Índice del campo que se está extrayendo (el único azul), o null. */
  active: number | null
}

export const EXTRACTION_IDLE: Extraction = { done: 0, active: null }

/**
 * Modo scrub. `progress` es el avance 0→1 del contenedor fijo.
 * s = min(1, p·1,1)·count; done = floor(s);
 * active = done < count && s − done > 0,15 ? done : null.
 * El factor 1,1 deja el último ~9 % del recorrido con todos los campos terminados;
 * el umbral 0,15 deja un respiro sin azul entre un campo y el siguiente.
 */
export function extractionAt(progress: number, count: number = DOSSIER_FIELD_COUNT): Extraction {
  const s = Math.min(1, Math.max(0, progress) * 1.1) * count
  const done = Math.floor(s)
  const active = done < count && s - done > 0.15 ? done : null
  return { done, active }
}

/**
 * Modo inView. `step` = pasos de 700 ms desde que el marco entró en pantalla
 * (-1 = todavía no). En el paso k el campo k está activo y los anteriores
 * terminados; en el paso count, todos terminados y ninguno activo.
 */
export function extractionAtStep(step: number, count: number = DOSSIER_FIELD_COUNT): Extraction {
  if (step < 0) return EXTRACTION_IDLE
  const done = Math.min(step, count)
  return { done, active: done < count ? done : null }
}

/** Modo static (reducir movimiento): todos los campos terminados, ninguno activo. */
export function extractionComplete(count: number = DOSSIER_FIELD_COUNT): Extraction {
  return { done: count, active: null }
}

export function fieldState(index: number, extraction: Extraction): FieldState {
  if (index < extraction.done) return "done"
  if (index === extraction.active) return "active"
  return "idle"
}
```
Tabla de referencia (`count = 6`), cubierta por la prueba `extractionAt (módulo puro)`:

| `p` | `s` | `done` | `active` |
|---|---|---|---|
| 0 | 0 | 0 | `null` |
| 0,02 | 0,132 | 0 | `null` (umbral 0,15) |
| 0,03 | 0,198 | 0 | 0 |
| 1,1 / 6,6 | 1,1 | 1 | `null` (respiro sin azul) |
| 2,5 / 6,6 | 2,5 | 2 | 2 |
| ≥ 1 / 1,1 | 6 | 6 | `null` |

#### 2.3 `src/components/sections/home/Dossier.tsx` (nuevo)

`ScrollStage` con `track="long"` (250 svh), oscuro, `id = dossier.sectionId`. Rejilla en escritorio: texto arriba a la izquierda, panel debajo y expediente a la derecha, a toda la altura. En celular: texto, imagen y panel, en ese orden. El expediente va en `FocalCover` con `[--fx:10%]` para centrar la página izquierda, con el marco del traspaso `aspect-[4/5] md:aspect-auto md:h-[min(78svh,48rem)]`. Hay 6 recuadros de `DOSSIER_FIELDS`: el activo es azul con trazo 3 y el terminado `#0a0a0a` con trazo 1. En el panel no hay nada azul.

Archivo completo: `src/components/sections/home/Dossier.tsx`
```tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { m, useInView, useMotionValueEvent } from "motion/react"
import expediente from "@/assets/images/expediente.jpg"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { ScrollStage } from "@/components/ui/ScrollStage"
import { useStageProgress } from "@/hooks/useStageProgress"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import {
  DOSSIER_STEP_MS,
  EXTRACTION_IDLE,
  extractionAt,
  extractionAtStep,
  extractionComplete,
  fieldState,
} from "./dossier-progress"
import type { Extraction } from "./dossier-progress"
import { DOSSIER_FIELDS, VIEWBOX } from "./geometry"

const INK = "#0a0a0a"
const BLUE = "#2563eb"
const FIELD_COUNT = DOSSIER_FIELDS.length

interface DossierContent {
  sectionId: string
  eyebrow: string
  title: string
  description: string
  fields: readonly string[]
  status: { idle: string; active: string; done: string }
  counterLabel: string
  imageAlt: string
  imageLabel: string
  links: readonly { label: string; href: string }[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function Dossier({ content, locale }: { content: DossierContent; locale: Locale }) {
  const stageRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(stageRef)

  // scrub: el avance del contenedor de 250 svh decide campos terminados y activo
  const [scrub, setScrub] = useState<Extraction>(EXTRACTION_IDLE)
  const onProgress = useCallback((latest: number) => {
    const next = extractionAt(latest, FIELD_COUNT)
    setScrub((prev) => (prev.done === next.done && prev.active === next.active ? prev : next))
  }, [])
  useMotionValueEvent(progress, "change", onProgress)

  // inView: al entrar el marco en pantalla, un campo cada 700 ms
  const frameInView = useInView(frameRef, { amount: 0.5 })
  const [step, setStep] = useState(-1)
  const stepRef = useRef(-1)
  useEffect(() => {
    if (mode !== "inView" || !frameInView || stepRef.current >= FIELD_COUNT) return
    const timer = window.setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 1, FIELD_COUNT)
      setStep(stepRef.current)
      if (stepRef.current >= FIELD_COUNT) window.clearInterval(timer)
    }, DOSSIER_STEP_MS)
    return () => window.clearInterval(timer)
  }, [mode, frameInView])

  const extraction =
    mode === "static"
      ? extractionComplete(FIELD_COUNT)
      : mode === "inView"
        ? extractionAtStep(step, FIELD_COUNT)
        : scrub
  const fadeDuration = mode === "static" ? 0 : 0.2

  return (
    <ScrollStage
      ref={stageRef}
      id={content.sectionId}
      track="long"
      mode={mode}
      theme="dark"
      className="bg-[#0a0a0a] text-white"
      frameClassName="stage:flex stage:items-center"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32 stage:pb-10 stage:pt-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-12 md:gap-y-8">
          <div className="md:col-span-5 md:col-start-1 md:row-start-1 md:self-end">
            <InstrumentLabel as="p">{content.eyebrow}</InstrumentLabel>
            <h2 className="mt-5 text-balance font-heading text-4xl font-bold tracking-tight text-white lg:text-5xl">
              {content.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#a3a3a3]">{content.description}</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {content.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={buildLocalePath(locale, link.href)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 hover:text-[#a3a3a3]"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* En celular: texto, imagen y panel, en ese orden. En md la imagen ocupa la derecha. */}
          <div
            ref={frameRef}
            className="relative aspect-[4/5] overflow-hidden rounded-[6px] md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:aspect-auto md:h-[min(78svh,48rem)] md:self-center"
          >
            <FocalCover className="[--fx:10%]">
              <Image
                src={expediente}
                alt={content.imageAlt}
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 1152px, 170vw"
                className="object-cover"
              />
              <svg
                viewBox={VIEWBOX}
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
              >
                {DOSSIER_FIELDS.map((field, i) => {
                  const state = fieldState(i, extraction)
                  return (
                    <m.rect
                      key={`field-${i}`}
                      data-dossier-field=""
                      data-state={state}
                      x={field.x}
                      y={field.y}
                      width={field.width}
                      height={field.height}
                      fill="none"
                      stroke={state === "active" ? BLUE : INK}
                      strokeWidth={state === "active" ? 3 : 1}
                      vectorEffect="non-scaling-stroke"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: state === "idle" ? 0 : 1 }}
                      transition={{ duration: fadeDuration }}
                    />
                  )
                })}
              </svg>
            </FocalCover>
            {/* Funde la mesa con #0a0a0a en los bordes, sin cortes visibles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#0a0a0a_0%,transparent_12%,transparent_88%,#0a0a0a_100%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_0%,transparent_8%,transparent_92%,#0a0a0a_100%)]"
            />
            <InstrumentLabel className="absolute bottom-3 left-3 bg-[#0a0a0a] px-2 py-1">
              {content.imageLabel}
            </InstrumentLabel>
          </div>

          <div className="rounded-[6px] border border-[#1a1a1a] bg-[#141414] p-5 md:col-span-5 md:col-start-1 md:row-start-2 md:self-start md:p-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-[#1a1a1a] pb-3">
              <InstrumentLabel>{content.counterLabel}</InstrumentLabel>
              <span
                data-dossier-counter=""
                className="font-mono text-[10px] tracking-[0.3em] text-white md:text-[11px]"
              >
                {`${pad(extraction.done)} / ${pad(FIELD_COUNT)}`}
              </span>
            </div>
            <ol className="mt-1">
              {content.fields.map((name, i) => {
                const state = fieldState(i, extraction)
                const tone = state === "idle" ? "text-[#a3a3a3]" : "text-white"
                return (
                  <li
                    key={name}
                    data-dossier-row=""
                    data-state={state}
                    className={`-mx-2 flex items-center justify-between gap-4 border-b border-[#1a1a1a] px-2 py-2 font-mono text-[11px] uppercase tracking-[0.15em] last:border-b-0 ${state === "active" ? "bg-[#1a1a1a]" : ""}`}
                  >
                    <span className={tone}>{name}</span>
                    <span className={tone}>{content.status[state]}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </ScrollStage>
  )
}
```

Presupuesto de altura del marco fijo (con `overflow-hidden`), medido con las clases de arriba:
- **1440×900:** la imagen mide 702 px; texto + panel ≈ 580 px; hay 764 px útiles (900 − `pt-24` − `pb-10`). Cabe.
- **1280×720** (viewport por defecto de Playwright y de axe): la imagen mide 562 px; texto + panel ≈ 583 px; hay 584 px útiles. Cabe justo. El `pt-24` deja libre la cabecera fija de 64 px cuando `#gobierno` queda en `top = 0`.

#### 2.4 `src/app/[locale]/page.tsx`

Antes (`src/app/[locale]/page.tsx`):
```tsx
import { CapabilitiesIndex } from "@/components/sections/home/CapabilitiesIndex"
```
Después:
```tsx
import { CapabilitiesIndex } from "@/components/sections/home/CapabilitiesIndex"
import { Dossier } from "@/components/sections/home/Dossier"
```

Antes (`src/app/[locale]/page.tsx`):
```tsx
      <CapabilitiesIndex content={dict.services} locale={locale} />
```
Después:
```tsx
      <CapabilitiesIndex content={dict.services} locale={locale} />
      <Dossier content={dict.dossier} locale={locale} />
```

### Paso 3 — Verificación
```bash
cd /home/user/wt/task8
npm run lint                     # 0 errores
npx tsc --noEmit                 # 0 errores
PORT=3080 npx playwright test e2e/home.spec.ts --reporter=line -g "Del papel al dato"   # 7 en verde
PORT=3080 npx playwright test e2e/home.spec.ts e2e/smoke.spec.ts e2e/a11y.spec.ts --reporter=line
PORT=3080 npx playwright test --reporter=line                                           # suite completa en verde
grep -rn "2563eb" src/components/sections/home/Dossier.tsx   # una sola línea: la constante BLUE (solo la usa el recuadro)
git status --short               # solo los archivos de "Archivos"; si aparece AGENTS.md: git checkout AGENTS.md
```
Resultado esperado: T6, T7 y T8 en verde. `a11y` sin violaciones bloqueantes en `/es`:
- eyebrow, descripción y filas en espera: `#a3a3a3` sobre `#0a0a0a` o `#141414` (≥ 7,3:1);
- la etiqueta "Ilustración · datos ficticios" lleva fondo `#0a0a0a` propio, así que axe no la mide sobre la imagen.

### Paso 4 — Commit
```
feat(home): del papel al dato, extracción de 6 campos sobre el expediente

Nueva sección #gobierno / #government: el expediente fijo en un contenedor
de 250 svh; al bajar, cada campo se enmarca en azul mientras se procesa y en
#0a0a0a al terminar, y el panel lateral marca la fila como extraída. El
cálculo vive en un módulo puro (dossier-progress.ts) que las pruebas
importan. En celular los campos avanzan cada 700 ms al entrar en pantalla.

Decisiones:
- Los recuadros aparecen con opacity (no pathLength) para conservar trazos
  exactos de 3 px y 1 px con non-scaling-stroke.
- En inView el disparador es el marco de la imagen al 50 % visible; el primer
  campo se activa 700 ms después.
- Helper settledTopOffset en e2e/helpers.ts para medir el ancla tras el
  scroll suave.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
```

### Decisiones
1. **Recuadros con `opacity`, no con `pathLength`.** El traspaso pide trazo 3 (activo) y el diseño 1 px (terminado): son medidas en píxeles de pantalla y exigen `non-scaling-stroke`. Con `non-scaling-stroke`, `pathLength` se dibuja mal en Chromium (Decisión 1 de T7). Por eso el recuadro aparece con `opacity` 0 → 1 en 200 ms y cambia de color de forma discreta.
2. **Contador `Campos extraídos 0N / 06`:** `data-dossier-counter` envuelve solo la cifra (`0N / 06`, §3.4); la etiqueta es un `InstrumentLabel` aparte. N = campos terminados.
3. **Fila activa del panel:** texto blanco sobre `#1a1a1a`, con estado "Procesando". Se distingue sin azul (§3.1: nada azul en el panel). Fila en espera: `#a3a3a3`; terminada: blanco.
4. **`inView`:** se dispara cuando el marco de la imagen está al 50 % en pantalla (en celular la imagen va antes que el panel). El primer campo se activa a los 700 ms y el último termina a los 4,9 s. Si el marco sale de pantalla, la secuencia se pausa y sigue al volver.
5. **Revisión 2 (ancla):** el enlace de la portada hace un scroll suave (`scroll-behavior: smooth`). `settledTopOffset` solo mide cuando `scrollY` lleva dos frames quieto; `expect.poll` exige `|top| ≤ 2`. `#gobierno` no lleva `scroll-margin`: su marco fijo empieza en `top = 0` y el `pt-24` deja libre la cabecera.
6. **Posición de `dossier` en el diccionario:** antes de `caseStudy`, en el mismo orden que la home. El anclaje `  caseStudy: {\n    sectionId: "casos",` es único en ambos diccionarios; T9 añade claves dentro de `caseStudy` y no choca.
7. **Degradados de borde** (`#0a0a0a` → transparente, 12 % vertical y 8 % horizontal) sobre el marco, para fundir la mesa oscura con el fondo sin cortes (§4 del diseño). No tapan ningún campo: los campos están entre el 26 % y el 58 % del alto.
8. **Dependencia de `countVisibleBlue`:** la prueba de scrub afirma que hay un solo azul y que el recuadro activo es azul. Juntas implican que el panel no tiene azul. Esto exige que el helper de T6 cuente solo lo visible dentro del viewport (la cumbre de la portada, azul en modo `static`, está fuera de pantalla en ese momento).

---

## Tarea 9 — Lo que ya construimos

> Diseño §5.5 · traspaso "Contenido" y "Pruebas" · contrato §3.2 (T9), §3.3, §3.4 (`data-built-card`, `data-studio-step`, `data-lit`, `data-stage-mode`), §3.5 (fila 5), §3.6, §3.7.

**Depende de:** T8 integrada en `redesign/home` (y, a través de ella, T4: `e2e/helpers.ts` con `effectiveOpacity` y `scrollToY`; T5: `.site-header[data-tone]` y `data-header-start="dark"` en `realty/Hero.tsx`; T6: `useStageMode`/`useStageProgress`, `InstrumentLabel`, `countVisibleBlue` en `e2e/helpers.ts`; T8: clave `dossier`).

**Archivos compartidos** (en serie con T10): `src/content/dictionaries/es.ts` / `en.ts`, `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`, `e2e/helpers.ts`, `e2e/smoke.spec.ts`, `e2e/realty.spec.ts`, `src/components/sections/realty/Hero.tsx`.

**Worktree y puerto:** `/home/user/wt/task9`, rama `wt/task9`, **`PORT=3090`**.
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task9 -b wt/task9 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task9/node_modules
cd /home/user/wt/task9
```

**APIs de Next usadas:** `next/link` en un Server Component. Consultado `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` y `01-app/02-guides/lazy-loading.md`. Este último dice que `dynamic()` desde un Server Component no divide en trozos (*code splitting*) los Client Components que importa, así que `BuiltProof` (servidor) se importa de forma estática.

### Archivos

| Acción | Ruta |
|---|---|
| Crear | `src/components/sections/home/BuiltProof.tsx`: servidor, la sección completa |
| Crear | `src/components/sections/home/BuiltStage.tsx`: isla, la `<section>` con `data-stage-mode` |
| Crear | `src/components/sections/home/BuiltScaleIn.tsx`: isla, tarjeta de RealTy de 0,92 a 1 |
| Crear | `src/components/sections/home/StudioSequence.tsx`: isla, capacidades 01–06 que se encienden |
| Modificar | `src/components/sections/realty/Hero.tsx`: `export` de `ConsoleFrame` y prop opcional `compact` |
| Modificar | `src/content/dictionaries/es.ts`, `en.ts`: `built`, `caseStudy.ownership`, `caseStudy.summary`; eliminar `liveStudioTeaser` |
| Modificar | `src/app/[locale]/page.tsx`: `BuiltProof` sustituye a `CaseStudy` + `LiveStudioTeaser` |
| Modificar | `e2e/helpers.ts` (se añaden `FORBIDDEN_STEMS`, `FORBIDDEN_WORDS` y `findForbiddenTerms`), `e2e/realty.spec.ts` (los importa), `e2e/smoke.spec.ts`, `e2e/home.spec.ts` |
| Borrar | `src/components/sections/CaseStudy.tsx`, `src/components/sections/LiveStudioTeaser.tsx` |

`src/app/llms.txt/route.ts` **no se toca**: sigue leyendo `caseStudy.title/industry/context/solution/outcome`, que no cambian.

### Paso 1 — Prueba primero

**1.1 `e2e/helpers.ts`: añadir al final del archivo** (la lista negra se mueve tal cual desde `e2e/realty.spec.ts`; `findForbiddenTerms` aplica exactamente sus reglas):

```ts
// ── Lista negra de RealTy (CLAUDE.md, bloque RealTy) ─────────────────────────
// Compartida por e2e/realty.spec.ts (la landing) y e2e/home.spec.ts (la
// tarjeta de RealTy de "Lo que ya construimos"). No aplica al caso de Live
// Studio, que dice "endpoints" legítimamente.

/**
 * Jerga de ingeniería: raíces y fragmentos de identificador. Coinciden como
 * SUBCADENA para atrapar también las variantes ("idempotencia", "mocks",
 * "evaluate_offer"). Ninguna palabra de negocio en ES/EN las contiene.
 */
export const FORBIDDEN_STEMS = [
  'idempot',
  'webhook',
  'gateway',
  'fixture',
  'replay',
  'mock',
  'endpoint',
  'get_lead',
  'evaluate_',
  'Cierre Autónomo',
  '%',
] as const

/**
 * Siglas y nombres propios prohibidos. Coinciden como PALABRA COMPLETA: como
 * subcadena producen falsos positivos reales en el copy legítimo — "sse" vive
 * dentro de "passes" y "dapta" dentro de "Adaptador de prueba", que es una de
 * las etiquetas de estado obligatorias.
 */
export const FORBIDDEN_WORDS = [
  'HMAC',
  'JSON',
  'SSE',
  'LLM',
  'TypeScript',
  'PostgreSQL',
  'Fastify',
  'RSDubai',
  'Redminds',
  '15M',
  'Dapta',
  'Rentmies',
] as const

/**
 * Términos de la lista negra presentes en `text`, con las mismas reglas que
 * e2e/realty.spec.ts: todo en minúsculas (los chips en `uppercase` llegan
 * transformados en `innerText`), raíces como subcadena, palabras con `\b`.
 */
export function findForbiddenTerms(text: string): string[] {
  const lower = text.toLowerCase()
  return [
    ...FORBIDDEN_STEMS.filter((term) => lower.includes(term.toLowerCase())),
    ...FORBIDDEN_WORDS.filter((term) => new RegExp(`\\b${term.toLowerCase()}\\b`).test(lower)),
  ]
}
```

**1.2 `e2e/realty.spec.ts`: importar la lista y borrar las definiciones locales** (el filtro inline de la prueba no cambia, así que el comportamiento es idéntico).

Antes:
```ts
import en from '../src/content/dictionaries/en'
```
Después:
```ts
import en from '../src/content/dictionaries/en'
import { FORBIDDEN_STEMS, FORBIDDEN_WORDS } from './helpers'
```

Antes (bloque completo, entre `type LocaleKey = keyof typeof dictionaries` y `/** Secciones con ancla, …`):
```ts
/**
 * Jerga de ingeniería: raíces y fragmentos de identificador. Coinciden como
 * SUBCADENA para atrapar también las variantes ("idempotencia", "mocks",
 * "evaluate_offer"). Ninguna palabra de negocio en ES/EN las contiene.
 */
const FORBIDDEN_STEMS = [
  'idempot',
  'webhook',
  'gateway',
  'fixture',
  'replay',
  'mock',
  'endpoint',
  'get_lead',
  'evaluate_',
  'Cierre Autónomo',
  '%',
] as const

/**
 * Siglas y nombres propios prohibidos. Coinciden como PALABRA COMPLETA: como
 * subcadena producen falsos positivos reales en el copy legítimo — "sse" vive
 * dentro de "passes" y "dapta" dentro de "Adaptador de prueba", que es una de
 * las etiquetas de estado obligatorias.
 */
const FORBIDDEN_WORDS = [
  'HMAC',
  'JSON',
  'SSE',
  'LLM',
  'TypeScript',
  'PostgreSQL',
  'Fastify',
  'RSDubai',
  'Redminds',
  '15M',
  'Dapta',
  'Rentmies',
] as const

```
Después:
```ts
// FORBIDDEN_STEMS (subcadena) y FORBIDDEN_WORDS (palabra completa) viven en
// e2e/helpers.ts: la tarjeta de RealTy de la home (e2e/home.spec.ts) aplica la
// misma lista negra.

```

**1.3 `e2e/smoke.spec.ts`: dos cambios** (el resto de cada prueba queda como lo dejaron T5–T7).

En `'homepage loads and renders all sections'`. Antes:
```ts
  await expect(page.locator(`#${es.caseStudy.sectionId}`)).toBeAttached()
```
Después:
```ts
  await expect(page.locator(`#${es.built.sectionId}`)).toBeAttached()
```

En `'home page links to the live studio division'`. Antes:
```ts
  await expect(page.getByRole('link', { name: es.liveStudioTeaser.action.label })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
```
Después:
```ts
  await expect(page.getByRole('link', { name: es.built.studioCta.label, exact: true })).toHaveAttribute(
    'href',
    '/es/estudio-tiktok-live'
  )
```

**1.4 `e2e/home.spec.ts`: importaciones y pruebas.** La cabecera debe importar estos nombres. Añade a las líneas existentes los que falten, sin duplicar ningún `import`:
```ts
import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'
import { countVisibleBlue, effectiveOpacity, findForbiddenTerms, scrollToY } from './helpers'
```
(`effectiveOpacity` la usa T10; si al terminar T9 nadie la usa todavía, ESLint da un *warning*, no un error.)

Añade al final del archivo:
```ts
// ── Tarea 9 — Lo que ya construimos ─────────────────────────────────────────
test.describe('T9 · Lo que ya construimos', () => {
  /** `transform` calculado de un elemento sin transformación, o con escala 1. */
  const IDENTITY_TRANSFORM = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/
  /** Raíz de "simulado/simulated" que la consola muestra junto a retenciones y reservas. */
  const SIMULATED_STEM = { es: 'simulad', en: 'simulated' } as const

  for (const locale of ['es', 'en'] as const) {
    const dict = locale === 'es' ? es : en

    test(`/${locale}: la tarjeta de RealTy cumple las reglas de RealTy de CLAUDE.md`, async ({ page }) => {
      await page.goto(`/${locale}`)
      const card = page.locator(`#${dict.built.sectionId} [data-built-card="realty"]`)
      await expect(card).toHaveCount(1)
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(dict.built.realtyName)
      await expect(card).toContainText(dict.realty.hero.title)
      await expect(card).toContainText(dict.realty.statusLine)

      const text = (await card.innerText()).toLowerCase()
      expect(findForbiddenTerms(text), `términos prohibidos en la tarjeta de RealTy (/${locale})`).toEqual([])
      const demoLabel = dict.realty.demoLabel.toLowerCase()
      expect(text.split(demoLabel).length - 1, 'demoLabel una sola vez en el marco').toBe(1)
      expect(text, '"simulado" junto a retenciones y reservas').toContain(SIMULATED_STEM[locale])

      await expect(card.getByRole('link', { name: dict.built.realtyCta })).toHaveAttribute('href', `/${locale}/realty`)
    })
  }

  test('/es: la tarjeta de Live Studio declara la división propia y numera las 6 capacidades', async ({ page }) => {
    await page.goto('/es')
    const card = page.locator(`#${es.built.sectionId} [data-built-card="studio"]`)
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(es.caseStudy.title)
    await expect(card).toContainText(es.caseStudy.ownership)
    await expect(card).toContainText(es.caseStudy.summary.context)
    await expect(card).toContainText(es.caseStudy.summary.solution)
    await expect(card).toContainText(es.caseStudy.summary.outcome)
    await expect(card).toContainText(es.caseStudy.capabilitiesTitle)

    expect(es.caseStudy.capabilities).toHaveLength(6)
    const steps = card.locator('[data-studio-step]')
    await expect(steps).toHaveCount(6)
    expect(await steps.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-studio-step')))).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ])
    for (const [i, capability] of es.caseStudy.capabilities.entries()) {
      await expect(steps.nth(i)).toContainText(String(i + 1).padStart(2, '0'))
      await expect(steps.nth(i)).toContainText(capability)
    }

    await expect(card.getByRole('link', { name: es.caseStudy.cta.label })).toHaveAttribute('href', '/es/fuerza-digital')
    await expect(card.getByRole('link', { name: es.built.studioCta.label })).toHaveAttribute(
      'href',
      '/es/estudio-tiktok-live'
    )
  })

  test('al bajar (1440×900), la secuencia 01–06 se enciende', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark|menu)$/)
    const section = page.locator(`#${es.built.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
    const lit = section.locator('[data-studio-step][data-lit="true"]')
    await expect(lit).toHaveCount(0)

    const listBottom = await section
      .locator('[data-studio-step]')
      .last()
      .evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY)
    await scrollToY(page, listBottom - 900 * 0.4)
    await expect(lit).toHaveCount(6)
  })

  test('con reducir movimiento: las 6 capacidades encendidas y la tarjeta de RealTy a escala 1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/es')
    const section = page.locator(`#${es.built.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'static')
    await expect(section.locator('[data-studio-step][data-lit="true"]')).toHaveCount(6)
    const card = section.locator('[data-built-card="realty"]')
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).toMatch(IDENTITY_TRANSFORM)
  })

  test('sin azul mientras la sección llena la pantalla (1440×900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark|menu)$/)
    const section = page.locator(`#${es.built.sectionId}`)
    const { top, bottom } = await section.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY }
    })
    const last = Math.max(top, bottom - 900)
    for (let y = top; ; y = Math.min(y + 450, last)) {
      await scrollToY(page, y)
      expect(await countVisibleBlue(page), `elementos azules visibles con scrollY=${y}`).toBe(0)
      if (y >= last) break
    }
  })

  test('/en muestra las claves nuevas traducidas', async ({ page }) => {
    await page.goto('/en')
    const section = page.locator(`#${en.built.sectionId}`)
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(en.built.title)
    await expect(section).toContainText(en.built.eyebrow)
    await expect(section.locator('[data-built-card="studio"]')).toContainText(en.caseStudy.ownership)
    await expect(section.getByRole('link', { name: en.built.studioCta.label })).toHaveAttribute(
      'href',
      '/en/tiktok-live-studio'
    )
  })
})
```

**Ejecutar y comprobar el rojo:**
```bash
cd /home/user/wt/task9
npx tsc --noEmit
PORT=3090 npx playwright test e2e/home.spec.ts -g "T9 ·" --reporter=line
PORT=3090 npx playwright test e2e/smoke.spec.ts e2e/realty.spec.ts --reporter=line
```
**Fallo esperado:**
- `tsc`: `TS2339: Property 'built' does not exist…` en `e2e/home.spec.ts` y `e2e/smoke.spec.ts`, y `Property 'ownership'` / `'summary'` en `e2e/home.spec.ts`.
- `home.spec.ts -g "T9 ·"`: **7 failed**, todas con `TypeError: Cannot read properties of undefined (reading 'sectionId')`: `es.built` y `en.built` todavía no existen.
- `smoke.spec.ts`: fallan `homepage loads and renders all sections` y `home page links to the live studio division` por el mismo `TypeError`. **`realty.spec.ts`: 12 passed**: mover la lista no cambia su comportamiento. Si alguna falla, el traslado está mal hecho.

### Paso 2 — Implementación

**2.1 Diccionarios.** En `src/content/dictionaries/es.ts`, el cierre de `caseStudy` (el `label` es único en el archivo).

Antes:
```ts
    cta: {
      label: "Conocer Fuerza Digital",
      href: "/fuerza-digital",
    },
  },
```
Después:
```ts
    cta: {
      label: "Conocer Fuerza Digital",
      href: "/fuerza-digital",
    },
    ownership: "Lo construimos primero para nuestra propia división, Orbexs Live Studio.",
    summary: {
      context:
        "Un estudio que transmite en vivo en TikTok no puede quedarse fuera del aire, y su mesa de ayuda dependía de tener un técnico disponible en el momento exacto del incidente.",
      solution:
        "Un agente de IA opera la mesa de ayuda: diagnostica y remedia incidentes durante la transmisión, y escala a un técnico humano solo cuando la remediación automática no basta.",
      outcome:
        "La infraestructura se mantiene operativa durante las transmisiones y el equipo técnico se dedica a producir en lugar de hacer soporte reactivo.",
    },
  },
  built: {
    sectionId: "construido",
    eyebrow: "PRODUCTOS PROPIOS",
    title: "Productos que ya construimos.",
    realtyName: "RealTy",
    realtyCta: "Conocer RealTy",
    studioCta: { label: "Conocer el estudio", href: "/estudio-tiktok-live" },
  },
```
Y se **elimina** este bloque completo (incluida su línea final `  },`):
```ts
  liveStudioTeaser: {
    eyebrow: "NUEVA DIVISIÓN",
    kicker: "ORBEXS LIVE STUDIO",
    title: "Un estudio de TikTok LIVE operado por una fábrica de software.",
    description:
      "Producimos transmisiones en vivo para creadores de LATAM desde sets propios, con la misma infraestructura, redundancia y automatización que construimos para operaciones críticas.",
    points: [
      "Sets calibrados para producción vertical 9:16",
      "Red redundante con remediación autónoma durante el aire",
      "Formación, parrilla y analítica propia para cada creador",
    ],
    action: { label: "Conocer el estudio", href: "/estudio-tiktok-live" },
  },
```

En `src/content/dictionaries/en.ts`. Antes:
```ts
    cta: {
      label: "Explore Digital Workforce",
      href: "/fuerza-digital",
    },
  },
```
Después:
```ts
    cta: {
      label: "Explore Digital Workforce",
      href: "/fuerza-digital",
    },
    ownership: "We built it first for our own division, Orbexs Live Studio.",
    summary: {
      context:
        "A studio broadcasting live on TikTok cannot go off the air, and its help desk depended on having a technician available at the exact moment of the incident.",
      solution:
        "An AI agent runs the help desk: it diagnoses and remediates incidents during the broadcast, and escalates to a human technician only when automated remediation is not enough.",
      outcome:
        "The infrastructure stays up throughout broadcasts, and the technical team focuses on production instead of reactive support.",
    },
  },
  built: {
    sectionId: "built",
    eyebrow: "OUR OWN PRODUCTS",
    title: "Products we have already built.",
    realtyName: "RealTy",
    realtyCta: "Explore RealTy",
    studioCta: { label: "Explore the studio", href: "/estudio-tiktok-live" },
  },
```
Y se **elimina**:
```ts
  liveStudioTeaser: {
    eyebrow: "NEW DIVISION",
    kicker: "ORBEXS LIVE STUDIO",
    title: "A TikTok LIVE studio operated by a software factory.",
    description:
      "We produce live broadcasts for LATAM creators from our own sets, running on the same infrastructure, redundancy, and automation we build for critical operations.",
    points: [
      "Sets calibrated for 9:16 vertical production",
      "Redundant network with autonomous remediation mid-broadcast",
      "Training, schedule, and in-house analytics for every creator",
    ],
    action: { label: "Explore the studio", href: "/estudio-tiktok-live" },
  },
```
Comprobación: `grep -rn "liveStudioTeaser" src e2e` → sin resultados (el único otro uso era `smoke.spec.ts`, ya cambiado en 1.3). `liveStudio.*` es otra clave y se queda.

**2.2 `src/components/sections/realty/Hero.tsx`: exportar `ConsoleFrame` con vista compacta opcional.** `RealtyHero` no cambia: no pasa `compact` y el valor por defecto es `false`. Son tres bloques.

Antes:
```tsx
/**
 * The console "Overview" screen, rendered as the hero visual: hero figure,
 * a 2×2 grid of stat tiles with sparklines, and the pipeline funnel underneath.
 * Same three-part structure as the product's own overview, in Orbexs ink.
 */
function ConsoleFrame({
  console: overview,
  demoLabel,
  demoSrText,
  drawn,
}: {
  console: RealtyContent["hero"]["console"]
  demoLabel: string
  demoSrText: string
  drawn: boolean
}) {
```
Después:
```tsx
/**
 * The console "Overview" screen, rendered as the hero visual: hero figure,
 * a 2×2 grid of stat tiles with sparklines, and the pipeline funnel underneath.
 * Same three-part structure as the product's own overview, in Orbexs ink.
 *
 * Exported for the home's RealTy card (`home/BuiltProof.tsx`), which renders
 * the `compact` view: hero figure and tiles, no funnel. Both views keep the
 * frame's single demo tag and never paint the accent hue (no `accent` on the
 * tiles, no `accentIndex` on the funnel), so the home section stays blue-free.
 */
export function ConsoleFrame({
  console: overview,
  demoLabel,
  demoSrText,
  drawn,
  compact = false,
}: {
  console: RealtyContent["hero"]["console"]
  demoLabel: string
  demoSrText: string
  drawn: boolean
  /** Hero figure and stat tiles only (the home card). Defaults to the full hero view. */
  compact?: boolean
}) {
```
Antes:
```tsx
        {/* Stat tiles: hairline-separated, two up. */}
        <div className="grid grid-cols-2 border-b border-[#1a1a1a]">
```
Después:
```tsx
        {/* Stat tiles: hairline-separated, two up. The compact view ends here: no bottom rule. */}
        <div className={compact ? "grid grid-cols-2" : "grid grid-cols-2 border-b border-[#1a1a1a]"}>
```
Antes:
```tsx
        {/* Pipeline funnel — the same nine stages the product uses. */}
        <div className="px-5 py-5">
          <Funnel
            stages={overview.funnel.stages}
            label={overview.funnel.label}
            ariaLabel={funnelLabel}
            tone="dark"
            drawn={drawn}
          />
        </div>
```
Después:
```tsx
        {/* Pipeline funnel — the same nine stages the product uses. */}
        {compact ? null : (
          <div className="px-5 py-5">
            <Funnel
              stages={overview.funnel.stages}
              label={overview.funnel.label}
              ariaLabel={funnelLabel}
              tone="dark"
              drawn={drawn}
            />
          </div>
        )}
```
El `data-header-start="dark"` que puso T5 en la `<section>` de `RealtyHero` no se toca.

**2.3 `src/components/sections/home/BuiltStage.tsx`** (nuevo):
```tsx
"use client"
// La <section> de "Lo que ya construimos" como isla mínima. BuiltProof es de
// servidor y no puede leer matchMedia, pero el contrato (§3.4 del plan) pide
// `data-stage-mode` en la sección. Los hijos llegan ya renderizados desde el
// servidor: esta isla solo aporta el atributo.
import { useStageMode } from "@/hooks/useStageProgress"

export function BuiltStage({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: React.ReactNode
}) {
  // "scrub" en el servidor y en el primer render del cliente: la hidratación coincide.
  const mode = useStageMode()

  return (
    <section id={id} data-header-theme="dark" data-stage-mode={mode} className={className}>
      {children}
    </section>
  )
}
```

**2.4 `src/components/sections/home/BuiltScaleIn.tsx`** (nuevo):
```tsx
"use client"
// La tarjeta de RealTy "entra" pasando de escala 0,92 a 1 (§5.5 del diseño).
// Solo se anima `transform` (scale); el contenido llega renderizado desde el
// servidor como `children`.
//
// - scrub (≥ 768 px): la escala sigue al scroll mientras la tarjeta sube hacia
//   el centro de la pantalla.
// - inView (< 768 px): una sola vez al entrar en pantalla.
// - static (reducir movimiento): escala 1, sin animación.
//
// Hidratación: `amount` empieza en 1 para todos (servidor, primer render y sin
// JavaScript la tarjeta se ve a su tamaño final). Solo después de montar, y con
// la tarjeta todavía fuera de pantalla, el efecto la lleva a 0,92.
import { useEffect, useRef } from "react"
import { animate, m, useInView, useMotionValue, useTransform } from "motion/react"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"
import { easing } from "@/lib/motion"

const FROM_SCALE = 0.92
/** 0 cuando el borde superior de la tarjeta asoma por abajo; 1 cuando llega al 45 % del viewport. */
const OFFSET: StageOffset = ["start 0.95", "start 0.45"]

export function BuiltScaleIn({
  card,
  className,
  children,
}: {
  card: "realty" | "studio"
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const { progress, mode } = useStageProgress(ref, OFFSET)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const amount = useMotionValue(1)
  const scale = useTransform(amount, [0, 1], [FROM_SCALE, 1])

  useEffect(() => {
    if (mode === "static") {
      amount.set(1)
      return
    }
    if (mode === "scrub") {
      amount.set(progress.get())
      return progress.on("change", (value) => amount.set(value))
    }
    if (!inView) {
      amount.set(0)
      return
    }
    const controls = animate(amount, 1, { duration: 0.7, ease: easing.entrance })
    return () => controls.stop()
  }, [mode, inView, progress, amount])

  return (
    <m.article ref={ref} data-built-card={card} style={{ scale }} className={className}>
      {children}
    </m.article>
  )
}
```

**2.5 `src/components/sections/home/StudioSequence.tsx`** (nuevo):
```tsx
"use client"
// Las 6 capacidades del agente de Live Studio como secuencia numerada 01–06
// que se enciende al bajar (§5.5 del diseño). Es una lista de capacidades, no
// un registro de eventos: sin horas, sin estados de ejecución, sin "OK".
//
// - scrub (≥ 768 px): el paso N se enciende cuando el avance de la lista pasa
//   por su mitad (N − 0,5) / 6.
// - inView (< 768 px): al entrar la lista en pantalla, un paso cada 220 ms.
// - static (reducir movimiento): las 6 encendidas.
//
// Encender = número y texto de #a3a3a3 a blanco (cambio de estado, AA en ambos)
// y una línea de 1 px que se traza con scaleX. Nada azul.
import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValueEvent } from "motion/react"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"

const STEP_MS = 220
/** 0 cuando la lista asoma al 85 % del viewport; 1 cuando su final sube al 60 %. */
const OFFSET: StageOffset = ["start 0.85", "end 0.6"]

/** Pasos encendidos para un avance p (0→1). */
function litFor(progress: number, total: number) {
  return Math.min(total, Math.max(0, Math.floor(progress * total + 0.5)))
}

export function StudioSequence({
  title,
  items,
  className,
}: {
  title: string
  items: readonly string[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(ref, OFFSET)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const total = items.length
  const [scrubLit, setScrubLit] = useState(0)
  const [timedLit, setTimedLit] = useState(0)

  useMotionValueEvent(progress, "change", (value) => setScrubLit(litFor(value, total)))

  useEffect(() => {
    if (mode !== "inView" || !inView) return
    const tick = window.setInterval(() => setTimedLit((current) => Math.min(total, current + 1)), STEP_MS)
    const stop = window.setTimeout(() => window.clearInterval(tick), STEP_MS * (total + 1))
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(stop)
    }
  }, [mode, inView, total])

  const lit = mode === "static" ? total : mode === "inView" ? timedLit : scrubLit

  return (
    <div ref={ref} className={className}>
      <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a3a3a3] md:text-[11px]">{title}</h4>
      <ol className="mt-6 border-t border-[#1a1a1a]">
        {items.map((item, i) => {
          const on = i < lit
          const num = String(i + 1).padStart(2, "0")
          return (
            <li
              key={item}
              data-studio-step={num}
              data-lit={on ? "true" : "false"}
              className="relative flex items-start gap-5 border-b border-[#1a1a1a] py-4"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 -bottom-px h-px origin-left bg-white transition-transform duration-500 ease-out motion-reduce:transition-none ${
                  on ? "scale-x-100" : "scale-x-0"
                }`}
              />
              <span
                aria-hidden="true"
                className={`pt-[3px] font-mono text-[11px] tabular-nums tracking-[0.2em] transition-colors duration-500 motion-reduce:transition-none ${
                  on ? "text-white" : "text-[#a3a3a3]"
                }`}
              >
                {num}
              </span>
              <span
                className={`text-sm leading-relaxed transition-colors duration-500 motion-reduce:transition-none ${
                  on ? "text-white" : "text-[#a3a3a3]"
                }`}
              >
                {item}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
```

**2.6 `src/components/sections/home/BuiltProof.tsx`** (nuevo, **sin** `"use client"`):
```tsx
// "Lo que ya construimos" (§5.5 del diseño): las dos pruebas de que Orbexs
// construye productos reales. Componente de SERVIDOR: el texto, la consola de
// RealTy y los enlaces salen en el HTML; el movimiento vive en tres islas
// pequeñas (BuiltStage, BuiltScaleIn, StudioSequence).
//
// Reglas que esta sección no puede romper (CLAUDE.md):
// - RealTy: solo el nombre "RealTy"; sin jerga técnica (lista negra compartida en
//   e2e/helpers.ts); una sola etiqueta de datos de demostración por marco (la del
//   ConsoleFrame); "simulado" junto a retenciones y reservas (lo dicen las
//   propias fichas de la consola); sin métricas fuera del marco etiquetado.
// - Live Studio: el caso se construyó para la división propia; las capacidades
//   son una lista numerada, no un registro de eventos reales; sin afirmar
//   afiliación con TikTok.
// - Regla del azul: nada azul en esta sección. ConsoleFrame no recibe acento.
import Link from "next/link"
import { ConsoleFrame } from "@/components/sections/realty/Hero"
import type { RealtyContent } from "@/components/sections/realty/shared"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { BuiltScaleIn } from "./BuiltScaleIn"
import { BuiltStage } from "./BuiltStage"
import { StudioSequence } from "./StudioSequence"

export interface BuiltContent {
  sectionId: string
  eyebrow: string
  title: string
  realtyName: string
  realtyCta: string
  studioCta: { label: string; href: string }
}

/** Lo que la tarjeta de Live Studio lee de `dict.caseStudy`. */
export interface BuiltCaseStudy {
  industry: string
  title: string
  ownership: string
  summary: { context: string; solution: string; outcome: string }
  capabilitiesTitle: string
  capabilities: readonly string[]
  cta: { label: string; href: string }
}

/** Lo que la tarjeta de RealTy lee de `dict.realty` (contrato: RealtyContent). */
export type BuiltRealty = Pick<RealtyContent, "hero" | "statusLine" | "demoLabel" | "demoSrText">

const CARD_CLASS = "flex flex-col rounded-[6px] border border-[#1a1a1a] bg-[#0a0a0a] p-6 sm:p-10"

// El foco global es #0a0a0a (globals.css): sobre fondo oscuro se pinta en blanco.
const LINK_CLASS =
  "inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#a3a3a3] focus-visible:outline-white"

export function BuiltProof({
  built,
  caseStudy,
  realty,
  locale,
}: {
  built: BuiltContent
  caseStudy: BuiltCaseStudy
  realty: BuiltRealty
  locale: string
}) {
  const lang = locale as Locale

  return (
    <BuiltStage id={built.sectionId} className="relative border-t border-[#1a1a1a] bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl md:mb-16">
          <InstrumentLabel as="p">{built.eyebrow}</InstrumentLabel>
          <h2 className="mt-6 text-balance font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {built.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* RealTy: la consola real de /realty en su vista compacta, con su única etiqueta de demostración. */}
          <BuiltScaleIn card="realty" className={`${CARD_CLASS} lg:col-span-7`}>
            <InstrumentLabel as="p">/01</InstrumentLabel>
            <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {built.realtyName}
            </h3>
            <p className="mt-4 max-w-xl text-balance font-heading text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl">
              {realty.hero.title}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#a3a3a3]">{realty.statusLine}</p>
            <div className="mt-10">
              <ConsoleFrame
                console={realty.hero.console}
                demoLabel={realty.demoLabel}
                demoSrText={realty.demoSrText}
                drawn
                compact
              />
            </div>
            <Link href={buildLocalePath(lang, "/realty")} className={`mt-10 self-start ${LINK_CLASS}`}>
              {built.realtyCta} <span aria-hidden="true">&rarr;</span>
            </Link>
          </BuiltScaleIn>

          {/* Live Studio: el caso de la mesa de ayuda, construido para la división propia. */}
          <article data-built-card="studio" className={`${CARD_CLASS} lg:col-span-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <InstrumentLabel as="p">/02</InstrumentLabel>
              <InstrumentLabel as="p">{caseStudy.industry}</InstrumentLabel>
            </div>
            <h3 className="mt-6 text-balance font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {caseStudy.title}
            </h3>
            <p className="mt-4 text-base font-medium leading-relaxed text-white">{caseStudy.ownership}</p>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#a3a3a3]">
              <p>{caseStudy.summary.context}</p>
              <p>{caseStudy.summary.solution}</p>
              <p className="text-white">{caseStudy.summary.outcome}</p>
            </div>
            <StudioSequence title={caseStudy.capabilitiesTitle} items={caseStudy.capabilities} className="mt-10" />
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              <Link href={buildLocalePath(lang, caseStudy.cta.href)} className={LINK_CLASS}>
                {caseStudy.cta.label} <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href={buildLocalePath(lang, built.studioCta.href)} className={LINK_CLASS}>
                {built.studioCta.label} <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </BuiltStage>
  )
}
```

**2.7 `src/app/[locale]/page.tsx`: tres bloques.** El resto del archivo queda como lo dejó T8.

Antes:
```tsx
import { getDictionary } from "@/content/dictionaries"
```
Después:
```tsx
import { getDictionary } from "@/content/dictionaries"
import { BuiltProof } from "@/components/sections/home/BuiltProof"
```
Antes (se eliminan las dos líneas):
```tsx
const CaseStudy = dynamic(() => import("@/components/sections/CaseStudy").then(m => ({ default: m.CaseStudy })))
const LiveStudioTeaser = dynamic(() => import("@/components/sections/LiveStudioTeaser").then(m => ({ default: m.LiveStudioTeaser })))
```
Después: *(nada)*. Si T6–T8 cambiaron la forma de importar estas dos secciones, se eliminan igual, estén como estén escritas.

Antes:
```tsx
      <CaseStudy content={dict.caseStudy} locale={locale} />
      <LiveStudioTeaser content={dict.liveStudioTeaser} locale={locale} />
```
Después:
```tsx
      <BuiltProof built={dict.built} caseStudy={dict.caseStudy} realty={dict.realty} locale={locale} />
```
El orden queda: `HomeHero`, `Thesis`, `CapabilitiesIndex`, `Dossier`, **`BuiltProof`**, `Methodology`, `TechStack`, `FAQ`, `CTA`. El `<script>` del JSON-LD `FAQPage` no cambia.

**2.8 Borrar los componentes sustituidos:**
```bash
git rm src/components/sections/CaseStudy.tsx src/components/sections/LiveStudioTeaser.tsx
```

### Paso 3 — Verificación

```bash
cd /home/user/wt/task9
npm run lint                     # 0 errores (a lo sumo el warning de effectiveOpacity sin usar)
npx tsc --noEmit                 # sin salida
PORT=3090 npx playwright test e2e/home.spec.ts -g "T9 ·" --reporter=line                 # 7 passed
PORT=3090 npx playwright test e2e/smoke.spec.ts e2e/realty.spec.ts --reporter=line        # todo verde (realty: 12 passed)
PORT=3090 npx playwright test --reporter=line                                             # suite completa en verde
grep -rn "liveStudioTeaser\|LiveStudioTeaser\|sections/CaseStudy" src e2e                 # sin resultados
grep -rnE "2563eb|accent" src/components/sections/home/Built*.tsx src/components/sections/home/StudioSequence.tsx   # sin resultados
grep -rnE "RSDubai|Redminds|Cierre Autónomo|Realty\.ia" src/components/sections/home      # sin resultados
git diff --quiet redesign/home -- src/app/llms.txt/route.ts && echo "llms.txt intacto"    # llms.txt intacto
git diff redesign/home -- src/components/sections/realty/Hero.tsx                         # solo los 3 bloques de 2.2
```
Revisión a ojo (el revisor, con `PORT=3090 npm run dev`): `/es#construido` a 1440×900 y 390×844. La tarjeta de RealTy muestra la consola compacta y una sola etiqueta "Datos de demostración". La secuencia 01–06 se enciende al bajar y no parece un registro de eventos. No hay nada azul. `/es/realty` se ve igual que antes, con embudo y el mismo marco.

### Paso 4 — Commit

```bash
cd /home/user/wt/task9
git checkout AGENTS.md 2>/dev/null || true   # por si next dev reescribió su bloque
git add src/components/sections/home/BuiltProof.tsx src/components/sections/home/BuiltStage.tsx \
  src/components/sections/home/BuiltScaleIn.tsx src/components/sections/home/StudioSequence.tsx \
  src/components/sections/realty/Hero.tsx src/content/dictionaries/es.ts src/content/dictionaries/en.ts \
  "src/app/[locale]/page.tsx" e2e/helpers.ts e2e/realty.spec.ts e2e/smoke.spec.ts e2e/home.spec.ts
git commit -F- <<'EOF'
feat(home): une RealTy y Live Studio en «Lo que ya construimos»

BuiltProof (servidor) reemplaza CaseStudy y LiveStudioTeaser con una sección oscura y tres islas:
BuiltStage (data-stage-mode), BuiltScaleIn (la tarjeta de RealTy pasa de escala 0,92 a 1) y
StudioSequence (las 6 capacidades del caso, 01–06, se encienden al bajar). La tarjeta de RealTy
reutiliza ConsoleFrame, exportado de realty/Hero.tsx, con una sola etiqueta de datos de demostración.
Diccionarios: built, caseStudy.ownership y caseStudy.summary; se elimina liveStudioTeaser.
La lista negra de RealTy pasa a e2e/helpers.ts y también se aplica a la tarjeta de la home.

Decisiones:
- BuiltStage es una isla extra: la sección es de servidor y data-stage-mode depende de matchMedia.
- ConsoleFrame gana `compact` (sin embudo, por defecto false): RealtyHero no cambia.
- En la home la consola va con drawn=true: su trazo anima stroke-dashoffset, fuera de transform/opacity/pathLength.
- La escala empieza en 1 (servidor y sin JavaScript) y baja a 0,92 tras montar, con la tarjeta fuera de pantalla.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```
El borrado de 2.8 ya quedó en el índice con `git rm`.

### Decisiones

1. **Una cuarta isla, `BuiltStage`.** El contrato (§3.4) pide `data-stage-mode` en la `<section>`. `BuiltProof` es de servidor y no puede leer `matchMedia`, y `ScrollStage` no sirve porque impone altura de 160/250 svh y `sticky`, que esta sección no lleva. `BuiltStage` solo renderiza la `<section>` con `id`, `data-header-theme="dark"` y el modo, y recibe todo lo demás como `children` ya renderizados en el servidor. `BuiltScaleIn` y `StudioSequence` llaman a `useStageMode` por su cuenta: son tres suscripciones a `matchMedia`, coste despreciable.
2. **"Vista reducida" = `ConsoleFrame compact`.** Muestra la cifra principal y las cuatro fichas, sin embudo, y conserva la etiqueta única del marco. Las fichas ya dicen "Retenciones simuladas" y "Reservas simuladas", así que "simulado" sigue junto a retenciones y reservas. `compact` es opcional y vale `false` por defecto, así que `/realty` no cambia.
3. **`drawn` fijo en `true` en la home.** El trazo de las *sparklines* anima `stroke-dashoffset`, que no está entre las propiedades permitidas (§3.6). En la home la consola sale terminada y el único movimiento de la tarjeta es la escala.
4. **`ConsoleFrame` sigue en `realty/Hero.tsx` (`"use client"`)**, como pide el traspaso. Desde `BuiltProof` es una referencia de cliente: sus props (los datos de la consola) viajan en el RSC y el trozo de `realty/Hero` y `viz` entra en la home (pocos KB gzip). Para la fase 2 queda la opción de moverlo a un módulo sin hooks ni `"use client"`, que lo volvería puramente de servidor.
5. **Escala de la tarjeta.** En `scrub` sigue al scroll (`["start 0.95", "start 0.45"]`) en lugar de dispararse una sola vez, igual que el resto de secciones en `scrub`. En `inView` se anima una vez (0,7 s) y en `static` vale 1. El valor inicial es 1 para todos, así que en el servidor, sin JavaScript y con reducir movimiento la tarjeta nunca queda encogida. El modo `scrub` inicial la lleva a 0,92 solo después de montar.
6. **Secuencia 01–06.** Apagado: `#a3a3a3` sobre `#0a0a0a` (7,9:1). Encendido: blanco más una línea de 1 px con `scaleX`. El número es `aria-hidden` porque el `<ol>` ya da el orden, y `capabilitiesTitle` es un `h4`. No lleva horas, estados ni "OK": no es un registro de eventos. El caso de Live Studio no pasa por la lista negra de RealTy, porque dice "endpoints" legítimamente (traspaso, "Pruebas").
7. **Pruebas.** La tarjeta de RealTy se verifica en **es y en**, con la raíz de "simulado" de cada idioma (`simulad` / `simulated`). Se añade `findForbiddenTerms` a `helpers.ts`. `realty.spec.ts` solo importa las constantes y su filtro inline no cambia. Reducir movimiento se activa con `page.emulateMedia` (§3.7). En las pruebas de `scrub`, `.site-header[data-tone]` (T5) sirve de señal de hidratación, porque `data-stage-mode="scrub"` coincide con el HTML del servidor.
8. **Claves que quedan sin componente.** `caseStudy.sectionId` (`"casos"`) y `caseStudy.eyebrow` ya no las usa ningún componente; `llms.txt` usa `title`, `industry`, `context`, `solution` y `outcome`. Se dejan para que T11 decida. Con `LiveStudioTeaser` desaparece también el evento `live_studio_teaser_click`, y no se añade analítica nueva porque no se pidió.

---

## Tarea 10 — Metodología, cierre y FAQ

> Diseño §5.6–§5.9, §11 · traspaso "Contraste" (fases inactivas `#737373`) y "Contenido" (FAQ `bg-white`) · contrato §3.2 (T10: sin claves nuevas), §3.4 (`data-method-phase`, `data-active`, `data-method-line`), §3.5 (orden final), §3.6, §3.7.

**Depende de:** T9 integrada en `redesign/home`. También T6, por `FocalCover`, `InstrumentLabel`, `useStageProgress`, `src/assets/images/relieve.jpg`, `hero.imageLabel` y `countVisibleBlue`.

**Archivos compartidos:** `src/app/[locale]/page.tsx`, `e2e/home.spec.ts`, `src/components/sections/TechStack.tsx` (solo si hace falta, ver 2.5). `src/app/globals.css` figura en la tabla §2 para T10, pero **esta tarea no lo necesita** y no lo toca.

**Worktree y puerto:** `/home/user/wt/task10`, rama `wt/task10`, **`PORT=3100`**.
```bash
git -C /home/user/Nova-Forge worktree add /home/user/wt/task10 -b wt/task10 redesign/home
cp -al /home/user/Nova-Forge/node_modules /home/user/wt/task10/node_modules
cd /home/user/wt/task10
```

**APIs de Next usadas:** `next/image` con importación estática (`fill`, `sizes`, `placeholder="blur"`, `loading` perezoso por defecto) dentro de `FocalCover`. Consultado `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`: en Next 16 `priority` está obsoleto y aquí no hace falta, porque la imagen está al final de la página.

### Archivos

| Acción | Ruta |
|---|---|
| Crear | `src/components/sections/home/MethodologyLine.tsx`: cliente, sustituye a `Methodology.tsx` |
| Reescribir | `src/components/sections/CTA.tsx`: relieve inferior con paralaje, `h2` real, sin ScrambleText |
| Reescribir | `src/components/sections/FAQ.tsx`: `bg-white`, `h3 > button`, sin animación de altura |
| Modificar | `src/app/[locale]/page.tsx`: `MethodologyLine` y la prop `imageLabel` del cierre |
| Modificar (condicional) | `src/components/sections/TechStack.tsx`: solo los bloques de 2.5 que T6 no haya aplicado |
| Modificar | `e2e/home.spec.ts` |
| Borrar | `src/components/sections/Methodology.tsx` |

### Paso 1 — Prueba primero

`e2e/home.spec.ts` ya importa `countVisibleBlue`, `effectiveOpacity` y `scrollToY` (T9, 1.4). Añade al final del archivo:
```ts
// ── Tarea 10 — Metodología, cierre y FAQ ────────────────────────────────────
test.describe('T10 · Preguntas frecuentes', () => {
  test('cada pregunta es h3 > button[aria-expanded] y el JSON-LD FAQPage las tiene todas', async ({ page }) => {
    await page.goto('/es')
    const faq = page.locator(`#${es.faq.sectionId}`)
    const buttons = faq.locator('h3 > button[aria-expanded]')
    await expect(buttons).toHaveCount(es.faq.items.length)
    await expect(faq.locator('button h3')).toHaveCount(0)
    for (const [i, item] of es.faq.items.entries()) {
      await expect(buttons.nth(i)).toContainText(item.question)
      await expect(buttons.nth(i)).toHaveAttribute('aria-expanded', 'false')
    }

    // El estado viaja en aria-expanded y la respuesta aparece. Se reintenta el
    // clic por si llega antes de hidratar (el HTML del servidor no tiene handler).
    const first = buttons.first()
    await expect(async () => {
      if ((await first.getAttribute('aria-expanded')) !== 'true') await first.click()
      await expect(first).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
    await expect(faq.getByText(es.faq.items[0].answer)).toBeVisible()

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faqPages = blocks
      .flatMap((block) => {
        const parsed = JSON.parse(block)
        return Array.isArray(parsed) ? parsed : [parsed]
      })
      .filter((entry) => entry['@type'] === 'FAQPage')
    expect(faqPages).toHaveLength(1)
    expect(faqPages[0].mainEntity).toHaveLength(es.faq.items.length)
  })
})

test.describe('T10 · Metodología', () => {
  const IDENTITY_TRANSFORM = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/

  test('con reducir movimiento: las 5 fases activas y la línea completa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    const section = page.locator(`#${es.methodology.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'static')
    await expect(section.locator('[data-method-phase]')).toHaveCount(es.methodology.steps.length)
    await expect(section.locator('[data-method-phase][data-active="true"]')).toHaveCount(5)
    const line = section.locator('[data-method-line="horizontal"]')
    await expect.poll(() => line.evaluate((el) => getComputedStyle(el).transform)).toMatch(IDENTITY_TRANSFORM)
  })

  test('al bajar (1440×900), la línea alcanza unas fases y no otras', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/es')
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark|menu)$/)
    const section = page.locator(`#${es.methodology.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'scrub')
    const active = section.locator('[data-method-phase][data-active="true"]')
    await expect(active).toHaveCount(0)

    // La fila de fases al 55 % del viewport → avance 0,5 → la línea a mitad de camino.
    const lineTop = await section
      .locator('[data-method-line="horizontal"]')
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    await scrollToY(page, lineTop - 900 * 0.55)
    await expect.poll(() => active.count()).toBeGreaterThan(0)
    expect(await active.count()).toBeLessThan(5)

    // La fila al 20 % → avance 1 → todas activas.
    await scrollToY(page, lineTop - 900 * 0.2)
    await expect(active).toHaveCount(5)
  })

  test('en móvil (390×844) la línea es vertical y se completa al entrar en pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/es')
    const section = page.locator(`#${es.methodology.sectionId}`)
    await expect(section).toHaveAttribute('data-stage-mode', 'inView')
    await expect(section.locator('[data-method-line="horizontal"]')).toBeHidden()
    const trackTop = await section
      .locator('[data-method-phase]')
      .first()
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    await scrollToY(page, trackTop - 844 * 0.2)
    await expect(section.locator('[data-method-phase][data-active="true"]')).toHaveCount(5)
    const vertical = section.locator('[data-method-line="vertical"]')
    await expect.poll(() => vertical.evaluate((el) => getComputedStyle(el).transform)).toMatch(IDENTITY_TRANSFORM)
  })
})

test.describe('T10 · Cierre sin JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('el título del cierre sale del servidor y se ve', async ({ page }) => {
    await page.goto('/es')
    const heading = page.getByRole('heading', { level: 2, name: es.cta.lead })
    await expect(heading).toHaveCount(1)
    await expect(heading).toContainText(es.cta.lead)
    await expect(heading).toContainText(es.cta.highlight)
    expect(await effectiveOpacity(heading)).toBe(1)

    const closing = page.locator('main section').last()
    await expect(closing).toContainText(es.hero.imageLabel)
    await expect(closing.getByRole('link', { name: es.cta.action.label })).toHaveAttribute('href', '/es/agendar')
  })
})

test.describe('T10 · Orden de la home', () => {
  test('las secciones siguen el orden del contrato (§3.5) y el cierre va al final', async ({ page }) => {
    await page.goto('/es')
    const expected: string[] = [
      es.services.sectionId,
      es.dossier.sectionId,
      es.built.sectionId,
      es.methodology.sectionId,
      es.techStack.sectionId,
      es.faq.sectionId,
    ]
    const ids = await page.locator('main section[id]').evaluateAll((nodes) => nodes.map((node) => node.id))
    expect(ids.filter((id) => expected.includes(id))).toEqual(expected)
    await expect(page.locator('main section').last()).toContainText(es.cta.lead)
    await expect(page.locator(`#${es.faq.sectionId}`)).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(page.locator(`#${es.techStack.sectionId}`)).toHaveCSS('background-color', 'rgb(248, 248, 248)')
  })
})

test.describe('T10 · Regla del azul en toda la home', () => {
  const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ] as const

  for (const viewport of VIEWPORTS) {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      test(`≤ 1 elemento azul visible en cada paso de ½ pantalla (${viewport.width}×${viewport.height}, ${reducedMotion})`, async ({
        page,
      }) => {
        test.setTimeout(120_000)
        const hydrationErrors: string[] = []
        page.on('console', (message) => {
          if (message.type() === 'error' && /hydrat/i.test(message.text())) hydrationErrors.push(message.text())
        })

        await page.setViewportSize(viewport)
        await page.emulateMedia({ reducedMotion })
        await page.goto('/es')
        const expectedMode = reducedMotion === 'reduce' ? 'static' : viewport.width >= 768 ? 'scrub' : 'inView'
        await expect(page.locator('.site-header')).toHaveAttribute('data-tone', /^(light|dark|menu)$/)
        await expect(page.locator(`#${es.methodology.sectionId}`)).toHaveAttribute('data-stage-mode', expectedMode)

        const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
        const step = Math.round(viewport.height / 2)
        const offenders: { y: number; blue: number }[] = []
        for (let y = 0; ; y = Math.min(y + step, max)) {
          await scrollToY(page, y)
          const blue = await countVisibleBlue(page)
          if (blue > 1) offenders.push({ y, blue })
          if (y >= max) break
        }
        expect(offenders, 'posiciones de scroll con más de un elemento azul visible').toEqual([])
        expect(hydrationErrors, 'errores de hidratación en consola').toEqual([])
      })
    }
  }
})
```

**Ejecutar y comprobar el rojo:**
```bash
cd /home/user/wt/task10
npx tsc --noEmit                                                            # sin errores: no hay claves nuevas
PORT=3100 npx playwright test e2e/home.spec.ts -g "T10 ·" --reporter=line
```
**Fallo esperado: 10 failed.**
- `T10 · Preguntas frecuentes`: `expect(buttons).toHaveCount(4)` recibe **0**, porque hoy el marcado es `button > h3`.
- `T10 · Metodología` (3): `toHaveAttribute('data-stage-mode', …)` falla porque la sección antigua no tiene el atributo.
- `T10 · Cierre sin JavaScript`: `toHaveCount(1)` recibe **0**. El título actual es un `<div>` con ScrambleText, no un `h2`.
- `T10 · Orden de la home`: el orden de los `id` ya es correcto tras T9. Falla `toHaveCSS('background-color', 'rgb(255, 255, 255)')` en `#faq`, que hoy es `rgb(248, 248, 248)`.
- `T10 · Regla del azul` (4): falla la espera `#metodologia[data-stage-mode]`, que todavía no existe.

### Paso 2 — Implementación

**2.1 `src/components/sections/home/MethodologyLine.tsx`** (nuevo):
```tsx
"use client"
// Metodología (§5.6 del diseño): una línea de 1 px se traza de izquierda a
// derecha al bajar, y cada fase pasa de gris (#737373, AA sobre blanco) a
// negro cuando la línea la alcanza.
//
// - scrub (≥ 768 px): la línea horizontal (scaleX, origen a la izquierda) sigue
//   al scroll mientras la fila de fases sube del 80 % al 30 % del viewport.
// - inView (< 768 px): la línea es vertical (scaleY, origen arriba) y se traza
//   una sola vez al entrar en pantalla.
// - static (reducir movimiento): línea completa y las 5 fases activas.
//
// Solo se anima `transform`; el color de las fases es un cambio de estado.
// Hidratación: `line` empieza en 0 para todos y el modo empieza en "scrub", así
// que el HTML del servidor y el primer render coinciden (fases inactivas).
import { useEffect, useRef, useState } from "react"
import { animate, m, useInView, useMotionValue, useMotionValueEvent } from "motion/react"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"
import { easing } from "@/lib/motion"

interface MethodologyStep {
  num: string
  title: string
  desc: string
}

interface MethodologyContent {
  sectionId: string
  title: string
  phaseLabel: string
  description: string
  steps: readonly MethodologyStep[]
}

/** 0 cuando la fila de fases asoma al 80 % del viewport; 1 cuando su borde superior llega al 30 %. */
const OFFSET: StageOffset = ["start 0.8", "start 0.3"]
/** Cuánto debe pasar la línea más allá del nodo de una fase para activarla (fracción del trazo). */
const REACH = 0.04
const INVIEW_DURATION = 1.6

/** Fases alcanzadas por una línea trazada hasta `line` (0→1): la fase i está en i / total. */
function phasesReached(line: number, total: number) {
  let count = 0
  for (let i = 0; i < total; i += 1) {
    if (line >= i / total + REACH) count = i + 1
  }
  return count
}

export function MethodologyLine({ content }: { content: MethodologyContent }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(trackRef, OFFSET)
  const inView = useInView(trackRef, { once: true, amount: 0.3 })
  const line = useMotionValue(0)
  const total = content.steps.length
  const [reached, setReached] = useState(0)

  useMotionValueEvent(line, "change", (value) => setReached(phasesReached(value, total)))

  useEffect(() => {
    if (mode === "static") {
      line.set(1)
      return
    }
    if (mode === "scrub") {
      line.set(progress.get())
      return progress.on("change", (value) => line.set(value))
    }
    if (!inView) {
      line.set(0)
      return
    }
    const controls = animate(line, 1, { duration: INVIEW_DURATION, ease: easing.entrance })
    return () => controls.stop()
  }, [mode, inView, progress, line])

  const active = mode === "static" ? total : reached

  return (
    <section
      id={content.sectionId}
      data-header-theme="light"
      data-stage-mode={mode}
      className="relative border-t border-[#e5e5e5] bg-white py-16 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl sm:mb-20">
          <h2 className="mb-8 font-heading text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-5xl md:text-7xl">
            {content.title}
          </h2>
          <p className="text-lg leading-relaxed text-[#525252] md:text-xl">{content.description}</p>
        </div>

        <div ref={trackRef} className="relative">
          {/* Carril fijo: vertical en móvil, horizontal desde md. */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[3px] top-0 w-px bg-[#e5e5e5] md:bottom-auto md:left-0 md:right-0 md:h-px md:w-auto"
          />
          {/* Línea trazada: una por orientación; CSS muestra la que corresponde. */}
          <m.span
            aria-hidden="true"
            data-method-line="horizontal"
            style={{ scaleX: line }}
            className="absolute inset-x-0 top-0 hidden h-px origin-left bg-[#0a0a0a] md:block"
          />
          <m.span
            aria-hidden="true"
            data-method-line="vertical"
            style={{ scaleY: line }}
            className="absolute bottom-0 left-[3px] top-0 w-px origin-top bg-[#0a0a0a] md:hidden"
          />

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-6">
            {content.steps.map((step, i) => {
              const on = i < active
              return (
                <li
                  key={step.num}
                  data-method-phase={step.num}
                  data-active={on ? "true" : "false"}
                  className="relative pl-8 md:pl-0 md:pt-10"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1 h-[7px] w-[7px] rounded-full transition-colors duration-300 motion-reduce:transition-none md:-top-[3px] ${
                      on ? "bg-[#0a0a0a]" : "bg-[#d4d4d4]"
                    }`}
                  />
                  <InstrumentLabel tone="light" as="p" className="mb-3 tabular-nums">
                    {content.phaseLabel} {step.num}
                  </InstrumentLabel>
                  <h3
                    className={`mb-3 text-lg font-semibold tracking-tight transition-colors duration-300 motion-reduce:transition-none ${
                      on ? "text-[#0a0a0a]" : "text-[#737373]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-300 motion-reduce:transition-none ${
                      on ? "text-[#525252]" : "text-[#737373]"
                    }`}
                  >
                    {step.desc}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
```

**2.2 `src/components/sections/CTA.tsx`** (reescrito completo):
```tsx
"use client"
// Cierre (§5.9 del diseño): el relieve en su zona inferior, con desplazamiento
// lento (0,3× el scroll), detrás de "Hablemos de su próximo sistema.".
//
// - El título es un <h2> con el texto real desde el servidor: sin ScrambleText
//   y sin ningún ancestro con opacity 0 (se ve sin JavaScript).
// - Contraste AA: un degradado #0a0a0a (sólido arriba y abajo, 80 % en el
//   centro) cubre la imagen. Peor píxel medido en la zona visible del relieve:
//   200/255 → 0,2 × 200 + 0,8 × 10 ≈ 48 → #a3a3a3 queda en ≈ 5,2:1.
// - Paralaje: solo translateY de la capa de imagen, y solo en modo "scrub".
//   En "inView" (móvil) y "static" (reducir movimiento) la capa no se mueve.
// - Encuadre inferior: la capa sobresale 50 % por arriba y 20 % por abajo de la
//   sección (1,7 × su alto); FocalCover la cubre anclado abajo ([--fy:100%]),
//   así que la ventana de la sección muestra aprox. el 30–90 % inferior de la
//   imagen. El 20 % de abajo es el margen del paralaje (OVERSCAN).
import { useEffect, useRef } from "react"
import Image from "next/image"
import { m, useMotionValue, useTransform } from "motion/react"
import { Button } from "@/components/ui/Button"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"
import { trackEvent } from "@/lib/analytics"
import relieve from "@/assets/images/relieve.jpg"

interface CTAContent {
  lead: string
  highlight: string
  description: string
  action: { label: string; href: string; analyticsEvent: string }
}

/** Paso completo de la sección: 0 = su borde superior toca el inferior del viewport; 1 = su borde inferior sale por arriba. */
const OFFSET: StageOffset = ["start end", "end start"]
/** La imagen se desplaza, respecto de la sección, 0,3 px por cada px de scroll. */
const PARALLAX = 0.3
/** Margen de la capa por debajo de la sección (-bottom-[20%]): tope del desplazamiento en ambos sentidos. */
const OVERSCAN = 0.2

export function CTA({ content, imageLabel }: { content: CTAContent; imageLabel: string }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { progress, mode } = useStageProgress(sectionRef, OFFSET)
  // travel = PARALLAX × (alto del viewport + alto de la sección): el recorrido
  // del scroll entre progress 0 y 1, escalado. limit = OVERSCAN × alto de la
  // sección. Ambos valen 0 fuera de "scrub" y en el servidor, así que y = 0.
  const travel = useMotionValue(0)
  const limit = useMotionValue(0)
  const y = useTransform([progress, travel, limit], ([p, t, l]: number[]) =>
    l === 0 ? 0 : Math.min(l, Math.max(-l, (p - 0.5) * t)),
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section || mode !== "scrub") {
      travel.set(0)
      limit.set(0)
      return
    }
    const measure = () => {
      travel.set(PARALLAX * (window.innerHeight + section.offsetHeight))
      limit.set(OVERSCAN * section.offsetHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [mode, travel, limit])

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-stage-mode={mode}
      className="relative isolate overflow-hidden bg-[#0a0a0a] py-24 sm:py-40"
    >
      <m.div aria-hidden="true" style={{ y }} className="absolute inset-x-0 -bottom-[20%] -top-[50%] -z-10">
        <FocalCover className="[--fy:100%]">
          {/* La capa mide ~1,7 × el alto de la sección: en escritorio la imagen cubre ~1,4 × el ancho
              del viewport; en móvil, ~5 × (un recorte vertical estrecho). */}
          <Image
            src={relieve}
            alt=""
            fill
            sizes="(min-width: 768px) 140vw, 520vw"
            placeholder="blur"
            className="object-cover"
          />
        </FocalCover>
      </m.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]"
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h2 className="mb-10 font-heading text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl">
          {content.lead} <span className="text-[#a3a3a3] md:block">{content.highlight}</span>
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[#a3a3a3] sm:mb-14 md:text-xl">
          {content.description}
        </p>

        <Button
          size="lg"
          variant="primary"
          href={content.action.href}
          onClick={() => trackEvent(content.action.analyticsEvent)}
          className="border-white bg-white text-[#0a0a0a] hover:bg-[#e5e5e5] focus-visible:ring-white focus-visible:ring-offset-[#0a0a0a]"
        >
          {content.action.label}
        </Button>
      </div>

      <InstrumentLabel className="absolute bottom-6 left-6">{imageLabel}</InstrumentLabel>
    </section>
  )
}
```

**2.3 `src/components/sections/FAQ.tsx`** (reescrito completo):
```tsx
"use client"
// Preguntas frecuentes (§5.8 del diseño). Cambios respecto de la versión anterior:
// - El botón va DENTRO del encabezado (h3 > button), como pide el patrón de
//   acordeón de WAI-ARIA; antes era button > h3, que anula el rol de encabezado.
// - El panel existe siempre en el DOM (oculto con `hidden`): `aria-controls`
//   apunta a un id real en ambos estados y la respuesta está en el HTML.
// - Sin animación de altura (§11 del diseño): el panel aparece con opacidad y
//   un desplazamiento corto; el "+" gira (transform).
// - Fondo blanco (antes #f8f8f8) para no encadenar dos secciones grises tras
//   Tecnologías; el <h2> se ve desde el servidor (sin RevealText).
// El JSON-LD FAQPage lo genera src/app/[locale]/page.tsx desde dict.faq.items.
import { useState } from "react"
import { m } from "motion/react"
import { easing } from "@/lib/motion"

interface FAQContent {
  sectionId: string
  title: string
  subtitle: string
  items: readonly { question: string; answer: string }[]
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonId = `faq-question-${index}`
  const panelId = `faq-panel-${index}`

  return (
    <div className="border-b border-[#d4d4d4] first:border-t">
      <h3 className="text-base font-medium text-[#0a0a0a]">
        <button
          type="button"
          id={buttonId}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full cursor-pointer items-center justify-between gap-8 py-6 text-left"
        >
          <span>{question}</span>
          <m.span
            aria-hidden="true"
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: easing.entrance }}
            className="shrink-0 text-xl text-[#a3a3a3]"
          >
            +
          </m.span>
        </button>
      </h3>
      <m.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        initial={false}
        animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.3, ease: easing.entrance }}
      >
        <p className="pb-6 text-base leading-relaxed text-[#525252]">{answer}</p>
      </m.div>
    </div>
  )
}

export function FAQ({ content }: { content: FAQContent }) {
  return (
    <section
      id={content.sectionId}
      data-header-theme="light"
      className="relative border-t border-[#e5e5e5] bg-white py-16 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="mb-6 font-heading text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-5xl md:text-6xl">
              {content.title}
            </h2>
            <p className="text-lg leading-relaxed text-[#525252]">{content.subtitle}</p>
          </div>

          <div className="lg:col-span-3">
            {content.items.map((item, index) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

**2.4 `src/app/[locale]/page.tsx`: cuatro bloques.**

Antes:
```tsx
import { BuiltProof } from "@/components/sections/home/BuiltProof"
```
Después:
```tsx
import { BuiltProof } from "@/components/sections/home/BuiltProof"
import { MethodologyLine } from "@/components/sections/home/MethodologyLine"
```
Antes (se elimina la línea):
```tsx
const Methodology = dynamic(() => import("@/components/sections/Methodology").then(m => ({ default: m.Methodology })))
```
Después: *(nada)*.

Antes:
```tsx
      <Methodology content={dict.methodology} />
```
Después:
```tsx
      <MethodologyLine content={dict.methodology} />
```
Antes:
```tsx
      <CTA content={ctaContent} />
```
Después:
```tsx
      <CTA content={ctaContent} imageLabel={dict.hero.imageLabel} />
```
No se tocan `faqJsonLd`, el `<script type="application/ld+json">` ni `ctaContent`. **Orden final** del `return` (§3.5), para comprobarlo a ojo: `<script …FAQPage…>`, `HomeHero`, `Thesis`, `CapabilitiesIndex`, `Dossier`, `BuiltProof`, `MethodologyLine`, `TechStack`, `FAQ`, `CTA`.

**2.5 `src/components/sections/TechStack.tsx`: comprobar y ajustar solo si hace falta.** La sección conserva `bg-[#f8f8f8]`, su `border-t` y su contenido, logos de T6 incluidos. Revisión:
```bash
grep -n "RevealText\|data-header-theme" src/components/sections/TechStack.tsx
```
- Si aparece `RevealText`: el `h2` debe verse desde el servidor (§3.6), porque `RevealText` esconde cada palabra con `y: 100%` hasta que entra en pantalla. Se elimina la línea `import { RevealText } from "@/components/ui/RevealText"` y se cambia este bloque.

  Antes:
  ```tsx
          <RevealText
            as="h2"
            className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-10 sm:mb-16"
          >
            {content.title}
          </RevealText>
  ```
  Después:
  ```tsx
          <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-10 sm:mb-16">
            {content.title}
          </h2>
  ```
- Si falta `data-header-theme` (§3.4: toda sección de la home). Antes:
  ```tsx
      <section
        id={content.sectionId}
        className="py-16 sm:py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
      >
  ```
  Después:
  ```tsx
      <section
        id={content.sectionId}
        data-header-theme="light"
        className="py-16 sm:py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
      >
  ```
- Si T6 ya hizo ambas cosas, `TechStack.tsx` no se toca en esta tarea.

**2.6 Borrar la metodología anterior:**
```bash
git rm src/components/sections/Methodology.tsx
```

### Paso 3 — Verificación

```bash
cd /home/user/wt/task10
npm run lint                     # 0 errores, 0 warnings nuevos
npx tsc --noEmit                 # sin salida
PORT=3100 npx playwright test e2e/home.spec.ts -g "T10 ·" --reporter=line                  # 10 passed
PORT=3100 npx playwright test e2e/a11y.spec.ts -g "violations on /es$" --reporter=line      # 1 passed (axe AA en /es)
PORT=3100 npx playwright test e2e/home.spec.ts e2e/smoke.spec.ts --reporter=line           # todo verde
PORT=3100 npx playwright test --reporter=line                                              # suite completa en verde
grep -rn "sections/Methodology\"\|ScrambleText" "src/app/[locale]/page.tsx" src/components/sections/CTA.tsx   # sin resultados
git diff redesign/home -- "src/app/[locale]/page.tsx" | grep -c "faqJsonLd\|FAQPage"       # 0: el JSON-LD no cambia
grep -rln "ScrambleText" src     # informativo: si solo queda ui/ScrambleText.tsx, se anota para T11 (código muerto)
```
Revisión a ojo (con `PORT=3100 npm run dev`):
- 1440×900: la línea de Metodología avanza de izquierda a derecha y cada fase se oscurece al alcanzarla.
- 390×844: la línea es vertical y se completa una sola vez al entrar en pantalla.
- El cierre muestra la zona inferior del relieve y se mueve despacio solo en escritorio. "Imagen ilustrativa" aparece abajo a la izquierda y el texto se lee bien.
- Preguntas frecuentes sobre blanco. Abrir y cerrar con teclado (Tab + Enter/Espacio) funciona, y el foco se ve.
- Pasada con reducir movimiento: todo en estado final y el relieve quieto.

### Paso 4 — Commit

```bash
cd /home/user/wt/task10
git checkout AGENTS.md 2>/dev/null || true
git add src/components/sections/home/MethodologyLine.tsx src/components/sections/CTA.tsx \
  src/components/sections/FAQ.tsx src/components/sections/TechStack.tsx "src/app/[locale]/page.tsx" e2e/home.spec.ts
git commit -F- <<'EOF'
feat(home): metodología con línea, cierre sobre el relieve y FAQ accesible

MethodologyLine reemplaza Methodology: una línea de 1 px se traza con el scroll (vertical y al entrar
en pantalla en móvil) y cada fase pasa de #737373 a #0a0a0a cuando la línea la alcanza. El cierre usa
la zona inferior del relieve con desplazamiento lento (0,3×, solo en escritorio), su título es un h2
visible desde el servidor y deja ScrambleText. FAQ pasa a fondo blanco con h3 > button, sin animar
alturas; el JSON-LD FAQPage no cambia. La home queda en el orden final del contrato.

Decisiones:
- Dos líneas con data-method-line="horizontal|vertical"; CSS muestra la de cada ancho.
- Paralaje: y = 0,3 × el scroll desde la sección centrada, acotado al margen de la capa (20 % del alto).
- "Imagen ilustrativa" del cierre reutiliza hero.imageLabel: no hay claves nuevas.
- El panel de cada respuesta vive siempre en el DOM con `hidden`: aria-controls apunta a un id real.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BtSmnSxj5Q8cRvASJqqRbX
EOF
```
(`TechStack.tsx` solo aparece en el commit si 2.5 lo cambió; si no, `git add` lo ignora sin error.)

### Decisiones

1. **Dos elementos `data-method-line`.** §3.4 nombra un solo atributo sin valores. Aquí hay una línea horizontal (`md:block`, `scaleX`, origen a la izquierda) y otra vertical (`md:hidden`, `scaleY`, origen arriba), movidas por el mismo `MotionValue`, y se distinguen con `data-method-line="horizontal|vertical"`. Las pruebas las eligen por valor: Playwright considera no visible un elemento con `scaleX(0)` (caja de ancho 0), así que `filter({ visible: true })` no sirve para esto.
2. **Cuándo "alcanza" la línea una fase.** Los nodos están al inicio de cada columna, en `i / 5` del trazo, y una fase se activa cuando la línea pasa `i / 5 + 0,04`. En `scrub` el avance va de la fila de fases al 80 % del viewport (0) a la fila al 30 % (1): a mitad de camino hay 3 de 5 activas, que es lo que comprueba la prueba intermedia. En `inView` la línea se traza en 1,6 s con `easing.entrance`. En `static` queda completa y las 5 fases activas desde el primer render tras montar.
3. **Paralaje del cierre.** `y = clamp(0,3 × (p − 0,5) × (alto del viewport + alto de la sección), ±0,2 × alto)`. Es decir: la imagen se desplaza 0,3 px por cada px de scroll respecto de la sección, vale 0 con la sección centrada y queda acotada por el 20 % de margen de la capa por debajo. Solo se aplica en `scrub`. En `inView` (móvil: §5 pide animaciones al entrar, no ligadas al scroll) y en `static` vale 0. Las medidas viven en `MotionValue`s, así que no hay estado de React ni re-renders.
4. **Encuadre inferior.** La capa sobresale `-top-[50%]` y `-bottom-[20%]` (1,7 × el alto de la sección) y `FocalCover` va anclado abajo (`[--fy:100%]`). En casi todas las proporciones `cover` queda limitado por la altura, y el recorte lo decide la geometría de la capa: la ventana muestra aprox. el 30–90 % inferior de la imagen. `--fy` solo pesa en pantallas muy anchas (2560×1080). `sizes="(min-width: 768px) 140vw, 520vw"` sale de ese cálculo. En móvil la imagen se sirve grande, pero es perezosa y está al final de la página.
5. **Contraste AA del cierre.** Degradado `from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]`. Medido sobre `design/moodboard/A1-v2.png` en la banda visible (filas 33–89 %, columnas 20–80 %): máximo 200/255, p99 124–131. Con el 80 % el peor píxel queda en ≈ 48, y `#a3a3a3` en ≈ 5,2:1. El título es blanco. La etiqueta "Imagen ilustrativa" usa `hero.imageLabel` (clave de T6) como prop nueva `imageLabel` de `CTA`, así que no hay claves nuevas (§3.2, T10).
6. **FAQ.** El panel existe siempre en el DOM con `hidden`, `role="region"` y `aria-labelledby`, así que `aria-controls` nunca apunta a un id inexistente y las respuestas están en el HTML. Se quita la animación de `height` (diseño §11). El panel entra con opacidad y 6 px de `y`, y el "+" gira. El `h2` deja `RevealText`, igual que el del cierre deja ScrambleText. No se añade analítica (`faq_expand` existe en el tipo, pero no se pidió).
7. **Estados iniciales y sin JavaScript.** Las fases de Metodología salen del servidor inactivas (`#737373`, AA) con la línea en `scaleX(0)`. Sin JavaScript se leen, pero no se ven activas. Todos los `h2` de esta tarea son visibles desde el servidor, y la prueba sin JavaScript lo verifica en el cierre con `effectiveOpacity`.
8. **Pruebas globales.** La regla del azul recorre toda la home en pasos de ½ pantalla, en 1440×900 y 390×844, con y sin reducir movimiento. Antes espera `.site-header[data-tone]` (hidratación) y el modo esperado en `#metodologia`. La misma prueba recoge errores de hidratación en consola. La prueba de orden usa los `sectionId` del diccionario, porque el `id="inicio"` de la portada no es una clave del contrato. `MethodologyLine` se importa de forma estática: según la guía de *lazy loading* de Next 16, `dynamic()` desde un Server Component no divide en trozos los Client Components.

---

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
- **Home "Cartografía soberana"** (`src/components/sections/home/`): monocromo Orbexs. El azul `#2563eb` significa "lo que el sistema está procesando ahora" y solo lo llevan el punto de la cumbre (portada), el nodo activo (Capacidades) y el recuadro del campo activo (Del papel al dato); nunca hay más de un elemento azul visible a la vez (`e2e/home.spec.ts` lo verifica). Las imágenes viven en `design/source/` y se procesan con `npm run images` (salida en `src/assets/images/` y `public/images/og/`); no se generan imágenes nuevas y las ilustraciones llevan la etiqueta "Imagen ilustrativa". Las superposiciones SVG usan `viewBox="0 0 1536 1024"` dentro de `FocalCover` y sus coordenadas viven en `home/geometry.ts`. El movimiento solo anima `transform`, `opacity` y `pathLength`; la altura larga y el `sticky` los pone CSS (`stage:`), y `useStageMode()` decide `scrub` / `inView` / `static`.
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
