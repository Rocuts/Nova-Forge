/**
 * Banda vertical de la portada: por debajo de lg y en vertical (celular,
 * tableta), la imagen es una banda de 73 svh y el texto empieza bajo la cumbre.
 * La misma condición que `max-lg:portrait:` y que las media queries de
 * .hero-veil y .hero-route en globals.css. En rem, como las variantes de
 * Tailwind: en una media query, rem se calcula sobre la letra por defecto del
 * navegador, así que con px no coincidiría con CSS si el usuario la agranda
 * (ver SCRUB_QUERY en useStageProgress.ts).
 *
 * Módulo aparte, sin directiva ni dependencias: lo leen la isla (HomeHero, con
 * useMediaQuery) y el servidor (hero-media.tsx, en el `sizes` de la imagen).
 */
export const BAND_QUERY = "(width < 64rem) and (orientation: portrait)"
