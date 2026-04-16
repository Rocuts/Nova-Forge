"use client"
import { useEffect, useRef } from "react"

const TRUST_ITEMS = [
  "Amazon Web Services",
  "Google Cloud",
  "Microsoft Azure",
  "OpenAI",
  "Vercel",
]

export function TrustBar() {
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
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
        >
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#a3a3a3] mr-4">
            Infraestructura certificada
          </span>
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              className="text-sm font-medium text-[#a3a3a3] tracking-wide"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
