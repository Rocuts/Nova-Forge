"use client"
import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"

interface MetricsContent {
  title: string
  description: string
  kpiLabel: string
  optimizationLabel: string
  kpis: readonly { value: string; label: string }[]
}

function parseKpiValue(raw: string): { value: number; suffix: string } {
  const match = raw.match(/^([\d.]+)(.*)$/)
  if (!match) return { value: 0, suffix: raw }
  return { value: parseFloat(match[1]), suffix: match[2] }
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const start = performance.now()
    const hasDecimal = value % 1 !== 0
    const decimals = hasDecimal ? 1 : 0

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay((value * eased).toFixed(decimals))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

export function Metrics({ content }: { content: MetricsContent }) {
  // Only use the first 3 KPIs
  const kpis = content.kpis.slice(0, 3)

  return (
    <section className="py-32 bg-[#0a0a0a] relative z-10 border-t border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
              {content.title}
            </h2>
            <p className="text-[#a3a3a3] text-lg md:text-xl leading-relaxed mb-10">
              {content.description}
            </p>
            <div className="inline-flex items-center gap-2 text-white text-sm font-bold tracking-[0.1em] uppercase">
              {content.kpiLabel}
              <span className="text-lg">&rarr;</span>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
            {kpis.map((kpi, i) => {
              const { value, suffix } = parseKpiValue(kpi.value)
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                  }}
                  className="p-10 bg-[#141414] border border-[#1a1a1a] rounded-[6px]"
                >
                  <div className="text-5xl font-bold text-white mb-4 tracking-tighter">
                    <AnimatedNumber value={value} suffix={suffix} />
                  </div>
                  <div className="text-[#a3a3a3] text-sm font-medium leading-snug">
                    {kpi.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
