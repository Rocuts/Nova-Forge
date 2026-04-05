"use client"
import dynamic from "next/dynamic"
import { useIsMobile } from "@/lib/useIsMobile"

const CustomCursor = dynamic(
  () => import("./CustomCursor").then((m) => ({ default: m.CustomCursor })),
  { ssr: false }
)

export function CustomCursorWrapper() {
  const isMobile = useIsMobile()
  
  if (isMobile) return null
  
  return <CustomCursor />
}
