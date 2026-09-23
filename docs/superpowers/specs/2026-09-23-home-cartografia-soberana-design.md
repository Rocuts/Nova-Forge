# Home "Cartografía soberana" — Fase 1

**Fecha:** 2026-09-23
**Rama:** `redesign/home`
**Estado:** diseño aprobado por secciones en conversación; pendiente de revisión de este documento.

---

## 1. Objetivo

Llevar la home de Orbexs a un nivel visual comparable con Palantir, Helsing o Scale AI, **con identidad propia**: imágenes, movimiento guiado por el scroll y una narrativa clara, sin cambiar la identidad de color de Orbexs y sin afirmaciones que no podamos respaldar.

**Éxito significa:**
- En los primeros 5 segundos se entiende qué es Orbexs: infraestructura de IA para gobiernos y empresas.
- La home deja de ser texto sobre blanco. Tiene una pieza visual fuerte en la portada y movimiento con propósito al bajar.
- Todo respeta el design system Orbexs (monocromo, Geist, radios, sin sombras) y las reglas de CLAUDE.md.
- Se corrigen los problemas críticos de la auditoría que afectan a la home y al SEO.
- Rendimiento: LCP < 2,5 s en build de producción local, CLS < 0,1, sin bloquear el hilo principal.

## 2. Decisiones tomadas

**Dichas por el usuario:**
1. Tesis de la home: **Orbexs = infraestructura de IA para gobierno y empresas.** RealTy y Live Studio aparecen como pruebas de que construimos productos reales, no como mensajes que compiten.
2. Imágenes generadas por el usuario en ChatGPT (GPT Image) a partir de prompts escritos por Claude, y dejadas en el proyecto.
3. **La identidad de color no cambia.** Todo en la paleta monocroma de Orbexs.
4. Alcance fase 1: home completa + arreglos críticos de auditoría. Resto del sitio en fase 2.
5. Animaciones con `motion` (ya instalado) + CSS `sticky` + SVG. Sin GSAP ni librerías de scroll.
6. El caso de la mesa de ayuda autónoma se hizo **para Orbexs Live Studio, que es propio**. Se declara así.
7. Estructura de la home, sistema visual y lista de arreglos aprobados tal como se describen abajo.

**Supuestos (corregibles):**
- Se mantiene el copy existente salvo donde este documento indica un cambio.
- El inglés replica el español; el español es la versión de referencia.
- No se publica nada en Vercel ni se toca `main` sin aprobación explícita.

## 3. Alcance

### Dentro (fase 1)
- Nueva home (`src/app/[locale]/page.tsx`) con 9 secciones (§5).
- Navegación: "Servicios · Productos · Empresa" (§6).
- Pipeline de imágenes (§7).
- Imágenes para redes y metadatos Open Graph por página y por idioma (§8).
- Arreglos de auditoría (§9).
- Pruebas nuevas y ajustes a las existentes (§12).

### Fuera (fase 2)
- Rediseño visual de las páginas de producto, Nosotros, Inversores, RealTy y Live Studio. B1 (arquitectura de ladrillo) queda reservada para RealTy o Nosotros.
- Copy de riesgo fuera de la home y de Extracción de datos: "<60 s" (Live Studio, `es.ts:854`) y "crecimiento exponencial" (`es.ts:1047`).
- "Agendar" con formulario real o cal.com (hoy abre WhatsApp y muestra "Solicitud enviada").
- Codemod de tokens (hex escritos a mano: `#0a0a0a` ×182, etc.).
- Eliminar código muerto 3D (three.js, partículas, cursor, sonido, intro) y sus dependencias.
- Actualizar AGENTS.md, plan.md, README y docs/architecture-3d.md.
- Icono de Apple en PNG, `TransitionLink` que rompe cmd-click, `sameAs` verificados.
- Dominio y despliegue: `orbexs.tech` no resuelve DNS y `orbexs-alpha.vercel.app` da 404 (a revisar con el equipo, no es código).

