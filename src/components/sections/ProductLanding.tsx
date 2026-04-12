"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { CharReveal } from "@/components/ui/RevealText"
import { RevealText } from "@/components/ui/RevealText"

interface ProductLandingContent {
  eyebrow: string
  title: string
  subtitle: string
  description: string
  features: readonly {
    title: string
    description: string
  }[]
  capabilities: readonly {
    title: string
    items: readonly string[]
  }[]
  cta: {
    title: string
    description: string
    action: { label: string; href: string }
  }
}

const stagger = (i: number) => ({
  delay: 0.15 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

const viewportConfig = { once: true, margin: "-100px" as const }

export function ProductLanding({
  content,
}: {
  content: ProductLandingContent
}) {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(0)}
            className="flex items-center gap-4 mb-10"
          >
            <span className="w-12 h-[1px] bg-[#0a0a0a] opacity-30" />
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#0a0a0a] opacity-90">
              {content.eyebrow}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1)}
            className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.05] mb-8"
          >
            <CharReveal as="h1" className="text-[#0a0a0a]" delay={0.15}>
              {content.title}
            </CharReveal>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="font-heading text-2xl md:text-4xl text-[#a3a3a3] font-medium tracking-tight mb-10"
          >
            {content.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(3)}
            className="text-fluid-p text-[#525252] max-w-2xl leading-relaxed mb-14"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(4)}
          >
            <Button size="lg" variant="primary" href={content.cta.action.href}>
              {content.cta.action.label}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
            {content.features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
              >
                <h3 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight mb-4">
                  {feature.title}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities — Dark */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {content.capabilities.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
              >
                <h3 className="text-lg font-semibold text-white tracking-tight mb-6">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-[#a3a3a3] text-sm leading-relaxed"
                    >
                      <span className="mr-3 text-[#525252]">&mdash;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <RevealText
            as="h2"
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-[#0a0a0a] mb-8"
          >
            {content.cta.title}
          </RevealText>

          <p className="text-lg md:text-xl text-[#525252] leading-relaxed mb-14 max-w-2xl mx-auto">
            {content.cta.description}
          </p>

          <Button size="lg" variant="primary" href={content.cta.action.href}>
            {content.cta.action.label}
          </Button>
        </motion.div>
      </section>
    </main>
  )
}
