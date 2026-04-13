"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useSectionEntrance } from "@/hooks/useParallax"

interface TeamContent {
  sectionId: string
  title: string
  description: string
  members: readonly { name: string; initials: string; role: string; tagline: string }[]
}

/* Full static class strings for Tailwind scanning */
const ACCENT = [
  { gradient: "from-blue-400 to-cyan-400", text: "text-blue-400" },
  { gradient: "from-violet-400 to-purple-400", text: "text-violet-400" },
  { gradient: "from-emerald-400 to-teal-400", text: "text-emerald-400" },
  { gradient: "from-amber-400 to-orange-400", text: "text-amber-400" },
] as const

export function Team({ content: teamSection }: { content: TeamContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()
  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRole = hovered !== null ? teamSection.members[hovered]?.role : null

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      id={teamSection.sectionId}
      className="py-32 bg-[#0a0a0a] relative z-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Split header — title swaps to hovered member's role */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="relative md:max-w-lg lg:max-w-xl shrink-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={hoveredRole ?? "default"}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                className={`font-heading text-5xl md:text-7xl font-bold tracking-tight text-white`}
              >
                {hoveredRole ?? teamSection.title}
              </motion.h2>
            </AnimatePresence>
          </div>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-md md:pb-2">
            {teamSection.description}
          </p>
        </div>

        {/* Stacked editorial rows */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Top divider */}
          <div className="h-px w-full bg-white/[0.08]" />

          {teamSection.members.map((member, index) => {
            const accent = ACCENT[index % ACCENT.length]
            const isActive = hovered === index
            const num = String(index + 1).padStart(2, "0")

            return (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
                  },
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className="group relative border-b border-white/[0.08]"
              >
                {/* Hover gradient bg */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${accent.gradient} pointer-events-none`}
                  initial={false}
                  animate={{ opacity: isActive ? 0.05 : 0 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Giant watermark initials — slides in on hover */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
                  <motion.span
                    className="font-heading text-[7rem] md:text-[10rem] lg:text-[13rem] font-bold leading-none text-white/[0.03] block"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : 60,
                    }}
                    transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {member.initials}
                  </motion.span>
                </div>

                {/* Row content */}
                <div className="relative py-7 md:py-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                    {/* Number indicator */}
                    <span
                      className={`text-xs font-mono tracking-wider transition-colors duration-300 md:w-8 shrink-0 ${isActive ? accent.text : "text-white/20"}`}
                    >
                      {num}
                    </span>

                    {/* Name — large editorial typography */}
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight flex-1 transition-transform duration-300 md:group-hover:translate-x-2">
                      {member.name}
                    </h3>

                    {/* Role */}
                    <p className="text-[10px] md:text-xs font-medium tracking-[0.15em] uppercase text-white/30 md:text-right md:w-72 shrink-0">
                      {member.role}
                    </p>
                  </div>

                  {/* Tagline — always visible on mobile, expands on hover for desktop */}
                  <p className="mt-3 text-sm text-white/30 leading-relaxed max-w-2xl md:pl-16 md:hidden">
                    {member.tagline}
                  </p>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        className="hidden md:block overflow-hidden"
                      >
                        <p className="pt-4 pl-16 text-base text-white/50 max-w-2xl leading-relaxed">
                          {member.tagline}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Animated accent line — sweeps from left on hover */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-px bg-gradient-to-r ${accent.gradient}`}
                  initial={false}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
