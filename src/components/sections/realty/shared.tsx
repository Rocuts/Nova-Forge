// Types + presentational primitives shared by the RealTy landing sections.
// Deliberately has NO "use client" directive: server and client islands both
// import from here. The RealtyContent type is the contract between the
// dictionaries (src/content/dictionaries/{es,en}.ts → `realty`) and the
// sections under ./ — change it only together with both dictionaries.
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

/** Reality status of a capability. Mirrors the product README "What is real". */
export type RealtyStatus = "real" | "simulated" | "mock" | "not_implemented" | "planned"

interface Action {
  label: string
  href: string
}

interface SectionHead {
  id: string
  eyebrow: string
  title: string
  description: string
}

export type TranscriptTurn =
  | { kind: "buyer" | "advisor"; text: string }
  | { kind: "tool"; name: string; args: string; result: string; status: RealtyStatus }

export interface RealtyContent {
  eyebrow: string
  statusLine: string
  statusLabels: Record<RealtyStatus, string>
  hero: {
    title: string
    subtitle: string
    description: string
    primaryAction: Action
    secondaryAction: Action
    frame: {
      label: string
      readinessLabel: string
      readinessValue: string
      rows: readonly { key: string; value: string; simulated: boolean }[]
      closeLabel: string
      closeValue: string
      liveLabel: string
      liveIndicator: string
    }
  }
  architecture: SectionHead & {
    legendTitle: string
    layers: readonly {
      key: "channels" | "orchestration" | "sources" | "outcomes"
      title: string
      caption: string
      nodes: readonly { label: string; detail: string; status: RealtyStatus }[]
    }[]
    /** Mono strapline inside the orchestration container. */
    centerLabel: string
    /** Caption under the diagram explaining what the arrows mean. */
    flowLabel: string
    qualifier: string
  }
  machine: SectionHead & {
    stages: readonly { step: string; title: string; description: string; status: RealtyStatus; detail: string }[]
    qualifier: string
  }
  experience: SectionHead & {
    scenarioLabel: string
    transcriptLabel: string
    controls: { play: string; pause: string; next: string; restart: string }
    /** Visible captions above each conversational turn, so a reader can tell who speaks. */
    speakerLabels: { buyer: string; advisor: string }
    toolLabel: string
    turns: readonly TranscriptTurn[]
    action: Action
    qualifier: string
  }
  commandCenter: SectionHead & {
    band: string
    simToken: string
    simSrText: string
    opportunities: {
      title: string
      columns: readonly string[]
      rows: readonly { lead: string; country: string; stage: string; readiness: string; band: string; close: string; unit: string }[]
    }
    readiness: {
      title: string
      score: string
      scoreLabel: string
      components: readonly { name: string; weight: string; note: string }[]
      blockersTitle: string
      blockers: readonly string[]
    }
    closeLedger: {
      title: string
      summary: string
      states: readonly { name: string; met: boolean }[]
    }
    live: {
      title: string
      indicator: string
      events: readonly { lane: string; text: string }[]
    }
    qualifier: string
  }
  journey: SectionHead & {
    systemLabel: string
    buyerLabel: string
    steps: readonly { step: string; title: string; system: string; buyer: string; status: RealtyStatus }[]
    qualifier: string
  }
  omnichannel: SectionHead & {
    principle: string
    channels: readonly { name: string; description: string; status: RealtyStatus }[]
    qualifier: string
  }
  inventory: SectionHead & {
    claimTypesTitle: string
    claimTypes: readonly { name: string; description: string }[]
    example: {
      title: string
      inputsTitle: string
      inputs: readonly { label: string; value: string }[]
      outputTitle: string
      output: readonly { label: string; value: string; note: string }[]
      chainTitle: string
      chain: readonly { kind: string; text: string }[]
      unknownsTitle: string
      unknowns: readonly string[]
    }
    hierarchy: { title: string; description: string; levels: readonly string[]; status: RealtyStatus }
    qualifier: string
  }
  followUp: SectionHead & {
    items: readonly { title: string; description: string; status: RealtyStatus }[]
    qualifier: string
  }
  visual: SectionHead & {
    loopTitle: string
    loop: readonly { step: string; title: string; description: string }[]
    prototype: { title: string; paragraphs: readonly string[] }
    roadmapTitle: string
    roadmap: readonly string[]
    qualifier: string
  }
  impact: SectionHead & {
    outcomes: readonly { title: string; description: string }[]
    target: { title: string; value: string; description: string; qualifier: string }
  }
  proof: SectionHead & {
    columns: readonly string[]
    rows: readonly { component: string; status: RealtyStatus; note: string }[]
    builtWith: { title: string; items: readonly string[]; note: string }
    qualifier: string
  }
  faq: { id: string; title: string; subtitle: string; items: readonly { question: string; answer: string }[] }
  cta: { title: string; description: string; action: Action; secondary: Action }
  disclaimer: string
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
  const glyph: Record<RealtyStatus, string> = {
    real: tone === "dark" ? "bg-white" : "bg-[#0a0a0a]",
    simulated: tone === "dark" ? "bg-white/40" : "bg-[#0a0a0a]/40",
    mock: tone === "dark" ? "border border-white/60" : "border border-[#0a0a0a]/60",
    not_implemented: tone === "dark" ? "border border-dashed border-white/40" : "border border-dashed border-[#0a0a0a]/40",
    planned: tone === "dark" ? "border border-dotted border-white/40" : "border border-dotted border-[#0a0a0a]/40",
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
 * A simulated figure: 45° hatch ground that survives a screenshot, a mono SIM
 * token, and sr-only text so screen readers hear the label too.
 */
export function SimValue({
  children,
  token,
  srText,
  tone = "dark",
}: {
  children: React.ReactNode
  token: string
  srText: string
  tone?: "light" | "dark"
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`relative inline-block px-1 rounded-[2px] ${tone === "dark" ? "text-white" : "text-[#0a0a0a]"}`}>
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[2px] opacity-[0.18]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 5px)" }}
        />
        <span className="relative">{children}</span>
      </span>
      <span aria-hidden="true" className={`font-mono text-[9px] tracking-[0.2em] ${tone === "dark" ? "text-white/55" : "text-[#737373]"}`}>
        {token}
      </span>
      <span className="sr-only">{srText}</span>
    </span>
  )
}
