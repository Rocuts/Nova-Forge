import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { FlagshipAI } from "@/components/sections/FlagshipAI"
import { Methodology } from "@/components/sections/Methodology"
import { Metrics } from "@/components/sections/Metrics"
import { Investors } from "@/components/sections/Investors"
import { CTA } from "@/components/sections/CTA"
import { TrustBar } from "@/components/sections/TrustBar"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

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
      <Hero content={heroContent} />
      <TrustBar />
      <Services content={dict.services} />
      <FlagshipAI content={dict.flagshipAI} />
      <Methodology content={dict.methodology} />
      <Metrics content={dict.metrics} />
      <Investors content={dict.investors} />
      <CTA content={ctaContent} />
    </>
  )
}
