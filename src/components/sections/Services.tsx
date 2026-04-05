"use client"
import { useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Cpu, BrainCircuit, Cloud, Smartphone, Monitor, Globe } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
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

// Each card gets a different parallax speed for depth
const PARALLAX_OFFSETS = [40, 20, 60, 30, 50, 15]

function ParallaxCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const distance = PARALLAX_OFFSETS[index % PARALLAX_OFFSETS.length]
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [distance, -distance]),
    { stiffness: 80, damping: 25 }
  )

  return (
    <motion.div ref={ref} style={{ y }}>
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
      className="py-24 bg-surface-base relative z-10"
      id={servicesSection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <RevealText as="h2" className="font-heading text-3xl md:text-5xl font-medium mb-6 tracking-tight" animateWeight>
            {servicesSection.title}
          </RevealText>
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
              transition: { staggerChildren: 0.12 }
            }
          }}
        >
          {servicesSection.items.map((svc, i) => {
            const Icon = SERVICE_ICONS[svc.icon]
            return (
              <ParallaxCard key={svc.title} index={i}>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
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
              </ParallaxCard>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
