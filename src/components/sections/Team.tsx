"use client"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { motion } from "motion/react"
import { teamSection } from "@/content/landing"

export function Team() {
  return (
    <section
      id={teamSection.sectionId}
      className="py-24 bg-surface-base border-t border-surface-border/50 relative z-10"
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-heading text-3xl md:text-5xl font-medium mb-6 tracking-tight">
            {teamSection.title}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
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
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          {teamSection.members.map((member) => (
            <motion.div
              key={member.name}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              <GlassPanel className="text-center h-full">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-primary-cyan">{member.initials}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{member.role}</p>
                  <p className="text-text-secondary text-base">{member.tagline}</p>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
