"use client"
import { useEffect, useState } from "react"

type Reading = { pathname: string; isDark: boolean }

/**
 * Tells whether a dark section (`[data-header-theme="dark"]`) is under the
 * header strip — the top 5 % of the viewport.
 *
 * - Keeps the set of dark sections inside the strip. Deciding from the entries
 *   of a single callback is wrong: when two dark sections touch, the one that
 *   leaves arrives alone and would paint the header light over the other.
 * - Subscribes again on every route change: the sections it observed belong to
 *   the previous page, and the new page brings its own.
 * - Returns null until the observer has reported for the current pathname. The
 *   server HTML and the first client render then agree (no data-tone), and in
 *   the meantime globals.css picks the tone from `data-header-start`.
 */
export function useDarkSectionDetection(pathname: string): boolean | null {
  const [reading, setReading] = useState<Reading | null>(null)

  useEffect(() => {
    let active = true
    const publish = (isDark: boolean) => {
      if (!active) return
      setReading((prev) =>
        prev?.pathname === pathname && prev.isDark === isDark ? prev : { pathname, isDark }
      )
    }

    const sections = document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]')
    if (sections.length === 0) {
      // Nothing to observe means no callback will ever come: the page is light.
      queueMicrotask(() => publish(false))
      return () => {
        active = false
      }
    }

    const underHeader = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) underHeader.add(entry.target)
          else underHeader.delete(entry.target)
        }
        publish(underHeader.size > 0)
      },
      // Only the strip at the top of the viewport, where the header lives.
      { rootMargin: "0px 0px -95% 0px", threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))

    return () => {
      active = false
      observer.disconnect()
    }
  }, [pathname])

  return reading?.pathname === pathname ? reading.isDark : null
}
