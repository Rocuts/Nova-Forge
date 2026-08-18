import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

export interface NavChild {
  name: string
  href: string
  description?: string
}

export interface NavItem {
  name: string
  href?: string
  /** Marks a live-broadcast destination — renders the pulsing ON AIR dot */
  accent?: boolean
  children?: readonly NavChild[]
  platformChildren?: readonly NavChild[]
  solutionsChildren?: readonly NavChild[]
}

export interface NavContent {
  items: readonly NavItem[]
  contact: string
  schedule: string
  menuLabel: string
}

export const megaMenuEase = [0.22, 1, 0.36, 1] as const

export function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#")) return href
  return buildLocalePath(locale as Locale, href)
}

export function getMegaMenuLabels(locale: string) {
  const isEN = locale === "en"
  return {
    platform: isEN ? "PLATFORM" : "PLATAFORMA",
    solutions: isEN ? "SOLUTIONS" : "SOLUCIONES",
    about: isEN ? "ABOUT ORBEXS" : "SOBRE ORBEXS",
    contact: isEN ? "CONTACT" : "CONTACTO",
    learnMore: isEN ? "Learn more" : "Conocer más",
    aboutText: isEN
      ? "We build software infrastructure, sovereign AI, and agentic cybersecurity for governments and organizations operating under the most demanding standards."
      : "Construimos infraestructura de software, IA soberana y ciberseguridad agéntica para gobiernos y organizaciones que operan bajo los estándares más exigentes.",
    company: isEN ? "Company" : "Empresa",
  }
}
