"use client"
import { useEffect, useRef } from "react"

// width/height match each SVG's aspect ratio at the rendered 20px height (h-5),
// so the row reserves its space before the images load (no CLS).
const TRUST_LOGOS = [
  { name: "Amazon Web Services", src: "/logos/aws.svg", width: 33, height: 20 },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", width: 40, height: 20 },
  { name: "Microsoft Azure", src: "/logos/azure.svg", width: 20, height: 20 },
  { name: "OpenAI", src: "/logos/openai.svg", width: 74, height: 20 },
]

const logoClass =
  "h-5 w-auto brightness-0 opacity-[0.35] hover:opacity-70 transition-opacity duration-200"

export function TrustBar({ label }: { label: string }) {
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = "opacity 0.6s ease"
          el.style.opacity = "1"
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-12 border-y border-[#e5e5e5] bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={innerRef}
          style={{ opacity: 0 }}
          className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 gap-y-4"
        >
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mr-4">
            {label}
          </span>

          {TRUST_LOGOS.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element -- local SVGs; next/image would need dangerouslyAllowSVG for no optimization gain
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              className={logoClass}
              draggable={false}
            />
          ))}

          {/* Vercel — inline SVG + text (official source is PNG only) */}
          <span
            className={`inline-flex items-center gap-1.5 ${logoClass}`}
            role="img"
            aria-label="Vercel"
          >
            <svg viewBox="0 0 76 65" className="h-3 w-auto" fill="black">
              <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
            </svg>
            <span className="text-[13px] font-semibold tracking-tight text-black select-none">
              Vercel
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
