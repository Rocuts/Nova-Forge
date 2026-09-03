"use client"
// Composer for /realty (RealTy).
//
// Same structure as LiveStudioLanding: one client boundary, static imports, one
// file per section under ./ so editing the FAQ never means scrolling the whole
// page. Every section animates with motion/react, so splitting this into a
// Server Component with thirteen client islands would buy nothing — it would
// only add thirteen boundaries to the prerendered RSC payload. next/dynamic is
// equally pointless here: the route is SSG and every section is server-rendered
// into the initial HTML for SEO, so its chunk is needed for hydration on first
// load regardless.
//
// Each section receives only the slice of the dictionary it renders, plus the
// shared `statusLabels` map — the honesty contract (DECISIONS §2) requires every
// capability to carry its status, so the labels travel with the content.
//
// The Service/FAQPage/BreadcrumbList JSON-LD lives in the page (see CLAUDE.md).
import { RealtyHero } from "./Hero"
import { RealtyArchitecture } from "./Architecture"
import { RealtyMachine } from "./Machine"
import { RealtyExperience } from "./Experience"
import { RealtyCommandCenter } from "./CommandCenter"
import { RealtyJourney } from "./Journey"
import { RealtyOmnichannel } from "./Omnichannel"
import { RealtyInventory } from "./Inventory"
import { RealtyFollowUp } from "./FollowUp"
import { RealtyVisual } from "./Visual"
import { RealtyImpact } from "./Impact"
import { RealtyProof } from "./Proof"
import { RealtyFaq } from "./Faq"
import { RealtyFinalCta } from "./FinalCta"
import type { RealtyContent } from "./shared"

export type { RealtyContent }

export function RealtyLanding({ content, locale }: { content: RealtyContent; locale: string }) {
  const labels = content.statusLabels
  // The simulated-value token and its screen-reader text are authored once in
  // the command-center slice and reused by the hero dossier frame.
  const { simToken, simSrText } = content.commandCenter

  return (
    <div className="bg-white">
      <RealtyHero
        content={content.hero}
        eyebrow={content.eyebrow}
        statusLine={content.statusLine}
        simToken={simToken}
        simSrText={simSrText}
        locale={locale}
      />
      <RealtyArchitecture content={content.architecture} labels={labels} />
      <RealtyMachine content={content.machine} labels={labels} locale={locale} />
      <RealtyExperience content={content.experience} labels={labels} locale={locale} />
      <RealtyCommandCenter
        content={content.commandCenter}
        labels={labels}
        locale={locale}
        simToken={simToken}
        simSrText={simSrText}
      />
      <RealtyJourney content={content.journey} labels={labels} locale={locale} />
      <RealtyOmnichannel content={content.omnichannel} labels={labels} locale={locale} />
      <RealtyInventory content={content.inventory} labels={labels} locale={locale} />
      <RealtyFollowUp content={content.followUp} labels={labels} locale={locale} />
      <RealtyVisual content={content.visual} labels={labels} locale={locale} />
      <RealtyImpact content={content.impact} labels={labels} locale={locale} />
      <RealtyProof content={content.proof} labels={labels} locale={locale} />
      <RealtyFaq content={content.faq} labels={labels} locale={locale} />
      <RealtyFinalCta
        content={content.cta}
        disclaimer={content.disclaimer}
        labels={labels}
        locale={locale}
      />
    </div>
  )
}
