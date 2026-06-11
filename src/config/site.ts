const contactEmail = "contact@orbexs.tech"
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://orbexs.tech"

export const siteConfig = {
  name: "Orbexs",
  legalName: "Orbexs LLC",
  url: siteUrl,
  contactEmail,
  images: {
    logo: "/logo.svg",
    social: "/opengraph-image",
    twitter: "/twitter-image",
  },
  siteLastModified: "2026-06-11",
  links: {
    twitter: "https://twitter.com/orbexs",
    linkedin: "https://linkedin.com/company/orbexs",
    booking: "https://cal.com/orbexs/diagnostico",
    whatsapp: "https://wa.me/573015244404",
    contact: `mailto:${contactEmail}`,
  },
} as const
