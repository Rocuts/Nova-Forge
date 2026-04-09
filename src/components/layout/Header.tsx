"use client"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { siteConfig } from "@/config/site"
import { navItems } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
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

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-surface-base/80 backdrop-blur-md border-b border-surface-border" : "bg-transparent"}`}
      >
        <div className="container px-4 mx-auto max-w-7xl h-20 flex items-center justify-between">
          <TransitionLink href="/" className="font-heading text-xl font-bold tracking-tight whitespace-nowrap">
            {siteConfig.name}
          </TransitionLink>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium relative">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-zinc-200 font-semibold hover:text-white transition-colors duration-200"
                onMouseEnter={() => setHoveredPath(item.href)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="relative z-10">{item.name}</span>
                {hoveredPath === item.href && (
                  <motion.span
                    layoutId="navbar-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-surface-elevated/80 border border-surface-border backdrop-blur-md rounded-full -z-0"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="glass"
              className="hidden sm:inline-flex"
              href={siteConfig.links.contact}
              onClick={() => trackEvent("contact_click")}
            >
              Contacto
            </Button>
            <Button
              size="sm"
              href={siteConfig.links.scheduling}
              onClick={() => trackEvent("scheduling_click")}
            >
              Agendar
            </Button>
            <button
              type="button"
              className="md:hidden p-2 text-text-secondary hover:text-white transition-colors"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Menú de navegación"
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
            className="fixed top-20 left-0 right-0 z-40 md:hidden bg-surface-base/95 backdrop-blur-md border-b border-surface-border"
          >
            <div className="container px-4 mx-auto max-w-7xl py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-elevated/50 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-surface-border mt-2 pt-3 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="glass"
                  className="w-full"
                  href={siteConfig.links.contact}
                  onClick={(event) => {
                    trackEvent("contact_click")
                    closeMobileMenu()
                    event.currentTarget.blur()
                  }}
                >
                  Contacto
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  href={siteConfig.links.scheduling}
                  onClick={(event) => {
                    trackEvent("scheduling_click")
                    closeMobileMenu()
                    event.currentTarget.blur()
                  }}
                >
                  Agendar
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
