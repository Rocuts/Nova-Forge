#!/usr/bin/env node
// Guardia de sintaxis moderna tras `next build` (Turbopack + browserslist, vercel/next.js#92091).
// Si browserslist resuelve a versiones que Turbopack no conoce, SWC transpila TODO a ES5 sin avisar
// (+23,6 KB de JS en /es). En ES5 no queda ningún `let`/`class` propio; en moderno hay miles.
//   node scripts/check-modern-js.mjs [dir=.next/static/chunks]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
const dir = process.argv[2] ?? '.next/static/chunks'
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = path.join(d, f)
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []
})
let lets = 0, classes = 0
for (const f of walk(dir)) {
  const s = readFileSync(f, 'utf8')
  lets += (s.match(/\blet /g) ?? []).length
  classes += (s.match(/\bclass [A-Za-z_$]/g) ?? []).length
}
const ok = lets >= 500 && classes >= 20
console.log(`${ok ? 'OK' : 'FALLO'}: let=${lets} class=${classes} en ${dir}`)
if (!ok) {
  console.error('La salida parece ES5: revisa "browserslist" en package.json (usa versiones fijas, p. ej. chrome 111 / edge 111 / firefox 111 / safari 16.4, o quita el campo).')
  process.exit(1)
}
