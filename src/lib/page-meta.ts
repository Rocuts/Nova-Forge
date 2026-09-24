import { siteConfig } from "@/config/site"
import type { Dictionary } from "@/content/dictionaries"

/**
 * Every indexable route, in the same order as the `pages` array of
 * src/app/sitemap.ts. A new page is registered here as well, with its case in
 * getPageMeta() and its own opengraph-image.tsx.
 */
export const PAGE_PATHS = [
  "/",
  "/agendar",
  "/diagnostico",
  "/privacidad",
  "/terminos",
  "/soberania-ia",
  "/ciberseguridad",
  "/fuerza-digital",
  "/sistemas-criticos",
  "/inteligencia-operativa",
  "/automatizacion-gobierno",
  "/enriquecimiento-datos",
  "/extraccion-datos",
  "/estudio-tiktok-live",
  "/realty",
  "/inversores",
  "/nosotros",
] as const

export type InternalPath = (typeof PAGE_PATHS)[number]

export interface PageMeta {
  /** Page title without the brand suffix (the layout template adds " | Orbexs"). */
  title: string
  /** True only for the home, whose title already is "Orbexs — {titleSuffix}". */
  absoluteTitle: boolean
  description: string
  /** Instrument-layer line of the social image. */
  eyebrow: string
  /** Large title of the social image. */
  cardTitle: string
}

/** The eight service pages share one dictionary shape under `products`. */
const PRODUCT_KEYS = {
  "/soberania-ia": "sovereignAI",
  "/ciberseguridad": "cybersecurity",
  "/fuerza-digital": "digitalWorkforce",
  "/sistemas-criticos": "systemsArchitecture",
  "/inteligencia-operativa": "operationalIntelligence",
  "/automatizacion-gobierno": "governmentAutomation",
  "/enriquecimiento-datos": "dataEnrichment",
  "/extraccion-datos": "dataExtraction",
} as const satisfies Partial<Record<InternalPath, keyof Dictionary["products"]>>

type ProductPath = keyof typeof PRODUCT_KEYS

function isProductPath(path: InternalPath): path is ProductPath {
  return path in PRODUCT_KEYS
}

const REALTY_NAME = "RealTy"
const DESCRIPTION_MAX = 160

/**
 * Dictionary copy may use a non-breaking hyphen (U+2011) to keep a compound
 * from wrapping, as the EN RealTy H1 did in "real\u2011estate" until e1d7d37.
 * Search engines, share cards and the social image must still receive the
 * plain ASCII hyphen. Written as an escape: the literal character is
 * indistinguishable from "-" in review.
 */
function plainHyphens(text: string): string {
  return text.replace(/\u2011/g, "-")
}

/** Page title of /realty: "RealTy — {hero title}" without the closing period. */
export function realtyTitle(realty: Dictionary["realty"]): string {
  return `${REALTY_NAME} — ${plainHyphens(realty.hero.title).replace(/[.]$/, "")}`
}

/**
 * Meta description of /realty: the scope qualifier ("Versión de demostración" /
 * "Demo version", the last segment of `statusLine`) followed by the hero
 * description. The qualifier leads so the honesty contract survives a search
 * result, where nothing else on the page does. The qualifier and the first
 * sentence are always kept, then whole further sentences are appended while
 * they fit DESCRIPTION_MAX, so the cut never lands mid-sentence.
 */
export function realtyMetaDescription(realty: Dictionary["realty"]): string {
  const qualifier = realtyQualifier(realty).replace(/[.]$/, "")
  const scope = qualifier.charAt(0).toLocaleUpperCase() + qualifier.slice(1)
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
 * "versión de demostración" / "demo version": the last segment of `statusLine`.
 * e2e/seo.spec.ts checks that it is the scope that `cta.note` states, so a
 * reordered `statusLine` fails a test instead of shipping the slogan as the
 * qualifier.
 */
function realtyQualifier(realty: Dictionary["realty"]): string {
  const segments = realty.statusLine.split("·")
  return segments[segments.length - 1].trim()
}

function entry(title: string, description: string, eyebrow: string, cardTitle: string = title): PageMeta {
  return { title, absoluteTitle: false, description, eyebrow, cardTitle }
}

/** Title, description and social-image copy of a route, straight from its dictionary. */
export function getPageMeta(dict: Dictionary, path: InternalPath): PageMeta {
  if (isProductPath(path)) {
    const product = dict.products[PRODUCT_KEYS[path]]
    return entry(product.title, product.description, product.eyebrow)
  }

  switch (path) {
    case "/":
      return {
        title: `${siteConfig.name} — ${dict.meta.titleSuffix}`,
        absoluteTitle: true,
        description: dict.meta.description,
        eyebrow: dict.hero.eyebrow,
        cardTitle: dict.hero.title,
      }
    case "/agendar":
      return entry(dict.schedule.pageTitle, dict.schedule.pageSubtitle, dict.schedule.badge)
    case "/diagnostico":
      return entry(dict.diagnosticPage.pageTitle, dict.diagnosticPage.pageSubtitle, dict.diagnosticPage.badge)
    case "/privacidad":
      return entry(dict.privacy.title, dict.privacy.description, dict.legalPage.badge)
    case "/terminos":
      return entry(dict.terms.title, dict.terms.description, dict.legalPage.badge)
    case "/estudio-tiktok-live": {
      const studio = dict.liveStudio
      return entry(
        `Orbexs Live Studio — ${studio.subtitle}`,
        studio.description,
        // The card carries the agency-application status that sits above the
        // H1 on the page, so the shared image never reads as an official studio.
        `${studio.eyebrow} · ${studio.status}`,
        `${studio.titleLead} ${studio.titleAccent} ${studio.titleTail}`,
      )
    }
    case "/realty": {
      const realty = dict.realty
      return entry(
        realtyTitle(realty),
        realtyMetaDescription(realty),
        `${realty.eyebrow} · ${realtyQualifier(realty)}`,
        plainHyphens(realty.hero.title),
      )
    }
    case "/inversores":
      return entry(dict.investorsPage.title, dict.investorsPage.subtitle, dict.investorsPage.eyebrow)
    case "/nosotros":
      return entry(dict.aboutPage.title, dict.aboutPage.subtitle, dict.aboutPage.eyebrow)
  }
}
