"use client"
import { motion } from "motion/react"

const TRUST_ITEMS = [
  "Amazon Web Services",
  "Google Cloud",
  "Microsoft Azure",
  "OpenAI",
  "Vercel",
]

export function TrustBar() {
  return (
    <section className="py-12 border-y border-[#e5e5e5] bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
        >
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mr-4">
            Infraestructura certificada
          </span>
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              className="text-sm font-medium text-[#a3a3a3] tracking-wide"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
