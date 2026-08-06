import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and allow preload list inclusion
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Never render this site inside a frame (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Disable MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This site needs none of these browser capabilities
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Isolate the browsing context from cross-origin windows
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

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
  async rewrites() {
    return [
      // English slug aliases → internal [locale] routes
      { source: "/en/diagnostic", destination: "/en/diagnostico" },
      { source: "/en/privacy", destination: "/en/privacidad" },
      { source: "/en/terms", destination: "/en/terminos" },
      { source: "/en/schedule", destination: "/en/agendar" },
      { source: "/en/sovereign-ai", destination: "/en/soberania-ia" },
      { source: "/en/cybersecurity", destination: "/en/ciberseguridad" },
      { source: "/en/digital-workforce", destination: "/en/fuerza-digital" },
      { source: "/en/critical-systems", destination: "/en/sistemas-criticos" },
      { source: "/en/operational-intelligence", destination: "/en/inteligencia-operativa" },
      { source: "/en/government-automation", destination: "/en/automatizacion-gobierno" },
      { source: "/en/investors", destination: "/en/inversores" },
      { source: "/en/about", destination: "/en/nosotros" },
      { source: "/en/data-enrichment", destination: "/en/enriquecimiento-datos" },
      { source: "/en/data-extraction", destination: "/en/extraccion-datos" },
      { source: "/en/tiktok-live-studio", destination: "/en/estudio-tiktok-live" },
    ];
  },
};

export default nextConfig;
