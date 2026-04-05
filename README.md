# Novaforge

Novaforge es una plataforma y agencia enfocada en la creación de software empresarial a medida y agentes funcionales de Inteligencia Artificial.

## Contexto de Negocio
Construimos aplicaciones web, móviles (iOS/Android), software de escritorio y sistemas impulsados por IA. Este repositorio contiene nuestro sitio flagship de alto rendimiento visual, diseñado fuertemente con WebGL 3D interactivo y animaciones fluidas.

## Arquitectura Base
- **Frontend:** Next.js 16 (App Router) + React 19.
- **Estilos:** Tailwind CSS v4.
- **Motor Gráfico:** React Three Fiber + Drei + Postprocessing.
- **Animaciones:** Framer Motion 12 + Lenis Smooth Scroll.
- **Testing:** Playwright (`/e2e`).

## Quick Start
```bash
npm install
npm run dev
```

*Para agentes de IA: Por favor, revisa `.cursorrules` o `CLAUDE.md` antes de realizar modificaciones estructurales a los componentes de lado cliente.*
