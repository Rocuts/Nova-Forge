"use client"
import { useState } from "react"
import { m, AnimatePresence } from "motion/react"

/**
 * The hover-expanding leadership roster. AboutPage and InvestorsPage carried a
 * byte-identical copy of this ~100-line component, so both routes shipped it
 * twice; it now lives in one module they share.
 */

export interface TeamMember {
  name: string
  initials: string
  role: string
  bio: string
}

const viewportConfig = { once: true, margin: "-100px" as const }

export function TeamRows({
  title,
  description,
  members,
}: {
  title: string
  description: string
  members: readonly TeamMember[]
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRole = hovered !== null ? members[hovered]?.role : null

  return (
    <section className="py-32 bg-[#0a0a0a]" data-header-theme="dark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="relative md:max-w-lg lg:max-w-xl shrink-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <m.h2
                key={hoveredRole ?? "default"}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                className={`font-heading text-4xl md:text-5xl font-bold tracking-tight text-white`}
              >
                {hoveredRole ?? title}
              </m.h2>
            </AnimatePresence>
          </div>
          {/* a11y: white/40 sobre #0a0a0a da 3.77:1 (< AA 4.5); white/50 da 5.37:1 manteniendo el tono muted. */}
          <p className="text-white/50 text-lg leading-relaxed max-w-md md:pb-2">{description}</p>
        </div>

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        >
          <div className="h-px w-full bg-white/[0.08]" />
          {members.map((member, i) => {
            const active = hovered === i
            const num = String(i + 1).padStart(2, "0")
            return (
              <m.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group relative border-b border-white/[0.08]"
              >
                <m.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={false}
                  animate={{ opacity: active ? 0.03 : 0 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden">
                  <m.span
                    className="font-heading text-[7rem] md:text-[10rem] lg:text-[13rem] font-bold leading-none text-white/[0.03] block"
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, x: active ? 0 : 60 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {member.initials}
                  </m.span>
                </div>
                <div className="relative py-7 md:py-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                    <span className={`text-xs font-mono tracking-wider transition-colors duration-300 md:w-8 shrink-0 ${active ? "text-white" : "text-white/55"}`}>{num}</span>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight flex-1 transition-transform duration-300 md:group-hover:translate-x-2">{member.name}</h3>
                    <p className="text-[10px] md:text-xs font-medium tracking-[0.15em] uppercase text-white/55 md:text-right md:w-72 shrink-0">{member.role}</p>
                  </div>
                  <p className="mt-3 text-sm text-white/55 leading-relaxed max-w-2xl md:pl-16 md:hidden">{member.bio}</p>
                  <AnimatePresence>
                    {active && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        className="hidden md:block overflow-hidden"
                      >
                        <p className="pt-4 pl-16 text-base text-white/50 max-w-2xl leading-relaxed">{member.bio}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
                <m.div
                  className="absolute bottom-0 left-0 h-px bg-white/40"
                  initial={false}
                  animate={{ width: active ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </m.div>
            )
          })}
        </m.div>
      </div>
    </section>
  )
}
