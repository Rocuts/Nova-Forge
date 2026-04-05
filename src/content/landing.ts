import { siteConfig } from "@/config/site"

export const navItems = [
  { name: "Servicios", href: "#servicios" },
  { name: "IA Empresarial", href: "#ia-empresarial" },
  { name: "Equipo", href: "#equipo" },
  { name: "FAQ", href: "#faq" },
]

export const heroContent = {
  eyebrow: "Fábrica de Software & Inteligencia Artificial",
  titleLead: "Construimos software.",
  titleHighlight: "Desplegamos agentes de IA.",
  description:
    "Somos una fábrica de software que diseña, construye y opera sistemas digitales completos, desde aplicaciones empresariales hasta agentes de IA que trabajan por tu negocio.",
  primaryAction: {
    label: "Agendar reunión",
    href: siteConfig.links.scheduling,
    analyticsEvent: "hero_cta_primary",
  },
  secondaryAction: {
    label: "Ver servicios",
    href: "#servicios",
    analyticsEvent: "hero_cta_services",
  },
} as const

export const servicesSection = {
  sectionId: "servicios",
  title: "Lo Que Construimos",
  description:
    "Diseñamos, desarrollamos y desplegamos software completo, desde la idea hasta la operación.",
  items: [
    {
      title: "Software Empresarial a Medida",
      benefit:
        "Sistemas robustos diseñados para las necesidades específicas de tu operación.",
      bullets: [
        "Aplicaciones web complejas",
        "Sistemas internos de gestión",
        "Integraciones con sistemas existentes",
      ],
      icon: "cpu",
    },
    {
      title: "Plataformas SaaS",
      benefit:
        "Productos de software listos para modelo de suscripción y escala.",
      bullets: [
        "Arquitectura multi-tenant",
        "Facturación integrada",
        "Paneles analíticos",
      ],
      icon: "cloud",
    },
    {
      title: "Aplicaciones Móviles",
      benefit:
        "Apps nativas para Android e iOS con rendimiento y diseño profesional.",
      bullets: [
        "Android nativo",
        "iOS nativo",
        "Experiencia de usuario optimizada",
      ],
      icon: "smartphone",
    },
    {
      title: "Software de Escritorio",
      benefit:
        "Aplicaciones para macOS y Windows adaptadas a flujos de trabajo empresarial.",
      bullets: [
        "macOS",
        "Windows",
        "Integración con ecosistemas existentes",
      ],
      icon: "monitor",
    },
    {
      title: "Sitios Web",
      benefit:
        "Presencia digital de alto rendimiento con arquitectura moderna.",
      bullets: [
        "Rendimiento optimizado",
        "SEO avanzado",
        "Diseño responsivo",
      ],
      icon: "globe",
    },
    {
      title: "Sistemas de IA",
      benefit:
        "Automatización inteligente integrada en tu operación de negocio.",
      bullets: [
        "Agentes de IA conversacionales",
        "Automatización de procesos",
        "Análisis inteligente de datos",
      ],
      icon: "brain",
    },
  ],
} as const

export const flagshipAISection = {
  sectionId: "ia-empresarial",
  title: "Inteligencia Artificial para tu Operación",
  description:
    "Desplegamos agentes de IA que trabajan como parte de tu equipo, atendiendo clientes, resolviendo consultas y ejecutando tareas operativas sin intervención humana.",
  items: [
    {
      title: "Agentes de IA para Soporte Telefónico",
      description:
        "Atienden llamadas entrantes, resuelven consultas frecuentes y escalan a humanos cuando es necesario. Disponibles 24/7 sin tiempos de espera.",
      icon: "phone",
    },
    {
      title: "Agentes de IA para Chat",
      description:
        "Responden en tiempo real a través de chat web, WhatsApp o cualquier canal de mensajería. Conversaciones naturales que resuelven problemas reales.",
      icon: "message",
    },
    {
      title: "Empleados Digitales",
      description:
        "Agentes de IA que ejecutan tareas operativas repetitivas: procesamiento de datos, generación de reportes, gestión de inventarios y más.",
      icon: "operations",
    },
  ],
  caption:
    "Tecnología invisible para el usuario final. Impacto medible para tu negocio.",
} as const

export const methodologySection = {
  sectionId: "metodologia",
  title: "Cómo Trabajamos",
  description:
    "Aplicamos un proceso de ingeniería estructurado en cada proyecto. Sin improvisación, sin atajos.",
  steps: [
    {
      num: "01",
      title: "Diagnóstico y Alcance",
      desc: "Auditoría técnica de la operación actual y definición arquitectónica.",
    },
    {
      num: "02",
      title: "Arquitectura de Sistema",
      desc: "Diseño del stack, diagramado de flujos y modelo de datos.",
    },
    {
      num: "03",
      title: "Desarrollo e Integración IA",
      desc: "Desarrollo de los agentes y construcción del core de producto.",
    },
    {
      num: "04",
      title: "QA y Despliegue",
      desc: "Pruebas exhaustivas, despliegue serverless e infraestructura cloud.",
    },
    {
      num: "05",
      title: "Evolución Continua",
      desc: "Monitoreo, reducción de latencias y escalamiento de la solución.",
    },
  ],
} as const

export const teamSection = {
  sectionId: "equipo",
  title: "Nuestro Equipo",
  description: `Las personas detrás de ${siteConfig.name}.`,
  members: [
    {
      name: "Cristian Mancilla",
      initials: "CM",
      role: "CTO - Director de Tecnología",
      tagline: "Ingeniería de software y arquitectura de sistemas.",
    },
    {
      name: "Johan Rocuts",
      initials: "JR",
      role: "CEO - Director Ejecutivo",
      tagline: "Estrategia de producto y dirección general.",
    },
    {
      name: "Yeison Arley",
      initials: "YA",
      role: "Director de Desarrollo de Negocios",
      tagline: "Relaciones estratégicas y crecimiento comercial.",
    },
  ],
} as const

export const faqItems = [
  {
    question: "¿Qué tipo de software construyen?",
    answer:
      "Desarrollamos software empresarial a medida, plataformas SaaS, sitios web, aplicaciones móviles para Android e iOS, software para macOS y Windows, y sistemas potenciados por inteligencia artificial.",
  },
  {
    question: "¿Qué son los agentes de IA y cómo ayudan a mi negocio?",
    answer:
      "Son programas inteligentes que pueden atender llamadas telefónicas, responder chats de soporte y ejecutar tareas operativas repetitivas, funcionando como empleados digitales disponibles 24/7 sin interrupciones.",
  },
  {
    question: "¿Trabajan con empresas fuera del sector tecnológico?",
    answer:
      "Sí. Trabajamos con empresas de cualquier sector que necesiten digitalizar operaciones, automatizar procesos o construir productos de software desde cero.",
  },
  {
    question: "¿Cuánto tiempo toma un proyecto típico?",
    answer:
      "Depende del alcance. Un MVP funcional suele tomar entre 8 y 12 semanas. Proyectos más complejos se planifican por fases para mantener calidad y velocidad.",
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
  highlight: "necesita construir.",
  description:
    "Software a medida, plataformas SaaS, aplicaciones móviles o agentes de IA: agenda una reunión y exploremos cómo podemos ayudarte.",
  action: {
    label: "Agendar reunión",
    href: siteConfig.links.scheduling,
    analyticsEvent: "cta_final_click",
  },
} as const
