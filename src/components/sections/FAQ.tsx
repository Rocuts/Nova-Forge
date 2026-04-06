"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { faqSection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="glass-panel rounded-[var(--radius-lg)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 text-left cursor-pointer"
      >
        <h3 className="text-xl font-bold text-white tracking-tight pr-4">{question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-primary-cyan text-2xl font-light shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-8 pb-8 text-slate-400 leading-relaxed text-base">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [isSectionOpen, setIsSectionOpen] = useState(false)
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
        <button
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="w-full flex items-center justify-center gap-4 cursor-pointer group mb-8"
        >
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-center tracking-tight">
            {faqSection.title}
          </h2>
          <motion.span
            animate={{ rotate: isSectionOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-primary-cyan text-3xl md:text-4xl font-light shrink-0 group-hover:scale-110 transition-transform"
          >
            +
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isSectionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-8">
                {faqSection.items.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
