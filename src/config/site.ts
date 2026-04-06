const contactEmail = "contacto@novaforge.io"
const siteUrl = "https://novaforge.io"

export const siteConfig = {
  name: "NovaForge",
  legalName: "NovaForge LLC",
  url: siteUrl,
  contactEmail,
  images: {
    logo: "/logo.svg",
    social: "/opengraph-image",
    twitter: "/twitter-image",
  },
  siteLastModified: "2026-04-05",
  links: {
    twitter: "https://twitter.com/novaforge",
    linkedin: "https://linkedin.com/company/novaforge",
    booking: "https://cal.com/novaforge/diagnostico",
    whatsapp: "https://wa.me/573015244404",
    contact: `mailto:${contactEmail}`,
  },
} as const
