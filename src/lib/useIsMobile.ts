"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Returns true on viewports narrower than 768 px.
 * Safe for SSR — defaults to false on the server and hydrates after mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mql.matches)
    // Use queueMicrotask to avoid synchronous setState in effect body
    queueMicrotask(onChange)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
