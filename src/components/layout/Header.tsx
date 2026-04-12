"use client"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface NavItem {
  name: string
  href?: string
  children?: readonly { name: string; href: string; description?: string }[]
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
    navigation: isEN ? "NAVIGATION" : "NAVEGACIÓN",
    platform: isEN ? "PLATFORM" : "PLATAFORMA",
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

export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

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

  // Separate items with children (mega menu columns) from direct links
  const columnItems = nav.items.filter((item) => item.children)
  const directItems = nav.items.filter((item) => !item.children)

  // Collect all product links (children of column items) for the flat nav list
  const allProductLinks = columnItems.flatMap(
    (item) => item.children?.map((child) => ({ ...child })) ?? []
  )

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          isMegaMenuOpen
            ? "bg-[#0a0a0a] border-b border-white/10"
            : isScrolled
              ? "bg-white/90 backdrop-blur-sm border-b border-[#e5e5e5]"
              : "bg-white"
        }`}
      >
        <div className="container px-4 mx-auto max-w-7xl h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <TransitionLink
            href={locale === "en" ? "/en" : "/"}
            className={`flex items-center gap-2 font-heading text-lg font-semibold tracking-tight group transition-colors duration-300 ${
              isMegaMenuOpen ? "text-white" : "text-[#0a0a0a]"
            }`}
          >
            <BrandLogo
              size={24}
              className={`transition-colors duration-300 ${
                isMegaMenuOpen ? "text-white" : "text-[#0a0a0a]"
              }`}
            />
            <span>{siteConfig.name}</span>
          </TransitionLink>

          {/* Center: Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) =>
              item.children ? (
                <button
                  key={item.name}
                  type="button"
                  onClick={toggleMegaMenu}
                  className={`px-4 py-2 transition-colors duration-200 ${
                    isMegaMenuOpen
                      ? "text-white/60 hover:text-white"
                      : "text-[#525252] hover:text-[#0a0a0a]"
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href ? resolveHref(locale, item.href) : "#"}
                  className={`px-4 py-2 transition-colors duration-200 ${
                    isMegaMenuOpen
                      ? "text-white/60 hover:text-white"
                      : "text-[#525252] hover:text-[#0a0a0a]"
                  }`}
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
                isMegaMenuOpen
                  ? "[&_a]:text-white/70 [&_a]:border-white/20 [&_a:hover]:text-white [&_a:hover]:border-white/40"
                  : ""
              }`}
            >
              <LanguageSwitcher locale={locale} />
            </div>
            <Button
              size="sm"
              variant={isMegaMenuOpen ? "secondary" : "primary"}
              className={
                isMegaMenuOpen
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
                isMegaMenuOpen
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
                {/* Column 1: NAVIGATION — flat list of all links */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-8">
                    {labels.navigation}
                  </h3>
                  <div className="flex flex-col">
                    {allProductLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={resolveHref(locale, link.href)}
                        onClick={closeMegaMenu}
                        className="block py-2 group/link"
                      >
                        <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-white hover:text-[#a3a3a3] transition-colors">
                          <span className="text-[#525252] mr-2">&#8627;</span>
                          {link.name}
                        </span>
                      </Link>
                    ))}
                    {/* Direct links (Empresa, Inversores) without arrows */}
                    {directItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href ? resolveHref(locale, item.href) : "#"}
                        onClick={closeMegaMenu}
                        className="block py-2 mt-1"
                      >
                        <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-white hover:text-[#a3a3a3] transition-colors">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Column 2: PLATFORM — products with descriptions */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252] mb-8">
                    {labels.platform}
                  </h3>
                  <div className="flex flex-col">
                    {allProductLinks.map((link, i) => (
                      <Link
                        key={link.href}
                        href={resolveHref(locale, link.href)}
                        onClick={closeMegaMenu}
                        className={`block py-4 group/desc ${
                          i < allProductLinks.length - 1
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
