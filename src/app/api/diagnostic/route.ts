import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  const answers = await request.json()

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
