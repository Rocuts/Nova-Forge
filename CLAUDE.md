# Orbexs Project Context para Claude

Bienvenido a Orbexs, el sitio web high-end de nuestra agencia de AI & Software.

## Estructura Rápida
- `/src/app`: Routing principal (SSR).
- `/src/components/sections`: Bloques modulares del hero/landing.
- `/src/components/3d`: Experiencias WebGL.

## Comandos Operativos (Bash Tool allowed)
- Dev server: `npm run dev`
- Linter: `npm run lint`
- Build de prod: `npm run build`
- Tests E2E: `npm run test:e2e` (Playwright)

## Reglas de Arquitectura para Claude
- **NO DESTRUYAS EL SEO:** El archivo `src/app/[locale]/page.tsx` contiene un schema dinámico `@type: "FAQPage"` generado desde `dict.faq.items`. Si modificas la sección de FAQ (diccionarios `es.ts`/`en.ts`), el schema se sincroniza solo — no lo elimines. Lo mismo aplica a `src/app/[locale]/estudio-tiktok-live/page.tsx`, que genera su propio `FAQPage` desde `dict.liveStudio.faq.items`. Cada página define su `canonical`/`hreflang` con `buildAlternates()` de `src/lib/i18n.ts`.
- **Rutas nuevas:** una página se registra en tres lugares — la carpeta `src/app/[locale]/<slug-es>/`, `pathMap` en `src/lib/i18n.ts` y el array `pages` de `src/app/sitemap.ts`. Los rewrites del slug inglés y los redirects 308 se derivan automáticamente de `pathMap` en `next.config.ts` — no añadir entradas manuales ahí. Omitir pathMap o sitemap rompe el hreflang o el sitemap.
- **Proxy (ex-middleware):** el redirect de locale vive en `src/proxy.ts` (convención Next 16). No recrear `middleware.ts` en la raíz — Next 16 lo ignora silenciosamente y se rompe el redirect `/` → `/es`.
- **Orbexs Live Studio** (`/estudio-tiktok-live`) es la división de producción en vivo. Su lenguaje visual es dark-first con el par espectral cian/magenta (`--live-cyan` / `--live-magenta` en `globals.css`), usado solo como acento — nunca como relleno. La solicitud de agencia LIVE está **en revisión**: no escribas copy que afirme afiliación oficial con TikTok, y conserva el `disclaimer` del diccionario.
- **Sin claims de partnership:** Orbexs NO tiene partnership ni certificación con AWS, Google Cloud, Azure, OpenAI ni TikTok — solo trabaja con sus productos. Todo copy (TrustBar incluido) debe leerse como "tecnologías con las que construimos", nunca como alianza, certificación o "confían en nosotros".
- **Tipografía:** Geist / Geist Mono (design system Orbexs). No reintroducir Inter ni otras fuentes.
- **Rendimiento 3D:** El proyecto usa `@studio-freight/lenis` para scroll fluido. Asegúrate que las transiciones de canvas 3D no bloqueen el hilo principal (main thread) usando `Suspense`.
- Si necesitas crear un nuevo componente, créalo bajo `/src/components/ui/` para componentes tontos, y `/src/components/sections/` para dominios complejos.
