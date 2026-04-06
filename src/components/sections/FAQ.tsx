"use client"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { faqSection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

export function FAQ() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      className="py-24 bg-surface-base/60 backdrop-blur-sm relative z-10"
      id={faqSection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-4xl">
        <RevealText as="h2" className="font-heading text-4xl md:text-6xl font-bold mb-16 text-center tracking-tight" animateWeight>
          {faqSection.title}
        </RevealText>
        
        <div className="space-y-6">
          {faqSection.items.map((faq) => (
            <div key={faq.question} className="p-8 glass-panel rounded-[var(--radius-lg)]">
              <h3 className="text-xl font-bold mb-4 text-white tracking-tight">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
