"use client"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { MegaMenu } from "./header/MegaMenu"
import { HamburgerIcon } from "./header/HamburgerIcon"
import { useDarkSectionDetection } from "./header/useDarkSectionDetection"
import { resolveHref } from "./header/types"
import type { NavContent } from "./header/types"

// MegaMenu is imported statically on purpose. It only mounts while the menu is
// open, so loading it through next/dynamic({ ssr: false }) looked attractive —
// but measured on this build it is a net loss: the overlay is 4.3 kB while the
// next/dynamic loader runtime costs ~5.3 kB, and because Header lives in the
// root layout that runtime lands in the shared bundle of *every* route.
// See the note in next.config.ts for the matching CSP trade-off.
export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const isDarkSection = useDarkSectionDetection()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  // Trigger logo CSS glitch once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      logoRef.current?.classList.add("logo-glitch")
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const closeMegaMenu = useCallback(() => setIsMegaMenuOpen(false), [])

  const toggleMegaMenu = useCallback(() => {
    setIsMegaMenuOpen((prev) => {
      trackEvent(prev ? "mega_menu_close" : "mega_menu_open")
      return !prev
    })
  }, [])

  // ESC key closes menu
  useEffect(() => {
    if (!isMegaMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMegaMenu()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMegaMenuOpen, closeMegaMenu])

  // Lock body scroll when mega menu is open
  useEffect(() => {
    if (isMegaMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMegaMenuOpen])

  const schedulingHref = buildLocalePath(locale as Locale, "/agendar")

  // Determine header visual mode
  const isOnDark = isMegaMenuOpen || isDarkSection
  const textColor = isOnDark ? "text-white" : "text-[#0a0a0a]"
  const navLinkColor = isOnDark
    ? "text-white/60 hover:text-white"
    : "text-[#525252] hover:text-[#0a0a0a]"

  // Separate items with children (mega menu trigger) from direct links
  const megaMenuItem = nav.items.find((item) => item.children)
  const directItems = nav.items.filter((item) => !item.children)

  // Source platform and solutions links from the single merged item
  const platformLinks = megaMenuItem?.platformChildren ?? []
  const solutionsLinks = megaMenuItem?.solutionsChildren ?? []

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isMegaMenuOpen
            ? "bg-[#0a0a0a] border-b border-white/10"
            : isDarkSection
              ? isScrolled
                ? "bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10"
                : "bg-transparent"
              : isScrolled
                ? "bg-white/90 backdrop-blur-sm border-b border-[#e5e5e5]"
                : "bg-white"
        }`}
      >
        <div className="container px-4 mx-auto max-w-7xl h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <TransitionLink
            href={buildLocalePath(locale as Locale, "/")}
            className={`flex items-center gap-2 font-heading text-lg font-semibold tracking-tight group transition-colors duration-300 ${textColor}`}
          >
            {/* Logo with CSS micro-glitch on load (once) */}
            <div ref={logoRef}>
              <BrandLogo
                size={24}
                className={`transition-colors duration-300 ${textColor}`}
              />
            </div>
            <span>{siteConfig.name}</span>
          </TransitionLink>

          {/* Center: Desktop nav links with underline hover */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) =>
              item.children ? (
                <button
                  key={item.name}
                  type="button"
                  onClick={toggleMegaMenu}
                  className={`nav-link-hover px-4 py-2 transition-colors duration-200 ${navLinkColor}`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href ? resolveHref(locale, item.href) : "#"}
                  className={`nav-link-hover px-4 py-2 transition-colors duration-200 inline-flex items-center gap-2 ${navLinkColor}`}
                >
                  {item.accent && <span className="live-dot" aria-hidden="true" />}
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div
              className={`transition-colors duration-300 ${
                isOnDark
                  ? "[&_a]:text-white/70 [&_a]:border-white/20 [&_a:hover]:text-white [&_a:hover]:border-white/40"
                  : ""
              }`}
            >
              <LanguageSwitcher locale={locale} />
            </div>
            <Button
              size="sm"
              variant={isOnDark ? "secondary" : "primary"}
              className={
                isOnDark
                  ? "border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/50"
                  : ""
              }
              href={schedulingHref}
              onClick={() => trackEvent("scheduling_click")}
            >
              {nav.schedule}
            </Button>
            <button
              type="button"
              onClick={toggleMegaMenu}
              aria-expanded={isMegaMenuOpen}
              aria-label={nav.menuLabel}
              className={`w-11 h-11 rounded-[6px] flex items-center justify-center transition-all duration-200 ${
                isOnDark
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5] hover:text-[#0a0a0a]"
              }`}
            >
              <HamburgerIcon isOpen={isMegaMenuOpen} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mega menu overlay — DARK */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <MegaMenu
            locale={locale}
            platformLinks={platformLinks}
            solutionsLinks={solutionsLinks}
            directItems={directItems}
            onClose={closeMegaMenu}
          />
        )}
      </AnimatePresence>
    </>
  )
}
