const es = {
  meta: {
    titleSuffix: "Ingeniería de Software, IA Soberana y Ciberseguridad",
    description:
      "Ingeniería de software de misión crítica, inteligencia artificial soberana, ciberseguridad agéntica y operaciones autónomas para gobiernos y grandes organizaciones.",
    ogLocale: "es_ES",
  },
  nav: {
    items: [
      {
        name: "Servicios",
        children: [{ name: "", href: "" }],
        platformChildren: [
          { name: "IA Soberana", href: "/soberania-ia", description: "Infraestructura de IA bajo su control total" },
          { name: "Ciberseguridad", href: "/ciberseguridad", description: "Defensa autónoma con agentes de IA" },
          { name: "Fuerza Digital", href: "/fuerza-digital", description: "Asistentes ejecutivos en todos sus canales" },
          { name: "Enriquecimiento de Datos", href: "/enriquecimiento-datos", description: "Inteligencia accionable desde fuentes verificadas" },
          { name: "Extracción de Datos", href: "/extraccion-datos", description: "Scrapers con IA para OSINT y registros públicos" },
          { name: "RealTy", href: "/realty", description: "Infraestructura de ventas con IA para promotores inmobiliarios" },
        ],
        solutionsChildren: [
          { name: "Sistemas Críticos", href: "/sistemas-criticos", description: "Arquitectura de alta disponibilidad" },
          { name: "Inteligencia Operativa", href: "/inteligencia-operativa", description: "Centros de comando y datos unificados" },
          { name: "Automatización de Gobierno", href: "/automatizacion-gobierno", description: "Workflows gubernamentales digitalizados" },
        ],
      },
      { name: "Live Studio", href: "/estudio-tiktok-live", accent: true },
      { name: "Empresa", href: "/nosotros" },
    ],
    contact: "Contacto",
    schedule: "Agendar",
    menuLabel: "Menú de navegación",
  },
  hero: {
    eyebrow: "INFRAESTRUCTURA DE MISIÓN CRÍTICA",
    titleLead: "Construimos",
    titleHighlight: "soberanía digital.",
    titleRotating: [
      "soberanía digital.",
      "defensa cibernética.",
      "operaciones autónomas.",
      "sistemas críticos.",
    ],
    description:
      "Construimos infraestructura de IA soberana, sistemas de ciberseguridad agéntica y plataformas de operaciones autónomas para gobiernos y organizaciones que operan bajo los estándares más exigentes del mundo.",
    trustLine:
      "Ingeniería de precisión para operaciones críticas de estado y empresa.",
    primaryAction: {
      label: "Iniciar Consulta Técnica",
      analyticsEvent: "hero_cta_primary",
    },
    secondaryAction: {
      label: "Ver Capacidades de Ingeniería",
      href: "#capacidades",
      analyticsEvent: "hero_cta_services",
    },
    nurtureCta: {
      label: "Ver casos de uso para sector público",
      href: "/automatizacion-gobierno",
      analyticsEvent: "hero_nurture_cta",
    },
  },
  trustBar: {
    // Tecnologías que usamos, no partnerships ni certificaciones — ver CLAUDE.md
    label: "Construimos con",
  },
  services: {
    sectionId: "capacidades",
    title: "Capacidades de Ingeniería",
    exploreLabel: "Explorar",
    description:
      "Diseñamos, desplegamos y operamos sistemas de software, inteligencia artificial y ciberseguridad para organizaciones donde la falla no es una opción.",
    items: [
      {
        title: "IA Soberana para Enterprise y Gobierno",
        benefit:
          "Infraestructura de inteligencia artificial que opera dentro de su perímetro, bajo su control total.",
        bullets: [
          "Despliegue On-Premise o Cloud Soberana",
          "Modelos de Lenguaje Privados (LLM)",
          "Cumplimiento Regulatorio y Auditoría",
        ],
        icon: "sovereign",
        href: "/soberania-ia",
      },
      {
        title: "Ciberseguridad Agéntica con IA",
        benefit:
          "Agentes autónomos que auditan, detectan y responden a amenazas antes de que escalen.",
        bullets: [
          "Auditorías de Superficie de Ataque",
          "Detección de Amenazas en Tiempo Real",
          "Respuesta Autónoma a Incidentes",
        ],
        icon: "shield",
        href: "/ciberseguridad",
      },
      {
        title: "Personal Ejecutivo con IA",
        benefit:
          "Equipo de operaciones autónomo que trabaja 24/7 en sus canales: WhatsApp, Slack, Teams, email.",
        bullets: [
          "Asistentes Ejecutivos Siempre Activos",
          "Gestión de Agenda y Comunicaciones",
          "Integración con Todos sus Canales",
        ],
        icon: "assistant",
        href: "/fuerza-digital",
      },
      {
        title: "Arquitectura de Sistemas Críticos",
        benefit:
          "Plataformas de software diseñadas para operar bajo los estándares más altos de disponibilidad.",
        bullets: [
          "Arquitectura de Alta Disponibilidad",
          "Infraestructura Zero-Trust",
          "Sistemas Distribuidos y Resilientes",
        ],
        icon: "systems",
        href: "/sistemas-criticos",
      },
      {
        title: "Plataformas de Inteligencia Operativa",
        benefit:
          "Centros de comando que unifican datos, métricas y decisiones en una sola interfaz.",
        bullets: [
          "Dashboards de Mando en Tiempo Real",
          "Integración de Fuentes de Datos",
          "Análisis Predictivo y Alertas",
        ],
        icon: "intelligence",
        href: "/inteligencia-operativa",
      },
      {
        title: "Automatización de Procesos de Gobierno",
        benefit:
          "Digitalización de flujos gubernamentales y corporativos con trazabilidad completa.",
        bullets: [
          "Workflows Regulatorios Automatizados",
          "Trazabilidad y Cadena de Custodia Digital",
          "Interoperabilidad entre Sistemas Públicos",
        ],
        icon: "governance",
        href: "/automatizacion-gobierno",
      },
      {
        title: "Enriquecimiento de Datos",
        benefit:
          "Transforme registros fragmentados en inteligencia accionable con enriquecimiento automatizado multi-fuente. Con estricto cumplimiento regulatorio y residencia de datos configurable por jurisdicción.",
        bullets: [
          "Enriquecimiento Multi-Fuente en Tiempo Real",
          "Perfilamiento Firmográfico y de Contactos",
          "Cumplimiento GDPR y Residencia Soberana de Datos",
        ],
        icon: "enrichment",
        href: "/enriquecimiento-datos",
      },
      {
        title: "Extracción de Datos a Escala",
        benefit:
          "Recolecte datos de cualquier fuente pública con extractores potenciados por IA y trazabilidad completa. Operamos exclusivamente sobre fuentes públicas y autorizadas, bajo marcos de cumplimiento aplicables a cada jurisdicción.",
        bullets: [
          "Scrapers Adaptativos con IA",
          "OSINT e Inteligencia de Fuentes Abiertas (fuentes públicas y abiertas)",
          "Monitoreo Regulatorio y de Registros Públicos",
        ],
        icon: "scraper",
        href: "/extraccion-datos",
      },
    ],
  },
  flagshipAI: {
    sectionId: "sistemas-ia",
    title: "Despliegue de IA Soberana",
    description:
      "Su organización necesita inteligencia artificial que opere bajo sus reglas, en su infraestructura, con sus datos. No dependencias externas, no riesgos de terceros. Para soluciones que requieren integración con APIs de terceros, implementamos contratos de procesamiento de datos y arquitecturas de privacidad que mantienen el control operativo en su organización.",
    items: [
      {
        title: "Agentes de Defensa Cibernética",
        description:
          "IA que monitorea su superficie de ataque, identifica vulnerabilidades y ejecuta protocolos de respuesta sin intervención humana.",
        icon: "cyber",
      },
      {
        title: "Fuerza de Trabajo Digital",
        description:
          "Asistentes ejecutivos con IA desplegados en todos sus canales de comunicación: gestión de agenda, triaje de información y coordinación operativa.",
        icon: "workforce",
      },
      {
        title: "Infraestructura de IA On-Premise",
        description:
          "Modelos de lenguaje, pipelines de datos y agentes autónomos operando dentro de su perímetro de seguridad, con soberanía total sobre los datos.",
        icon: "infra",
      },
    ],
    caption:
      "Control total. Soberanía completa. Impacto medible.",
  },
  caseStudy: {
    sectionId: "casos",
    eyebrow: "CASO DE ESTUDIO",
    industry: "Medios y Producción en Vivo",
    title: "Mesa de ayuda autónoma para producción en vivo",
    context:
      "Un estudio de producción audiovisual que opera shows en vivo en TikTok no puede permitirse interrupciones durante una transmisión: cada minuto fuera del aire es audiencia e ingresos perdidos. Su mesa de ayuda dependía de tener un técnico disponible en el momento exacto del incidente.",
    solution:
      "Desplegamos un agente de IA que opera la mesa de ayuda de infraestructura de punta a punta. Durante la transmisión, el agente diagnostica y remedia incidentes de forma autónoma, y escala a un técnico humano únicamente cuando la remediación automática no resuelve el problema.",
    outcome:
      "La infraestructura del estudio se mantiene operativa durante las transmisiones sin intervención manual, y el equipo técnico se dedica a producir en lugar de hacer soporte reactivo.",
    capabilitiesTitle: "Lo que el agente ejecuta de forma autónoma",
    capabilities: [
      "Diagnóstico de conectividad con ping a endpoints críticos",
      "Verificación y actualización de drivers",
      "Reinicio remoto del módem",
      "Conmutación entre redes WiFi de respaldo",
      "Triaje de tickets de la mesa de ayuda",
      "Escalamiento a técnico humano con contexto completo",
    ],
    cta: {
      label: "Conocer Fuerza Digital",
      href: "/fuerza-digital",
    },
  },
  methodology: {
    sectionId: "metodologia",
    title: "El Estándar Orbexs",
    phaseLabel: "Fase",
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
  },
  team: {
    sectionId: "equipo",
    title: "Nuestro Liderazgo Técnico",
    description: "Ingeniería y estrategia detrás de Orbexs.",
    members: [
      {
        name: "Johan Rocuts",
        initials: "JR",
        role: "CEO - Director Ejecutivo",
        tagline: "Estratega de productos digitales de alta escala.",
      },
      {
        name: "Mauricio Solano",
        initials: "MS",
        role: "Director de Ventas",
        tagline: "Especialista en ventas consultivas B2B, enterprise y gobierno.",
      },
      {
        name: "Yeison Grisales",
        initials: "YG",
        role: "CCO - Director de Estrategia Comercial",
        tagline: "Especialista en soluciones tecnológicas B2B.",
      },
      {
        name: "Cristian Mancilla",
        initials: "CM",
        role: "CTO - Director de Tecnología",
        tagline: "Especialista en arquitectura de sistemas distribuidos.",
      },
      {
        name: "Andres Rodriguez",
        initials: "AR",
        role: "Ingeniero Full Stack Senior",
        tagline: "Experto en desarrollo web de alto rendimiento.",
      },
    ],
  },
  faq: {
    sectionId: "faq",
    title: "Preguntas Frecuentes",
    subtitle: "Todo lo que necesita saber para empezar.",
    items: [
      {
        question: "¿Qué significa IA soberana y por qué es relevante para mi organización?",
        answer:
          "IA soberana significa que los modelos de lenguaje, los datos de entrenamiento y los pipelines de inferencia operan dentro de su infraestructura — sin dependencias de APIs externas ni exposición de datos sensibles a terceros. Es esencial para gobierno, defensa, finanzas y cualquier organización con requisitos de cumplimiento regulatorio estricto.",
      },
      {
        question: "¿Cómo funciona la ciberseguridad agéntica con IA?",
        answer:
          "Desplegamos agentes autónomos que ejecutan auditorías continuas de su superficie de ataque, analizan patrones de tráfico, detectan anomalías y pueden ejecutar protocolos de respuesta a incidentes en tiempo real — reduciendo drásticamente el tiempo de detección y respuesta frente a amenazas.",
      },
      {
        question: "¿Qué es el servicio de Personal Ejecutivo con IA?",
        answer:
          "Es un equipo de operaciones autónomo potenciado por inteligencia artificial que trabaja 24/7 integrado en sus canales existentes — WhatsApp, Slack, Teams, email. Gestiona agendas, clasifica comunicaciones, coordina equipos y ejecuta tareas administrativas con la precisión de un asistente ejecutivo de alto nivel.",
      },
      {
        question: "¿Cómo estructuran los compromisos con organizaciones gubernamentales y de defensa?",
        answer:
          "Cada compromiso con el sector público y defensa opera bajo confidencialidad por defecto. Trabajamos con contratos bajo NDA, infraestructura aislada y un proceso de onboarding especializado que incluye evaluación de requisitos de cumplimiento, definición de perímetro de datos y asignación de equipo con clearance apropiado. No publicamos nombres de clientes gubernamentales ni detalles de implementación — la discreción operativa es parte integral de nuestro estándar de servicio.",
      },
    ],
  },
  cta: {
    lead: "Hablemos de",
    highlight: "su próximo sistema.",
    description:
      "Agende una evaluación técnica. Sin compromiso, sin templates genéricos — una conversación sobre lo que su operación necesita.",
    action: {
      label: "Agendar Evaluación",
      analyticsEvent: "cta_final_click",
    },
  },
  techStack: {
    sectionId: "tecnologias",
    title: "Nuestro Stack Tecnológico",
    categories: [
      { name: "Inteligencia Artificial", items: ["Anthropic", "OpenAI", "Google Gemini", "Meta LLaMA", "DeepSeek", "Mistral", "Hugging Face", "n8n", "LangChain", "PyTorch", "Ollama"] },
      { name: "Nube e Infraestructura", items: ["AWS", "Google Cloud", "Microsoft Azure", "Kubernetes", "Terraform", "Pulumi"] },
      { name: "Desarrollo y Plataformas", items: ["Next.js 16", "React 19", "TypeScript 5", "Bun", "Rust", "Go"] },
      { name: "Ciberseguridad", items: ["Zero Trust", "SIEM/SOAR", "Threat Intelligence", "Red Teaming", "Blue Teaming", "SOC Automation", "WAF", "Penetration Testing", "EDR/XDR", "Incident Response"] },
      { name: "Datos y Analítica", items: ["PostgreSQL", "ClickHouse", "Apache Kafka", "Apache Flink", "Grafana", "dbt"] },
      { name: "Marcos de Cumplimiento", items: ["SOC 2 Type II", "ISO 27001", "GDPR", "SSPA", "NIST CSF", "PCI DSS"] },
      { name: "Automatización de Cumplimiento", items: ["Vanta", "Thoropass", "Drata", "Secureframe", "Sprinto"] },
    ],
    note:
      "Orbexs no ostenta estas certificaciones. Las listamos porque diseñamos la arquitectura, los controles técnicos y la evidencia auditable con los que nuestros clientes las obtienen y las mantienen — apoyándonos en plataformas de automatización como Vanta y Thoropass, y en auditores externos acreditados.",
  },
  footer: {
    tagline:
      "Ingeniería de software enterprise. Plataformas, sistemas y automatización con IA.",
    platform: "Plataforma",
    platformLinks: [
      { name: "IA Soberana", href: "/soberania-ia" },
      { name: "Ciberseguridad", href: "/ciberseguridad" },
      { name: "Fuerza de Trabajo Digital", href: "/fuerza-digital" },
      { name: "Enriquecimiento de Datos", href: "/enriquecimiento-datos" },
      { name: "Extracción de Datos", href: "/extraccion-datos" },
      { name: "RealTy", href: "/realty" },
    ],
    studio: "Live Studio",
    studioLinks: [
      { name: "Orbexs Live Studio", href: "/estudio-tiktok-live" },
      { name: "Programa para creadores", href: "/estudio-tiktok-live" },
      { name: "Marcas y campañas", href: "/agendar" },
    ],
    company: "Empresa",
    companyLinks: [
      { name: "Sobre Nosotros", href: "/nosotros" },
      { name: "Inversores", href: "/inversores" },
      { name: "Diagnóstico", href: "/diagnostico" },
      { name: "Agendar", href: "/agendar" },
    ],
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Términos",
    copyright: "Todos los derechos reservados.",
  },
  legalPage: {
    badge: "Legal",
    lastUpdated: "Última actualización",
  },
  privacy: {
    title: "Política de Privacidad",
    description:
      "Cómo Orbexs recopila, utiliza y protege la información compartida a través de este sitio.",
    updatedAt: "16 de marzo de 2026",
    sections: [
      {
        title: "Información que recopilamos",
        paragraphs: [
          "Recopilamos la información que compartes voluntariamente cuando nos escribes, agendas una reunión o interactúas con formularios y correos generados desde el sitio.",
          "Esa información puede incluir nombre, correo electrónico, datos de empresa, contexto del proyecto y cualquier detalle operativo que decidas compartir con nuestro equipo.",
        ],
      },
      {
        title: "Uso de la información",
        paragraphs: [
          "Utilizamos la información para responder consultas, preparar diagnósticos, coordinar reuniones, evaluar oportunidades comerciales y mejorar la experiencia del sitio.",
          "No vendemos información personal a terceros ni la usamos para fines incompatibles con la relación comercial o precomercial que el visitante inicia con Orbexs.",
        ],
      },
      {
        title: "Conservación y seguridad",
        paragraphs: [
          "Aplicamos medidas razonables de seguridad para proteger la información comercial y de contacto que recibimos, incluyendo controles de acceso y buenas prácticas operativas.",
          "Conservamos los datos solo durante el tiempo necesario para atender la solicitud, cumplir obligaciones legales o mantener historial comercial relevante.",
        ],
      },
      {
        title: "Terceros y servicios externos",
        paragraphs: [
          "Este sitio puede apoyarse en servicios externos para agenda, correo, analítica o infraestructura. Cada proveedor procesa datos bajo sus propias políticas y obligaciones contractuales.",
          "Si necesitas detalles sobre el tratamiento de tus datos o quieres ejercer tus derechos de acceso, actualización o eliminación, escríbenos a contact@orbexs.tech.",
        ],
      },
    ],
  },
  terms: {
    title: "Términos de Servicio",
    description:
      "Condiciones generales para el uso del sitio web de Orbexs y el contacto comercial iniciado desde esta plataforma.",
    updatedAt: "16 de marzo de 2026",
    sections: [
      {
        title: "Uso permitido del sitio",
        paragraphs: [
          "Este sitio tiene fines informativos y comerciales. Puedes navegarlo, compartirlo y utilizar sus canales de contacto para iniciar conversaciones legítimas con Orbexs.",
          "No está permitido usar el sitio para actividades ilícitas, intentos de intrusión, scraping abusivo, envío de spam o cualquier acción que afecte la disponibilidad o integridad del servicio.",
        ],
      },
      {
        title: "Propiedad intelectual",
        paragraphs: [
          "Los textos, marcas, layouts, gráficos, código y elementos visuales del sitio pertenecen a Orbexs o a sus respectivos licenciantes, salvo indicación expresa en contrario.",
          "No se autoriza la reproducción total o parcial con fines comerciales sin consentimiento previo por escrito.",
        ],
      },
      {
        title: "Relación comercial",
        paragraphs: [
          "El uso del sitio o el envío de una consulta no crea por sí mismo una relación contractual. Cualquier servicio profesional se formaliza mediante propuesta, alcance, contrato y condiciones específicas.",
          "Las estimaciones, tiempos, alcances y recomendaciones compartidas antes de la contratación pueden cambiar tras un diagnóstico técnico más profundo.",
        ],
      },
      {
        title: "Responsabilidad y contacto",
        paragraphs: [
          "Orbexs procura mantener la información del sitio actualizada, pero no garantiza que todo el contenido permanezca completo, exacto o disponible en todo momento.",
          "Si tienes preguntas legales o comerciales sobre estas condiciones, puedes escribir a contact@orbexs.tech.",
        ],
      },
    ],
  },
  diagnosticPage: {
    badge: "Diagnóstico Gratuito",
    pageTitle: "Diagnóstico Técnico",
    pageSubtitle:
      "Complete el formulario y reciba un análisis personalizado de su infraestructura con recomendaciones accionables en menos de 2 minutos.",
  },
  diagnostic: {
    steps: [
      { id: "company", label: "Empresa" },
      { id: "stack", label: "Tecnología" },
      { id: "pain-points", label: "Desafíos" },
      { id: "goals", label: "Objetivos" },
      { id: "contact", label: "Contacto" },
    ],
    prev: "Anterior",
    next: "Siguiente",
    submit: "Generar Diagnóstico",
    errorMessage:
      "Lo sentimos, hubo un error generando su diagnóstico. Por favor intente nuevamente o contáctenos directamente.",
    stepCompany: {
      title: "Perfil de su Empresa",
      subtitle:
        "Cuéntenos sobre su organización para personalizar el diagnóstico.",
      companyLabel: "Nombre de la empresa",
      companyPlaceholder: "Ej: Acme Corp",
      industryLabel: "Industria",
      teamSizeLabel: "Tamaño del equipo",
      roleLabel: "Su rol",
    },
    stepStack: {
      title: "Stack Tecnológico Actual",
      subtitle: "Seleccione las tecnologías que utiliza actualmente.",
      stackLabel: "Lenguajes y frameworks",
      cloudLabel: "Proveedor de nube",
      aiLabel: "Nivel de madurez en IA",
    },
    stepPainPoints: {
      title: "Desafíos Actuales",
      subtitle: "Seleccione los problemas que enfrenta su organización.",
      detailLabel: "Describa brevemente el desafío principal (opcional)",
      detailPlaceholder:
        "Ej: Nuestro equipo pasa 20 horas semanales procesando facturas manualmente...",
    },
    stepGoals: {
      title: "Objetivos",
      subtitle: "Qué quiere lograr con este proyecto?",
      budgetLabel: "Presupuesto estimado",
      timelineLabel: "Timeline deseado",
      decisionLabel: "Etapa de decisión",
    },
    stepContact: {
      title: "Datos de Contacto",
      subtitle: "Para enviarle su diagnóstico personalizado.",
      nameLabel: "Nombre completo",
      namePlaceholder: "María García",
      emailLabel: "Email corporativo",
      emailPlaceholder: "nombre@empresa.com",
      websiteLabel: "Sitio web (opcional)",
      websitePlaceholder: "https://empresa.com",
      notesLabel: "Algo más que debamos saber? (opcional)",
      notesPlaceholder:
        "Contexto adicional, restricciones, preferencias...",
    },
  },
  diagnosticReport: {
    badge: "Diagnóstico Generado",
    titleTemplate: "Diagnóstico para {name}",
    titleFallback: "Su Diagnóstico Técnico",
    subtitle: "Análisis personalizado basado en sus respuestas.",
    loading: "Generando su diagnóstico...",
    whatsappMessage:
      "Hola, acabo de completar el diagnóstico técnico en Orbexs ({name}). Me gustaría agendar una consulta estratégica.",
    whatsappButton: "Agendar por WhatsApp",
    backButton: "Volver al Inicio",
  },
  diagnosticOptions: {
    industries: [
      "Fintech",
      "Healthcare",
      "E-commerce",
      "SaaS / Software",
      "Enterprise / Corporativo",
      "Educación",
      "Logística",
      "Otra",
    ],
    teamSizes: ["1-10", "11-50", "51-200", "200+"],
    roles: [
      "Founder / CEO",
      "CTO / VP Engineering",
      "Product Manager",
      "Director de Operaciones",
      "Otro",
    ],
    techStack: [
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
    ],
    cloudProviders: [
      "AWS",
      "Google Cloud",
      "Azure",
      "Ninguno / On-premise",
      "No estoy seguro",
    ],
    aiMaturity: [
      "Sin uso de IA",
      "Experimentando",
      "IA en producción (básico)",
      "IA avanzada en producción",
    ],
    painPoints: [
      "Procesos manuales que deberían estar automatizados",
      "Silos de datos / pobre integración entre sistemas",
      "Cuellos de botella de escalabilidad",
      "Experiencia del cliente deficiente",
      "Herramientas internas obsoletas",
      "Necesidad de capacidades de IA/ML",
      "Falta de visibilidad / analytics",
      "Costos operativos elevados",
    ],
    goals: [
      "Construir un nuevo producto SaaS",
      "Automatizar flujos internos con IA",
      "Integrar IA en producto existente",
      "Modernizar sistemas legacy",
      "Construir agentes / pipelines autónomos",
      "Mejorar infraestructura cloud",
      "Desarrollar app móvil",
    ],
    budgetRanges: ["$10K - $25K", "$25K - $75K", "$75K - $150K", "$150K+"],
    timelines: [
      "Lo antes posible",
      "1 - 3 meses",
      "3 - 6 meses",
      "6+ meses",
    ],
    decisionStages: [
      "Investigando opciones",
      "Evaluando proveedores",
      "Listo para iniciar",
    ],
  },
  products: {
    sovereignAI: {
      eyebrow: "IA SOBERANA",
      title: "Su inteligencia artificial. Su infraestructura. Su control.",
      subtitle: "Despliegue de IA enterprise que no depende de terceros.",
      description: "Diseñamos y operamos infraestructura de inteligencia artificial que funciona dentro de su perímetro de seguridad. Modelos de lenguaje privados, pipelines de datos soberanos y agentes autónomos bajo su gobierno total.",
      features: [
        { title: "Modelos de Lenguaje Privados", description: "Entrenamiento, fine-tuning y despliegue de LLMs dentro de su infraestructura. Sin datos saliendo de su perímetro." },
        { title: "Inferencia On-Premise", description: "Procesamiento de IA en sus propios servidores o cloud soberana con latencia mínima y control total." },
        { title: "Cumplimiento Regulatorio", description: "Arquitectura diseñada para cumplir con marcos regulatorios nacionales e internacionales de protección de datos." },
        { title: "Pipelines de Datos Soberanos", description: "Flujos de ingesta, transformación y análisis que operan exclusivamente dentro de su jurisdicción." },
        { title: "Agentes Autónomos Internos", description: "Despliegue de agentes de IA que ejecutan tareas operativas sin exposición a servicios externos." },
        { title: "Auditoría y Trazabilidad", description: "Registro completo de cada decisión, inferencia y acción ejecutada por los sistemas de IA." },
      ],
      capabilities: [
        { title: "Infraestructura", items: ["Cloud Soberana / On-Premise", "GPU Clusters Dedicados", "Redes Aisladas (Air-Gap)"] },
        { title: "Modelos", items: ["Fine-tuning de LLMs Open Source", "RAG sobre Documentación Interna", "Modelos Multimodales Privados"] },
        { title: "Gobierno", items: ["Control de Acceso Granular", "Logs de Auditoría Inmutables", "Arquitectura Lista para Cumplimiento Regulatorio"] },
      ],
      cta: {
        title: "Lleve la IA a su perímetro",
        description: "Agende una evaluación técnica para diseñar su infraestructura de IA soberana.",
        action: { label: "Agendar Evaluación", href: "/agendar" },
      },
    },
    cybersecurity: {
      eyebrow: "CIBERSEGURIDAD AGÉNTICA",
      title: "Defensa autónoma. Respuesta en tiempo real.",
      subtitle: "Agentes de IA que protegen su superficie de ataque 24/7.",
      description: "Desplegamos sistemas de ciberseguridad potenciados por inteligencia artificial que auditan, detectan y responden a amenazas de forma autónoma — antes de que un humano pueda reaccionar.",
      features: [
        { title: "Auditoría de Superficie de Ataque", description: "Escaneo continuo y automatizado de todos los vectores de exposición de su organización." },
        { title: "Detección de Amenazas con IA", description: "Análisis de patrones de tráfico, comportamiento anómalo y señales de compromiso en tiempo real." },
        { title: "Respuesta Autónoma a Incidentes", description: "Ejecución de protocolos de contención y remediación sin intervención humana." },
        { title: "Análisis de Vulnerabilidades", description: "Identificación proactiva de debilidades en aplicaciones, redes e infraestructura." },
        { title: "Simulación de Ataques (Red Team)", description: "Ejercicios de penetración automatizados para validar la postura de seguridad." },
        { title: "Centro de Operaciones de Seguridad", description: "SOC potenciado por IA con dashboards de mando, alertas y escalamiento inteligente." },
      ],
      capabilities: [
        { title: "Detección", items: ["Análisis de Tráfico en Tiempo Real", "Correlación de Eventos (SIEM)", "Threat Intelligence Feeds"] },
        { title: "Respuesta", items: ["Contención Automatizada", "Playbooks de Incidentes", "Forensics Digital"] },
        { title: "Prevención", items: ["Penetration Testing Continuo", "Hardening de Infraestructura", "Zero-Trust Architecture"] },
      ],
      cta: {
        title: "Blinde su operación",
        description: "Solicite una auditoría de superficie de ataque para su organización.",
        action: { label: "Solicitar Auditoría", href: "/agendar" },
      },
    },
    digitalWorkforce: {
      eyebrow: "FUERZA DE TRABAJO DIGITAL",
      title: "Un equipo ejecutivo que nunca descansa.",
      subtitle: "Asistentes de IA desplegados en todos sus canales.",
      description: "Construimos y operamos equipos de trabajo digitales potenciados por IA que se integran en WhatsApp, Slack, Teams, email y cualquier canal de su organización. Gestión de agenda, triaje de comunicaciones, coordinación operativa — con la precisión de un asistente ejecutivo senior.",
      features: [
        { title: "Asistente Ejecutivo 24/7", description: "Gestión inteligente de agenda, emails y comunicaciones con priorización automática." },
        { title: "Integración Multicanal", description: "Despliegue en WhatsApp, Slack, Microsoft Teams, email, SMS y canales internos." },
        { title: "Triaje de Información", description: "Clasificación automática de mensajes, documentos y solicitudes por urgencia y contexto." },
        { title: "Coordinación de Equipos", description: "Seguimiento de tareas, recordatorios y sincronización entre departamentos." },
        { title: "Base de Conocimiento Interna", description: "Respuestas instantáneas desde la documentación y políticas de su organización." },
        { title: "Reportes Ejecutivos", description: "Generación automática de resúmenes, métricas y reportes de gestión." },
      ],
      capabilities: [
        { title: "Canales", items: ["WhatsApp Business", "Slack & Microsoft Teams", "Email, SMS & Voz"] },
        { title: "Capacidades", items: ["Gestión de Agenda Inteligente", "Procesamiento de Documentos", "Workflows Automatizados"] },
        { title: "Gobierno", items: ["Políticas de Acceso por Rol", "Auditoría de Conversaciones", "Datos en su Infraestructura"] },
      ],
      cta: {
        title: "Active su equipo digital",
        description: "Agende una demostración de cómo la IA puede operar sus comunicaciones.",
        action: { label: "Agendar Demostración", href: "/agendar" },
      },
    },
    systemsArchitecture: {
      eyebrow: "ARQUITECTURA CRÍTICA",
      title: "Sistemas que no pueden caer.",
      subtitle: "Ingeniería de alta disponibilidad para operaciones críticas.",
      description: "Diseñamos y construimos plataformas de software con arquitectura distribuida, redundancia activa e infraestructura Zero-Trust para organizaciones donde el downtime no es una opción.",
      features: [
        { title: "Arquitectura de Alta Disponibilidad", description: "Sistemas distribuidos con redundancia activa, failover automático y recuperación ante desastres integrada." },
        { title: "Infraestructura Zero-Trust", description: "Modelo de seguridad donde ningún actor, interno o externo, es confiable por defecto." },
        { title: "Sistemas Distribuidos y Resilientes", description: "Arquitectura diseñada para escalar horizontalmente y resistir fallos parciales sin interrupción." },
        { title: "Observabilidad y Monitoreo", description: "Telemetría en tiempo real, dashboards de salud y alertas predictivas para toda su infraestructura." },
      ],
      capabilities: [
        { title: "Infraestructura", items: ["Kubernetes / Container Orchestration", "Multi-Region Deployment", "Disaster Recovery Automatizado"] },
        { title: "Seguridad", items: ["Zero-Trust Network Architecture", "Secrets Management", "Encrypted Data at Rest & Transit"] },
        { title: "Operaciones", items: ["SRE & Incident Response", "Ingeniería de SLA y Disponibilidad", "Performance Profiling"] },
      ],
      cta: {
        title: "Construya sobre roca",
        description: "Agende una evaluación de su arquitectura actual.",
        action: { label: "Agendar Evaluación", href: "/agendar" },
      },
    },
    operationalIntelligence: {
      eyebrow: "INTELIGENCIA OPERATIVA",
      title: "Decisiones en tiempo real. Datos unificados.",
      subtitle: "Centros de comando que transforman datos en acción.",
      description: "Construimos plataformas de inteligencia operativa que integran todas sus fuentes de datos en una interfaz unificada con dashboards de mando, análisis predictivo y alertas automatizadas.",
      features: [
        { title: "Dashboards de Mando en Tiempo Real", description: "Interfaces de control que consolidan métricas operativas, KPIs y estado de sistemas en una sola vista." },
        { title: "Integración de Fuentes de Datos", description: "Conectores para bases de datos, APIs, IoT, logs y sistemas legacy — todo unificado." },
        { title: "Análisis Predictivo y Alertas", description: "Modelos de machine learning que anticipan fallos, anomalías y oportunidades antes de que ocurran." },
        { title: "Reportes Ejecutivos Automatizados", description: "Generación automática de informes de gestión con insights accionables para la toma de decisiones." },
      ],
      capabilities: [
        { title: "Datos", items: ["ETL & Data Pipelines", "Data Lake / Warehouse", "Real-Time Streaming"] },
        { title: "Visualización", items: ["Dashboards Interactivos", "Geospatial Analytics", "Custom Reporting Engine"] },
        { title: "Inteligencia", items: ["Anomaly Detection", "Forecasting Models", "Natural Language Queries"] },
      ],
      cta: {
        title: "Unifique su operación",
        description: "Agende una demostración de nuestra plataforma de inteligencia.",
        action: { label: "Agendar Demostración", href: "/agendar" },
      },
    },
    governmentAutomation: {
      eyebrow: "AUTOMATIZACIÓN DE GOBIERNO",
      title: "Procesos gubernamentales. Velocidad digital.",
      subtitle: "Digitalización con trazabilidad completa y cumplimiento regulatorio.",
      description: "Automatizamos flujos de trabajo gubernamentales y corporativos regulados con cadena de custodia digital, interoperabilidad entre sistemas públicos y cumplimiento normativo integrado.",
      features: [
        { title: "Workflows Regulatorios Automatizados", description: "Digitalización de procesos con reglas de negocio, aprobaciones multinivel y cumplimiento normativo integrado." },
        { title: "Trazabilidad y Cadena de Custodia", description: "Registro inmutable de cada acción, documento y decisión en el flujo de trabajo." },
        { title: "Interoperabilidad entre Sistemas", description: "Integración con plataformas gubernamentales existentes, bases de datos públicas y sistemas heredados." },
        { title: "Portal Ciudadano / Corporativo", description: "Interfaces de autoservicio para trámites, consultas y seguimiento de solicitudes." },
      ],
      capabilities: [
        { title: "Procesos", items: ["BPM & Workflow Engine", "Document Management", "Digital Signatures"] },
        { title: "Integración", items: ["API Gateway Gubernamental", "Interoperabilidad X-Road", "Legacy Connectors"] },
        { title: "Cumplimiento", items: ["Audit Trail Inmutable", "Role-Based Access Control", "Data Residency Compliance"] },
      ],
      cta: {
        title: "Modernice su operación",
        description: "Agende una consulta sobre automatización de procesos.",
        action: { label: "Agendar Consulta", href: "/agendar" },
      },
    },
    dataEnrichment: {
      eyebrow: "ENRIQUECIMIENTO DE DATOS",
      title: "Datos fragmentados convertidos en inteligencia decisiva.",
      subtitle: "Enriquecimiento automatizado desde fuentes autorizadas y verificadas.",
      description: "Conectamos sus registros con un ecosistema de fuentes de datos autorizadas para transformar información incompleta en perfiles verificados y accionables — ya sea para calificar proveedores, consolidar registros ciudadanos o construir pipeline comercial. Hosting soberano, cumplimiento regulatorio y actualización en tiempo real incluidos.",
      processTitle: "PIPELINE DE ENRIQUECIMIENTO",
      process: [
        {
          step: "01",
          title: "Ingesta",
          description: "Conexión automatizada con registros comerciales, bases gubernamentales y proveedores de datos premium.",
          details: ["Registros comerciales", "Bases gubernamentales", "APIs de datos premium", "Registros públicos"],
        },
        {
          step: "02",
          title: "Validación",
          description: "Cross-referencing multi-fuente con deduplicación y normalización automática.",
          details: ["Deduplicación automática", "Normalización de formatos", "Cross-referencing multi-fuente", "Scoring de calidad"],
        },
        {
          step: "03",
          title: "Enriquecimiento",
          description: "Perfilamiento completo con datos firmográficos, contacto e intención de compra.",
          details: ["Perfilamiento firmográfico", "Datos de contacto", "Señales de intención", "Análisis tecnográfico"],
        },
        {
          step: "04",
          title: "Entrega",
          description: "Sincronización bidireccional con sus sistemas CRM/ERP en tiempo real.",
          details: ["Sincronización CRM/ERP", "API REST & webhooks", "Reporting automatizado", "Alertas de cambios"],
        },
      ],
      features: [
        { title: "Enriquecimiento Multi-Fuente en Cascada", description: "Cadena secuencial de proveedores de datos para maximizar cobertura y precisión en cada registro." },
        { title: "Perfilamiento Firmográfico Completo", description: "Datos de contacto, estructura organizacional, ingresos, tecnología utilizada y señales de compra para cada cuenta." },
        { title: "Detección de Intención de Compra", description: "Identificación de cuentas que están investigando activamente soluciones relevantes mediante señales de comportamiento." },
        { title: "Scoring con IA", description: "Clasificación automática de leads por ajuste, intención y probabilidad de conversión." },
        { title: "Sincronización con CRM/ERP", description: "Integración bidireccional con Salesforce, HubSpot y sistemas internos con deduplicación automática." },
        { title: "Cumplimiento y Auditoría", description: "Trazabilidad completa de cada dato recolectado, cumplimiento GDPR/CCPA y opciones de residencia soberana." },
      ],
      capabilities: [
        { title: "Adquisición de Inteligencia", items: ["Descubrimiento de Contactos y Organigramas", "Perfilamiento Firmográfico y Tecnográfico", "Señales de Intención desde Actividad Web"] },
        { title: "Operaciones de Datos", items: ["Enriquecimiento en Cascada Multi-Proveedor", "Deduplicación y Normalización", "Ciclos de Actualización Programados"] },
        { title: "Integración y Cumplimiento", items: ["Conectores Nativos CRM/ERP", "Control de Acceso Granular", "Residencia Soberana de Datos"] },
      ],
      cta: {
        title: "Active su inteligencia de datos",
        description: "Agende una demostración de enriquecimiento sobre sus propios registros.",
        action: { label: "Agendar Demostración", href: "/agendar" },
      },
    },
    dataExtraction: {
      eyebrow: "EXTRACCIÓN DE DATOS",
      title: "Recolecte cualquier fuente pública. A cualquier escala.",
      subtitle: "Extractores con IA para OSINT, monitoreo regulatorio e inteligencia competitiva.",
      description: "Desplegamos colectores potenciados por IA que operan en la web abierta, portales gubernamentales y registros públicos — entregando inteligencia limpia y estructurada a sus sistemas en tiempo real. Diseñado para OSINT, monitoreo regulatorio y programas de registros públicos a escala nacional con trazabilidad completa y despliegue soberano.",
      features: [
        { title: "Extracción Estructurada a Escala", description: "Conversión de páginas web, PDFs y documentos no estructurados en datos limpios y validados." },
        { title: "Parseo Adaptativo con IA", description: "Modelos de lenguaje que se adaptan a cambios de layout sin mantenimiento manual de selectores." },
        { title: "Infraestructura de Proxies Global", description: "Red global de proxies residenciales para recolección continua sin bloqueos." },
        { title: "OSINT e Inteligencia de Amenazas", description: "Recolección sistemática de foros, redes sociales y superficies de la dark web para agencias de inteligencia." },
        { title: "Monitoreo Regulatorio", description: "Seguimiento de cambios en legislación, listas de sanciones y bases de datos de licencias entre jurisdicciones." },
        { title: "Programación y Alertas", description: "Ejecuciones automatizadas con detección de fallos, monitoreo de cambios y notificaciones." },
      ],
      capabilities: [
        { title: "Infraestructura de Recolección", items: ["Red Global de Proxies", "Renderizado Headless Browser", "Resolución Automática de CAPTCHAs"] },
        { title: "Extracción y Transformación", items: ["Parsers Adaptativos con IA", "Biblioteca de Templates por Fuente", "Pipelines de Extracción Personalizados"] },
        { title: "Entrega y Gobierno", items: ["Entrega via API/Webhook/S3", "Logging de Proveniencia Completo", "Redacción de PII y Cumplimiento"] },
      ],
      cta: {
        title: "Despliegue sus colectores",
        description: "Agende una evaluación de sus necesidades de extracción de datos.",
        action: { label: "Agendar Evaluación", href: "/agendar" },
      },
    },
  },
  liveStudioTeaser: {
    eyebrow: "NUEVA DIVISIÓN",
    kicker: "ORBEXS LIVE STUDIO",
    title: "Un estudio de TikTok LIVE operado por una fábrica de software.",
    description:
      "Producimos transmisiones en vivo para creadores de LATAM desde sets propios, con la misma infraestructura, redundancia y automatización que construimos para operaciones críticas.",
    points: [
      "Sets calibrados para producción vertical 9:16",
      "Red redundante con remediación autónoma durante el aire",
      "Formación, parrilla y analítica propia para cada creador",
    ],
    action: { label: "Conocer el estudio", href: "/estudio-tiktok-live" },
  },
  liveStudio: {
    eyebrow: "ORBEXS LIVE STUDIO",
    status: "SOLICITUD DE AGENCIA TIKTOK LIVE EN REVISIÓN",
    onAir: "EN VIVO",
    titleLead: "El estudio de",
    titleAccent: "TikTok LIVE",
    titleTail: "para LATAM.",
    subtitle: "Reclutamos creadores, los capacitamos y sostenemos la operación en vivo.",
    description:
      "Orbexs Live Studio es nuestra división de producción en vivo: reclutamiento y formación de creadores de Latinoamérica, con dos modalidades de trabajo — presencial en nuestras cabinas o remoto desde tu propio setup — corriendo sobre la misma ingeniería de sistemas críticos que desplegamos para gobiernos y grandes organizaciones.",
    primaryAction: { label: "Postular como creador" },
    secondaryAction: { label: "Hablar con el equipo de marcas", href: "/agendar" },
    whatsappMessage:
      "Hola, quiero postular como creador a Orbexs Live Studio (TikTok LIVE). Les comparto mi perfil:",
    marqueeLabel: "Mercados de la primera fase",
    marquee: [
      "Colombia",
      "México",
      "Perú",
      "Chile",
      "Argentina",
      "Ecuador",
      "Talento vertical",
      "Live groups",
      "Gaming",
      "Música en vivo",
      "Entretenimiento",
    ],
    stats: [
      { value: "9:16", label: "Formato nativo", description: "Las cabinas del estudio están calibradas para producción vertical; en remoto entregamos el checklist para lograrlo." },
      { value: "24/7", label: "Parrilla continua", description: "Turnos rotativos de creadores, presenciales y remotos, con staff de transmisión permanente." },
      { value: "<60 s", label: "Recuperación de red", description: "Detección y remediación autónoma de incidentes en la infraestructura del estudio durante el aire." },
      { value: "5", label: "Mercados en fase 1", description: "Operación inicial enfocada en los mercados hispanohablantes de mayor tracción." },
    ],
    thesis: {
      eyebrow: "LA TESIS",
      title: "El cuello de botella del live no es el talento. Es la operación.",
      paragraphs: [
        "En LATAM sobra talento y falta infraestructura. Un creador puede tener audiencia y ritmo, pero pierde horas de aire por una caída de internet, un driver desactualizado o un encuadre mal iluminado. Cada minuto fuera del aire es audiencia e ingreso que no vuelve.",
        "Nosotros ya resolvimos ese problema para clientes de producción en vivo: desplegamos un agente de IA que opera la mesa de ayuda de infraestructura de punta a punta, diagnostica y remedia incidentes de forma autónoma y escala a un técnico humano solo cuando hace falta.",
        "Orbexs Live Studio es ese mismo stack, ahora operado por nosotros y puesto al servicio de creadores. No somos una agencia que subcontrata tecnología: somos la fábrica de software que la construye.",
      ],
    },
    program: {
      eyebrow: "PROGRAMA PARA CREADORES",
      title: "De casting a parrilla estable.",
      description:
        "Un recorrido de cuatro etapas diseñado para llevar a un creador desde la postulación hasta una operación de live sostenible, con acompañamiento en cada punto.",
      steps: [
        {
          step: "01",
          title: "Casting",
          description: "Evaluación de perfil, verificación de identidad y definición del vertical de contenido.",
          details: ["Revisión de perfil y contenido", "Verificación de identidad y edad", "Definición de vertical", "Condiciones por escrito"],
        },
        {
          step: "02",
          title: "Formación",
          description: "Academia LIVE: estructura de sesión, ritmo, retención y manejo de comunidad en directo.",
          details: ["Estructura y guion de sesión", "Retención en los primeros 30 s", "Moderación y comunidad", "Buenas prácticas de la plataforma"],
        },
        {
          step: "03",
          title: "Producción",
          description: "Bloque fijo en la parrilla, en cabina del estudio o desde tu propio setup.",
          details: ["Modalidad presencial o remota", "Manager de turno asignado", "Bloque fijo de parrilla", "Soporte técnico durante el aire"],
        },
        {
          step: "04",
          title: "Escalado",
          description: "Lectura de datos, coaching quincenal y expansión a colaboraciones y campañas de marca.",
          details: ["Panel de métricas por sesión", "Coaching quincenal", "Colaboraciones entre creadores", "Acceso a campañas de marca"],
        },
      ],
    },
    modalities: {
      eyebrow: "DOS MODALIDADES",
      title: "Elige cómo transmitir.",
      description:
        "El estudio recluta y capacita; la diferencia entre una modalidad y otra es dónde transmites y quién pone el equipo. Lo decimos antes de que postules, no después.",
      providesLabel: "Orbexs pone",
      requiresLabel: "Tú pones",
      items: [
        {
          tag: "ONSITE",
          title: "En el estudio",
          description:
            "Transmites desde nuestras cabinas, con el equipo del estudio y participando en los live groups: shows grupales temáticos — batallas, bailes, retos — donde varias creadoras sostienen el directo sobre una temática que guía el show.",
          provides: [
            "Cabina equipada y calibrada en 9:16",
            "Live groups temáticos con otras creadoras",
            "Staff de transmisión en cabina",
            "Conectividad redundante con remediación autónoma",
            "Capacitación LIVE completa",
            "Parrilla asignada y analítica por sesión",
            "Manager de turno",
            "Acceso a campañas de marca",
          ],
          requires: ["Presencia en el turno asignado", "Constancia en la parrilla"],
        },
        {
          tag: "REMOTO",
          title: "Desde tu lugar",
          description:
            "Transmites con tu propio equipo desde donde estés. Recibes la misma formación, parrilla y acompañamiento del estudio, pero el setup corre por tu cuenta: no entregamos dispositivos ni equipamiento para uso remoto.",
          provides: [
            "Capacitación LIVE completa",
            "Parrilla asignada y analítica por sesión",
            "Manager de turno y acompañamiento",
            "Checklist técnico de configuración",
            "Acceso a campañas de marca",
          ],
          requires: [
            "Tu dispositivo de transmisión",
            "Tu conexión a internet estable",
            "Tu espacio e iluminación",
            "Constancia en la parrilla",
          ],
        },
      ],
    },
    infrastructure: {
      eyebrow: "LA VENTAJA ORBEXS",
      title: "Cabinas construidas como un sistema crítico.",
      description:
        "Lo que sigue describe la infraestructura de nuestras cabinas — la ventaja de la modalidad presencial. La diferencia no está en las cámaras: está en lo que pasa cuando algo falla a mitad de una transmisión.",
      items: [
        { title: "Sets calibrados para 9:16", description: "Iluminación, audio y encuadre configurados específicamente para el feed vertical, no adaptados desde un set horizontal." },
        { title: "Conectividad redundante", description: "Doble proveedor de internet con conmutación automática a red móvil ante degradación del enlace principal." },
        { title: "Mesa de ayuda autónoma", description: "Un agente de IA monitorea la infraestructura del estudio, diagnostica incidentes y ejecuta la remediación sin esperar a que un técnico esté disponible." },
        { title: "Analítica propia por creador", description: "Panel con retención por minuto, curva de interacción y horarios de mayor rendimiento — datos para decidir, no capturas de pantalla." },
        { title: "Continuidad de la parrilla", description: "Si un bloque cae, el sistema reasigna set y turno para que el estudio no se quede sin señal al aire." },
        { title: "Operación bajo estándar propio", description: "Los mismos procesos de monitoreo, respuesta a incidentes y trazabilidad que aplicamos en despliegues enterprise." },
      ],
    },
    creators: {
      eyebrow: "PARA CREADORES",
      title: "Lo que recibe quien entra al estudio.",
      items: [
        { title: "Condiciones transparentes", description: "Reglas, metas y participación por escrito desde el primer día. Sin letra chica ni acuerdos verbales." },
        { title: "Sin cuota de ingreso", description: "Entrar al estudio no cuesta. En modalidad presencial usas nuestra cabina; en remoto transmites con tu propio equipo." },
        { title: "Academia LIVE", description: "Formación práctica en estructura de sesión, retención, moderación y crecimiento sostenido — el núcleo de lo que aporta el estudio en ambas modalidades." },
        { title: "Manager de turno", description: "Una persona del estudio acompañando la transmisión en tiempo real, no un chat que responde al día siguiente." },
        { title: "Métricas accionables", description: "Panel propio con lectura de cada sesión y recomendaciones concretas para la siguiente." },
        { title: "Comunidad y colaboraciones", description: "Cruces entre creadores del estudio para intercambiar audiencia y sostener el crecimiento." },
      ],
    },
    brands: {
      eyebrow: "PARA MARCAS",
      title: "Presencia en vivo, con reporte real.",
      description:
        "Trabajamos con marcas que quieren estar dentro de la conversación en directo, no al lado de ella. Cada activación se entrega con medición, no con estimaciones.",
      items: [
        { title: "Campañas en vivo", description: "Integraciones de producto dentro de la sesión, guionadas con el creador y ensayadas antes del aire." },
        { title: "Sets patrocinados", description: "Ambientación de cabina con identidad de marca durante bloques definidos de la parrilla." },
        { title: "Reporte de performance", description: "Entrega post-campaña con audiencia, retención, interacción y resultados por sesión." },
      ],
      action: { label: "Agendar reunión comercial", href: "/agendar" },
    },
    faq: {
      title: "Preguntas frecuentes",
      subtitle: "Lo que todo creador pregunta antes de postular.",
      items: [
        {
          question: "¿Orbexs Live Studio es una agencia oficial de TikTok?",
          answer:
            "Nuestra solicitud para operar como agencia LIVE se encuentra en proceso de revisión. Mientras tanto operamos como estudio de producción independiente: sets, formación, staff e infraestructura son nuestros. Publicaremos cualquier cambio de estado apenas se confirme — no afirmamos una afiliación que todavía no existe.",
        },
        {
          question: "¿Necesito tener una audiencia grande para postular?",
          answer:
            "No. Evaluamos consistencia, disposición a transmitir con frecuencia y ajuste con alguno de nuestros verticales. El programa está diseñado para hacer crecer la audiencia dentro del estudio, no para exigirla como requisito de entrada.",
        },
        {
          question: "¿Tengo que pagar algo para entrar?",
          answer:
            "No cobramos cuota de ingreso en ninguna de las dos modalidades. Lo que cambia es el equipo: en la modalidad presencial usas la cabina equipada del estudio, y en la remota transmites con tu propio dispositivo y tu propia conexión. No entregamos equipamiento para uso remoto. Las condiciones de participación quedan por escrito antes de empezar.",
        },
        {
          question: "¿Puedo transmitir desde mi casa o tiene que ser en el estudio?",
          answer:
            "Ambas modalidades existen y eliges al postular. La presencial te da cabina equipada, staff en sala, conectividad redundante y participación en los live groups del estudio. La remota te da la misma capacitación, parrilla, analítica y manager de turno, pero el setup lo pones tú.",
        },
        {
          question: "¿Qué necesito para transmitir en la modalidad remota?",
          answer:
            "Tu propio dispositivo de transmisión, una conexión a internet estable y un espacio con iluminación razonable. Te entregamos un checklist técnico para configurar encuadre vertical, audio y red, pero el equipo es tuyo: el estudio no presta ni financia dispositivos para uso remoto.",
        },
        {
          question: "¿Qué son los live groups?",
          answer:
            "Son shows grupales que producimos en el estudio: varias creadoras transmitiendo juntas alrededor de una temática que guía el show, con batallas, bailes y retos. Requieren las cabinas y la coordinación del staff, así que son exclusivos de la modalidad presencial.",
        },
        {
          question: "¿Qué pasa si se cae el internet en medio de una transmisión?",
          answer:
            "Es exactamente el problema para el que fue diseñado el estudio. Cada cabina opera con doble enlace y conmutación automática, y un agente autónomo diagnostica y remedia incidentes de infraestructura durante el aire, escalando a un técnico humano solo cuando la remediación automática no resuelve.",
        },
      ],
    },
    cta: {
      title: "Postula al estudio.",
      description:
        "Estamos armando la primera camada de creadores de Orbexs Live Studio. Si transmites en vivo o quieres empezar, escríbenos y conversamos.",
      action: { label: "Postular como creador" },
      secondary: { label: "Soy una marca", href: "/agendar" },
    },
    disclaimer:
      "TikTok es una marca registrada de sus respectivos titulares. Orbexs Live Studio es un estudio de producción independiente; nuestra solicitud de agencia LIVE se encuentra en revisión y su mención no implica afiliación, patrocinio ni respaldo oficial.",
  },
  investorsPage: {
    eyebrow: "INVERSORES",
    title: "Infraestructura para la era de la soberanía digital.",
    subtitle: "Estamos construyendo la capa de software, inteligencia artificial y ciberseguridad que gobiernos y empresas necesitan para operar con independencia tecnológica total.",
    thesis: {
      title: "Tesis de Inversión",
      paragraphs: [
        "El mundo se mueve hacia la soberanía digital. Gobiernos y grandes corporaciones ya no pueden depender de infraestructura de terceros para sus operaciones más sensibles. La inteligencia artificial, la ciberseguridad y la automatización de procesos críticos deben operar dentro del perímetro de cada organización.",
        "Orbexs construye exactamente eso: la infraestructura de software que permite a organizaciones de alta exigencia operar con IA soberana, defenderse con agentes autónomos de ciberseguridad y automatizar flujos de trabajo regulados con trazabilidad completa.",
        "Nuestro enfoque combina ingeniería de sistemas de alto nivel con despliegue on-premise, modelos de lenguaje privados y arquitectura Zero-Trust — todo diseñado para los estándares más exigentes del mercado enterprise y gubernamental.",
      ],
    },
    market: {
      title: "Oportunidad de Mercado",
      description: "Tres verticales en crecimiento exponencial convergen en nuestra propuesta de valor.",
      segments: [
        { title: "IA Soberana Enterprise", description: "Organizaciones migrando de APIs de IA públicas a infraestructura privada por regulación, seguridad y control de datos sensibles." },
        { title: "Ciberseguridad Agéntica", description: "La próxima generación de defensa cibernética: agentes autónomos que detectan y responden en tiempo real, sin intervención humana." },
        { title: "Automatización Gubernamental", description: "Gobiernos digitalizando flujos de trabajo críticos con requisitos estrictos de trazabilidad, cumplimiento y soberanía de datos." },
      ],
    },
    team: {
      title: "Equipo Fundador",
      description: "Ingeniería y estrategia detrás de Orbexs.",
      members: [
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Director Ejecutivo", bio: "Estratega de productos digitales de alta escala. Define la visión de producto y la estrategia de mercado de Orbexs en el sector enterprise y gobierno." },
        { name: "Yeison Grisales", initials: "YG", role: "CCO - Director de Estrategia Comercial", bio: "Especialista en soluciones tecnológicas B2B. Gestiona las relaciones comerciales y la expansión de Orbexs en industrias reguladas." },
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Director de Tecnología", bio: "Especialista en arquitectura de sistemas distribuidos y plataformas de alta disponibilidad. Lidera el diseño técnico de todas las soluciones de Orbexs." },
        { name: "Andres Rodriguez", initials: "AR", role: "Ingeniero Full Stack Senior", bio: "Experto en desarrollo web de alto rendimiento. Construye las interfaces y sistemas que conectan la tecnología de Orbexs con los usuarios finales." },
      ],
    },
    vision: {
      quote: "La soberanía digital no es una tendencia — es el estándar inevitable para toda organización que opera con datos sensibles. Estamos construyendo la infraestructura que lo hace posible.",
      author: "Johan Rocuts",
      role: "CEO, Orbexs",
    },
    cta: {
      title: "Hablemos",
      description: "Si comparte nuestra visión sobre el futuro de la soberanía digital, nos encantaría conversar.",
      email: "contact@orbexs.tech",
      action: { label: "Contactar", href: "mailto:contact@orbexs.tech" },
    },
  },
  aboutPage: {
    eyebrow: "SOBRE NOSOTROS",
    title: "Ingeniería de precisión para la era digital.",
    subtitle: "Somos un equipo de ingenieros y estrategas construyendo la infraestructura tecnológica que gobiernos y empresas necesitan para operar con soberanía, seguridad y autonomía.",
    mission: {
      title: "Nuestra Misión",
      description: "Construir software mission-critical, sistemas de inteligencia artificial soberana y plataformas de ciberseguridad agéntica que permitan a organizaciones de alta exigencia operar con independencia tecnológica total. No vendemos humo ni soluciones genéricas. Diseñamos, desarrollamos y operamos infraestructura que funciona bajo los estándares más altos del mundo.",
    },
    methodology: {
      title: "El Estándar Orbexs",
      phaseLabel: "Fase",
      description: "Nuestro proceso de ingeniería está diseñado para eliminar la incertidumbre y garantizar la entrega de valor en cada despliegue.",
      steps: [
        { num: "01", title: "Diagnóstico y Auditoría Técnica", desc: "Análisis exhaustivo de su infraestructura actual y definición de objetivos de negocio." },
        { num: "02", title: "Arquitectura de Sistemas y Datos", desc: "Modelado de la solución técnica para asegurar escalabilidad y mantenibilidad a largo plazo." },
        { num: "03", title: "Ingeniería y Desarrollo", desc: "Construcción del core del sistema e integración de lógica inteligente personalizada." },
        { num: "04", title: "Validación y QA", desc: "Pruebas de estrés y seguridad para garantizar un despliegue sin interrupciones." },
        { num: "05", title: "Operación y Evolución", desc: "Monitoreo estratégico, optimización y soporte técnico especializado." },
      ],
    },
    team: {
      title: "Nuestro Equipo",
      description: "Ingeniería y estrategia detrás de Orbexs.",
      members: [
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Director Ejecutivo", bio: "Estratega de productos digitales de alta escala con enfoque en mercados enterprise y gobierno." },
        { name: "Mauricio Solano", initials: "MS", role: "Director de Ventas", bio: "Especialista en ventas consultivas B2B. Lidera el desarrollo de negocio y la relación con clientes enterprise y gobierno." },
        { name: "Yeison Grisales", initials: "YG", role: "CCO - Director de Estrategia Comercial", bio: "Especialista en soluciones tecnológicas B2B para industrias reguladas." },
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Director de Tecnología", bio: "Especialista en arquitectura de sistemas distribuidos y plataformas de alta disponibilidad." },
        { name: "Andres Rodriguez", initials: "AR", role: "Ingeniero Full Stack Senior", bio: "Experto en desarrollo web de alto rendimiento y sistemas de interfaz enterprise." },
      ],
    },
    values: {
      title: "Principios",
      items: [
        { title: "Precisión sobre velocidad", description: "Cada línea de código, cada decisión de arquitectura y cada despliegue está diseñado para durar." },
        { title: "Soberanía como estándar", description: "La independencia tecnológica de nuestros clientes no es negociable." },
        { title: "Ingeniería sobre promesas", description: "Entregamos infraestructura funcional, no presentaciones con roadmaps especulativos." },
      ],
    },
    cta: {
      title: "Construyamos juntos.",
      description: "Si su organización necesita infraestructura tecnológica de alto nivel, hablemos.",
      action: { label: "Agendar Evaluación", href: "/agendar" },
    },
  },
  schedule: {
    badge: "Agendar Reunión",
    pageTitle: "Hablemos de su Proyecto",
    pageSubtitle:
      "Complete el formulario y nos pondremos en contacto para coordinar una reunión.",
    nameLabel: "Nombre completo",
    namePlaceholder: "María García",
    emailLabel: "Email",
    emailPlaceholder: "nombre@empresa.com",
    companyLabel: "Empresa (opcional)",
    companyPlaceholder: "Acme Corp",
    topicLabel: "Tema de interés",
    topics: [
      "IA Soberana",
      "Ciberseguridad",
      "Fuerza Digital",
      "Sistemas Críticos",
      "Orbexs Live Studio (TikTok LIVE)",
      "RealTy",
      "Consultoría Técnica",
      "Otro",
    ],
    messageLabel: "Mensaje (opcional)",
    messagePlaceholder:
      "Cuéntenos brevemente sobre su proyecto o necesidad...",
    submitButton: "Enviar Solicitud",
    successTitle: "Solicitud Enviada",
    successMessage:
      "Gracias por contactarnos. Nos pondremos en contacto a la brevedad.",
    whatsappButton: "Continuar por WhatsApp",
    backButton: "Volver al Inicio",
  },
  realty: {
    eyebrow: "REALTY",
    statusLine: "Infraestructura de ventas con IA para promotores inmobiliarios · versión de demostración",
    statusLabels: {
      built: "Construido",
      validated: "Validado · se activa en el piloto",
      simulated: "Simulado",
      adapter: "Adaptador de prueba",
      planned: "Planificado",
      notImplemented: "No implementado",
    },
    demoLabel: "Datos de demostración",
    demoSrText: "Cifras de un entorno de demostración, no de clientes reales.",
    hero: {
      title: "Un asesor de ventas con IA para cada comprador de su proyecto.",
      subtitle:
        "Atiende, califica, recomienda la unidad correcta y negocia dentro de sus límites. Todo queda en una consola que su director comercial abre cada mañana.",
      description:
        "Cada comprador recibe un asesor que responde al instante con los datos de su inventario. Cada decisión queda documentada en una sola consola.",
      primaryAction: { label: "Agendar una demo", href: "/agendar" },
      secondaryAction: { label: "Ver cómo funciona", href: "#journey" },
      console: {
        label: "Consola RealTy · Resumen",
        headline: {
          label: "Valor en retención simulada",
          value: "USD 5.760.000",
          caption: "Retenciones simuladas · sin unidades vendidas ni fondos reales",
        },
        tiles: [
          { label: "Oportunidades abiertas", value: "12", series: [4, 5, 5, 6, 7, 7, 8, 9, 10, 10, 11, 12] },
          { label: "Conversaciones", value: "38", series: [12, 14, 17, 19, 22, 24, 27, 29, 31, 34, 36, 38] },
          { label: "Retenciones simuladas", value: "3", series: [0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3] },
          { label: "Reservas simuladas", value: "1", series: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1] },
        ],
        funnel: {
          label: "Embudo del proyecto",
          stages: [
            { name: "Nuevo contacto", count: 24 },
            { name: "Contactado", count: 19 },
            { name: "En conversación", count: 15 },
            { name: "Calificado", count: 9 },
            { name: "Unidad emparejada", count: 7 },
            { name: "Visita", count: 5 },
            { name: "Negociación", count: 3 },
            { name: "Reserva", count: 2 },
            { name: "Cierre", count: 1 },
          ],
        },
      },
    },
    outcomes: {
      id: "outcomes",
      eyebrow: "QUÉ CAMBIA",
      title: "Lo que cambia para su equipo comercial.",
      description: "Cuatro diferencias concretas en la operación diaria de ventas de un proyecto.",
      items: [
        {
          title: "Ningún comprador espera",
          description: "Cada consulta se atiende en el momento, en su idioma y con su inventario delante.",
        },
        {
          title: "Calificación con criterio",
          description:
            "Presupuesto, necesidades, urgencia y quién decide, capturados en la conversación, no en un formulario.",
        },
        {
          title: "La unidad correcta, con motivo",
          description: "Cada recomendación explica por qué encaja y qué se descartó.",
        },
        {
          title: "Un traspaso limpio a su asesor",
          description: "Cuando la operación lo requiere, su equipo recibe el expediente completo, no una nota.",
        },
      ],
    },
    journey: {
      id: "journey",
      eyebrow: "EL RECORRIDO",
      title: "De la primera pregunta a la mesa de cierre.",
      description: "Las mismas etapas que su equipo ya conoce, ahora atendidas de principio a fin.",
      pipeline: {
        label: "Etapas del proyecto",
        stages: [
          "Nuevo contacto",
          "Contactado",
          "En conversación",
          "Calificado",
          "Unidad emparejada",
          "Visita",
          "Negociación",
          "Reserva",
          "Cierre",
        ],
        terminal: ["Ganado", "Perdido"],
        current: 4,
      },
      systemLabel: "Qué hace RealTy",
      buyerLabel: "Qué vive el comprador",
      steps: [
        {
          step: "01",
          title: "Contacto",
          system: "Responde la primera consulta, registra de dónde vino el comprador y abre la oportunidad.",
          buyer: "Recibe una respuesta inmediata, en su idioma, sin llenar un formulario ni esperar turno.",
          status: "built",
        },
        {
          step: "02",
          title: "Calificación",
          system:
            "Recoge presupuesto, necesidades, urgencia y quién firma, y calcula la madurez de compra con sus componentes a la vista.",
          buyer: "Conversa con normalidad. Nadie le pide repetir lo que ya contó.",
          status: "built",
        },
        {
          step: "03",
          title: "Recomendación",
          system:
            "Compara su inventario con lo que el comprador pidió, propone la unidad que encaja y deja escrito qué se descartó y por qué.",
          buyer: "Recibe una unidad concreta, con su precio, su superficie y el motivo de la recomendación.",
          status: "built",
        },
        {
          step: "04",
          title: "Negociación y oferta",
          system:
            "Arma la oferta dentro de los límites que usted autoriza. Lo que excede el límite se deriva a su equipo con el contexto completo.",
          buyer: "Obtiene una respuesta clara sobre precio y condiciones, sin promesas que nadie va a sostener.",
          status: "built",
        },
        {
          step: "05",
          title: "Reserva y cierre",
          system:
            "La retención de unidad, la reserva y la acción de depósito quedan registradas como simuladas; ninguna unidad se vende ni se reserva con fondos reales. Cuando la operación lo pide, pasa a su asesor humano con el expediente completo.",
          buyer: "Ve el estado de su reserva y continúa con una persona de su equipo comercial.",
          status: "simulated",
        },
      ],
      qualifier:
        "Las etapas y los estados de esta sección son los del producto, no un esquema de presentación. El mismo recorrido aparece, con los mismos nombres, dentro de la consola.",
    },
    voice: {
      id: "voice",
      eyebrow: "EL ASESOR DE VOZ",
      title: "Un asesor que solo dice lo que su inventario confirma.",
      description:
        "Habla con el comprador por voz, en su idioma, y antes de afirmar un precio, una disponibilidad o una vista, lo verifica.",
      points: [
        {
          title: "Verifica antes de responder",
          description: "Consulta su inventario y contesta con el dato que encontró, nunca con una aproximación.",
        },
        {
          title: "Sabe decir «no lo sé»",
          description: "Si un dato no está en su inventario, lo dice y lo anota, en lugar de inventarlo.",
        },
        {
          title: "Negocia dentro de sus límites",
          description:
            "Sus reglas comerciales fijan hasta dónde puede llegar; lo que excede el límite pasa a su equipo.",
        },
      ],
      transcript: {
        label: "Conversación de demostración",
        scenario: "James Anderson pregunta por una unidad con vista al mar dentro de su presupuesto",
        speakerLabels: { buyer: "Comprador", advisor: "Asesor RealTy", check: "Verificado en inventario" },
        turns: [
          { kind: "buyer", text: "Busco dos habitaciones con vista al mar, alrededor de dos millones." },
          {
            kind: "advisor",
            text: "Con ese presupuesto tengo una opción que encaja. Déjeme confirmar la disponibilidad antes de dársela.",
          },
          {
            kind: "check",
            text: "Disponibilidad y precio de la unidad B",
            result: "Disponible · USD 1.920.000 · 109 m² · vista al mar",
          },
          {
            kind: "advisor",
            text: "La unidad B está disponible: 109 metros cuadrados, vista al mar, 1.920.000 dólares. Queda dentro de su presupuesto.",
          },
          { kind: "buyer", text: "¿Y qué rentabilidad de alquiler puedo esperar?" },
          {
            kind: "advisor",
            text: "Ese dato no está en el inventario del proyecto, así que no se lo voy a estimar. Lo dejo anotado para que su asesor se lo confirme por escrito.",
          },
          { kind: "buyer", text: "Si mejoran el precio, firmo esta semana." },
          {
            kind: "check",
            text: "Descuento solicitado frente a los límites autorizados",
            result: "Fuera de límite · se propone visita privada y se avisa al asesor",
          },
          {
            kind: "advisor",
            text: "El precio que me pide queda fuera de lo que puedo autorizar. Le propongo una visita privada esta semana y aviso a su asesor para que revise las condiciones con usted.",
          },
        ],
      },
      state: {
        status: "validated",
        title: "Estado del asesor de voz",
        text: "Guion, herramientas y pruebas están completos y validados. Se activa con las credenciales del piloto; hoy no atiende llamadas.",
      },
      qualifier:
        "La conversación de arriba es una demostración con datos de ejemplo, no la grabación de una llamada: el asesor de voz todavía no atiende compradores.",
    },
    console: {
      id: "console",
      eyebrow: "LA CONSOLA COMERCIAL",
      title: "Todo lo que pasó con cada comprador, en una pantalla.",
      description:
        "Oportunidades, madurez de compra, unidad recomendada y siguiente acción, con el motivo de cada dato a un clic.",
      band: "Entorno de demostración · sin clientes, fondos ni unidades reales",
      opportunities: {
        title: "Oportunidades abiertas",
        columns: ["Contacto", "País", "Etapa", "Madurez de compra", "Unidad", "Siguiente acción"],
        rows: [
          {
            lead: "James Anderson",
            country: "GB",
            stage: "Unidad emparejada",
            readiness: 0.71,
            band: "Moderada",
            unit: "Unidad B",
            next: "Enviar oferta personalizada",
          },
          {
            lead: "Marta Kowalski",
            country: "PL",
            stage: "En conversación",
            readiness: 0.24,
            band: "Baja",
            unit: "—",
            next: "Confirmar presupuesto",
          },
          {
            lead: "Rashid Haddad",
            country: "AE",
            stage: "Negociación",
            readiness: 0.83,
            band: "Alta",
            unit: "Unidad C",
            next: "Proponer visita privada",
          },
        ],
      },
      readiness: {
        title: "Madurez de compra, componente a componente",
        lead: "James Anderson",
        score: 0.71,
        band: "Moderada",
        components: [
          { name: "Ajuste a lo que pidió", value: 17, max: 20, note: "Cuánto de lo que pidió cumple la unidad." },
          { name: "Ajuste al presupuesto", value: 16, max: 20, note: "Si el precio entra en el presupuesto declarado." },
          { name: "Valor percibido", value: 11, max: 15, note: "Si el comprador siente que la unidad vale su precio." },
          { name: "Confianza", value: 9, max: 15, note: "Lo que cree del proyecto y de quien se lo vende." },
          { name: "Seguridad de decisión", value: 7, max: 10, note: "Cuántas dudas siguen abiertas antes de avanzar." },
          { name: "Quién decide", value: 5, max: 10, note: "Si quien firma está en la conversación." },
          { name: "Momento", value: 6, max: 10, note: "Una fecha declarada o la frase que la sustituye." },
        ],
      },
      closeLedger: {
        title: "Libro de cierre",
        summary: "3 de 6 estados cumplidos. Todavía no es una venta.",
        states: [
          { name: "Comprador calificado", met: true, simulated: false },
          { name: "Propiedad seleccionada", met: true, simulated: false },
          { name: "Condiciones aceptadas", met: false, simulated: false },
          { name: "Retención de unidad · simulada", met: true, simulated: true },
          { name: "Reserva · simulada", met: false, simulated: true },
          { name: "Acción de depósito · simulada", met: false, simulated: true },
        ],
      },
      principles: [
        {
          title: "Nunca inventa precio, disponibilidad ni estado",
          description: "Cada cifra que aparece en la ficha viene de su inventario, no de una estimación del asesor.",
        },
        {
          title: "Lo que no sabe, lo marca como pendiente",
          description: "Un dato que falta se queda visible como pendiente hasta que alguien de su equipo lo responde.",
        },
        {
          title: "Cada recomendación deja su motivo",
          description: "Puede abrir cualquier propuesta y leer en qué se apoyó y qué unidades se descartaron.",
        },
      ],
      qualifier:
        "La retención de unidad, la reserva y la acción de depósito son simuladas. Quedan registradas en la consola como cualquier otro movimiento, pero ninguna unidad se bloquea ni se vende, y no se mueve dinero.",
    },
    channels: {
      id: "channels",
      eyebrow: "CANALES",
      title: "Un comprador, muchas puertas, un solo expediente.",
      description: "El comprador entra por donde le conviene y su equipo sigue leyendo la misma ficha.",
      items: [
        {
          name: "Voz",
          description: "Atenderá las llamadas entrantes del proyecto; se activa en el piloto.",
          status: "validated",
        },
        {
          name: "Chat web",
          description: "La misma conversación desde la página del proyecto.",
          status: "planned",
        },
        {
          name: "WhatsApp",
          description: "El canal que el comprador ya usa, con el mismo expediente detrás.",
          status: "planned",
        },
        {
          name: "Campañas salientes",
          description: "Contacto proactivo a su base, cuando usted lo autorice.",
          status: "planned",
        },
        {
          name: "Traspaso a asesor humano",
          description: "Su equipo recibe el expediente completo y continúa la conversación.",
          status: "built",
        },
      ],
      qualifier:
        "Hoy el traspaso a su equipo está construido. El asesor de voz está validado a la espera del piloto. El chat web, WhatsApp y las campañas están en la hoja de ruta.",
    },
    status: {
      id: "status",
      eyebrow: "ESTADO DEL PRODUCTO",
      title: "Qué está construido hoy y qué se activa en el piloto.",
      description: "Preferimos que lo lea aquí antes que descubrirlo en la demo.",
      columns: ["Capacidad", "Estado", "Nota"],
      rows: [
        {
          component: "Motor de calificación, recomendación y negociación",
          status: "built",
          note: "Funciona sobre su inventario y sus reglas comerciales.",
        },
        { component: "Consola comercial", status: "built", note: "Seis pantallas sobre datos de demostración." },
        {
          component: "Asesor de voz",
          status: "validated",
          note: "Guion y pruebas completos; se activa con las credenciales del piloto.",
        },
        {
          component: "Retenciones, reservas y depósitos",
          status: "simulated",
          note: "Registro real, sin efecto externo: ninguna unidad vendida ni reservada con fondos reales.",
        },
        {
          component: "Pagos, calendario, correo y sincronización con su CRM",
          status: "adapter",
          note: "Adaptadores de prueba que se conectan a sus proveedores en el piloto.",
        },
        {
          component: "Chat web, WhatsApp y campañas",
          status: "planned",
          note: "En la hoja de ruta; no iniciados.",
        },
        { component: "Traspaso a asesor humano", status: "built", note: "Con el expediente completo." },
        {
          component: "Fideicomiso, verificación de identidad y firma",
          status: "notImplemented",
          note: "Fuera del alcance de RealTy por diseño.",
        },
      ],
      activation: {
        title: "Activar un proyecto",
        value: "48–72 h",
        description:
          "Con su inventario, sus reglas comerciales y su guion, el objetivo es dejar un proyecto activo en dos o tres días.",
        qualifier:
          "Objetivo de diseño una vez cerradas las puertas del piloto; no es un compromiso contractual ni una propiedad de la versión actual.",
      },
      builtWith: {
        title: "Con qué está construido",
        text: "Voz sobre ElevenLabs y una consola propia; tecnologías con las que construimos, no alianzas ni certificaciones.",
      },
      qualifier:
        "Esta es la misma tabla que usamos dentro del equipo. Cuando una fila cambia de estado, cambia también aquí.",
    },
    faq: {
      id: "faq",
      title: "Preguntas frecuentes",
      subtitle: "Las preguntas que suelen surgir antes de decidirse.",
      items: [
        {
          question: "¿Necesito cambiar mi CRM?",
          answer:
            "No. RealTy trae su propio expediente comercial y se sincroniza con el sistema que su equipo ya usa. Hoy esa sincronización funciona con un adaptador de prueba, que se conecta a su proveedor real durante el piloto.",
        },
        {
          question: "¿Qué pasa cuando el asesor no sabe algo?",
          answer:
            "Lo dice y lo anota. Si el dato no está en su inventario, no lo estima ni lo aproxima: queda visible como pendiente en la ficha del comprador y su equipo lo responde. Preferimos una respuesta incompleta antes que una equivocada.",
        },
        {
          question: "¿Puede ofrecer descuentos por su cuenta?",
          answer:
            "Solo dentro de lo que usted autorice. Sus reglas comerciales definen el margen y las condiciones disponibles. Cualquier petición que exceda ese límite se deriva a su equipo con el contexto de la conversación.",
        },
        {
          question: "¿Qué está simulado en la demo?",
          answer:
            "Las retenciones de unidad, las reservas y las acciones de depósito. Quedan registradas en la consola como cualquier otro movimiento. No producen ningún efecto fuera de ella: ninguna unidad se ha vendido ni reservado y no se mueve dinero. Todo lo demás que verá corre sobre datos de demostración.",
        },
        {
          question: "¿En qué idiomas atiende?",
          answer:
            "El guion del asesor está definido en inglés y en español. Otros idiomas se evalúan al inicio del piloto, según el mercado del proyecto.",
        },
        {
          question: "¿Cuánto tarda activar un proyecto?",
          answer:
            "Nuestro objetivo de diseño es de 48 a 72 horas para cargar su inventario, sus reglas comerciales y su guion, y dejar el proyecto activo. Es un objetivo de diseño una vez cerradas las puertas del piloto: no es un compromiso contractual ni una propiedad de la versión actual.",
        },
      ],
    },
    cta: {
      title: "Vea RealTy sobre su propio inventario.",
      description:
        "Traiga un proyecto, su lista de unidades y sus reglas comerciales. Le mostramos el producto funcionando sobre sus datos y le decimos qué partes siguen simuladas.",
      action: { label: "Agendar una demo", href: "/agendar" },
      secondary: { label: "Ver el estado del producto", href: "#status" },
      note: "RealTy es una versión de demostración: retenciones, reservas y depósitos simulados; asesor de voz validado y pendiente de activación.",
    },
  },
} as const

export default es
