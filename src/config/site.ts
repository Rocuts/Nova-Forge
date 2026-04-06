const contactEmail = "contacto@novaforge.io"
const siteUrl = "https://novaforge.io"

export const siteConfig = {
  name: "NovaForge",
  legalName: "NovaForge LLC",
  description:
    "Fábrica de software: aplicaciones empresariales, SaaS, apps móviles, software de escritorio y agentes de IA para operaciones de negocio.",
  url: siteUrl,
  locale: "es_ES",
  contactEmail,
  images: {
    logo: "/logo.svg",
    social: "/opengraph-image",
    twitter: "/twitter-image",
  },
  legal: {
    privacy: "/privacidad",
    terms: "/terminos",
  },
  siteLastModified: "2026-03-16",
  links: {
    twitter: "https://twitter.com/novaforge",
    linkedin: "https://linkedin.com/company/novaforge",
    scheduling: "/diagnostico",
    booking: "https://cal.com/novaforge/diagnostico",
    whatsapp: "https://wa.me/573015244404",
    contact: `mailto:${contactEmail}`,
  },
} as const
