"use client"
import { motion } from "motion/react"
import { Eyebrow, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { creators: LiveStudioContent["creators"] }

export function LiveStudioCreators({ creators }: Props) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow tone="light">{creators.eyebrow}</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a]">
            {creators.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              whileHover={{ y: -2 }}
              className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 hover:border-[#a3a3a3] transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-[#0a0a0a] tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
