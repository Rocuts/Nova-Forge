import { faqSection } from "@/content/landing"

export function FAQ() {
  return (
    <section className="py-24 bg-surface-base relative z-10" id={faqSection.sectionId}>
      <div className="container px-4 mx-auto max-w-3xl">
        <h2 className="font-heading text-3xl md:text-4xl font-medium mb-12 text-center">
          {faqSection.title}
        </h2>
        
        <div className="space-y-6">
          {faqSection.items.map((faq) => (
            <div key={faq.question} className="p-6 rounded-[var(--radius-lg)] border border-surface-border bg-surface-elevated/20">
              <h3 className="text-xl font-medium mb-3">{faq.question}</h3>
              <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
