export function Metrics() {
  const kpis = [
    { value: "40%", label: "Reducción promedio en Time-to-Market" },
    { value: "99.9%", label: "Uptime en arquitecturas cloud-native" },
    { value: "10x", label: "Escalabilidad en flujos de datos IA" }
  ]

  return (
    <section className="py-24 bg-surface-base relative z-10 border-t border-surface-border/50">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">Impacto Cuantificable</h2>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
              No diseñamos para premios de estética. Construimos para maximizar la eficiencia operativa, aumentar la conversión y desplegar sistemas de alta disponibilidad que escalan con su negocio.
            </p>
            <div className="inline-flex items-center gap-2 text-primary-cyan text-sm font-bold tracking-[0.1em] uppercase">
              Métricas auditadas de proyectos Enterprise
              <span className="text-lg">→</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="p-10 rounded-[var(--radius-lg)] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-2xl">
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
                  {kpi.value}
                </div>
                <div className="text-slate-400 text-sm md:text-base font-medium leading-snug">
                  {kpi.label}
                </div>
              </div>
            ))}
            <div className="p-10 rounded-[var(--radius-lg)] bg-zinc-900/20 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
              <div className="w-2 h-2 rounded-full bg-primary-cyan mb-4 animate-pulse" />
              <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">Optimización Real</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
