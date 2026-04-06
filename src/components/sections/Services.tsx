"use client"
import { useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Cpu, BrainCircuit, Cloud, Smartphone, Monitor, Globe } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { servicesSection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

import { useIsMobile } from "@/lib/useIsMobile"

const SERVICE_ICONS = {
  brain: BrainCircuit,
  cloud: Cloud,
  cpu: Cpu,
  globe: Globe,
  monitor: Monitor,
  smartphone: Smartphone,
} as const

// Each card gets a different parallax speed for depth
const PARALLAX_OFFSETS = [40, 20, 60, 30, 50, 15]

function ParallaxCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const distance = PARALLAX_OFFSETS[index % PARALLAX_OFFSETS.length]
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [distance, -distance]),
    { stiffness: isMobile ? 40 : 80, damping: 25 }
  )

  return (
    <motion.div ref={ref} style={{ y }} className="will-change-transform">
      {children}
    </motion.div>
  )
}

export function Services() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      className="py-24 bg-surface-base/60 backdrop-blur-sm relative z-10"
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
              <ParallaxCard key={svc.title} index={i}>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
                  }}
                  className="h-full"
                >
                  <GlassPanel className="group hover:border-primary-cyan/20 transition-all duration-500 h-full p-10 flex flex-col">
                    <div className="mb-8 text-primary-cyan/80 group-hover:text-primary-cyan transition-colors">
                      <Icon size={32} className="stroke-[1.25]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 tracking-tight">{svc.title}</h3>
                    <p className="text-slate-400 mb-8 text-base leading-relaxed">{svc.benefit}</p>
                    <ul className="space-y-4 mt-auto">
                      {svc.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start text-sm text-slate-400/80 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan/40 mt-1.5 mr-4 shrink-0"></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </GlassPanel>
                </motion.div>
              </ParallaxCard>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
