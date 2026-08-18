"use client"
import { useEffect, useRef } from "react"
import { m } from "motion/react"
import { CoverReveal } from "@/components/animations/CoverReveal"

interface MethodologyStep {
  num: string
  title: string
  desc: string
}

interface MethodologyContent {
  sectionId: string
  title: string
  phaseLabel: string
  description: string
  steps: readonly MethodologyStep[]
}

export function Methodology({ content: methodologySection }: { content: MethodologyContent }) {
  const lineRef = useRef<HTMLDivElement>(null)
  const lineParentRef = useRef<HTMLDivElement>(null)

  // Observe the PARENT container (has real height) to trigger the 1px line
  useEffect(() => {
    const parent = lineParentRef.current
    const line = lineRef.current
    if (!parent || !line) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          line.style.transition = "transform 1s cubic-bezier(0.22, 1, 0.36, 1)"
          line.style.transform = "scaleX(1)"
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return (
    <m.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-16 sm:py-32 bg-white border-t border-[#e5e5e5] relative z-10"
      id={methodologySection.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 sm:mb-20 max-w-3xl">
          <CoverReveal as="h2" className="font-heading text-3xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-[#0a0a0a]">
            {methodologySection.title}
          </CoverReveal>
          <p className="text-[#525252] text-lg md:text-xl leading-relaxed">
            {methodologySection.description}
          </p>
        </div>

        <div ref={lineParentRef} className="relative">
          {/* Horizontal connector line — animated when parent enters viewport */}
          <div
            ref={lineRef}
            className="hidden md:block absolute top-0 left-0 right-0 h-[1px] bg-[#e5e5e5] origin-left"
            style={{ transform: "scaleX(0)" }}
          />

          <m.div
            className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {methodologySection.steps.map((step, i) => (
              <m.div
                key={step.num}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
                  },
                }}
                className="pt-6 md:pt-0"
              >
                {/* Node dot on the line */}
                <div className="hidden md:block w-2 h-2 rounded-full bg-[#0a0a0a] -mt-1 mb-8" />
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#b0b0b0] mb-3 tabular-nums">
                  {methodologySection.phaseLabel} {step.num}
                </p>
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-[#525252] leading-relaxed">{step.desc}</p>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </m.section>
  )
}
