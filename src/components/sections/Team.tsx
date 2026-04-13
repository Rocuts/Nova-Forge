"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

interface TeamContent {
  sectionId: string
  title: string
  description: string
  members: readonly { name: string; initials: string; role: string; tagline: string }[]
}

/* Full static class strings so Tailwind can scan them at build time */
const MEMBER_STYLES = [
  {
    card: "hover:shadow-blue-500/10",
    accentLine: "from-blue-500 to-cyan-500",
    orb: "from-blue-500/20 to-cyan-500/20",
    avatar: "from-blue-500 to-cyan-500",
  },
  {
    card: "hover:shadow-violet-500/10",
    accentLine: "from-violet-500 to-purple-500",
    orb: "from-violet-500/20 to-purple-500/20",
    avatar: "from-violet-500 to-purple-500",
  },
  {
    card: "hover:shadow-emerald-500/10",
    accentLine: "from-emerald-500 to-teal-500",
    orb: "from-emerald-500/20 to-teal-500/20",
    avatar: "from-emerald-500 to-teal-500",
  },
  {
    card: "hover:shadow-amber-500/10",
    accentLine: "from-amber-500 to-orange-500",
    orb: "from-amber-500/20 to-orange-500/20",
    avatar: "from-amber-500 to-orange-500",
  },
] as const

export function Team({ content: teamSection }: { content: TeamContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      id={teamSection.sectionId}
      className="py-32 bg-[#0a0a0a] relative z-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Split header: title left, description right */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="md:max-w-md lg:max-w-lg shrink-0">
            <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white">
              {teamSection.title}
            </RevealText>
          </div>
          <div className="md:max-w-md lg:max-w-lg md:pb-2">
            <p className="text-white/50 text-lg md:text-xl leading-relaxed">
              {teamSection.description}
            </p>
          </div>
        </div>

        {/* Team grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 },
            },
          }}
        >
          {teamSection.members.map((member, index) => {
            const style = MEMBER_STYLES[index % MEMBER_STYLES.length]

            return (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
                  },
                }}
                className={`group relative overflow-hidden rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] p-8 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-white/[0.12] hover:shadow-lg ${style.card}`}
              >
                {/* Gradient accent line at top */}
                <div
                  className={`absolute top-0 left-0 h-px w-full bg-gradient-to-r ${style.accentLine} opacity-40 transition-opacity duration-500 group-hover:opacity-80`}
                />

                {/* Hover background orb */}
                <div
                  className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${style.orb} blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
                />

                {/* Content */}
                <div className="relative flex flex-col items-start">
                  {/* Gradient orb avatar */}
                  <div className="relative mb-6 h-12 w-12">
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${style.avatar} opacity-30`} />
                    <div className="absolute inset-0 rounded-lg border border-white/[0.08]" />
                    <div className="relative flex h-full w-full items-center justify-center">
                      <span className="text-sm font-semibold text-white/70">{member.initials}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">
                    {member.name}
                  </h3>

                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 mb-4">
                    {member.role}
                  </p>

                  <p className="text-sm leading-relaxed text-white/40 transition-colors duration-500 group-hover:text-white/60">
                    {member.tagline}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
