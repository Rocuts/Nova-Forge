"use client"
import {
  IconEyeSearch,
  IconUsersGroup,
  IconCloudLock,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import { CoverReveal } from "@/components/animations/CoverReveal"

const OFFER_ICONS = {
  cyber: IconEyeSearch,
  workforce: IconUsersGroup,
  infra: IconCloudLock,
} as const

interface FlagshipAIContent {
  sectionId: string
  title: string
  description: string
  items: readonly { title: string; description: string; icon: keyof typeof OFFER_ICONS }[]
  caption: string
}

export function FlagshipAI({ content: flagshipAISection }: { content: FlagshipAIContent }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      id={flagshipAISection.sectionId}
      className="py-16 sm:py-32 bg-[#0a0a0a] relative z-10"
      data-header-theme="dark"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 sm:mb-20 max-w-3xl">
          <CoverReveal
            as="h2"
            className="font-heading text-3xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white"
            variant="dark"
          >
            {flagshipAISection.title}
          </CoverReveal>
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
              transition: { staggerChildren: 0.1 },
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
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group bg-[#141414] border border-[#1a1a1a] rounded-[6px] p-6 sm:p-12 hover:border-[#2a2a2a] transition-colors duration-300"
              >
                <div className="mb-8 text-white">
                  <Icon size={36} stroke={1.5} />
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
