"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { m, useInView, useMotionValueEvent } from "motion/react"
import type { UseInViewOptions } from "motion/react"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { ScrollStage } from "@/components/ui/ScrollStage"
import { useStageProgress } from "@/hooks/useStageProgress"
import { buildLocalePath } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import {
  DOSSIER_FIELD_COUNT,
  DOSSIER_STEP_MS,
  EXTRACTION_IDLE,
  extractionAt,
  extractionAtStep,
  extractionComplete,
  fieldState,
} from "./dossier-progress"
import type { Extraction, FieldState } from "./dossier-progress"
import { DOSSIER_FIELDS, IMAGE_HEIGHT, IMAGE_WIDTH, VIEWBOX } from "./geometry"

const INK = "#0a0a0a"
const BLUE = "#2563eb"
const STATES: readonly FieldState[] = ["idle", "active", "done"]

/**
 * Recuadro que envuelve los 6 campos, en % del marco 3:2 de FocalCover (el mismo
 * espacio que el viewBox, así que coincide con los recuadros del SVG): lo observa
 * el disparador del modo inView. Sale de DOSSIER_FIELDS para no repetir cifras.
 * Es un <div> y no un <rect> del SVG porque WebKit no calculaba la caja de los
 * destinos SVG en IntersectionObserver (hasta Safari 26, también en los
 * navegadores de iOS, que usan WebKit): un <rect> no se cruzaba nunca y la
 * extracción esperaba al panel, con los campos ya fuera de la vista.
 */
const FIELDS_REGION: React.CSSProperties = (() => {
  const left = Math.min(...DOSSIER_FIELDS.map((field) => field.x))
  const top = Math.min(...DOSSIER_FIELDS.map((field) => field.y))
  const right = Math.max(...DOSSIER_FIELDS.map((field) => field.x + field.width))
  const bottom = Math.max(...DOSSIER_FIELDS.map((field) => field.y + field.height))
  const percent = (value: number, total: number) => `${(value / total) * 100}%`
  return {
    left: percent(left, IMAGE_WIDTH),
    top: percent(top, IMAGE_HEIGHT),
    width: percent(right - left, IMAGE_WIDTH),
    height: percent(bottom - top, IMAGE_HEIGHT),
  }
})()

/**
 * Disparador del modo inView: la mitad central del viewport (margen −25 %
 * arriba y abajo), que no depende del alto de lo observado. `once`, como
 * Capacidades en T7: una vez disparada, la secuencia llega siempre al final.
 */
const IN_VIEW_TRIGGER: UseInViewOptions = { once: true, margin: "-25% 0px -25% 0px" }

/** Tupla de textos con la longitud de T (mapeo homomórfico: exige un parámetro de tipo). */
type NamePerItem<T extends readonly unknown[]> = { readonly [K in keyof T]: string }

