import type { Metadata } from "next"
import { DiagnosticWizard } from "@/components/diagnostic/DiagnosticWizard"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/diagnostico")
}

export default async function DiagnosticoPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return (
    <section className="py-32 relative z-10 min-h-screen">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#e5e5e5] bg-[#f8f8f8] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0a0a0a]">
              {dict.diagnosticPage.badge}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {dict.diagnosticPage.pageTitle}
          </h1>
          <p className="text-lg text-[#525252] max-w-2xl mx-auto leading-relaxed">
            {dict.diagnosticPage.pageSubtitle}
          </p>
        </div>

        <DiagnosticWizard
          content={dict.diagnostic}
          reportContent={dict.diagnosticReport}
          options={dict.diagnosticOptions}
          locale={locale}
        />
      </div>
    </section>
  )
}
