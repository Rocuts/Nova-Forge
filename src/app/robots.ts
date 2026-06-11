import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

// AI/answer-engine crawlers explicitly welcomed (GEO): being cited by
// ChatGPT, Claude, Perplexity and Google AI Overviews is a discovery channel.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'cohere-ai',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/admin/'],
      })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
