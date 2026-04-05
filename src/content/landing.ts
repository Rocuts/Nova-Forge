import { siteConfig } from "@/config/site"

export const navItems = [
  { name: "Capacidades", href: "#capacidades" },
  { name: "Sistemas de IA", href: "#sistemas-ia" },
  { name: "Estándar NovaForge", href: "#metodologia" },
  { name: "Equipo", href: "#equipo" },
  { name: "FAQ", href: "#faq" },
]

export const heroContent = {
  eyebrow: "Ingeniería de Sistemas Autónomos",
  titleLead: "Escale su capacidad operativa",
  titleHighlight: "mediante inteligencia y software.",
  description:
    "Transformamos procesos manuales en flujos de trabajo autónomos. Desde plataformas SaaS hasta empleados digitales de IA, desarrollamos la infraestructura tecnológica de alto rendimiento que su organización necesita para liderar.",
  trustLine: "Ingeniería de grado empresarial diseñada para la era de la autonomía.",
  primaryAction: {
    label: "Iniciar Consulta Técnica",
    href: siteConfig.links.scheduling,
    analyticsEvent: "hero_cta_primary",
  },
  secondaryAction: {
    label: "Ver Capacidades de Ingeniería",
    href: "#capacidades",
    analyticsEvent: "hero_cta_services",
  },
} as const

export const servicesSection = {
  sectionId: "capacidades",
  title: "Capacidades de Ingeniería",
  description:
    "Diseñamos, desarrollamos y operamos sistemas digitales completos. Sin soluciones genéricas, solo arquitectura de alto rendimiento adaptada a sus objetivos de negocio.",
  items: [
    {
      title: "Sistemas Empresariales a Medida",
      benefit: "Sistemas robustos diseñados para centralizar y optimizar operaciones complejas.",
      bullets: [
        "Arquitectura Cloud Nativa",
        "Gestión de Datos Críticos",
        "Integración de Sistemas Legacy",
      ],
      icon: "cpu",
    },
    {
      title: "Plataformas SaaS Escalables",
      benefit: "Productos de software diseñados para el modelo de suscripción y escala global.",
      bullets: [
        "Arquitectura Multi-tenant",
        "Facturación y Pagos Integrados",
        "Paneles Analíticos en Tiempo Real",
      ],
      icon: "cloud",
    },
    {
      title: "Aplicaciones Móviles de Alto Rendimiento",
      benefit: "Experiencias nativas fluidas que extienden su ecosistema digital.",
      bullets: [
        "Desarrollo Nativo iOS/Android",
        "Optimización de Rendimiento",
        "UX de Grado Enterprise",
      ],
      icon: "smartphone",
    },
    {
      title: "Sistemas de Escritorio",
      benefit: "Aplicaciones potentes para macOS y Windows integradas en el entorno local.",
      bullets: [
        "Rendimiento de Hardware Nativo",
        "Sincronización Fuera de Línea",
        "Automatización de Tareas Locales",
      ],
      icon: "monitor",
    },
    {
      title: "Ecosistemas Web Avanzados",
      benefit: "Presencia digital optimizada para conversiones y alto tráfico.",
      bullets: [
        "Optimización de Latencia",
        "SEO Técnico Avanzado",
        "Arquitectura Serverless",
      ],
      icon: "globe",
    },
    {
      title: "Sistemas de Inteligencia Aplicada",
      benefit: "Automatización inteligente que reduce drásticamente la carga operativa.",
      bullets: [
        "Lógica de Negocio mediante Agentes",
        "Procesamiento de Lenguaje Natural",
        "Análisis Predictivo de Datos",
      ],
      icon: "brain",
    },
  ],
} as const

export const flagshipAISection = {
  sectionId: "sistemas-ia",
  title: "Sistemas de IA de Grado Empresarial",
  description:
    "Desplegamos empleados digitales que ejecutan tareas, atienden clientes y operan bajo su lógica de negocio las 24 horas del día, con precisión quirúrgica.",
  items: [
    {
      title: "Agentes de Voz para Operaciones",
      description:
        "Atención telefónica inteligente capaz de resolver trámites, agendar citas y escalar casos complejos a humanos en tiempo real.",
      icon: "phone",
    },
    {
      title: "Agentes de Chat Conversacional",
      description:
        "Resolución de consultas instantánea en Web, WhatsApp o Slack, extrayendo información directamente de su base de conocimiento interna.",
      icon: "message",
    },
    {
      title: "Automatización de Procesos Autónomos",
      description:
        "Agentes que ejecutan flujos de trabajo completos: desde entradas de datos hasta generación de reportes e integración de APIs sin intervención humana.",
      icon: "operations",
    },
  ],
  caption:
    "Ingeniería invisible para el usuario. Impacto medible para el negocio.",
} as const

