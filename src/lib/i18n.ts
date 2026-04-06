export const locales = ["es", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "es"

export const localePrefix: Record<Locale, string> = {
  es: "",
  en: "/en",
}

// Maps internal route paths to locale-specific slugs
export const pathMap: Record<string, Record<Locale, string>> = {
  "/diagnostico": { es: "/diagnostico", en: "/diagnostics" },
  "/privacidad": { es: "/privacidad", en: "/privacy" },
  "/terminos": { es: "/terminos", en: "/terms" },
  "/agendar": { es: "/agendar", en: "/schedule" },
}

export function buildLocalePath(locale: Locale, internalPath: string): string {
  const prefix = localePrefix[locale]
  const mapped = pathMap[internalPath]?.[locale] ?? internalPath
  return `${prefix}${mapped}`
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
