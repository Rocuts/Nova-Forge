import { siteConfig } from "@/config/site"
import { createSocialImage, socialImageSize } from "@/lib/social-image"

export const alt = `${siteConfig.name} — Enterprise Software Engineering`
export const size = socialImageSize
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImage({
    eyebrow: "MISSION-CRITICAL INFRASTRUCTURE",
    title: "We build digital sovereignty, cyber defense, and autonomous operations.",
    description: "Mission-critical software engineering, sovereign AI, agentic cybersecurity, and autonomous operations for enterprise and government.",
  })
}
