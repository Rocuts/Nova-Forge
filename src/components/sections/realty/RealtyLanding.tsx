"use client"
// Composer for /realty (RealTy).
//
// Same structure as LiveStudioLanding: one client boundary, static imports, one
// file per section under ./ so editing the FAQ never means scrolling the whole
// page. Every section animates with motion/react, so splitting this into a
// Server Component with nine client islands would buy nothing — it would only
// add nine boundaries to the prerendered RSC payload. next/dynamic is equally
// pointless here: the route is SSG and every section is server-rendered into
// the initial HTML for SEO, so its chunk is needed for hydration on first load
// regardless.
//
// Reading order (v2): the promise, then the buyer's journey, then the two
// screens that prove it (voice advisor, commercial console), then the channels,
// then one honest status section, then objections and the close.
//
// Each section receives only the slice of the dictionary it renders, plus the
// shared `statusLabels` map — the honesty contract (CLAUDE.md, RealTy block)
// requires every capability to carry its status, so the labels travel with the
// content. The two sections with demo figures also receive the single
// demo-data label used to tag their frame.
//
// `content.statusLine` is deliberately not rendered: it is the scope phrase the
// page turns into the meta description (see page.tsx). On the page itself the
// hero's own console tag carries the demonstration caveat.
//
// The Service/FAQPage/BreadcrumbList JSON-LD lives in the page (see CLAUDE.md).
import { RealtyHero } from "./Hero"
import { RealtyOutcomes } from "./Outcomes"
import { RealtyJourney } from "./Journey"
import { RealtyVoice } from "./Voice"
import { RealtyConsole } from "./Console"
import { RealtyChannels } from "./Channels"
import { RealtyStatus } from "./Status"
import { RealtyFaq } from "./Faq"
import { RealtyFinalCta } from "./FinalCta"
import type { RealtyContent } from "./shared"

export type { RealtyContent }

export function RealtyLanding({ content, locale }: { content: RealtyContent; locale: string }) {
  const statusLabels = content.statusLabels
  const { demoLabel, demoSrText } = content

  return (
    <div className="bg-white">
      <RealtyHero
        content={content.hero}
        eyebrow={content.eyebrow}
        demoLabel={demoLabel}
        demoSrText={demoSrText}
        locale={locale}
      />
      <RealtyOutcomes content={content.outcomes} />
      <RealtyJourney content={content.journey} statusLabels={statusLabels} />
      <RealtyVoice content={content.voice} statusLabels={statusLabels} />
      <RealtyConsole
        content={content.console}
        statusLabels={statusLabels}
        demoLabel={demoLabel}
        demoSrText={demoSrText}
      />
      <RealtyChannels content={content.channels} statusLabels={statusLabels} />
      <RealtyStatus content={content.status} statusLabels={statusLabels} />
      <RealtyFaq content={content.faq} />
      <RealtyFinalCta content={content.cta} locale={locale} />
    </div>
  )
}
