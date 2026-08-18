"use client"
import { m } from "motion/react"
import { Eyebrow, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { infrastructure: LiveStudioContent["infrastructure"] }

export function LiveStudioInfrastructure({ infrastructure }: Props) {
  return (
    <section className="bg-[#0a0a0a] py-24 md:py-32 relative overflow-hidden" data-header-theme="dark">
      <div aria-hidden="true" className="absolute inset-0 live-frame-grid opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow>{infrastructure.eyebrow}</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            {infrastructure.title}
          </h2>
          <p className="text-lg text-white/55 leading-relaxed">
            {infrastructure.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8">
          {infrastructure.items.map((item, i) => (
            <m.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              className="group bg-[#0a0a0a] p-8 md:p-10 transition-colors duration-300 hover:bg-[#111111]"
            >
              <span
                aria-hidden="true"
                className="block w-8 live-rule opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-5"
              />
              <h3 className="text-lg font-semibold text-white tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
