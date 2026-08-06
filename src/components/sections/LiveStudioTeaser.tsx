"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { trackEvent } from "@/lib/analytics"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

export interface LiveStudioTeaserContent {
  eyebrow: string
  kicker: string
  title: string
  description: string
  points: readonly string[]
  action: { label: string; href: string }
}

const viewportConfig = { once: true, margin: "-100px" as const }

/**
 * Home-page announcement band for the Live Studio division.
 * Dark on a light page — the break in rhythm is the point.
 */
export function LiveStudioTeaser({
  content,
  locale,
}: {
  content: LiveStudioTeaserContent
  locale: string
}) {
  return (
    <section
      className="relative bg-[#0a0a0a] py-24 md:py-32 overflow-hidden"
      data-header-theme="dark"
    >
      <div aria-hidden="true" className="absolute inset-0 live-aurora opacity-90" />
      <div aria-hidden="true" className="absolute inset-0 live-frame-grid opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5">
                <span className="live-dot" />
                <span className="font-mono text-[10px] tracking-[0.28em] text-white">
                  {content.eyebrow}
                </span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/45">
                {content.kicker}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-6"
            >
              {content.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
              className="text-lg text-white/55 leading-relaxed max-w-2xl mb-10"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
            >
              <Button
                size="lg"
                href={buildLocalePath(locale as Locale, content.action.href)}
                onClick={() => trackEvent("live_studio_teaser_click")}
                className="bg-white text-[#0a0a0a] hover:bg-white/85"
              >
                {content.action.label}
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <ul className="border-t border-white/10">
              {content.points.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportConfig}
                  transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
                  className="flex gap-5 py-6 border-b border-white/10"
                >
                  <span className="font-mono text-[10px] tracking-[0.26em] text-[#25f4ee]/70 pt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base text-white/70 leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
