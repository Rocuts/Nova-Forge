import { ProductLanding } from "@/components/sections/ProductLanding"
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
    title: dict.products.digitalWorkforce.title,
    description: dict.products.digitalWorkforce.description,
    alternates: buildAlternates("/fuerza-digital", locale),
  }
}

export default async function DigitalWorkforcePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const product = dict.products.digitalWorkforce
  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            dict,
            internalPath: "/fuerza-digital",
            locale: locale as Locale,
            fallbackName: product.subtitle,
            description: product.description,
          }),
          productBreadcrumbJsonLd(dict, "/fuerza-digital", locale as Locale, product.subtitle),
        ]}
      />
      <ProductLanding content={product} locale={locale} />
    </>
  )
}
