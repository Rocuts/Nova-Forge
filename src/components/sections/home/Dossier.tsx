import Image from "next/image"
import expediente from "@/assets/images/expediente.jpg"
import type { Locale } from "@/lib/i18n"
import { coverPlaceholder } from "@/lib/image-placeholder"
import { DossierStage } from "./DossierStage"
import type { DossierContent } from "./DossierStage"

// Ancho de la imagen = ancho del marco 3:2 de FocalCover = max(ancho del marco,
// 1,5 × su alto). Todo en rem, como la variante md: (plan §3.6): con la letra
// del navegador a 20 px, el layout y las media queries crecen a la vez.
// - md: el marco mide min(78svh, 48rem) de alto → 1,5 × 78vh = 117vh hasta
//   61,5rem de alto (donde 78vh llega a 48rem) y 1,5 × 48rem = 72rem después.
// - md desde 80rem de ancho y ≤ 37,3rem de alto: el marco (7 de las 12
//   columnas de max-w-7xl, 43,67rem ≈ 699 px) ya es más ancho que 117vh, así
//   que manda su ancho.
// - celular (aspect-[4/5] a todo el ancho): 1,5 × 1,25 = 1,875 × el ancho del
//   marco, ≈ 170vw con los márgenes.
// Aproximación aceptada: entre 48 y 80rem de ancho, en ventanas más de dos veces
// más anchas que altas (escritorio muy bajo), el marco puede superar 117vh.
const IMAGE_SIZES = [
  "(min-width: 80rem) and (max-height: 37.3rem) 43.75rem",
  "(min-width: 48rem) and (max-height: 61.5rem) 117vh",
  "(min-width: 48rem) 72rem",
  "170vw",
].join(", ")

/**
 * "Del papel al dato" — `#gobierno` / `#government` (diseño §5.4). Sección de
 * servidor: renderiza el expediente y lo pasa a la isla como `media`, con la
 * vista previa de coverPlaceholder (nunca placeholder="blur": ver
 * src/lib/image-placeholder.ts). Así next/image y la miniatura del import
 * estático no entran en el JS de la isla (presupuesto de JS, acción 5).
 * Carga diferida por defecto: la sección está bajo el pliegue.
 */
export function Dossier({ content, locale }: { content: DossierContent; locale: Locale }) {
  return (
    <DossierStage
      content={content}
      locale={locale}
      media={
        <Image
          src={expediente}
          alt={content.imageAlt}
          fill
          placeholder={coverPlaceholder(expediente)}
          sizes={IMAGE_SIZES}
          className="object-cover"
        />
      }
    />
  )
}
