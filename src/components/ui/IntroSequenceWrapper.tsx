"use client"

import dynamic from "next/dynamic"

const IntroSequence = dynamic(
  () =>
    import("./IntroSequence").then((m) => ({ default: m.IntroSequence })),
  { ssr: false }
)

export function IntroSequenceWrapper() {
  return <IntroSequence />
}
