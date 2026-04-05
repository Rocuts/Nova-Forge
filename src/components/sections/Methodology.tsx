"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"
import { methodologySection } from "@/content/landing"
import { useSectionEntrance } from "@/hooks/useParallax"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

function MethodStep({ step, index }: { step: typeof methodologySection.steps[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  // Each step slides in from alternating sides with different timing
  const direction = index % 2 === 0 ? -1 : 1
  const x = useSpring(
    useTransform(scrollYProgress, [0, 1], [80 * direction, 0]),
    { stiffness: 60, damping: 20 }
  )
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.3, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])

  // The step number has its own parallax — floats slower
  const numY = useSpring(
    useTransform(scrollYProgress, [0, 1], [30, -10]),
    { stiffness: 50, damping: 15 }
  )

  return (
    <motion.div
      ref={ref}
      style={{ x, opacity, scale }}
      className="relative flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-[var(--radius-lg)] border border-surface-border bg-surface-elevated/20 hover:bg-surface-elevated/40 transition-colors duration-500"
    >
      {/* Animated step number */}
      <motion.div
        style={{ y: numY }}
        className="gradient-accent gradient-text opacity-80 font-heading text-6xl font-black w-24 shrink-0"
      >
        {step.num}
      </motion.div>

      <div className="flex-1">
        <h3 className="text-2xl font-medium mb-2">{step.title}</h3>
        <p className="text-text-secondary text-lg">{step.desc}</p>
      </div>

      {/* Glowing accent on hover */}
      <div className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-primary-cyan/5 via-transparent to-accent-amber/5" />
    </motion.div>
  )
}

export function Methodology() {
  const { ref: entranceRef, opacity, y, scale } = useSectionEntrance()
  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={entranceRef}
      style={{ opacity, y, scale, skewY }}
      className="py-24 bg-surface-base border-t border-surface-border/50 relative z-10"
      id={methodologySection.sectionId}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-16">
          <RevealText as="h2" className="font-heading text-3xl md:text-5xl font-medium mb-6" animateWeight>
            {methodologySection.title}
          </RevealText>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl">
            {methodologySection.description}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {methodologySection.steps.map((step, i) => (
            <MethodStep
              key={step.num}
              step={step}
              index={i}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
