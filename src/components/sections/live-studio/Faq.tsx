"use client"
import { useState } from "react"
import { motion } from "motion/react"
import { trackEvent } from "@/lib/analytics"
import { stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { faq: LiveStudioContent["faq"] }

function FaqItem({ item, index }: { item: { question: string; answer: string }; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={stagger(index)}
      className="border-b border-[#e5e5e5]"
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) trackEvent("live_studio_faq_expand", { question: item.question })
            return !prev
          })
        }}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-8 py-7 text-left group"
      >
        <span className="text-lg md:text-xl font-medium text-[#0a0a0a] tracking-tight">
          {item.question}
        </span>
        <span
          className={`shrink-0 mt-1 text-[#a3a3a3] transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="text-[#525252] leading-relaxed max-w-3xl pb-8 pr-10">{item.answer}</p>
      </motion.div>
    </motion.div>
  )
}

export function LiveStudioFaq({ faq }: Props) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-4">
          {faq.title}
        </h2>
        <p className="text-lg text-[#525252] mb-14">{faq.subtitle}</p>

        <div className="border-t border-[#e5e5e5]">
          {faq.items.map((item, i) => (
            <FaqItem key={item.question} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
