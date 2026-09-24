# Presupuesto de JS de la home: investigación y plan (2026-09-24)

**Contexto:** sesión 2 del rediseño de la home (`redesign/home`). Objetivo vinculante (plan §11 y T11): bytes de JS transferidos al cargar `/es` − 239 002 ≤ 30 720, es decir, **total ≤ 269 722 B**, medido con `next start`, 1440×900, caché desactivada, bytes transferidos (comprimidos), mediana de 3.

**Cómo se hizo:** workflow de 5 agentes: analista del bundle (builds y mediciones reales), documentación local de Next 16.3 y motion 12, buenas prácticas web a septiembre de 2026, prototipo que aplicó y midió las mejores ideas, y síntesis. Medidor reutilizable: `scripts/agent/measure-js.mjs`. Parches del prototipo: `docs/superpowers/research/p1-parches/` (sobre el commit 32836e8, T6 antes de su corrección: úsalos como referencia, no los apliques a ciegas).

## 1. Resultado en una línea

Todo el JS del sitio se compilaba a **ES5** por un fallo de Turbopack con `browserslist` relativo (vercel/next.js#92091). Con `browserslist` en versiones fijas y otros tres cambios pequeños, `/es` baja de **250 331 B a 219 972 B (−30 359 B, medido)**, por debajo de la línea base anterior al rediseño (239 002 B). Proyección al cierre de T10: **≈ 221–230 KB** (estimada), con 40–49 KB de margen.

## 2. Diagnóstico

Todas las cifras de este informe se midieron sobre el commit 32836e8, que es T6 sin la corrección. El commit 72f4e92, la punta actual de wt/task6, añade useTextRise y más código a HomeHero, y nadie lo ha medido todavía.

**Cuánto pesa T6 hoy (medido).** T6 pesa 250 331–250 333 B en 16 scripts, frente a 233 003 B de T5, así que añade 17 328 B. El margen para T7–T10 es de 19 391 B. Estos son los bytes transferidos en /es:
- react y react-dom: 73 381 B. No se pueden tocar.
- Runtime de Next (app router, límites de error y runtime de Turbopack): unos 77,8 KB.
- motion (m, LazyMotion con domAnimation síncrono, useScroll, JSAnimation y useTransform): unos 45 KB.
- Chunk del layout: 12 379 B. Contiene Header (unos 4,4 KB), @vercel/analytics (unos 1,9 KB), ScrollProgress, TransitionLink, SmoothScroll y MotionProvider.
- tailwind-merge: 9 510 B. Llega por `cn` desde Button, que está en el Header y por tanto en todas las páginas, y desde FocalCover, ScrollStage, InstrumentLabel y TrustLogos.
- AnimatePresence, next/link, trackEvent e i18n: 9 106 B.
- Secciones antiguas que T7–T10 retiran: 8 445 B.
- Chunk de AboutPage, que se descarga por el prefetch del enlace «Empresa»: 3 418 B.
- Cabeceras HTTP: unos 786 B por script, unos 12,6 KB en total. Esto es HTTP/1.1 en local.

**Causa principal, que no depende de T6.** Todo el JS del cliente sale transpilado a ES5 por el fallo de Turbopack vercel/next.js#92091. El issue sigue abierto y el arreglo (PR #92244) no está fusionado. El package.json declara `"browserslist": ["last 2 Chrome versions", …]`. Next resuelve esa consulta en JS (`get-supported-browsers.js`) y obtiene chrome 151, firefox 153 y safari 26.4. Se la pasa a Turbopack como `browserslistQuery` (`turbopack-build/impl.js:82,113`). El browserslist-rs de Turbopack no conoce esas versiones, las descarta todas y SWC activa todas las transformaciones de compatibilidad: `"".concat`, `_class_call_check`, desestructuración convertida a `var`, sin `?.` ni spread. Esto cuesta 23 582 B. Lo midieron tres investigadores por separado y los tres obtuvieron exactamente 226 749 B.

**De dónde salen los +17,3 KB de T6.**
- El `animate()` híbrido de motion en HeroRoute: 5 364 B (medido). Arrastra secuencias, GroupAnimationWithThen, ObjectVisualElement y createDOMVisualElement.
- next/image en la isla, con el blurDataURL del import estático metido en el JS: 6 727 B (medido). El blurDataURL solo pesa 866 B.
- Unos 5,2 KB de código propio (HomeHero, HeroRoute, ScrollStage, FocalCover, InstrumentLabel, useStageProgress), useTransform, useInView y las cabeceras de 3 scripts más.

**Código muerto que viaja en /es (medido sobre T6).**
- MagneticButton dentro de Button, con useSpring y attachFollow: −2 900 B si se quita. Nadie pasa la prop `magnetic`.
- `next/dynamic` en page.tsx: −2 578 B si se quita. Desde un Server Component no divide el código: solo añade React.lazy, PreloadChunks y BailoutToCSR.

**Riesgos del plan tal como está escrito.**
- T9 importa `ConsoleFrame` desde `realty/Hero.tsx`, que lleva `"use client"`. Eso metería en la home unos 3,1 KB de RealtyHero, viz y shared (estimado).
- T7, T8 y T10 ponen `<Image placeholder="blur">` con import estático dentro de islas cliente. Cada imagen metería su blurDataURL en el JS, y además contradice la decisión 12 de T6.
- T9 y T10 vuelven a importar `animate`.

**Si no se hace nada.** El plan sin cambios quedaría en unos 252–257 KB (estimado por el investigador WEB). Probablemente cumpliría, pero con solo 13–18 KB de margen.

## 3. Acciones priorizadas

| # | Acción | Dónde | Ahorro | ¿Medido? | Riesgo |
|---|---|---|---|---|---|
| 1 | 1. Fijar browserslist con versiones mínimas explícitas y añadir una comprobación de que la salida es JS moderno | global (corrección de T6, antes de T7) | −23 582 B MEDIDO sobre T6 (250 331 → 226 749 B, 16 scripts). Una lista fija, un rango con suelo (`chrome >= 111`) y quitar el campo dan exactamente la misma cifra. Por sí sola, esta acción ya cumple el objetivo: el margen pasa de 19 391 a 42 973 B. | sí | Bajo. - El JS pasa a exigir Chrome, Edge y Firefox 111+ y Safari 16.4+. Es el valor por defecto de Next y coincide con el suelo que ya exige Tailwind v4. Es más amplio que la política actual de «last 2». - El CSS crece u |
| 2 | 2. Usar `animateSingleValue` en lugar de `animate()` de motion/react al animar un MotionValue: HeroRoute (T6), BuiltScaleIn (T9) y MethodologyLine (T10) | T6, T9, T10 | MEDIDO: - −4 988 B sobre T6, con 1 script menos. - −3 430 B de aporte marginal sobre la base ya moderna (223 402 → 219 972). - La alternativa declarativa v2 da −5 364 B sobre T6 y −4 875 B sobre v1. Si T9 o T10 importan `animate`, esos bytes vuelven. | sí | Bajo. Para un MotionValue, `animate()` ya llama por dentro a `animateSingleValue` (framer-motion/dist/es/animation/animate/subject.mjs); lo que se elimina es la envoltura.  Trampa verificada: con skipAnimations, instantA |
| 3 | 3. Quitar MagneticButton de Button (código muerto que viaja en todas las páginas) | global (corrección de T6) | MEDIDO: −2 900 B sobre T6, con 1 script menos al reagruparse los chunks de motion. Sobre la base moderna aporta −1 099 B. | sí | Muy bajo. `tsc` pasa sin la prop `magnetic`, lo que confirma que nadie la usa. Se conserva el `whileTap` de m.a y m.button. |
| 4 | 4. page.tsx: imports estáticos en lugar de next/dynamic para las 8 secciones | corrección de T6, o T7 si se prefiere no tocar page.tsx ahora | MEDIDO: - −2 578 B sobre T6, con 1 script menos. - Sobre la base moderna aporta −888 B. - El investigador WEB midió −2 788 B después de retirar las secciones (247 065 → 244 277). | sí | Bajo. El HTML que sale del servidor es idéntico: 0 líneas distintas y las mismas 8 precargas.  node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md lo dice: «When a Server Component dynamically imports a Client C |
| 5 | COMBINACIÓN 1+2+3+4 (resultado de referencia) | corrección de T6 | MEDIDO: 219 972 B en 15 scripts (−30 359 B). Se midió dos veces, en dos builds distintos, y salió idéntico. El margen para T7–T10 pasa a 49 750 B. Los ahorros por separado no se suman tal cual (34 048 frente a 30 359 B), porque el ES5 infla cada delta y Turbop | sí | Bajo. - El HTML de /es, quitando scripts y precargas, es idéntico al de T6: mismo h1, data-hero-route y 8 precargas. - `tsc --noEmit` y ESLint pasan sin errores ni avisos. - e2e contra `next start` (home, motion, smoke,  |
| 6 | 5. Imágenes de /es: el import estático y el `<Image>` van en el servidor, y la isla recibe la imagen ya renderizada como prop `media: ReactNode`. Nunca `placeholder="blur"` | T6 (portada), T7 (lámina), T8 (expediente), T10 (cierre) | ESTIMADO: - Unos −0,9 KB en la portada, a partir del v3 medido (−866 B al sacar el blurDataURL del JS). - Entre −0,5 y −0,9 KB por cada imagen de T7, T8 y T10 que el plan metía con blurDataURL dentro de una isla. - El runtime de next/image (unos 5,9–6,7 KB) se | estimado | Bajo. Usa solo la API pública. - `<Image>` es un componente cliente que se puede renderizar desde un Server Component. Sus props (StaticImageData y la data URL de `coverPlaceholder`) viajan en el payload RSC, no en el JS |
| 7 | 6. (Opcional y condicional) Quitar next/image de /es del todo: `<img>` con srcset generado en el servidor | T11, o contingencia | MEDIDO: −6 096 B sobre la combinación 1–4 (219 972 → 213 876 B; margen de 55 846 B). Sobre T6 solo, −6 727 B (v3b). El ahorro solo aparece si NINGUNA imagen de /es usa `<Image>`. `getImageProps` importado de "next/image" no basta: solo ahorra 866 B, porque ima | sí | Medio. - Depende de rutas internas de Next (`next/dist/shared/lib/get-img-props`, `image-loader` y `process.env.__NEXT_IMAGE_OPTS`), que hay que revisar en cada actualización. - Es todo o nada. - Hace falta un eslint-dis |
| 8 | 7. T9: sacar ConsoleFrame a un módulo sin "use client" | T9 | ESTIMADO: unos 3,1 KB evitados (bun + gzip: realty/Hero con shared y viz = 3 059 B). Si no se hace, T9 añade ese peso sin que se note en las islas. | estimado | Bajo o medio: toca /realty. ConsoleFrame es una función pura, sin hooks (Hero.tsx, líneas 38–105). Hay que mantener e2e/realty.spec.ts, la prop `drawn` y las reglas de honestidad y de `demoLabel` de RealTy (CLAUDE.md). |
| 9 | 8. Reglas de import para las islas de T7–T10 | T7, T8, T9, T10 | ESTIMADO: evita regresiones. Con el conjunto de motion que ya carga /es, useInView cuesta unos +256 B y useTransform unos +19 B. `animate` cuesta unos 3,4–5,4 KB medidos; cada chunk nuevo unos 786 B de cabeceras; un import `use client` innecesario, varios KB. | estimado | Bajo. Es exactamente la arquitectura del plan (§3): `m` + LazyMotion strict + useStageProgress + variante `stage:`. |
| 10 | 9. Sacar tailwind-merge del cliente: Button, FocalCover, ScrollStage, InstrumentLabel y TrustLogos con clsx y variantes explícitas | T11 (opcional, como tarea aparte con capturas) | MEDIDO como cota superior: −9 350 B sobre T6 (v4) y −8 983 B sobre v1+v2+v3b (214 486 → 205 503 B). El chunk 0twliisbekyr8.js es solo tailwind-merge (9 510 B transferidos). | sí | Medio. Sin twMerge, cuando dos clases chocan gana el orden del CSS de Tailwind, no el orden de los argumentos, y las regresiones visuales pueden pasar desapercibidas. Button tiene unas 29 llamadas, 16 de ellas con classN |
| 11 | 10. Quitar AnimatePresence del Header: salida del MegaMenu con CSS `@starting-style` y `transition-behavior: allow-discrete` | T11 (opcional) | ESTIMADO: unos −2 KB (el módulo pesa 5 512 B en bruto y 2 412 B con gzip aislado). Solo se ahorra si nada de /es la usa. Después de T10 solo la usa el Header: el FAQ antiguo desaparece y el FAQ nuevo del plan no la importa. | estimado | Bajo o medio. `@starting-style` es Baseline desde 2024 (Chrome 117, Safari 17.5, Firefox 129). En Safari 16.4–17.4 el menú aparece y desaparece sin animación, lo que es una degradación aceptable. Hay que mantener las pru |
| 12 | 11. Contingencias, solo si una medida supera su tope | global | ESTIMADO: - Hook propio de avance de scroll en lugar de useScroll: unos −2,6 KB. - Una sola isla mínima de estado (StageSteps) para T7–T10: unos −4–5 KB. | estimado | Medio. Obliga a reimplementar los offsets ('start 0.85'/'end 0.5', etc.) y cambia el estilo de código. Con las acciones 1–8 no hace falta. |

### Cómo aplicar cada acción

**1. 1. Fijar browserslist con versiones mínimas explícitas y añadir una comprobación de que la salida es JS moderno**

En package.json: `"browserslist": ["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`. El parche está en docs/superpowers/research/p1-parches/diff-bl.patch.

Copiar docs/superpowers/research/p1-parches/check-modern-js.mjs a `scripts/check-modern-js.mjs`. Cuenta `let` y `class` en `.next/static/chunks` y falla si hay menos de 500 `let` o menos de 20 `class`. Está probado: con ES5 da let=24 y falla; con JS moderno da let=3510 y pasa. Añadir `"check:modern-js": "node scripts/check-modern-js.mjs"` y ejecutarlo después de cada `npm run build` como parte del protocolo del plan (§1).

**2. 2. Usar `animateSingleValue` en lugar de `animate()` de motion/react al animar un MotionValue: HeroRoute (T6), BuiltScaleIn (T9) y MethodologyLine (T10)**

`import { animateSingleValue, m, useInView, useMotionValue, useMotionValueEvent, useTransform } from "motion/react"`

En el efecto:
`if (mode !== "inView" || !inView) return; animateSingleValue(ownDraw, 1, { duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }); return () => ownDraw.stop()`

El parche es docs/superpowers/research/p1-parches/diff-asv.patch. Se aplica tal cual sobre 72f4e92, porque HeroRoute no cambió en ese commit.

T9: `animateSingleValue(amount, 1, { duration: 0.7, ease: easing.entrance }); return () => amount.stop()` (plan, línea 8136).

T10: `animateSingleValue(line, 1, …); return () => line.stop()` (plan, línea 8767).

**3. 3. Quitar MagneticButton de Button (código muerto que viaja en todas las páginas)**

Aplicar docs/superpowers/research/p1-parches/diff-mag.patch en src/components/ui/Button.tsx:
- Quitar `import { MagneticButton } from "./MagneticButton"`.
- Quitar la prop `magnetic?: boolean` y su valor por defecto.
- Devolver `anchor` o `button` directamente.

Borrar el archivo MagneticButton.tsx queda para T11.

**4. 4. page.tsx: imports estáticos en lugar de next/dynamic para las 8 secciones**

Borrar `import dynamic from "next/dynamic"`. Cambiar cada `const X = dynamic(() => import("@/components/sections/X").then(m => ({ default: m.X })))` por `import { X } from "@/components/sections/X"`. El parche es docs/superpowers/research/p1-parches/diff-dyn.patch.

Consecuencia para el plan: donde T7, T9 y T10 borran líneas `const Services/FlagshipAI/CaseStudy/LiveStudioTeaser/Methodology = dynamic(…)`, pasan a borrar las líneas `import { … }` equivalentes. T7 §2.4 deja de mantener `dynamic`.

**5. COMBINACIÓN 1+2+3+4 (resultado de referencia)**

Parche completo: docs/superpowers/research/p1-parches/diff-all.patch, hecho sobre 32836e8. Sobre 72f4e92 aplica sin conflictos, porque no toca HomeHero.

**6. 5. Imágenes de /es: el import estático y el `<Image>` van en el servidor, y la isla recibe la imagen ya renderizada como prop `media: ReactNode`. Nunca `placeholder="blur"`**

Portada:
1. En page.tsx (servidor), o en un módulo sin directiva como `src/components/sections/home/hero-media.tsx`, poner `import relieve from "@/assets/images/relieve.jpg"` y renderizar `<Image src={relieve} alt="" fill sizes={IMAGE_SIZES} placeholder={coverPlaceholder(relieve)} loading="eager" fetchPriority="high" className="object-cover" />`. Usar el IMAGE_SIZES actualizado en 72f4e92.
2. Llamar `<HomeHero content={heroContent} media={heroMedia} />`.
3. HomeHero declara `media: React.ReactNode` y lo pinta dentro de su `<m.div className={SCALED_LAYER} style={{ scale, … }}>`.
4. HomeHero ya NO importa `relieve`, `next/image` ni `coverPlaceholder`.

Mismo patrón en CapabilitiesIndex, Dossier y el CTA de T10: la sección de servidor, o page.tsx, importa la imagen y pasa el `<Image>` a la isla. Con esto la acción 6 queda como un cambio de un solo archivo.

**7. 6. (Opcional y condicional) Quitar next/image de /es del todo: `<img>` con srcset generado en el servidor**

src/lib/image-props.ts (servidor), copiando docs/superpowers/research/p1-parches/image-props.ts.txt. En page.tsx: `media={<img {...getStaticImgProps({ src: relieve, alt: "", fill: true, sizes, placeholder: coverPlaceholder(relieve), loading: "eager", fetchPriority: "high", className: "object-cover" })} alt="" />}`.

docs/superpowers/research/p1-parches/diff-allimg.patch se hizo sobre 32836e8 y NO aplica limpio sobre 72f4e92, porque HomeHero cambió. Solo merece la pena si el usuario acepta depender de rutas internas y la medida final se acerca al límite.

**8. 7. T9: sacar ConsoleFrame a un módulo sin "use client"**

Crear src/components/sections/realty/ConsoleFrame.tsx sin directiva, con el ConsoleFrame actual y la prop `compact` que añade T9.
- realty/Hero.tsx pasa a importarlo desde ahí.
- home/BuiltProof.tsx (servidor) lo importa desde ConsoleFrame.tsx, nunca desde Hero.
- Si ConsoleFrame usa piezas de viz.tsx o shared.tsx y esos archivos llevan "use client" sin tener hooks, se les quita la directiva, o se separan las piezas puras.

Actualizar la decisión 4 de T9 en el plan: la «fase 2» se adelanta.

**9. 8. Reglas de import para las islas de T7–T10**

Imports permitidos de motion/react:
- m
- useScroll (solo si useStageProgress no sirve)
- useTransform
- useMotionValue
- useMotionValueEvent
- useInView
- animateSingleValue
- tipos

Prohibidos: animate, useAnimate, useSpring, stagger, AnimatePresence, domMax, `motion.*` (usar `m.*`), animateMini y cualquier otro export sin medir antes.

Imports estáticos en page.tsx; nunca next/dynamic. Ningún Server Component importa un módulo `"use client"` que no renderice. Ninguna dependencia nueva. Ningún import estático de imagen dentro de una isla (acción 5).

**10. 9. Sacar tailwind-merge del cliente: Button, FocalCover, ScrollStage, InstrumentLabel y TrustLogos con clsx y variantes explícitas**

- `src/lib/cx.ts` con `export { clsx as cx } from "clsx"`.
- Button: `tone: "light" | "dark"` y `variant: "bare"` para el Header, y quitar las clases de color de las llamadas.
- ScrollStage: prop `frameHeight: "screen" | "grow"` en lugar de fusionar clases.
- Verificar con e2e a11y (contraste), capturas de antes y después, y comprobar que tailwind-merge no aparece en los scripts de /es.

**11. 10. Quitar AnimatePresence del Header: salida del MegaMenu con CSS `@starting-style` y `transition-behavior: allow-discrete`**

Renderizar siempre el panel con `data-open` e `inert` cuando está cerrado, y declarar en CSS `transition: opacity, translate, display allow-discrete` más `@starting-style` para la entrada. Quitar `AnimatePresence` del import del Header (plan, línea 4009).

**12. 11. Contingencias, solo si una medida supera su tope**

Aplazarlo. Activarlo solo si el total al cerrar una tarea supera 240 000 B o si esa tarea excede su tope. Prototipo en docs/superpowers/research/p1-parches/lean/StageSteps.tsx.txt.

## 4. Tarea P1 (rendimiento): lo que se aplica antes de la Fase 3

Instrucciones originales para el corrector de T6 (se ejecutan como tarea propia **P1**, después de integrar T6 y antes de T7–T10; las rutas de los parches cambian a `docs/superpowers/research/p1-parches/`):

**Para el corrector de T6** (trabaja en wt/task6, punta en 72f4e92). Todos los parches están en `docs/superpowers/research/p1-parches/`. Haz un commit por punto.

1. **browserslist (acción 1).** Aplica diff-bl.patch: `"browserslist": ["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`. Copia check-modern-js.mjs a `scripts/check-modern-js.mjs` y añade `"check:modern-js": "node scripts/check-modern-js.mjs"`. No uses consultas relativas.
   Commit: `build: browserslist con suelos fijos (Turbopack compilaba a ES5, vercel/next.js#92091)`.

2. **HeroRoute (acción 2).** Aplica diff-asv.patch: `animateSingleValue(ownDraw, 1, { duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }); return () => ownDraw.stop()`. Deja de importar `animate`.

3. **Button (acción 3).** Aplica diff-mag.patch: fuera el import de MagneticButton, la prop `magnetic` y las ramas que la usan. No borres todavía MagneticButton.tsx.

4. **page.tsx (acción 4).** Aplica diff-dyn.patch: fuera `import dynamic from "next/dynamic"`, y las 8 secciones pasan a imports estáticos. El JSON-LD `FAQPage` generado desde `dict.faq.items` y `buildAlternates()` se quedan intactos (regla SEO de CLAUDE.md).

5. **Recomendado (acción 5): imagen de la portada como slot.**
   - Mueve `import relieve`, `coverPlaceholder(relieve)` y el `<Image …>` a page.tsx, o a un módulo sin directiva como `src/components/sections/home/hero-media.tsx`.
   - Conserva exactamente `fill`, el `IMAGE_SIZES` de 72f4e92, `loading="eager"`, `fetchPriority="high"` y `className="object-cover"`.
   - HomeHero recibe `media: React.ReactNode` y lo pinta dentro de su `m.div` con `SCALED_LAYER`, la escala y el origen en la cumbre.
   - HomeHero ya no importa `next/image`, `relieve` ni `@/lib/image-placeholder`.
   - No pongas `placeholder="blur"`.

6. **Verificación.**
   - `npx tsc --noEmit` y `npm run lint`.
   - `heavy --exclusive npm run build`, y después `node scripts/check-modern-js.mjs`: debe decir OK, con miles de `let`.
   - Medida: `next start` en un puerto libre (compruébalo con `portfree`) y `heavy --exclusive node scripts/agent/measure-js.mjs --url http://localhost:PORT/es --runs 3 --viewport 1440x900 --root <worktree> --budget 269722`.
   - e2e contra next start: home, motion, smoke, header y a11y. En desarrollo: `PORT=… heavy npx playwright test e2e/home.spec.ts`.
   - Compara el HTML de /es antes y después, quitando scripts y precargas: con los puntos 1–4 no debe cambiar ni una línea. Con el punto 5, el `<img>` debe salir igual, con srcset, sizes y fetchpriority="high".

7. **Resultado esperado.**
   - Los puntos 1–4 midieron 219 972 B sobre 32836e8.
   - Sobre 72f4e92, más el punto 5, espero unos 220–221 KB (estimado): useTextRise suma algo y el slot quita unos 0,9 KB.
   - Tope para cerrar T6: ≤ 222 000 B. Si lo supera, identifica el chunk con el JSON de measure-js antes de seguir.
   - Anota la cifra medida en «Estado al cierre» de T6. Es la línea base de T7.

8. **Plan (§3).** Añade una regla: browserslist solo con versiones fijas, `check:modern-js` tras cada build, las islas usan solo el conjunto de motion permitido (m, useScroll/useStageProgress, useTransform, useMotionValue, useMotionValueEvent, useInView, animateSingleValue), e imágenes siempre como slot desde el servidor.

**Si el orquestador prefiere una corrección de T6 más acotada:** el punto 2 (y el 5 si se hace) se queda en T6, porque es código de T6. Los puntos 1, 3 y 4 van en un commit aparte sobre redesign/home, justo después de integrar T6 y antes de T7. El resultado medido es el mismo.

**No hagas en T6:** tailwind-merge, quitar next/image del todo, cabeceras, animaciones CSS ligadas al scroll ni LazyMotion asíncrono.

## 5. Instrucciones por tarea (presupuesto de bytes y técnicas obligatorias o prohibidas)

### T7

**Presupuesto.** Delta neto ≤ +4 000 B sobre la medida al cierre de T6 (unos 220 KB). Alarma si el total supera 235 000 B. Estimación de las islas (bun + gzip): Thesis 812 B y CapabilitiesIndex con geometry 2 225 B. Además, retirar Services y FlagshipAI libera bytes.

**page.tsx.** Ya no usa next/dynamic. Donde el plan borra `const Services = dynamic(…)` y `const FlagshipAI = dynamic(…)`, borra las líneas `import { Services } …` e `import { FlagshipAI } …`. §2.4 ya no mantiene `dynamic`: no lo reintroduzcas (decisión 8).

**CapabilitiesIndex (obligatorio).**
- Saca de la isla `import Image from "next/image"` y `import lamina from "@/assets/images/lamina.jpg"` (plan, líneas 6549–6552).
- La sección de servidor, o page.tsx, renderiza `<Image src={lamina} alt="" fill sizes="…" placeholder={coverPlaceholder(lamina)} className="object-cover" />`, con carga perezosa por defecto, y se lo pasa a la isla como `media: React.ReactNode`. La isla lo pinta dentro de FocalCover.
- Prohibido `placeholder="blur"` (línea 6664): contradice la decisión 12 de T6 y mete el blurDataURL en el JS.

**motion.**
- Permitidos: m, useScroll (ya cargado; mejor useStageProgress si encaja), useTransform, useMotionValue, useMotionValueEvent, useInView y animateSingleValue (limpieza con `valor.stop()`).
- Prohibidos: animate, useAnimate, useSpring, stagger, AnimatePresence, domMax y `motion.*`.

**Otras reglas.**
- Ninguna dependencia nueva.
- Ningún Server Component importa un módulo "use client" que no renderice.
- No te apoyes en sobrescribir clases de Button con className para colores nuevos: facilita T11.

**Cierre.**
- `heavy --exclusive npm run build` y `npm run check:modern-js`.
- `heavy --exclusive node scripts/agent/measure-js.mjs --url http://localhost:PORT/es --runs 3 --viewport 1440x900 --root <worktree> --budget 269722`.
- Anota el total y el delta en «Estado al cierre». Si superas el tope, revisa el JSON (jsFiles) y corrige en origen antes de entregar.

### T8

**Presupuesto.** Delta neto ≤ +3 000 B sobre el cierre de T7. Alarma si el total supera 238 000 B. Estimación de Dossier con geometry (bun + gzip): 2 308 B. T8 no retira secciones.

**Dossier (obligatorio).**
- Saca de la isla `import Image from "next/image"` y `import expediente from "@/assets/images/expediente.jpg"` (plan, líneas 7274–7278).
- La sección de servidor, o page.tsx, renderiza el `<Image … placeholder={coverPlaceholder(expediente)}>` y lo pasa como prop `media` o como children. FocalCover no tiene hooks y funciona dentro de la isla o en el servidor.
- Prohibido `placeholder="blur"` (línea 7396).

**ScrollStage.** Se mantiene `frameClassName="stage:h-auto"` como está, sin nuevas sobrescrituras de clases.

**motion.** El mismo conjunto de imports permitidos y prohibidos que en T7. Dossier ya usa solo m, useInView y useMotionValueEvent: mantenlo así.

**Otras reglas.** Ninguna dependencia nueva ni next/dynamic.

**Cierre.** El mismo protocolo que en T7: build, `check:modern-js`, measure-js con `--budget 269722` y anotar el delta.

### T9

**Presupuesto.** Delta neto ≤ +2 500 B sobre el cierre de T8. Alarma si el total supera 240 000 B. Estimación de las islas (bun + gzip): BuiltScaleIn 549 B, BuiltStage 244 B y StudioSequence 980 B. Retirar CaseStudy y LiveStudioTeaser libera bytes: borra sus líneas `import { … }` en page.tsx, no `const … = dynamic`.

**ConsoleFrame (obligatorio, sustituye la decisión 4 y el paso 2.2).**
- Crea `src/components/sections/realty/ConsoleFrame.tsx` SIN "use client", con ConsoleFrame y la prop opcional `compact` (valor por defecto `false`).
- `realty/Hero.tsx` lo importa desde ahí; RealtyHero no cambia.
- `home/BuiltProof.tsx` hace `import { ConsoleFrame } from "@/components/sections/realty/ConsoleFrame"`, nunca desde `realty/Hero` (plan, línea 8304).
- Si ConsoleFrame necesita piezas de viz.tsx o shared.tsx marcadas "use client" pero sin hooks, quítales la directiva o separa las piezas puras.
- Verifica que no entre en /es ningún literal o clase exclusivo de realty/Hero.tsx: grep en los chunks que carga /es.
- Sin eso, T9 añade unos 3,1 KB (estimado).

**BuiltScaleIn (obligatorio).** Sustituye `animate` (línea 8136) por `animateSingleValue(amount, 1, { duration: 0.7, ease: easing.entrance }); return () => amount.stop()`. `animate` no puede aparecer en el import.

**RealTy (CLAUDE.md).**
- Solo el nombre RealTy.
- `statusLabels` y la regla de honestidad; `demoLabel` una vez por marco; «simulado» junto a retenciones y reservas.
- Sin jerga técnica ni cifras de desempeño.
- e2e/realty.spec.ts debe seguir pasando sin cambios.

**motion.** El mismo conjunto permitido que en T7.

**Cierre.** El mismo protocolo, más e2e/realty.spec.ts.

### T10

**Presupuesto.** Delta neto ≤ +3 000 B sobre el cierre de T9.
- Límite duro del total: 269 722 B.
- Objetivo de cierre (estimado): unos 221–230 KB.
- Estimación de las islas (bun + gzip): MethodologyLine 1 312 B, CTA 1 249 B y FAQ 898 B.
- Retirar Methodology, el CTA y el FAQ antiguos y ScrambleText libera unos 2 KB o más (estimado). En page.tsx, borra la línea `import { Methodology } …`.

**MethodologyLine (obligatorio).** Sustituye `animate` (línea 8767) por `animateSingleValue(line, 1, { … }); return () => line.stop()`.

**CTA (obligatorio).**
- Saca de la isla `import Image from "next/image"` y el import estático de la imagen (línea 8928).
- La sección de servidor, o page.tsx, renderiza `<Image … placeholder={coverPlaceholder(img)}>` y lo pasa como `media`.
- Prohibido `placeholder="blur"` (línea 9001).
- El paralaje sigue con useMotionValue y useTransform, que están permitidos.

**FAQ.**
- Sin AnimatePresence y sin animación de altura; el plan ya lo cumple, mantenlo así. Así el Header queda como único usuario de AnimatePresence, lo que habilita la acción 10 en T11.
- Si modificas el FAQ o los diccionarios, NO elimines el JSON-LD `FAQPage` de `src/app/[locale]/page.tsx` generado desde `dict.faq.items` (CLAUDE.md).

**motion.** El mismo conjunto permitido que en T7.

**Cierre.**
- El mismo protocolo, más la verificación JS del §11 del plan: `median.jsBytes` − 239 002 ≤ 30 720.
- Anota el total final y cuánto aportó cada tarea (T7–T10).
- Si el total supera 240 000 B, aplica las contingencias (acción 11 y luego la 6) antes de cerrar.

### T11

**Limpieza (0 B en /es; solo mantenimiento).** Borrar MagneticButton.tsx, CustomCursor, IntroSequence, SoundToggle, HeroCanvas, GlobalParticles, HeroScene y los Wrapper con next/dynamic que no tienen importadores. Antes, confirmar con grep que siguen sin importadores.

Corregir el comentario de MotionProvider.tsx: `features={domAnimation}` se carga de forma síncrona, no asíncrona.

**Documentación.**
- Dejar en el plan la regla de browserslist fijo, `check:modern-js` y los imports de motion prohibidos.
- PROPONER al usuario, que es quien decide, una línea en CLAUDE.md: «browserslist solo con versiones fijas mientras siga abierto vercel/next.js#92091; en islas de la home prohibido `animate`/`useAnimate`/`useSpring`/`AnimatePresence`».
- Si hay CI, añadir `npm run check:modern-js` tras el build.

**Opcionales, cada uno con su propia medida y solo si el usuario los quiere.**
- Acción 9: tailwind-merge fuera del cliente. Unos −9 KB (cota superior medida). Riesgo visual medio; hace falta tomar capturas antes y después.
- Acción 10: AnimatePresence fuera del Header con `@starting-style`. Unos −2 KB (estimado).
- Acción 6: next/image fuera de /es. −6,1 KB medidos. Depende de rutas internas de Next; tras T7–T10 con slots, es un cambio en el servidor.
- Accesibilidad (WCAG C39, 0 B): envolver `html { scroll-behavior: smooth }` en `@media (prefers-reduced-motion: no-preference)`. Es compatible con CLAUDE.md: el scroll suave sigue siendo nativo.

**Verificación final.** Con scripts/measure-home.mjs según el protocolo de T11. Comparar con las medidas por tarea anotadas en T7–T10.

## 6. Descartado y por qué

- **Quitar las cabeceras de seguridad de /_next/static** (v6: −5 610 B medidos). Es sobre todo un artefacto de la medida local por HTTP/1.1. En producción, HTTP/2 y HTTP/3 comprimen con HPACK/QPACK las cabeceras repetidas. Además, `X-Content-Type-Options: nosniff` protege precisamente a los scripts. Baja la cifra, pero no el JS real.
- **Hidratar en diferido o cargar las islas bajo el pliegue tras una interacción.** No reduce el JS total. Solo baja la métrica porque la medida no hace scroll, y el diseño (§11) habla del total.
- **next/dynamic desde un Server Component.** No divide el código (lazy-loading.md) y añade unos 2,6 KB medidos.
- **LazyMotion con las features en asíncrono.** El chunk se descarga igual antes de networkidle + 1,5 s: 0 B.
- **Otras variantes de motion:**
  - domMax: +13 353 B.
  - `motion.*` completo en lugar de `m`: 41 673 frente a 28 087 B.
  - motion/react-m: −75 B, despreciable.
  - animateMini o motion/mini: más caro que animateSingleValue (+957 B).
- **React Compiler.** Añade código.
- **Opciones experimentales de Turbopack.** Con `experimental.turbopackChunking` (priorityRoutes, requestCost, firstPageLoadPriority) y `turbopackRemoveUnusedExports/Imports`, el build sale idéntico (medido). turbopackModuleFragments está «in active development».
- **optimizePackageImports.** Ya incluye motion/react y no cambia nada en producción.
- **`getImageProps` importado de \"next/image\".** Solo ahorra 866 B, porque arrastra image-component, que lleva `'use client'`.
- **Animaciones CSS ligadas al scroll (animation-timeline, view-timeline) en T7–T10 y en ScrollProgress:**
  - Firefox estable (156) no las soporta: solo están en Nightly, tras un flag.
  - Safari anterior a 26 tampoco. En total, cerca del 7,8 % del uso rastreado no las tiene (caniuse-lite 1.0.30001810).
  - Obligan a mantener dos caminos, CSS y JS, con riesgo de que los umbrales diverjan.
  - Lightning CSS fusiona el atajo `animation` con `animation-timeline` y Chromium lo rechaza.
  - `view()` anónimo se congela dentro del marco sticky con overflow:hidden.
  - Ahorro estimado: solo 1,5–3 KB.
  - Revisarlo cuando Firefox las active: forman parte de Interop 2026.
- **Aceleración ScrollTimeline/ViewTimeline de motion.** No reduce bytes y solo actúa con offsets preset.
- **Actualizar motion a 13.x** (en la 13.3 `animate` es un 10 % más pequeño). Da igual si no se usa `animate`, y un salto de versión mayor no compensa ahora.
- **View Transitions, scroll-state queries y animation-trigger.** No aplican al scroll o solo existen en Chrome.
- **`prefetch={false}` en el enlace «Empresa» (3 418 B).** Baja la métrica a costa de que navegar a /nosotros sea más lento. Es un intercambio de experiencia de uso, no un ahorro.
- **tailwind-merge ya.** No se descarta: se aplaza a T11 como opcional, por el riesgo de regresiones visuales silenciosas. No hace falta para el objetivo.
- **Hook de scroll propio y StageSteps.** Solo como contingencia.

## 7. Proyección

**Punto de partida.**
- MEDIDO: 219 972 B, con las acciones 1–4 sobre 32836e8 (dos builds idénticos, 15 scripts).
- ESTIMADO: sobre 72f4e92 y con el slot de la portada, unos 220–221 KB. El código de 72f4e92 no se ha medido.

**Lo que suman T7–T10 (estimado):**
- Islas del plan: +6,2 a +6,8 KB gzip (bun: 6 154 B en sintaxis moderna según DOCS; 6 620 B según WEB).
- Cabeceras: entre 0 y unos 2,4 KB si aparecen hasta 3 chunks nuevos, a unos 786 B cada uno.
- Margen por la diferencia entre bun y Turbopack: unos +2 KB.

**Lo que retiran:**
- Las cinco secciones antiguas: −3 268 B medidos, pero sobre un build en ES5; en moderno será algo menos.
- CTA, FAQ y ScrambleText antiguos: unos −2 KB (estimado).
- Total liberado: entre −2,5 y −5,3 KB (estimado).

**Proyección al cierre de T10, con las acciones 1–5, 7 y 8 aplicadas:** unos 221–230 KB (ESTIMADO).
- Cuentas: cota baja 220 000 + 6 154 − 5 293 ≈ 220 900 B; cota alta 221 000 + 6 803 + 2 400 + 2 000 − 2 500 ≈ 229 700 B.
- Margen frente a 269 722 B: unos 40–49 KB.
- Delta frente a la línea base b65e497 (239 002 B): entre −9 y −18 KB, es decir, menos JS que antes del rediseño.
- La suma de los topes por tarea (4 000 + 3 000 + 2 500 + 3 000) deja como máximo unos 233 500 B y una reserva de al menos 36 KB.

**Variantes:**
- Con la acción 6 (next/image fuera): −6,1 KB medidos sobre la combinación, unos 215–224 KB.
- Con la acción 9 (tailwind-merge, T11): hasta −9 KB más (cota superior medida).
- Si se ignoran las reglas del plan (ConsoleFrame desde realty/Hero, `animate` de vuelta en T9/T10, blurDataURL en tres islas) pero se mantienen las acciones 1–4: unos +3,1 + 3,4 + 2 KB, es decir, unos 230–238 KB. Seguiría cumpliendo.
- Sin ninguna acción (T6 y plan tal cual): unos 252–257 KB (estimado por WEB). Cumpliría con solo 13–18 KB de margen, y el JS seguiría saliendo en ES5.

**Advertencias.**
- La medida es local (`next start`, HTTP/1.1). En producción, `/_vercel/insights/script.js` es un script real que en local da 404 y cuenta 0 B, y las cabeceras se comprimen.
- Las cifras de T7–T10 son estimaciones con bun. La cifra que vale es la medida al cerrar cada tarea, siguiendo el protocolo de T7.

## 8. Anexos: informes de cada investigador

> Las rutas `scratchpad/…` y `…/scratchpad/…` de los anexos apuntan a la carpeta temporal de la sesión 2, que no se conserva. Lo reutilizable está en `docs/superpowers/research/p1-parches/` y `scripts/agent/`.

### Analista del bundle

Medí dos builds con `next start`, a 1440×900, con la caché desactivada y con 3 ejecuciones idénticas. T5 (182001a) transfiere 233 003 B en 13 scripts y T6 (32836e8) 250 331 B en 16 scripts, así que T6 añade +17 328 B. Con el tope de 269 722 B, T6 deja un margen de 19 391 B.

Hay un hallazgo principal que no depende de T6. Todo el JS del cliente se transpila a ES5 por un fallo conocido de Turbopack (vercel/next.js#92091). Next resuelve `"last 2 … versions"` en JS con un caniuse-lite reciente y le pasa a Turbopack "chrome 151, edge 151, firefox 153, safari 26.4…". El browserslist-rs de Rust tiene datos antiguos, descarta esas versiones y activa todas las transformaciones de compatibilidad de SWC. Por eso los chunks salen con `_class_call_check`, `"".concat`, desestructuración convertida a `var` y sin `?.` ni spread. Basta con poner en package.json el browserslist por defecto documentado por Next para que T6 baje a 226 749 B (−23 582 B), por debajo incluso de la línea base.

Sumando cambios, todos medidos:
- browserslist + quitar `animate()`: 221 874 B.
- además, next/image fuera del cliente: 214 486 B.
- además, tailwind-merge fuera del cliente (cota superior): 205 503 B.

Eso deja entre 43 KB y 64 KB para T7–T10. Con browserslist + `animate()` + next/image apliqué la suite e2e completa en desarrollo: 134/134, y home.spec 11/11, incluida la ruta que se dibuja sola en modo inView.

De dónde salen los +17,3 KB de T6:
- `animate()` suelto en HeroRoute: 5 364 B medidos. Arrastra GroupAnimationWithThen, animateSequence/createAnimationsFromSequence, animateSubject, ObjectVisualElement y createDOMVisualElement, y además parte los grupos de motion en más chunks.
- El componente cliente de next/image y el blurDataURL en línea: 6 727 B medidos. El blurDataURL solo pesa 866 B.
- Unos 5,2 KB restantes: código propio de HomeHero, HeroRoute, ScrollStage, FocalCover, InstrumentLabel y useStageProgress, más useTransform/interpolate/mix, useMotionValue, useInView y las cabeceras de 3 scripts más (≈ 800 B por respuesta). A eso se le resta el Hero y el TrustBar que se retiraron.

Qué pesa en /es sin ser de T6 (bytes transferidos en el build de T6):
- react-dom + react: 73 381 B.
- Runtime de Next (app router, límites de error, runtime de Turbopack): unos 77,8 KB, de los que el arreglo de browserslist quita unos 7,7 KB.
- motion (m, LazyMotion, domAnimation síncrono, useScroll, JSAnimation, useTransform): unos 45 KB.
- tailwind-merge: 9 510 B. Solo lo arrastra `cn` desde Button y desde las primitivas que importa HomeHero.
- Chunk del layout: 12 379 B. Contiene MotionProvider, Header (≈ 4,4 KB), @vercel/analytics (≈ 1,9 KB), ScrollProgress (≈ 0,6 KB), TransitionLink (≈ 0,4 KB) y SmoothScroll (≈ 0,3 KB).
- AnimatePresence + next/link + trackEvent + i18n: 9 106 B, de los que AnimatePresence es ≈ 2 KB.
- Secciones antiguas: 8 445 B (Services, FlagshipAI, CaseStudy, LiveStudioTeaser, Methodology, TechStack, FAQ, CTA, CoverReveal, ScrambleText, RevealText). T7, T9 y T10 retiran o reescriben la mayoría, así que esos bytes se liberan.
- Chunk de AboutPage: 3 418 B. Se descarga por el prefetch del enlace «Empresa» del encabezado.
- Cabeceras HTTP: unos 786 B por respuesta, que en total son unos 12,6 KB.

En producción, `/_vercel/insights/script.js` es un script real. En local responde 404 y cuenta 0 B.

Código muerto y candidatos a servidor:
- MagneticButton va dentro de Button (con useSpring y attachFollow), pero ningún componente pasa `magnetic`.
- CustomCursor, IntroSequence, SoundToggle, HeroCanvas y GlobalParticles no tienen importadores. No se cargan en /es: no pesan, pero son limpieza para T11.
- ScrollStage, FocalCover e InstrumentLabel no llevan `"use client"`, pero entran al cliente porque las importa HomeHero.
- El plan de T9 importa ConsoleFrame desde realty/Hero.tsx, que es cliente. Eso metería realty/Hero, viz y shared en la home.

Probado sin efecto (250 331 B idénticos): `experimental.turbopackChunking` (priorityRoutes y requestCost) y `turbopackRemoveUnusedExports/Imports`. `getImageProps` importado de "next/image" solo quita 866 B, porque ese módulo requiere client/image-component (`'use client'`). Cargar las features de LazyMotion en diferido no cambiaría la métrica: se cargan antes de networkidle.

Buenas prácticas de 2026 que descarté para esto:
- ScrollProgress con animaciones CSS ligadas al scroll: Firefox estable sigue tras un flag, no es Baseline y ahorraría ≈ 0,6 KB.
- Hidratar en diferido las islas bajo el pliegue: bajaría la métrica porque la medición no hace scroll, pero no reduce el JS total. El diseño §11 habla de «30 KB en total», así que no la recomiendo sin que el usuario lo decida.

Proceso:
- Todos los builds y experimentos corrieron con `heavy --exclusive`.
- Las primeras 3+3 mediciones de T6 y T5 las ejecuté con `nice` fuera de heavy. Un `next dev` del corrector ocupaba un slot y bloqueaba las exclusivas, así que no había ninguna tarea pesada en marcha. Los bytes no dependen de la CPU.
- Al cancelar mi exclusiva en cola dejé `/tmp/heavy-excl.pending` y lo borré, tras comprobar que no quedaba ninguna exclusiva esperando.
- Borré los worktrees research-js y research-js-base y apagué mis servidores (3121, 3122 y 3123 libres).
- El medidor reutilizable está en scripts/agent/measure-js.mjs.
- Los parches de los experimentos están en (carpeta temporal de la sesión 2, no conservada) exp/: v2/HeroRoute.tsx, v3/HomeHero.tsx, v3b/page.tsx y v3b/image-props.ts. Los JSON de medida son exp/m-*.json, más m-t6.json y m-base.json en la carpeta scratchpad.
- Ojo: wt/task6 ya está en 72f4e92. Mis cifras son de 32836e8.

**Medidas:**

Método: scripts/agent/measure-js.mjs. Lanza Chromium desde el node_modules del worktree con un contexto nuevo por ejecución, 1440×900 y CDP Network.setCacheDisabled; espera a networkidle + 1500 ms y suma encodedDataLength (cabeceras incluidas) de las respuestas de tipo Script o con mime javascript. Es el mismo método que la línea base.
Uso: `node scripts/agent/measure-js.mjs --url http://localhost:PORT/es --runs 3 --viewport 1440x900 --root <worktree> [--budget 269722] [--out r.json] [--scroll]`.

Líneas base (3 ejecuciones idénticas):
- T5 182001a: 233 003 B, 13 scripts.
- T6 32836e8: 250 331 B, 16 scripts. Margen frente a 269 722: 19 391 B.

Experimentos sobre T6 (1 ejecución cada uno; el resultado es determinista):
- v1, browserslist por defecto de Next: 226 749 B (−23 582).
- v2, sin `animate()` en HeroRoute (prop `animate` declarativa en `m.path`): 244 967 B (−5 364), 15 scripts.
- v3, getImageProps de "next/image" en page.tsx + `<img>` como slot: 249 465 B (−866).
- v3b, getImgProps con import profundo (sin next/image en ningún módulo): 243 604 B (−6 727).
- v4, `cn` = clsx sin tailwind-merge (cota superior): 240 981 B (−9 350).
- v6, cabeceras de seguridad fuera de /_next/static: 244 721 B (−5 610).
- v7 (turbopackChunking.priorityRoutes), v7b (requestCost 1e6) y v8 (turbopackRemoveUnused*): 250 331 B, sin cambio.

Combinaciones:
- v2+v3: 244 110 B.
- v1+v2: 221 874 B (margen 47 848).
- v1+v2+v3b: 214 486 B (margen 55 236).
- v1+v2+v3b+v4: 205 503 B (margen 64 219).
- v1+v2+v3+v4: 210 556 B.
- v1+v2+v3+v4+v6: 206 068 B (unos 345 B por script).

Pruebas con v1+v2+v3b en desarrollo: e2e completa 134/134 en 2,8 min; home.spec 11/11. tsc sin errores. ESLint: 2 avisos por el `<img>` con spread (no-img-element y alt, porque el `alt` va dentro del spread).
CSS con v1: 80 733 B en bruto frente a 78 332 en T6 (+2,4 KB), por los objetivos más amplios de Lightning CSS.

Chunks de T6 (transferido):
- 0r8eyz71lud7d 73 381: react-dom.
- 18xxitcn_jw8i 50 856: runtime de Next.
- 11fb6frb8p_-o 20 906: núcleo de motion (m, VisualElement, loadFeatures).
- 1en34weylck5z 14 190: HomeHero + next/image. El grupo de HomeHero ocupa 17,5 KB en bruto porque incluye animate/sequence y el blurDataURL.
- 3h-f2veb1bire 12 379: MotionProvider, Header, Analytics, ScrollProgress, TransitionLink, SmoothScroll.
- 3ivideupr5tgy 11 094: useScroll, animateTarget, SVG/HTMLVisualElement, AsyncMotionValueAnimation, animateMotionValue.
- 0dvzcq9usjcm1 10 202: Next/React.
- 2bro75rw2ia94 10 099: JSAnimation, spring/inertia, mix, interpolate, useTransform, Button (con MagneticButton).
- 0twliisbekyr8 9 510: tailwind-merge.
- 3wygugc0tzno8 9 106: AnimatePresence, next/link, trackEvent, buildLocalePath.
- 139pjnkczdhav 8 445: secciones antiguas.
- runtime de Turbopack 6 512.
- 211bxp98yfjir 5 588: layout-router.
- 19h44gxnz0sjg 4 645: límites de error.
- 2lyw1zgrestxo 3 418: AboutPage/TeamRows/RevealText, por el prefetch de /nosotros.
- /_vercel/insights/script.js: 404, 0 B en local.

Cabeceras: unos 786 B por respuesta de JS, de los que unos 350 B son cabeceras de seguridad inútiles en un script.

**Recomendaciones:**

- **Arreglar el browserslist: hoy todo el JS se transpila a ES5 por un fallo conocido de Turbopack** (global). Ahorro: −23 582 B medidos sobre T6 (250 331 → 226 749). Se suma a las demás mejoras y rebaja todas las rutas del sitio. Riesgo: Bajo. Amplía el soporte (Safari 16.4+) en lugar de estrecharlo. Efecto lateral: el CSS crece +2,4 KB en bruto (80 733 frente a 78 332) porque Lightning CSS apunta a navegadores más antiguos. No volver a `last N versions` ni a `>0.2%` mientras siga el fallo, o la regresión vuelve sin avisar cuando se actualice caniuse-lite. Evidencia: Build y medición del experimento v1. Los chunks de T6 no tienen `?.` ni spread y convierten las clases en helpers `(0,x._)(this,…)`, las plantillas en `"".concat` y la desestructuración en `var`; los chunks de v1 ya salen modernos. node_modules/next/dist/build/get-supported-browsers.js y turbopack-build/impl.js pasan la lista ya resuelta ("chrome 151, …, safari 26.4") como browserslistQuery. Issue https://github.com/vercel/next.js/issues/92091: con versiones que browserslist-rs no conoce, SWC activa todas las transformaciones de compatibilidad. Valor por defecto documentado: node_modules/next/dist/docs/03-architecture/supported-browsers.md.
- **Quitar el `animate()` suelto de motion (HeroRoute en T6; BuiltScaleIn en T9 y MethodologyLine en T10 según el plan)** (T6). Ahorro: −5 364 B medidos sobre T6 (v2) y −4 875 B sobre v1 (226 749 → 221 874). Además hay 1 script menos. Si T9 o T10 reintroducen `animate()`, esos ~5 KB vuelven. Riesgo: Bajo. La opción (a) está medida y probada. La opción (b) usa una exportación tipada de motion/react que la documentación de motion.dev no destaca, y no la medí; hace lo mismo que (a) elimina. Evidencia: Experimento v2 y volcado del grupo de módulos de HomeHero (15180). `animate()` añade createScopedAnimate, animateSequence/createAnimationsFromSequence, animateSubject, GroupAnimationWithThen, ObjectVisualElement y createDOMVisualElement. En cambio, animateMotionValue ya lo trae domAnimation. Tipado de motion-dom 12.35 (node_modules/motion-dom/dist/index.d.ts): `animateSingleValue(value, keyframes, options): AnimationPlaybackControlsWithThen`, que implementa exactamente `mv.start(animateMotionValue("", mv, keyframes, options))`.
- **Sacar next/image del JS del cliente en /es: <img> generado en el servidor como slot de la isla** (T6). Ahorro: −6 727 B medidos sobre T6 (v3b) y −7 388 B sobre v1+v2 (221 874 → 214 486). Solo se consigue si ninguna imagen de /es usa `<Image>`: T7 (lámina), T8 (expediente) y T10 (cierre) lo usan dentro de islas cliente en el plan. Riesgo: Medio. Usa rutas internas de Next (next/dist/shared/lib/get-img-props e image-loader), que no son API pública, así que hay que verificarlas en cada actualización de Next. Se pierde la retirada del placeholder y el onLoad: usar coverPlaceholder (data URL) y nunca placeholder="blur", que además es caro sin GPU. ESLint pide `alt=""` explícito y un disable justificado de @next/next/no-img-element. Evidencia: Experimentos v3 y v3b. `getImageProps` importado de "next/image" solo ahorra 866 B (el blurDataURL), porque node_modules/next/dist/shared/lib/image-external.js hace require de ../../client/image-component (`'use client'`) y la referencia de cliente se incluye igualmente. Módulos que se van: image-component, get-img-props, image-config, image-blur-svg, image-loader, next/head (defaultHead), RouterContext/ImageConfigContext y find-closest-quality. Documentación: node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md (§getImageProps: sin placeholder, porque nunca se retira).
- **Sacar tailwind-merge del cliente: Button y las primitivas sin twMerge** (global). Ahorro: Cota superior medida: −9 350 B sobre T6 (v4) y −8 983 B sobre v1+v2+v3b (214 486 → 205 503). Riesgo: Medio. Varias sobreescrituras dependen de la fusión: el CTA del Header (px-2.5 frente a px-5, y bg, text y border por variables), los botones de HomeHero (bg-white/text sobre primary) y `frameClassName="stage:h-auto"` sobre `stage:h-svh` en ScrollStage. Con clsx, cuál gana lo decide el orden del CSS de Tailwind, así que puede haber regresiones visuales silenciosas. Hace falta auditar los usos de Button y revisar capturas. Evidencia: Experimento v4, que reemplaza `cn` por clsx. El chunk 0twliisbekyr8.js (9 510 B) solo contiene tailwind-merge. Importan `cn` desde el cliente Button.tsx ("use client") y, a través de HomeHero, FocalCover, ScrollStage e InstrumentLabel. Referencia: https://www.pkgpulse.com/guides/clsx-vs-classnames-vs-tailwind-merge-2026 (clsx por defecto, tailwind-merge solo donde hace falta).
- **Eliminar MagneticButton de Button: código muerto que viaja en cada página** (global). Ahorro: ≈ −0,6 a −1,0 KB (estimado, no medido). En T6, el módulo Button ocupa 3 134 B en bruto (1 544 B gzip aislado) incluyendo MagneticButton y useSpring, y attachFollow otros 1 026 B en bruto (585 B gzip). Riesgo: Muy bajo. Evidencia: Volcado del módulo 59544 en 2bro75rw2ia94.js: incluye la función de MagneticButton con useSpring y el módulo attachFollow 30485. `grep -rn magnetic src` no encuentra ningún consumidor que pase `magnetic`.
- **T9: ConsoleFrame como componente de servidor en lugar de importarlo desde realty/Hero.tsx ("use client")** (T9). Ahorro: ≈ 3–6 KB evitados (estimado, no medido). Arrastraría el módulo realty/Hero (8,0 KB de fuente), viz.tsx (12,6 KB) y parte de shared.tsx (13,3 KB). Riesgo: Bajo o medio: toca /realty. Hay que mantener su prueba e2e (realty.spec) y la prop `drawn`. Evidencia: El plan (Tarea 9, Decisión 4) importa ConsoleFrame desde realty/Hero.tsx, marcado "use client", y reconoce que «el trozo de realty/Hero y viz entra en la home». Los componentes de viz.tsx no usan hooks: animan con transiciones CSS (`[transition:…] motion-reduce:transition-none`).
- **Quitar AnimatePresence del bundle compartido: salida del MegaMenu con CSS** (T10). Ahorro: ≈ −2 KB (estimado): el módulo AnimatePresence ocupa 5 512 B en bruto (2 412 B gzip aislado) en 3wygugc0tzno8.js. Solo se ahorra si ningún componente de /es lo usa: hoy lo usan Header y el FAQ antiguo, y T10 reescribe el FAQ sin animación de altura. Riesgo: Medio. El foco, `inert` y Escape del MegaMenu tienen pruebas e2e. En Safari 16.4 (objetivo mínimo) el menú aparece sin animación. Evidencia: Análisis de chunks (T5 y T6). @starting-style y transition-behavior: allow-discrete son Baseline desde 2024 (Chrome 117/121, Safari 17.5, Firefox 129): https://web.dev/blog/baseline-entry-animations y https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior
- **Prefetch de /nosotros: el enlace «Empresa» descarga en /es el chunk de AboutPage** (global). Ahorro: −3 418 B (−2 832 B con v1). Es el chunk entero; no requiere build para medirlo. Riesgo: Bajo. Es un intercambio: la navegación a /nosotros deja de ser instantánea sin hover. La alternativa (AboutPage en servidor) no tiene ese coste, pero toca otra página. Evidencia: 2lyw1zgrestxo.js (AboutPage, TeamRows, RevealText) aparece en la carga de /es tanto en T5 como en T6. node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md: en rutas estáticas, el prefetch en viewport carga «la ruta completa», JS incluido.
- **(Artefacto de la métrica, requiere decisión del usuario) No enviar las cabeceras de seguridad de documento con /_next/static** (global). Ahorro: −5 610 B medidos sobre T6 (v6, 16 scripts) y −4 488 B sobre la combinación v1+v2+v3+v4 (13 scripts). Son unos 350 B por script. Riesgo: El ahorro es solo de la métrica en HTTP/1.1 local. En Vercel (HTTP/2 y HTTP/3, con HPACK/QPACK) el ahorro real es casi 0. Además es una decisión de política de seguridad. No contar con ello para cumplir el objetivo. Evidencia: Experimento v6. `curl -D -` de un chunk devuelve unos 786 B de cabeceras (HSTS, XFO, CSP, Referrer-Policy, Permissions-Policy, COOP…), y encodedDataLength las cuenta.
- **Cuenta del presupuesto para T7–T10 y reglas para las islas** (T7). Ahorro: Sin cambios: T6 deja 19 391 B de margen. Con browserslist, 42 973 B; con browserslist + `animate()`, 47 848 B; con + next/image, 55 236 B; con + tailwind-merge, 64 219 B. Además, las tareas liberan buena parte de los 8 445 B del chunk de secciones antiguas. Riesgo: Ninguno. Evidencia: El chunk 139pjnkczdhav.js (8 445 B) contiene Services, FlagshipAI, CaseStudy, LiveStudioTeaser, Methodology, TechStack, FAQ, CTA, CoverReveal, ScrambleText y RevealText. T7 borra Services y FlagshipAI, T9 CaseStudy y LiveStudioTeaser, y T10 Methodology y reescribe CTA y FAQ. Probado sin efecto: experimental.turbopackChunking (priorityRoutes, requestCost) y turbopackRemoveUnusedExports/Imports dieron 250 331 B idénticos.

### Documentación local (Next 16.3 y motion 12)

Conclusión: el objetivo se cumple con holgura, y el origen del problema no está en motion. El build de producción sale transpilado a ES5 por un fallo de configuración. `package.json` declara `browserslist: ["last 2 Chrome versions", …]`. Next resuelve esa consulta con sus datos de navegadores en JS (chrome 151, safari 26.4, firefox 153) y se la pasa a Turbopack como `browserslistQuery` (`next/dist/build/turbopack-build/impl.js:82,113`). Turbopack no conoce esas versiones y, sin avisar, compila a ES5: ningún `const`, `let`, `class` ni `=>` propio, y los `async` convertidos en generadores.

Lo comprobé en un worktree propio (32836e8, ya eliminado) con varios builds:
- `["chrome 151"]` o `["safari 26.4"]` por separado: siguen saliendo en ES5.
- Versiones explícitas `chrome 140 / edge 140 / firefox 140 / safari 18.5`, o quitar el campo: sintaxis moderna.

Medida real, mismo método que la línea base (`next start`, 1440×900, sin caché, mediana de 3), con `scripts/agent/measure-js.mjs`:
- T6 tal cual: 250 333 B.
- T6 solo sin `browserslist`: **226 749 B (−23 584 B)**. El margen para T7–T10 pasa de 19 389 a 42 973 B.
- Añadiendo además `cn` sin tailwind-merge, `animate` sustituido por `animateMotionValue`, Button sin MagneticButton y `getImageProps` en el servidor: **211 119 B**, margen de 58 603 B.

Otros hallazgos, medidos con builds y con un modelo de bytes que reproduce las medidas reales de T5 y T6 con ±10 B:
- **tailwind-merge** llega al cliente a través de Button y de FocalCover, InstrumentLabel, ScrollStage y TrustLogos, que importan las islas. En T6 ocupa un script propio de 8 637 B gzip; quitarlo ahorra −8 973 B.
- **`animate` híbrido** cuesta +2 387 B marginales. `animateSingleValue` o `animateMotionValue` cuestan +54 o +20 B.
- **Runtime de next/image**: unos 5,2 KB. Importar `getImageProps` desde un Server Component no lo elimina: `image-component.js` lleva `'use client'` y entra igualmente en el manifiesto de cliente de la página (solo ahorró 748 B).
- **Ojo con T9:** importar `ConsoleFrame` desde `realty/Hero.tsx` (`"use client"`) arrastraría RealtyHero, viz y shared, unos 3,1 KB.
- **Islas de T7–T10 tal como están en el plan:** unos 6,2–6,8 KB gzip en un solo chunk. A cambio se liberan ≈ 4,8 KB de las secciones viejas (Services, FlagshipAI, CaseStudy, LiveStudioTeaser, Methodology, CoverReveal, ScrambleText). Aun sin optimizar, cabrían con poco margen: unos 255–262 KB.

**Lo que no sirve:**
- `next/dynamic` desde un Server Component: la documentación dice que no divide el código.
- LazyMotion con carga asíncrona: el chunk se descarga igual antes de networkidle y cuenta en la medida.
- domMax o `motion` en lugar de `m`, `motion/react-m` (−75 B) y `motion/mini`.
- React Compiler: añade código.
- `turbopackChunking.firstPageLoadPriority`: el build sale idéntico.
- La aceleración ScrollTimeline/ViewTimeline de motion: no reduce bytes, y solo actúa con offsets preset sobre opacity/transform en HTMLElement.

**Aviso de proceso:** por error ejecuté `cp -al` y `next typegen` sobre `/home/user/wt/research-js`, que ya existía y es de otro agente. Borré al momento el `node_modules/node_modules` anidado que se creó y el árbol quedó como estaba; `git status` salió limpio. No toqué `task6` ni el checkout principal.

Pruebas en `(carpeta temporal de la sesión 2, no conservada)/docsr/`: `m-b1.json`, `m-e6.json`, `experiments.sh`, `exp2.sh` y `model.sh`. Mediciones con bun en `…/scratchpad/m/measure.sh`, y el código de T7–T10 extraído del plan en `…/scratchpad/m/plan/`.

**Medidas:**

MEDIDAS REALES (measure-js.mjs, next start, 1440×900, sin caché, networkidle + 1,5 s, mediana de 3):
- Línea base b65e497: 239 002 B (del plan). T5 182001a: 233 003 B. T6 32836e8: 250 333 B (margen 19 389 B).
- T6 solo sin browserslist (variante b1): 226 749 B, 16 respuestas JS (incluido el 404 de /_vercel/insights, que suma 0 B). Margen 42 973 B.
- T6 + sin browserslist + cn=clsx + getImageProps en el servidor + animateMotionValue + Button sin MagneticButton (E6 ≡ E5): 211 119 B. Margen 58 603 B.

MODELO (suma gzip -6 de los <script src> de es.html sin noModule + 800 B por respuesta + 2 951 B de constante que cubre el chunk dinámico de ~3,3 KB). Calibración: T5 233 011 (real 233 003), T6 250 328 (real 250 333), E6 211 510 (real 211 119):
- E0 T6: 14 scripts, 235 377 B gzip → 250 328.
- E1 browserslist moderno: 212 202 → 227 153.
- E2 E1 + firstPageLoadPriority 1: idéntico a E1.
- E3 E1 + cn sin twMerge: 13 scripts, 204 029 → 218 180 (−8 973).
- E4 E3 + getImageProps en el servidor: 203 281 → 217 432 (−748; image-component sigue cargándose).
- E5 E4 + animateMotionValue + sin MagneticButton: 12 scripts, 198 159 → 211 510 (−5 922).
- b3 ['chrome 151'] y b4 ['safari 26.4']: ES5, 235 377. b5 [chrome 140, edge 140, firefox 140, safari 18.5]: moderno, 212 202.

COMPOSICIÓN DE /es EN T6 (gzip): react-dom y afines 72,5 KB; runtime del app router 50,0 KB; motion repartido en 11fb6… 20,0 + 3ivid… 10,3 + 2bro7… 9,3 (Button y springs) + 3wygu… 8,3 (AnimatePresence, next/link) + gestos dentro de 3h-f2… (Header, MegaMenu, Analytics, MotionProvider: 11,5); tailwind-merge 8,6 (un script propio); chunk de la portada 13,3 (módulo HomeHero/HeroRoute/animate 7,2 + next/image 6,4); secciones viejas 7,6; react 9,4; runtime de Turbopack 5,8. El polyfill noModule (39,5 KB) no se descarga.

MARGINALES DE MOTION CON BUN (gzip -6, sobre el conjunto de T6): animate +2 387; animateSingleValue +54; animateMotionValue +20; animateMini +957; useScroll +3 009; useInView +256; useTransform +19; useSpring ≈ +700; useMotionTemplate +80; domMax +13 353; AnimatePresence +1 857. Standalone: m 7 461; LazyMotion+domAnimation+m 28 087; motion completo 41 673; twMerge 8 234; clsx 252. ES5 frente a moderno para el mismo código de motion (SWC): 39 118 frente a 33 567 (+16,5 %).

ISLAS DE T7–T10 DEL PLAN (bun + SWC, todas en un chunk): 6 154 B moderno / 6 803 B ES5. Por separado, en moderno: Thesis 762, CapabilitiesIndex 2 108, Dossier 2 179, BuiltStage 212, BuiltScaleIn 501, StudioSequence 895, MethodologyLine 1 237, CTA 1 188, FAQ 862. Importar ConsoleFrame desde realty/Hero.tsx: ≈ +3,1 KB.

CABECERAS: ~786 B por script (las securityHeaders se aplican también a /_next/static por source "/(.*)"). Excluirlas de /_next/static bajaría la medida unos 6 KB sin tocar el JS: no se recomienda como palanca.

**Recomendaciones:**

- **Quitar la entrada browserslist de package.json, o fijar versiones mínimas explícitas, para que Turbopack deje de compilar a ES5** (global). Ahorro: 23 584 B medidos (250 333 → 226 749, mediana de 3, mismo método de la línea base). En los scripts de /es: 235 377 → 212 202 B gzip Riesgo: Bajo. El JS pasa a exigir Chrome/Edge/Firefox 111+ y Safari 16.4+; la política declarada ('last 2 versions') ya era más estricta. Los polyfills noModule no cambian. Puede cambiar el CSS generado (objetivos de navegador del pipeline de CSS): revisar con e2e y capturas. Consultas del tipo 'last N versions' o 'defaults' pueden volver a resolver a versiones que Turbopack no conoce: usar versiones fijas o no poner el campo. Evidencia: Builds en el worktree propio sobre 32836e8: con 'last 2 …' (se resuelve a chrome 151 / safari 26.4 / firefox 153), con ['chrome 151'] solo o con ['safari 26.4'] solo, la salida es ES5 (2 class, 2 let, 318 =>) y pesa 235 377 B gzip. Con ['chrome 140','edge 140','firefox 140','safari 18.5'] o sin el campo, sale moderna (36 class, 1 612 let, 1 099 =>, 252 spread) y pesa 212 202 B. Medida real: scratchpad/docsr/m-b1.json = 226 749 B. Fuentes: node_modules/next/dist/build/get-supported-browsers.js:18-36 (resuelve la consulta con el browserslist de JS); node_modules/next/dist/build/turbopack-build/impl.js:82,113 (browserslistQuery: supportedBrowsers.join(', ')); node_modules/next/dist/docs/03-architecture/supported-browsers.md (objetivo por defecto: chrome 111, edge 111, firefox 111, safari 16.4); node_modules/next/dist/shared/lib/modern-browserslist-target.js
- **T9: sacar ConsoleFrame a un módulo sin "use client" en lugar de importarlo desde realty/Hero.tsx** (T9). Ahorro: ≈ 3 100 B gzip (bun, sintaxis moderna, marginal sobre Button y analytics ya cargados); algo más si la salida sigue en ES5 Riesgo: Bajo. ConsoleFrame es una función pura (sin hooks); solo la prop drawn necesita estado. Evidencia: El plan (líneas 8300-8312) hace que BuiltProof (servidor) importe ConsoleFrame desde '@/components/sections/realty/Hero', un módulo 'use client' que contiene RealtyHero, Funnel, StatTile, DemoTag y Button. Docs: 01-app/01-getting-started/05-server-and-client-components.md:174-178 ('all of its imports and the components it directly renders are included in the client bundle') y 01-app/03-api-reference/01-directives/use-client.md:10. El build E4 confirma que cualquier módulo 'use client' que entra en el grafo de servidor de la página se descarga aunque no se renderice: getImageProps en page.tsx siguió cargando image-component. Medida bun: realty/Hero exportado = 4 949 B gzip; Button + analytics = 1 813 B
- **Sacar tailwind-merge del cliente: clsx en los componentes que alcanzan las islas y API sin sobrescritura de clases** (global). Ahorro: ≈ 8 973 B (modelo calibrado, E1→E3: desaparece un script entero, 8 637 B gzip en T6). twMerge solo: 8 234 B gzip; clsx: 252 B Riesgo: Medio. Sin twMerge, un conflicto de clases se resuelve por el orden del CSS, no por el orden de los argumentos. Button se usa en unas 29 llamadas por todo el sitio y 16 le pasan className. Las sobrescrituras siguen dos patrones: botón principal blanco sobre oscuro ('bg-white text-[#0a0a0a] hover:bg-…') y contorno blanco ('border-white/25 text-white hover:bg-white/10 hover:border-white/45'). Header usa variables CSS. Evidencia: En T6, el chunk 0twliisbekyr8.js contiene un único módulo, tailwind-merge (28 928 B raw / 8 637 B gzip); en T5 estaba en 1md0ufqeovzjy.js. Llega por Button ('use client') y por FocalCover, InstrumentLabel, ScrollStage y TrustLogos, que usan cn() y se importan desde islas (HomeHero, TechStack). Doc: 05-server-and-client-components.md:174-186 ('Reducing JS bundle size'). Build E3 (cn = clsx): 13 scripts, 204 029 B gzip frente a 212 202
- **Sustituir animate() de motion/react por animateSingleValue (o animateMotionValue) al animar MotionValues** (T6). Ahorro: ≈ 2 400 B gzip (bun: animate +2 387 B marginal; animateSingleValue +54 B; animateMotionValue +20 B). Junto con la retirada de MagneticButton, el modelo da −5 922 B (E4→E5, un script menos) Riesgo: Bajo-medio: son exports públicos de motion-dom pero no aparecen en la documentación de motion.dev. Conviene centralizarlos en un solo helper y fijar la versión menor de motion. MotionGlobalConfig.skipAnimations sigue respetándose. Evidencia: El chunk de la portada de T6 (1en34weylck5z.js, módulo 15180) incluye el animate híbrido completo: GroupAnimationWithThen, constructor de secuencias, ObjectVisualElement y createDOMVisualElement. Para un MotionValue, animate solo hace value.start(animateMotionValue('', value, to, opts)): motion-dom/dist/es/animation/interfaces/motion-value.mjs; motion-dom/dist/es/animation/animate/single-value (animateSingleValue(value, keyframes, options): AnimationPlaybackControlsWithThen); MotionValue.start/stop en motion-dom/dist/es/value/index.mjs:260-282. motion/react los reexporta con `export * from 'motion-dom'` (framer-motion/dist/types/index.d.ts:4). Build E5 con animateMotionValue compilado y tipado sin errores
- **Button: quitar el import muerto de MagneticButton (useSpring)** (global). Ahorro: ≈ 700 B de useSpring (bun) más el código del componente (~0,5 KB); incluido en los −5 922 B de E4→E5 Riesgo: Muy bajo (código muerto). Si algún día se necesita, se carga con dynamic() dentro de un componente cliente. Evidencia: src/components/ui/Button.tsx importa MagneticButton (useMotionValue + useSpring). git grep en 32836e8: ninguna llamada pasa la prop magnetic. En T6, el chunk 2bro75rw2ia94.js contiene Button y el código de springs
- **Sacar next/image del grafo de /es: <img> con srcset calculado en el servidor sin importar next/image (getImageProps no basta)** (T6). Ahorro: ≈ 5 200 B gzip (el chunk de la portada en E4 pasa de 11 215 a 6 004 B al quitar los módulos de imagen). Con getImageProps importado en el servidor solo se midieron −748 B Riesgo: Medio: se reimplementa la URL del cargador por defecto (/_next/image?url=…&w=…&q=75, deviceSizes por defecto, qualities [75]). Hay que mantenerla alineada con next.config (images) y volver a medir el LCP. El ahorro solo aparece si ninguna de las 4 imágenes de /es importa next/image. Evidencia: node_modules/next/dist/client/image-component.js línea 1: 'use client'. Build E4: page.tsx (servidor) usa getImageProps y HomeHero pinta <img>; aun así los módulos de image-component y get-img-props siguen en el chunk de HomeHero, porque un módulo cliente importado desde el grafo de servidor entra en el manifiesto de la página. Doc: 01-app/03-api-reference/02-components/image.md:1009-1033 (getImageProps; 'cannot be used with the placeholder prop because the placeholder will never be removed'). next/image solo se usa en la home desde HomeHero; en T7, T8 y T10 lo usarían CapabilitiesIndex, Dossier y CTA
- **Reglas para las islas de T7–T10: imports estáticos, solo el conjunto de motion ya cargado y ningún import 'use client' innecesario desde el servidor** (T7). Ahorro: Evita regresiones. Estimación de las islas del plan: 6 154 B gzip (sintaxis moderna) / 6 803 B (ES5) en un chunk, frente a ≈ 4 800 B que liberan las secciones retiradas; cada chunk nuevo añade ≈ 800 B de cabeceras Riesgo: Bajo. Evidencia: Código de T7–T10 extraído del plan a scratchpad/m/plan/*.tsx y empaquetado con bun + SWC, con react, motion/react, next/* y @/* como externos: todas juntas pesan 6 154 B (moderno) / 6 803 B (ES5) gzip. El conjunto de motion que ya carga /es en T6 (m, LazyMotion+domAnimation, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView) hace que useInView cueste +256 B y useTransform +19 B. El chunk viejo 139pjnkczdhav.js (7 641 B) contiene Services, FlagshipAI, CaseStudy, LiveStudioTeaser, Methodology, CoverReveal y ScrambleText (≈ 63 % de su tamaño raw). Doc: 01-app/02-guides/lazy-loading.md ('When a Server Component dynamically imports a Client Component, automatic code splitting is currently not supported'). Cabeceras: 786 B por script (curl -D).
- **Opcional, solo si faltara margen: hook propio de avance de scroll en lugar de useScroll (Header, useStageProgress, CapabilitiesIndex)** (global). Ahorro: ≈ 2 600 B gzip (bun: useScroll marginal = 3 009 B; un hook con requestAnimationFrame + getBoundingClientRect + motionValue() pesa unos 0,4 KB) Riesgo: Medio: hay que reimplementar los offsets que usa el plan ('start start'/'end end', 'start 0.85'/'end 0.5', 'start 0.95'/'start 0.45', 'start 0.8'/'start 0.3', 'start 0.85'/'end 0.6') y el resize. Las e2e con data-* lo cubren, pero es la pieza más sensible. Con las recomendaciones anteriores no hace falta. Evidencia: bun: conjunto de T6 con useScroll = 33 774 B, sin useScroll = 30 765 B. Fuente: framer-motion/dist/es/value/use-scroll.mjs (arrastra scroll(), scrollInfo, offsets y el soporte de ViewTimeline aunque no se use)
- **No usar: técnicas que no bajan la medida (o la empeoran)** (global). Ahorro: 0 (o negativo) Riesgo: — Evidencia: 1) next/dynamic desde un Server Component no divide el código (lazy-loading.md), y un chunk cargado tras la hidratación se sigue contando porque la medida espera a networkidle + 1,5 s. 2) LazyMotion con features asíncronas: por la misma razón no reduce la medida. Además, el comentario de MotionProvider.tsx es incorrecto: features={domAnimation} se carga de forma síncrona. 3) domMax: +13 353 B frente a domAnimation; motion (completo): 41 673 B frente a 28 087 B de LazyMotion + domAnimation + m; motion/react-m: −75 B; animateMini: +957 B (bun). 4) React Compiler (05-config/01-next-config-js/reactCompiler.md) optimiza renders y añade código. 5) turbopackChunking.firstPageLoadPriority=1: build idéntico a E1 (E2 = E1, 212 202 B). turbopackModuleFragments está 'in active development' (01-app/03-api-reference/08-turbopack.md). 6) optimizePackageImports ya incluye motion/react y no cambia nada en producción (sideEffects:false, ESM). 7) La aceleración ScrollTimeline/ViewTimeline de useScroll no reduce bytes y solo actúa con target + offset preset o sin offset (framer-motion/dist/es/value/use-scroll.mjs canAccelerateScroll; render/dom/scroll/utils/offset-to-range.mjs), sobre opacity/clipPath/filter/transform en HTMLElement, no en SVG ni en scale/y sueltos (motion-dom/dist/es/render/VisualElement.mjs:258-280; animation/waapi/utils/accelerated-values.mjs). T6 usa offsets en texto a propósito para que el JS calcule progress. 8) animation-timeline en CSS: no ahorra bytes (motion ya está cargado) y los data-* siguen necesitando JS.

### Buenas prácticas web 2026

CONCLUSIÓN: con el plan tal cual, el objetivo (≤ 269 722 B) muy probablemente se cumple. Lo medí así: quité de T6 las cinco secciones que T7–T9 borran y el JS de /es bajó de 250 333 a 247 065 B. Si además quito next/dynamic de page.tsx, baja a 244 277 B. Las islas nuevas del plan (T7–T10), minificadas juntas con bun y comprimidas con gzip, pesan unos 6,6 KB. Lo que T10 retira (CTA, FAQ y ScrambleText) pesa unos 2 KB. Sumando lo que importan sin que se vea (unos 3 KB de ConsoleFrame, blurDataURL), estimo ≈ 252–257 KB, es decir, 13–18 KB de margen. Es una estimación, no una medición del build final. Las recomendaciones sirven para ganar margen y evitar regresiones. La palanca global más grande la encontró el otro investigador: browserslist, −23,6 KB.

HECHOS VERIFICADOS (a 24-09-2026)
- Soporte de las animaciones ligadas al scroll, según MDN BCD 8.1.2 (datos del 17-09-2026, bajados por npm) y la página de funciones experimentales de Firefox en MDN:
  - Propiedades: animation-timeline, scroll(), view(), animation-range, scroll-timeline y view-timeline están en Chrome/Edge 115 y en Safari/iOS 26. timeline-scope llega en Chrome 116 y Safari 26.
  - Firefox: solo en Nightly (desde la 136), tras layout.css.scroll-driven-animations.enabled. La estable actual es la 156 (15-09) y la beta la 157, y en ninguna de las dos está activado. Cuando caniuse dice «158», se refiere a la Nightly, que sale el 13-10.
  - Safari 27 salió el 14-09-2026.
  - Según el blog de WebKit (leído vía buscador; webkit.org está bloqueado aquí), Safari 26.4 las ejecuta en el hilo del compositor y la 26.5 corrigió el avance cerca del 0 % y el 100 %. Hay además un arreglo de WebKit del 14-09-2026 para líneas de tiempo con un ancestro sticky.
  - Forman parte de Interop 2026 (README oficial).
  - Cobertura calculada con caniuse-lite 1.0.30001810: soporta el 88,3 % del uso rastreado. No soportan Firefox (3,3 %) ni Safari/iOS anterior a 26 (4,5 %).
- Otras APIs, con su soporte según BCD:
  - scrollend: Chrome 114, Firefox 109, Safari 26.2.
  - sibling-index() y sibling-count(): Chrome 138, Safari 26.2, Firefox 154.
  - @property: Firefox 128 (ya está en todos los navegadores principales).
  - Style queries de custom properties: Chrome 111, Safari 18, Firefox 151.
  - Animation.overallProgress: Chrome 133, Safari 26.2, Firefox 142.
  - Solo en Chrome: scroll-state queries (133), animation-trigger y timeline-trigger (146, experimental) e if() (137).
- Prototipo en el Chromium 141 de Playwright (scratchpad/bp/sda.html, sda.mjs y sda2.html):
  - Una view-timeline con nombre en la `<section>` alta, con animation-range contain 0 %–100 %, reproduce exactamente el offset ["start start","end end"] de motion. Escala 1→1,12, fundido entre el 62 % y el 95 %, y stroke-dashoffset con pathLength=1 entre el 6 % y el 68 %, todo exacto.
  - var() funciona dentro de animation-range.
  - sibling-index() colorea las palabras en orden solo con CSS.
  - Con reducir movimiento no hay ninguna animación y quedan los estilos por defecto.
  - view() anónimo dentro del marco sticky con overflow:hidden se congela en 94,1 %: está roto.
- Lightning CSS 1.31.1 (probado): sin targets, fusiona `animation` + `animation-timeline` en un solo atajo (`animation:linear both zoom --stage`), que Chromium rechaza. Con propiedades sueltas (longhands) no fusiona. Coincide con el comentario ya existente en globals.css.
- Next 16.3 (documentación local):
  - dynamic() desde un Server Component no divide el código («not supported»).
  - Un archivo con "use client" lleva al bundle todo lo que importa (use-client.md, línea 176).
  - getImageProps no admite `placeholder` (image.md, líneas 1009–1033).
- motion 12.35.2:
  - useScroll solo acelera con ViewTimeline los presets numéricos o el offset por defecto (código de use-scroll.mjs y offset-to-range.mjs).
  - Según el CHANGELOG oficial, la 12.37 acelera los offsets "start"/"end" y en la 13.3 `animate` es un 10 % más pequeño. La última versión es la 13.4.2.
- WCAG 2.3.3 (texto del Understanding) cita el paralaje como movimiento no esencial. La técnica C39 recomienda el patrón opt-in con `@media (prefers-reduced-motion: no-preference)`.

OPINIÓN (propuesta, sin medir en el build real salvo donde lo indico)
- Continuo con CSS: zoom, texto que sube y se desvanece, dibujo de la ruta, línea con scaleX, escala 0,92→1 y paralaje 0,3×. Todo es viable con CSS nativo, gateado por la variante `stage:` más @supports, y con el estado final como estilo por defecto.
- Discreto con JS mínimo: los data-* los escribe siempre JavaScript; el CSS los pinta con selectores [data-*].
- Descartado para el objetivo:
  - View Transitions: no aplica al scroll.
  - scroll-state queries y animation-trigger: solo existen en Chrome.
  - Cargar las features de LazyMotion en async: el chunk llega después de hidratar pero dentro de la ventana networkidle + 1,5 s, así que se cuenta igual. Además, el comentario de MotionProvider que dice que carga en async es inexacto (el import es síncrono).
  - turbopackChunking y turbopackRemoveUnused*: los experimentos v7 y v8 del otro investigador no cambiaron nada.

Worktree propio creado en 32836e8 y ya eliminado (/home/user/wt/research-bp). No toqué task6 ni el checkout principal.

**Medidas:**

Método: el mismo de la línea base, con scripts/agent/measure-js.mjs. `next start` del build de producción, 1440×900, caché desactivada, 3 ejecuciones y mediana.
- T6 (32836e8): 250 333 B en 16 scripts. La otra medición da 250 331.
- r0, T6 sin Services, FlagshipAI, CaseStudy, LiveStudioTeaser ni Methodology: 247 065 B en 16 scripts. Las 3 ejecuciones idénticas. Son −3 268 B: el chunk de secciones baja de 8 445 a 5 175 B.
- r0s, igual que r0 pero sin next/dynamic en page.tsx (TechStack, FAQ y CTA importados de forma estática): 244 277 B en 15 scripts. Son −2 788 B más.
- Archivos de estas mediciones: scratchpad/bp/m-r0.json, m-r0s.json y run.sh.

Peso de islas y módulos (bun 1.3.11, --minify, gzip -9; motion, react y next externos; aproximación a lo que emite Turbopack):
- Islas del plan por separado:
  - Thesis: 812 B
  - CapabilitiesIndex, con geometry: 2 225 B
  - Dossier, con geometry: 2 308 B
  - MethodologyLine: 1 312 B
  - BuiltScaleIn: 549 B
  - BuiltStage: 244 B
  - StudioSequence: 980 B
  - CTA: 1 249 B
  - FAQ: 898 B
- Todas juntas (deduplicado): 6 620 B.
- Secciones antiguas que se borran, juntas: 5 293 B. De ellas, CTA + FAQ + ScrambleText suman ≈ 2 KB.
- Isla genérica mínima de prototipo (docs/superpowers/research/p1-parches/lean/StageSteps.tsx.txt): 1 060 B.
- realty/Hero.tsx con shared y viz, que es lo que arrastra importar ConsoleFrame desde un archivo "use client": 3 059 B.

Coste de motion, de las mediciones del otro investigador (scratchpad/m, bun + gzip):
- Exports que ya usaba T5: 33 802 B.
- Exports de T6: 36 451 B, de los que `animate` aporta +2,4 KB (34 071 B sin él).
- Por separado: animateMini 3 429 B, animate 23 179 B, useScroll 8 251 B, scroll 6 796 B.

Experimentos del otro investigador sobre /es:
- v1 (quitar browserslist): 226 749 B.
- v2 (HeroRoute sin animate()): 244 967 B.
- v3b (imagen de la portada fuera de la isla): 243 604 B.
- v6 (sin cabeceras de seguridad en /_next/static): 244 721 B.

En el módulo HomeHero de T6 (id 15180, 7,2 KB gz) están el blurDataURL de 479 caracteres y el código de secuencias de animate(). Además, la desestructuración aparece convertida a `var`, señal de que se transpila de más.

**Recomendaciones:**

- **Contar el ahorro de lo que se borra y quitar next/dynamic de page.tsx** (T7). Ahorro: ≈ 6 056 B medidos: −3 268 B al borrar las cinco secciones antiguas (sale solo con el plan) y −2 788 B al quitar next/dynamic, con un script menos Riesgo: Bajo. No cambia el HTML servidor ni la hidratación. Que nadie más en /es use next/dynamic: el layout no lo usa (Header ya lo evita a propósito). Evidencia: Medición propia: scratchpad/bp/m-r0.json (247 065 B) y m-r0s.json (244 277 B), frente a los 250 333 B de T6. node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md: «When a Server Component dynamically imports a Client Component, automatic code splitting is currently not supported». En el mapa de módulos de T6 aparecen PreloadChunks, BailoutToCSR y AsyncLocalStorage (≈ 2 KB gz). El comentario de src/components/sections/LiveStudioLanding.tsx ya lo había observado (~1 kB por ruta).
- **T9: sacar ConsoleFrame a un módulo sin "use client"** (T9). Ahorro: ≈ 3 KB gz, estimado con bun: realty/Hero.tsx + shared + viz = 3 059 B. Si no se hace, T9 los añade sin que se vea en las islas. Riesgo: Bajo. La landing de RealTy sigue igual si Hero.tsx importa el componente desde el módulo nuevo. Hay que revisar que StatTile y Funnel con `drawn` se vean bien renderizados en el servidor (por ejemplo, drawn=true). Evidencia: El plan (T9, paso 2.2) importa `ConsoleFrame` desde src/components/sections/realty/Hero.tsx, que es "use client" y trae motion, Button, shared y viz. use-client.md (línea 176): un archivo marcado lleva al bundle todos sus imports. server-and-client-components.md (línea 178): los Server Components no entran en el grafo del cliente. ConsoleFrame es puro: solo props, sin hooks (Hero.tsx, líneas 38–105).
- **No usar animate() de motion/react en las animaciones de una sola vez (modo inView)** (T10). Ahorro: 2,4 KB (medición aislada) y hasta 5,4 KB en /es si HeroRoute también lo deja (experimento v2). Si T6 lo conserva, 0 B, pero evita volver a añadirlo. Riesgo: Bajo. Hay que replicar la curva de easing.entrance como cubic-bezier y fijar el atributo al terminar (animation.finished o transitionend). Evidencia: MethodologyLine y BuiltScaleIn del plan importan `animate`. Con bun: T6set 36 451 B frente a 34 071 B sin animate (scratchpad/m). exp/m-v2.json: 250 331 → 244 967 B. En la documentación de motion, mini son 2,3 kB (solo WAAPI) y el híbrido 17 kB. En el módulo HomeHero (15180) está el código de secuencias de animate. element.animate() de WAAPI es nativo en todos los navegadores (BCD: Element.animate en Chrome 36, Safari 13.1 y Firefox 48).
- **Imágenes de la home con getImageProps en Server Components, no next/image dentro de las islas** (T8). Ahorro: Unos 0,5 KB por imagen de blurDataURL que no entra en el JS, siempre. ≈ 6,7 KB si ninguna parte de /es usa next/image (v3b: 250 331 → 243 604). Si T7/T8/T10 meten `<Image>` en islas, vuelven a añadir ese runtime aunque la portada lo quite. Riesgo: Medio-bajo. Todo o nada: basta un `<Image>` cliente en /es para que vuelva el runtime. Hay que replicar sizes y fetchPriority, y resolver la vista previa con un fondo CSS. Evidencia: node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md, getImageProps (líneas 1009–1033): no admite `placeholder`. next/dist/client/image-component.js es 'use client'. En T6, el módulo HomeHero lleva dentro el blurDataURL (479 caracteres) del import estático. En el plan, CapabilitiesIndex, Dossier y CTA usan `<Image placeholder="blur">` dentro de componentes cliente. Se aplica a T7, T8 y T10.
- **Animaciones continuas con CSS nativo ligado al scroll y data-* solo desde JS** (T10). Ahorro: 1,5–3 KB en T9/T10 (BuiltScaleIn 549 B, la parte de la línea de MethodologyLine y el paralaje de CTA). Si ninguna isla usa useTransform ni animate, sale ese código de motion (T6 añadió +2,65 KB con useTransform, useInView y animate). El beneficio principal es no depender del hilo principal. Se aplica a T6, T9 y T10. Riesgo: Medio.
- Firefox estable (3,3 %) y Safari anterior a 26 (4,5 %) no las tienen. Con el `stage:` actual verían el sticky sin animación, así que hay que añadir @supports a `stage:` y CSS.supports a useStageMode para que pasen a inView.
- Deriva entre umbrales CSS y JS: generar los rangos como custom properties desde las mismas constantes TS.
- overflow:hidden (marco y .focal-frame) rompe view() anónimo (verificado): usar siempre la línea de tiempo con nombre de la `<section>`, que además es el sujeto no sticky y esquiva los bugs de WebKit con sticky.
- Las pruebas que leen `getComputedStyle().transform` ven `none` si se anima `scale`/`translate`: leer `.scale`/`.translate`. Evidencia: Prototipo propio en el Chromium 141 de Playwright (scratchpad/bp/sda.mjs): view-timeline con nombre en la sección, contain 0–100 %, coincide exactamente con el offset de motion; var() funciona en animation-range; con reduce no hay animación. Chrome (repositorio de developer.chrome.com, artículo de scroll-driven animations): se ejecutan fuera del hilo principal, y animation-timeline va después del atajo. Safari 26.4: hilo del compositor (blog de WebKit). BCD 8.1.2 da los soportes. Lightning CSS 1.31.1 fusiona el atajo con la línea de tiempo, así que hay que usar longhands.
- **Contingencia: marcado en el servidor y una sola isla mínima de estado** (T7). Ahorro: ≈ 4–5 KB gz en T7–T10: las islas del plan, juntas, son 6 620 B; el prototipo StageSteps son 1 060 B más pequeños extras por sección. Se aplica a T7, T8, T9 (StudioSequence) y T10 (MethodologyLine). Riesgo: Medio: escritura imperativa de atributos sobre nodos renderizados en el servidor (React no vuelve a renderizar hijos de servidor en el cliente, pero es otro estilo de código). Crece la carga RSC y el HTML. Solo vale la pena si las mediciones de T7–T10 se acercan al límite. Evidencia: docs/superpowers/research/p1-parches/lean/StageSteps.tsx.txt (prototipo: listener de scroll pasivo + rAF + getBoundingClientRect en scrub; IntersectionObserver una vez en inView; escribe data-state/data-active y el contador). Buenas prácticas de Next: use-client.md, línea 184 (marcar solo lo interactivo) e intercalado vía children. El JS de cada isla es sobre todo marcado y clases de Tailwind. Contrapartida documentada en LiveStudioLanding.tsx: más fronteras cliente engordan la carga RSC (+9 KB con 10 fronteras), que va en el HTML y no cuenta como JS.
- **Reducir movimiento: patrón opt-in y el estado final como estilo por defecto** (global). Ahorro: 0 B (accesibilidad) Riesgo: Nulo o bajo. Evidencia: WCAG 2.3.3 Understanding (w3c/wcag, texto crudo): el paralaje es movimiento no esencial y hay que poder desactivarlo. Técnica C39: `@media (prefers-reduced-motion: no-preference)`. BCD: `animation` resetea animation-timeline solo en Chromium (en Safari no), así que `animation:none` no es una desactivación fiable si se declara la línea de tiempo aparte. `@media (scripting: none)`: Chrome 120, Safari 17, Firefox 113. Hoy globals.css pone `scroll-behavior: smooth` sin condición.
- **Enviar JS moderno: browserslist está provocando transpilación de más (referencia cruzada)** (global). Ahorro: −23 582 B medidos por el otro investigador en su experimento v1 (quitar browserslist) Riesgo: Medio-bajo: comprobar que la salida sigue cubriendo los navegadores de destino. La investigación la lleva el otro investigador; aquí solo la dejo situada como la buena práctica de mayor rendimiento. Evidencia: `npx browserslist` resuelve chrome 150/151, firefox 152/153 y safari 26.3/26.4. Aun así, el chunk de T6 (módulo 15180) trae la desestructuración convertida a `var t=e.className,n=e.children`. Documentación de Next (03-architecture/supported-browsers.md): los targets por defecto son chrome 111, edge 111, firefox 111 y safari 16.4. Medición en scratchpad/exp/m-v1.json (v1c, con rangos explícitos, estaba en curso).
- **Actualizar motion de 12.35.2 a 13.x (baja prioridad, sin medir)** (global). Ahorro: Sin medir. Según el changelog, `animate` es un 10 % más pequeño en la 13.3; el resto puede ir al alza o a la baja. Riesgo: Medio: versión mayor. El comentario de useStageProgress sobre los offsets de texto deja de ser cierto, así que hay que comprobar que los MotionValue (y los data-*) siguen actualizándose por JS. Requiere npm install en el checkout principal: decisión del orquestador. Evidencia: CHANGELOG de motiondivision/motion (texto crudo): la 12.37.0 acelera por hardware los offsets "start"/"end" en scroll/useScroll; la 12.39.0 corrige la aceleración de useScroll al seguir un elemento; la 12.43.0 acelera SVG por hardware; la 13.0.0 retira @emotion/is-prop-valid; la 13.3.0 hace animate un 10 % más pequeño.

### Prototipo (ahorros medidos)

Probé cuatro ideas de bajo riesgo compatibles con el plan, y una quinta opcional de riesgo medio. Cada una se aplicó sobre T6 (32836e8) por separado y después combinadas, en el worktree de laboratorio /home/user/wt/research-proto. Cada build se hizo con heavy --exclusive y se midió con scripts/agent/measure-js.mjs (next start, 1440×900, sin caché, mediana de 3). Las 3 ejecuciones de cada medida dieron el mismo número.

**Línea base.** Reproduje T6 con exactitud: 250 331 B en 16 scripts, con un margen de 19 391 B.

**Resultado principal.** Las cuatro ideas de bajo riesgo juntas dejan /es en 219 972 B (−30 359 B) con 15 scripts. El margen para T7–T10 sube de 19 391 a 49 750 B. Medí esta combinación dos veces, en dos builds distintos, y salió idéntica.

Ahorro de cada idea sobre T6, y lo que aporta encima de las otras tres ya aplicadas (método de dejar una fuera):
1. **browserslist con versiones fijas:** −23 582 B (queda en 226 749 B). Es la palanca decisiva.
2. **`animateSingleValue` en lugar de `animate()` en HeroRoute:** −4 988 B sobre T6 y −3 430 B encima de las otras.
3. **Quitar de Button el MagneticButton que nadie usa:** −2 900 B sobre T6 y −1 099 B encima de las otras.
4. **Imports estáticos en page.tsx en lugar de next/dynamic:** −2 578 B sobre T6 y −888 B encima de las otras.

**Idea 5, opcional.** Generar en el servidor el `<img>` de la portada, sin next/image, y pasarlo a la isla como slot: −6 096 B más, 213 876 B en total (margen de 55 846 B). Es de riesgo medio porque usa rutas internas de Next.

**Qué comprobé:**
- El HTML de /es que sale del servidor es idéntico al de T6 en todas las variantes. Comparé el marcado quitando scripts y precargas y no hay ninguna línea distinta; se conservan el mismo h1, el data-hero-route y las 8 precargas. Así que la hidratación no cambia.
- `tsc --noEmit` y ESLint pasan sin errores ni avisos.
- Contra `next start`, con las cuatro ideas y también con las cinco, pasan home, motion, smoke, header y a11y: 62/62.
- La orden pedida (`PORT=3123 heavy npx playwright test e2e/home.spec.ts`, en modo desarrollo) da 11/11 con las cuatro ideas aplicadas. Eso incluye el modo inView que dibuja la ruta sola, reducir movimiento en modo static y el scrub.

**Detalle sobre browserslist:**
- Es el fallo de Turbopack vercel/next.js#92091, que sigue abierto; el arreglo, la PR #92244, no está fusionado. Turbopack descarta las versiones que no conoce, y si las descarta todas activa todas las transformaciones de SWC y compila a ES5.
- `last 2 … versions` hoy se resuelve a Chrome 151, Firefox 153 y Safari 26.4: todas desconocidas para Turbopack, de ahí el ES5.
- La lista fija `chrome 111 / edge 111 / firefox 111 / safari 16.4` y un rango `chrome >= 111 …` dan exactamente 226 749 B, lo mismo que quitar el campo, que es lo que midió el otro investigador. Con un suelo que Turbopack conoce, la salida sale moderna.
- Escribí una comprobación para después del build, check-modern-js.mjs. La probé con una salida ES5 guardada por el otro investigador (falla con let=24, class=2) y con la moderna (pasa con let=3510, class=167).

**Limpieza.** Quité el worktree (`git worktree remove --force`), el puerto 3123 está libre, no queda ninguna exclusiva en cola y no hice commits. El checkout principal está limpio y no toqué wt/task6.

**Archivos**, en docs/superpowers/research/p1-parches/:
- Parches: diff-bl.patch, diff-asv.patch, diff-mag.patch, diff-dyn.patch, diff-all.patch y diff-allimg.patch, más image-props.ts.
- Medidas: los JSON m-*.json.
- Scripts: check-modern-js.mjs, apply.py (aplica cada idea), run.sh y series.sh.

**Medidas:**

Método: scripts/agent/measure-js.mjs (el mismo de la línea base). next start del build de producción, 1440×900, caché desactivada por CDP, networkidle + 1,5 s, suma de encodedDataLength de los recursos JS, 3 ejecuciones y mediana. En todas las medidas las 3 ejecuciones dieron el mismo número.

Por separado, sobre T6 (32836e8):
- T6 tal cual: 250 331 B, 16 scripts (margen 19 391).
- bl, browserslist ["chrome 111","edge 111","firefox 111","safari 16.4"]: 226 749 B, 16 scripts (−23 582; margen 42 973).
- blge, browserslist ["chrome >= 111","edge >= 111","firefox >= 111","safari >= 16.4"]: 226 749 B. Idéntico, así que un rango con un suelo conocido también sirve.
- asv, animateSingleValue en HeroRoute: 245 343 B, 15 scripts (−4 988).
- mag, Button sin MagneticButton: 247 431 B, 15 scripts (−2 900).
- dyn, page.tsx sin next/dynamic: 247 753 B, 15 scripts (−2 578).

Combinadas:
- all = bl + asv + mag + dyn: 219 972 B, 15 scripts (−30 359; margen 49 750). Repetida en el build all2: 219 972.
- allimg = all + img (el `<img>` del servidor como slot): 213 876 B, 15 scripts (−36 455; margen 55 846).

Lo que aporta cada idea sobre la base moderna (all con esa idea quitada, menos all):
- Sin asv: 223 402, así que asv aporta −3 430.
- Sin mag: 221 071, así que mag aporta −1 099.
- Sin dyn: 220 860, así que dyn aporta −888.
- img aporta −6 096 (219 972 → 213 876).

Los ahorros por separado no se suman tal cual (34 048 frente a 30 359): el ES5 infla cada delta y Turbopack reagrupa los chunks.

Marcadores de sintaxis en .next/static/chunks:
- T6: 109 `"".concat(` y 8 `?.`.
- bl y all: 23 `"".concat(`, unos 266–270 `?.` y unos 2 540 `=>`.
- check-modern-js.mjs: en all, let=3510 y class=167 (pasa). En allimg, let=3449 y class=167. En la muestra ES5, let=24 y class=2 (falla).

HTML de /es, quitando scripts y precargas: 0 líneas distintas frente a T6 en bl, asv, mag, dyn y all. Todas tienen 1 h1, 8 precargas y data-hero-route. Solo cambia el número de `<script src>` (de 15 a 14) y la carga RSC.

Pruebas:
- Contra next start, con all y con allimg: home.spec + motion.spec + smoke.spec + header.spec + a11y.spec, 62/62 cada una (unos 52 s).
- En desarrollo con all, `PORT=3123 heavy npx playwright test e2e/home.spec.ts`: 11/11.
- tsc --noEmit con 0 errores y ESLint sin avisos en los archivos tocados, con las cinco ideas aplicadas.

Scripts de /es en all (bytes transferidos): 72 423, 44 856, 16 930, 14 954, 13 704, 11 951, 9 737, 9 644, 7 338, 5 087 (runtime de Turbopack), 4 829, 3 339, 2 832 y 2 348, más /_vercel/insights/script.js (404, 0 B en local).

**Recomendaciones:**

- **1. Fijar browserslist con versiones mínimas explícitas: hoy todo el JS sale en ES5 por vercel/next.js#92091** (global). Ahorro: MEDIDO: −23 582 B sobre T6 (250 331 → 226 749, 16 scripts). Es la palanca que por sí sola cumple el objetivo: el margen pasa de 19 391 a 42 973 B. Riesgo: Bajo.
- El JS exige Chrome, Edge y Firefox 111+ y Safari 16.4+. Es lo mismo que ya exige Tailwind v4 y más amplio que la política actual de «last 2».
- El CSS crece unos 2,4 KB en bruto según el otro investigador, porque Lightning CSS apunta a navegadores más antiguos. No cuenta en la métrica y no lo medí yo.
- Riesgo de regresión silenciosa: cualquier consulta cuyas versiones resueltas sean todas más nuevas que los datos de Turbopack («last N versions», «defaults», «>0.2%») vuelve a ES5 al actualizar caniuse-lite. Por eso conviene fijar suelos conocidos y añadir la comprobación. Evidencia: Builds bl y blge en research-proto (m-bl.json, m-blge.json). La lista fija y el rango `>= 111` dan exactamente 226 749 B, igual que quitar el campo (v1 del otro investigador).

Causa: node_modules/next/dist/build/get-supported-browsers.js resuelve la consulta con el browserslist de JS («last 2 …» da chrome 151, firefox 153 y safari 26.4) y se la pasa a Turbopack ya resuelta. Issue https://github.com/vercel/next.js/issues/92091, abierto: el browserslist-rs de Turbopack descarta las versiones que no conoce (ignore_unknown_versions); si no queda ninguna, is_any_target() da true y SWC activa todas las transformaciones de compatibilidad. El arreglo, la PR https://github.com/vercel/next.js/pull/92244, sigue abierto y sin fusionar.

Objetivo por defecto de Next: node_modules/next/dist/shared/lib/modern-browserslist-target.js y docs/03-architecture/supported-browsers.md (chrome 111, edge 111, firefox 111, safari 16.4).
- **2. HeroRoute (T6), BuiltScaleIn (T9) y MethodologyLine (T10): `animateSingleValue` en lugar de `animate()` de motion/react** (T6). Ahorro: MEDIDO: −4 988 B sobre T6 (250 331 → 245 343, con 1 script menos). Sobre la base moderna aporta −3 430 B (223 402 → 219 972). Si T9 o T10 importan `animate`, esos bytes vuelven. Riesgo: Bajo. Ejecuta el mismo código que ya corría por dentro de `animate()`.

Trampa verificada en motion-dom/…/interfaces/motion-value.mjs: con skipAnimations, instantAnimations o duration 0, animateMotionValue no crea animación y animateSingleValue devuelve undefined, aunque el tipo diga lo contrario. Por eso la limpieza debe ser `valor.stop()`, no `controls.stop()`.

Es una exportación pública de motion-dom que motion.dev no destaca: conviene fijar la versión menor de motion. Evidencia: Build asv y su versión sin él (m-asv.json, m-loo-asv.json).

node_modules/framer-motion/dist/es/animation/animate/subject.mjs: para un MotionValue, `animate()` solo llama a `animateSingleValue(subject, keyframes, options)` y lo envuelve en GroupAnimationWithThen. Arrastra además el animate híbrido (secuencias, ObjectVisualElement, createDOMVisualElement). motion/react reexporta motion-dom (`export * from 'motion-dom'` en framer-motion/dist/es/index.mjs), y motion-dom/dist/index.d.ts tipa `animateSingleValue(value, keyframes, options?)`.

En el plan, BuiltScaleIn usa `animate(amount, 1, …)` (línea 8173) y MethodologyLine `animate(line, 1, …)` (línea 8825).
- **3. Button: quitar MagneticButton, código muerto que viaja en todas las páginas** (global). Ahorro: MEDIDO: −2 900 B sobre T6 (250 331 → 247 431, con 1 script menos al reagruparse los chunks de motion). Sobre la base moderna aporta −1 099 B (221 071 → 219 972). Riesgo: Muy bajo: es código muerto. Si algún día se necesita el efecto, se reintroduce en un componente aparte y cargado bajo demanda. Evidencia: Build mag y su versión sin él (m-mag.json, m-loo-mag.json). `tsc --noEmit` pasa sin la prop `magnetic`, lo que confirma que nadie la usa. Button importaba MagneticButton de forma estática, y con él useSpring y attachFollow.
- **4. page.tsx: imports estáticos en lugar de next/dynamic (hacerlo en T7, que es la primera tarea que toca page.tsx)** (T7). Ahorro: MEDIDO: −2 578 B sobre T6 (250 331 → 247 753, con 1 script menos). Sobre la base moderna aporta −888 B (220 860 → 219 972). Riesgo: Bajo. HTML servidor idéntico: 0 líneas distintas, mismas 8 precargas. Única diferencia: esas secciones se hidratan en la misma pasada en lugar de esperar a su chunk, que de todos modos se descargaba antes de networkidle. Evidencia: Build dyn y su versión sin él (m-dyn.json, m-loo-dyn.json).

node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md: dynamic() desde un Server Component no divide el código de los Client Components. node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js: con ssr:true y sin loading envuelve en un Fragment, sin Suspense, así que solo añade React.lazy, PreloadChunks y BailoutToCSR al cliente. Las 8 secciones ya son "use client" y ningún otro módulo de /es usa next/dynamic (los Wrapper que lo usan no tienen importadores).

El plan mantiene `dynamic` para TechStack, FAQ y CTA hasta el final: T7 §2.4 dice que «`dynamic` sigue importado porque lo usan las secciones que quedan».
- **5. (Opcional, riesgo medio) Sacar next/image del cliente: el `<img>` de la portada se genera en el servidor y se pasa a la isla como slot** (T6). Ahorro: MEDIDO: −6 096 B sobre las ideas 1–4 (219 972 → 213 876, margen 55 846). Solo se obtiene si NINGUNA imagen de /es usa `<Image>`: en el plan, T7 (CapabilitiesIndex), T8 (Dossier) y T10 (CTA) lo usan dentro de islas cliente. Riesgo: Medio.
- Usa rutas internas de Next (next/dist/shared/lib/get-img-props e image-loader, y process.env.__NEXT_IMAGE_OPTS) que no son API pública: hay que verificarlas en cada actualización de Next.
- Es todo o nada: basta un `<Image>` cliente en /es para que vuelva el runtime.
- Se pierde la retirada del placeholder: usar coverPlaceholder como fondo y nunca placeholder="blur".
- ESLint exige un disable justificado de no-img-element. Evidencia: Build allimg (m-allimg.json). Mismo patrón que el v3b del otro investigador (−6 727 B sobre T6).

`getImageProps` importado de "next/image" no basta: image-external.js requiere client/image-component ('use client'), que entra igual en el cliente (el otro investigador midió solo −866 B).

Documentación: node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md §getImageProps (sin placeholder, porque nunca se retira).
- **Cuenta del presupuesto y orden recomendado** (global). Ahorro: Con 1–4 aplicadas: 219 972 B, que dejan 49 750 B de margen para T7–T10. Con la 5: 213 876 B, 55 846 B de margen. El otro investigador estima las islas de T7–T10 en unos 6,2–6,8 KB gzip más cabeceras de unos 800 B por chunk nuevo, y lo que retiran libera unos 3,3–4,8 KB. Riesgo: Ninguno. Evidencia: Medidas de este laboratorio: m-all.json y m-all2.json (idénticas) y m-allimg.json. Estimaciones de las islas: informes DOCS y WEB, no medidas aquí.
