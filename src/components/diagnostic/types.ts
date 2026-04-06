export interface DiagnosticAnswers {
  companyName: string
  industry: string
  teamSize: string
  role: string
  currentStack: string[]
  cloudProvider: string
  aiMaturity: string
  painPoints: string[]
  painDetails: string
  goals: string[]
  budgetRange: string
  timeline: string
  decisionStage: string
  contactName: string
  contactEmail: string
  contactWebsite: string
  additionalNotes: string
}

export const INITIAL_ANSWERS: DiagnosticAnswers = {
  companyName: "",
  industry: "",
  teamSize: "",
  role: "",
  currentStack: [],
  cloudProvider: "",
  aiMaturity: "",
  painPoints: [],
  painDetails: "",
  goals: [],
  budgetRange: "",
  timeline: "",
  decisionStage: "",
  contactName: "",
  contactEmail: "",
  contactWebsite: "",
  additionalNotes: "",
}

export const INDUSTRIES = [
  "Fintech",
  "Healthcare",
  "E-commerce",
  "SaaS / Software",
  "Enterprise / Corporativo",
  "Educación",
  "Logística",
  "Otra",
]

export const TEAM_SIZES = ["1-10", "11-50", "51-200", "200+"]

export const ROLES = [
  "Founder / CEO",
  "CTO / VP Engineering",
  "Product Manager",
  "Director de Operaciones",
  "Otro",
]

export const TECH_STACK = [
  "React / Next.js",
  "Vue / Nuxt",
  "Angular",
  "Node.js",
  "Python",
  "Java / Spring",
  ".NET / C#",
  "Go",
  "Ruby on Rails",
  "PHP / Laravel",
  "Mobile (React Native / Flutter)",
  "WordPress / No-code",
]

export const CLOUD_PROVIDERS = ["AWS", "Google Cloud", "Azure", "Ninguno / On-premise", "No estoy seguro"]

export const AI_MATURITY = [
  "Sin uso de IA",
  "Experimentando",
  "IA en producción (básico)",
  "IA avanzada en producción",
]

export const PAIN_POINTS = [
  "Procesos manuales que deberían estar automatizados",
  "Silos de datos / pobre integración entre sistemas",
  "Cuellos de botella de escalabilidad",
  "Experiencia del cliente deficiente",
  "Herramientas internas obsoletas",
  "Necesidad de capacidades de IA/ML",
  "Falta de visibilidad / analytics",
  "Costos operativos elevados",
]

export const GOALS = [
  "Construir un nuevo producto SaaS",
  "Automatizar flujos internos con IA",
  "Integrar IA en producto existente",
  "Modernizar sistemas legacy",
  "Construir agentes / pipelines autónomos",
  "Mejorar infraestructura cloud",
  "Desarrollar app móvil",
]

export const BUDGET_RANGES = [
  "$10K - $25K",
  "$25K - $75K",
  "$75K - $150K",
  "$150K+",
]

export const TIMELINES = [
  "Lo antes posible",
  "1 - 3 meses",
  "3 - 6 meses",
  "6+ meses",
]

export const DECISION_STAGES = [
  "Investigando opciones",
  "Evaluando proveedores",
  "Listo para iniciar",
]
