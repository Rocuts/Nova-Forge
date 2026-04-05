"use client"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Cpu, BrainCircuit, Cloud, Smartphone, Monitor, Globe } from "lucide-react"
import { motion } from "motion/react"
import { servicesSection } from "@/content/landing"

const SERVICE_ICONS = {
  brain: BrainCircuit,
  cloud: Cloud,
  cpu: Cpu,
  globe: Globe,
  monitor: Monitor,
  smartphone: Smartphone,
} as const

export function Services() {
  return (
    <section
      className="py-24 bg-surface-base relative z-10"
      id={servicesSection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-heading text-3xl md:text-5xl font-medium mb-6 tracking-tight">
            {servicesSection.title}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            {servicesSection.description}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          {servicesSection.items.map((svc) => {
            const Icon = SERVICE_ICONS[svc.icon]
            return (
            <motion.div
              key={svc.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              <GlassPanel className="group hover:border-primary-cyan/30 transition-colors duration-500 h-full">
                <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity text-primary-cyan">
                  <Icon size={40} className="stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-medium mb-3">{svc.title}</h3>
                <p className="text-text-secondary mb-8 text-lg">{svc.benefit}</p>
                <ul className="space-y-3">
                  {svc.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center text-base text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-amber mr-4 opacity-70"></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
