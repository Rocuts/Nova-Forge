"use client"

import { useEffect, useRef, useState } from "react"
import { animate, m, useInView, useMotionValue, useMotionValueEvent, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import type { StageMode } from "@/hooks/useStageProgress"
import { ROUTE_BAND_VISIBLE_FROM, ROUTE_PATH, ROUTE_SUMMIT, VIEWBOX } from "./geometry"

const COMPLETE_AT = 0.999
// Grosor en unidades de la imagen (≈ 1 px a 1440 px de ancho). Sin trazo
// "non-scaling-stroke": con pathLength, Chromium calcula el guion en unidades de
// la imagen y lo pinta en píxeles de pantalla, y la ruta "completa" se quedaría
// en ~60–80 % en pantallas grandes (plan §3.6).
const ROUTE_STROKE = 1.1

/**
 * Ruta de la portada: una línea blanca sube por la cresta y termina en el punto
 * azul de la cumbre, el único azul de la sección (plan §3.1).
 * `strokeLinecap="butt"`: con `round`, un trazo de longitud 0 ya pinta un punto.
 *
 * `band`: banda vertical (< lg, vertical). Ahí la máscara `.hero-route` solo
 * deja ver el tramo final (desde `ROUTE_BAND_VISIBLE_FROM`), así que el dibujo
 * se reparte sobre ese tramo: el trazo que se ve crece durante toda la
 * animación, en vez de asomar al final bajo la cumbre. El avance, la cumbre y
 * `data-complete` no cambian: solo el largo pintado.
 */
export function HeroRoute({
  progress,
  mode,
  band,
}: {
  progress: MotionValue<number>
  mode: StageMode
  band: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true })

  // scrub: el avance del escenario dibuja la ruta y enciende la cumbre (traspaso §4)
  const scrubDraw = useTransform(progress, [0.06, 0.68], [0, 1])
  const scrubSummit = useTransform(progress, [0.66, 0.74], [0, 1])

  // inView / static: valor propio, animado una vez al entrar o fijado al final
  const ownDraw = useMotionValue(0)
  const ownSummit = useTransform(ownDraw, [0.95, 1], [0, 1])

  useEffect(() => {
    if (mode === "static") {
      ownDraw.set(1)
      return
    }
    if (mode !== "inView" || !inView) return
    const controls = animate(ownDraw, 1, { duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [mode, inView, ownDraw])

  const draw = mode === "scrub" ? scrubDraw : ownDraw
  const summit = mode === "scrub" ? scrubSummit : ownSummit

  // Largo pintado. Con 0 no se pinta nada. En la banda, el primer tramo que se
  // pinta llega justo al borde de la máscara (lo de debajo queda oculto por
  // ella). Fuera de la banda es el mismo valor que `draw`. En el servidor y al
  // hidratar `band` es false: el HTML no cambia.
  const drawFrom = band ? ROUTE_BAND_VISIBLE_FROM : 0
  const pathLength = useTransform(draw, (value) => (value <= 0 ? 0 : drawFrom + (1 - drawFrom) * value))

  // data-complete: estado observable para las pruebas (sin esperas por tiempo)
  const [complete, setComplete] = useState(false)
  useMotionValueEvent(draw, "change", (value) => setComplete(value >= COMPLETE_AT))
  useEffect(() => {
    // Al cambiar de modo cambia el valor que se lee: se sincroniza sin esperar a un "change".
    queueMicrotask(() => setComplete(draw.get() >= COMPLETE_AT))
  }, [draw])

  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-hero-route=""
      data-complete={complete ? "true" : "false"}
      className="absolute inset-0 h-full w-full"
    >
      <m.path
        d={ROUTE_PATH}
        fill="none"
        stroke="#ffffff"
        strokeWidth={ROUTE_STROKE}
        strokeLinecap="butt"
        style={{ pathLength }}
      />
      <m.circle
        data-hero-summit=""
        cx={ROUTE_SUMMIT.x}
        cy={ROUTE_SUMMIT.y}
        r={6}
        fill="#2563eb"
        style={{ opacity: summit }}
      />
    </svg>
  )
}
