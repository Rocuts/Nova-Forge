ultracode — Continúa de forma autónoma, de principio a fin, el rediseño de la home de Orbexs en Rocuts/Nova-Forge, rama `redesign/home`, ahora en mi MacBook Pro M5 Pro (24 GB) desde VS Code. Usa workflows multiagente: varios en secuencia, uno por fase, sin límite de tamaño de workflow. Revisa los resultados de cada uno antes de lanzar el siguiente. Ya aprobé el diseño y te autorizo a ejecutar todo, hacer commit y hacer push a `redesign/home` sin pedirme aprobaciones, confirmaciones ni decisiones. **Mantén el rigor actual** (lo elegí frente a modos más rápidos): rondas de revisión hasta que no quede ningún hallazgo bloqueante ni mayor, tres lentes (cumplimiento, calidad, visual) en toda tarea que se vea, verificación final completa.

## 0. Preparación que ya hice en la terminal (compruébala)
```bash
cd <ruta-del-repo>/Nova-Forge && git checkout redesign/home && git pull
npm ci && npx playwright install chromium && npx next typegen >/dev/null
export HEAVY_SLOTS=3
export CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS=8
```
Si falta algo de esto, hazlo tú (en el Mac `npx playwright install chromium` sí está permitido). Anota `sysctl -n hw.ncpu` y `sysctl -n hw.memsize`, y la concurrencia real de agentes (min(16, CPU − 2) o `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`).

## 1. Lee primero, en este orden
1. `CLAUDE.md` y `AGENTS.md`. Antes de usar cualquier API de Next 16, consulta `node_modules/next/dist/docs/`.
2. `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md`: **§8 «Estado a la pausa 2» primero** (lo hecho en la sesión 2, el presupuesto de JS, lo que falta y en qué orden, cómo preparar el Mac, cómo se ejecuta cada fase, lecciones); después §7 y el resto.
3. `docs/superpowers/research/2026-09-24-presupuesto-js.md`: investigación con mediciones reales. Su §4 es la especificación de la tarea P1 y su §5 las reglas de peso e imágenes de T7–T11.
4. `docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md`: el diseño aprobado, que es el contrato.
5. `docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md`: §0–§4 son el protocolo y el contrato compartido, y son vinculantes. Después, una sección por tarea con código completo y la prueba escrita antes del código. Recalcula las líneas de cada sección con `grep -n '^## Tarea'`.
6. `git log --oneline -20` y el bloque «Decisiones» de `git show 1bbd6ad`, `git show 182001a` y `git show 5cf73de`: son desviaciones del plan que ya están en el código y mandan sobre él.
7. `scripts/agent/README.md` y la cabecera de `.claude/workflows/home-task-cycle.js`.

## 2. Estado de partida (verifícalo)
- Punta de `origin/redesign/home`: `la del último commit de traspaso (`git log -1`)` o posterior. **Integradas:** T1 (`233446e`), T3 (`748567c`), T4 (`2e61a3b`), T2 (`1bbd6ad`), T5 (`182001a`), T6 (`5cf73de`). La suite e2e da 146/146.
- **Pendiente:** P1 (rendimiento), T7 a T10 (la home), T10b (pruebas de la home completa) y T11 (limpieza, documentación, verificación final y lo prometido en la sesión 2: guía, lista de preparación de imágenes, workflow guardado y referencia de movimiento en el skill del design system).
- **Líneas base para comparar:** JS de `/es` = 239 002 bytes (antes del rediseño, compilado a ES5); tras T6: ≈ 250 KB (250 331 B medidos sobre 32836e8); LCP 900 ms con Slow 4G y CPU 4×; CLS 0,007. Tope de JS: 269 722 bytes.

