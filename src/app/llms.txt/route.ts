import { getDictionary } from "@/content/dictionaries"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { siteConfig } from "@/config/site"

export const dynamic = "force-static"

function serviceLines(locale: Locale, links: readonly { name: string; href: string; description?: string }[]) {
  return links
    .map((link) => `- [${link.name}](${siteConfig.url}${buildLocalePath(locale, link.href)}): ${link.description ?? ""}`.trimEnd())
    .join("\n")
}

export async function GET() {
  const es = await getDictionary("es")
  const en = await getDictionary("en")

  const complianceCategories = ["Marcos de Cumplimiento", "Automatización de Cumplimiento"]
  const compliance = es.techStack.categories
    .filter((c) => complianceCategories.includes(c.name))
    .map((c) => `- ${c.name}: ${c.items.join(" · ")}`)
    .join("\n")

  const body = `# ${siteConfig.name}

> ${es.meta.description}
> ${en.meta.description}

${siteConfig.legalName}. Sitio: ${siteConfig.url} (español: ${siteConfig.url}/es — English: ${siteConfig.url}/en)
Contacto comercial: ${siteConfig.contactEmail}
Audiencia: gobiernos, defensa y grandes organizaciones reguladas. Compromisos bajo NDA, infraestructura aislada y despliegue soberano (on-premise o cloud soberana).

## Plataforma (Español)
${serviceLines("es", es.nav.platformLinks)}

## Soluciones (Español)
${serviceLines("es", es.nav.solutionsLinks)}

## Productos (Español)
${serviceLines("es", es.nav.productLinks)}

## Platform (English)
${serviceLines("en", en.nav.platformLinks)}

## Solutions (English)
${serviceLines("en", en.nav.solutionsLinks)}

## Products (English)
${serviceLines("en", en.nav.productLinks)}

## Orbexs Live Studio (división de producción en vivo)
- [Orbexs Live Studio — Español](${siteConfig.url}${buildLocalePath("es", "/estudio-tiktok-live")}): ${es.liveStudio.description}
- [Orbexs Live Studio — English](${siteConfig.url}${buildLocalePath("en", "/estudio-tiktok-live")}): ${en.liveStudio.description}
Estado: ${es.liveStudio.status.toLowerCase()}. ${es.liveStudio.disclaimer}
Programa para creadores: ${es.liveStudio.program.steps.map((s) => `${s.step} ${s.title} — ${s.description}`).join(" ")}

## RealTy (infraestructura de ventas con IA para inmobiliarias)
- [RealTy — Español](${siteConfig.url}${buildLocalePath("es", "/realty")}): ${es.realty.hero.description}
- [RealTy — English](${siteConfig.url}${buildLocalePath("en", "/realty")}): ${en.realty.hero.description}
Estado: ${es.realty.statusLine} / ${en.realty.statusLine}
${es.realty.cta.note}
${en.realty.cta.note}

## Casos de estudio
### ${es.caseStudy.title} — ${es.caseStudy.industry}
${es.caseStudy.context} ${es.caseStudy.solution} ${es.caseStudy.outcome}

### ${en.caseStudy.title} — ${en.caseStudy.industry}
${en.caseStudy.context} ${en.caseStudy.solution} ${en.caseStudy.outcome}

## Preguntas frecuentes
${es.faq.items.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n")}

## Frequently asked questions
${en.faq.items.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n")}

## Cumplimiento y estándares
${es.techStack.note}

${compliance}

## Empresa
- [Sobre Nosotros](${siteConfig.url}${buildLocalePath("es", "/nosotros")}): ${es.aboutPage.subtitle}
- [About Us](${siteConfig.url}${buildLocalePath("en", "/nosotros")}): ${en.aboutPage.subtitle}
- [Agendar una evaluación técnica](${siteConfig.url}${buildLocalePath("es", "/agendar")})
- [Schedule a technical evaluation](${siteConfig.url}${buildLocalePath("en", "/agendar")})
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
