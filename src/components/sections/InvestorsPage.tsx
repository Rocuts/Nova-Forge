"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
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

const TEAM_ACCENT = [
  { gradient: "from-blue-400 to-cyan-400", text: "text-blue-400" },
  { gradient: "from-violet-400 to-purple-400", text: "text-violet-400" },
  { gradient: "from-emerald-400 to-teal-400", text: "text-emerald-400" },
  { gradient: "from-amber-400 to-orange-400", text: "text-amber-400" },
] as const

function TeamRows({ title, description, members, viewportConfig: vpc }: {
  title: string
  description: string
  members: readonly { name: string; initials: string; role: string; bio: string }[]
  viewportConfig: { once: boolean; margin: string }
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRole = hovered !== null ? members[hovered]?.role : null

  return (
    <section className="py-32 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="relative md:max-w-lg lg:max-w-xl shrink-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={hoveredRole ?? "default"}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                className={`font-heading text-4xl md:text-5xl font-bold tracking-tight text-white`}
              >
                {hoveredRole ?? title}
              </motion.h2>
            </AnimatePresence>
          </div>
          <p className="text-white/40 text-lg leading-relaxed max-w-md md:pb-2">{description}</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpc}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        >
          <div className="h-px w-full bg-white/[0.08]" />
          {members.map((member, i) => {
            const accent = TEAM_ACCENT[i % TEAM_ACCENT.length]
            const active = hovered === i
            const num = String(i + 1).padStart(2, "0")
            return (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group relative border-b border-white/[0.08]"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${accent.gradient} pointer-events-none`}
                  initial={false}
                  animate={{ opacity: active ? 0.05 : 0 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
                  <motion.span
                    className="font-heading text-[7rem] md:text-[10rem] lg:text-[13rem] font-bold leading-none text-white/[0.03] block"
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, x: active ? 0 : 60 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {member.initials}
                  </motion.span>
                </div>
                <div className="relative py-7 md:py-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                    <span className={`text-xs font-mono tracking-wider transition-colors duration-300 md:w-8 shrink-0 ${active ? accent.text : "text-white/20"}`}>{num}</span>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight flex-1 transition-transform duration-300 md:group-hover:translate-x-2">{member.name}</h3>
                    <p className="text-[10px] md:text-xs font-medium tracking-[0.15em] uppercase text-white/30 md:text-right md:w-72 shrink-0">{member.role}</p>
                  </div>
                  <p className="mt-3 text-sm text-white/30 leading-relaxed max-w-2xl md:pl-16 md:hidden">{member.bio}</p>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        className="hidden md:block overflow-hidden"
                      >
                        <p className="pt-4 pl-16 text-base text-white/50 max-w-2xl leading-relaxed">{member.bio}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  className={`absolute bottom-0 left-0 h-px bg-gradient-to-r ${accent.gradient}`}
                  initial={false}
                  animate={{ width: active ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export function InvestorsPage({ content }: { content: InvestorsPageContent }) {
  return (
    <div>
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
      <TeamRows title={content.team.title} description={content.team.description} members={content.team.members} viewportConfig={viewportConfig} />

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
    </div>
  )
}
