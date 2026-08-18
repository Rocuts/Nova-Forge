"use client"
import { useEffect, useState } from "react"

/** Detects which section the header overlaps and returns "light" or "dark" */
export function useDarkSectionDetection() {
  const [isDarkSection, setIsDarkSection] = useState(false)

  useEffect(() => {
    const darkSections = document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]')
    if (darkSections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if any dark section intersects the top of the viewport (header zone)
        let anyDark = false
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect
            // Section is dark if it covers the header (top 64px)
            if (rect.top < 64 && rect.bottom > 0) {
              anyDark = true
            }
          }
        }
        setIsDarkSection(anyDark)
      },
      {
        // Only observe the top 64px strip where the header lives
        rootMargin: "0px 0px -95% 0px",
        threshold: 0,
      }
    )

    darkSections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return isDarkSection
}
