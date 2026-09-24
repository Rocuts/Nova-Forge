#!/usr/bin/env node
// Guardia de sintaxis moderna tras `next build` (Turbopack + browserslist, vercel/next.js#92091).
// Si browserslist resuelve a versiones que Turbopack no conoce, SWC transpila TODO a ES5 sin avisar
// (+23,6 KB de JS en /es). En ES5 no queda ningún `let`/`class` propio; en moderno hay miles.
// Corre solo al final de `npm run build` (script `postbuild`), en local, CI y Vercel; a mano:
//   npm run check:modern-js [-- <dir>]    (por defecto, .next/static/chunks en la raíz del repo)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dir = process.argv[2] ?? fileURLToPath(new URL("../.next/static/chunks", import.meta.url))
if (!existsSync(dir)) {
  console.error(`FALLO: no hay build en ${dir}: ejecuta npm run build`)
  process.exit(1)
}

const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = path.join(d, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".js") ? [p] : []
  })

let lets = 0
let classes = 0
for (const f of walk(dir)) {
  const s = readFileSync(f, "utf8")
  lets += (s.match(/\blet /g) ?? []).length
  classes += (s.match(/\bclass [A-Za-z_$]/g) ?? []).length
}
const ok = lets >= 500 && classes >= 20
console.log(`${ok ? "OK" : "FALLO"}: let=${lets} class=${classes} en ${dir}`)
if (!ok) {
  console.error(
    'La salida parece ES5: revisa "browserslist" en package.json (usa versiones fijas, p. ej. chrome 111 / edge 111 / firefox 111 / safari 16.4, o quita el campo).',
  )
  process.exit(1)
}
