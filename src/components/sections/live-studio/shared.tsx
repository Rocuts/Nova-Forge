// Types + presentational primitives shared by the Live Studio sections.
// Deliberately has NO "use client" directive: server sections (Marquee) and
// client sections both import from here, and the module adopts whichever
// environment imports it.
import { siteConfig } from "@/config/site"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface TitledItem {
  title: string
  description: string
}

export interface LiveStudioContent {
  eyebrow: string
  status: string
  onAir: string
  titleLead: string
  titleAccent: string
  titleTail: string
  subtitle: string
  description: string
  primaryAction: { label: string }
  secondaryAction: { label: string; href: string }
  whatsappMessage: string
  marqueeLabel: string
  marquee: readonly string[]
  stats: readonly { value: string; label: string; description: string }[]
  thesis: { eyebrow: string; title: string; paragraphs: readonly string[] }
  program: {
    eyebrow: string
    title: string
    description: string
    steps: readonly { step: string; title: string; description: string; details: readonly string[] }[]
  }
  modalities: {
    eyebrow: string
    title: string
    description: string
    providesLabel: string
    requiresLabel: string
    items: readonly {
      tag: string
      title: string
      description: string
      provides: readonly string[]
      requires: readonly string[]
    }[]
  }
  infrastructure: { eyebrow: string; title: string; description: string; items: readonly TitledItem[] }
  creators: { eyebrow: string; title: string; items: readonly TitledItem[] }
  brands: {
    eyebrow: string
    title: string
    description: string
    items: readonly TitledItem[]
    action: { label: string; href: string }
  }
  faq: { title: string; subtitle: string; items: readonly { question: string; answer: string }[] }
  cta: {
    title: string
    description: string
    action: { label: string }
    secondary: { label: string; href: string }
  }
  disclaimer: string
}

export const viewportConfig = { once: true, margin: "-100px" as const }

export const stagger = (i: number) => ({
  delay: 0.08 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

export function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) return href
  return buildLocalePath(locale as Locale, href)
}

export function applyHref(message: string): string {
  return `${siteConfig.links.whatsapp}?text=${encodeURIComponent(message)}`
}

/** Eyebrow with the spectral hairline the rest of the studio surfaces repeat. */
export function Eyebrow({ children, tone = "dark" }: { children: string; tone?: "dark" | "light" }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="w-12 live-rule" />
      <p
        className={`text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase ${
          tone === "dark" ? "text-white/70" : "text-[#0a0a0a]/70"
        }`}
      >
        {children}
      </p>
    </div>
  )
}

/** One side of a modality card: who supplies what. Both columns share this shape. */
export function ModeList({ label, entries }: { label: string; entries: readonly string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold tracking-[0.26em] uppercase text-[#707070] pb-3 mb-4 border-b border-[#e5e5e5]">
        {label}
      </p>
      <ul className="space-y-2.5">
        {entries.map((entry) => (
          <li key={entry} className="text-sm text-[#525252] leading-snug flex gap-2">
            <span className="text-[#a3a3a3] shrink-0" aria-hidden="true">
              &mdash;
            </span>
            {entry}
          </li>
        ))}
      </ul>
    </div>
  )
}
