"use client"
import { m } from "motion/react"
import { CoverReveal } from "@/components/animations/CoverReveal"
import { Eyebrow, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { thesis: LiveStudioContent["thesis"] }

export function LiveStudioThesis({ thesis }: Props) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Eyebrow tone="light">{thesis.eyebrow}</Eyebrow>
            <CoverReveal
              as="h2"
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] leading-[1.1]"
            >
              {thesis.title}
            </CoverReveal>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {thesis.paragraphs.map((paragraph, i) => (
              <m.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="text-lg text-[#525252] leading-relaxed"
              >
                {paragraph}
              </m.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
