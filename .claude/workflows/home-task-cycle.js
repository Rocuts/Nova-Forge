export const meta = {
  name: 'home-task-cycle',
  description: 'Implement plan tasks in worktrees (test-first), independent multi-lens review + fix loop, then serial squash integration into the target branch',
  whenToUse: 'Ejecutar tareas de un plan (docs/superpowers/plans/…) con implementador en worktree, revisores independientes (cumplimiento, calidad, visual), corrector en bucle hasta 0 hallazgos mayores e integración en serie con e2e completo. Args: ver cabecera del script.',
  phases: [
    { title: 'Implement', detail: 'one implementer per task, own worktree + port' },
    { title: 'Review', detail: 'compliance + quality reviewers in parallel, own worktrees' },
    { title: 'Fix', detail: 'fixer addresses findings; loop until no blocker/major' },
    { title: 'Integrate', detail: 'serial squash-merge, lint, tsc, full e2e, commit, push' },
  ],
}

// ── Argumentos ──────────────────────────────────────────────────────────────
// {
//   repo:      ruta del checkout principal            (por defecto ${REPO})
//   wtRoot:    carpeta de los worktrees               (por defecto <repo>/../wt)
//   agentBin:  scripts de agente (heavy, portfree…)    (por defecto <repo>/scripts/agent)
//   branch:    rama de integración                    (por defecto ${BRANCH})
//   base:      desde dónde se crean los worktrees     (por defecto = branch)
//   integrate: true = integra en serie en el orden de tasks; false = solo implementar+revisar
//   maxRounds: rondas máximas de revisión (5)
//   machineNote: nota de capacidad (p. ej. "Mac M5 Pro, HEAVY_SLOTS=3")
//   attribution: líneas de atribución de los commits (si falta: las que indique el entorno)
//   tasks: [{ id, title, lines: "a-b" (sección del plan), port, build, integBuild, visual,
//             visualHint, lenses: ["compliance","quality","visual"], extra, impl? (retomar) }]
// }
// Nota: un revisor o corrector que no responde (p. ej. límite de uso) deja la tarea SIN
// integrar (ok=false). Para retomar, pasa en tasks[i].impl el resultado del implementador.
const A = args
const REPO = A.repo || '/home/user/Nova-Forge'
const WT = A.wtRoot || (REPO.replace(/\/[^/]+$/, '') + '/wt')
const BIN = A.agentBin || (REPO + '/scripts/agent')
const BRANCH = A.branch || 'redesign/home'
A.base = A.base || BRANCH
const ATTR = A.attribution || 'las líneas de atribución que indique tu entorno (system-reminder de la sesión); si no hay ninguna, omítelas'
const MAX_ROUNDS = A.maxRounds || 5
const PLAN = 'docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md'
const DESIGN = 'docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md'
const HANDOFF = 'docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md'

