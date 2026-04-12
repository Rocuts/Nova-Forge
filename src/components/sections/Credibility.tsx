interface CredibilityContent {
  title: string
}

export function Credibility({ content }: { content: CredibilityContent }) {
  const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "AWS", "Three.js"]

  return (
    <section className="py-24 bg-white border-t border-[#e5e5e5] relative z-10">
      <div className="container px-4 mx-auto max-w-7xl text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-medium mb-12 text-text-secondary">
          {content.title}
        </h2>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {stack.map((tech, i) => (
            <div
              key={i}
              className="px-6 py-3 rounded-[6px] border border-[#e5e5e5] bg-[#f8f8f8] text-[#525252] font-medium tracking-wide hover:text-[#0a0a0a] hover:border-[#0a0a0a]/30 transition-all cursor-default"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
