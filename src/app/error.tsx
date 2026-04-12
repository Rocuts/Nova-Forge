"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold text-[#0a0a0a] mb-4">
          Algo salió mal
        </h2>
        <p className="text-[#525252] mb-8 text-sm leading-relaxed">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-[#171717] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