## 4. Identidad visual

### Color
Solo tokens existentes del design system Orbexs:

| Uso | Valor |
|---|---|
| Fondo oscuro | `#0a0a0a` (elevado `#141414`, borde `#1a1a1a`) |
| Fondo claro | `#ffffff` / `#f8f8f8` (borde `#e5e5e5`) |
| Texto | `#0a0a0a`, `#525252`, `#a3a3a3` / en oscuro `#ffffff`, `#a3a3a3` |
| Acento | `#2563eb` |

**Regla del azul:** `#2563eb` significa **"lo que el sistema está procesando ahora"**. Se usa solo en: el punto final de la ruta de la portada, el nodo activo en Capacidades y el campo que se está extrayendo en el expediente. **Nunca hay más de un elemento azul visible a la vez.** Todo lo demás que se dibuja con código es blanco sobre oscuro o `#0a0a0a` sobre claro.

### Tipografía
Geist / Geist Mono, escala fluida del design system. **Capa de instrumento:** Geist Mono 10–11 px, mayúsculas, `tracking-[0.3em]`, color `#a3a3a3`. Se usa para índices (`/01`), contadores de avance en secciones fijas (`02 / 04`), eyebrows y la etiqueta "Imagen ilustrativa".

### Imágenes
- Todas en **escala de grises neutra**; el pipeline elimina cualquier tinte (§7).
- Las oscuras se funden con `#0a0a0a` en los bordes mediante degradados, sin cortes visibles.
- Sin grano, sin glow, sin sombras.
- Toda imagen generada con IA lleva la etiqueta "Imagen ilustrativa" (o "Ilustración · datos ficticios" si muestra datos) en la capa de instrumento.
- **Nunca** se generan con IA fotos del equipo, de clientes ni de despliegues.

| Archivo fuente | Contenido | Uso |
|---|---|---|
| `design/source/relieve.png` | Relieve andino nocturno con curvas de nivel (ex A1-v2) | Portada, cierre, fondo de imágenes para redes |
| `design/source/lamina.png` | Lámina cartográfica blanca de un valle con río (ex A2-v2) | Capacidades |
| `design/source/expediente.png` | Expediente con formularios en español (ex C1-v2) | Del papel al dato |
| `design/source/arquitectura.png` | Arquitectura de ladrillo con luz rasante (ex B1) | Fase 2 |

Todas miden 1536×1024 (el máximo de ChatGPT).

## 5. Estructura de la home

Orden, contenido y comportamiento. "Fija" = `position: sticky` dentro de un contenedor más alto que el viewport; el avance del scroll dentro del contenedor (0→1) controla la animación.

**Reglas comunes a todas las secciones animadas:**
- Solo se animan `transform`, `opacity` y `pathLength` de SVG.
- **Reducir movimiento:** estado final estático, sin sticky, sin zoom.
- **Móvil (< 768 px):** sin sticky; las animaciones se disparan al entrar en pantalla (`whileInView`, una vez).
- Los títulos (`h1`, `h2`) se renderizan visibles desde el servidor; nunca empiezan con `opacity: 0` ni `visibility: hidden`.
- Las superposiciones SVG usan `viewBox="0 0 1536 1024"` y `preserveAspectRatio="xMidYMid slice"`, igual que la imagen con `object-fit: cover`, para que siempre coincidan con la imagen en cualquier proporción de pantalla.

### 5.1 Portada — `#inicio` (oscuro)
- **Fondo:** `relieve` a pantalla completa (`100svh`), carga prioritaria (es el LCP).
- **Contenido:**
  - Eyebrow: `/0.1 · INFRAESTRUCTURA DE MISIÓN CRÍTICA`
  - H1 fijo (deja de rotar): **"Construimos soberanía digital."**
  - Descripción actual (`hero.description`).
  - CTA primario "Iniciar Consulta Técnica" → `/diagnostico`; secundario "Ver Capacidades de Ingeniería" → `#capacidades`.
  - Enlace secundario "Ver casos de uso para sector público" → **`#gobierno`** (antes iba a una página de producto genérica).
  - Fila de índice al pie, en mono: `/01 IA SOBERANA · /02 DEFENSA CIBERNÉTICA · /03 OPERACIONES AUTÓNOMAS · /04 SISTEMAS CRÍTICOS` (sale de `titleRotating`).
  - "Imagen ilustrativa" y "Desplazar ↓" en mono, esquinas inferiores.
