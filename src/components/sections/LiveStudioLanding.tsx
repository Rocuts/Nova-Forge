"use client"
// Composer for /estudio-tiktok-live.
//
// This was a single 722-line module. The markup now lives in one file per
// section under ./live-studio/, so editing the FAQ or the pricing modalities no
// longer means scrolling through the whole page. Each island takes only the
// slice of the dictionary it renders, which keeps the prop contracts honest.
//
// Two structural options were measured against this build and rejected:
//
//  * Making this a Server Component with one client island per section. Every
//    section animates with motion/react, so only the CSS marquee could actually
//    stay on the server — and the 10 extra client boundaries added ~9 kB to the
//    prerendered RSC payload (95.7 kB -> 104.7 kB) to save well under 1 kB of JS.
//
//  * Routing the below-the-fold sections through next/dynamic. The route is SSG
//    and every section is server-rendered into the initial HTML for SEO, so its
//    chunk is required for hydration on first load regardless; Turbopack merges
//    them back into one chunk and the only measurable effect was the loader
//    runtime (~1 kB/route). The same applies to the next/dynamic block already
//    in src/app/[locale]/page.tsx.
//
// So: split for readability, single client boundary, static imports. Net cost
// of the split is ~0.4 kB gzipped; the prerendered HTML is byte-identical in
// size to before.
//
// The FAQPage/Service JSON-LD lives in the page (see CLAUDE.md), untouched.
import { LiveStudioHero } from "./live-studio/Hero"
import { LiveStudioMarquee } from "./live-studio/Marquee"
import type { LiveStudioContent } from "./live-studio/shared"

export type { LiveStudioContent }

import { LiveStudioStats } from "./live-studio/Stats"
import { LiveStudioThesis } from "./live-studio/Thesis"
import { LiveStudioProgram } from "./live-studio/Program"
import { LiveStudioModalities } from "./live-studio/Modalities"
import { LiveStudioInfrastructure } from "./live-studio/Infrastructure"
import { LiveStudioCreators } from "./live-studio/Creators"
import { LiveStudioBrands } from "./live-studio/Brands"
import { LiveStudioFaq } from "./live-studio/Faq"
import { LiveStudioFinalCta } from "./live-studio/FinalCta"
export function LiveStudioLanding({
  content,
  locale,
}: {
  content: LiveStudioContent
  locale: string
}) {
  return (
    <div className="bg-[#0a0a0a]">
      <LiveStudioHero
        onAir={content.onAir}
        status={content.status}
        titleLead={content.titleLead}
        titleAccent={content.titleAccent}
        titleTail={content.titleTail}
        subtitle={content.subtitle}
        description={content.description}
        primaryAction={content.primaryAction}
        secondaryAction={content.secondaryAction}
        whatsappMessage={content.whatsappMessage}
        locale={locale}
      />
      <LiveStudioMarquee marqueeLabel={content.marqueeLabel} marquee={content.marquee} />
      <LiveStudioStats stats={content.stats} />
      <LiveStudioThesis thesis={content.thesis} />
      <LiveStudioProgram program={content.program} />
      <LiveStudioModalities modalities={content.modalities} />
      <LiveStudioInfrastructure infrastructure={content.infrastructure} />
      <LiveStudioCreators creators={content.creators} />
      <LiveStudioBrands brands={content.brands} locale={locale} />
      <LiveStudioFaq faq={content.faq} />
      <LiveStudioFinalCta
        onAir={content.onAir}
        cta={content.cta}
        disclaimer={content.disclaimer}
        whatsappMessage={content.whatsappMessage}
        locale={locale}
      />
    </div>
  )
}
