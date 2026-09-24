import Image from "next/image"
import relieve from "@/assets/images/relieve.jpg"
import { coverPlaceholder } from "@/lib/image-placeholder"
import { BAND_QUERY } from "./hero-band"

// El marco 3:2 mide max(100vw, 150svh): en pantallas más altas que 3:2 es más
// ancho que el viewport, y la imagen debe pedirse a ese ancho. En la banda
// vertical (73 svh de alto) mide max(100vw, 109,5svh) ≈ 110vh. La primera
// condición es BAND_QUERY: un navegador que no entienda la sintaxis de rango
// tampoco aplica la banda de CSS, y salta a la entrada siguiente (150vh).
const IMAGE_SIZES = `${BAND_QUERY} 110vh, (max-aspect-ratio: 3/2) 150vh, 100vw`

/**
 * Relieve de la portada, renderizado en el servidor y pasado a HomeHero como
 * slot (`media`), que lo pinta dentro de su capa con zoom. Así el import
 * estático (con su blurDataURL) y la vista previa viajan en el HTML y no en el
 * JS de la isla (plan §3.8: imágenes siempre como slot desde el servidor).
 * Sin directiva y sin hooks: no lo importes desde un módulo "use client", o la
 * imagen volvería al JS del cliente.
 *
 * Sale en el HTML del servidor y se pide con prioridad alta: es el LCP en la
 * banda vertical (celular). En escritorio ocupa todo el viewport, Chrome no la
 * toma como candidata y el LCP es el h1 (medido a 1440×900 y 390×844 con DPR 3).
 * Vista previa con coverPlaceholder, nunca placeholder="blur" (demasiado caro a
 * este tamaño sin GPU: ver src/lib/image-placeholder.ts).
 */
export function HeroMedia() {
  return (
    <Image
      src={relieve}
      alt=""
      fill
      sizes={IMAGE_SIZES}
      placeholder={coverPlaceholder(relieve)}
      loading="eager"
      fetchPriority="high"
      className="object-cover"
    />
  )
}
