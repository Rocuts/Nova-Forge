#!/usr/bin/env node
// Mide los bytes de JS TRANSFERIDOS (comprimidos, encodedDataLength de CDP) al cargar
// una URL, con el mismo método que la línea base del plan (§0 / scripts/measure-home.mjs):
// Chromium de @playwright/test, contexto nuevo por ejecución, caché desactivada por CDP,
// goto con waitUntil "networkidle" + 1,5 s, y se suman las respuestas de tipo Script
// (o mime javascript). Informa cada ejecución, la mediana y los archivos con sus bytes.
//
//   node scripts/agent/measure-js.mjs --url http://localhost:3121/es \
//        [--runs 3] [--viewport 1440x900] [--root /ruta/al/worktree] [--out r.json] \
//        [--budget 269722] [--scroll]
//
// --root: carpeta cuyo node_modules resuelve @playwright/test (por defecto, el cwd).
// --scroll: tras la carga, recorre la página hasta el final (para ver chunks diferidos);
//           NO es el método de la línea base; se informa aparte en "afterScroll".
import { createRequire } from 'node:module'
import { writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const url = option('url', 'http://localhost:3121/es')
const runs = Number(option('runs', '3'))
const [vw, vh] = option('viewport', '1440x900').split('x').map(Number)
const root = path.resolve(option('root', process.cwd()))
const out = option('out', null)
const budget = option('budget', null)
const doScroll = flag('scroll')

const pkg = path.join(root, 'package.json')
if (!existsSync(pkg)) {
  console.error(`measure-js: no hay package.json en --root ${root}`)
  process.exit(2)
}
const require = createRequire(pkg)
const { chromium } = require('@playwright/test')

const shortName = (u) => {
  try {
    const { pathname, host } = new URL(u)
    return host.startsWith('localhost') || host.startsWith('127.0.0.1') ? pathname : `${host}${pathname}`
  } catch {
    return u
  }
}

async function measureOnce() {
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

    const responses = new Map()
    const sizes = new Map()
    let phase = 'load'
    cdp.on('Network.responseReceived', (e) =>
      responses.set(e.requestId, {
        url: e.response.url,
        type: e.type,
        mime: e.response.mimeType,
        status: e.response.status,
        encoding: (e.response.headers['content-encoding'] || e.response.headers['Content-Encoding'] || ''),
        phase,
      }),
    )
    cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength))

    await page.goto(url, { waitUntil: 'networkidle', timeout: 180_000 })
    await page.waitForTimeout(1500)

    const collect = (which) => {
      const files = []
      for (const [id, r] of responses) {
        if (which && r.phase !== which) continue
        if (!(r.type === 'Script' || /javascript/.test(r.mime))) continue
        files.push({ file: shortName(r.url), bytes: sizes.get(id) ?? 0, status: r.status, encoding: r.encoding, mime: r.mime })
      }
      files.sort((a, b) => b.bytes - a.bytes)
      return { total: files.reduce((s, f) => s + f.bytes, 0), count: files.length, files }
    }
    const load = collect('load')

    let afterScroll = null
    if (doScroll) {
      phase = 'scroll'
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6)
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' })
          await new Promise((r) => setTimeout(r, 120))
        }
      })
      await page.waitForLoadState('networkidle').catch(() => {})
      await page.waitForTimeout(1000)
      afterScroll = collect('scroll')
    }
    return { ...load, afterScroll }
  } finally {
    await browser.close()
  }
}

const results = []
for (let i = 0; i < runs; i++) results.push(await measureOnce())
const sortedIdx = results.map((r, i) => [r.total, i]).sort((a, b) => a[0] - b[0])
const medianRun = results[sortedIdx[Math.floor(sortedIdx.length / 2)][1]]

const report = {
  url,
  viewport: `${vw}x${vh}`,
  method: 'CDP encodedDataLength (transferido, cabeceras incluidas), cache off, networkidle + 1500 ms, type Script | mime javascript',
  runs: results.map((r) => r.total),
  median: medianRun.total,
  scripts: medianRun.count,
  ...(budget ? { budget: Number(budget), margin: Number(budget) - medianRun.total } : {}),
  files: medianRun.files,
  ...(doScroll ? { afterScroll: medianRun.afterScroll } : {}),
}
if (out) writeFileSync(out, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
