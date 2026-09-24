"use client"

import { useEffect, useState } from "react"

/**
 * ¿Se cumple la media query? `null` en el servidor y en el primer render del
 * cliente, para que la hidratación coincida (el HTML no puede depender de
 * ella); tras montar, sigue a `matchMedia(query)` y a sus cambios (girar la
 * pantalla, redimensionar, cambiar una preferencia del sistema).
 *
 * Si la condición tiene que coincidir con una variante de Tailwind (`stage:`,
 * `md:`, `max-lg:portrait:`, etc.), escribe la misma cadena que la variante, en rem
 * (plan §3.6): en una media query, rem se calcula sobre la letra por defecto
 * del navegador, así que con px el JavaScript se separaría del CSS si el
 * usuario la agranda.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    const list = window.matchMedia(query)
    let active = true
    // queueMicrotask: sin setState síncrono en el cuerpo del efecto (patrón del repo)
    const update = () =>
      queueMicrotask(() => {
        if (active) setMatches(list.matches)
      })

    update()
    list.addEventListener("change", update)
    return () => {
      active = false
      list.removeEventListener("change", update)
    }
  }, [query])

  return matches
}
