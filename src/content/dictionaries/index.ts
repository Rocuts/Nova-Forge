import type { Locale } from "@/lib/i18n"

const dictionaries = {
  es: () => import("./es").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]()
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