/** `dict.dossier` (plan §3.2, T8). */
export interface DossierContent {
  sectionId: string
  eyebrow: string
  title: string
  description: string
  /** Un nombre por recuadro de DOSSIER_FIELDS, en su orden (tupla de la misma longitud). */
  fields: NamePerItem<typeof DOSSIER_FIELDS>
  status: { idle: string; active: string; done: string }
  counterLabel: string
  /** Lo usa la sección de servidor (Dossier.tsx) en el <Image> que llega como `media`. */
  imageAlt: string
  imageLabel: string
  links: readonly { label: string; href: string }[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

/**
 * Isla cliente de "Del papel al dato" (diseño §5.4). La imagen del expediente
 * llega ya renderizada desde el servidor (`media`, ver Dossier.tsx): así ni
 * next/image ni la miniatura del import estático viajan en el JS de la isla.
 * Aquí solo se calculan el modo y el estado de cada campo.
 */
export function DossierStage({
  content,
  locale,
  media,
}: {
  content: DossierContent
  locale: Locale
  media: React.ReactNode
}) {
  const stageRef = useRef<HTMLElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(stageRef)

  // scrub: el avance del contenedor de 250 svh decide campos terminados y activo.
  // Solo en scrub, como Capacidades: en inView y static el avance también cambia
  // al hacer scroll, y cada umbral cruzado volvía a renderizar la isla sin
  // cambiar nada visible. Al entrar en scrub se recalcula desde el avance actual,
  // que no siempre cambia con el modo.
  const [scrub, setScrub] = useState<Extraction>(EXTRACTION_IDLE)
  const onProgress = useCallback(
    (latest: number) => {
      if (mode !== "scrub") return
      const next = extractionAt(latest, DOSSIER_FIELD_COUNT)
      setScrub((prev) => (prev.done === next.done && prev.active === next.active ? prev : next))
    },
    [mode],
  )
  useMotionValueEvent(progress, "change", onProgress)
  useEffect(() => {
    if (mode !== "scrub") return
    queueMicrotask(() => onProgress(progress.get()))
  }, [mode, onProgress, progress])

  // inView: desde que la región de los campos o el panel llegan a la mitad
  // central del viewport, el primer campo al instante y otro cada 700 ms, una
  // sola vez y siempre hasta el final: al bajar a leer el panel (debajo de la
  // imagen) los campos salen de la franja, y el panel no puede quedarse a
  // medias con una fila «Procesando» fija. La región de los campos y no el
  // marco: en celular apaisado el marco mide más del doble del viewport y su
  // borde superior entraba en la franja con los campos aún bajo la pantalla.
  // El panel, por si se llega a él sin pasar por los campos (un salto, buscar
  // en la página).
  const fieldsInView = useInView(fieldsRef, IN_VIEW_TRIGGER)
  const panelInView = useInView(panelRef, IN_VIEW_TRIGGER)
  const started = fieldsInView || panelInView
  const [step, setStep] = useState(-1)
  const stepRef = useRef(-1)
  useEffect(() => {
    if (mode !== "inView" || !started || stepRef.current >= DOSSIER_FIELD_COUNT) return
    const advance = () => {
      stepRef.current = Math.min(stepRef.current + 1, DOSSIER_FIELD_COUNT)
      setStep(stepRef.current)
      if (stepRef.current >= DOSSIER_FIELD_COUNT) window.clearInterval(timer)
    }
    // El primer campo se enciende al dispararse, no un paso después: bajando
    // sin parar, en 700 ms los campos ya habían pasado bajo el encabezado (en
    // celular apaisado) y la extracción, con el único azul, ocurría fuera de la
    // vista. Con setTimeout y no un setState síncrono en el efecto.
    const first = stepRef.current < 0 ? window.setTimeout(advance, 0) : undefined
    const timer = window.setInterval(advance, DOSSIER_STEP_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [mode, started])

  const extraction =
    mode === "static"
      ? extractionComplete(DOSSIER_FIELD_COUNT)
      : mode === "inView"
        ? extractionAtStep(step, DOSSIER_FIELD_COUNT)
        : scrub
  const fadeDuration = mode === "static" ? 0 : 0.2

  return (
    <ScrollStage
      ref={stageRef}
      id={content.sectionId}
      track="long"
      mode={mode}
      theme="dark"
      className="bg-[#0a0a0a] text-white"
      // stage:h-auto + stage:min-h-svh (twMerge sustituye el h-svh de ScrollStage):
      // si el contenido no cabe en el viewport, el marco crece en lugar de recortarlo.
      frameClassName="stage:flex stage:items-center stage:h-auto stage:min-h-svh"
    >
      {/* Compactación en scrub con dos variantes locales (globals.css). Con
          `dossier-compact:`, hasta 48rem de alto (la `short:` compartida de la
          portada llega a 45rem; a 1024×768 el pie del panel quedaba bajo el
          borde de la pantalla) y, en la franja md estrecha (hasta 56rem de
          ancho), hasta 54rem. Con `dossier-narrow:`, en esa franja, el h2 en
          text-3xl y el panel a 10 px: ahí la columna del texto y del panel mide
          272–325 px, los nombres y «Campos extraídos» se partían en dos líneas,
          y el marco fijo, más alto que la pantalla, dejaba hasta tres filas
          (también la que se procesa) bajo el borde durante todo el recorrido. */}
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32 stage:pb-10 stage:pt-24 dossier-compact:stage:pb-6 dossier-compact:stage:pt-20">
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-12 md:gap-y-8 dossier-compact:stage:gap-y-5">
          <div className="md:col-span-5 md:col-start-1 md:row-start-1 md:self-end">
            <InstrumentLabel as="p">{content.eyebrow}</InstrumentLabel>
            <h2 className="mt-5 text-balance font-heading text-4xl font-bold tracking-tight text-white lg:text-5xl dossier-compact:stage:mt-3 dossier-compact:stage:text-4xl dossier-narrow:stage:text-3xl">
              {content.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#a3a3a3] dossier-compact:stage:mt-3 dossier-compact:stage:text-sm">{content.description}</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 dossier-compact:stage:mt-4">
              {content.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={buildLocalePath(locale, link.href)}
                    // Anillo blanco: el global (colors.accent = #0a0a0a) no se ve
                    // sobre esta sección oscura (WCAG 2.4.7; como en HomeHero).
                    className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 hover:text-[#a3a3a3] focus-visible:outline-white"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* En celular: texto, imagen y panel, en ese orden. En md la imagen ocupa la derecha. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:aspect-auto md:h-[min(78svh,48rem)] md:self-center">
            <FocalCover className="[--fx:10%]">
              {/* Fragment propio: `media` es un elemento del servidor (RSC) y,
                  suelto junto al <svg>, React avisaba en desarrollo de un hijo
                  de lista sin key. Dentro del Fragment es hijo único. */}
              <>{media}</>
              <svg
                viewBox={VIEWBOX}
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
              >
                {DOSSIER_FIELDS.map((field, i) => {
                  const state = fieldState(i, extraction)
                  return (
                    <m.rect
                      key={`field-${i}`}
                      data-dossier-field=""
                      data-state={state}
                      x={field.x}
                      y={field.y}
                      width={field.width}
                      height={field.height}
                      fill="none"
                      stroke={state === "active" ? BLUE : INK}
                      strokeWidth={state === "active" ? 3 : 1}
                      vectorEffect="non-scaling-stroke"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: state === "idle" ? 0 : 1 }}
                      transition={{ duration: fadeDuration }}
                    />
                  )
                })}
              </svg>
              {/* Sin pintar: solo lo observa el disparador de inView (FIELDS_REGION). */}
              <div
                ref={fieldsRef}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={FIELDS_REGION}
              />
            </FocalCover>
            {/* Funde la mesa con #0a0a0a en los bordes, sin cortes visibles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#0a0a0a_0%,transparent_12%,transparent_88%,#0a0a0a_100%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_0%,transparent_8%,transparent_92%,#0a0a0a_100%)]"
            />
            <InstrumentLabel className="absolute bottom-3 left-3 bg-[#0a0a0a] px-2 py-1">
              {content.imageLabel}
            </InstrumentLabel>
          </div>

          <div
            ref={panelRef}
            className="rounded-[6px] border border-[#1a1a1a] bg-[#141414] p-5 md:col-span-5 md:col-start-1 md:row-start-2 md:self-start md:p-6 dossier-compact:stage:p-4"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-[#1a1a1a] pb-3">
              <InstrumentLabel className="dossier-narrow:stage:text-[10px]">{content.counterLabel}</InstrumentLabel>
              {/* Capa de instrumento, como el contador de Capacidades (diseño §4:
                  #a3a3a3 sobre oscuro). Siempre en una línea (§3.4: «0N / 06»);
                  si falta sitio, se parte la etiqueta. */}
              <InstrumentLabel className="shrink-0 whitespace-nowrap dossier-narrow:stage:text-[10px]">
                <span data-dossier-counter="">{`${pad(extraction.done)} / ${pad(DOSSIER_FIELD_COUNT)}`}</span>
              </InstrumentLabel>
            </div>
            <ol className="mt-1">
              {content.fields.map((name, i) => {
                const state = fieldState(i, extraction)
                const tone = state === "idle" ? "text-[#a3a3a3]" : "text-white"
                return (
                  <li
                    key={name}
                    data-dossier-row=""
                    data-state={state}
                    className={`-mx-2 flex items-center justify-between gap-4 border-b border-[#1a1a1a] px-2 py-2 dossier-compact:stage:py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] dossier-narrow:stage:text-[10px] dossier-narrow:stage:tracking-[0.1em] last:border-b-0 ${state === "active" ? "bg-[#1a1a1a]" : ""}`}
                  >
                    <span className={`min-w-0 break-words ${tone}`}>{name}</span>
                    {/* Columna de estado con el ancho del texto más largo: las tres
                        etiquetas se apilan en la misma celda y solo se ve la actual.
                        Así el nombre dispone siempre del mismo ancho y la fila no
                        cambia de alto al avanzar la extracción (sin saltos del
                        bloque centrado en tabletas, donde el panel es estrecho).
                        `invisible` también las saca del árbol de accesibilidad; sin
                        JavaScript, globals.css muestra «Extraído» (estado final). */}
                    <span className="grid shrink-0 justify-items-end whitespace-nowrap">
                      {STATES.map((option) => (
                        <span
                          key={option}
                          data-dossier-status={option}
                          className={`col-start-1 row-start-1 ${option === state ? tone : "invisible"}`}
                        >
                          {content.status[option]}
                        </span>
                      ))}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </ScrollStage>
  )
}
