"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { heroContent } from "@/content/landing"
import { trackEvent } from "@/lib/analytics"

// Dynamic import del canvas pesado. Se carga solo en cliente.
const HeroCanvas = dynamic(() => import("../canvas/HeroScene"), { ssr: false })

export function Hero() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)

    // Listener en caso de que el usuario cambie la preferencia dinámicamente
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <section className="relative min-h-[120vh] flex items-start pt-32 pb-16 overflow-hidden">
      {/* Background System */}
      <div className="absolute inset-0 z-0">
        {mounted && !reduceMotion ? (
           <HeroCanvas />
        ) : (
           <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface-base opacity-50" />
        )}
      </div>

      {/* Radial Gradient Overlay: Sutil cyan en el centro */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-cyan-dim via-transparent to-transparent opacity-60"
        aria-hidden="true"
      />

      {/* Fade to Background Overlay: Transición suave en la base */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 pointer-events-none -z-10 bg-gradient-to-t from-surface-base to-transparent"
        aria-hidden="true"
      />

      <div className="container px-4 mx-auto relative z-10 w-full max-w-7xl pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
          className="max-w-4xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-border bg-surface-elevated/50 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary-cyan text-glow animate-pulse"></span>
            <span className="text-sm font-medium tracking-wide text-primary-cyan">
              {heroContent.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.0] mb-6"
          >
            {heroContent.titleLead} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan via-accent-amber to-white">
              {heroContent.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-10 leading-relaxed font-light"
          >
            {heroContent.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              href={heroContent.primaryAction.href}
              onClick={() => trackEvent(heroContent.primaryAction.analyticsEvent)}
            >
              {heroContent.primaryAction.label}
            </Button>
            <Button
              size="lg"
              variant="glass"
              href={heroContent.secondaryAction.href}
              onClick={() => trackEvent(heroContent.secondaryAction.analyticsEvent)}
            >
              {heroContent.secondaryAction.label}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
