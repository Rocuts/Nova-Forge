import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración estricta 2026: TypeScript siempre valida en la compilación
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
