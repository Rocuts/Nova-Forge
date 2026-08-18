"use client"
import { motion } from "motion/react"
import { stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { stats: LiveStudioContent["stats"] }

export function LiveStudioStats({ stats }: Props) {
  return (
    <section className="bg-[#0a0a0a] py-24 md:py-32" data-header-theme="dark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 border border-white/8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              className="bg-[#0a0a0a] p-8 md:p-10"
            >
              <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                {stat.value}
              </p>
              <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#25f4ee]/80 mb-4">
                {stat.label}
              </p>
              <p className="text-sm text-white/50 leading-relaxed">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