const COMMON = `
## Contexto común (repo ${REPO}, rama de integración \`${BRANCH}\`)
- Checkout principal: ${REPO} en la rama \`${BRANCH}\` (NO lo toques salvo que seas el INTEGRADOR). Worktrees en ${WT}/.
- Documentos: diseño aprobado \`${DESIGN}\` (el contrato); traspaso \`${HANDOFF}\` (lee primero sus secciones de estado más recientes; donde ajusta el diseño, manda el traspaso); plan \`${PLAN}\` — sus secciones §0–§4 (protocolo, grafo, contrato compartido §3) son VINCULANTES, y luego la sección de tu tarea. Léelos desde tu worktree.
- Next 16.3: antes de usar cualquier API de Next consulta \`node_modules/next/dist/docs/\`. \`test.use({ reducedMotion })\` no compila en Playwright 1.58: usar \`contextOptions: { reducedMotion }\`.
- **Carga pesada${A.machineNote ? ' (' + A.machineNote + ')' : ''}:** TODA ejecución de Playwright (\`npx playwright test …\`) y todo \`next dev\` que arranques para capturas va envuelto así: \`${BIN}/heavy.sh <orden>\`. \`npm run build\` y las mediciones de rendimiento van con \`${BIN}/heavy.sh --exclusive <orden>\` (nunca un build en paralelo con e2e). Antes de cada ejecución comprueba el puerto con \`${BIN}/portfree.sh <PUERTO>\`: si dice BUSY, NO reutilices el servidor de otro (\`reuseExistingServer\` lo haría): averigua si es tuyo y ciérralo, o espera. Usa siempre tu PORT asignado: \`PORT=<p> ${BIN}/heavy.sh npx playwright test …\`. Da a la herramienta Bash timeout 600000 para suites completas.
- Worktrees: créalos con \`${BIN}/new-worktree.sh <repo> <ruta> <rama|--detach> <base>\` (clona node_modules y genera next-env.d.ts). NUNCA \`npm install\` dentro de un worktree. Para tocar el lockfile: \`npx -y npm@11 install … --package-lock-only\`. Navegador de Playwright: en macOS, si falta, \`npx playwright install chromium\`; en el contenedor de Claude Code on the web nunca (ver traspaso §7).
- Peso de JS: mide con \`node ${BIN}/measure-js.mjs --url http://localhost:<p>/es --runs 3 --viewport 1440x900 --root <worktree> --budget 269722\` contra \`next start\` (bajo heavy --exclusive), y tras cada build comprueba \`npm run check:modern-js\` si existe.
- Tailwind v4 escanea también los .md: no escribas clases con valores elididos (p. ej. puntos suspensivos dentro de corchetes) en NINGÚN archivo.
- \`next dev\` reescribe el bloque nextjs-agent-rules de AGENTS.md: \`git checkout AGENTS.md\` antes de cada commit.
- Pruebas: nunca desactivar, saltar, marcar fixme ni debilitar una prueba. Una prueba intermitente se repite UNA vez solo para confirmarlo, y se anota.
- CLAUDE.md (ya lo tienes inyectado) manda: honestidad (sin alianzas con AWS/Google/Azure/OpenAI/TikTok), reglas de RealTy (lenguaje, nombre, estados), disclaimer de Live Studio, Geist, sin Lenis. Identidad monocroma; el azul #2563eb solo marca "lo que el sistema está procesando ahora" y nunca hay más de un elemento azul visible a la vez. No generes imágenes: solo las de design/source/.
- Ambigüedades: decide con el diseño y el traspaso como guía y anota la decisión y su porqué (en español). Si algo necesita credenciales, dominio o servicio externo: sáltalo, anótalo, sigue.
- Commits: formato del plan §1.4 en español. Atribución: ${ATTR}. (Sustituyen al Claude-Session antiguo que aparece en las plantillas del plan.)
- Nadie hace push salvo el INTEGRADOR, y solo a \`${BRANCH}\`. Nunca merge a main.
- Escribe decisiones, hallazgos y notas en español.
`

