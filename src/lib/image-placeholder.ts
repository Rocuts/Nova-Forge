import type { ImageProps, StaticImageData } from "next/image"

/**
 * Vista previa de `next/image` para imágenes grandes (las de `FocalCover`): la
 * miniatura del import estático (`blurDataURL`, 8 px de ancho) como fondo, que
 * el navegador escala y suaviza.
 *
 * Sustituye a `placeholder="blur"`: Next envuelve esa miniatura en un SVG con
 * dos `feGaussianBlur` que se pintan al tamaño del marco (hasta 2560 × 1707 px
 * en la portada), y sin GPU eso bloqueaba el hilo principal varios segundos
 * por fotograma. Medido en Chromium headless a 2560 × 1080: la portada tardaba
 * 17–25 s en hidratar con "blur" y ~1 s con esta vista previa.
 *
 * Si la miniatura no es un data URL (p. ej. `next dev` con webpack), no hay
 * vista previa: el fondo de la sección hace de reposo.
 */
export function coverPlaceholder(image: StaticImageData): NonNullable<ImageProps["placeholder"]> {
  const url = image.blurDataURL
  return url?.startsWith("data:image/") ? (url as `data:image/${string}`) : "empty"
}
