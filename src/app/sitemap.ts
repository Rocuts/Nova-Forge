import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.siteLastModified)

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}${siteConfig.legal.privacy}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}${siteConfig.legal.terms}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]
}
