"use client"
import { useEffect, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select"

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    },
    [cursorX, cursorY]
  )

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => setIsHovering(false), [])

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches
    // Use queueMicrotask to avoid synchronous setState in effect body
    queueMicrotask(() => setIsDesktop(isPointerFine))
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    document.body.style.cursor = "none"
    window.addEventListener("mousemove", handleMouseMove)

    const interactiveElements = document.querySelectorAll(INTERACTIVE_SELECTOR)
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    // Observe DOM changes to attach listeners to dynamically added elements
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(INTERACTIVE_SELECTOR)
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
        el.addEventListener("mouseenter", handleMouseEnter)
        el.addEventListener("mouseleave", handleMouseLeave)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.body.style.cursor = ""
      window.removeEventListener("mousemove", handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
      observer.disconnect()
    }
  }, [isDesktop, handleMouseMove, handleMouseEnter, handleMouseLeave])

  if (!isDesktop) return null

  return (
    <>
      {/* Inner dot - follows mouse 1:1 */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          position: "fixed",
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "white",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
        }}
      />
      {/* Outer circle - follows with spring */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          position: "fixed",
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid white",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
          scale: isHovering ? 1.5 : 1,
        }}
        animate={{ scale: isHovering ? 1.5 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  )
}
