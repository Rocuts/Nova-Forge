"use client"

import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"

interface TechStackContent {
  sectionId: string
  title: string
  categories: readonly {
    name: string
    items: readonly string[]
  }[]
  note?: string
}

function CategoryRow({
  category,
  index,
}: {
  category: { name: string; items: readonly string[] }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-8 border-b border-[#e5e5e5] last:border-b-0"
    >
      <div className="md:col-span-3 flex items-start gap-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#a3a3a3] tabular-nums pt-[3px]" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#525252] pt-[3px]">
          {category.name}
        </h3>
      </div>

      <ul className="md:col-span-9 flex flex-wrap gap-x-2 gap-y-3">
        {category.items.map((item, i) => (
          <li key={item} className="flex items-center text-sm font-medium text-[#0a0a0a] whitespace-nowrap">
            {item}
            {i < category.items.length - 1 && (
              <span className="ml-2 text-[#d4d4d4] select-none" aria-hidden="true">/</span>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function TechStack({ content }: { content: TechStackContent }) {
  return (
    <section
      id={content.sectionId}
      className="py-16 sm:py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <RevealText
          as="h2"
          className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-10 sm:mb-16"
        >
          {content.title}
        </RevealText>

        <div className="bg-white border border-[#e5e5e5] rounded-[6px] px-6 sm:px-10">
          {content.categories.map((cat, i) => (
            <CategoryRow key={cat.name} category={cat} index={i} />
          ))}
        </div>

        {content.note && (
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#737373]">
            {content.note}
          </p>
        )}
      </div>
    </section>
  )
}
