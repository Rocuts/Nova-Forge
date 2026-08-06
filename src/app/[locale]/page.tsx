import dynamic from "next/dynamic"
import type { Metadata } from "next"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath, buildAlternates } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

const Services = dynamic(() => import("@/components/sections/Services").then(m => ({ default: m.Services })))
const FlagshipAI = dynamic(() => import("@/components/sections/FlagshipAI").then(m => ({ default: m.FlagshipAI })))
const CaseStudy = dynamic(() => import("@/components/sections/CaseStudy").then(m => ({ default: m.CaseStudy })))
const LiveStudioTeaser = dynamic(() => import("@/components/sections/LiveStudioTeaser").then(m => ({ default: m.LiveStudioTeaser })))
const Methodology = dynamic(() => import("@/components/sections/Methodology").then(m => ({ default: m.Methodology })))
const TechStack = dynamic(() => import("@/components/sections/TechStack").then(m => ({ default: m.TechStack })))
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })))
const CTA = dynamic(() => import("@/components/sections/CTA").then(m => ({ default: m.CTA })))


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  return {
    alternates: buildAlternates("/", locale),
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  // FAQPage schema — must stay in sync with dict.faq.items (see CLAUDE.md)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const heroContent = {
    ...dict.hero,
    primaryAction: {
      ...dict.hero.primaryAction,
      href: buildLocalePath(locale, "/diagnostico"),
    },
    secondaryAction: {
      ...dict.hero.secondaryAction,
      href: dict.hero.secondaryAction.href,
    },
    nurtureCta: dict.hero.nurtureCta ? {
      ...dict.hero.nurtureCta,
      href: buildLocalePath(locale, dict.hero.nurtureCta.href),
    } : undefined,
  }

  const ctaContent = {
    ...dict.cta,
    action: {
      ...dict.cta.action,
      href: buildLocalePath(locale, "/agendar"),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Hero content={heroContent} />
      <TrustBar label={dict.trustBar.label} />
      <Services content={dict.services} locale={locale} />
      <FlagshipAI content={dict.flagshipAI} />
      <CaseStudy content={dict.caseStudy} locale={locale} />
      <LiveStudioTeaser content={dict.liveStudioTeaser} locale={locale} />
      <Methodology content={dict.methodology} />
      <TechStack content={dict.techStack} />
      <FAQ content={dict.faq} />
      <CTA content={ctaContent} />
    </>
  )
}