- **Al bajar** (contenedor de 160 svh, portada fija):
  - La imagen escala de 1,00 a 1,12.
  - Una ruta SVG blanca de 1 px se dibuja sobre una cresta (`pathLength` 0→1) y termina en un punto **azul** que aparece al final.
  - El bloque de texto sube a la mitad de velocidad del scroll y se desvanece en el último 30 %.
  - Un degradado a `#0a0a0a` crece en el borde inferior para empalmar con la sección siguiente.

### 5.2 Tesis (claro)
- Frase grande (tamaño H1): *"Diseñamos, desplegamos y operamos sistemas de software, inteligencia artificial y ciberseguridad para organizaciones donde la falla no es una opción."* (de `services.description`).
- **Al bajar:** cada palabra pasa de `#a3a3a3` a `#0a0a0a` en orden (texto real en el DOM; solo cambia el color).

### 5.3 Capacidades — `#capacidades` (claro)
- **Izquierda:** lista-índice de los 8 servicios, al estilo Palantir.
  - Cada ítem muestra el número `/01`–`/08` en mono, el nombre en grande y una línea gris con su `benefit`.
  - Cada ítem es un enlace a su página.
  - Las viñetas (`bullets`) no se muestran en la home.
- **Derecha:** `lamina` fija, con una red SVG superpuesta de 8 nodos:
  - Cuando el ítem N cruza el centro del viewport, se enciende el nodo N (círculo `#0a0a0a`) y se traza la línea que lo une con el nodo N−1.
  - El nodo del ítem activo es **azul**.
  - Al terminar la lista, la red queda completa en negro, sin azul.
- Contador mono `0N / 08`.
- **Móvil:** la lámina va arriba, sin fijar, y los nodos se encienden a medida que cada ítem entra en pantalla.

### 5.4 Del papel al dato — `#gobierno` (oscuro)
- **Fondo:** `expediente` fijo (contenedor de 250 svh).
- **Al bajar**, para 6 campos del formulario (coordenadas medidas sobre la imagen de 1536×1024):
  - Un recuadro de 1 px se dibuja alrededor del campo: primero **azul** mientras "se procesa", después blanco.
  - En un panel lateral (`#141414`, borde `#1a1a1a`) aparece la fila correspondiente: nombre del campo en mono + estado "Extraído".
- Contador `Campos extraídos 0N / 06`. Etiqueta "Ilustración · datos ficticios".
- **Copy:**
  - Eyebrow: `GOBIERNO Y DATOS`
  - Título: **"Del expediente al dato estructurado."**
  - Texto: *"Automatizamos trámites y registros: los documentos entran, cada campo se identifica y se valida, y cada dato queda con su trazabilidad."*
  - Enlaces: "Automatización de gobierno →" y "Extracción de datos →".
- **Móvil:** imagen arriba y panel debajo; las filas aparecen al entrar en pantalla.

### 5.5 Lo que ya construimos — `#construido` (oscuro)
- Eyebrow `PRODUCTOS PROPIOS`, título **"Productos que ya construimos."**
- **Tarjeta RealTy:**
  - Nombre, `realty.hero.title` y su `statusLine`.
  - Vista reducida de la consola de RealTy, reutilizando el componente real que ya usa la portada de `/realty`.
  - Etiqueta `demoLabel` ("Datos de demostración") una sola vez en el marco.
  - Enlace "Conocer RealTy".
  - **Al entrar**, la tarjeta pasa de escala 0,92 a 1.
  - Aplican todas las reglas de RealTy de CLAUDE.md: sin jerga técnica y "simulado" junto a retenciones.
