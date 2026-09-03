// Types + presentational primitives shared by the RealTy landing sections.
// Deliberately has NO "use client" directive: server and client islands both
// import from here. The RealtyContent type is the contract between the
// dictionaries (src/content/dictionaries/{es,en}.ts → `realty`) and the
// sections under ./ — change it only together with both dictionaries.
//
// v2 (2026-09-03): the page speaks to a developer's commercial director, not to
// a reviewer. Every capability still carries its status (CLAUDE.md, RealTy
// block) but the vocabulary is business language and the demo data is
// labelled once per visual frame instead of once per number.
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

/**
 * Reality status of a capability, in business words.
 * - built: works today on the product's own data.
 * - validated: configuration complete and tested, switched on in the pilot
 *   (used ONLY for the voice advisor — never "operating", never "on calls").
 * - simulated: real records, zero external effect (holds, reservations, deposits).
 * - adapter: a test adapter that is swapped for the real provider in the pilot.
 * - planned: on the roadmap, not started.
 * - notImplemented: deliberately out of scope for now.
 */
export type RealtyStatus = "built" | "validated" | "simulated" | "adapter" | "planned" | "notImplemented"

export interface Action {
  label: string
  href: string
}

export interface SectionHead {
  id: string
  eyebrow: string
  title: string
  description: string
}

/**
 * One turn of the demo conversation. `check` is the advisor verifying a fact
 * against the inventory before answering — shown as a quiet inset line, never
 * as a function name or code.
 */
export type TranscriptTurn =
  | { kind: "buyer" | "advisor"; text: string }
  | { kind: "check"; text: string; result: string }

export interface RealtyContent {
  /** Product eyebrow, e.g. "RealTy". */
  eyebrow: string
  /**
   * Scope line used by page.tsx for the meta description: the text before the
   * first "·" is the scope phrase ("Infraestructura de ventas con IA para
   * promotores inmobiliarios"), the rest qualifies the demo state.
   */
  statusLine: string
  statusLabels: Record<RealtyStatus, string>
  /** One label per visual frame with demo data, e.g. "Datos de demostración". */
  demoLabel: string
  /** Screen-reader text for the demo label, e.g. "Cifras de un entorno de demostración, no de clientes reales". */
  demoSrText: string

  hero: {
    title: string
    subtitle: string
    /** Two short sentences; feeds the meta description. */
    description: string
    primaryAction: Action
    secondaryAction: Action
    /** The "Overview" screen of the console, rendered as the hero visual. */
    console: {
      label: string
      headline: { label: string; value: string; caption: string }
      tiles: readonly { label: string; value: string; series: readonly number[] }[]
      funnel: { label: string; stages: readonly { name: string; count: number }[] }
    }
  }

  /** Four outcomes for the developer's team, no numbers. */
  outcomes: SectionHead & {
    items: readonly { title: string; description: string }[]
  }

  /** Buyer journey: the real pipeline stages plus five narrated steps. */
  journey: SectionHead & {
    pipeline: {
      label: string
      /** Nine ordered stages, literal to the product. */
      stages: readonly string[]
      /** Terminal outcomes, e.g. ["Ganado", "Perdido"]. */
      terminal: readonly string[]
      /** Index of the stage highlighted as "current" in the demo. */
      current: number
    }
    systemLabel: string
    buyerLabel: string
    steps: readonly { step: string; title: string; system: string; buyer: string; status: RealtyStatus }[]
    qualifier: string
  }

