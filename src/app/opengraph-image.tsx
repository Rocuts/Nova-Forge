import { siteConfig } from "@/config/site"
import { createSocialImage, socialImageSize } from "@/lib/social-image"

export const alt = `${siteConfig.name} — Ingeniería de Software, IA Soberana y Ciberseguridad`
export const size = socialImageSize
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImage({
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
    title: "Software, inteligencia y defensa para quienes no pueden fallar.",
    description: "Ingeniería de software, IA soberana, ciberseguridad agéntica y operaciones autónomas para enterprise y gobierno.",
  })
}
