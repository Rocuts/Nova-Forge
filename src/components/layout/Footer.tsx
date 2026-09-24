import Link from "next/link"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { siteConfig } from "@/config/site"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface FooterLink {
  name: string
  href: string
}

interface FooterContent {
  tagline: string
  platform: string
  platformLinks: readonly FooterLink[]
  solutions: string
  solutionsLinks: readonly FooterLink[]
  products: string
  productLinks: readonly FooterLink[]
  company: string
  companyLinks: readonly FooterLink[]
  legal: string
  privacy: string
  terms: string
  copyright: string
}

const linkClass = "hover:text-white transition-colors"

/** In-page anchors stay plain links; pages go through TransitionLink with the locale prefix. */
function FooterLinkItem({ link, locale }: { link: FooterLink; locale: string }) {
  if (link.href.startsWith("#")) {
    return (
      <Link href={link.href} className={linkClass}>
        {link.name}
      </Link>
    )
  }
  return (
    <TransitionLink href={buildLocalePath(locale as Locale, link.href)} className={linkClass}>
      {link.name}
    </TransitionLink>
  )
}

function FooterColumn({ title, links, locale }: { title: string; links: readonly FooterLink[]; locale: string }) {
  return (
    <div>
      <h4 className="font-medium text-white mb-4">{title}</h4>
      <ul className="space-y-3 text-[#a3a3a3]">
        {/* key by name: two product links share the studio's href */}
        {links.map((link) => (
          <li key={link.name}>
            <FooterLinkItem link={link} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer({ content, locale }: { content: FooterContent; locale: string }) {
  const currentYear = new Date().getFullYear()
  const legalLinks: readonly FooterLink[] = [
    { name: content.privacy, href: "/privacidad" },
    { name: content.terms, href: "/terminos" },
  ]

  // Dark like the hero: data-header-theme keeps the header dark over it (the
  // detection hook watches any element with the attribute, not only sections),
  // and .site-footer gives it the white focus ring (globals.css).
  // Seven columns only from xl: at lg (1024 px) they were ~114 px wide and
  // "Enriquecimiento" or "Automatización" spilled out of theirs. At lg the brand
  // takes its own row and the five link columns share the next one.
  return (
    <footer data-header-theme="dark" className="site-footer bg-[#0a0a0a] text-white border-t border-[#1a1a1a] pt-16 pb-8">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-x-8 gap-y-12 mb-16">
          <div className="sm:col-span-2 lg:col-span-5 xl:col-span-2">
            <h3 className="font-heading text-xl font-semibold text-white mb-4">
              {siteConfig.name}
            </h3>
            <p className="text-[#a3a3a3] max-w-sm mb-6 leading-relaxed">
              {content.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="py-2 text-[#a3a3a3] hover:text-white transition-colors">Twitter X</a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="py-2 text-[#a3a3a3] hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>

          <FooterColumn title={content.platform} links={content.platformLinks} locale={locale} />
          <FooterColumn title={content.solutions} links={content.solutionsLinks} locale={locale} />
          <FooterColumn title={content.products} links={content.productLinks} locale={locale} />
          <FooterColumn title={content.company} links={content.companyLinks} locale={locale} />
          <FooterColumn title={content.legal} links={legalLinks} locale={locale} />
        </div>

        <div className="pt-8 border-t border-[#1a1a1a] text-center text-[#a3a3a3] text-sm">
          &copy; {currentYear} {siteConfig.legalName}. {content.copyright}
        </div>
      </div>
    </footer>
  )
}
