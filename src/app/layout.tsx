/* Z-INDEX MAP:
 * z-0:     GlobalParticles (fixed background)
 * z-10:    Main content (sections)
 * z-40:    Mobile menu overlay (when open)
 * z-50:    Header (fixed top)
 * z-50:    ContactAssistant FAB + chat panel (fixed bottom-right)
 * z-50:    SoundToggle (fixed bottom-left)
 * z-100:   Noise overlay (body::after, pointer-events: none)
 * z-[9998]: IntroSequence overlay (removed from DOM after animation)
 * z-9999:  CustomCursor (pointer-events: none)
 */

import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/config/site"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ContactAssistant } from "@/components/sections/ContactAssistant"
import { GlobalParticles } from "@/components/canvas/GlobalParticles"
import { SmoothScroll } from "@/components/providers/SmoothScroll"
import { CustomCursorWrapper } from "@/components/ui/CustomCursorWrapper"
import { IntroSequenceWrapper } from "@/components/ui/IntroSequenceWrapper"
import { SoundToggleWrapper } from "@/components/ui/SoundToggleWrapper"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Software de Precisión Empresarial`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: siteConfig.images.logo,
    shortcut: siteConfig.images.logo,
    apple: siteConfig.images.logo,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.images.social,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Software de Precisión Empresarial`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.images.twitter],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Configuración de JSON-LD estricto para la Organización
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "legalName": siteConfig.legalName,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}${siteConfig.images.logo}`,
    "description": siteConfig.description,
    "email": siteConfig.contactEmail,
    "sameAs": [siteConfig.links.twitter, siteConfig.links.linkedin]
  }

  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-surface-base text-text-primary min-h-screen flex flex-col selection:bg-primary-cyan selection:text-black">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SmoothScroll>
          {/* Global Particle Background */}
          <GlobalParticles />

          <Header />
          <main className="flex-1 flex flex-col relative z-10">{children}</main>
          <ContactAssistant />
          <Footer />
        </SmoothScroll>
        <IntroSequenceWrapper />
        <CustomCursorWrapper />
        <SoundToggleWrapper />
      </body>
    </html>
  )
}
