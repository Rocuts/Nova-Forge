import type { Metadata } from "next"
import { ScheduleForm } from "@/components/sections/ScheduleForm"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, localePrefix } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { siteConfig } from "@/config/site"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.schedule.pageTitle,
    description: dict.schedule.pageSubtitle,
    alternates: {
      canonical: `${localePrefix[locale]}/agendar`,
      languages: {
        es: "/agendar",
        en: "/en/schedule",
      },
    },
    openGraph: {
      title: `${dict.schedule.pageTitle} | ${siteConfig.name}`,
      description: dict.schedule.pageSubtitle,
    },
  }
}

export default async function SchedulePage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return <ScheduleForm content={dict.schedule} locale={locale} />
}
