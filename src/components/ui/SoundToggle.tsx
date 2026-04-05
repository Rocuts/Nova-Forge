"use client"

import { useUISound } from "@/hooks/useUISound"

export function SoundToggle() {
  const { toggleMute, muted } = useUISound()

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-surface-base/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-primary-cyan/40 transition-all duration-300 cursor-pointer"
    >
      {muted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  )
}
