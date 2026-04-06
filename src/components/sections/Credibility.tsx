export function Credibility() {
  const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "AWS", "Three.js"]

  return (
    <section className="py-24 bg-surface-base/60 backdrop-blur-sm border-t border-surface-border/50 relative z-10">
      <div className="container px-4 mx-auto max-w-7xl text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-medium mb-12 text-text-secondary">
          Stack Tecnológico de Grado Enterprise
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {stack.map((tech, i) => (
            <div 
              key={i} 
              className="px-6 py-3 rounded-full border border-surface-border bg-surface-elevated/30 text-text-primary/70 font-medium tracking-wide hover:text-white hover:border-primary-cyan/50 hover:bg-primary-cyan/5 transition-all cursor-default"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
