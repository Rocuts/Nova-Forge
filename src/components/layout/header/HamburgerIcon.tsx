"use client"
import { motion } from "motion/react"
import { megaMenuEase } from "./types"

export function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between relative">
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: megaMenuEase }}
      />
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block h-[1.5px] w-full bg-current origin-center"
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: megaMenuEase }}
      />
    </div>
  )
}
