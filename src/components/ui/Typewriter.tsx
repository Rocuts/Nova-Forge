"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface TypewriterProps {
  text: string
  speed?: number
  delayBeforeDelete?: number
  deleteSpeed?: number
  delayBeforeType?: number
}

export function Typewriter({
  text,
  speed = 100,
  delayBeforeDelete = 3000,
  deleteSpeed = 50,
  delayBeforeType = 1000,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleType = () => {
      if (isDeleting) {
        setDisplayedText((prev) => prev.slice(0, -1))
        timer = setTimeout(handleType, deleteSpeed)
      } else {
        setDisplayedText((prev) => text.slice(0, prev.length + 1))
        timer = setTimeout(handleType, speed)
      }
    }

    if (!isDeleting && displayedText === text) {
      // Finished typing, pause before delete
      timer = setTimeout(() => setIsDeleting(true), delayBeforeDelete)
    } else if (isDeleting && displayedText === "") {
      // Finished deleting, pause before typing again
      setIsDeleting(false)
      setLoopNum(loopNum + 1)
      timer = setTimeout(handleType, delayBeforeType)
    } else {
      timer = setTimeout(handleType, isDeleting ? deleteSpeed : speed)
    }

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, text, speed, delayBeforeDelete, deleteSpeed, delayBeforeType, loopNum])

  return (
    <span className="inline-block min-w-[2px]">
      {displayedText}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="inline-block w-[0.5em] h-[1em] ml-0.5 bg-primary-cyan align-middle -translate-y-[0.1em]"
      />
    </span>
  )
}
