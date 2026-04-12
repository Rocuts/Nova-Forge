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
}

export function TechStack({ content }: { content: TechStackContent }) {
  return (
    <section
      id={content.sectionId}
      className="py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <RevealText
          as="h2"
          className="text-4xl md:text-5xl font-bold text-center text-[#0a0a0a] mb-16"
        >
          {content.title}
        </RevealText>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-[#e5e5e5] rounded-[6px] overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {content.categories.map((cat, ci) => (
              <div
                key={cat.name}
                className={`p-6 ${ci < content.categories.length - 1 ? "lg:border-r border-[#e5e5e5]" : ""}`}
              >
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#a3a3a3] mb-6">
                  {cat.name}
                </h3>
                <ul className="space-y-4">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm font-medium text-[#0a0a0a]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
