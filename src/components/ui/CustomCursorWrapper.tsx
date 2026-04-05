"use client"
import dynamic from "next/dynamic"

const CustomCursor = dynamic(
  () => import("./CustomCursor").then((m) => ({ default: m.CustomCursor })),
  { ssr: false }
)

export function CustomCursorWrapper() {
  return <CustomCursor />
}
