"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { Button } from "@/components/ui/Button"

interface AboutPageContent {
  eyebrow: string
  title: string
  subtitle: string
  mission: {
    title: string
    description: string
  }
  methodology: {
    title: string
    description: string
    steps: readonly { num: string; title: string; desc: string }[]
  }
  team: {
    title: string
    description: string
    members: readonly { name: string; initials: string; role: string; bio: string }[]
  }
  values: {
    title: string
    items: readonly { title: string; description: string }[]
  }
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

export function AboutPage({ content }: { content: AboutPageContent }) {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(0)}
            className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase text-[#a3a3a3] mb-8"
          >
            {content.eyebrow}
          </motion.p>

          <RevealText
            as="h1"
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-[#0a0a0a] mb-8"
          >
            {content.title}
          </RevealText>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="text-xl text-[#525252] max-w-3xl leading-relaxed"
          >
            {content.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-12"
            >
              {content.mission.title}
            </RevealText>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(0)}
              className="text-lg text-[#525252] leading-[1.8]"
            >
              {content.mission.description}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Methodology ── */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-3xl">
            <RevealText
              as="h2"
              className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
            >
              {content.methodology.title}
            </RevealText>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(0)}
              className="text-lg text-[#a3a3a3] leading-relaxed"
            >
              {content.methodology.description}
            </motion.p>
          </div>

          <div className="relative">
            {/* Horizontal connector line */}
            <div className="hidden md:block absolute top-0 left-0 right-0 h-[1px] bg-[#1a1a1a]" />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {content.methodology.steps.map((step) => (
                <motion.div
                  key={step.num}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                    },
                  }}
                  className="pt-6 md:pt-0"
                >
                  {/* Node dot on the line */}
                  <div className="hidden md:block w-2 h-2 rounded-full bg-white -mt-1 mb-8" />
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mb-3">
                    Fase {step.num}
                  </p>
                  <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#a3a3a3] leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-3xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.team.title}
            </RevealText>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(0)}
              className="text-lg text-[#525252] leading-relaxed"
            >
              {content.team.description}
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {content.team.members.map((member) => (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
                className="text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center mb-6">
                    <span className="text-lg font-semibold">{member.initials}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-xs tracking-widest uppercase text-[#a3a3a3] mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-[#525252] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-32 bg-[#f8f8f8]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-3xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.values.title}
            </RevealText>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {content.values.items.map((item) => (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
              >
                <h3 className="text-xl font-semibold text-[#0a0a0a] mb-4 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-5xl px-6 text-center"
        >
          <RevealText
            as="h2"
            className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-8"
          >
            {content.cta.title}
          </RevealText>
          <p className="text-lg text-[#a3a3a3] leading-relaxed max-w-2xl mx-auto mb-14">
            {content.cta.description}
          </p>
          <Button
            size="lg"
            variant="primary"
            href={content.cta.action.href}
            className="bg-white text-[#0a0a0a] hover:bg-[#e5e5e5] border-white"
          >
            {content.cta.action.label}
          </Button>
        </motion.div>
      </section>
    </main>
  )
}
