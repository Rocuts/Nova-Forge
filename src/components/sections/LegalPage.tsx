import type { ReactNode } from "react"

type LegalPageProps = {
  title: string
  description: string
  updatedAt: string
  labels: { badge: string; lastUpdated: string }
  children: ReactNode
}

export function LegalPage({
  title,
  description,
  updatedAt,
  labels,
  children,
}: LegalPageProps) {
  return (
    <section className="py-32 bg-surface-base/60 backdrop-blur-sm relative z-10">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="max-w-3xl mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-primary-cyan mb-4">
            {labels.badge}
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-4">
            {description}
          </p>
          <p className="text-sm text-text-secondary">
            {labels.lastUpdated}: {updatedAt}
          </p>
        </div>

        <div className="space-y-12">{children}</div>
      </div>
    </section>
  )
}
