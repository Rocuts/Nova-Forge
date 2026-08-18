"use client"
import { m } from "motion/react"
import { Eyebrow, ModeList, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { modalities: LiveStudioContent["modalities"] }

export function LiveStudioModalities({ modalities }: Props) {
  return (
    <section className="bg-[#f8f8f8] py-24 md:py-32 border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow tone="light">{modalities.eyebrow}</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-6">
            {modalities.title}
          </h2>
          <p className="text-lg text-[#525252] leading-relaxed">{modalities.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modalities.items.map((mode, i) => (
            <m.div
              key={mode.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              className="bg-white border border-[#e5e5e5] rounded-[6px] p-8 md:p-10 flex flex-col"
            >
              <span className="self-start font-mono text-[10px] font-bold tracking-[0.3em] uppercase bg-[#0a0a0a] text-white px-3 py-1.5 rounded-[2px]">
                {mode.tag}
              </span>
              <h3 className="font-heading text-2xl font-semibold text-[#0a0a0a] tracking-tight mt-6 mb-4">
                {mode.title}
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed mb-8">{mode.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ModeList label={modalities.providesLabel} entries={mode.provides} />
                <ModeList label={modalities.requiresLabel} entries={mode.requires} />
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
