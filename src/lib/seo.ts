import { siteConfig } from "@/config/site"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import type { Dictionary } from "@/content/dictionaries"

export const ORG_ID = `${siteConfig.url}/#organization`
export const WEBSITE_ID = `${siteConfig.url}/#website`

export function organizationJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.images.logo}`,
    description,
    email: siteConfig.contactEmail,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "sales",
      availableLanguage: ["es", "en"],
    },
    knowsAbout: [
      "Sovereign AI infrastructure",
      "Agentic cybersecurity",
      "Critical systems engineering",
      "Government process automation",
      "Operational intelligence platforms",
      "Data enrichment",
      "Data extraction and OSINT",
      "Live streaming production for LATAM creators",
      "TikTok LIVE studio operations",
    ],
    sameAs: [siteConfig.links.twitter, siteConfig.links.linkedin],
  }
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: ["es", "en"],
    publisher: { "@id": ORG_ID },
  }
}

/** Resolves the human-readable service name for an internal path from the nav dictionary. */
export function serviceNameForPath(dict: Dictionary, internalPath: string): string | undefined {
  for (const item of dict.nav.items) {
    if ("platformChildren" in item) {
      const all = [...(item.platformChildren ?? []), ...(item.solutionsChildren ?? [])]
      const match = all.find((child) => child.href === internalPath)
      if (match) return match.name
    }
  }
  return undefined
}

export function serviceJsonLd(opts: {
  dict: Dictionary
  internalPath: string
  locale: Locale
  fallbackName: string
  description: string
}) {
  const { dict, internalPath, locale, fallbackName, description } = opts
  const name = serviceNameForPath(dict, internalPath) ?? fallbackName
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    description,
    url: `${siteConfig.url}${buildLocalePath(locale, internalPath)}`,
    inLanguage: locale,
    areaServed: "Worldwide",
    audience: {
      "@type": "Audience",
      audienceType: "Government and enterprise organizations",
    },
    provider: { "@id": ORG_ID },
  }
}

export function breadcrumbJsonLd(
  locale: Locale,
  items: readonly { name: string; internalPath: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${buildLocalePath(locale, item.internalPath)}`,
    })),
  }
}

/** Breadcrumb for a product page: Home → Service */
export function productBreadcrumbJsonLd(dict: Dictionary, internalPath: string, locale: Locale, fallbackName: string) {
  return breadcrumbJsonLd(locale, [
    { name: siteConfig.name, internalPath: "/" },
    { name: serviceNameForPath(dict, internalPath) ?? fallbackName, internalPath },
  ])
}
