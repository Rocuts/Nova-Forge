"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { m, useInView, useMotionValueEvent } from "motion/react"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { useStageProgress } from "@/hooks/useStageProgress"
import type { StageOffset } from "@/hooks/useStageProgress"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { CAPABILITY_NODES, VIEWBOX } from "./geometry"

const INK = "#0a0a0a"
const BLUE = "#2563eb"
const NODE_COUNT = CAPABILITY_NODES.length
// Modo inView (celular): la red se enciende nodo a nodo, 220 ms por nodo.
const NODE_STEP_MS = 220
// Medidas en unidades del viewBox (1536×1024). Las aristas NO llevan
// vector-effect="non-scaling-stroke": con él, Chromium aplica mal pathLength
// (el trazo se dibuja de más o de menos según la escala de la imagen).
const NODE_RADIUS = 12
const RING_RADIUS = 24
const EDGE_WIDTH = 2.5
// Avance de la sección mientras toca el viewport (entra por abajo → sale por
// arriba). Solo sirve de aviso de scroll: toda fila que cruce el centro lo hace
// con la sección en pantalla, así que el índice se recalcula justo cuando puede
// cambiar (y, al saltar lejos, una última vez al fijarse el avance en 0 o 1).
const SECTION_OFFSET: StageOffset = ["start end", "end start"]

