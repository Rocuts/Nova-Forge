import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      // English slug aliases → internal [locale] routes
      { source: "/en/diagnostics", destination: "/en/diagnostico" },
      { source: "/en/privacy", destination: "/en/privacidad" },
      { source: "/en/terms", destination: "/en/terminos" },
      { source: "/en/schedule", destination: "/en/agendar" },
    ];
  },
};

export default nextConfig;
