import { cn } from "@/lib/utils"
import { InstrumentLabel } from "./InstrumentLabel"

// Tecnologías con las que construimos — no partnerships ni certificaciones
// (CLAUDE.md). La etiqueta la da el diccionario: `trustBar.label`.
//
// width/height match each SVG's aspect ratio at the rendered 20px height (h-5),
// so the row reserves its space before the images load (no CLS). loading="lazy":
// la fila está muy por debajo del pliegue, y sin él React emite un
// <link rel="preload" as="image"> por logo que compite con el LCP de la portada.
const TRUST_LOGOS = [
  { name: "Amazon Web Services", src: "/logos/aws.svg", width: 33, height: 20 },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", width: 40, height: 20 },
  { name: "Microsoft Azure", src: "/logos/azure.svg", width: 20, height: 20 },
  { name: "OpenAI", src: "/logos/openai.svg", width: 74, height: 20 },
]

const logoClass =
  "h-5 w-auto brightness-0 opacity-[0.35] hover:opacity-70 transition-opacity duration-200"

/* The Vercel lockup is the only one rendered as live text rather than an image,
   so the strip's 0.35 fade would put it at 2.43:1 — images are exempt from the
   contrast rule, real text is not. It carries its own slightly stronger fade
   (black at 0.55 over the #f8f8f8 of TechStack is #707070, 4.66:1) and keeps
   the same behaviour. */
const wordmarkClass =
  "h-5 w-auto brightness-0 opacity-[0.55] hover:opacity-80 transition-opacity duration-200"

/**
 * Fila de logos "Construimos con" (ex TrustBar). Sin sección propia ni fundido
 * de entrada: la monta TechStack, sobre fondo claro.
 */
export function TrustLogos({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-12", className)}>
      <InstrumentLabel tone="light" className="mr-4">
        {label}
      </InstrumentLabel>

      {TRUST_LOGOS.map((logo) => (
        // eslint-disable-next-line @next/next/no-img-element -- local SVGs; next/image would need dangerouslyAllowSVG for no optimization gain
        <img
          key={logo.name}
          src={logo.src}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          loading="lazy"
          className={logoClass}
          draggable={false}
        />
      ))}

      {/* Vercel — inline SVG + text (official source is PNG only) */}
      <span className={`inline-flex items-center gap-1.5 ${wordmarkClass}`} role="img" aria-label="Vercel">
        <svg viewBox="0 0 76 65" className="h-3 w-auto" fill="black" aria-hidden="true">
          <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
        </svg>
        {/* Brand wordmark, dimmed to sit level with the four <img> logos beside
            it. WCAG 1.4.3 exempts logotypes from the contrast minimum; the hook
            below carries that exemption to the a11y gate, which cannot infer it. */}
        <span data-brand-wordmark="vercel" className="select-none text-[13px] font-semibold tracking-tight text-black">
          Vercel
        </span>
      </span>
    </div>
  )
}