const IMPL_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'blocked'] },
    base_commit: { type: 'string', description: 'commit de la rama de integración desde el que se creó el worktree' },
    head_commit: { type: 'string' },
    red_test_evidence: { type: 'string', description: 'qué falló al correr la prueba antes de implementar, y por qué era el fallo esperado' },
    verification: { type: 'string', description: 'resultados de lint, tsc, spec de la tarea y suite completa, con cifras' },
    decisions: { type: 'array', items: { type: 'string' } },
    deviations: { type: 'array', items: { type: 'string' }, description: 'desviaciones del plan/diseño y por qué' },
    notes: { type: 'string' },
  },
  required: ['status', 'base_commit', 'head_commit', 'verification', 'decisions'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['approve', 'changes'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor', 'nit'] },
          file: { type: 'string' },
          line: { type: 'integer' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          suggested_fix: { type: 'string' },
        },
        required: ['severity', 'issue'],
      },
    },
    checked: { type: 'string', description: 'qué comprobaste (archivos, pruebas, capturas)' },
  },
  required: ['verdict', 'findings', 'checked'],
}
const FIX_SCHEMA = {
  type: 'object',
  properties: {
    head_commit: { type: 'string' },
    fixed: { type: 'array', items: { type: 'object', properties: { finding: { type: 'string' }, how: { type: 'string' } }, required: ['finding', 'how'] } },
    rejected: { type: 'array', items: { type: 'object', properties: { finding: { type: 'string' }, reason: { type: 'string' } }, required: ['finding', 'reason'] } },
    verification: { type: 'string' },
    decisions: { type: 'array', items: { type: 'string' } },
    worktree_clean: { type: 'boolean' },
  },
  required: ['head_commit', 'fixed', 'rejected', 'verification', 'worktree_clean'],
}
const INTEG_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    commit: { type: 'string' },
    pushed: { type: 'boolean' },
    lint: { type: 'string' },
    tsc: { type: 'string' },
    e2e: { type: 'string', description: 'p. ej. "78 passed"' },
    flaky: { type: 'array', items: { type: 'string' } },
    conflicts: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['ok', 'commit', 'pushed', 'e2e'],
}

function taskHeader(t) {
  return `Tarea ${t.id} — ${t.title}. Sección del plan: líneas ${t.lines} de ${PLAN}. Worktree del implementador: ${WT}/task${t.id} (rama wt/task${t.id}), PORT=${t.port}.`
}

function implPrompt(t) {
  return `Eres el IMPLEMENTADOR de la ${taskHeader(t)}
${COMMON}
## Qué haces
1. Crea el worktree desde la punta de \`${A.base}\` (si ya existe ${WT}/task${t.id} o la rama wt/task${t.id} de un intento anterior, inspecciona y elimínalos primero):
   ${BIN}/new-worktree.sh ${REPO} ${WT}/task${t.id} wt/task${t.id} ${A.base}
   Anota el commit base (git -C ${WT}/task${t.id} rev-parse HEAD).
2. Lee el plan §0–§4 completo y TODA la sección de tu tarea (líneas ${t.lines}), más las partes relevantes del diseño y del traspaso. Lee el código actual que vas a tocar.
3. Paso 1 del plan — prueba primero: escribe la prueba, ejecútala y COMPRUEBA EL FALLO ESPERADO (anota qué falló y por qué era lo esperado).
4. Paso 2 — implementa. Si un bloque "Antes" del plan no casa exacto con el código vigente, aplica el cambio equivalente sobre el código actual sin tocar lo demás. El plan trae código completo: úsalo, pero corrige cualquier error real que encuentres (y anótalo como decisión).
5. Paso 3 — verificación completa del plan (lint, tsc, spec de la tarea, comprobaciones grep, suite completa con PORT=${t.port} bajo heavy${t.build ? ', y `' + BIN + '/heavy.sh --exclusive npm run build`' : ''}). Todo en verde.
6. Commit(s) en wt/task${t.id} (sin push). Deja \`git status\` limpio (AGENTS.md revertido) y ningún servidor tuyo encendido.
${t.extra ? '\n## Instrucciones específicas de esta tarea\n' + t.extra : ''}
Devuelve el resultado estructurado (decisiones y desviaciones en español).`
}

