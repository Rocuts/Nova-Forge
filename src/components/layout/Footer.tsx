import Link from "next/link"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { siteConfig } from "@/config/site"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface FooterContent {
  tagline: string
  platform: string
  platformLinks: readonly { name: string; href: string }[]
  company: string
  companyLinks: readonly { name: string; href: string }[]
  legal: string
  privacy: string
  terms: string
  copyright: string
}

export function Footer({ content, locale }: { content: FooterContent; nav?: unknown; locale: string }) {
  const currentYear = new Date().getFullYear()
  const privacyHref = buildLocalePath(locale as Locale, "/privacidad")
  const termsHref = buildLocalePath(locale as Locale, "/terminos")

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-[#1a1a1a] pt-16 pb-8">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-heading text-xl font-semibold text-white mb-4">
              {siteConfig.name}
            </h3>
            <p className="text-[#a3a3a3] max-w-sm mb-6 leading-relaxed">
              {content.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="text-[#a3a3a3] hover:text-white transition-colors">Twitter X</a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#a3a3a3] hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">{content.platform}</h4>
            <ul className="space-y-3 text-[#a3a3a3]">
              {content.platformLinks.map((link) => (
                <li key={link.href}>
                  <TransitionLink
                    href={buildLocalePath(locale as Locale, link.href)}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">{content.company}</h4>
            <ul className="space-y-3 text-[#a3a3a3]">
              {content.companyLinks.map((link) => {
                const isAnchor = link.href.startsWith("#")
                const href = isAnchor ? link.href : buildLocalePath(locale as Locale, link.href)
                return (
                  <li key={link.href}>
                    {isAnchor ? (
                      <Link href={href} className="hover:text-white transition-colors">{link.name}</Link>
                    ) : (
                      <TransitionLink href={href} className="hover:text-white transition-colors">{link.name}</TransitionLink>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">{content.legal}</h4>
            <ul className="space-y-3 text-[#a3a3a3]">
              <li><TransitionLink href={privacyHref} className="hover:text-white transition-colors">{content.privacy}</TransitionLink></li>
              <li><TransitionLink href={termsHref} className="hover:text-white transition-colors">{content.terms}</TransitionLink></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1a1a1a] text-center text-[#a3a3a3] text-sm">
          &copy; {currentYear} {siteConfig.legalName}. {content.copyright}
        </div>
      </div>
    </footer>
  )
}
