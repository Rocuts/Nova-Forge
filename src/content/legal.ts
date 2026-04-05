import { siteConfig } from "@/config/site"

export type LegalSection = {
  title: string
  paragraphs: string[]
}

export type LegalDocument = {
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
}

export const privacyPolicy: LegalDocument = {
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
        `Si necesitas detalles sobre el tratamiento de tus datos o quieres ejercer tus derechos de acceso, actualización o eliminación, escríbenos a ${siteConfig.contactEmail}.`,
      ],
    },
  ],
}

export const termsOfService: LegalDocument = {
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
        `Si tienes preguntas legales o comerciales sobre estas condiciones, puedes escribir a ${siteConfig.contactEmail}.`,
      ],
    },
  ],
}