interface CapabilitiesContent {
  sectionId: string
  title: string
  imageLabel: string
  items: readonly { title: string; benefit: string; href: string }[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

// Índice activo por POSICIÓN (no IntersectionObserver: falla con scroll rápido).
// Última fila cuyo borde superior está en o sobre el centro del viewport;
// rows.length si la última fila ya pasó entera el centro (red completa, sin azul);
// -1 si ninguna llegó. Las filas van en orden: se deja de leer en la primera
// que aún no llegó.
function indexAtCenter(rows: readonly HTMLElement[], center: number): number {
  const last = rows[rows.length - 1]
  if (!last) return -1
  if (last.getBoundingClientRect().bottom < center) return rows.length
  let index = -1
  for (const row of rows) {
    if (row.getBoundingClientRect().top > center) break
    index += 1
  }
  return index
}

/**
 * Capacidades (diseño §5.3): lista-índice de los servicios, cada uno con enlace
 * a su página, y la lámina con una red de 8 nodos que se enciende según la fila
 * que cruza el centro del viewport. El nodo activo es el único azul.
 *
 * `media` es la imagen de la lámina ya renderizada en el servidor
 * (CapabilitiesMedia): la isla no importa `next/image` ni la imagen, así que ni
 * su código ni su vista previa viajan en este JavaScript. Se pinta dentro de
 * FocalCover, bajo la superposición SVG.
 */
export function CapabilitiesIndex({
  content,
  locale,
  media,
}: {
  content: CapabilitiesContent
  locale: Locale
  media: React.ReactNode
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const laminaRef = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(sectionRef, SECTION_OFFSET)

  // scrub: se recalcula con cada avance del scroll y con cada cambio de tamaño de
  // ventana. Las filas se buscan una vez al entrar en scrub (la lista no cambia),
  // no en cada fotograma de scroll.
  const [scrubIndex, setScrubIndex] = useState(-1)
  const rowsRef = useRef<HTMLElement[]>([])
  const measure = useCallback(() => {
    if (mode !== "scrub" || rowsRef.current.length === 0) return
    setScrubIndex(indexAtCenter(rowsRef.current, window.innerHeight / 2))
  }, [mode])
  useMotionValueEvent(progress, "change", measure)
  useEffect(() => {
    if (mode !== "scrub") return
    rowsRef.current = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-capability-row]") ?? [])
    queueMicrotask(measure)
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [mode, measure])

  // inView: al entrar la lámina en pantalla, una sola vez (`once`, como la tesis),
  // secuencia temporizada que termina siempre en N, aunque la lámina salga de
  // pantalla a mitad: nunca se queda un nodo azul a medias fuera de la vista.
  const laminaInView = useInView(laminaRef, { once: true, amount: 0.4 })
  const [sequenceIndex, setSequenceIndex] = useState(-1)
  const sequenceRef = useRef(-1)
  useEffect(() => {
    if (mode !== "inView" || !laminaInView || sequenceRef.current >= NODE_COUNT) return
    const timer = window.setInterval(() => {
      sequenceRef.current = Math.min(sequenceRef.current + 1, NODE_COUNT)
      setSequenceIndex(sequenceRef.current)
      if (sequenceRef.current >= NODE_COUNT) window.clearInterval(timer)
    }, NODE_STEP_MS)
    return () => window.clearInterval(timer)
  }, [mode, laminaInView])

  // -1 = nada encendido · 0…7 = nodo activo (azul) · 8 = red completa en negro
  const activeIndex = mode === "static" ? NODE_COUNT : mode === "inView" ? sequenceIndex : scrubIndex
  const counter = activeIndex >= NODE_COUNT ? NODE_COUNT : activeIndex + 1
  const edgeDuration = mode === "static" ? 0 : 0.45

  return (
    <section
      ref={sectionRef}
      id={content.sectionId}
      data-header-theme="light"
      data-stage-mode={mode}
      className="relative bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-[#0a0a0a] md:text-6xl">
          {content.title}
        </h2>

        <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-12">
          {/* Primero en el DOM: en celular la lámina va arriba. En md pasa a la derecha. */}
          <div className="md:col-span-5 md:col-start-8 md:row-start-1">
            {/* Fija solo en scrub (stage:): con reducir movimiento o en celular no hay sticky. */}
            <figure className="stage:sticky stage:top-24">
              {/* w-full: con ancho automático y aspect-ratio, el max-h también
                  estrecharía la caja (el tope pasa al ancho por la proporción) y
                  la leyenda quedaría más ancha que la imagen. Con w-full, en
                  pantallas bajas la lámina es más baja, no más estrecha:
                  FocalCover recorta y los 8 nodos (x 490–1060) siguen dentro. */}
              <div
                ref={laminaRef}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-[6px] border border-[#e5e5e5] bg-white md:aspect-[3/4] md:max-h-[calc(100svh-8rem)]"
              >
                <FocalCover>
                  {media}
                  <svg
                    viewBox={VIEWBOX}
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full"
                  >
                    {CAPABILITY_NODES.slice(1).map((node, k) => {
                      const from = CAPABILITY_NODES[k]
                      return (
                        <m.line
                          key={`edge-${k + 1}`}
                          data-capability-edge=""
                          x1={from.x}
                          y1={from.y}
                          x2={node.x}
                          y2={node.y}
                          stroke={INK}
                          strokeWidth={EDGE_WIDTH}
                          strokeLinecap="butt"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: k + 1 <= activeIndex ? 1 : 0 }}
                          transition={{ duration: edgeDuration, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )
                    })}
                    {CAPABILITY_NODES.map((node, i) => {
                      const lit = i <= activeIndex
                      const active = i === activeIndex
                      return (
                        <g key={`node-${i}`} data-node="" data-lit={String(lit)} data-active={String(active)}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={NODE_RADIUS}
                            fill={active ? BLUE : lit ? INK : "#ffffff"}
                            stroke={lit ? "none" : INK}
                            strokeWidth={1.5}
                            vectorEffect="non-scaling-stroke"
                          />
                          {active ? (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={RING_RADIUS}
                              fill="none"
                              stroke={INK}
                              strokeWidth={1}
                              vectorEffect="non-scaling-stroke"
                            />
                          ) : null}
                        </g>
                      )
                    })}
                  </svg>
                </FocalCover>
              </div>
              {/* El contador es un estado visual del scroll: aria-hidden (la leyenda
                  sigue diciendo solo «Imagen ilustrativa») y nunca se parte en dos
                  líneas; si falta ancho, se parte la etiqueta. Sin JavaScript se
                  oculta (globals.css): «00 / 08» no significaría nada. */}
              <figcaption className="mt-3 flex items-center justify-between gap-4">
                <InstrumentLabel tone="light" className="min-w-0">
                  {content.imageLabel}
                </InstrumentLabel>
                <InstrumentLabel tone="light" className="shrink-0 whitespace-nowrap">
                  <span data-capabilities-counter="" aria-hidden="true">
                    {`${pad(counter)} / ${pad(NODE_COUNT)}`}
                  </span>
                </InstrumentLabel>
              </figcaption>
            </figure>
          </div>

          {/* stage:pb: la red se completa cuando el borde inferior de la última fila
              cruza el centro del viewport; sin este margen, la columna de la lámina
              (tan alta como la lista) ya habría terminado y la lámina estaría a
              medio salir por arriba. Con él sigue fija y entera en ese momento.
              El margen es lo que el borde inferior de la figura fija pasa del
              centro (50svh), nunca negativo. Ese borde es 6rem (top) + el alto
              de la lámina + la leyenda (0,75rem + una línea de ~1rem, o dos si
              «Imagen ilustrativa» se parte, como a 768 px); el alto es el menor
              entre 100svh − 8rem y 4/3 del ancho de la columna, que mide
              5/12 · min(100vw, 80rem) − 3rem (5 de 12 columnas con gap de 3rem
              dentro de max-w-7xl px-6). Queda min(100svh, 5/9 · min(100vw, 80rem)
              + 5rem): cubre la leyenda en dos líneas y, con una, sobra ~1rem.
              100vw incluye la barra de desplazamiento, si la hay: el error va
              hacia más margen, no menos. */}
          <ol
            ref={listRef}
            className="md:col-span-7 md:col-start-1 md:row-start-1 stage:pb-[max(0px,min(50svh,min(100vw,80rem)*5/9_+_5rem_-_50svh))]"
          >
            {content.items.map((item, i) => {
              const lit = i <= activeIndex
              return (
                <li key={item.href} data-capability-row="" className="border-t border-[#e5e5e5] last:border-b">
                  {/* max-[22.5rem]:text-xl: a 320 px la columna del título mide 174 px y
                      «Enriquecimiento» o «Automatización» (text-2xl) se salían de ella. */}
                  <Link
                    href={buildLocalePath(locale, item.href)}
                    className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-8 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:py-10"
                  >
                    <InstrumentLabel tone="light" className={lit ? "text-[#0a0a0a]" : undefined}>
                      /{pad(i + 1)}
                    </InstrumentLabel>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold tracking-tight text-[#0a0a0a] max-[22.5rem]:text-xl md:text-3xl lg:text-4xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#525252]">{item.benefit}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-lg text-[#0a0a0a] transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
