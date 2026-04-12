"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { useSectionEntrance } from "@/hooks/useParallax"

function FAQItem({ question, answer, isFirst }: { question: string; answer: string; isFirst?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`border-b border-[#d4d4d4]${isFirst ? " border-t" : ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="py-6 w-full flex items-center justify-between text-left cursor-pointer"
      >
        <h3 className="text-base font-medium text-[#0a0a0a] pr-8">{question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#a3a3a3] text-xl shrink-0"
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
            <p className="pb-6 text-[#525252] text-base leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FAQContent {
  sectionId: string
  title: string
  subtitle: string
  items: readonly { question: string; answer: string }[]
}

export function FAQ({ content: faqSection }: { content: FAQContent }) {
  const { ref: entranceRef, opacity, y } = useSectionEntrance()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y }}
      className="py-32 bg-[#f8f8f8] border-t border-[#e5e5e5] relative z-10"
      id={faqSection.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left — Title */}
          <div className="lg:col-span-2">
            <RevealText as="h2" className="font-heading text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-6">
              {faqSection.title}
            </RevealText>
            <p className="text-lg text-[#525252] leading-relaxed">
              {faqSection.subtitle}
            </p>
          </div>

          {/* Right — Accordion */}
          <div className="lg:col-span-3">
            {faqSection.items.map((faq, index) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} isFirst={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
