import { siteConfig } from "@/config/site"
import { createSocialImage, socialImageSize } from "@/lib/social-image"

export const alt = `${siteConfig.name} - Software de Precisión Empresarial`
export const size = socialImageSize
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImage({
    eyebrow: "Software de Precision Empresarial",
    title: "Construimos software. Desplegamos agentes de IA.",
    description: siteConfig.description,
  })
}
