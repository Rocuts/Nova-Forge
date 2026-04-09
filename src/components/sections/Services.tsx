"use client"
import { useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Cpu, BrainCircuit, Cloud, Smartphone, Monitor, Globe } from "lucide-react"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { servicesSection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

const SERVICE_ICONS = {
  brain: BrainCircuit,
  cloud: Cloud,
  cpu: Cpu,
  globe: Globe,
  monitor: Monitor,
  smartphone: Smartphone,
} as const

export function Services() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      className="py-24 bg-surface-base relative z-10"
      id={servicesSection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-4xl md:text-6xl font-bold mb-8 tracking-tight" animateWeight>
            {servicesSection.title}
          </RevealText>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
            {servicesSection.description}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          {servicesSection.items.map((svc, i) => {
            const Icon = SERVICE_ICONS[svc.icon]
            return (
              <motion.div
                key={svc.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
                }}
                className="h-full"
              >
                <GlassPanel className="group relative overflow-hidden border border-surface-border hover:border-primary-cyan/50 hover:shadow-[0_20px_40px_-15px_rgba(0,229,255,0.2)] hover:-translate-y-2 transition-all duration-500 h-full">
                  <div className="flex flex-col h-full w-full relative z-10">
                    {/* Glowing animated background sweep */}
                    <div className="absolute inset-[-4rem] bg-gradient-to-br from-primary-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none translate-y-8 group-hover:translate-y-0" />
                    
                    <div className="relative z-10 mb-8 w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary-cyan group-hover:border-primary-cyan/50 group-hover:bg-primary-cyan/[0.05] transition-all duration-500 group-hover:shadow-[inset_0_0_20px_rgba(0,229,255,0.2),0_0_15px_rgba(0,229,255,0.1)]">
                      <Icon size={28} className="stroke-[1.5] transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-white transition-colors relative z-10">{svc.title}</h3>
                    <p className="text-slate-400 mb-8 text-base leading-relaxed group-hover:text-slate-300 transition-colors relative z-10">{svc.benefit}</p>
                    <ul className="space-y-4 mt-auto relative z-10">
                      {svc.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start text-sm text-slate-400/80 leading-snug group-hover:text-slate-300 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan/40 group-hover:bg-primary-cyan group-hover:shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all mt-1.5 mr-4 shrink-0"></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassPanel>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
