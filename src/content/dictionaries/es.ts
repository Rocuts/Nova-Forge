const es = {
  meta: {
    titleSuffix: "Ingeniería de Software, IA Soberana y Ciberseguridad",
    description:
      "Ingeniería de software mission-critical, inteligencia artificial soberana, ciberseguridad agéntica y operaciones autónomas para enterprise y gobierno.",
    ogLocale: "es_ES",
  },
  nav: {
    items: [
      {
        name: "Plataforma",
        children: [
          { name: "IA Soberana", href: "/soberania-ia", description: "Infraestructura de IA bajo su control total" },
          { name: "Ciberseguridad", href: "/ciberseguridad", description: "Defensa autónoma con agentes de IA" },
          { name: "Fuerza Digital", href: "/fuerza-digital", description: "Asistentes ejecutivos en todos sus canales" },
        ],
      },
      {
        name: "Soluciones",
        children: [
          { name: "Sistemas Críticos", href: "/sistemas-criticos", description: "Arquitectura de alta disponibilidad" },
          { name: "Inteligencia Operativa", href: "/inteligencia-operativa", description: "Centros de comando y datos unificados" },
          { name: "Automatización de Gobierno", href: "/automatizacion-gobierno", description: "Workflows gubernamentales digitalizados" },
        ],
      },
      { name: "Empresa", href: "/nosotros" },
      { name: "Inversores", href: "/inversores" },
    ],
    contact: "Contacto",
    schedule: "Agendar",
    menuLabel: "Menú de navegación",
  },
  hero: {
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
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
  },
  services: {
    sectionId: "capacidades",
    title: "Capacidades de Ingeniería",
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
    ],
  },
  flagshipAI: {
    sectionId: "sistemas-ia",
    title: "Despliegue de IA Soberana",
    description:
      "Su organización necesita inteligencia artificial que opere bajo sus reglas, en su infraestructura, con sus datos. No dependencias externas, no riesgos de terceros.",
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
  methodology: {
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
  },
  team: {
    sectionId: "equipo",
    title: "Nuestro Liderazgo Técnico",
    description: "Ingeniería y estrategia detrás de NovaForge.",
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
        question: "¿Trabajan con organizaciones gubernamentales y de defensa?",
        answer:
          "Sí. Nuestra infraestructura y metodología están diseñadas para cumplir con los estándares de seguridad y trazabilidad que exigen las instituciones gubernamentales, de defensa y del sector financiero regulado.",
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
  credibility: {
    title: "Stack Tecnológico de Grado Enterprise",
  },
  techStack: {
    sectionId: "tecnologias",
    title: "Nuestro Stack Tecnológico",
    categories: [
      { name: "Inteligencia Artificial", items: ["Claude Opus 4", "Gemini 2.5", "LLaMA 4", "DeepSeek R2", "PyTorch", "LangGraph"] },
      { name: "Nube e Infraestructura", items: ["AWS", "Google Cloud", "Microsoft Azure", "Kubernetes", "Terraform", "Pulumi"] },
      { name: "Desarrollo y Plataformas", items: ["Next.js 16", "React 19", "TypeScript 5", "Bun", "Rust", "Go"] },
      { name: "Ciberseguridad", items: ["Zero Trust", "SIEM/SOAR", "Threat Intelligence", "Red Teaming", "SOC Automation", "WAF"] },
      { name: "Datos y Analítica", items: ["PostgreSQL", "ClickHouse", "Apache Kafka", "Apache Flink", "Grafana", "dbt"] },
    ],
  },
  metrics: {
    title: "Resultados Cuantificables",
    description:
      "Construimos para maximizar eficiencia operativa y desplegar sistemas de alta disponibilidad que escalan con su negocio.",
    kpiLabel: "Métricas auditadas",
    optimizationLabel: "Optimización Continua",
    kpis: [
      { value: "40%", label: "Reducción promedio en Time-to-Market" },
      { value: "99.9%", label: "Uptime en arquitecturas cloud-native" },
      { value: "10x", label: "Escalabilidad en flujos de datos IA" },
    ],
  },
  footer: {
    tagline:
      "Ingeniería de software enterprise. Plataformas, sistemas y automatización con IA.",
    platform: "Plataforma",
    platformLinks: [
      { name: "IA Soberana", href: "/soberania-ia" },
      { name: "Ciberseguridad", href: "/ciberseguridad" },
      { name: "Fuerza de Trabajo Digital", href: "/fuerza-digital" },
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
      "Cómo NovaForge recopila, utiliza y protege la información compartida a través de este sitio.",
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
          "No vendemos información personal a terceros ni la usamos para fines incompatibles con la relación comercial o precomercial que el visitante inicia con NovaForge.",
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
          "Si necesitas detalles sobre el tratamiento de tus datos o quieres ejercer tus derechos de acceso, actualización o eliminación, escríbenos a contacto@novaforge.io.",
        ],
      },
    ],
  },
  terms: {
    title: "Términos de Servicio",
    description:
      "Condiciones generales para el uso del sitio web de NovaForge y el contacto comercial iniciado desde esta plataforma.",
    updatedAt: "16 de marzo de 2026",
    sections: [
      {
        title: "Uso permitido del sitio",
        paragraphs: [
          "Este sitio tiene fines informativos y comerciales. Puedes navegarlo, compartirlo y utilizar sus canales de contacto para iniciar conversaciones legítimas con NovaForge.",
          "No está permitido usar el sitio para actividades ilícitas, intentos de intrusión, scraping abusivo, envío de spam o cualquier acción que afecte la disponibilidad o integridad del servicio.",
        ],
      },
      {
        title: "Propiedad intelectual",
        paragraphs: [
          "Los textos, marcas, layouts, gráficos, código y elementos visuales del sitio pertenecen a NovaForge o a sus respectivos licenciantes, salvo indicación expresa en contrario.",
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
          "NovaForge procura mantener la información del sitio actualizada, pero no garantiza que todo el contenido permanezca completo, exacto o disponible en todo momento.",
          "Si tienes preguntas legales o comerciales sobre estas condiciones, puedes escribir a contacto@novaforge.io.",
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
      namePlaceholder: "Johan Rodríguez",
      emailLabel: "Email corporativo",
      emailPlaceholder: "johan@empresa.com",
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
      "Hola, acabo de completar el diagnóstico técnico en NovaForge ({name}). Me gustaría agendar una consulta estratégica.",
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
        { title: "Operaciones", items: ["SRE & Incident Response", "SLA 99.99% Engineering", "Performance Profiling"] },
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
  },
  investors: {
    sectionId: "inversores",
    eyebrow: "RESPALDO INSTITUCIONAL",
    title: "Construido para escalar.",
    description: "Infraestructura de ingeniería respaldada por capital estratégico y una visión de largo plazo en IA soberana y ciberseguridad enterprise.",
    stats: [
      { value: "$2M+", label: "En contratos enterprise activos" },
      { value: "99.9%", label: "Uptime en sistemas desplegados" },
      { value: "4", label: "Industrias reguladas atendidas" },
    ],
    quote: {
      text: "La soberanía digital no es una opción — es una necesidad estratégica para toda organización que opera con datos sensibles.",
      author: "Johan Rocuts",
      role: "CEO, NovaForge",
    },
    cta: {
      label: "Contactar para inversión",
      href: "mailto:contacto@novaforge.io",
    },
  },
  investorsPage: {
    eyebrow: "INVERSORES",
    title: "Infraestructura para la era de la soberanía digital.",
    subtitle: "Estamos construyendo la capa de software, inteligencia artificial y ciberseguridad que gobiernos y empresas necesitan para operar con independencia tecnológica total.",
    thesis: {
      title: "Tesis de Inversión",
      paragraphs: [
        "El mundo se mueve hacia la soberanía digital. Gobiernos y grandes corporaciones ya no pueden depender de infraestructura de terceros para sus operaciones más sensibles. La inteligencia artificial, la ciberseguridad y la automatización de procesos críticos deben operar dentro del perímetro de cada organización.",
        "NovaForge construye exactamente eso: la infraestructura de software que permite a organizaciones de alta exigencia operar con IA soberana, defenderse con agentes autónomos de ciberseguridad y automatizar flujos de trabajo regulados con trazabilidad completa.",
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
      description: "Ingeniería y estrategia detrás de NovaForge.",
      members: [
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Director de Tecnología", bio: "Especialista en arquitectura de sistemas distribuidos y plataformas de alta disponibilidad. Lidera el diseño técnico de todas las soluciones de NovaForge." },
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Director Ejecutivo", bio: "Estratega de productos digitales de alta escala. Define la visión de producto y la estrategia de mercado de NovaForge en el sector enterprise y gobierno." },
        { name: "Yeison Arley", initials: "YA", role: "Director de Estrategia Comercial", bio: "Especialista en soluciones tecnológicas B2B. Gestiona las relaciones comerciales y la expansión de NovaForge en industrias reguladas." },
        { name: "Andres Rodriguez", initials: "AR", role: "Ingeniero Full Stack Senior", bio: "Experto en desarrollo web de alto rendimiento. Construye las interfaces y sistemas que conectan la tecnología de NovaForge con los usuarios finales." },
      ],
    },
    vision: {
      quote: "La soberanía digital no es una tendencia — es el estándar inevitable para toda organización que opera con datos sensibles. Estamos construyendo la infraestructura que lo hace posible.",
      author: "Johan Rocuts",
      role: "CEO, NovaForge",
    },
    cta: {
      title: "Hablemos",
      description: "Si comparte nuestra visión sobre el futuro de la soberanía digital, nos encantaría conversar.",
      email: "contacto@novaforge.io",
      action: { label: "Contactar", href: "mailto:contacto@novaforge.io" },
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
      title: "Estándar NovaForge",
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
      description: "Ingeniería y estrategia detrás de NovaForge.",
      members: [
        { name: "Cristian Mancilla", initials: "CM", role: "CTO - Director de Tecnología", bio: "Especialista en arquitectura de sistemas distribuidos y plataformas de alta disponibilidad." },
        { name: "Johan Rocuts", initials: "JR", role: "CEO - Director Ejecutivo", bio: "Estratega de productos digitales de alta escala con enfoque en mercados enterprise y gobierno." },
        { name: "Yeison Arley", initials: "YA", role: "Director de Estrategia Comercial", bio: "Especialista en soluciones tecnológicas B2B para industrias reguladas." },
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
    namePlaceholder: "Johan Rodríguez",
    emailLabel: "Email",
    emailPlaceholder: "johan@empresa.com",
    companyLabel: "Empresa (opcional)",
    companyPlaceholder: "Acme Corp",
    topicLabel: "Tema de interés",
    topics: [
      "IA Soberana",
      "Ciberseguridad",
      "Fuerza Digital",
      "Sistemas Críticos",
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
} as const

export default es