## 3. Fase 0: preparación (sin subagentes)
- En la punta, `npm run lint`, `npx tsc --noEmit` y `npx playwright test` en verde. Si algo ya falla, anótalo como estado previo.
- Carga pesada: como mucho `HEAVY_SLOTS` (3) procesos pesados a la vez con `scripts/agent/heavy.sh` (e2e, `next dev` para capturas) y `scripts/agent/heavy.sh --exclusive` (build y mediciones; nunca un build en paralelo con e2e). Antes de cada ejecución, `scripts/agent/portfree.sh <puerto>`: `reuseExistingServer` reutilizaría el servidor de otro worktree.
- Worktrees en la carpeta hermana `../wt/` con `scripts/agent/new-worktree.sh` (clona `node_modules` con `cp -cR`; nunca `npm install` dentro).

## 4. Ejecución
Paraleliza la implementación y la revisión; la integración en `redesign/home` va siempre en serie. Usa el workflow guardado `home-task-cycle` (`Workflow({ name: "home-task-cycle", args })`, con `repo` = ruta absoluta del checkout) salvo donde se indica un workflow propio.

| Fase | Workflow | Paralelo | Integración (en serie) |
|---|---|---|---|
| P1 | `home-task-cycle`, `integrate: true`, tarea `P1` (puerto 3130; `lines`: §0–§4 del plan; `extra`: §4 del informe de JS; `build`, `integBuild`; lentes compliance, quality, visual) | 3 revisores | P1 |
| F3 | `home-task-cycle`, `integrate: false`, args de `docs/superpowers/handoff/2026-09-24-args-f3.json` (rellena `repo`; recalcula `lines`) | 4 implementadores y sus 12 revisores | — |
| F4 | workflow propio de integración | — | T7 → T8 → T9 → T10a: `page.tsx` con el orden del contrato §3.5, unir las claves de diccionario, conservar sin duplicar los añadidos a `e2e/helpers.ts`, fundir cada spec temporal `e2e/home-tN.spec.ts` en `e2e/home.spec.ts` y borrarlo; lint, tsc, e2e completo tras cada una; build y medida de JS tras T9 y T10a. Después **T10b** con `home-task-cycle`: los tres `describe` de la home completa (orden de secciones, h2 sin JS y regla del azul en todo el scroll, a 1440×900 y 390×844, con y sin reducir movimiento). |
| F5 | workflow propio | revisores visuales (escritorio, móvil, reducir movimiento, 1920/2560) y de rama (cumplimiento, calidad, rendimiento, a11y) | T11 |

Si en F3 el paralelo genera más conflictos de los que se resuelven con seguridad, vuelve a la secuencia estricta del plan (§2) y anótalo.

**Ciclo por tarea** (lo implementa `home-task-cycle`):
1. **Implementador** en su propio worktree desde la punta, con su `PORT`. Prueba primero, comprueba el fallo esperado, implementa y verifica (incluida la medida de JS al cerrar).
2. **Revisores independientes en paralelo**, distintos del implementador: cumplimiento (diseño, traspaso, contrato del plan, CLAUDE.md), calidad del código y visual (capturas en 1440×900, 1366×768, 1920×1080, 2560×1440, 2560×1080, 1024×1366, 820×1180, 390×844 y 844×390, con y sin reducir movimiento, sin JS).
3. **Corrector:** arregla todos los hallazgos o rechaza los incorrectos con su motivo. Se repite hasta que no quede ningún hallazgo bloqueante ni mayor. Si un agente se interrumpe, revisa su diff antes de seguir: en la sesión 1 un corrector cortado dejó una mutación de prueba dentro de `es.ts`.
4. **Integrador:** `git merge --squash`, lint, `tsc` y e2e **completo**. Luego commit en el formato del plan §1.4, con un bloque «Decisiones» y las líneas de atribución que indique tu entorno, y `git push -u origin redesign/home` (reintenta hasta 4 veces solo si falla la red). Al final, borra el worktree.
5. Si el límite de uso corta a revisores o correctores, el workflow deja la tarea **sin integrar**: espera a que se renueve y relanza con `tasks[i].impl` (el resultado del implementador está en el `journal.jsonl` del workflow).