- **Tarjeta Live Studio (caso):**
  - Título "Mesa de ayuda autónoma para producción en vivo".
  - Frase nueva: **"Lo construimos primero para nuestra propia división, Orbexs Live Studio."**
  - Contexto, solución y resultado actuales, resumidos.
  - Las 6 capacidades del agente como secuencia numerada `01`–`06` que se enciende al bajar. **No** se presentan como registro de eventos reales.
  - Enlaces "Conocer Fuerza Digital" y "Conocer el estudio".

### 5.6 Metodología — `#metodologia` (claro)
- Contenido actual (5 fases).
- **Al bajar:** una línea horizontal de 1 px se dibuja de izquierda a derecha, y cada fase pasa de gris a negro cuando la línea la alcanza.
- **Móvil:** línea vertical.

### 5.7 Tecnologías — `#tecnologias` (gris claro `#f8f8f8`)
- Contenido actual de `techStack` + la fila de logos "Construimos con" (AWS, Google Cloud, Azure, OpenAI), que sale de debajo de la portada.
- Se conserva la nota de que Orbexs no ostenta esas certificaciones.

### 5.8 Preguntas frecuentes — `#faq` (claro)
- Mismo contenido, salvo el arreglo de "clearance" (§9.2).
- El JSON-LD `FAQPage` se sigue generando desde `dict.faq.items`.
- Se corrige el `<h3>` dentro de `<button>`: el botón pasa a estar dentro del encabezado.

### 5.9 Cierre (oscuro)
- **Fondo:** `relieve` con otro encuadre (zona inferior), con desplazamiento lento (0,3× el scroll).
- Copy actual: "Hablemos de su próximo sistema." + CTA "Agendar Evaluación".

### Sale de la home
- `TrustBar` bajo la portada (pasa a 5.7).
- `FlagshipAI` (repetía servicios; el contenido vive en `/soberania-ia`).
- `CaseStudy` y `LiveStudioTeaser` separados (se unen en 5.5).
- ScrambleText en títulos.

Los componentes eliminados solo los usa `src/app/[locale]/page.tsx`: se borran.

## 6. Encabezado y navegación

- **Nav:** `Servicios · Productos · Empresa`.
  - "Servicios" y "Productos" abren el mismo mega menú.
  - El mega menú gana una columna **PRODUCTOS** (RealTy, Live Studio).
  - RealTy sale de la columna Plataforma.
  - Se elimina el placeholder `children: [{ name: "", href: "" }]`.
  - Live Studio pierde el punto magenta en la nav (sigue con su identidad cian/magenta en su propia página).
- **Tema del encabezado:**
  - **Estado inicial correcto sin JavaScript:** CSS con `:has()` detecta si la página empieza con una sección oscura (`[data-header-theme="dark"]` como primera sección) y pinta el encabezado transparente con texto blanco.
  - Después de hidratar, `useDarkSectionDetection` toma el control y **se vuelve a suscribir en cada cambio de ruta** (dependencia de `usePathname()`).
- **Visible desde el servidor:** se quita `initial={{ y: -100 }}`.
- **Accesibilidad del mega menú:**
  - Textos `#525252` sobre `#0a0a0a` → `#a3a3a3`.
  - Los botones que lo abren llevan `aria-expanded` y `aria-controls`.
  - Escape lo cierra y el foco vuelve al botón que lo abrió (se agrega si falta).
- **Footer:** agrega las 3 "Soluciones" y una columna o fila de Productos coherente con la nav.

## 7. Pipeline de imágenes