  /** The voice advisor. */
  voice: SectionHead & {
    points: readonly { title: string; description: string }[]
    transcript: {
      label: string
      scenario: string
      speakerLabels: { buyer: string; advisor: string; check: string }
      turns: readonly TranscriptTurn[]
    }
    /** Status card when the live demo is OFF: `validated`, with the honest sentence. */
    state: { status: RealtyStatus; title: string; text: string }
    /**
     * Status card when the live demo is ON (`REALTY_VOICE_DEMO_ENABLED=true`).
     * Replaces `state`: the browser demo IS built, so it carries `built` — and
     * its text must still say that the development's phone calls go live in the
     * pilot (CLAUDE.md, RealTy block).
     */
    live: { status: RealtyStatus; title: string; text: string }
    /**
     * Copy of the in-page voice demo (`VoiceDemo.tsx`). Every string the state
     * machine can show lives here: no message is authored in the component.
     */
    demo: {
      title: string
      description: string
      /** Microphone + processed by ElevenLabs + maximum duration + fictitious data. */
      consent: string
      start: string
      hangUp: string
      retry: string
      schedule: Action
      speakerLabels: { user: string; agent: string }
      status: { requesting: string; connecting: string; listening: string; speaking: string; ended: string }
      countdownLabel: string
      micDenied: string
      /** `resetsAt` takes a `{time}` placeholder for the local reset time. */
      quota: { browser: string; ip: string; daily: string; resetsAt: string }
      unavailable: string
      /** Frame label, e.g. "Conversación de demostración · datos ficticios". */
      demoLabel: string
    }
    qualifier: string
  }

  /** The commercial console (CRM). */
  console: SectionHead & {
    band: string
    opportunities: {
      title: string
      columns: readonly string[]
      rows: readonly {
        lead: string
        country: string
        stage: string
        /** 0–1, rendered as a small meter + number. */
        readiness: number
        band: string
        unit: string
        next: string
      }[]
    }
    readiness: {
      title: string
      lead: string
      score: number
      band: string
      components: readonly { name: string; value: number; max: number; note: string }[]
    }
    closeLedger: {
      title: string
      summary: string
      states: readonly { name: string; met: boolean; simulated: boolean }[]
    }
    /** Three guarantees in plain words (never invents a price, says "I don't know", leaves a trail). */
    principles: readonly { title: string; description: string }[]
    qualifier: string
  }

  /** Channels and human handover. */
  channels: SectionHead & {
    items: readonly { name: string; description: string; status: RealtyStatus }[]
    qualifier: string
  }

  /** Product status table + activation target. */
  status: SectionHead & {
    columns: readonly string[]
    /**
     * `key` is a stable identifier for rows the page has to address from code.
     * Only the voice advisor uses one today (`key: "voice"`), so the live-demo
     * flag can swap its status and note for `liveVoiceRow`.
     */
    rows: readonly { key?: string; component: string; status: RealtyStatus; note: string }[]
    /** Replacement for the `key: "voice"` row when the live demo is ON. */
    liveVoiceRow: { status: RealtyStatus; note: string }
    activation: { title: string; value: string; description: string; qualifier: string }
    builtWith: { title: string; text: string }
    qualifier: string
  }

  faq: {
    id: string
    title: string
    subtitle: string
    items: readonly { question: string; answer: string }[]
  }

  cta: {
    title: string
    description: string
    action: Action
    secondary: Action
    note: string
  }
}

export const viewportConfig = { once: true, margin: "-100px" as const }

export const stagger = (i: number) => ({
  delay: 0.08 * i,
  duration: 0.6,
  ease: "easeOut" as const,
})

/**
 * Scroll-reveal props for an `m.*` element.
 *
 * The rendered markup is IDENTICAL for every user, reduced motion or not, and
 * that is the whole point: `useReducedMotion()` has no `window` during SSR, so
 * it always returns `false` on the server and can flip to `true` on the client's
 * first render. Anything that reaches the DOM — `initial`, which motion
 * serialises into the inline `style` — must therefore never branch on it, or
 * React reports a hydration attribute mismatch (`style` differs) on every
 * revealed node.
 *
 * So: `initial` is hidden and `whileInView` is visible for EVERYONE.
 * `whileInView` is always present too — dropping it under reduced motion would
 * pin the element to the `opacity: 0` the server baked in, with no target to
 * animate towards, and the section would stay invisible forever.
 *
 * Reduced motion is honoured entirely through `transition`, which is runtime
 * behaviour and never reaches the server markup: duration and delay collapse to
 * 0, so the element resolves to `{ opacity: 1, y: 0 }` on the first frame it is
 * in view — an instant appearance, with the `y` travel taking zero time and
 * therefore never rendered as movement.
 */
