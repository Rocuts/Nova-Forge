import type { Metadata } from "next"
import { LegalPage } from "@/components/sections/LegalPage"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale, localePrefix } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.privacy.title,
    description: dict.privacy.description,
    alternates: {
      canonical: `${localePrefix[locale]}/privacidad`,
      languages: {
        es: "/privacidad",
        en: "/en/privacy",
      },
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return (
    <LegalPage
      title={dict.privacy.title}
      description={dict.privacy.description}
      updatedAt={dict.privacy.updatedAt}
      labels={dict.legalPage}
    >
      {dict.privacy.sections.map((section) => (
        <article key={section.title} className="space-y-4">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold">
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-text-secondary text-base md:text-lg leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </article>
      ))}
    </LegalPage>
  )
}
