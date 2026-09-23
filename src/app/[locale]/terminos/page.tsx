import type { Metadata } from "next"
import { LegalPage } from "@/components/sections/LegalPage"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import type { Locale } from "@/lib/i18n"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/terminos")
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return (
    <LegalPage
      title={dict.terms.title}
      description={dict.terms.description}
      updatedAt={dict.terms.updatedAt}
      labels={dict.legalPage}
    >
      {dict.terms.sections.map((section) => (
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
