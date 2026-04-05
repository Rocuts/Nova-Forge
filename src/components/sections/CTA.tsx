"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { Button } from "@/components/ui/Button"
import { RevealText } from "@/components/ui/RevealText"
import { ctaSection } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"
import { useScrollVelocitySkew } from "@/hooks/useScrollVelocity"

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  })

  // Dramatic scale entrance
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.85, 1]),
    { stiffness: 60, damping: 20 }
  )
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 1])

  // Glow intensifies as section enters view
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.5, 1])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 1])

  // Text rises slightly
  const textY = useSpring(
    useTransform(scrollYProgress, [0, 1], [40, 0]),
    { stiffness: 50, damping: 18 }
  )

  const skewY = useScrollVelocitySkew()

  return (
    <motion.section
      ref={sectionRef}
      style={{ scale, opacity, skewY }}
      className="py-32 bg-surface-base relative border-t border-surface-border z-10 overflow-hidden"
    >
      {/* Animated glow — scales up and intensifies on scroll */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-cyan/10 blur-[150px] rounded-[100%] pointer-events-none"
        style={{ scale: glowScale, opacity: glowOpacity }}
      />

      <motion.div
        className="container px-4 mx-auto max-w-4xl text-center relative z-10"
        style={{ y: textY }}
      >
        <div className="font-heading text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
          <RevealText as="span" className="inline" animateWeight>
            Hablemos de lo que tu negocio
          </RevealText>
          <br className="hidden md:block"/>
          <span className="gradient-cta gradient-text">
            {ctaSection.highlight}
          </span>
        </div>

        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
          {ctaSection.description}
        </p>

        <Button
          size="lg"
          href={ctaSection.action.href}
          onClick={() => trackEvent(ctaSection.action.analyticsEvent)}
        >
          {ctaSection.action.label}
        </Button>
      </motion.div>
    </motion.section>
  )
}
