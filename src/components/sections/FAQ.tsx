"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#e5e5e5]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-8 text-left cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-[#0a0a0a] pr-4">{question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#a3a3a3] text-2xl font-light shrink-0"
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
            <p className="pb-8 text-[#525252] text-base leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FAQContent {
  sectionId: string
  title: string
  items: readonly { question: string; answer: string }[]
}

export function FAQ({ content: faqSection }: { content: FAQContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      className="py-32 bg-white relative z-10"
      id={faqSection.sectionId}
    >
      <div className="mx-auto max-w-4xl px-6">
        <RevealText as="h2" className="font-heading text-5xl md:text-7xl font-bold mb-16 text-center tracking-tight text-[#0a0a0a]">
          {faqSection.title}
        </RevealText>

        <div>
          {faqSection.items.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
