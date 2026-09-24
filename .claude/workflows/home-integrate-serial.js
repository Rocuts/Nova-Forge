export const meta = {
  name: 'home-integrate-serial',
  description: 'Integrate already-reviewed task branches (wt/taskN) into the target branch one by one: squash, resolve crossings, fuse temporary specs, full e2e, build, JS measure, commit, push',
  whenToUse: 'Fase 4 del rediseño (y cualquier integración de tareas implementadas en paralelo con home-task-cycle integrate:false). Args: ver cabecera.',
  phases: [
    { title: 'Integrate', detail: 'one integrator per task, strictly in the given order' },
  ],
}

// ── Argumentos ──────────────────────────────────────────────────────────────
// {
//   repo, wtRoot, agentBin, branch  (como en home-task-cycle)
//   attribution: líneas de atribución de los commits (si falta: las que indique el entorno)
//   measure: true = build + check:modern-js + measure-js tras cada integración
//   tasks: [{ id, title, lines, specFile: "e2e/home-t7.spec.ts", cycle: <resultado de home-task-cycle para la tarea>, extra }]
// }
// Se detiene en la primera integración que no termine en commit+push con todo en verde.
const A = args
const REPO = A.repo || '/home/user/Nova-Forge'
const WT = A.wtRoot || (REPO.replace(/\/[^/]+$/, '') + '/wt')
const BIN = A.agentBin || (REPO + '/scripts/agent')
const BRANCH = A.branch || 'redesign/home'
const ATTR = A.attribution || 'las líneas de atribución que indique tu entorno (system-reminder de la sesión); si no hay ninguna, omítelas'
const PLAN = 'docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md'

const SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    commit: { type: 'string' },
    pushed: { type: 'boolean' },
    lint: { type: 'string' },
    tsc: { type: 'string' },
    e2e: { type: 'string' },
    build: { type: 'string' },
    js_bytes: { type: 'string', description: 'total medido con measure-js y delta frente a la integración anterior' },
    conflicts: { type: 'string', description: 'conflictos y cómo se resolvieron' },
    flaky: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['ok', 'commit', 'pushed', 'e2e', 'conflicts'],
}

function prompt(t, previous) {
  return `Eres el INTEGRADOR de la Tarea ${t.id} — ${t.title} (sección del plan: líneas ${t.lines} de ${PLAN}). Rama de la tarea: wt/task${t.id} (worktree ${WT}/task${t.id}), ya implementada y revisada (sin hallazgos bloqueantes ni mayores). Trabajas en el checkout principal ${REPO}, rama \`${BRANCH}\`, puerto 3000.

## Reglas
- CLAUDE.md (inyectado) manda. Diseño: docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md. Traspaso: docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md (§8 primero). Plan §0–§4 vinculantes (contrato §3, orden de secciones §3.5).
- Carga pesada: e2e con \`${BIN}/heavy.sh\`, build y mediciones con \`${BIN}/heavy.sh --exclusive\`; comprueba puertos con \`${BIN}/portfree.sh\`. Next 16: consulta node_modules/next/dist/docs antes de usar APIs.
- Nunca debilites, saltes ni desactives pruebas. Una intermitente se repite UNA vez para confirmarlo y se anota.
- \`next dev\` reescribe AGENTS.md: \`git checkout AGENTS.md\` antes del commit.
- Solo push a \`${BRANCH}\`. Nunca merge a main.

## Pasos
1. Precondiciones: \`git -C ${REPO} status --short\` vacío; \`git -C ${WT}/task${t.id} status --short\` vacío (si no, inspecciona: descarta lo accidental —mutaciones de prueba, temporales— y anótalo). \`git fetch origin ${BRANCH}\`; la rama local debe coincidir con origin.
2. \`git merge --squash wt/task${t.id}\`. La tarea se implementó en paralelo desde una base anterior: resuelve los conflictos conservando lo ya integrado Y lo de la tarea:
   - \`src/app/[locale]/page.tsx\`: secciones en el orden del contrato §3.5 (Portada, Tesis, Capacidades, Del papel al dato, Lo que ya construimos, Metodología, Tecnologías, FAQ, Cierre; las antiguas que aún no se hayan sustituido van en la posición de su equivalente). Imports estáticos: nada de next/dynamic. El JSON-LD FAQPage desde dict.faq.items y generateMetadata = pageMetadata(locale, "/") se quedan intactos.
   - Diccionarios es.ts/en.ts: unión de claves (cada tarea añade o borra solo las suyas); misma forma en ambos idiomas.
   - \`e2e/helpers.ts\`: conserva todos los añadidos sin duplicar ninguno; imports unificados.
   ${t.specFile ? `- Spec temporal \`${t.specFile}\`: fúndelo en \`e2e/home.spec.ts\` — sus imports se unen a la cabecera de home.spec.ts (sin duplicados), sus helpers locales que ya existan en home.spec.ts se eliminan (usa los existentes; si difieren, conserva el más general y comprueba que ambas pruebas pasan), y sus \`describe\` van al final con el prefijo "T${t.id} ·" del plan. Luego \`git rm ${t.specFile}\`. El número total de pruebas no debe bajar.` : ''}
