import { InvestorsPage } from "@/components/sections/InvestorsPage"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: dict.investorsPage.title,
    description: dict.investorsPage.subtitle,
  }
}

export default async function InvestorsLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  return <InvestorsPage content={dict.investorsPage} />
}
