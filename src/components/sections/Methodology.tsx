"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

interface MethodologyStep {
  num: string
  title: string
  desc: string
}

interface MethodologyContent {
  sectionId: string
  title: string
  description: string
  steps: readonly MethodologyStep[]
}

export function Methodology({ content: methodologySection }: { content: MethodologyContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      className="py-32 bg-white border-t border-[#e5e5e5] relative z-10"
      id={methodologySection.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-3xl">
          <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold mb-8 tracking-tight text-[#0a0a0a]">
            {methodologySection.title}
          </RevealText>
          <p className="text-[#525252] text-lg md:text-xl leading-relaxed">
            {methodologySection.description}
          </p>
        </div>

        <div className="relative">
          {/* Horizontal connector line */}
          <div className="hidden md:block absolute top-0 left-0 right-0 h-[1px] bg-[#e5e5e5]" />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {methodologySection.steps.map((step) => (
              <motion.div
                key={step.num}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                className="pt-6 md:pt-0"
              >
                {/* Node dot on the line */}
                <div className="hidden md:block w-2 h-2 rounded-full bg-[#0a0a0a] -mt-1 mb-8" />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mb-3">
                  Fase {step.num}
                </p>
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-[#525252] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
