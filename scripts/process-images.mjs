// Pipeline de imágenes de la home (diseño §7; traspaso §4 "Imágenes").
//
//   npm run images          → regenera todas las salidas
//   npm run images:verify   → las comprueba (scripts/verify-images.mjs)
//
// Entradas:  design/source/{relieve,lamina,expediente}.png  (grises de 8 bits, 1 canal, 1536×1024)
//            public/logo.svg
// Salidas:   src/assets/images/{relieve,lamina,expediente}.jpg  (2560 px de ancho, 1 canal)
//            public/images/og/relieve-og.jpg                     (1200×630, fondo de las imágenes para redes)
//            public/logo.png                                     (512×512, fondo blanco)
//
// sharp no aplica las operaciones en el orden en que se encadenan, así que los
// niveles de `lamina` se calculan y aplican en JS sobre el buffer crudo, y solo
// después se escala y se codifica.
import { mkdir, readFile } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const OUTPUT_WIDTH = 2560
const OG_SIZE = { width: 1200, height: 630 }
const LOGO_SIZE = 512
const LOGO_VIEWBOX = 32 // viewBox="-4 -4 32 32" de public/logo.svg
const PAPER_PERCENTILE = 0.95
const JPEG_OPTIONS = { quality: 88, mozjpeg: true }

const IMAGES = [
  { name: "relieve", paperWhite: false },
  { name: "lamina", paperWhite: true },
  { name: "expediente", paperWhite: false },
]

/** Ruta absoluta a partir de la raíz del repositorio. */
const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))

async function ensureDir(file) {
  await mkdir(dirname(file), { recursive: true })
}

/** Lee una fuente como gris neutro de 1 canal: { data, info } crudos. */
async function readGray(name) {
  const { data, info } = await sharp(fromRoot(`design/source/${name}.png`))
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  if (info.channels !== 1) throw new Error(`${name}: se esperaba 1 canal y hay ${info.channels}`)
  return { data, info }
}

/** Valor por debajo del cual queda la fracción `p` de los píxeles. */
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

/** Estira los niveles para que `whitePoint` pase a 255 (el negro se queda en 0). */
function stretchToWhite(data, whitePoint) {
  const lut = new Uint8Array(256)
  for (let value = 0; value < 256; value++) {
    lut[value] = Math.min(255, Math.round((value * 255) / whitePoint))
  }
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) out[i] = lut[data[i]]
  return out
}

/** Vuelve a sharp desde el buffer crudo; la salida se mantiene en 1 canal (gris). */
function fromRaw({ data, info }) {
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 1 } }).toColourspace("b-w")
}

async function processImage({ name, paperWhite }) {
  const gray = await readGray(name)
  if (paperWhite) {
    const whitePoint = percentile(gray.data, PAPER_PERCENTILE)
    gray.data = stretchToWhite(gray.data, whitePoint)
    console.log(`${name}: percentil ${PAPER_PERCENTILE * 100} = ${whitePoint} → 255`)
  }

  const out = fromRoot(`src/assets/images/${name}.jpg`)
  await ensureDir(out)
  const info = await fromRaw(gray)
    .resize({ width: OUTPUT_WIDTH, kernel: "lanczos3" })
    .jpeg(JPEG_OPTIONS)
    .toFile(out)
  console.log(`${name}.jpg ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
  return gray
}

async function processSocialBackground(relieve) {
  const out = fromRoot("public/images/og/relieve-og.jpg")
  await ensureDir(out)
  const info = await fromRaw(relieve)
    .resize({ ...OG_SIZE, fit: "cover", position: "centre", kernel: "lanczos3" })
    .jpeg(JPEG_OPTIONS)
    .toFile(out)
  console.log(`relieve-og.jpg ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
}

async function processLogo() {
  const svg = await readFile(fromRoot("public/logo.svg"))
  const info = await sharp(svg, { density: 72 * (LOGO_SIZE / LOGO_VIEWBOX) })
    .resize(LOGO_SIZE, LOGO_SIZE)
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(fromRoot("public/logo.png"))
  console.log(`logo.png ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`)
}

const processed = {}
for (const image of IMAGES) processed[image.name] = await processImage(image)
await processSocialBackground(processed.relieve)
await processLogo()
