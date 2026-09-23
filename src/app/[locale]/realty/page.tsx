import { RealtyLanding } from "@/components/sections/realty/RealtyLanding"
import { JsonLd } from "@/components/ui/JsonLd"
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { realtyMetaDescription } from "@/lib/page-meta"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const INTERNAL_PATH = "/realty"
const PRODUCT_NAME = "RealTy"

/**
 * Live voice demo switch, read from the environment while this page is
 * prerendered. It is intentionally NOT a NEXT_PUBLIC variable and not read in
 * the browser: the route stays static, and the flag is baked into the HTML.
 *
 * Consequence to remember: flipping REALTY_VOICE_DEMO_ENABLED requires a
 * redeploy (or a dev-server restart). Changing it in the dashboard alone does
 * nothing to the already-built page — although `/api/realty/voice-session`
 * reads it per request, so the route follows the environment immediately.
 */
const VOICE_DEMO_ENABLED = process.env.REALTY_VOICE_DEMO_ENABLED === "true"

// Title and meta description (realtyTitle / realtyMetaDescription) live in
// src/lib/page-meta.ts, shared with the social image of this route.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, INTERNAL_PATH)
}

export default async function RealtyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const realty = dict.realty
  const description = realtyMetaDescription(realty)

  // FAQPage schema — generated from dict.realty.faq.items, stays in sync
  // automatically when the copy changes (see CLAUDE.md).
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: realty.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            dict,
            internalPath: INTERNAL_PATH,
            locale: locale as Locale,
            fallbackName: PRODUCT_NAME,
            description,
          }),
          faqJsonLd,
          breadcrumbJsonLd(locale as Locale, [
            { name: siteConfig.name, internalPath: "/" },
            { name: PRODUCT_NAME, internalPath: INTERNAL_PATH },
          ]),
        ]}
      />
      <RealtyLanding content={realty} locale={locale} voiceDemoEnabled={VOICE_DEMO_ENABLED} />
    </>
  )
}
