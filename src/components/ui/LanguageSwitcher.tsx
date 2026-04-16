"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { pathMap } from "@/lib/i18n"

interface LanguageSwitcherProps {
  locale: string
}

// Build a bidirectional lookup from pathMap so every page is covered automatically.
function buildSwitchMap(): Record<string, string> {
  const map: Record<string, string> = {
    // Root pages
    "/": "/en",
    "/es": "/en",
    "/en": "/",
  }

  for (const [, slugs] of Object.entries(pathMap)) {
    const esSlug = slugs.es   // e.g. "/privacidad"
    const enSlug = slugs.en   // e.g. "/privacy"

    // ES visible -> EN visible
    map[esSlug] = `/en${enSlug}`
    // ES internal (middleware-rewritten with /es prefix) -> EN visible
    map[`/es${esSlug}`] = `/en${enSlug}`
    // EN visible -> ES visible
    map[`/en${enSlug}`] = esSlug
    // EN internal (Spanish slug still in URL) -> ES visible
    map[`/en${esSlug}`] = esSlug
  }

  return map
}

const SWITCH_MAP = buildSwitchMap()

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const targetPath = SWITCH_MAP[pathname] ?? (
    locale === "es"
      ? `/en${pathname.replace(/^\/es/, "")}`
      : pathname.replace(/^\/en/, "") || "/"
  )

  return (
    <Link
      href={targetPath}
      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-[#525252] hover:text-[#0a0a0a] hover:font-semibold border border-[#e5e5e5] hover:border-[#0a0a0a]/30 rounded-[6px] transition-all duration-200"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      {locale === "es" ? "EN" : "ES"}
    </Link>
  )
}
