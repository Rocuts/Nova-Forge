"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PanelProps {
  children: React.ReactNode
  className?: string
  dark?: boolean
}

export function Panel({ children, className, dark = false }: PanelProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    queueMicrotask(() =>
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    )
  }, [])

  return (
    <div
      className={cn(
        "rounded-[6px] p-8 transition-all duration-300 ease-out",
        dark
          ? "bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a]"
          : "bg-[#f8f8f8] border border-[#e5e5e5] hover:border-[#d4d4d4]",
        !prefersReducedMotion && "hover:-translate-y-[2px]",
        className
      )}
    >
      {children}
    </div>
  )
}

export { Panel as GlassPanel }