const LENS_TEXT = {
  compliance: `LENTE: CUMPLIMIENTO. Comprueba contra el diseño, el traspaso, el plan (contrato §3 completo y la sección de la tarea: archivos, claves de diccionario exactas, atributos data-*, textos, pruebas pedidas, comprobaciones de limpieza) y CLAUDE.md (honestidad, RealTy, Live Studio, partnerships, tipografía, regla del azul, rutas/SEO). Señala lo que falte, sobre o contradiga.`,
  quality: `LENTE: CALIDAD DEL CÓDIGO. Tipos, accesibilidad (WCAG AA, foco, aria), hidratación (nada que dependa del cliente en el primer render), rendimiento (solo transform/opacity/pathLength; sin trabajo en el hilo principal por scroll), CLS, código muerto, estilo del código vecino, casos límite, y calidad de las pruebas (¿prueban de verdad lo que dicen? ¿son deterministas? ¿se debilitó alguna?).`,
  visual: `LENTE: VISUAL Y RENDIMIENTO. Juzga lo que ve el usuario contra el diseño (§4 identidad, §5 secciones) y el contrato §3.1/§3.6: capturas en varios viewports (al menos 1440×900, 1366×768, 1920×1080, 2560×1440, 2560×1080, 390×844 y 844×390) y en varios puntos del scroll, con y sin reducir movimiento, y sin JavaScript; encuadre de la imagen, alineación de la superposición SVG con la imagen, contraste del texto sobre imagen, texto cortado o bajo el encabezado, un solo azul visible, estados finales con reducir movimiento. Rendimiento: la imagen LCP sale del HTML del servidor con loading=eager + fetchPriority=high; nada de animar width/height/top/filter; sin saltos de layout (mide CLS con PerformanceObserver en un spec temporal) y observa el peso de JS añadido. Mira TODAS tus capturas con Read antes de concluir.`,
}

function reviewPrompt(t, lens, round, base, history) {
  const lensText = LENS_TEXT[lens]
  const lensesOf = t.lenses || ['compliance', 'quality']
  const wt = `${WT}/rev-task${t.id}-${lens}-r${round}`
  const port = t.port + 1 + lensesOf.indexOf(lens)
  const hist = history.length ? `\n## Rondas anteriores (no vuelvas a plantear un hallazgo que el corrector rechazó salvo que tengas un argumento nuevo y concreto; verifica que los arreglos declarados son reales)\n${JSON.stringify(history, null, 1).slice(0, 30000)}\n` : ''
  return `Eres un REVISOR INDEPENDIENTE (ronda ${round}) de la ${taskHeader(t)}
${lensText}
${COMMON}
## Cómo trabajas
- NO modifiques ${WT}/task${t.id} ni el checkout principal. Crea tu propio worktree de solo lectura:
  ${BIN}/new-worktree.sh ${REPO} ${wt} --detach wt/task${t.id}
  Tu puerto: PORT=${port}.
- Diff a revisar: \`git -C ${wt} diff ${base}...wt/task${t.id}\` (y \`git log ${base}..wt/task${t.id}\`). Lee también los archivos completos tocados y la sección del plan (líneas ${t.lines}).
- Ejecuta lo que necesites para confirmar (lint, tsc, specs concretos con PORT=${port} bajo heavy). ${t.visual ? 'La tarea toca lo visible: HAZ CAPTURAS (p. ej. un spec temporal en tu worktree que use page.screenshot, ejecutado con PORT=' + port + ' bajo heavy; Playwright arranca y apaga el servidor) a 1440×900 y 390×844, y míralas con la herramienta Read. ' + (t.visualHint || '') : ''}
- Cada hallazgo con severidad: blocker (rompe pruebas/build/contrato/regla dura de CLAUDE.md, o regresión), major (bug real, violación a11y, desviación del diseño visible), minor, nit. Da archivo, línea, evidencia y arreglo sugerido. No inventes: verifica cada hallazgo antes de reportarlo.
- Al terminar: \`git -C ${REPO} worktree remove --force ${wt}\` y apaga cualquier servidor tuyo.
${hist}
Devuelve el resultado estructurado.`
}

function fixPrompt(t, round, findings, history) {
  return `Eres el CORRECTOR (ronda ${round}) de la ${taskHeader(t)}
${COMMON}
Trabajas en ${WT}/task${t.id} (rama wt/task${t.id}), PORT=${t.port}.
## Hallazgos de los revisores de esta ronda
${JSON.stringify(findings, null, 1)}
## Historial previo
${JSON.stringify(history.slice(0, -1), null, 1).slice(0, 20000)}
## Qué haces
- Verifica cada hallazgo. Arregla TODOS los correctos (también minor y nit si son correctos). Rechaza los incorrectos con su motivo concreto. Nunca debilites una prueba para ponerla en verde.
- Verificación: lint, tsc, spec(s) de la tarea y suite completa con PORT=${t.port} bajo heavy${t.build ? ' (y build con heavy --exclusive si tocaste algo que afecte al build)' : ''}.
- Commit en wt/task${t.id}. Deja \`git status\` limpio (AGENTS.md revertido), sin mutaciones de prueba ni archivos temporales, y ningún servidor encendido.
Devuelve el resultado estructurado.`
}

