import type { NextConfig } from "next";
import { pathMap } from "./src/lib/i18n";

const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and allow preload list inclusion
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Never render this site inside a frame (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // No plugins, no <base> hijacking, forms only submit to this origin.
  //
  // `script-src` is intentionally absent. This was re-evaluated and the omission
  // is deliberate, not an oversight:
  //
  //  * Nonces are out. A nonce has to be unique per response, so it can only be
  //    minted per request (in src/proxy.ts). Every content route here is SSG —
  //    `next build` marks them ● — and issuing a nonce would force each one to
  //    render on demand. Trading the entire static export for one header is a
  //    bad deal, so this is a hard no.
  //
  //  * Hashes are out. Each prerendered page carries two executable inline
  //    scripts from Next itself: the constant `(self.__next_f=...).push([0])`
  //    bootstrap, and the RSC flight payload. The payload body is unique per
  //    page and changes whenever the copy or the build does, so a hash list
  //    pinned in this file would go stale on the very next deploy and take the
  //    site down with it. (The JSON-LD blocks are `type="application/ld+json"`;
  //    browsers never execute them, so they are not what blocks a strict CSP.)
  //
  //  * That leaves `script-src 'self' 'unsafe-inline'`, which is not a strict
  //    CSP at all — it still permits injected inline script, the actual XSS
  //    vector. It would only block foreign-origin script and eval(), and this
  //    site loads neither: every script is same-origin (/_next/* plus Vercel
  //    Analytics at /_vercel/insights/script.js). So it buys close to nothing
  //    while risking silent breakage in `next dev` and for any third-party
  //    script added later. Not worth shipping for the appearance of hardening.
  //
  // Revisit if these pages ever become dynamically rendered, at which point the
  // nonce route opens up and a genuinely strict policy becomes worthwhile.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
  // Disable MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This site needs none of these browser capabilities
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Isolate the browsing context from cross-origin windows
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// English slugs live only in pathMap; rewrites/redirects derive from it so a new
// page only needs the folder + pathMap + sitemap entries.
const englishSlugPairs = Object.entries(pathMap)
  .filter(([internalPath, slugs]) => slugs.en !== internalPath)
  .map(([internalPath, slugs]) => ({ internal: `/en${internalPath}`, english: `/en${slugs.en}` }));

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "motion/react", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    // The Spanish-named folders are still routable under /en; without this they
    // serve duplicate content of the canonical English slugs.
    return englishSlugPairs.map(({ internal, english }) => ({
      source: internal,
      destination: english,
      permanent: true,
    }));
  },
  async rewrites() {
    // English slug aliases → internal [locale] routes
    return englishSlugPairs.map(({ internal, english }) => ({
      source: english,
      destination: internal,
    }));
  },
};

export default nextConfig;
