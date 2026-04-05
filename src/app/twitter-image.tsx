import { siteConfig } from "@/config/site"
import { createSocialImage, socialImageSize } from "@/lib/social-image"

export const alt = `${siteConfig.name} en X`
export const size = socialImageSize
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: "AI & Software Agency",
    title: "Diseñamos sistemas digitales completos para empresas.",
    description: siteConfig.description,
  })
}
