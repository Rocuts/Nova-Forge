import { RealtyLanding } from "@/components/sections/realty/RealtyLanding"
import { JsonLd } from "@/components/ui/JsonLd"
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import type { Dictionary } from "@/content/dictionaries"
import { isValidLocale, buildAlternates, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const INTERNAL_PATH = "/realty"
const PRODUCT_NAME = "RealTy"
const DESCRIPTION_MAX = 160

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

/**
 * Meta description: the scope phrase from the status line ("Demonstration
 * build" / "Versión de demostración") followed by the hero description. The
 * scope phrase leads so the honesty contract survives a search result, where
 * nothing else on the page does (DECISIONS §2).
 *
 * The scope phrase and the first sentence are always kept, then whole further
 * sentences are appended while they fit DESCRIPTION_MAX. The cut never lands
 * mid-sentence: the Spanish copy overruns the cap by nine characters, and an
 * intact sentence reads better in a result page than an elided fragment.
 */
function metaDescription(realty: Dictionary["realty"]): string {
  const scope = realty.statusLine.split("·")[0].trim().replace(/[.]$/, "")
  const description = realty.hero.description
  const sentences = description.match(/[^.]+\.(?:\s+|$)/g)?.map((s) => s.trim()) ?? [description]

  let out = `${scope}. ${sentences[0]}`
  for (const sentence of sentences.slice(1)) {
    const next = `${out} ${sentence}`
    if (next.length > DESCRIPTION_MAX) break
    out = next
  }
  return out
}

/**
 * The EN H1 carries a non-breaking hyphen (U+2011) in "real\u2011estate" so the
 * flagship headline cannot wrap mid-compound. Search engines and share cards
 * must still receive the plain ASCII hyphen required by the meta spec, so it is
 * normalised back here — the only place hero.title leaves the page.
 */
function realtyTitle(realty: Dictionary["realty"]): string {
  const title = realty.hero.title.replace(/\u2011/g, "-").replace(/[.]$/, "")
  return `${PRODUCT_NAME} — ${title}`
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  const title = realtyTitle(dict.realty)
  const description = metaDescription(dict.realty)

  return {
    title,
    description,
    alternates: buildAlternates(INTERNAL_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${buildLocalePath(locale, INTERNAL_PATH)}`,
    },
  }
}

export default async function RealtyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const realty = dict.realty
  const description = metaDescription(realty)

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