function recoveryPrompt(t, what) {
  return `Un agente (${what}) de la ${taskHeader(t)} se interrumpió. Inspecciona ${WT}/task${t.id}: \`git status\`, \`git diff\`, \`git log ${A.base}..HEAD\`. Busca cambios sin commitear accidentales (p. ej. mutaciones de prueba dentro de diccionarios o código, archivos temporales, AGENTS.md). Revierte lo accidental; si hay trabajo legítimo a medias, termínalo solo si es trivial, o descártalo. Apaga servidores huérfanos en el puerto ${t.port} (${BIN}/portfree.sh ${t.port}). Deja el worktree limpio y describe qué encontraste y qué hiciste. No hagas push.
${COMMON}`
}

function integPrompt(t, cycle) {
  return `Eres el INTEGRADOR de la ${taskHeader(t)}
${COMMON}
Trabajas en ${REPO} (rama ${BRANCH}), puerto 3000.
## Pasos
1. Precondiciones: \`git -C ${REPO} status --short\` vacío (si AGENTS.md aparece modificado, \`git checkout AGENTS.md\`); \`git -C ${WT}/task${t.id} status --short\` vacío — si no lo está, inspecciona el diff: descarta lo accidental (mutaciones de prueba, temporales) y anótalo. \`git fetch origin ${BRANCH}\` y asegúrate de que la rama local coincide con origin (avance rápido si hace falta).
2. \`git merge --squash wt/task${t.id}\`. Si hay conflictos, resuélvelos conservando la intención de ambos lados (lo ya integrado en ${BRANCH} + lo de la tarea) y anótalo.
3. \`npx next typegen >/dev/null\`, \`npm run lint\`, \`npx tsc --noEmit\`, \`${BIN}/portfree.sh 3000\`, y la suite e2e COMPLETA: \`${BIN}/heavy.sh npx playwright test --reporter=line\` (timeout 600000). Si algo falla, investiga la causa raíz y corrígela en el checkout principal (nunca debilitando pruebas). Una intermitente se repite una vez solo para confirmarlo y se anota.${t.integBuild ? '\n   Además: `' + BIN + '/heavy.sh --exclusive npm run build` debe pasar.' : ''}
4. \`git checkout AGENTS.md\` si cambió. Commit con el mensaje del Paso 4 del plan para esta tarea, adaptado a lo que de verdad se hizo, con un bloque "Decisiones" que recoja las decisiones del implementador y las de las rondas de revisión (abajo), y las dos líneas de atribución indicadas.
5. \`git push -u origin ${BRANCH}\`. Reintenta hasta 4 veces con esperas de 2, 4, 8 y 16 s SOLO si falla por red.
6. Limpieza: \`git worktree remove ${WT}/task${t.id} --force\`, \`git branch -D wt/task${t.id}\`, elimina cualquier ${WT}/rev-task${t.id}-* que quede y \`git worktree prune\`.
${t.integExtra ? '## Instrucciones específicas de integración de esta tarea\n' + t.integExtra + '\n' : ''}## Datos del ciclo (decisiones del implementador, hallazgos, arreglos y rechazos)
${JSON.stringify(cycle, null, 1).slice(0, 40000)}
Devuelve el resultado estructurado (ok=false si no quedó commit+push con todo en verde).`
}

