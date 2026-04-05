import type { Metadata } from "next"

import { LegalPage } from "@/components/sections/LegalPage"
import { siteConfig } from "@/config/site"
import { termsOfService } from "@/content/legal"

export const metadata: Metadata = {
  title: termsOfService.title,
  description: termsOfService.description,
  alternates: {
    canonical: siteConfig.legal.terms,
  },
}

export default function TermsPage() {
  return (
    <LegalPage
      title={termsOfService.title}
      description={termsOfService.description}
      updatedAt={termsOfService.updatedAt}
    >
      {termsOfService.sections.map((section) => (
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
