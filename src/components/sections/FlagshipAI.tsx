"use client"
import { IconCyber, IconWorkforce, IconInfra } from "@/components/ui/Icons"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

const OFFER_ICONS = {
  cyber: IconCyber,
  workforce: IconWorkforce,
  infra: IconInfra,
} as const

interface FlagshipAIContent {
  sectionId: string
  title: string
  description: string
  items: readonly { title: string; description: string; icon: keyof typeof OFFER_ICONS }[]
  caption: string
}

export function FlagshipAI({ content: flagshipAISection }: { content: FlagshipAIContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      id={flagshipAISection.sectionId}
      className="py-32 bg-[#0a0a0a] relative z-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
            {flagshipAISection.title}
          </RevealText>
          <p className="text-[#a3a3a3] text-lg md:text-xl leading-relaxed">
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
              transition: { staggerChildren: 0.12 },
            },
          }}
        >
          {flagshipAISection.items.map((offer) => {
            const Icon = OFFER_ICONS[offer.icon]
            return (
              <motion.div
                key={offer.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                className="group bg-[#141414] border border-[#1a1a1a] rounded-[6px] p-12 hover:border-[#2a2a2a] transition-colors duration-300"
              >
                <div className="mb-8 text-white">
                  <Icon size={36} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{offer.title}</h3>
                <p className="text-[#a3a3a3] text-base leading-relaxed">{offer.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="text-[#a3a3a3] text-center text-base mt-14">
          {flagshipAISection.caption}
        </p>
      </div>
    </motion.section>
  )
}
