import { getDictionary } from "@/content/dictionaries"
import type { Dictionary } from "@/content/dictionaries"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { siteConfig } from "@/config/site"

export const dynamic = "force-static"

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

function serviceLines(dict: Dictionary, locale: Locale, links: readonly { name: string; href: string; description?: string }[]) {
  return links
    .map((link) => `- [${link.name}](${siteConfig.url}${buildLocalePath(locale, link.href)}): ${link.description ?? ""}`.trimEnd())
    .join("\n")
}

export async function GET() {
  const es = await getDictionary("es")
  const en = await getDictionary("en")
  const esNav = navChildren(es)
  const enNav = navChildren(en)

  const compliance = es.techStack.categories.find((c) => c.name === "Cumplimiento")?.items.join(" · ") ?? ""

  const body = `# ${siteConfig.name}

> ${es.meta.description}
> ${en.meta.description}

${siteConfig.legalName}. Sitio: ${siteConfig.url} (español: ${siteConfig.url}/es — English: ${siteConfig.url}/en)
Contacto comercial: ${siteConfig.contactEmail}
Audiencia: gobiernos, defensa y grandes organizaciones reguladas. Compromisos bajo NDA, infraestructura aislada y despliegue soberano (on-premise o cloud soberana).

## Plataforma (Español)
${serviceLines(es, "es", esNav.platform)}

## Soluciones (Español)
${serviceLines(es, "es", esNav.solutions)}

## Platform (English)
${serviceLines(en, "en", enNav.platform)}

## Solutions (English)
${serviceLines(en, "en", enNav.solutions)}

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
