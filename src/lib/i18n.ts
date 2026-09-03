export const locales = ["es", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "es"

export const localePrefix: Record<Locale, string> = {
  es: "/es",
  en: "/en",
}

// Maps internal route paths to locale-specific slugs
export const pathMap: Record<string, Record<Locale, string>> = {
  "/diagnostico": { es: "/diagnostico", en: "/diagnostic" },
  "/privacidad": { es: "/privacidad", en: "/privacy" },
  "/terminos": { es: "/terminos", en: "/terms" },
  "/agendar": { es: "/agendar", en: "/schedule" },
  "/soberania-ia": { es: "/soberania-ia", en: "/sovereign-ai" },
  "/ciberseguridad": { es: "/ciberseguridad", en: "/cybersecurity" },
  "/fuerza-digital": { es: "/fuerza-digital", en: "/digital-workforce" },
  "/sistemas-criticos": { es: "/sistemas-criticos", en: "/critical-systems" },
  "/inteligencia-operativa": { es: "/inteligencia-operativa", en: "/operational-intelligence" },
  "/automatizacion-gobierno": { es: "/automatizacion-gobierno", en: "/government-automation" },
  "/inversores": { es: "/inversores", en: "/investors" },
  "/nosotros": { es: "/nosotros", en: "/about" },
  "/enriquecimiento-datos": { es: "/enriquecimiento-datos", en: "/data-enrichment" },
  "/extraccion-datos": { es: "/extraccion-datos", en: "/data-extraction" },
  "/estudio-tiktok-live": { es: "/estudio-tiktok-live", en: "/tiktok-live-studio" },
  // Same slug in both locales: next.config derives no rewrite/redirect for it.
  "/realty": { es: "/realty", en: "/realty" },
}

export function buildLocalePath(locale: Locale, internalPath: string): string {
  const prefix = localePrefix[locale]
  if (internalPath === "/") return prefix
  const mapped = pathMap[internalPath]?.[locale] ?? internalPath
  return `${prefix}${mapped}`
}

// Per-page canonical + hreflang. Spanish is the default market, so x-default → es.
export function buildAlternates(internalPath: string, currentLocale: Locale) {
  const es = buildLocalePath("es", internalPath)
  const en = buildLocalePath("en", internalPath)
  return {
    canonical: currentLocale === "en" ? en : es,
    languages: {
      es,
      en,
      "x-default": es,
    },
  }
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
