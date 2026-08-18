import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/config/site"
import { isValidLocale, locales, localePrefix } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getDictionary } from "@/content/dictionaries"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { JsonLd } from "@/components/ui/JsonLd"
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/providers/SmoothScroll"
import { MotionProvider } from "@/components/providers/MotionProvider"
import { ScrollProgress } from "@/components/animations/ScrollProgress"
import { notFound } from "next/navigation"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

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
    icons: {
      icon: { url: "/icon.svg", type: "image/svg+xml" },
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
    openGraph: {
      type: "website",
      locale: dict.meta.ogLocale,
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      url: `${siteConfig.url}${localePrefix[locale]}`,
      title: siteConfig.name,
      description: dict.meta.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
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
      images: [`${siteConfig.url}/twitter-image`],
    },
  }
}

export default async function LocaleLayout({ params, children }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-white text-[#0a0a0a] min-h-screen flex flex-col" suppressHydrationWarning>
        <JsonLd data={[organizationJsonLd(dict.meta.description), webSiteJsonLd()]} />
        <MotionProvider>
          <SmoothScroll>
            <ScrollProgress />
            <Header nav={dict.nav} locale={locale} />
            <main className="flex-1 flex flex-col relative">{children}</main>
            <Footer content={dict.footer} locale={locale} />
          </SmoothScroll>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  )
}
