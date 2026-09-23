import { AboutPage } from "@/components/sections/AboutPage"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/nosotros")
}

export default async function AboutLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  return <AboutPage content={dict.aboutPage} locale={locale} />
}
