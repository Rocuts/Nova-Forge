"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useInView, useMotionValueEvent } from "motion/react"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"

// La frase se lee mientras cruza la franja central del viewport: avance 0 cuando
// su borde superior llega al 85 % de la altura, 1 cuando su borde inferior llega
// al 50 %. No hace falta sticky: el propio desplazamiento de la frase es el recorrido.
const THESIS_OFFSET: StageOffset = ["start 0.85", "end 0.5"]
// Modo inView (celular): una palabra cada 60 ms (stagger de palabra del design system).
const WORD_STEP_MS = 60

/**
 * Tesis de la home (diseño §5.2). Texto real en el DOM: cada palabra es un
 * `span` que solo cambia de color, de #737373 a #0a0a0a (plan §3.1; el #a3a3a3
 * del diseño daría 2,5:1). En el primer render (scrub, avance 0) todas las
 * palabras quedan en #737373, que es legible (4,7:1 sobre blanco); sin
 * JavaScript, globals.css (`@media (scripting: none)`) pinta el estado final en
 * #0a0a0a.
 *
 * Por debajo de 22,5rem de ancho (360 px) la letra baja de 2,5rem, el mínimo de
 * text-fluid-h1, a 2,25rem: a 320 px «organizaciones» y «ciberseguridad» no
 * cabían en la columna de 272 px y se comían el margen derecho.
 */
export function Thesis({ text }: { text: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const { progress, mode } = useStageProgress(textRef, THESIS_OFFSET)
  const words = text.split(" ")
  const total = words.length

  // scrub: palabras activas = avance × total (cambio de color discreto, sin interpolar)
  const [scrubCount, setScrubCount] = useState(0)
  const onProgress = useCallback((latest: number) => setScrubCount(Math.round(latest * total)), [total])
  useMotionValueEvent(progress, "change", onProgress)

  // inView: al entrar en pantalla, una sola vez, palabra a palabra
  const inView = useInView(textRef, { once: true, amount: 0.5 })
  const [revealed, setRevealed] = useState(0)
  const revealedRef = useRef(0)
  useEffect(() => {
    if (mode !== "inView" || !inView || revealedRef.current >= total) return
    const timer = window.setInterval(() => {
      revealedRef.current = Math.min(revealedRef.current + 1, total)
      setRevealed(revealedRef.current)
      if (revealedRef.current >= total) window.clearInterval(timer)
    }, WORD_STEP_MS)
    return () => window.clearInterval(timer)
  }, [mode, inView, total])

  const activeCount = mode === "static" ? total : mode === "inView" ? revealed : scrubCount

  return (
    <section data-header-theme="light" data-stage-mode={mode} className="relative bg-white py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-6">
        <p
          ref={textRef}
          className="max-w-5xl font-heading text-fluid-h1 font-semibold leading-[1.08] tracking-tight max-[22.5rem]:text-[2.25rem]"
        >
          {words.map((word, i) => {
            const active = i < activeCount
            return (
              <Fragment key={`${i}-${word}`}>
                <span
                  data-thesis-word=""
                  data-active={String(active)}
                  className={active ? "text-[#0a0a0a]" : "text-[#737373]"}
                >
                  {word}
                </span>
                {i < total - 1 ? " " : null}
              </Fragment>
            )
          })}
        </p>
      </div>
    </section>
  )
}
