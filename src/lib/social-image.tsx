import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"
import { siteConfig } from "@/config/site"
import { getDictionary } from "@/content/dictionaries"
import { isValidLocale } from "@/lib/i18n"
import { getPageMeta } from "@/lib/page-meta"
import type { InternalPath } from "@/lib/page-meta"

export const socialImageSize = { width: 1200, height: 630 }

/**
 * og:image:alt of all 34 cards. `alt` is a static export of each
 * opengraph-image.tsx, so it cannot follow the locale or the page's copy: a
 * per-locale alt would need generateImageMetadata, which moves the image to
 * /opengraph-image/<id>. The brand is the one alt true for every card. Known
 * limit: a screen reader announces only "Orbexs". On the home, Live Studio and
 * RealTy the card title differs from og:title, and the Live Studio and RealTy
 * eyebrows carry scope lines (application status, demo version) that og:title
 * does not.
 */
export const socialImageAlt = siteConfig.name

// Written by `npm run images` (scripts/process-images.mjs) from design/source/relieve.png.
const BACKGROUND_FILE = join(process.cwd(), "public/images/og/relieve-og.jpg")

let background: Promise<string> | undefined

/** The relief backdrop as a data URL, read once per server process. */
function loadBackground(): Promise<string> {
  background ??= readFile(BACKGROUND_FILE, "base64").then((data) => `data:image/jpeg;base64,${data}`)
  return background
}

/**
 * Social image of one route in one locale: the relief at night, a fade to
 * #0a0a0a, the Orbexs mark (the two slabs of BrandLogo) and the page's eyebrow
 * and title from its dictionary. Every opengraph-image.tsx under
 * src/app/[locale] calls this with its own path.
 *
 * Caching: the `?<hash>` Next appends to og:image hashes the
 * opengraph-image.tsx source, not the rendered PNG, and the card copy lives in
 * the dictionaries. A copy change therefore keeps the URL, and the networks
 * cache by URL: after changing a line that appears on a card, ask them to
 * re-scrape (Facebook Sharing Debugger, LinkedIn Post Inspector).
 */
export async function renderPageSocialImage({
  locale,
  path,
}: {
  locale: string
  path: InternalPath
}): Promise<ImageResponse> {
  if (!isValidLocale(locale)) notFound()

  const [dict, backgroundSrc] = await Promise.all([getDictionary(locale), loadBackground()])
  const { eyebrow, cardTitle } = getPageMeta(dict, path)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders a plain <img>, not next/image */}
        <img
          src={backgroundSrc}
          alt=""
          width={socialImageSize.width}
          height={socialImageSize.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.55) 45%, #0a0a0a 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="-4 -4 32 32" fill="none">
              <g transform="rotate(45 12 12)" fill="#ffffff">
                <rect x="4" y="4" width="16" height="7" />
                <rect x="4" y="13" width="16" height="7" />
              </g>
            </svg>
            <div style={{ fontSize: 30, letterSpacing: "-0.01em" }}>{siteConfig.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
            {/* Instrument layer. next/og only ships Geist Regular (no Geist Mono), so the
                eyebrow keeps the caps, the 0.3em tracking and #a3a3a3, not the mono face. */}
            <div
              style={{
                fontSize: 17,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#a3a3a3",
              }}
            >
              {eyebrow}
            </div>
            {/* Balanced like the site's headlines (text-balance): no one-word last line. */}
            <div style={{ fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.02em", textWrap: "balance" }}>
              {cardTitle}
            </div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  )
}
