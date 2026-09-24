import Image from "next/image"
import lamina from "@/assets/images/lamina.jpg"
import { coverPlaceholder } from "@/lib/image-placeholder"

// Ancho del marco 3:2 de FocalCover dentro de la lámina de CapabilitiesIndex:
// max(ancho, 1,5 × alto) de la caja. Media queries en rem, como las variantes de
// Tailwind con las que coinciden (plan §3.6).
// - Desde md la caja ocupa todo el ancho de su columna, 5 de 12 (w-full):
//   col = 5/12 · min(100vw, 80rem) − 3rem, y su alto es min(4/3 · col,
//   100svh − 8rem) (aspect 3:4 con su max-h; nunca más estrecha). El marco mide
//   min(2 · col, max(col, 1,5 · (100svh − 8rem))): 2 · col si cabe entera en
//   alto (≈ 972px a 1440×900) y menos en pantallas bajas (≈ 393px a 844×390 y
//   ≈ 794px a 1366×657, frente a los 641px y 972px que daba el 76vw/972px de
//   antes: una imagen 1,5–2 veces mayor de lo necesario en celular apaisado).
//   En `sizes` va redondeado hacia arriba (cota superior) y con 150vh, que es ≥
//   150svh.
// - En celular es 4:5 a lo ancho: 1,875 × (100vw − 3rem).
// Tras cada valor exacto va otro sencillo por si un navegador no entendiera
// min()/max() o calc() en `sizes` (se salta la entrada y usa la siguiente).
const LAMINA_SIZES = [
  "(min-width: 48rem) min(min(83.34vw, 66.67rem) - 6rem, max(min(41.67vw, 33.34rem) - 3rem, 150vh - 12rem))",
  "(min-width: 80rem) 972px",
  "(min-width: 48rem) 76vw",
  "calc(187.5vw - 5.625rem)",
  "188vw",
].join(", ")

/**
 * Imagen de la lámina de Capacidades. Sin directiva: se renderiza en el
 * servidor y llega a la isla CapabilitiesIndex como prop `media`, para que ni
 * `next/image` ni la vista previa del import estático viajen en su JavaScript
 * (docs/superpowers/research/2026-09-24-presupuesto-js.md §5, T7). Carga
 * perezosa (la de `next/image` por defecto): está bajo el pliegue. Vista
 * previa con `coverPlaceholder`, nunca `placeholder="blur"` (decisión 12 de T6).
 * Decorativa (`alt=""`): la red de nodos es una superposición `aria-hidden` y
 * la lista de capacidades lleva el contenido.
 */
export function CapabilitiesMedia() {
  return (
    <Image
      src={lamina}
      alt=""
      fill
      sizes={LAMINA_SIZES}
      placeholder={coverPlaceholder(lamina)}
      className="object-cover"
    />
  )
}
