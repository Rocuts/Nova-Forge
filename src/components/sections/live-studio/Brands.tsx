"use client"
import { m } from "motion/react"
import { Button } from "@/components/ui/Button"
import { Eyebrow, resolveHref, stagger, viewportConfig } from "./shared"
import type { LiveStudioContent } from "./shared"

type Props = { brands: LiveStudioContent["brands"]; locale: string }

export function LiveStudioBrands({ brands, locale }: Props) {
  return (
    <section className="bg-[#0a0a0a] py-24 md:py-32" data-header-theme="dark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Eyebrow>{brands.eyebrow}</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              {brands.title}
            </h2>
            <p className="text-lg text-white/55 leading-relaxed mb-10">
              {brands.description}
            </p>
            <Button
              size="lg"
              variant="secondary"
              href={resolveHref(locale, brands.action.href)}
              className="border-white/25 text-white hover:bg-white/10 hover:border-white/45"
            >
              {brands.action.label}
            </Button>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t border-white/10">
              {brands.items.map((item, i) => (
                <m.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportConfig}
                  transition={stagger(i)}
                  className="py-7 border-b border-white/10 flex gap-6"
                >
                  <span className="font-mono text-[10px] tracking-[0.26em] text-white/25 pt-1.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
