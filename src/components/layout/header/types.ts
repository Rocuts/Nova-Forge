import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

export interface NavLink {
  name: string
  href: string
  description?: string
}

/** The titled link blocks of the mega menu (MegaMenu marks each one with data-menu-block). */
export type MenuBlockId = "platform" | "solutions" | "products"

/**
 * A top-level nav entry: it either opens the mega menu or links straight to a page.
 * `menuBlock` is where focus lands when that entry opens the menu ("Productos" →
 * the Products block); without it, on the panel's first link.
 */
export type NavItem =
  | { name: string; opensMenu: true; menuBlock?: MenuBlockId; href?: never }
  | { name: string; href: string; opensMenu?: never; menuBlock?: never }

export interface NavContent {
  items: readonly NavItem[]
  platformLinks: readonly NavLink[]
  solutionsLinks: readonly NavLink[]
  productLinks: readonly NavLink[]
  schedule: string
  menuLabel: string
}

/** Value of `.site-header[data-tone]` (globals.css). Absent until the client knows the section under the header. */
export type HeaderTone = "light" | "dark" | "menu"

/** id of the mega menu panel. The triggers point at it with aria-controls only while it is open. */
export const MEGA_MENU_ID = "site-mega-menu"

export const megaMenuEase = [0.22, 1, 0.36, 1] as const

export function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#")) return href
  return buildLocalePath(locale as Locale, href)
}

/**
 * Accessible names of the two navigation landmarks. While the menu is open on
 * desktop both are exposed, so each needs its own name; below md the panel's is
 * the only one (the header nav is display: none). No "navigation" in them:
 * screen readers already announce the role.
 */
export function getNavLandmarkLabels(locale: string) {
  const isEN = locale === "en"
  return {
    header: isEN ? "Main" : "Principal",
    menu: isEN ? "Site menu" : "Menú del sitio",
  }
}

export function getMegaMenuLabels(locale: string) {
  const isEN = locale === "en"
  return {
    platform: isEN ? "PLATFORM" : "PLATAFORMA",
    solutions: isEN ? "SOLUTIONS" : "SOLUCIONES",
    products: isEN ? "PRODUCTS" : "PRODUCTOS",
    about: isEN ? "ABOUT ORBEXS" : "SOBRE ORBEXS",
    contact: isEN ? "CONTACT" : "CONTACTO",
    learnMore: isEN ? "Learn more" : "Conocer más",
    aboutText: isEN
      ? "We build software infrastructure, sovereign AI, and agentic cybersecurity for governments and organizations operating under the most demanding standards."
      : "Construimos infraestructura de software, IA soberana y ciberseguridad agéntica para gobiernos y organizaciones que operan bajo los estándares más exigentes.",
  }
}
