"use client"
import { motion } from "motion/react"
import { methodologySection } from "@/content/landing"

export function Methodology() {
  return (
    <section
      className="py-24 bg-surface-base border-t border-surface-border/50 relative z-10"
      id={methodologySection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-medium mb-6">
            {methodologySection.title}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl">
            {methodologySection.description}
          </p>
        </div>

        <motion.div 
          className="flex flex-col gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          {methodologySection.steps.map((step) => (
            <motion.div 
              key={step.num}
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-[var(--radius-lg)] border border-surface-border bg-surface-elevated/20 hover:bg-surface-elevated/40 transition-colors"
            >
              <div className="text-transparent bg-clip-text bg-gradient-to-br from-primary-cyan to-accent-amber opacity-80 font-heading text-6xl font-black w-24">
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium mb-2">{step.title}</h3>
                <p className="text-text-secondary text-lg">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
