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
          background:
            "radial-gradient(circle at top left, rgba(0,229,255,0.18), transparent 35%), linear-gradient(135deg, #000000 0%, #080808 45%, #130a0a 100%)",
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
                fontSize: 28,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#00e5ff",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontSize: 36,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {siteConfig.name}
            </div>
          </div>

          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,69,0,0.35)",
              background: "rgba(255,255,255,0.03)",
              color: "#00e5ff",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            N
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "26px",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 78,
              lineHeight: 1,
              fontWeight: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.76)",
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 24,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#ff9500",
            }}
          />
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    socialImageSize
  )
}
