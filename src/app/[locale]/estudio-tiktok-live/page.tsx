import { LiveStudioLanding } from "@/components/sections/LiveStudioLanding"
import { JsonLd } from "@/components/ui/JsonLd"
import { breadcrumbJsonLd, ORG_ID } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildAlternates, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const INTERNAL_PATH = "/estudio-tiktok-live"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  const studio = dict.liveStudio
  return {
    title: `Orbexs Live Studio — ${studio.subtitle}`,
    description: studio.description,
    alternates: buildAlternates(INTERNAL_PATH, locale),
    openGraph: {
      title: `Orbexs Live Studio — ${studio.subtitle}`,
      description: studio.description,
      url: `${siteConfig.url}${buildLocalePath(locale, INTERNAL_PATH)}`,
    },
  }
}

export default async function LiveStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const studio = dict.liveStudio
  const pageUrl = `${siteConfig.url}${buildLocalePath(locale as Locale, INTERNAL_PATH)}`

  // FAQPage schema — generated from dict.liveStudio.faq.items, stays in sync automatically
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: studio.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Orbexs Live Studio",
    serviceType: locale === "en" ? "Live streaming production studio" : "Estudio de producción en vivo",
    description: studio.description,
    url: pageUrl,
    inLanguage: locale,
    areaServed: [
      { "@type": "Country", name: "Colombia" },
      { "@type": "Country", name: "Mexico" },
      { "@type": "Country", name: "Peru" },
      { "@type": "Country", name: "Chile" },
      { "@type": "Country", name: "Argentina" },
    ],
    audience: {
      "@type": "Audience",
      audienceType: locale === "en" ? "Live creators and brands" : "Creadores en vivo y marcas",
    },
    provider: { "@id": ORG_ID },
  }

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd,
          faqJsonLd,
          breadcrumbJsonLd(locale as Locale, [
            { name: siteConfig.name, internalPath: "/" },
            { name: "Orbexs Live Studio", internalPath: INTERNAL_PATH },
          ]),
        ]}
      />
      <LiveStudioLanding content={studio} locale={locale} />
    </>
  )
}
