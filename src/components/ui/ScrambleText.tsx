"use client"
import { useEffect, useState, ElementType } from "react"

interface ScrambleTextProps {
  children: string
  as?: ElementType
  className?: string
  delay?: number
  duration?: number
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#_"

export function ScrambleText({ 
  children, 
  as: Component = "span", 
  className, 
  delay = 0,
  duration = 1000 
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let frameId: number
    let startTime: number
    let lastUpdateTime = 0
    const updateInterval = 40 // ~25 FPS

    // Safety check just in case children isn't a string
    const text = typeof children === 'string' ? children : String(children)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      if (timestamp - lastUpdateTime >= updateInterval) {
        let newText = ""
        for (let i = 0; i < text.length; i++) {
          const charSettleTime = (duration / text.length) * i
          
          if (progress >= charSettleTime) {
            newText += text[i]
          } else {
            // Keep spaces as spaces to maintain natural word wrapping breaks if any
            newText += text[i] === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        }

        setDisplayText(newText)
        lastUpdateTime = timestamp
      }

      if (progress < duration) {
        frameId = requestAnimationFrame(animate)
      } else {
        setDisplayText(text)
        setIsAnimating(false)
        setHasAnimated(true)
      }
    }

    timeout = setTimeout(() => {
      setIsAnimating(true)
      frameId = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timeout)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [children, delay, duration])

  const Tag = Component as "span"
  const isShowing = hasAnimated || isAnimating

  return (
    <Tag className={className}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden="true"
        style={{ visibility: isShowing ? "visible" : "hidden" }}
      >
        {isShowing ? displayText : children}
      </span>
    </Tag>
  )
}
