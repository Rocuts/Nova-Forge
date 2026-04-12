import { ImageResponse } from "next/og"
import { siteConfig } from "@/config/site"

export const socialImageSize = {
  width: 1200,
  height: 630,
}

type SocialImageOptions = {
  eyebrow: string
  title: string
  description: string
}

export function createSocialImage({
  eyebrow,
  title,
  description,
}: SocialImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#a3a3a3",
                fontWeight: 700,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              {siteConfig.name}
            </div>
          </div>

          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            NF
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#a3a3a3",
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 18,
            color: "#525252",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#a3a3a3",
            }}
          />
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    socialImageSize
  )
}
