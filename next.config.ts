import type { NextConfig } from "next";
import { pathMap } from "./src/lib/i18n";

const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and allow preload list inclusion
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Never render this site inside a frame (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // No plugins, no <base> hijacking, forms only submit to this origin.
  // script-src is intentionally absent: the inline JSON-LD blocks would need nonces.
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