export const reveal = (reduced: boolean | null | undefined, i = 0, y = 20) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportConfig,
  transition: reduced ? { duration: 0, delay: 0 } : stagger(i),
})

export function resolveHref(locale: string, href: string): string {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) return href
  return buildLocalePath(locale as Locale, href)
}

/** Section eyebrow: monochrome hairline + tracked label. */
export function Eyebrow({ children, tone = "light" }: { children: string; tone?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className={`w-12 h-[1px] ${tone === "dark" ? "bg-white opacity-30" : "bg-[#0a0a0a] opacity-30"}`} />
      <p
        className={`text-[10px] md:text-[11px] font-bold tracking-[0.35em] uppercase ${
          tone === "dark" ? "text-white/70" : "text-[#0a0a0a] opacity-90"
        }`}
      >
        {children}
      </p>
    </div>
  )
}

/** Section head: eyebrow + h2 + description, left-aligned, max-w-3xl. */
export function SectionHeading({
  head,
  tone = "light",
}: {
  head: { eyebrow: string; title: string; description: string }
  tone?: "light" | "dark"
}) {
  return (
    <div className="max-w-3xl mb-14 md:mb-16">
      <Eyebrow tone={tone}>{head.eyebrow}</Eyebrow>
      <h2
        className={`font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 ${
          tone === "dark" ? "text-white" : "text-[#0a0a0a]"
        }`}
      >
        {head.title}
      </h2>
      <p className={`text-lg leading-relaxed ${tone === "dark" ? "text-white/60" : "text-[#525252]"}`}>
        {head.description}
      </p>
    </div>
  )
}

/** Honesty qualifier: the house pattern — plain small paragraph under the block it qualifies. */
export function Qualifier({ text, tone = "light" }: { text: string; tone?: "light" | "dark" }) {
  return (
    <p className={`mt-10 max-w-3xl text-xs leading-relaxed ${tone === "dark" ? "text-[#a3a3a3]" : "text-[#707070]"}`}>
      {text}
    </p>
  )
}

/** Monochrome status chip. The glyph is a small square whose fill encodes the status. */
export function StatusChip({
  status,
  labels,
  tone = "light",
}: {
  status: RealtyStatus
  labels: Record<RealtyStatus, string>
  tone?: "light" | "dark"
}) {
  // Literal class strings only: Tailwind's scanner cannot see interpolated names.
  const glyph: Record<RealtyStatus, string> = {
    built: tone === "dark" ? "bg-white" : "bg-[#0a0a0a]",
    validated: "bg-[#2563eb]",
    simulated: tone === "dark" ? "bg-white/40" : "bg-[#0a0a0a]/40",
    adapter: tone === "dark" ? "border border-white/60" : "border border-[#0a0a0a]/60",
    planned: tone === "dark" ? "border border-dotted border-white/40" : "border border-dotted border-[#0a0a0a]/40",
    notImplemented:
      tone === "dark" ? "border border-dashed border-white/40" : "border border-dashed border-[#0a0a0a]/40",
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[2px] border px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] uppercase whitespace-nowrap ${
        tone === "dark" ? "border-white/15 text-white/75" : "border-[#e5e5e5] text-[#525252]"
      }`}
    >
      <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 ${glyph[status]}`} />
      {labels[status]}
    </span>
  )
}

/**
 * The single demo-data label of a visual frame. Replaces the per-number SIM
 * badges of v1: one quiet tag in the frame header plus sr-only text.
 */
export function DemoTag({ label, srText, tone = "dark" }: { label: string; srText: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[2px] border px-2 py-1 font-mono text-[9px] tracking-[0.22em] uppercase whitespace-nowrap ${
        tone === "dark" ? "border-white/15 text-white/60" : "border-[#e5e5e5] text-[#737373]"
      }`}
    >
      <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 ${tone === "dark" ? "bg-white/40" : "bg-[#0a0a0a]/40"}`} />
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{srText}</span>
    </span>
  )
}
