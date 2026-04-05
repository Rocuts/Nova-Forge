"use client"

import dynamic from "next/dynamic"

const SoundToggle = dynamic(
  () => import("./SoundToggle").then((m) => ({ default: m.SoundToggle })),
  { ssr: false }
)

export function SoundToggleWrapper() {
  return <SoundToggle />
}
