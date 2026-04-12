"use client"
import Link from "next/link"
import { IconSovereign, IconShield, IconAssistant, IconSystems, IconIntelligence, IconGovernance } from "@/components/ui/Icons"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

const SERVICE_ICONS = {
  sovereign: IconSovereign,
  shield: IconShield,
  assistant: IconAssistant,
  systems: IconSystems,
  intelligence: IconIntelligence,
  governance: IconGovernance,
} as const

interface ServicesContent {
  sectionId: string
  title: string
  description: string
  items: readonly { title: string; benefit: string; bullets: readonly string[]; icon: keyof typeof SERVICE_ICONS; href?: string }[]
}

export function Services({ content: servicesSection }: { content: ServicesContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      className="py-32 bg-white bg-grid relative z-10"
      id={servicesSection.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold mb-8 tracking-tight text-[#0a0a0a]">
            {servicesSection.title}
          </RevealText>
          <p className="text-[#525252] text-lg md:text-xl leading-relaxed">
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
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {servicesSection.items.map((svc) => {
            const Icon = SERVICE_ICONS[svc.icon]
            return (
              <motion.div
                key={svc.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                className="group bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-10 flex flex-col hover:border-[#a3a3a3] transition-colors duration-300"
              >
                <div className="mb-8 text-[#0a0a0a]">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-4 tracking-tight text-[#0a0a0a]">{svc.title}</h3>
                <p className="text-[#525252] mb-8 text-base leading-relaxed">{svc.benefit}</p>
                <ul className="space-y-3 mt-auto">
                  {svc.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start text-sm text-[#525252] leading-snug">
                      <span className="mr-3 mt-0.5 text-[#a3a3a3] select-none" aria-hidden="true">&ndash;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
                {svc.href && (
                  <Link
                    href={svc.href}
                    className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#0a0a0a] hover:text-[#525252] transition-colors"
                  >
                    Explorar
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
