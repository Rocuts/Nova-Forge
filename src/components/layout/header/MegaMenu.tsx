"use client"
import Link from "next/link"
import { motion } from "motion/react"
import { siteConfig } from "@/config/site"
import { trackEvent } from "@/lib/analytics"
import { getMegaMenuLabels, megaMenuEase, resolveHref } from "./types"
import type { NavChild, NavItem } from "./types"

/**
 * The dark overlay panel. It is only ever mounted while the menu is open — it
 * was never part of the server-rendered HTML — so Header loads it through
 * next/dynamic with ssr:false and keeps it out of the shared first-load bundle.
 */
export function MegaMenu({
  locale,
  platformLinks,
  solutionsLinks,
  directItems,
  onClose,
}: {
  locale: string
  platformLinks: readonly NavChild[]
  solutionsLinks: readonly NavChild[]
  directItems: readonly NavItem[]
  onClose: () => void
}) {
  const labels = getMegaMenuLabels(locale)

  return (
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
                  onClick={onClose}
                  className={`block py-4 group/desc ${
                    i < platformLinks.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
                    <span className="text-[#525252] mr-1.5">&#8627;</span>
                    {link.name}
                  </span>
                  {link.description && (
                    <span className="block text-sm text-[#525252] mt-1">{link.description}</span>
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
                  onClick={onClose}
                  className={`block py-4 group/desc ${
                    i < solutionsLinks.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <span className="text-base font-medium text-white group-hover/desc:text-[#a3a3a3] transition-colors">
                    <span className="text-[#525252] mr-1.5">&#8627;</span>
                    {link.name}
                  </span>
                  {link.description && (
                    <span className="block text-sm text-[#525252] mt-1">{link.description}</span>
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
                  onClick={onClose}
                  className="text-base font-medium text-white hover:text-[#a3a3a3] transition-colors inline-flex items-center"
                >
                  {item.accent ? (
                    <span className="live-dot mr-2.5" aria-hidden="true" />
                  ) : (
                    <span className="text-[#525252] mr-1.5">&#8627;</span>
                  )}
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
            <p className="text-base text-[#a3a3a3] leading-relaxed mb-6">{labels.aboutText}</p>
            <Link
              href={resolveHref(locale, "/nosotros")}
              onClick={onClose}
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
                  onClose()
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
  )
}
