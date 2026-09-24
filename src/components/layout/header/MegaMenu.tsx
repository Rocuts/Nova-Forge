"use client"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { m } from "motion/react"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { MEGA_MENU_ID, getMegaMenuLabels, getNavLandmarkLabels, megaMenuEase, resolveHref } from "./types"
import type { MenuBlockId, NavLink } from "./types"

const blockTitleClass = "text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3]"

/** One titled list of links: Platform, Solutions or Products. */
function MenuBlock({
  id,
  title,
  links,
  locale,
  onClose,
}: {
  id: MenuBlockId
  title: string
  links: readonly NavLink[]
  locale: string
  onClose: () => void
}) {
  return (
    <div data-menu-block={id}>
      <h3 className={`${blockTitleClass} mb-8`}>{title}</h3>
      <div className="flex flex-col">
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={resolveHref(locale, link.href)}
            onClick={onClose}
            className={`block py-4 group/desc ${i < links.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
              <span aria-hidden="true" className="text-[#a3a3a3] mr-1.5">&#8627;</span>
              {link.name}
            </span>
            {link.description && (
              <span className="block text-sm text-[#a3a3a3] mt-1">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

/**
 * The dark overlay panel. It only mounts while the menu is open (it was never
 * part of the server HTML). On mount it moves focus to the first link of
 * `initialBlock` ("Productos" → RealTy), or to its first link when there is
 * none; Header owns Escape and gives focus back to the button that opened it.
 */
export function MegaMenu({
  locale,
  platformLinks,
  solutionsLinks,
  productLinks,
  initialBlock,
  onClose,
}: {
  locale: string
  platformLinks: readonly NavLink[]
  solutionsLinks: readonly NavLink[]
  productLinks: readonly NavLink[]
  initialBlock?: MenuBlockId
  onClose: () => void
}) {
  const labels = getMegaMenuLabels(locale)
  const landmarks = getNavLandmarkLabels(locale)
  const panelRef = useRef<HTMLDivElement>(null)

  // The panel remounts on every opening, so this runs once per opening.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const scope = initialBlock ? panel.querySelector(`[data-menu-block="${initialBlock}"]`) : panel
    const target = scope?.querySelector<HTMLAnchorElement>("a[href]")
    if (!target) return
    // preventScroll: focusing must not scroll while the panel slides in.
    target.focus({ preventScroll: true })
    // A block further down (Products) may start below a short viewport: keep the focused link in view.
    if (initialBlock) target.scrollIntoView({ block: "nearest" })
  }, [initialBlock])

  return (
    <m.div
      ref={panelRef}
      id={MEGA_MENU_ID}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: megaMenuEase }}
      className="fixed inset-0 top-16 z-40 bg-[#0a0a0a] text-white overflow-y-auto"
    >
      {/* The hairline above the panel is the header's own bottom border (tone "menu"). */}
      <div className="container px-6 mx-auto max-w-7xl py-12">
        {/* A named <nav>: below md the header nav is hidden and this panel carries every link. */}
        <nav aria-label={landmarks.menu} className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: PLATFORM — core technology services */}
          <MenuBlock id="platform" title={labels.platform} links={platformLinks} locale={locale} onClose={onClose} />

          {/* Column 2: SOLUTIONS (use-case oriented) and, below, the PRODUCTS we build and run */}
          <div className="flex flex-col gap-12">
            <MenuBlock id="solutions" title={labels.solutions} links={solutionsLinks} locale={locale} onClose={onClose} />
            <MenuBlock id="products" title={labels.products} links={productLinks} locale={locale} onClose={onClose} />
          </div>

          {/* Column 3: ABOUT + CONTACT */}
          <div>
            <h3 className={`${blockTitleClass} mb-8`}>{labels.about}</h3>
            <p className="text-base text-[#a3a3a3] leading-relaxed mb-6">{labels.aboutText}</p>
            <Link
              href={resolveHref(locale, "/nosotros")}
              onClick={onClose}
              className="inline-block text-sm text-white hover:text-[#a3a3a3] border-b border-white/20 pb-0.5 transition-colors"
            >
              <span aria-hidden="true" className="text-[#a3a3a3] mr-1.5">&#8627;</span>
              {labels.learnMore}
            </Link>

            <div className="mt-10">
              <h3 className={`${blockTitleClass} mb-4`}>{labels.contact}</h3>
              <a
                href={siteConfig.links.contact}
                onClick={() => {
                  trackEvent("contact_click")
                  onClose()
                }}
                className="text-base font-medium text-white hover:text-[#a3a3a3] transition-colors"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 mt-12">
        <div className="container px-6 mx-auto max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#a3a3a3]">
            &copy; {new Date().getFullYear()} {siteConfig.legalName}
          </span>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              Twitter / X
            </a>
            <span aria-hidden="true" className="text-white/10">&middot;</span>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </m.div>
  )
}
