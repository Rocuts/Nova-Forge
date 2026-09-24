"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { m, useMotionValue, useTransform } from "motion/react"
import relieve from "@/assets/images/relieve.jpg"
import { Button } from "@/components/ui/Button"
import { FocalCover } from "@/components/ui/FocalCover"
import { InstrumentLabel } from "@/components/ui/InstrumentLabel"
import { ScrollStage } from "@/components/ui/ScrollStage"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useStageProgress } from "@/hooks/useStageProgress"
import { trackEvent } from "@/lib/analytics"
import { coverPlaceholder } from "@/lib/image-placeholder"
import { cn } from "@/lib/utils"
import { HeroRoute } from "./HeroRoute"
import { IMAGE_HEIGHT, IMAGE_WIDTH, ROUTE_SUMMIT } from "./geometry"

interface HeroAction {
  label: string
  href: string
  analyticsEvent: string
}

export interface HomeHeroContent {
  eyebrow: string
  title: string
  description: string
  primaryAction: HeroAction
  secondaryAction: HeroAction
  nurtureCta: HeroAction
  indexItems: readonly string[]
  imageLabel: string
  scrollHint: string
}

// Encuadre (traspaso §4): la ruta de la derecha se ve también en celular. El
// 50 % de lg solo con proporción ≥ 11:10: en una pantalla de ≥ 1024 px vertical
// o casi cuadrada (iPad Pro en vertical, 1024×1366) el marco 3:2 es mucho más
// ancho que el viewport y con el 50 % la cumbre quedaba fuera (x ≈ 1199 de
// 1024). Con el 80 % de md cae en x ≈ 891. Desde 3:2, --fx no cambia nada.
const FOCAL_CLASS = "[--fx:92%] md:[--fx:80%] lg:[@media(min-aspect-ratio:11/10)]:[--fx:50%]"
// El zoom se ancla en la cumbre (83,5 % 41,1 %): el punto azul no se mueve al escalar.
const SUMMIT_ORIGIN = `${(ROUTE_SUMMIT.x / IMAGE_WIDTH) * 100}% ${(ROUTE_SUMMIT.y / IMAGE_HEIGHT) * 100}%`
// Banda vertical: la misma condición que `max-lg:portrait:` y que las media
// queries de .hero-veil y .hero-route en globals.css. En rem, como las
// variantes de Tailwind: en una media query, rem se calcula sobre la letra por
// defecto del navegador, así que con px no coincidiría con CSS si el usuario la
// agranda (ver SCRUB_QUERY en useStageProgress.ts).
const BAND_QUERY = "(width < 64rem) and (orientation: portrait)"
// El marco 3:2 mide max(100vw, 150svh): en pantallas más altas que 3:2 es más
// ancho que el viewport, y la imagen debe pedirse a ese ancho. En la banda
// vertical (73 svh de alto) mide max(100vw, 109,5svh) ≈ 110vh. La primera
// condición es BAND_QUERY: un navegador que no entienda la sintaxis de rango
// tampoco aplica la banda de CSS, y salta a la entrada siguiente (150vh).
const IMAGE_SIZES = `${BAND_QUERY} 110vh, (max-aspect-ratio: 3/2) 150vh, 100vw`
// Vista previa mientras carga, sin el SVG con desenfoque de placeholder="blur"
// (demasiado caro a este tamaño sin GPU: ver src/lib/image-placeholder.ts).
const RELIEVE_PLACEHOLDER = coverPlaceholder(relieve)
// Foco visible sobre fondo oscuro (el anillo del Button y el outline global son #0a0a0a).
const DARK_FOCUS = "focus-visible:ring-white focus-visible:ring-offset-[#0a0a0a]"
// Capas que escalan (imagen y ruta): en scrub, capa propia del compositor. Sin
// ella, cada fotograma del zoom volvía a rasterizar el relieve entero (el
// doble de raster; el hilo principal no cambia). Solo en scrub: en celular no
// hay zoom y no se reserva memoria de GPU.
const SCALED_LAYER = "absolute inset-0 stage:will-change-transform"

// scrub (traspaso §4, "Portada"): el texto sube hasta 140 px y se desvanece
// entre 0,62 y 0,95 del avance.
const TEXT_RISE = 140
const TEXT_FADE = [0.62, 0.95]
// Encabezado fijo (h-16, 4rem, + 1 px de borde) y un respiro: 4,5rem (72 px con
// la letra por defecto). En rem porque el encabezado crece con la letra del
// navegador: con 20 px mide 81 px y 72 px fijos ya no dejaban margen.
const HEADER_CLEARANCE_REM = 4.5

