interface MetricsContent {
  title: string
  description: string
  kpiLabel: string
  optimizationLabel: string
  kpis: readonly { value: string; label: string }[]
}

export function Metrics({ content }: { content: MetricsContent }) {
  return (
    <section className="py-24 bg-surface-base/60 backdrop-blur-sm relative z-10 border-t border-surface-border/50">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">{content.title}</h2>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
              {content.description}
            </p>
            <div className="inline-flex items-center gap-2 text-primary-cyan text-sm font-bold tracking-[0.1em] uppercase">
              {content.kpiLabel}
              <span className="text-lg">&rarr;</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {content.kpis.map((kpi, i) => (
              <div key={i} className="p-10 glass-panel rounded-[var(--radius-lg)]">
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
                  {kpi.value}
                </div>
                <div className="text-slate-400 text-sm md:text-base font-medium leading-snug">
                  {kpi.label}
                </div>
              </div>
            ))}
            <div className="p-10 glass-panel rounded-[var(--radius-lg)] flex flex-col items-center justify-center text-center">
              <div className="w-2 h-2 rounded-full bg-primary-cyan mb-4 animate-pulse" />
              <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">{content.optimizationLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
