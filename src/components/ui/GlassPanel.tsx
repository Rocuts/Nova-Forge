"use client"
import { cn } from "@/lib/utils"
import { MouseEvent } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

export const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("relative group rounded-[var(--radius-lg)]", className)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[var(--radius-lg)] opacity-0 transition duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 59, 48, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full w-full glass-panel rounded-[var(--radius-lg)] p-8 z-10 transition-colors duration-500 group-hover:bg-surface-elevated/40">
        {children}
      </div>
    </motion.div>
  )
}
