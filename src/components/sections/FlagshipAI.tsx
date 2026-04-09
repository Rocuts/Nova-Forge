"use client"
import { useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Phone, MessageSquare, UserCog } from "lucide-react"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { flagshipAISection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

const OFFER_ICONS = {
  message: MessageSquare,
  operations: UserCog,
  phone: Phone,
} as const

export function FlagshipAI() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      id={flagshipAISection.sectionId}
      className="py-24 bg-surface-base relative z-10 border-t border-surface-border/50"
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-4xl md:text-6xl font-bold mb-8 tracking-tight" animateWeight>
            {flagshipAISection.title}
          </RevealText>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
            {flagshipAISection.description}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
          {flagshipAISection.items.map((offer, i) => {
            const Icon = OFFER_ICONS[offer.icon]
            return (
              <motion.div
                key={offer.title}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
                }}
                className="h-full"
              >
                <GlassPanel className="group hover:border-primary-cyan/30 transition-colors duration-500 h-full">
                  <div className="flex flex-col h-full w-full">
                    <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity text-primary-cyan">
                      <Icon size={40} className="stroke-[1.5]" />
                    </div>
                    <h3 className="text-2xl font-medium mb-3">{offer.title}</h3>
                    <p className="text-text-secondary text-lg mt-auto">{offer.description}</p>
                  </div>
                </GlassPanel>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="text-text-secondary text-center text-lg mt-12">
          {flagshipAISection.caption}
        </p>
      </div>
    </motion.section>
  )
}
