import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

function generateFallbackReport(answers: Record<string, unknown>): string {
  const painPoints = (answers.painPoints as string[]) || []
  const goals = (answers.goals as string[]) || []
  const stack = (answers.currentStack as string[]) || []
  const company = (answers.companyName as string) || "su empresa"

  const maturityMap: Record<string, string> = {
    "Sin uso de IA": "Inicial",
    "Experimentando": "En desarrollo",
    "IA en producción (básico)": "Intermedio",
    "IA avanzada en producción": "Avanzado",
  }
  const maturity = maturityMap[answers.aiMaturity as string] || "En desarrollo"

  return `## Resumen Ejecutivo

Basado en el análisis de ${company}, identificamos una organización en el sector **${answers.industry}** con un equipo de **${answers.teamSize} personas** que opera con un stack basado en **${stack.slice(0, 3).join(", ") || "tecnologías estándar"}** en **${answers.cloudProvider || "infraestructura no especificada"}**. Existen oportunidades significativas de optimización, especialmente en automatización y adopción de IA.

## Nivel de Madurez Digital

**Nivel: ${maturity}**

${maturity === "Inicial" ? "Su organización está en las etapas iniciales de transformación digital. Hay una gran oportunidad de implementar soluciones de IA que generen ventaja competitiva desde el inicio." : ""}${maturity === "En desarrollo" ? "Su organización ha comenzado a explorar soluciones de IA. El siguiente paso es pasar de la experimentación a implementaciones en producción con impacto medible." : ""}${maturity === "Intermedio" ? "Su organización ya tiene IA en producción. El enfoque debe estar en escalar estas soluciones y maximizar el ROI de las inversiones actuales." : ""}${maturity === "Avanzado" ? "Su organización tiene una postura madura en IA. Las oportunidades están en la optimización avanzada, agentes autónomos y la innovación continua." : ""}

## Oportunidades Identificadas

${painPoints.map((p, i) => `- **Oportunidad ${i + 1}:** Abordar "${p}" mediante soluciones de automatización inteligente adaptadas a su stack actual.`).join("\n")}
${painPoints.length === 0 ? "- Se requiere una consulta más profunda para identificar oportunidades específicas." : ""}

## Recomendaciones Técnicas

${goals.map((g, i) => `- **Recomendación ${i + 1}:** Para "${g}", sugerimos un enfoque por fases comenzando con un MVP en las primeras ${answers.timeline === "Lo antes posible" ? "4-6 semanas" : "8-12 semanas"}, validando con métricas reales antes de escalar.`).join("\n")}

## Estimación de Impacto

Basado en proyectos similares en la industria de **${answers.industry}**:
- **Reducción de costos operativos:** 25-40% en procesos automatizados
- **Tiempo ahorrado:** 15-30 horas semanales por equipo en tareas repetitivas
- **Mejora en eficiencia:** 2-5x en flujos de trabajo optimizados con IA

## Siguiente Paso

Este diagnóstico es una evaluación inicial basada en la información proporcionada. Para un análisis más profundo que incluya auditoría técnica de su infraestructura, modelado de ROI específico y propuesta de arquitectura, lo invitamos a **agendar una consulta estratégica gratuita** con nuestro equipo de ingeniería.`
}

export async function POST(request: Request) {
  const answers = await request.json()

  // If no API key, return a structured fallback report
  if (!process.env.OPENAI_API_KEY) {
    const fallback = generateFallbackReport(answers)
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const prompt = `Eres un consultor senior de tecnología de la agencia NovaForge, especializada en IA y software empresarial.

Genera un diagnóstico técnico personalizado y profesional basado en las siguientes respuestas del cliente. El diagnóstico debe ser en español, conciso pero valioso, y demostrar expertise técnico real.

## Datos del Cliente:
- Empresa: ${answers.companyName || "No especificada"}
- Industria: ${answers.industry}
- Tamaño del equipo: ${answers.teamSize}
- Rol del contacto: ${answers.role}
- Stack actual: ${answers.currentStack?.join(", ") || "No especificado"}
- Cloud: ${answers.cloudProvider}
- Madurez en IA: ${answers.aiMaturity}
- Desafíos: ${answers.painPoints?.join(", ")}
- Detalle adicional: ${answers.painDetails || "No proporcionado"}
- Objetivos: ${answers.goals?.join(", ")}
- Presupuesto: ${answers.budgetRange}
- Timeline: ${answers.timeline}
- Etapa de decisión: ${answers.decisionStage}
- Notas adicionales: ${answers.additionalNotes || "Ninguna"}

## Estructura del Diagnóstico:

### Resumen Ejecutivo
Un párrafo breve con la evaluación general.

### Nivel de Madurez Digital
Evalúa su nivel actual (Inicial / En desarrollo / Intermedio / Avanzado) y justifica brevemente.

### Oportunidades Identificadas
3-4 oportunidades concretas basadas en sus desafíos y objetivos. Sé específico con tecnologías y enfoques.

### Recomendaciones Técnicas
3-4 recomendaciones priorizadas y accionables. Incluye tecnologías específicas cuando sea relevante.

### Estimación de Impacto
Beneficios potenciales cuantificados (reducción de costos, tiempo ahorrado, mejora en eficiencia).

### Siguiente Paso
Un párrafo invitando a agendar una consulta estratégica para profundizar en el diagnóstico.

Mantén un tono profesional pero accesible. No uses jerga innecesaria. Sé específico y práctico, no genérico.`

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  })

  return result.toTextStreamResponse()
}
