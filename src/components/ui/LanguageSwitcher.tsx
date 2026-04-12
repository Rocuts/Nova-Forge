"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface LanguageSwitcherProps {
  locale: string
}

// Bidirectional path mapping — includes both visible URLs and internal [locale] paths
const PATH_MAP: Record<string, string> = {
  // ES visible -> EN visible
  "/": "/en",
  "/diagnostico": "/en/diagnostics",
  "/privacidad": "/en/privacy",
  "/terminos": "/en/terms",
  "/agendar": "/en/schedule",
  // ES internal (middleware-rewritten) -> EN visible
  "/es": "/en",
  "/es/diagnostico": "/en/diagnostics",
  "/es/privacidad": "/en/privacy",
  "/es/terminos": "/en/terms",
  "/es/agendar": "/en/schedule",
  // EN -> ES visible
  "/en": "/",
  "/en/diagnostics": "/diagnostico",
  "/en/diagnostico": "/diagnostico",
  "/en/privacy": "/privacidad",
  "/en/privacidad": "/privacidad",
  "/en/terms": "/terminos",
  "/en/terminos": "/terminos",
  "/en/schedule": "/agendar",
  "/en/agendar": "/agendar",
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const targetPath = PATH_MAP[pathname] ?? (
    locale === "es"
      ? `/en${pathname.replace(/^\/es/, "")}`
      : pathname.replace(/^\/en/, "") || "/"
  )

  return (
    <Link
      href={targetPath}
      className="px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-[#525252] hover:text-[#0a0a0a] hover:font-semibold border border-[#e5e5e5] hover:border-[#0a0a0a]/30 rounded-[6px] transition-all duration-200"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      {locale === "es" ? "EN" : "ES"}
    </Link>
  )
}
