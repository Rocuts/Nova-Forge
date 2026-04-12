"use client"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface NavContent {
  items: readonly { name: string; href: string }[]
  contact: string
  schedule: string
  menuLabel: string
}

export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen, closeMobileMenu])

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
          <TransitionLink href={locale === "en" ? "/en" : "/"} className="font-heading text-lg font-semibold tracking-tight text-[#0a0a0a]">
            {siteConfig.name}.
          </TransitionLink>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-[#525252] hover:text-[#0a0a0a] transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
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
              {nav.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 text-sm font-medium text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
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
