export function Metrics() {
  const kpis = [
    { value: "40%", label: "Reducción promedio en Time-to-Market" },
    { value: "99.9%", label: "Uptime en arquitecturas cloud-native" },
    { value: "10x", label: "Escalabilidad en flujos de datos IA" }
  ]

  return (
    <section className="py-24 bg-surface-elevated/10 relative z-10">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-5xl font-black tracking-tighter mb-6">Impacto Cuantificable</h2>
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-8">
              No diseñamos para premios de estética. Construimos para mejorar la eficiencia del negocio, aumentar la conversión y crear sistemas tolerantes a fallos.
            </p>
            <div className="inline-flex items-center text-primary-cyan text-sm font-medium tracking-wide">
              Métricas auditadas de proyectos Enterprise &rarr;
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="p-8 rounded-[var(--radius-lg)] border border-surface-border bg-surface-base shadow-2xl">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                  {kpi.value}
                </div>
                <div className="text-text-secondary text-sm md:text-base font-medium">
                  {kpi.label}
                </div>
              </div>
            ))}
            <div className="p-8 rounded-[var(--radius-lg)] bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-center shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <span className="text-primary-cyan font-medium">Optimización Medible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
