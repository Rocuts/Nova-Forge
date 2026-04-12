"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"

interface InvestorsContent {
  sectionId: string
  eyebrow: string
  title: string
  description: string
  stats: readonly {
    value: string
    label: string
  }[]
  quote: {
    text: string
    author: string
    role: string
  }
  cta: {
    label: string
    href: string
  }
}

const stagger = (i: number) => ({
  delay: 0.15 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

const viewportConfig = { once: true, margin: "-100px" as const }

export function Investors({ content }: { content: InvestorsContent }) {
  return (
    <section id={content.sectionId} className="py-32 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={stagger(0)}
          className="mb-6"
        >
          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#a3a3a3] mb-8">
            {content.eyebrow}
          </p>
        </motion.div>

        <RevealText
          as="h2"
          className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
        >
          {content.title}
        </RevealText>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={stagger(1)}
          className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl leading-relaxed mb-20"
        >
          {content.description}
        </motion.p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {content.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(i)}
              className="bg-[#141414] border border-[#1a1a1a] rounded-[6px] p-8"
            >
              <p className="text-6xl font-bold text-white tracking-tight mb-3">
                {stat.value}
              </p>
              <p className="text-sm text-[#a3a3a3]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mb-20"
        >
          <p className="text-2xl md:text-3xl text-white italic leading-relaxed mb-8">
            &ldquo;{content.quote.text}&rdquo;
          </p>
          <footer className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#525252]" />
            <div>
              <p className="text-sm font-semibold text-white">
                {content.quote.author}
              </p>
              <p className="text-sm text-[#a3a3a3]">{content.quote.role}</p>
            </div>
          </footer>
        </motion.blockquote>

        {/* CTA Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <a
            href={content.cta.href}
            className="inline-flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-white transition-colors"
          >
            {content.cta.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
