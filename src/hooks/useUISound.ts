"use client"

import { useCallback, useState, useEffect } from "react"
import {
  playClick,
  playHover,
  playSectionEnter,
  toggleMute,
  isMuted,
} from "@/lib/audio"

export function useUISound() {
  const [muted, setMuted] = useState(true) // default muted until client

  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState in effect body
    queueMicrotask(() => setMuted(isMuted()))
  }, [])

  const toggle = useCallback(() => {
    const newState = toggleMute()
    setMuted(newState)
    return newState
  }, [])

  return { playClick, playHover, playSectionEnter, toggleMute: toggle, muted }
}
