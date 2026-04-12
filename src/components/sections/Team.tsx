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

export function Team({ content: teamSection }: { content: TeamContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      id={teamSection.sectionId}
      className="py-32 bg-white border-t border-[#e5e5e5] relative z-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold mb-8 tracking-tight text-[#0a0a0a]">
            {teamSection.title}
          </RevealText>
          <p className="text-[#525252] text-lg md:text-xl leading-relaxed">
            {teamSection.description}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {teamSection.members.map((member) => (
            <motion.div
              key={member.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center mb-6">
                  <span className="text-base font-semibold">{member.initials}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">{member.name}</h3>
                <p className="text-xs font-medium tracking-widest uppercase text-[#a3a3a3] mb-4">{member.role}</p>
                <p className="text-sm text-[#525252] leading-relaxed">{member.tagline}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
