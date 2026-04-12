"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { Button } from "@/components/ui/Button"

interface InvestorsPageContent {
  eyebrow: string
  title: string
  subtitle: string
  thesis: {
    title: string
    paragraphs: readonly string[]
  }
  market: {
    title: string
    description: string
    segments: readonly { title: string; description: string }[]
  }
  team: {
    title: string
    description: string
    members: readonly { name: string; initials: string; role: string; bio: string }[]
  }
  vision: {
    quote: string
    author: string
    role: string
  }
  cta: {
    title: string
    description: string
    email: string
    action: { label: string; href: string }
  }
}

const stagger = (i: number) => ({
  delay: 0.15 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

const viewportConfig = { once: true, margin: "-100px" as const }

export function InvestorsPage({ content }: { content: InvestorsPageContent }) {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="min-h-[70vh] flex items-center bg-[#0a0a0a]">
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
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
          >
            {content.title}
          </RevealText>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="text-xl text-[#a3a3a3] max-w-3xl leading-relaxed"
          >
            {content.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Investment Thesis ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-12"
            >
              {content.thesis.title}
            </RevealText>

            {content.thesis.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={stagger(i)}
                className="text-lg text-[#525252] leading-[1.8] mb-8 last:mb-0"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Market Opportunity ── */}
      <section className="py-32 bg-[#f8f8f8]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 max-w-3xl">
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.market.title}
            </RevealText>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={stagger(0)}
              className="text-lg text-[#525252] leading-relaxed"
            >
              {content.market.description}
            </motion.p>
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
            {content.market.segments.map((segment) => (
              <motion.div
                key={segment.title}
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
                  {segment.title}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {segment.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Leadership Team ── */}
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

      {/* ── Vision Quote ── */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-3xl md:text-4xl text-white italic leading-relaxed mb-10">
              &ldquo;{content.vision.quote}&rdquo;
            </p>
            <footer className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-[#525252]" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {content.vision.author}
                </p>
                <p className="text-sm text-[#a3a3a3]">{content.vision.role}</p>
              </div>
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <RevealText
              as="h2"
              className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-8"
            >
              {content.cta.title}
            </RevealText>
            <p className="text-lg text-[#525252] leading-relaxed max-w-2xl mx-auto mb-8">
              {content.cta.description}
            </p>
            <p className="text-xl font-semibold text-[#0a0a0a] mb-10">
              {content.cta.email}
            </p>
            <Button
              size="lg"
              variant="primary"
              href={content.cta.action.href}
            >
              {content.cta.action.label}
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
