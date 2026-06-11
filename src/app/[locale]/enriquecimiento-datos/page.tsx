import { DataEnrichmentLanding } from "@/components/sections/DataEnrichmentLanding"
import { JsonLd } from "@/components/ui/JsonLd"
import { serviceJsonLd, productBreadcrumbJsonLd } from "@/lib/seo"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildAlternates } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: dict.products.dataEnrichment.title,
    description: dict.products.dataEnrichment.description,
    alternates: buildAlternates("/enriquecimiento-datos", locale),
  }
}

export default async function DataEnrichmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const product = dict.products.dataEnrichment
  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            dict,
            internalPath: "/enriquecimiento-datos",
            locale: locale as Locale,
            fallbackName: product.subtitle,
            description: product.description,
          }),
          productBreadcrumbJsonLd(dict, "/enriquecimiento-datos", locale as Locale, product.subtitle),
        ]}
      />
      <DataEnrichmentLanding content={product} locale={locale} />
    </>
  )
}