3. \`npx next typegen >/dev/null\`, \`npm run lint\`, \`npx tsc --noEmit\`, \`${BIN}/portfree.sh 3000\`, suite e2e COMPLETA: \`${BIN}/heavy.sh npx playwright test --reporter=line\` (timeout 600000). Si algo falla, busca la causa raíz y corrígela en el checkout principal (el cruce con lo ya integrado es lo más probable).
${A.measure ? `4. \`${BIN}/heavy.sh --exclusive npm run build\`; si existe, \`npm run check:modern-js\`. Luego \`next start\` en un puerto libre y \`${BIN}/heavy.sh --exclusive node ${BIN}/measure-js.mjs --url http://localhost:<p>/es --runs 3 --viewport 1440x900 --root ${REPO} --budget 269722\`; apaga el servidor. Anota total y delta${previous ? ` frente a la integración anterior (${previous})` : ''}.` : '4. (sin medición en esta ejecución)'}
5. \`git checkout AGENTS.md\` si cambió. Commit con el mensaje del Paso 4 de la sección de la tarea en el plan, adaptado a lo que de verdad se hizo, con un bloque "Decisiones" que recoja las del implementador y las de las rondas de revisión (datos del ciclo, abajo) y una línea de integración (conflictos resueltos, e2e, build, JS). Atribución: ${ATTR}.
6. \`git push -u origin ${BRANCH}\` (reintenta hasta 4 veces con 2, 4, 8 y 16 s SOLO si falla por red). Comprueba que origin coincide.
7. Limpieza: \`git worktree remove ${WT}/task${t.id} --force\`, \`git branch -D wt/task${t.id}\`, elimina cualquier ${WT}/rev-task${t.id}-* y \`git worktree prune\`.
${t.extra ? '\n## Instrucciones específicas\n' + t.extra + '\n' : ''}
## Datos del ciclo (implementador, hallazgos, arreglos y rechazos)
${JSON.stringify(t.cycle || {}, null, 1).slice(0, 45000)}

Devuelve el resultado estructurado (ok=false si no quedó commit+push con todo en verde).`
}

phase('Integrate')
const results = []
let previous = A.previousJs || null
for (const t of A.tasks) {
  const r = await agent(prompt(t, previous), { label: `integrate:T${t.id}`, phase: 'Integrate', schema: SCHEMA })
  results.push({ task: t.id, result: r })
  if (!r || !r.ok || !r.pushed) { log(`T${t.id}: la integración no terminó; se detiene la serie`); break }
  if (r.js_bytes) previous = r.js_bytes
  log(`T${t.id} integrada: ${r.commit} · e2e ${r.e2e}${r.js_bytes ? ' · JS ' + r.js_bytes : ''}`)
}
return results
