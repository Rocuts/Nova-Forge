import dynamic from "next/dynamic"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

const Services = dynamic(() => import("@/components/sections/Services").then(m => ({ default: m.Services })))
const FlagshipAI = dynamic(() => import("@/components/sections/FlagshipAI").then(m => ({ default: m.FlagshipAI })))
const Methodology = dynamic(() => import("@/components/sections/Methodology").then(m => ({ default: m.Methodology })))
const TechStack = dynamic(() => import("@/components/sections/TechStack").then(m => ({ default: m.TechStack })))
const Metrics = dynamic(() => import("@/components/sections/Metrics").then(m => ({ default: m.Metrics })))
const CTA = dynamic(() => import("@/components/sections/CTA").then(m => ({ default: m.CTA })))


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
      <TechStack content={dict.techStack} />
      <Metrics content={dict.metrics} />
      <CTA content={ctaContent} />
    </>
  )
}
