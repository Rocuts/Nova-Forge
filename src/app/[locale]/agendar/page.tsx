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

  return (
    <section className="py-32 relative z-10 min-h-screen">
      <div className="container px-4 mx-auto max-w-2xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-cyan/30 bg-primary-cyan/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-cyan/80">
              {dict.schedule.badge}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {dict.schedule.pageTitle}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {dict.schedule.pageSubtitle}
          </p>
        </div>

        <ScheduleForm content={dict.schedule} locale={locale} />
      </div>
    </section>
  )
}