export const methodologySection = {
  sectionId: "metodologia",
  title: "The NovaForge Standard",
  description:
    "Nuestro proceso de ingeniería está diseñado para eliminar la incertidumbre y garantizar la entrega de valor en cada despliegue.",
  steps: [
    {
      num: "01",
      title: "Diagnóstico y Auditoría Técnica",
      desc: "Análisis exhaustivo de su infraestructura actual y definición de objetivos de negocio.",
    },
    {
      num: "02",
      title: "Arquitectura de Sistemas y Datos",
      desc: "Modelado de la solución técnica para asegurar escalabilidad y mantenibilidad a largo plazo.",
    },
    {
      num: "03",
      title: "Ingeniería y Desarrollo de Agentes",
      desc: "Construcción del core del sistema e integración de lógica inteligente personalizada.",
    },
    {
      num: "04",
      title: "Validación y QA de Alta Disponibilidad",
      desc: "Pruebas de estrés y seguridad para garantizar un despliegue sin interrupciones.",
    },
    {
      num: "05",
      title: "Operación y Evolución Continua",
      desc: "Monitoreo estratégico, optimización de latencias y soporte técnico especializado.",
    },
  ],
} as const

export const teamSection = {
  sectionId: "equipo",
  title: "Nuestro Liderazgo Técnico",
  description: `Ingeniería y estrategia detrás de ${siteConfig.name}.`,
  members: [
    {
      name: "Cristian Mancilla",
      initials: "CM",
      role: "CTO - Director de Tecnología",
      tagline: "Especialista en arquitectura de sistemas distribuidos.",
    },
    {
      name: "Johan Rocuts",
      initials: "JR",
      role: "CEO - Director Ejecutivo",
      tagline: "Estratega de productos digitales de alta escala.",
    },
    {
      name: "Yeison Arley",
      initials: "YA",
      role: "Director de Estrategia Comercial",
      tagline: "Especialista en soluciones tecnológicas B2B.",
    },
    {
      name: "Andres Rodriguez",
      initials: "AR",
      role: "Ingeniero Full Stack Senior",
      tagline: "Experto en desarrollo web de alto rendimiento.",
    },
  ],
} as const

export const faqItems = [
  {
    question: "¿Qué tipo de soluciones tecnológicas desarrollan?",
    answer:
      "Desarrollamos ecosistemas digitales completos: software empresarial a medida, SaaS multiplataforma, aplicaciones móviles nativas y sistemas integrados con inteligencia artificial autónoma.",
  },
  {
    question: "¿Cuál es el retorno de inversión de la IA en mi negocio?",
    answer:
      "Nuestros agentes reducen el costo operativo hasta en un 80% en tareas repetitivas de soporte y gestión, permitiendo que su equipo humano se enfoque en decisiones estratégicas de alto valor.",
  },
  {
    question: "¿Tienen experiencia trabajando con industrias fuera de tecnología?",
    answer:
      "Sí. Trabajamos con empresas de manufactura, logística, finanzas y servicios que buscan modernizar sus flujos de trabajo y automatizar su operación mediante ingeniería de precisión.",
  },
  {
    question: "¿Cuánto tiempo toma entregar un sistema completo?",
    answer:
      "Nuestra metodología permite desplegar MVPs funcionales y robustos en 8-12 semanas, escalando la solución mediante ciclos incrementales de alto impacto.",
  },
]

export const faqSection = {
  sectionId: "faq",
  title: "Preguntas Frecuentes",
  items: faqItems,
} as const

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export const ctaSection = {
  highlight: "necesita ejecutar.",
  description:
    "Sea un producto nuevo o la optimización total de su operación de IA: agenda una evaluación técnica y hablemos de resultados.",
  action: {
    label: "Iniciar Diagnóstico Técnico",
    href: siteConfig.links.scheduling,
    analyticsEvent: "cta_final_click",
  },
} as const
