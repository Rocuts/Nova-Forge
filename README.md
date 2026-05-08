# Orbexs

Sitio web corporativo de Orbexs — ingenieria de software mission-critical, IA soberana y ciberseguridad agenticapara gobiernos y enterprise.

**Produccion:** [orbexs-alpha.vercel.app](https://orbexs-alpha.vercel.app)

## Stack Tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, SSG) |
| UI | React 19, Tailwind CSS v4 |
| 3D | React Three Fiber + Drei + Postprocessing |
| Animaciones | Motion (Framer Motion 12) |
| IA | Vercel AI SDK v6, OpenAI |
| Lenguaje | TypeScript 5 |
| Testing | Playwright (E2E) |
| Deploy | Vercel |

## Estructura del Proyecto

```
src/
  app/
    [locale]/            # Rutas con i18n (es, en)
      page.tsx           # Homepage
      agendar/           # Formulario de scheduling
      diagnostico/       # Diagnostico tecnico con IA
      inversores/        # Pagina de inversores
      nosotros/          # About / Empresa
      soberania-ia/      # Landing: IA Soberana
      ciberseguridad/    # Landing: Ciberseguridad
      fuerza-digital/    # Landing: Fuerza de Trabajo Digital
      enriquecimiento-datos/  # Landing: Data Enrichment
      extraccion-datos/       # Landing: Data Extraction
      sistemas-criticos/      # Landing: Sistemas Criticos
      inteligencia-operativa/ # Landing: Inteligencia Operativa
      automatizacion-gobierno/ # Landing: Automatizacion Gov
      privacidad/        # Politica de privacidad
      terminos/          # Terminos de servicio
    api/
      diagnostic/        # Endpoint de diagnostico IA
  components/
    sections/            # Secciones de pagina (Hero, Services, FAQ, CTA, etc.)
    layout/              # Header, Footer
    ui/                  # Componentes reutilizables (Button, BrandLogo, etc.)
    3d/                  # Experiencias WebGL (HeroCanvas)
    animations/          # CoverReveal, ScrollProgress
  content/
    dictionaries/        # Contenido i18n (es.ts, en.ts)
  lib/                   # Utilidades (i18n, analytics, motion, utils)
  config/                # Configuracion del sitio (site.ts)
```

## Quick Start

```bash
npm install
npm run dev
```

El servidor de desarrollo arranca en `http://localhost:3000`.

## Comandos

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Servidor de produccion |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Tests E2E con Playwright |

## Internacionalizacion (i18n)

El sitio soporta dos idiomas:

- **Espanol (es)** — idioma por defecto, sin prefijo de URL (`/`, `/nosotros`, `/agendar`)
- **Ingles (en)** — prefijo `/en` (`/en`, `/en/about`, `/en/schedule`)

El contenido vive en `src/content/dictionaries/es.ts` y `en.ts`. Las rutas se mapean entre idiomas en `src/lib/i18n.ts`.

## Arquitectura de Secciones (Homepage)

La homepage renderiza las secciones en este orden:

1. **Hero** — Headline con rotacion de texto + CTAs
2. **TrustBar** — Logos de partners tecnologicos
3. **Services** — 8 cards de capacidades de ingenieria
4. **FlagshipAI** — Seccion de IA Soberana
5. **Methodology** — Proceso de ingenieria en 5 pasos
6. **TechStack** — Stack tecnologico categorizado
7. **FAQ** — Preguntas frecuentes con acordeon
8. **CTA** — Call-to-action de cierre

## Reglas para Contribuir

- **SEO:** Si modificas el FAQ, sincronizar cualquier esquema JSON-LD existente.
- **Rendimiento 3D:** Las experiencias WebGL usan `Suspense`. No bloquear el hilo principal.
- **Componentes nuevos:** UI reutilizable en `/components/ui/`, secciones complejas en `/components/sections/`.
- **Contenido:** Todo el texto visible del sitio esta en los diccionarios (`es.ts` / `en.ts`), no hardcoded en componentes.

## Deploy

El sitio se despliega automaticamente en Vercel al pushear a `main`.

## Licencia

Codigo propietario. Todos los derechos reservados. Orbexs LLC.