- **Fuentes:** `design/moodboard/*` se mueve a `design/source/` con los nombres de §4, convertidas a **PNG en escala de grises de 8 bits** (un canal, aprox. 1/3 del peso).
- **Script:** `scripts/process-images.mjs` (se ejecuta con `npm run images`), con `sharp` como `devDependency`, fijado a la versión que ya trae Next (0.35.x).
  1. Escala de grises neutra.
  2. `lamina`: estiramiento de niveles para que el papel sea `#ffffff` exacto (percentil 95 → 255).
  3. Escalado a 2560 px de ancho (lanczos3).
  4. Salida a `public/images/home/{relieve,lamina,expediente}.jpg` (mozjpeg, calidad 88) y `public/images/og/relieve-og.jpg` (1200×630).
- **Entrega:** `next/image` con `sizes` correctos y `placeholder="blur"`. En `next.config.ts`: `images.formats = ["image/avif", "image/webp"]`. Se mantiene la calidad por defecto de Next 16 (`qualities: [75]`), suficiente para imágenes en gris.
- La imagen de portada usa `loading="eager"` + `fetchPriority="high"`. En Next 16 `priority` está obsoleto, y la documentación (`02-components/image.md`) recomienda esto por encima de `preload`.
- **Presupuesto:** imagen de portada ≤ 250 KB en AVIF a 1920 px de ancho.

## 8. Imágenes para redes y metadatos

- **Helper nuevo** `pageMetadata({ locale, internalPath, title, description })` en `src/lib/metadata.ts`. Devuelve:
  - `title` y `description`;
  - `alternates` (vía `buildAlternates`);
  - `openGraph` con `title`, `description`, `url` canónica, `locale` y `alternateLocale` (la imagen la inyecta la convención de archivos);
  - `twitter`.

  Lo usan **todas** las páginas en `generateMetadata`. El layout deja de fijar `og:title = "Orbexs"` y `og:url` de la home para todos.
- **Imagen por página y por idioma:**
  - Se genera con `next/og` a partir de `relieve-og.jpg` + eyebrow + título de la página en su idioma + logo Orbexs (el `BrandLogo` en SVG).
  - Se elimina el monograma **"NF"** que quedó de NovaForge en `src/lib/social-image.tsx`.
  - **Implementación:** la convención de archivos de Next 16. En Next 16, `opengraph-image.tsx` recibe `params` desde la raíz hasta su segmento (`01-metadata/opengraph-image.md`), así que recibe el `locale`.
    - Cada ruta tiene su `opengraph-image.tsx` y `twitter-image.tsx`: `[locale]/` para la home y `[locale]/<slug>/` para las demás.
    - Cada uno es un archivo de pocas líneas que llama a `renderPageSocialImage({ locale, internalPath })` en `src/lib/social-image.tsx`. Esa función lee título y eyebrow del diccionario.
    - Se eliminan `src/app/opengraph-image.tsx` y `src/app/twitter-image.tsx`, y `images` explícito del layout, para que la convención mande.
    - `pageMetadata()` no fija `images`.
- **Logo:** `public/logo.svg` (a partir de `BrandLogo`) y `public/logo.png` (512×512). `siteConfig.images.logo` → `/logo.png` para el JSON-LD `Organization`.

## 9. Arreglos de auditoría

### 9.1 Copy de riesgo en Extracción de datos (`dataExtraction`, es y en)
Solo se reformulan afirmaciones con capacidades que el mismo sitio ya declara en otras partes. No se agregan capacidades nuevas.

| Ubicación | Antes (es) | Después (es) |
|---|---|---|
| `features[2]` | **Infraestructura de Proxies Global:** "Red global de proxies residenciales para recolección continua sin bloqueos." | **Portales y Registros Públicos:** "Extracción desde portales gubernamentales, registros públicos y documentos escaneados." |
| `features[3]` | **OSINT e Inteligencia de Amenazas:** "Recolección sistemática de foros, redes sociales y superficies de la dark web para agencias de inteligencia." | **OSINT de Fuentes Abiertas:** "Recolección sistemática de medios, foros y redes sociales públicas para análisis de riesgo y reputación." |
| `capabilities[0].items` | "Red Global de Proxies", "Renderizado Headless Browser", "Resolución Automática de CAPTCHAs" | "Colectores Programados", "Renderizado de Páginas Dinámicas", "Detección de Cambios en la Fuente" |

