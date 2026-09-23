"use client"

import { LazyMotion, MotionConfig, domAnimation } from "motion/react"

// LazyMotion + `m` components keep the full motion renderer (~100+ kB raw)
// out of the shared First Load JS bundle: only the lightweight `m` factory is
// imported eagerly, and the domAnimation feature bundle loads async after
// hydration. `strict` makes any leftover `motion.*` component throw at
// runtime, so a regression cannot slip in silently.
//
// domAnimation covers everything this site uses (animate/exit/variants,
// whileHover/whileTap/whileInView). Nothing uses drag or layout animations —
// if that ever changes, switch to domMax.
//
// MotionConfig reducedMotion="user" honours the visitor's
// `prefers-reduced-motion`: under "reduce", every transform and layout value
// (x, y, scale, rotate, width, height…) jumps straight to its target, while
// opacity and colour still fade. Motion reads the preference when each
// component mounts, never during render, so the server markup and hydration
// are unaffected. Components that loop, or that scrub with the scroll, still
// branch on useReducedMotion() themselves to show a meaningful still state.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
