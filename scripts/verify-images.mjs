// Prueba del pipeline de imágenes: `npm run images:verify`.
// Comprueba fuentes y salidas de scripts/process-images.mjs (diseño §7; traspaso §4).
// Sale con código 1 y la lista de fallos si algo no cuadra.
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))

const SOURCE = { width: 1536, height: 1024, channels: 1, format: "png" }
const PROCESSED = { width: 2560, height: 1707, channels: 1, format: "jpeg" }

const EXPECTED = [
  { path: "design/source/relieve.png", ...SOURCE },
  { path: "design/source/lamina.png", ...SOURCE },
  { path: "design/source/expediente.png", ...SOURCE },
  { path: "design/source/arquitectura.png", ...SOURCE },
  { path: "src/assets/images/relieve.jpg", ...PROCESSED },
  { path: "src/assets/images/lamina.jpg", ...PROCESSED, paperWhite: "design/source/lamina.png" },
  { path: "src/assets/images/expediente.jpg", ...PROCESSED },
  { path: "public/images/og/relieve-og.jpg", width: 1200, height: 630, channels: 1, format: "jpeg" },
  { path: "public/logo.png", width: 512, height: 512, format: "png", whiteCorner: true },
]

const failures = []
const fail = (path, message) => failures.push(`${path}: ${message}`)

/** Valor por debajo del cual queda la fracción `p` de los píxeles (imagen de 1 canal). */
function percentile(data, p) {
  const histogram = new Uint32Array(256)
  for (const value of data) histogram[value]++
  const target = Math.ceil(data.length * p)
  let seen = 0
  for (let value = 0; value < 256; value++) {
    seen += histogram[value]
    if (seen >= target) return value
  }
  return 255
}

/** Proporción de píxeles que cumplen `test`. */
function share(data, test) {
  let count = 0
  for (const value of data) if (test(value)) count++
  return count / data.length
}

if (existsSync(fromRoot("design/moodboard"))) {
  fail("design/moodboard", "debe moverse a design/source (ya no debe existir)")
}

for (const expected of EXPECTED) {
  const file = fromRoot(expected.path)
  if (!existsSync(file)) {
    fail(expected.path, "no existe")
    continue
  }
  const meta = await sharp(file).metadata()
  if (meta.format !== expected.format) fail(expected.path, `formato ${meta.format}, se esperaba ${expected.format}`)
  if (meta.width !== expected.width || meta.height !== expected.height) {
    fail(expected.path, `mide ${meta.width}×${meta.height}, se esperaba ${expected.width}×${expected.height}`)
  }
  if (expected.channels !== undefined && meta.channels !== expected.channels) {
    fail(expected.path, `${meta.channels} canales, se esperaba ${expected.channels} (gris neutro)`)
  }
  if (expected.channels === 1 && meta.depth !== "uchar") fail(expected.path, `profundidad ${meta.depth}, se esperaban 8 bits`)

  if (expected.paperWhite) {
    // Papel #ffffff: todo lo que en la fuente está en el percentil 95 o por encima
    // (el papel, 252–254) tiene que salir blanco puro. Sin el estiramiento de
    // niveles, la salida tiene bastantes menos píxeles a 255 que esa proporción.
    const source = await sharp(fromRoot(expected.paperWhite)).raw().toBuffer()
    const whitePoint = percentile(source, 0.95)
    const paperShare = share(source, (value) => value >= whitePoint)
    const output = await sharp(file).raw().toBuffer()
    const whiteShare = share(output, (value) => value === 255)
    if (whiteShare < paperShare) {
      fail(
        expected.path,
        `el papel no es #ffffff: ${(whiteShare * 100).toFixed(1)} % de píxeles a 255, se esperaba ≥ ${(paperShare * 100).toFixed(1)} %`,
      )
    }
  }

  if (expected.whiteCorner) {
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
    if (meta.hasAlpha) fail(expected.path, "tiene canal alfa; el fondo debe ser blanco opaco")
    const corner = Array.from(data.subarray(0, info.channels))
    if (corner.some((value) => value !== 255)) fail(expected.path, `la esquina no es blanca: ${corner.join(",")}`)
    const { channels } = await sharp(file).stats()
    if (channels[0].min > 16) fail(expected.path, `no hay trazo oscuro (#0a0a0a): mínimo ${channels[0].min}`)
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} fallo(s) en las imágenes:\n  - ${failures.join("\n  - ")}`)
  process.exit(1)
}
console.log(`✓ ${EXPECTED.length} imágenes verificadas`)
