import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { buildLocalePath, locales } from '@/lib/i18n'

const pages = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/agendar", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/diagnostico", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/privacidad", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/terminos", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/soberania-ia", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ciberseguridad", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/fuerza-digital", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/sistemas-criticos", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/inteligencia-operativa", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/automatizacion-gobierno", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/enriquecimiento-datos", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/extraccion-datos", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/estudio-tiktok-live", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/realty", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/inversores", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/nosotros", priority: 0.7, changeFrequency: "monthly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.siteLastModified)

  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${siteConfig.url}${buildLocalePath(locale, page.path)}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          es: `${siteConfig.url}${buildLocalePath("es", page.path)}`,
          en: `${siteConfig.url}${buildLocalePath("en", page.path)}`,
        },
      },
    }))
  )
}