El inglés se traduce en paralelo (p. ej. "Public Portals & Registries", "Open-Source OSINT", "Scheduled Collectors", "Dynamic Page Rendering", "Source Change Detection").

### 9.2 "Clearance" en las preguntas frecuentes de la home
- **es:** "…y asignación de equipo con clearance apropiado." → "…y asignación de un equipo dedicado bajo acuerdos de confidencialidad."
- **en:** "…and assignment of appropriately cleared personnel." → "…and a dedicated team bound by confidentiality agreements."

### 9.3 Otros
- **Título invisible:** `ProductLanding` (7 páginas) y `DataEnrichmentLanding` dejan de usar `ScrambleText` en el `h1`. El título se ve desde el servidor, sin `opacity: 0` en el contenedor.
- **Reducir movimiento:**
  - `MotionProvider` agrega `<MotionConfig reducedMotion="user">`.
  - Los componentes con valores ligados al scroll usan `useReducedMotion()` y muestran el estado final.
  - Las barras con bucle infinito de `live-studio/Hero.tsx` se detienen con reducir movimiento.
- **Logos de nubes:** fuera de la portada (§5.7).
- **Encabezado** (§6), **logo** y **metadatos por página** (§8).

## 10. Arquitectura de componentes

**Principio:** secciones en servidor, con **islas cliente** solo donde hay movimiento. Todo usa `m` + `LazyMotion` (`strict`), como hoy.

**Nuevos:**

| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `src/hooks/useStageProgress.ts` | hook | `useScroll({ target, offset })` + `useReducedMotion` + detección de móvil. Devuelve `progress` (MotionValue 0→1) y `mode: "scrub" \| "inView" \| "static"`. |
| `src/components/ui/InstrumentLabel.tsx` | servidor | Etiqueta mono (índice, contador, "Imagen ilustrativa"). |
| `src/components/ui/ScrollStage.tsx` | cliente | Contenedor alto + hijo `sticky` (`top-0 h-svh`); en móvil o con reducir movimiento se vuelve un bloque normal. |
| `src/components/sections/home/HomeHero.tsx` | cliente | Portada (5.1): imagen, texto, zoom. |
| `src/components/sections/home/HeroRoute.tsx` | cliente | Ruta SVG + punto azul. |
| `src/components/sections/home/Thesis.tsx` | cliente | Revelado palabra por palabra (5.2). |
| `src/components/sections/home/CapabilitiesIndex.tsx` | cliente | Lista + lámina fija + red de nodos (5.3). |
| `src/components/sections/home/Dossier.tsx` | cliente | Expediente + recuadros + panel (5.4). |
| `src/components/sections/home/BuiltProof.tsx` | servidor + islas | RealTy + Live Studio (5.5). |
| `src/components/sections/home/MethodologyLine.tsx` | cliente | Metodología con línea (5.6). |
| `src/components/sections/home/geometry.ts` | datos | Coordenadas (espacio 1536×1024) de la ruta, los 8 nodos y los 6 campos, medidas sobre las imágenes. |
| `src/lib/metadata.ts` | util | `pageMetadata()` (§8). |
| `src/app/[locale]/**/opengraph-image.tsx` y `twitter-image.tsx` | ruta | Una por ruta; llaman a `renderPageSocialImage` (§8). |
| `scripts/process-images.mjs` | script | Pipeline (§7). |

**Modificados:**
- `src/app/[locale]/page.tsx`
- `TechStack.tsx` (recibe logos), `FAQ.tsx`, `CTA.tsx` (fondo `relieve` + sin ScrambleText)
- `Header.tsx`, `MegaMenu.tsx`, `header/types.ts`, `useDarkSectionDetection.ts`, `Footer.tsx`
- `ProductLanding.tsx`, `DataEnrichmentLanding.tsx`
- `live-studio/Hero.tsx`, `MotionProvider.tsx`, `social-image.tsx`
- Las `page.tsx` de cada ruta (metadatos)
- `config/site.ts`, `next.config.ts`, `es.ts` / `en.ts`, `package.json`

