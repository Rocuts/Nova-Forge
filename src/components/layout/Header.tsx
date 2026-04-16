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

interface NavChild {
  name: string
  href: string
  description?: string
}

interface NavItem {
  name: string
  href?: string
  children?: readonly NavChild[]
  platformChildren?: readonly NavChild[]
  solutionsChildren?: readonly NavChild[]
}

interface NavContent {
  items: readonly NavItem[]
  contact: string
  schedule: string
  menuLabel: string
}

function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#")) return href
  return buildLocalePath(locale as Locale, href)
}

const megaMenuEase = [0.22, 1, 0.36, 1] as const

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between relative">
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: megaMenuEase }}
      />
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: megaMenuEase }}
      />
    </div>
  )
}

function getMegaMenuLabels(locale: string) {
  const isEN = locale === "en"
  return {
    platform: isEN ? "PLATFORM" : "PLATAFORMA",
    solutions: isEN ? "SOLUTIONS" : "SOLUCIONES",
    about: isEN ? "ABOUT NOVAFORGE" : "SOBRE NOVAFORGE",
    contact: isEN ? "CONTACT" : "CONTACTO",
    learnMore: isEN ? "Learn more" : "Conocer más",
    aboutText: isEN
      ? "We build software infrastructure, sovereign AI, and agentic cybersecurity for governments and organizations operating under the most demanding standards."
      : "Construimos infraestructura de software, IA soberana y ciberseguridad agéntica para gobiernos y organizaciones que operan bajo los estándares más exigentes.",
    company: isEN ? "Company" : "Empresa",
    investors: isEN ? "Investors" : "Inversores",
  }
}

/** Detects which section the header overlaps and returns "light" or "dark" */
function useDarkSectionDetection() {
  const [isDarkSection, setIsDarkSection] = useState(false)

  useEffect(() => {
    const darkSections = document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]')
    if (darkSections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if any dark section intersects the top of the viewport (header zone)
        let anyDark = false
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect
            // Section is dark if it covers the header (top 64px)
            if (rect.top < 64 && rect.bottom > 0) {
              anyDark = true
            }
          }
        }
        setIsDarkSection(anyDark)
      },
      {
        // Only observe the top 64px strip where the header lives
        rootMargin: "0px 0px -95% 0px",
        threshold: 0,
      }
    )

    darkSections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return isDarkSection
}

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
  const labels = getMegaMenuLabels(locale)

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
            href={locale === "en" ? "/en" : "/"}
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
                  className={`nav-link-hover px-4 py-2 transition-colors duration-200 ${navLinkColor}`}
                >
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
              className={`w-10 h-10 rounded-[6px] flex items-center justify-center transition-all duration-200 ${
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
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: megaMenuEase }}
            className="fixed inset-0 top-16 z-40 bg-[#0a0a0a] text-white overflow-y-auto"
          >
            {/* Thin separator line */}
            <div className="border-t border-white/10" />

            <div className="container px-6 mx-auto max-w-7xl py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Column 1: PLATFORM — core technology products */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-8">
                    {labels.platform}
                  </h3>
                  <div className="flex flex-col">
                    {platformLinks.map((link, i) => (
                      <Link
                        key={link.href}
                        href={resolveHref(locale, link.href)}
                        onClick={closeMegaMenu}
                        className={`block py-4 group/desc ${
                          i < platformLinks.length - 1
                            ? "border-b border-white/5"
                            : ""
                        }`}
                      >
                        <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
                          <span className="text-[#525252] mr-1.5">&#8627;</span>
                          {link.name}
                        </span>
                        {link.description && (
                          <span className="block text-sm text-[#525252] mt-1">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Column 2: SOLUTIONS — use-case / outcome-oriented */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-8">
                    {labels.solutions}
                  </h3>
                  <div className="flex flex-col">
                    {solutionsLinks.map((link, i) => (
                      <Link
                        key={link.href}
                        href={resolveHref(locale, link.href)}
                        onClick={closeMegaMenu}
                        className={`block py-4 group/desc ${
                          i < solutionsLinks.length - 1
                            ? "border-b border-white/5"
                            : ""
                        }`}
                      >
                        <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
                          <span className="text-[#525252] mr-1.5">&#8627;</span>
                          {link.name}
                        </span>
                        {link.description && (
                          <span className="block text-sm text-[#525252] mt-1">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Direct links below Solutions */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
                    {directItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href ? resolveHref(locale, item.href) : "#"}
                        onClick={closeMegaMenu}
                        className="text-base font-medium text-white hover:text-[#a3a3a3] transition-colors"
                      >
                        <span className="text-[#525252] mr-1.5">&#8627;</span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Column 3: ABOUT + CONTACT */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-8">
                    {labels.about}
                  </h3>
                  <p className="text-base text-[#a3a3a3] leading-relaxed mb-6">
                    {labels.aboutText}
                  </p>
                  <Link
                    href={resolveHref(locale, "/nosotros")}
                    onClick={closeMegaMenu}
                    className="inline-block text-sm text-white hover:text-[#a3a3a3] border-b border-white/20 pb-0.5 transition-colors"
                  >
                    <span className="text-[#525252] mr-1.5">&#8627;</span>
                    {labels.learnMore}
                  </Link>

                  <div className="mt-10">
                    <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-4">
                      {labels.contact}
                    </h3>
                    <a
                      href={siteConfig.links.contact}
                      onClick={() => {
                        trackEvent("contact_click")
                        closeMegaMenu()
                      }}
                      className="text-base font-medium text-white hover:text-[#a3a3a3] transition-colors"
                    >
                      {siteConfig.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10 mt-12">
              <div className="container px-6 mx-auto max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-[#525252]">
                  &copy; {new Date().getFullYear()} {siteConfig.legalName}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <a
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#525252] hover:text-white transition-colors"
                  >
                    Twitter / X
                  </a>
                  <span className="text-white/10">&middot;</span>
                  <a
                    href={siteConfig.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#525252] hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
