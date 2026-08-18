"use client"
import Link from "next/link"
import { m } from "motion/react"
import { CoverReveal } from "@/components/animations/CoverReveal"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface ServicesContent {
  sectionId: string
  title: string
  exploreLabel: string
  description: string
  items: readonly { title: string; benefit: string; bullets: readonly string[]; icon: string; href?: string }[]
}

export function Services({ content: servicesSection, locale }: { content: ServicesContent; locale: string }) {
  return (
    <m.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="py-16 sm:py-32 bg-white bg-grid relative z-10"
      id={servicesSection.sectionId}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 sm:mb-20 max-w-3xl">
          <CoverReveal as="h2" className="font-heading text-3xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-[#0a0a0a]">
            {servicesSection.title}
          </CoverReveal>
          <p className="text-[#525252] text-lg md:text-xl leading-relaxed">
            {servicesSection.description}
          </p>
        </div>

        <m.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {servicesSection.items.map((svc) => {
            const cardContent = (
              <>
                <h3 className="text-xl font-semibold mb-4 tracking-tight text-[#0a0a0a]">{svc.title}</h3>
                <p className="text-[#525252] mb-8 text-base leading-relaxed">{svc.benefit}</p>
                <ul className="space-y-3 mt-auto">
                  {svc.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start text-sm text-[#525252] leading-snug">
                      <span className="mr-3 mt-0.5 text-[#a3a3a3] select-none" aria-hidden="true">&ndash;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
                {svc.href && (
                  <span className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#0a0a0a] group-hover:text-[#525252] transition-colors">
                    {servicesSection.exploreLabel} <span aria-hidden="true">&rarr;</span>
                  </span>
                )}
              </>
            )

            return (
              <m.div
                key={svc.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`group bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-6 sm:p-10 flex flex-col hover:border-[#a3a3a3] transition-colors duration-300${svc.href ? " cursor-pointer" : ""}`}
              >
                {svc.href ? (
                  <Link href={buildLocalePath(locale as Locale, svc.href)} className="flex flex-col h-full">
                    {cardContent}
                  </Link>
                ) : (
                  <div className="flex flex-col h-full">{cardContent}</div>
                )}
              </m.div>
            )
          })}
        </m.div>
      </div>
    </m.section>
  )
}
