import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { FlagshipAI } from "@/components/sections/FlagshipAI"
import { Methodology } from "@/components/sections/Methodology"
import { Team } from "@/components/sections/Team"
import { FAQ } from "@/components/sections/FAQ"
import { CTA } from "@/components/sections/CTA"
import { faqSchema } from "@/content/landing"

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Hero />
      <Services />
      <FlagshipAI />
      <Methodology />
      <Team />
      <FAQ />
      <CTA />
    </>
  )
}
