import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HomeHero } from "@/components/sections/home/HomeHero"
import { HeroMedia } from "@/components/sections/home/hero-media"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"

// La portada se importa de forma estática: es el LCP y su HTML tiene que salir
// del servidor sin esperar a ningún chunk. El resto, también estático: dynamic()
// desde un Server Component no divide el código del cliente
// (node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md) y solo añade su
// runtime (React.lazy, PreloadChunks, BailoutToCSR). La imagen de la lámina de
// Capacidades se renderiza en el servidor (CapabilitiesMedia) y llega a la isla
// como slot, igual que la de la portada (HeroMedia). La del expediente la
// renderiza la propia sección de servidor Dossier y la pasa a su isla
// (DossierStage) de la misma forma.
import { Thesis } from "@/components/sections/home/Thesis"
import { CapabilitiesIndex } from "@/components/sections/home/CapabilitiesIndex"
import { CapabilitiesMedia } from "@/components/sections/home/CapabilitiesMedia"
import { Dossier } from "@/components/sections/home/Dossier"
import { CaseStudy } from "@/components/sections/CaseStudy"
import { LiveStudioTeaser } from "@/components/sections/LiveStudioTeaser"
import { Methodology } from "@/components/sections/Methodology"
import { TechStack } from "@/components/sections/TechStack"
import { FAQ } from "@/components/sections/FAQ"
import { CTA } from "@/components/sections/CTA"

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
      <HomeHero content={heroContent} media={<HeroMedia />} />
      <Thesis text={dict.thesis.text} />
      <CapabilitiesIndex content={dict.services} locale={locale} media={<CapabilitiesMedia />} />
      <Dossier content={dict.dossier} locale={locale} />
      <CaseStudy content={dict.caseStudy} locale={locale} />
      <LiveStudioTeaser content={dict.liveStudioTeaser} locale={locale} />
      <Methodology content={dict.methodology} />
      <TechStack content={dict.techStack} trustLabel={dict.trustBar.label} />
      <FAQ content={dict.faq} />
      <CTA content={ctaContent} />
    </>
  )
}