async function runCycle(t) {
  const impl = t.impl ? t.impl : await agent(implPrompt(t), { label: `impl:T${t.id}`, phase: 'Implement', schema: IMPL_SCHEMA })
  if (t.impl) log(`T${t.id}: se retoma la implementación existente (${t.impl.head_commit})`)
  if (!impl || impl.status !== 'done') {
    log(`T${t.id}: implementador no terminó (${impl ? impl.status : 'interrumpido'})`)
    if (!impl) await agent(recoveryPrompt(t, 'implementador'), { label: `recover:T${t.id}:impl`, phase: 'Implement' })
    return { task: t.id, ok: false, impl }
  }
  const history = []
  let blockingLeft = null
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const lenses = t.lenses || ['compliance', 'quality']
    let reviews = await parallel(lenses.map(lens => () =>
      agent(reviewPrompt(t, lens, round, impl.base_commit, history), { label: `review:${lens}:T${t.id}:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA })))
    if (reviews.some(r => !r)) {
      reviews = await parallel(reviews.map((r, i) => () => r ? Promise.resolve(r) :
        agent(reviewPrompt(t, lenses[i], round, impl.base_commit, history), { label: `review:${lenses[i]}:T${t.id}:r${round}b`, phase: 'Review', schema: REVIEW_SCHEMA })))
    }
    if (reviews.some(r => !r)) {
      log(`T${t.id} r${round}: falta la respuesta de algún revisor tras reintentar — NO se aprueba ni se integra`)
      history.push({ round, verdicts: reviews.map(r => r && r.verdict), findings: [], missingReview: true })
      return { task: t.id, ok: false, reason: 'missing-review', impl, history }
    }
    const findings = []
    reviews.forEach((r, i) => { if (r) r.findings.forEach(f => findings.push({ ...f, lens: lenses[i] })) })
    const blocking = findings.filter(f => f.severity === 'blocker' || f.severity === 'major')
    log(`T${t.id} r${round}: ${findings.length} hallazgos (${blocking.length} bloqueantes/mayores)`)
    const entry = { round, verdicts: reviews.map(r => r && r.verdict), findings }
    history.push(entry)
    if (findings.length === 0) { blockingLeft = 0; break }
    let fix = await agent(fixPrompt(t, round, findings, history), { label: `fix:T${t.id}:r${round}`, phase: 'Fix', schema: FIX_SCHEMA })
    if (!fix) {
      await agent(recoveryPrompt(t, `corrector r${round}`), { label: `recover:T${t.id}:r${round}`, phase: 'Fix' })
      fix = await agent(fixPrompt(t, round, findings, history), { label: `fix:T${t.id}:r${round}b`, phase: 'Fix', schema: FIX_SCHEMA })
    }
    entry.fix = fix
    if (!fix) { log(`T${t.id} r${round}: el corrector no respondió tras recuperar y reintentar — NO se integra`); return { task: t.id, ok: false, reason: 'missing-fix', impl, history } }
    if (blocking.length === 0) { blockingLeft = 0; break }
    blockingLeft = blocking.length
  }
  const ok = blockingLeft === 0
  if (!ok) log(`T${t.id}: quedan hallazgos bloqueantes/mayores tras ${history.length} rondas — no se integra`)
  return { task: t.id, ok, impl, history }
}

phase('Implement')
const cycles = A.tasks.map(t => runCycle(t))
const results = []
let prev = Promise.resolve(true)
for (let i = 0; i < A.tasks.length; i++) {
  const t = A.tasks[i]
  const p = Promise.all([prev, cycles[i]]).then(async ([prevOk, cyc]) => {
    const rec = { task: t.id, cycle: cyc, integration: null }
    results.push(rec)
    if (!A.integrate) return prevOk
    if (!prevOk || !cyc || !cyc.ok) { log(`T${t.id}: integración omitida`); return false }
    const integ = await agent(integPrompt(t, cyc), { label: `integrate:T${t.id}`, phase: 'Integrate', schema: INTEG_SCHEMA })
    rec.integration = integ
    return !!(integ && integ.ok && integ.pushed)
  })
  prev = p
}
await prev
return results
