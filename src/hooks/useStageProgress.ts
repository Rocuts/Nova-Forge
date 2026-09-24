"use client"

import { useScroll } from "motion/react"
import type { MotionValue } from "motion/react"
import { useMediaQuery } from "./useMediaQuery"

/**
 * Cómo se anima una sección de la home (plan §3.6):
 * - `scrub`: ≥ 48rem de ancho y ≥ 37,5rem de alto (768 × 600 px con la letra
 *   por defecto de 16 px), sin reducir movimiento. El avance del escenario
 *   (0→1) controla la animación; el `sticky` y la altura larga los pone CSS
 *   (`stage:`), no este hook. Sin JavaScript, `stage:` no se aplica: la
 *   sección es un bloque normal, sin scroll muerto.
 * - `inView`: más estrecho o más bajo (celular, celular apaisado). Sin
 *   sticky; la animación se dispara una vez al entrar.
 * - `static`: reducir movimiento. Estado final, sin animar.
 */
export type StageMode = "scrub" | "inView" | "static"

type ScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>
export type StageOffset = ScrollOptions["offset"]

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"
// La misma cadena que la variante `stage:` de globals.css, carácter a carácter:
// el modo que decide JavaScript coincide siempre con el layout que decide CSS.
// En rem, no en px: en una media query, rem se calcula sobre el tamaño de letra
// por defecto del navegador. Con la letra "Grande" (20 px), 48rem son 960 px;
// con 768px, JavaScript entraba en scrub sin el sticky de CSS y la portada se
// "terminaba" con el primer golpe de rueda. Con JS, `(scripting: enabled)`
// siempre se cumple; está para que la condición sea la misma, también en un
// navegador que no conozca `scripting` (ahí ninguna de las dos se cumple: modo
// inView sin sticky).
const SCRUB_QUERY =
  "(min-width: 48rem) and (min-height: 37.5rem) and (prefers-reduced-motion: no-preference) and (scripting: enabled)"

// Offsets en texto a propósito: motion solo acelera con ViewTimeline los
// offsets de sus presets numéricos. Con texto, `progress` siempre lo calcula
// JavaScript y los MotionValue derivados (y `data-*` que las pruebas leen)
// reflejan el scroll real.
const DEFAULT_OFFSET: StageOffset = ["start start", "end end"]

/**
 * Devuelve "scrub" en el servidor y en el primer render del cliente, para que
 * la hidratación coincida; tras montar, consulta las media queries y sigue sus
 * cambios (girar el teléfono, redimensionar, activar reducir movimiento). Hasta
 * conocer las dos, "scrub": el estado que pinta el servidor.
 */
export function useStageMode(): StageMode {
  const reduced = useMediaQuery(REDUCED_QUERY)
  const scrub = useMediaQuery(SCRUB_QUERY)
  if (reduced === null || scrub === null) return "scrub"
  return reduced ? "static" : scrub ? "scrub" : "inView"
}

/**
 * Avance del scroll dentro de un escenario (0 → 1) + modo de animación.
 * `ref` es el contenedor alto (`<section>` de ScrollStage).
 */
export function useStageProgress(
  ref: React.RefObject<HTMLElement | null>,
  offset: StageOffset = DEFAULT_OFFSET,
): { progress: MotionValue<number>; mode: StageMode } {
  const mode = useStageMode()
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { progress: scrollYProgress, mode }
}
