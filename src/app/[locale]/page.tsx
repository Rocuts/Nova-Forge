import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { FlagshipAI } from "@/components/sections/FlagshipAI"
import { Methodology } from "@/components/sections/Methodology"
import { Team } from "@/components/sections/Team"
import { FAQ } from "@/components/sections/FAQ"
import { CTA } from "@/components/sections/CTA"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Hero content={heroContent} />
      <Services content={dict.services} />
      <FlagshipAI content={dict.flagshipAI} />
      <Methodology content={dict.methodology} />
      <Team content={dict.team} />
      <FAQ content={dict.faq} />
      <CTA content={ctaContent} />
    </>
  )
}
