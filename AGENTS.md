# Orbexs Project Context para Codex

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

## Reglas de Arquitectura para Codex
- **NO DESTRUYAS EL SEO:** El archivo `src/app/page.tsx` contiene un schema dinámico `@type: "FAQPage"`. Si modificas la sección de FAQ, debes sincronizar el esquema JSON-LD.
- **Rendimiento 3D:** El proyecto usa `@studio-freight/lenis` para scroll fluido. Asegúrate que las transiciones de canvas 3D no bloqueen el hilo principal (main thread) usando `Suspense`.
- Si necesitas crear un nuevo componente, créalo bajo `/src/components/ui/` para componentes tontos, y `/src/components/sections/` para dominios complejos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
