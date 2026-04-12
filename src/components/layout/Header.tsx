"use client"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Menu, X, ChevronDown } from "lucide-react"
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

export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      trackEvent(prev ? "mobile_menu_close" : "mobile_menu_open")
      return !prev
    })
  }, [])

  const handleDropdownEnter = useCallback((name: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setOpenDropdown(name)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 100)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen, closeMobileMenu])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const schedulingHref = buildLocalePath(locale as Locale, "/agendar")

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-sm border-b border-[#e5e5e5]" : "bg-transparent"}`}
      >
        <div className="container px-4 mx-auto max-w-7xl h-16 flex items-center justify-between">
          <TransitionLink href={locale === "en" ? "/en" : "/"} className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-[#0a0a0a] group">
            <BrandLogo size={24} className="text-[#0a0a0a]" />
            <span>{siteConfig.name}</span>
          </TransitionLink>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) =>
              item.children ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.name)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 px-4 py-2 text-[#525252] hover:text-[#0a0a0a] transition-colors duration-200"
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-150 ${openDropdown === item.name ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 pt-2"
                      >
                        <div className="min-w-[280px] bg-white border border-[#e5e5e5] rounded-[6px] shadow-lg shadow-black/5 py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={resolveHref(locale, child.href)}
                              className="block px-4 py-3 hover:bg-[#f5f5f5] transition-colors duration-150"
                            >
                              <span className="block font-medium text-[#0a0a0a]">
                                {child.name}
                              </span>
                              {child.description && (
                                <span className="block text-sm text-[#525252] mt-0.5">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href ? resolveHref(locale, item.href) : "#"}
                  className="px-4 py-2 text-[#525252] hover:text-[#0a0a0a] transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <Button
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex"
              href={siteConfig.links.contact}
              onClick={() => trackEvent("contact_click")}
            >
              {nav.contact}
            </Button>
            <Button
              size="sm"
              variant="primary"
              href={schedulingHref}
              onClick={() => trackEvent("scheduling_click")}
            >
              {nav.schedule}
            </Button>
            <button
              type="button"
              className="md:hidden p-2 text-[#525252] hover:text-[#0a0a0a] transition-colors"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label={nav.menuLabel}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white border-b border-[#e5e5e5]"
          >
            <div className="container px-4 mx-auto max-w-7xl py-4 flex flex-col gap-1">
              {nav.items.map((item) =>
                item.children ? (
                  <div key={item.name}>
                    <span className="px-4 py-3 text-sm font-medium text-[#a3a3a3] block">
                      {item.name}
                    </span>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={resolveHref(locale, child.href)}
                        onClick={closeMobileMenu}
                        className="pl-6 pr-4 py-3 text-sm font-medium text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-lg transition-colors block"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href ? resolveHref(locale, item.href) : "#"}
                    onClick={closeMobileMenu}
                    className="px-4 py-3 text-sm font-medium text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
              <div className="border-t border-[#e5e5e5] mt-2 pt-3 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  href={siteConfig.links.contact}
                  onClick={(event) => {
                    trackEvent("contact_click")
                    closeMobileMenu()
                    event.currentTarget.blur()
                  }}
                >
                  {nav.contact}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  href={schedulingHref}
                  onClick={(event) => {
                    trackEvent("scheduling_click")
                    closeMobileMenu()
                    event.currentTarget.blur()
                  }}
                >
                  {nav.schedule}
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
