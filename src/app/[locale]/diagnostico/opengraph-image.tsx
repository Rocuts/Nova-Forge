import { locales } from "@/lib/i18n"
import { renderPageSocialImage, socialImageAlt, socialImageSize } from "@/lib/social-image"

export const alt = socialImageAlt
export const size = socialImageSize
export const contentType = "image/png"

// Route handlers do not inherit the layout's generateStaticParams; without this
// the image would be rendered on request instead of at build time.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return renderPageSocialImage({ locale, path: "/diagnostico" })
}
