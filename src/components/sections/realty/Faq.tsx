"use client"
import { useId, useState } from "react"
import { m, useReducedMotion } from "motion/react"
import { trackEvent } from "@/lib/analytics"
import { reveal as revealProps } from "./shared"
import type { RealtyContent } from "./shared"

type Props = {
  content: RealtyContent["faq"]
  labels?: RealtyContent["statusLabels"]
  locale?: string
}

function FaqItem({
  item,
  index,
  reduced,
}: {
  item: { question: string; answer: string }
  index: number
  reduced: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const uid = useId()
  const panelId = `realty-faq-panel-${uid}`
  const buttonId = `realty-faq-button-${uid}`

  const reveal = revealProps(reduced, index, 16)

  return (
    <m.div {...reveal} className="border-b border-[#e5e5e5]">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) trackEvent("realty_faq_expand", { question: item.question })
            return !prev
          })
        }}
        className="w-full flex items-start justify-between gap-8 py-7 text-left cursor-pointer"
      >
        <span className="text-lg md:text-xl font-medium tracking-tight text-[#0a0a0a]">
          {item.question}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 mt-1 text-xl leading-none text-[#737373] transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <m.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="max-w-3xl pb-8 pr-10 leading-relaxed text-[#525252]">{item.answer}</p>
      </m.div>
    </m.div>
  )
}

export function RealtyFaq({ content }: Props) {
  const reduced = useReducedMotion() ?? false

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-4">
          {content.title}
        </h2>
        <p className="text-lg text-[#525252] leading-relaxed mb-14">{content.subtitle}</p>

        <div className="border-t border-[#e5e5e5]">
          {content.items.map((item, i) => (
            <FaqItem key={item.question} item={item} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  )
}
