"use client"
import { useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { teamSection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

export function Team() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      id={teamSection.sectionId}
      className="py-24 bg-surface-base border-t border-surface-border/50 relative z-10"
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-4xl md:text-6xl font-bold mb-8 tracking-tight" animateWeight>
            {teamSection.title}
          </RevealText>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
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
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {teamSection.members.map((member, i) => (
            <motion.div
              key={member.name}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
              }}
              className="h-full"
            >
              <GlassPanel className="text-center h-full border-zinc-800">
                <div className="flex flex-col items-center h-full w-full">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shrink-0">
                    <span className="text-xl font-bold text-primary-cyan">{member.initials}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-white">{member.name}</h3>
                  <p className="text-primary-cyan/80 text-[10px] font-bold tracking-widest uppercase mb-4">{member.role}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mt-auto">{member.tagline}</p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
