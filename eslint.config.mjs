import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Presupuesto de JS de la home (plan §3.8): lo que cada isla importa de motion
// viaja en el JS de /es. Solo el subconjunto medido (m, useStageProgress o
// useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView,
// animateSingleValue y tipos). T10 añade CTA.tsx y FAQ.tsx a `files` al reescribirlos.
const HOME_MOTION_MESSAGE =
  "Plan §3.8 (presupuesto de JS): en las islas de la home, solo m, useStageProgress o useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView y animateSingleValue. m.* en lugar de motion.*; animateSingleValue(valor, 1, opciones) con `return () => valor.stop()` en lugar de animate().";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/components/sections/home/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          {
            name: "motion/react",
            importNames: ["animate", "useAnimate", "useSpring", "stagger", "AnimatePresence", "domMax", "motion"],
            message: HOME_MOTION_MESSAGE,
          },
          { name: "motion", message: HOME_MOTION_MESSAGE },
          { name: "motion/react-client", message: HOME_MOTION_MESSAGE },
          { name: "framer-motion", message: HOME_MOTION_MESSAGE },
        ],
      }],
    },
  },
  {
    // Plan §3.8: desde un Server Component, next/dynamic no divide el código
    // del cliente y solo añade su runtime (≈ 2,6 KB en /es).
    files: ["src/app/\\[locale\\]/page.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "next/dynamic", message: "Plan §3.8: page.tsx importa las secciones de forma estática, nunca con next/dynamic." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Audit artifacts and test output:
    ".unlighthouse/**",
    "test-results/**",
    "playwright-report/**",
    // Agent worktrees (contain full repo copies with build artifacts):
    ".claude/**",
  ]),
]);

export default eslintConfig;
