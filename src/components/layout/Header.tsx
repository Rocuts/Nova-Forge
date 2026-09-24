"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import type { MouseEvent } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence } from "motion/react"
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
import { MEGA_MENU_ID, getNavLandmarkLabels, resolveHref } from "./header/types"
import type { HeaderTone, MenuBlockId, NavContent } from "./header/types"

// Every color comes from the --hdr-* variables that globals.css sets per
// data-tone / data-scrolled. The `color:` hint in the arbitrary values is what
// lets tailwind-merge (cn, inside Button) replace the variant's own colors.
const navLinkClass =
  "nav-link-hover px-4 py-2 transition-colors duration-200 text-[color:var(--hdr-link)] hover:text-[color:var(--hdr-link-hover)] aria-expanded:text-[color:var(--hdr-link-hover)]"

// MegaMenu is imported statically on purpose. It only mounts while the menu is
// open, so loading it through next/dynamic({ ssr: false }) looked attractive —
// but measured on this build it is a net loss: the overlay is 4.3 kB while the
// next/dynamic loader runtime costs ~5.3 kB, and because Header lives in the
// root layout that runtime lands in the shared bundle of *every* route.
// See the note in next.config.ts for the matching CSP trade-off.
export function Header({ nav, locale }: { nav: NavContent; locale: string }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  // Block of the panel that takes focus on opening ("Productos" → Products);
  // undefined means the panel's first link.
  const [menuBlock, setMenuBlock] = useState<MenuBlockId | undefined>(undefined)
  // Any route change closes the menu: a direct nav link, Back/Forward. Derived
  // during render (React's "store information from previous renders"), not in
  // an effect: react-hooks/set-state-in-effect forbids that. The links that can
  // point at the current page ("Empresa", logo, CTA) also close it on click.
  const [menuPathname, setMenuPathname] = useState(pathname)
  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setIsMegaMenuOpen(false)
  }
  const logoRef = useRef<HTMLDivElement>(null)
  // The button that opened the menu ("Servicios", "Productos" or the
  // hamburger): Escape gives focus back to it.
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const { scrollY } = useScroll()
  const isDarkSection = useDarkSectionDetection(pathname)

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

  const toggleMegaMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, block?: MenuBlockId) => {
      if (!isMegaMenuOpen) {
        openerRef.current = event.currentTarget
        setMenuBlock(block)
      }
      trackEvent(isMegaMenuOpen ? "mega_menu_close" : "mega_menu_open")
      setIsMegaMenuOpen(!isMegaMenuOpen)
    },
    [isMegaMenuOpen]
  )

  // Escape closes the menu and gives focus back to the button that opened it
  useEffect(() => {
    if (!isMegaMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setIsMegaMenuOpen(false)
      openerRef.current?.focus()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMegaMenuOpen])

  // While the panel covers the page: lock the body scroll, and make what lies
  // under it (main content and footer) inert, so that Tab past the panel's last
  // link never lands on a hidden element. The header stays reachable.
  useEffect(() => {
    if (!isMegaMenuOpen) return
    const covered = Array.from(document.querySelectorAll<HTMLElement>("main, .site-footer"))
    document.body.style.overflow = "hidden"
    covered.forEach((element) => {
      element.inert = true
    })
    return () => {
      document.body.style.overflow = ""
      covered.forEach((element) => {
        element.inert = false
      })
    }
  }, [isMegaMenuOpen])

  const schedulingHref = buildLocalePath(locale as Locale, "/agendar")

  // The open menu wins; otherwise the section under the header decides. While
  // that is unknown (server, first client render, right after a route change)
  // the attribute stays off and globals.css reads data-header-start instead.
  const tone: HeaderTone | undefined = isMegaMenuOpen
    ? "menu"
    : isDarkSection === null
      ? undefined
      : isDarkSection
        ? "dark"
        : "light"

  // "Servicios", "Productos" and the hamburger open the same panel; `block`
  // says where focus lands in it. aria-controls only while the panel exists:
  // axe flags an id that is not there.
  const menuTriggerProps = (block?: MenuBlockId) => ({
    onClick: (event: MouseEvent<HTMLButtonElement>) => toggleMegaMenu(event, block),
    "aria-expanded": isMegaMenuOpen,
    "aria-controls": isMegaMenuOpen ? MEGA_MENU_ID : undefined,
  })

  return (
    <>
      <header
        data-tone={tone}
        data-scrolled={isScrolled ? "true" : undefined}
        className="site-header fixed top-0 w-full z-50 border-b border-[color:var(--hdr-border)] bg-[color:var(--hdr-bg)] text-[color:var(--hdr-fg)] transition-colors duration-300 data-[scrolled=true]:backdrop-blur-sm"
      >
        <div className="container px-4 mx-auto max-w-7xl h-16 flex items-center justify-between">
          {/* Left: Logo (inherits --hdr-fg) */}
          <TransitionLink
            href={buildLocalePath(locale as Locale, "/")}
            onClick={closeMegaMenu}
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight group"
          >
            {/* Logo with CSS micro-glitch on load (once) */}
            <div ref={logoRef}>
              <BrandLogo size={24} />
            </div>
            <span>{siteConfig.name}</span>
          </TransitionLink>

          {/* Center: Desktop nav — "Servicios" and "Productos" open the mega menu */}
          <nav aria-label={getNavLandmarkLabels(locale).header} className="hidden md:flex items-center gap-1 text-sm font-medium">
            {nav.items.map((item) =>
              item.opensMenu ? (
                <button key={item.name} type="button" {...menuTriggerProps(item.menuBlock)} className={navLinkClass}>
                  {item.name}
                </button>
              ) : (
                <Link key={item.name} href={resolveHref(locale, item.href)} onClick={closeMegaMenu} className={navLinkClass}>
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right: Actions. Below 360 px (down to WCAG's 320) tighter gaps and a
              narrower CTA keep them clear of the logo and inside the gutter. */}
          <div className="flex items-center gap-2 min-[360px]:gap-3">
            <div className="[&_a]:text-[color:var(--hdr-link)] [&_a]:border-[color:var(--hdr-control-border)] [&_a:hover]:text-[color:var(--hdr-link-hover)] [&_a:hover]:border-[color:var(--hdr-control-border-hover)]">
              <LanguageSwitcher locale={locale} />
            </div>
            <Button
              size="sm"
              className="px-2.5 min-[360px]:px-5 border border-[color:var(--hdr-cta-border)] bg-[color:var(--hdr-cta-bg)] text-[color:var(--hdr-cta-fg)] hover:border-[color:var(--hdr-cta-border-hover)] hover:bg-[color:var(--hdr-cta-bg-hover)] focus-visible:ring-[color:var(--hdr-focus)] focus-visible:ring-offset-[color:var(--hdr-focus-offset)]"
              href={schedulingHref}
              onClick={() => {
                trackEvent("scheduling_click")
                closeMegaMenu()
              }}
            >
              {nav.schedule}
            </Button>
            <button
              type="button"
              {...menuTriggerProps()}
              aria-label={nav.menuLabel}
              className="w-11 h-11 rounded-[6px] flex items-center justify-center border border-[color:var(--hdr-control-border)] bg-[color:var(--hdr-control-bg)] text-[color:var(--hdr-control-fg)] hover:bg-[color:var(--hdr-control-bg-hover)] hover:text-[color:var(--hdr-control-fg-hover)] transition-colors duration-200"
            >
              <HamburgerIcon isOpen={isMegaMenuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mega menu overlay — DARK */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <MegaMenu
            key="mega-menu"
            locale={locale}
            platformLinks={nav.platformLinks}
            solutionsLinks={nav.solutionsLinks}
            productLinks={nav.productLinks}
            initialBlock={menuBlock}
            onClose={closeMegaMenu}
          />
        )}
      </AnimatePresence>
    </>
  )
}
