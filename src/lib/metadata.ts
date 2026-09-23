import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { buildAlternates, buildLocalePath, isValidLocale } from "@/lib/i18n"
import { getPageMeta } from "@/lib/page-meta"
import type { InternalPath } from "@/lib/page-meta"

/**
 * generateMetadata() of every page under [locale]: title, description,
 * canonical + hreflang, and its own Open Graph and Twitter tags.
 *
 * A page's `openGraph` replaces the layout's as a whole, so each page states
 * all of it here. `images` is deliberately absent: the route's
 * opengraph-image.tsx injects og:image, and Next copies it into twitter:image
 * when twitter.images is absent.
 */
export async function pageMetadata(locale: string, path: InternalPath): Promise<Metadata> {
  if (!isValidLocale(locale)) return {}

  const dict = await getDictionary(locale)
  const meta = getPageMeta(dict, path)
  const socialTitle = meta.absoluteTitle ? meta.title : `${meta.title} | ${siteConfig.name}`

  return {
    title: meta.absoluteTitle ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: dict.meta.ogLocale,
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      url: `${siteConfig.url}${buildLocalePath(locale, path)}`,
      title: socialTitle,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: meta.description,
    },
  }
}
