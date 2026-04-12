import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.siteLastModified)

  const esPages = [
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
  ]

  const enPages = [
    { path: "/en", priority: 1, changeFrequency: "weekly" as const },
    { path: "/en/schedule", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/diagnostics", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/en/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/en/terms", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/en/sovereign-ai", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/cybersecurity", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/digital-workforce", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/critical-systems", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/operational-intelligence", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/en/government-automation", priority: 0.8, changeFrequency: "monthly" as const },
  ]

  return [...esPages, ...enPages].map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
