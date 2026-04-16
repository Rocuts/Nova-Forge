"use client"
import { useEffect, useRef, useState } from "react"

/**
 * Vertical scroll progress indicator on the right side of the viewport.
 * Uses vanilla scroll listener for reliable cross-environment behavior.
 * Hidden on mobile and when prefers-reduced-motion is active.
 */
export function ScrollProgress() {
  const innerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768
    const prefersMotion = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (!(isDesktop && prefersMotion)) return

    queueMicrotask(() => setVisible(true))

    function onScroll() {
      if (!innerRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      innerRef.current.style.height = `${progress}%`
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // set initial position

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      aria-hidden
    >
      {/* Track */}
      <div className="w-[1px] h-[120px] bg-[#0a0a0a] opacity-[0.08] relative">
        {/* Fill */}
        <div
          ref={innerRef}
          className="absolute top-0 left-0 w-full bg-[#0a0a0a] opacity-60"
          style={{ height: "0%" }}
        />
      </div>
    </div>
  )
}
