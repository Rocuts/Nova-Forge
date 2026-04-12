import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "motion/react", "lucide-react"],
  },
  async rewrites() {
    return [
      // English slug aliases → internal [locale] routes
      { source: "/en/diagnostics", destination: "/en/diagnostico" },
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
    ];
  },
};

export default nextConfig;
