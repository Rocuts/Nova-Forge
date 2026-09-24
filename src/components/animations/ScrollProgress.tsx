"use client"
import { useEffect, useRef, useState } from "react"

/**
 * Vertical scroll progress indicator on the right side of the viewport.
 * Uses vanilla scroll listener for reliable cross-environment behavior.
 * Hidden on mobile and when prefers-reduced-motion is active.
 *
 * Va en el margen de la página (`right-2`): con `right-6` caía justo sobre el
 * borde derecho del contenido `max-w-7xl px-6` en anchos ≤ 80rem (p. ej. sobre
 * el borde de la lámina de Capacidades en la home). La pista y el relleno
 * llevan su transparencia en el color de fondo, no en `opacity`: con `opacity`
 * en la pista, el relleno (su hijo) quedaba multiplicado a ~5 % y el avance
 * apenas se veía.
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
      innerRef.current.style.transform = `scaleY(${progress / 100})`
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // set initial position

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed right-2 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      aria-hidden
    >
      {/* Track */}
      <div className="w-[1px] h-[120px] bg-[#0a0a0a]/8 relative">
        {/* Fill */}
        <div
          ref={innerRef}
          data-scroll-progress-fill
          className="absolute inset-0 origin-top bg-[#0a0a0a]/60"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
    </div>
  )
}
