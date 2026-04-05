"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"

const GlobalParticleScene = dynamic(
  () => import("./GlobalParticleScene"),
  { ssr: false }
)

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("GlobalParticles canvas error:", error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export function GlobalParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <CanvasErrorBoundary>
        <GlobalParticleScene />
      </CanvasErrorBoundary>
    </div>
  )
}
