"use client"

import { LazyMotion, domAnimation } from "motion/react"

// LazyMotion + `m` components keep the full motion renderer (~100+ kB raw)
// out of the shared First Load JS bundle: only the lightweight `m` factory is
// imported eagerly, and the domAnimation feature bundle loads async after
// hydration. `strict` makes any leftover `motion.*` component throw at
// runtime, so a regression cannot slip in silently.
//
// domAnimation covers everything this site uses (animate/exit/variants,
// whileHover/whileTap/whileInView). Nothing uses drag or layout animations —
// if that ever changes, switch to domMax.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
