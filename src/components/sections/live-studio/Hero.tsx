"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { trackEvent } from "@/lib/analytics"
import { applyHref, resolveHref } from "./shared"
import type { LiveStudioContent } from "./shared"

/** Deterministic bar heights — no Math.random, so SSR and hydration agree. */
const EQ_BARS = [38, 72, 54, 88, 46, 64, 30, 78, 58, 42]

/** The 9:16 booth frame — corner brackets, scanline sweep, level meter. */
function BroadcastFrame({ onAir }: { onAir: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative isolate w-full max-w-[280px] aspect-[9/16] mx-auto lg:mx-0 select-none"
    >
      {/* Frame body */}
      <div className="absolute inset-0 rounded-[10px] border border-white/12 bg-white/[0.02] overflow-hidden">
        <div className="absolute inset-0 live-frame-grid opacity-70" />
        {/* Scanline sweep */}
        <div className="absolute inset-x-0 top-0 h-px live-scan bg-gradient-to-r from-transparent via-[#25f4ee]/70 to-transparent" />

        {/* Top strip: ON AIR + timecode */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 h-9 border-b border-white/8">
          <span className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/85">{onAir}</span>
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/35">9:16</span>
        </div>

        {/* Center: framing brackets around the studio mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-1/2 aspect-square flex items-center justify-center">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#25f4ee]/60" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#fe2c55]/60" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#fe2c55]/60" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#25f4ee]/60" />
            <span className="font-mono text-[9px] tracking-[0.3em] text-white/25 text-center leading-5">
              ORBEXS
              <br />
              LIVE
            </span>
          </div>
        </div>

        {/* Bottom strip: audio level meter */}
        <div className="absolute bottom-0 inset-x-0 h-14 border-t border-white/8 px-3 flex items-end gap-[3px] pb-3">
          {EQ_BARS.map((height, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-[1px] bg-gradient-to-t from-[#25f4ee]/50 to-[#fe2c55]/50"
              initial={{ height: 4 }}
              animate={{ height: [4, height * 0.28, 6, height * 0.2, 4] }}
              transition={{
                duration: 1.6 + (i % 4) * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.07,
              }}
            />
          ))}
        </div>
      </div>

      {/* Offset ghost frames — the stack of a vertical feed */}
      <div className="absolute -right-3 top-6 bottom-6 w-full rounded-[10px] border border-white/[0.06] -z-10" />
      <div className="absolute -right-6 top-12 bottom-12 w-full rounded-[10px] border border-white/[0.03] -z-20" />
    </div>
  )
}

type Props = Pick<
  LiveStudioContent,
  | "onAir"
  | "status"
  | "titleLead"
  | "titleAccent"
  | "titleTail"
  | "subtitle"
  | "description"
  | "primaryAction"
  | "secondaryAction"
  | "whatsappMessage"
> & { locale: string }

export function LiveStudioHero({
  onAir,
  status,
  titleLead,
  titleAccent,
  titleTail,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  whatsappMessage,
  locale,
}: Props) {
  const applyLink = applyHref(whatsappMessage)

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0a0a]"
      data-header-theme="dark"
    >
      <div aria-hidden="true" className="absolute inset-0 live-aurora" />
      <div aria-hidden="true" className="absolute inset-0 live-frame-grid opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <span className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5">
                <span className="live-dot" />
                <span className="font-mono text-[10px] tracking-[0.28em] text-white">
                  {onAir}
                </span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">
                {status}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
              className="font-heading text-fluid-hero font-bold tracking-tight leading-[1.02] text-white mb-8"
            >
              {titleLead}{" "}
              <span className="chroma-text">{titleAccent}</span>{" "}
              {titleTail}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: "easeOut" }}
              className="font-heading text-2xl md:text-3xl text-white/55 font-medium tracking-tight mb-10 max-w-2xl"
            >
              {subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: "easeOut" }}
              className="text-fluid-p text-white/60 max-w-2xl leading-relaxed mb-14"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                href={applyLink}
                onClick={() => trackEvent("live_studio_apply_click", { placement: "hero" })}
                className="bg-white text-[#0a0a0a] hover:bg-white/85"
              >
                {primaryAction.label}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                href={resolveHref(locale, secondaryAction.href)}
                className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
              >
                {secondaryAction.label}
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <BroadcastFrame onAir={onAir} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
