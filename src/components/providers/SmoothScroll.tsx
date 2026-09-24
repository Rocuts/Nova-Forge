"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Last pathname the effect saw (null before the first run). Comparing paths,
  // not a "first run" flag, keeps StrictMode's double mount on the mount branch.
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    const isRouteChange = previousPathname.current !== null && previousPathname.current !== pathname
    previousPathname.current = pathname

    if (isRouteChange) {
      // Instant on purpose: with `scroll-behavior: smooth` on <html> a plain
      // scrollTo animates, and it used to race Next's own scroll after a
      // navigation and leave the new page halfway down. data-scroll-behavior on
      // <html> (layout) now makes Next's scroll instant, but only that one: this
      // scrollTo runs later, in an effect, so it still opts out itself. Anchor
      // links keep the native smooth scroll.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    } else {
      // Mount keeps the plain (smooth) scrollTo it always had. The page is
      // almost always at the top already; if the visitor scrolled before
      // hydration, an instant jump would yank them to the top and swallow the
      // click they were making, while a smooth scroll gives way to their own.
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return <>{children}</>
}