**Eliminados:** `sections/Hero.tsx`, `Services.tsx`, `FlagshipAI.tsx`, `CaseStudy.tsx`, `LiveStudioTeaser.tsx`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`. `TrustBar.tsx` se reutiliza dentro de TechStack o se integra en él.

**Diccionarios:** se agregan claves nuevas (`hero.indexItems`, `hero.imageLabel`, `hero.scrollHint`, `thesis`, `dossier`, `built`, `nav` con productos). Las claves que dejan de usarse (`flagshipAI`, `liveStudioTeaser`, `hero.titleRotating`, `hero.titleHighlight`) se eliminan de ambos diccionarios si ningún otro componente las usa.

## 11. Rendimiento y accesibilidad

- **LCP** < 2,5 s y **CLS** < 0,1 en build de producción local (`next build && next start`), medidos con Playwright o Unlighthouse.
- JavaScript cliente nuevo ≤ 30 KB gzip en total para las islas de la home.
- Sin animaciones de `width`, `height`, `top` ni `filter`.
- Contraste AA en todo texto sobre imagen, garantizado con degradados.
- Toda imagen informativa tiene `alt`; las decorativas, `alt=""`. Los SVG superpuestos son `aria-hidden`.
- El orden del DOM respeta la lectura; nada importante existe solo en SVG.

## 12. Verificación

**Revisiones automáticas:** `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.

**Pruebas existentes** (`e2e/`): todas deben pasar. Se actualiza `smoke.spec.ts`, que hoy verifica `hero.titleLead` (el nuevo H1 lo sigue conteniendo). La prueba de accesibilidad se amplía para abrir el mega menú.

**Pruebas nuevas** (`e2e/home.spec.ts`, `e2e/seo.spec.ts`):
1. El `h1` de la home está en el HTML del servidor y es visible sin JavaScript.
2. Con `reducedMotion: "reduce"`: la ruta está dibujada, la red completa y los 6 campos marcados; no hay contenedores sticky activos.
3. Encabezado: al navegar de `/es` a `/es/inversores` por la nav, el encabezado queda en modo oscuro.
4. Cada ruta y cada idioma tienen `og:title` y `og:url` propios, y la imagen para redes responde 200 con `image/png`.
5. `/logo.svg` y `/logo.png` responden 200.
6. El JSON-LD `FAQPage` de la home tiene tantas preguntas como `dict.faq.items`.
7. La página de Extracción de datos no contiene "proxies", "dark web" ni "CAPTCHA" (es y en).
8. A11y (axe, WCAG AA) sin violaciones en la home, con el mega menú abierto y cerrado.

**Revisión visual:** capturas a 1440×900 y 390×844 en 10+ puntos de scroll, revisadas una a una, más una pasada con reducir movimiento.

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Imágenes de 1536 px escaladas se ven blandas en pantallas 4K | Tratamiento oscuro + líneas nítidas en SVG encima; el ojo lee la nitidez del vector. |
| Superposiciones desalineadas en proporciones extremas | Mismo `viewBox` y `slice` que `object-cover`; se verifica en 1440×900, 1920×1080, 2560×1440 y 390×844. |
| iOS cambia la altura del viewport al mostrar u ocultar la barra | Unidades `svh`; sin sticky en móvil. |
| `:has()` en navegadores antiguos | Todos los navegadores objetivo lo soportan; si falla, el encabezado se corrige al hidratar. |
| El nuevo copy de Extracción de datos no refleja la operación real | El usuario revisa §9.1 antes de implementar. |
| Carga de contenedores sticky largos en dispositivos lentos | Solo `transform`/`opacity`; se mide en la verificación de rendimiento. |

## 14. Preguntas abiertas

Ninguna bloqueante. §9.1 requiere que el usuario confirme que el copy nuevo describe lo que Orbexs realmente hace.
