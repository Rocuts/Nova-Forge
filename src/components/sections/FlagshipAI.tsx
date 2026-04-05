"use client"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Phone, MessageSquare, UserCog } from "lucide-react"
import { motion } from "motion/react"
import { flagshipAISection } from "@/content/landing"

const OFFER_ICONS = {
  message: MessageSquare,
  operations: UserCog,
  phone: Phone,
} as const

export function FlagshipAI() {
  return (
    <section
      id={flagshipAISection.sectionId}
      className="py-24 bg-surface-base relative z-10 border-t border-surface-border/50"
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-heading text-3xl md:text-5xl font-medium mb-6 tracking-tight">
            {flagshipAISection.title}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
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
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          {flagshipAISection.items.map((offer) => {
            const Icon = OFFER_ICONS[offer.icon]
            return (
              <motion.div
                key={offer.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
              >
                <GlassPanel className="group hover:border-primary-cyan/30 transition-colors duration-500 h-full">
                  <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity text-primary-cyan">
                    <Icon size={40} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-2xl font-medium mb-3">{offer.title}</h3>
                  <p className="text-text-secondary text-lg">{offer.description}</p>
                </GlassPanel>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="text-text-secondary text-center text-lg mt-12">
          {flagshipAISection.caption}
        </p>
      </div>
    </section>
  )
}