## 5. Reglas que no cambian
- Si una prueba falla, investiga la causa y corrígela. Nunca desactives, saltes, marques como fixme ni debilites una prueba. Una prueba intermitente se repite una vez solo para confirmarlo, y se anota.
- Ante una ambigüedad, decide con el diseño y el traspaso como guía, y anota la decisión y su porqué en el commit y en el informe. Si algo necesita credenciales, dominio o un servicio externo, sáltalo, anótalo y sigue.
- No hagas merge a `main` ni publiques en producción. No hagas push a otra rama que no sea `redesign/home`.
- **Identidad:** monocromo Orbexs. El azul #2563eb solo marca «lo que el sistema está procesando ahora», y nunca hay más de un elemento azul visible a la vez.
- **Honestidad (CLAUDE.md):** sin afirmar alianzas con AWS, Google, Azure, OpenAI ni TikTok; se aplican las reglas de lenguaje de RealTy y se conserva el disclaimer de Live Studio. No generes imágenes: usa solo las de `design/source/`.
- **Peso de JS:** `browserslist` solo con versiones fijas (vercel/next.js#92091); tras cada build, `npm run check:modern-js` (desde P1). Imágenes renderizadas en el servidor y pasadas a la isla, con `coverPlaceholder`, nunca `placeholder="blur"`. motion solo con el conjunto permitido del informe (§5); nada de `animate`, `useAnimate`, `useSpring`, `AnimatePresence`, `domMax` ni `motion.*` en las islas nuevas. Topes por tarea: T7 +4 000 B, T8 +3 000 B, T9 +2 500 B, T10 +3 000 B.
- Tailwind v4 escanea los archivos que no están en `.gitignore` (salvo `docs/`, excluido con `@source not`): no escribas clases con valores elididos. `next dev` reescribe `AGENTS.md`: descarta ese cambio antes de cada commit (salvo en T11).

## 6. Verificación final obligatoria (T11)
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run check:modern-js` y **todas** las pruebas de `e2e/` en verde. Guarda las salidas en `docs/superpowers/verification/2026-09-23/`.
- Capturas de la home a 1440×900 y 390×844, en 10 o más puntos del scroll, más una pasada con reducir movimiento y otras a 1920×1080 y 2560×1440 (script `capture-home.mjs` del plan). Revísalas una por una contra el diseño y corrige lo que no cuadre.
- Con `next start` y `scripts/measure-home.mjs`, a 4G lenta y CPU 4×, en escritorio y en móvil: LCP de `/es` < 2 500 ms y CLS < 0,1; bytes de JS − 239 002 ≤ 30 720 (compara también con `scripts/agent/measure-js.mjs`).
- Revisión final de toda la rama por revisores independientes con lentes distintas. Corrige lo que encuentren.
- Entregables prometidos en la sesión 2 (traspaso §8.3, punto 4): guía `docs/superpowers/playbooks/rediseno-scroll-animado.md`, lista de preparación de imágenes para mí, workflow `.claude/workflows/home-task-cycle.js` revisado, referencia de movimiento y scroll en `.claude/skills/orbexs-design-system/`. Propón (no apliques sin decirme) la línea de CLAUDE.md sobre `browserslist` fijo y los imports de motion prohibidos. Los opcionales de peso (`tailwind-merge`, `AnimatePresence`, `next/image` fuera de `/es`) solo si los pido.

## 7. Al terminar
- Añade al traspaso la sección «Estado al cierre»: qué se hizo, qué decidiste y por qué, qué quedó pendiente y cómo retomarlo. Luego el último commit y push.
- Escríbeme un informe en español:
  - tareas completadas, con sus commits (incluidas T2, T5 y T6 de la sesión 2);
  - resultados de las pruebas, con cifras;
  - LCP y peso de JS antes y después (con la evolución: 239 002 → T6 → P1 → final);
  - desviaciones del diseño y por qué;
  - pendientes, entre ellos el dominio `orbexs.tech`, el 404 de `orbexs-alpha.vercel.app` (proyecto de Vercel `nova-forge`) y la fase 2 (resto de páginas).
