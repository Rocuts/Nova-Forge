"use client"
import { motion } from "motion/react"

interface BrandLogoProps {
  className?: string
  size?: number
  loading?: boolean
}

export function BrandLogo({ className = "", size = 24, loading = false }: BrandLogoProps) {
  // Top-tier spring animation config (crisp, government/enterprise feel)
  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ 
        rotate: loading ? 360 : 0 
      }}
      transition={
        loading 
          ? { repeat: Infinity, duration: 1.5, ease: "linear" } 
          : springConfig
      }
      whileHover={!loading ? "hover" : undefined}
      whileTap={!loading ? "tap" : undefined}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(45 12 12)">
          {/* Top Slab */}
          <motion.rect
            x="4"
            width="16"
            height="7"
            fill="currentColor"
            initial={{ y: 4 }}
            variants={{
              hover: { y: 2 },
              tap: { y: 5, scale: 0.98 }
            }}
            animate={{
               y: loading ? 2 : 4
            }}
            transition={springConfig}
          />
          {/* Bottom Slab */}
          <motion.rect
            x="4"
            width="16"
            height="7"
            fill="currentColor"
            initial={{ y: 13 }}
            variants={{
              hover: { y: 15 },
              tap: { y: 12, scale: 0.98 }
            }}
            animate={{
               y: loading ? 15 : 13
            }}
            transition={springConfig}
          />
        </g>
      </svg>
    </motion.div>
  )
}
