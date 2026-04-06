/* Z-INDEX MAP:
 * z-0:     GlobalParticles (fixed background)
 * z-10:    Main content (sections)
 * z-40:    Mobile menu overlay (when open)
 * z-50:    Header (fixed top)
 * z-50:    SoundToggle (fixed bottom-left)
 * z-100:   Noise overlay (body::after, pointer-events: none)
 * z-[9998]: IntroSequence overlay (removed from DOM after animation)
 * z-9999:  CustomCursor (pointer-events: none)
 */

import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/config/site"
import { isValidLocale, locales, localePrefix } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getDictionary } from "@/content/dictionaries"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { GlobalParticles } from "@/components/canvas/GlobalParticles"
import { SmoothScroll } from "@/components/providers/SmoothScroll"
import { CustomCursorWrapper } from "@/components/ui/CustomCursorWrapper"
import { IntroSequenceWrapper } from "@/components/ui/IntroSequenceWrapper"
import { SoundToggleWrapper } from "@/components/ui/SoundToggleWrapper"
import { notFound } from "next/navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}

  const dict = await getDictionary(locale)

  return {
    title: {
      default: `${siteConfig.name} — ${dict.meta.titleSuffix}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: dict.meta.description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: localePrefix[locale] || "/",
      languages: {
        es: "/",
        en: "/en",
      },
    },
    icons: {
      icon: siteConfig.images.logo,
      shortcut: siteConfig.images.logo,
      apple: siteConfig.images.logo,
    },
    openGraph: {
      type: "website",
      locale: dict.meta.ogLocale,
      url: `${siteConfig.url}${localePrefix[locale]}`,
      title: siteConfig.name,
      description: dict.meta.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.images.social,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${dict.meta.titleSuffix}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: dict.meta.description,
      images: [siteConfig.images.twitter],
    },
  }
}

export default async function LocaleLayout({ params, children }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.images.logo}`,
    description: dict.meta.description,
    email: siteConfig.contactEmail,
    sameAs: [siteConfig.links.twitter, siteConfig.links.linkedin],
  }

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-surface-base text-text-primary min-h-screen flex flex-col selection:bg-primary-cyan selection:text-black">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SmoothScroll>
          <GlobalParticles />
          <Header nav={dict.nav} locale={locale} />
          <main className="flex-1 flex flex-col relative z-10">{children}</main>
          <Footer content={dict.footer} nav={dict.nav} locale={locale} />
        </SmoothScroll>
        <IntroSequenceWrapper />
        <CustomCursorWrapper />
        <SoundToggleWrapper />
      </body>
    </html>
  )
}
