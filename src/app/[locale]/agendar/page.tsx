import type { Metadata } from "next"
import { ScheduleForm } from "@/components/sections/ScheduleForm"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/agendar")
}

export default async function SchedulePage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return <ScheduleForm content={dict.schedule} locale={locale} />
}
