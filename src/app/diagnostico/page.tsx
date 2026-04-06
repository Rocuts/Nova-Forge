import type { Metadata } from "next"
import { DiagnosticWizard } from "@/components/diagnostic/DiagnosticWizard"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Diagnóstico Técnico Gratuito",
  description:
    "Obtenga un diagnóstico personalizado de su infraestructura tecnológica. Identifique oportunidades de automatización, IA y optimización para su negocio.",
  openGraph: {
    title: `Diagnóstico Técnico | ${siteConfig.name}`,
    description: "Diagnóstico personalizado de infraestructura tecnológica y oportunidades de IA.",
  },
}

export default function DiagnosticoPage() {
  return (
    <section className="py-32 relative z-10 min-h-screen">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-cyan/30 bg-primary-cyan/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-cyan/80">
              Diagnóstico Gratuito
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Diagnóstico Técnico
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Complete el formulario y reciba un análisis personalizado de su infraestructura con recomendaciones accionables en menos de 2 minutos.
          </p>
        </div>

        <DiagnosticWizard />
      </div>
    </section>
  )
}
