# Novaforge Project Context para Codex

Bienvenido a Novaforge, el sitio web high-end de nuestra agencia de AI & Software.

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
