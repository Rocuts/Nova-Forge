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
    
    // Safety check just in case children isn't a string
    const text = typeof children === 'string' ? children : String(children)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      let newText = ""
      for (let i = 0; i < text.length; i++) {
        // Distribute completion times across the duration
        const charSettleTime = (duration / text.length) * i
        
        if (progress >= charSettleTime) {
          newText += text[i]
        } else {
          // Keep spaces as spaces to maintain natural word wrapping breaks if any
          newText += text[i] === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplayText(newText)

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
  return (
    <Tag className={`relative ${className || ""}`}>
      {/* Invisible text for screen readers and layout constraints */}
      <span className="opacity-0 pointer-events-none" aria-hidden="true">{children}</span>
      {/* Readable text for screen readers only */}
      <span className="sr-only">{children}</span>
      {/* Visible animated text */}
      <span className="absolute inset-0" aria-hidden="true" style={{ letterSpacing: 'inherit', textAlign: 'inherit' }}>
        {hasAnimated || isAnimating ? displayText : ""}
      </span>
    </Tag>
  )
}
