"use client"
import { motion } from "motion/react"
import { Eyebrow, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { program: LiveStudioContent["program"] }

/**
 * Per-cell dividers for the 4-step pipeline. The grid reflows 1 → 2 → 4 columns,
 * so each cell needs its own rule about which edge carries the hairline.
 */
const PROGRAM_BORDERS = [
  "",
  "border-t md:border-t-0 md:border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-t md:border-l lg:border-t-0",
]

export function LiveStudioProgram({ program }: Props) {
  return (
    <section className="bg-white py-24 md:py-32 border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow tone="light">{program.eyebrow}</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-6">
            {program.title}
          </h2>
          <p className="text-lg text-[#525252] leading-relaxed">{program.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {program.steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              className={`py-8 md:px-8 first:md:pl-0 last:lg:pr-0 border-[#e5e5e5] ${PROGRAM_BORDERS[i] ?? ""}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#a3a3a3]">
                  {step.step}
                </span>
                <span className="flex-1 live-rule opacity-60" />
              </div>
              <h3 className="text-xl font-semibold text-[#0a0a0a] tracking-tight mb-4">
                {step.title}
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed mb-6">{step.description}</p>
              <ul className="space-y-2">
                {step.details.map((detail) => (
                  <li key={detail} className="text-sm text-[#525252] leading-snug">
                    <span className="mr-2 text-[#a3a3a3]" aria-hidden="true">
                      &mdash;
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