/**
 * Cuánto sube el texto en scrub. Con 140 px fijos, en portátiles de poca
 * altura (1366×657, 1280×720, 1024×768) el eyebrow y luego la primera línea
 * del H1 se metían bajo el encabezado con opacidad 1. Tope: la primera línea
 * (el eyebrow) no llega al encabezado antes de que empiece el fundido. A
 * 1440×900 siguen siendo 140 px. En la banda vertical no sube: saldría del
 * velo de 0,85 y taparía la cumbre. `offsetTop` ignora el transform: mide la
 * posición en reposo. Solo cambia estilos tras hidratar (con avance 0 el
 * texto no se mueve).
 *
 * `text` es el bloque que se desplaza (posicionado: es el offsetParent de su
 * contenido) y `content`, el contenedor cuyo primer hijo es la primera línea.
 */
function useTextRise(
  text: React.RefObject<HTMLElement | null>,
  content: React.RefObject<HTMLElement | null>,
  band: boolean,
) {
  const rise = useMotionValue(TEXT_RISE)

  useEffect(() => {
    const textElement = text.current
    const contentElement = content.current
    const firstLine = contentElement?.firstElementChild
    if (!textElement || !contentElement || !(firstLine instanceof HTMLElement)) return
    const measure = () => {
      if (band) {
        rise.set(0)
        return
      }
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const top = textElement.offsetTop + firstLine.offsetTop
      const room = (top - HEADER_CLEARANCE_REM * rem) / TEXT_FADE[0]
      rise.set(Math.max(0, Math.min(TEXT_RISE, room)))
    }
    // El bloque (cambia con el viewport) y cada línea: el contenido va
    // centrado en vertical, así que si una línea cambia de alto (p. ej., otro
    // corte del H1 al cargar la fuente) la primera se mueve.
    const observer = new ResizeObserver(measure)
    observer.observe(textElement)
    for (const child of Array.from(contentElement.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [text, content, rise, band])

  return rise
}

/**
 * Portada de la home (diseño §5.1). Isla cliente, pero todo su contenido (h1,
 * imagen, CTA) sale en el HTML del servidor: el primer render es `scrub` con
 * avance 0, que es el estado de reposo y no oculta nada.
 *
 * Capas, de abajo arriba: relieve → velo lateral → ruta y cumbre → velo de
 * encabezado y suelo → empalme inferior → texto y fila de índice → capa de
 * instrumento. En vertical por debajo de lg (celular, tableta) la imagen es una
 * banda de 73 svh con la cumbre a 30 svh, y el texto empieza en 36 svh, debajo
 * de ella: ahí el texto no sube con el scroll, la ruta se corta donde empieza
 * el velo del texto y su dibujo se reparte sobre el tramo que queda a la vista.
 */
export function HomeHero({ content }: { content: HomeHeroContent }) {
  const stageRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { progress, mode } = useStageProgress(stageRef)
  const scrub = mode === "scrub"
  // ¿Banda vertical? false en el servidor y al hidratar (el HTML no depende de
  // ella); tras montar sigue a BAND_QUERY (girar la tableta, redimensionar).
  const band = useMediaQuery(BAND_QUERY) === true
  const rise = useTextRise(textRef, contentRef, band)

  // scrub (traspaso §4, "Portada"): rangos sobre el avance del escenario de 160 svh
  const scrubScale = useTransform(progress, [0, 1], [1, 1.12])
  const scrubTextY = useTransform([progress, rise], ([p, r]: number[]) => -p * r)
  const scrubTextOpacity = useTransform(progress, TEXT_FADE, [1, 0])
  const scrubFade = useTransform(progress, [0.55, 1], [0, 1])

  // inView / static: sin zoom, texto quieto y visible, y sin empalme inferior
  // (el mismo estado que pinta el servidor: nada cambia al hidratar). El borde
  // inferior lo oscurece el suelo de .hero-veil.
  const settled = useMotionValue(1)
  const still = useMotionValue(0)

  const scale = scrub ? scrubScale : settled
  const textY = scrub ? scrubTextY : still
  const textOpacity = scrub ? scrubTextOpacity : settled
  const fade = scrub ? scrubFade : still
  // Texto desvanecido (fin del escenario): no recibe clics. Si uno de sus
  // enlaces recibe el foco del teclado (p. ej., Mayús+Tab desde la sección
  // siguiente), el bloque vuelve a verse y a su sitio de reposo, fuera del
  // encabezado: has-focus-visible: (WCAG 2.4.7). La fila de índice, que se
  // desvanece con él, vuelve también (peer-has-focus-visible:): si no, quedaba
  // a medio fundir bajo el texto entero. Solo cambian opacidad y transform:
  // sin CLS.
  const textPointer = useTransform(textOpacity, (value) => (value < 0.05 ? "none" : "auto"))

  return (
    // frameClassName: stage:h-auto sustituye al h-svh de ScrollStage (twMerge):
    // el marco mide al menos 100 svh y crece si el contenido no cabe (teléfono
    // apaisado, ≥ 768 × ~430). Así nada queda recortado por overflow-hidden,
    // tampoco la etiqueta "Imagen ilustrativa".
    <ScrollStage
      ref={stageRef}
      id="inicio"
      track="short"
      mode={mode}
      theme="dark"
      startsDark
      className="bg-[#0a0a0a] text-white"
      frameClassName="flex min-h-svh flex-col overflow-hidden stage:h-auto"
    >
      <div className="absolute inset-x-0 top-0 h-svh max-lg:portrait:h-[73svh] lg:h-full">
        {/* Relieve: es el LCP. Sale en el HTML del servidor y se pide con prioridad alta. */}
        <FocalCover className={FOCAL_CLASS}>
          <m.div className={SCALED_LAYER} style={{ scale, transformOrigin: SUMMIT_ORIGIN }}>
            <Image
              src={relieve}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              placeholder={RELIEVE_PLACEHOLDER}
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </m.div>
        </FocalCover>

        {/* Velos de contraste AA (globals.css): el lateral por debajo de la ruta... */}
        <div aria-hidden="true" className="hero-veil-side" />

        {/* Ruta + cumbre: mismo marco y mismo zoom que la imagen. .hero-route
            la desvanece antes de la fila de índice y, en la banda vertical,
            la corta donde empieza el velo del texto. */}
        <FocalCover className={cn(FOCAL_CLASS, "hero-route")}>
          <m.div className={SCALED_LAYER} style={{ scale, transformOrigin: SUMMIT_ORIGIN }}>
            <HeroRoute progress={progress} mode={mode} band={band} />
          </m.div>
        </FocalCover>

        {/* ...y el de encabezado y suelo por encima, para que la ruta no cruce el índice */}
        <div aria-hidden="true" className="hero-veil" />
      </div>

      {/* Empalme con la sección siguiente: crece hacia #0a0a0a al final del escenario (solo scrub) */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent"
        style={{ opacity: fade }}
      />

      <m.div
        ref={textRef}
        className="peer relative z-10 flex flex-1 flex-col has-focus-visible:pointer-events-auto! has-focus-visible:transform-none! has-focus-visible:opacity-100!"
        style={{ y: textY, opacity: textOpacity, pointerEvents: textPointer }}
      >
        <div
          ref={contentRef}
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-24 pb-8 max-lg:portrait:justify-start max-lg:portrait:pt-[36svh] landscape:short:pt-20 short:pb-6"
        >
          <InstrumentLabel as="p" className="mb-6 short:mb-4">
            <span aria-hidden="true">/0.1 · </span>
            {content.eyebrow}
          </InstrumentLabel>

          {/* text-fluid-hero con tope por altura (12svh) y 16ch: ver Decisiones de T6 */}
          <h1 className="mb-6 max-w-[16ch] text-balance font-heading text-[length:clamp(2.5rem,min(8vw,12svh),7rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white short:mb-4">
            {content.title}
          </h1>

          <p className="mb-8 max-w-2xl text-fluid-p leading-relaxed text-[#a3a3a3] short:mb-6 short:leading-normal">
            {content.description}
          </p>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Button
              size="lg"
              href={content.primaryAction.href}
              onClick={() => trackEvent(content.primaryAction.analyticsEvent)}
              className={`w-full bg-white text-[#0a0a0a] hover:bg-[#e5e5e5] sm:w-auto ${DARK_FOCUS}`}
            >
              {content.primaryAction.label}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href={content.secondaryAction.href}
              onClick={() => trackEvent(content.secondaryAction.analyticsEvent)}
              className={`w-full border-white/25 text-white hover:border-white/45 hover:bg-white/10 sm:w-auto ${DARK_FOCUS}`}
            >
              {content.secondaryAction.label}
            </Button>
          </div>

          {/* href tal cual (#gobierno / #government): ancla de esta misma página */}
          <a
            href={content.nurtureCta.href}
            onClick={() => trackEvent(content.nurtureCta.analyticsEvent)}
            className="mt-6 inline-flex items-center gap-2 self-start text-sm text-[#a3a3a3] transition-colors duration-200 hover:text-white focus-visible:outline-white short:mt-4"
          >
            <span aria-hidden="true">→</span>
            {content.nurtureCta.label}
          </a>
        </div>
      </m.div>

      {/* Fila de índice: se desvanece con el texto pero no sube, para quedarse
          sobre el suelo de .hero-veil y bajo el pie que .hero-route deja sin ruta.
          Vuelve a verse con el texto cuando uno de sus enlaces tiene el foco. */}
      <m.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 peer-has-focus-visible:opacity-100!"
        style={{ opacity: textOpacity }}
      >
        <ul className="flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-4">
          {content.indexItems.map((item, i) => (
            <li key={item}>
              <InstrumentLabel>
                <span aria-hidden="true" className="mr-2 text-white">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </InstrumentLabel>
            </li>
          ))}
        </ul>
      </m.div>

      {/* Capa de instrumento, esquinas inferiores. No se desvanece: la imagen sigue a la vista. */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 pt-3 pb-5">
        <InstrumentLabel>{content.imageLabel}</InstrumentLabel>
        <InstrumentLabel>
          <span>{content.scrollHint}</span>
          <span aria-hidden="true" className="ml-2">↓</span>
        </InstrumentLabel>
      </div>
    </ScrollStage>
  )
}
