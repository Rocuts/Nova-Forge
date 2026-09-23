ultracode — Continúa de forma autónoma, de principio a fin, el rediseño de la home de Orbexs en Rocuts/Nova-Forge, rama `redesign/home`. Usa workflows multiagente: varios en secuencia, uno por fase, sin límite de tamaño de workflow. Revisa los resultados de cada uno antes de lanzar el siguiente. Ya aprobé el diseño y te autorizo a ejecutar todo, hacer commit y hacer push a esta rama sin pedirme aprobaciones, confirmaciones ni decisiones.

## 1. Lee primero, en este orden
1. `CLAUDE.md` y `AGENTS.md`. Antes de usar cualquier API de Next 16, consulta `node_modules/next/dist/docs/`.
2. `docs/superpowers/handoff/2026-09-23-home-redesign-handoff.md`, **§7 "Estado a la pausa" primero**: lo hecho, lo pendiente, cómo preparar el contenedor, las lecciones de la sesión anterior y el paralelismo recomendado. Después el resto del traspaso.
3. `docs/superpowers/specs/2026-09-23-home-cartografia-soberana-design.md`: el diseño aprobado, que es el contrato.
4. `docs/superpowers/plans/2026-09-23-home-cartografia-soberana.md`. Las secciones §0–§4 son el protocolo y el contrato compartido, y son vinculantes. Después viene una sección por tarea, con código completo y la prueba escrita antes del código.

## 2. Estado de partida (verifícalo)
- Punta de `origin/redesign/home`: `0a28429` o posterior. **Ya integradas:** T1 imágenes (`233446e`), T3 copy de riesgo (`748567c`) y T4 títulos y reducir movimiento (`2e61a3b`). La suite e2e da 60/60.
- **Pendiente:** T2 (metadatos e imágenes para redes), T5 (navegación y encabezado), T6 a T10 (la home) y T11 (limpieza, documentación y verificación final).
- **Línea base para comparar:** JS de `/es` = 239 002 bytes; LCP 900 ms con Slow 4G y CPU 4×; CLS 0,007.

## 3. Fase 0: preparación (sin subagentes)
- `nproc` y `free -g`. Anota la concurrencia real: el runtime permite hasta 16 agentes a la vez, o `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` si está definida. Con pocas CPU el tope baja: con 4 CPU queda en 2 si no se define la variable.
- `npm ci`. Si falta la revisión de Chromium que espera Playwright, crea los enlaces de §7 del traspaso. No ejecutes `playwright install`.
- En la punta, lint, `tsc` y e2e completo deben quedar en verde (60/60). Si algo ya falla, anótalo como estado previo.
- Crea el cerrojo de carga pesada: como mucho **2** procesos pesados a la vez (e2e, `next dev` para capturas, `next build`), con `flock /tmp/heavy-slot-1.lock` y `flock /tmp/heavy-slot-2.lock`. Nunca ejecutes un build en paralelo con e2e. Antes de cada ejecución, comprueba con `ss -ltnp` que el puerto está libre (`reuseExistingServer` reutilizaría el servidor de otro worktree).

## 4. Ejecución: máximo paralelismo seguro
El número de subagentes simultáneos lo limitan la máquina y las dependencias entre archivos, no la voluntad de ejecutar todo a la vez. Paraleliza la **implementación y la revisión**; la **integración** en `redesign/home` va siempre en serie.

| Fase | Workflow | Paralelo | Integración (en serie) |
|---|---|---|---|
| F1 | T2 ∥ T5 | 2 implementadores y sus 4 revisores | T2 → T5 |
| F2 | T6 sola (incluye build) | revisores en paralelo | T6 |
| F3 | T7 ∥ T8 ∥ T9 ∥ T10a, en worktrees desde el commit de T6, cada una con un spec temporal propio (`e2e/home-t7.spec.ts`…) | 4 implementadores y sus 8 revisores | — |
| F4 | integración | — | T7 → T8 → T9 → T10a: resolver `page.tsx` con el orden del contrato §3.5, unir las claves de diccionario, conservar sin duplicar los añadidos a `e2e/helpers.ts` y fundir cada spec temporal en `e2e/home.spec.ts`. Después **T10b**: las 3 pruebas de la home completa (orden de secciones, h2 sin JS y regla del azul en todo el scroll, a 1440×900 y 390×844, con y sin reducir movimiento). |
| F5 | T11 | revisores visuales en paralelo (escritorio, móvil, reducir movimiento, 1920/2560) y revisores de rama en paralelo (cumplimiento, calidad, rendimiento, a11y) | T11 |

T10a comprende Metodología, CTA, FAQ y TechStack con sus pruebas. Si en F3 el paralelo genera más conflictos de los que se resuelven con seguridad, vuelve a la secuencia estricta del plan (§2) y anótalo.

**Ciclo por tarea (plan §1):**
1. **Implementador** en su propio worktree: `/home/user/wt/taskN` desde la punta, `cp -al node_modules` (nunca `npm install` dentro), `npx next typegen` y `PORT=30N0`. Prueba primero, comprueba el fallo esperado, implementa y verifica.
2. **Dos revisores independientes en paralelo**, distintos del implementador: cumplimiento (diseño, traspaso, contrato del plan, CLAUDE.md) y calidad del código. Deben usar capturas cuando la tarea toque lo visible.
3. **Corrector:** arregla todos los hallazgos o rechaza los incorrectos con su motivo. Repite hasta que no quede ningún hallazgo bloqueante ni mayor. Si un agente se interrumpe, revisa su diff antes de seguir: en la sesión anterior un corrector cortado dejó una mutación de prueba dentro de `es.ts`.
4. **Integrador:** `git merge --squash`, lint, `tsc` y e2e **completo**. Luego commit en el formato del plan §1.4, con un bloque "Decisiones" y las líneas de atribución que indique tu entorno, y `git push -u origin redesign/home` (reintenta hasta 4 veces solo si falla la red). Al final, borra el worktree.

## 5. Reglas que no cambian
- Si una prueba falla, investiga la causa y corrígela. Nunca desactives, saltes, marques como fixme ni debilites una prueba. Una prueba intermitente se repite una vez solo para confirmarlo, y se anota.
- Ante una ambigüedad, decide con el diseño y el traspaso como guía, y anota la decisión y su porqué en el commit y en el informe. Si algo necesita credenciales, dominio o un servicio externo, sáltalo, anótalo y sigue.
- No hagas merge a `main` ni publiques en producción. No hagas push a otra rama que no sea `redesign/home`.
- **Identidad:** monocromo Orbexs. El azul #2563eb solo marca "lo que el sistema está procesando ahora", y nunca hay más de un elemento azul visible a la vez.
- **Honestidad (CLAUDE.md):** sin afirmar alianzas con AWS, Google, Azure, OpenAI ni TikTok; se aplican las reglas de lenguaje de RealTy y se conserva el disclaimer de Live Studio. No generes imágenes: usa solo las de `design/source/`.
- Tailwind v4 escanea también los `.md`: no escribas clases con valores elididos en ningún archivo. `next dev` reescribe `AGENTS.md`: descarta ese cambio antes de cada commit (salvo en T11).

## 6. Verificación final obligatoria (T11)
- `npm run lint`, `npx tsc --noEmit`, `npm run build` y **todas** las pruebas de `e2e/` en verde. Guarda las salidas en `docs/superpowers/verification/2026-09-23/`.
- Capturas de la home a 1440×900 y 390×844, en 10 o más puntos del scroll, más una pasada con reducir movimiento y otras a 1920×1080 y 2560×1440 (script `capture-home.mjs` del plan). Revísalas una por una contra el diseño y corrige lo que no cuadre.
- Con `next start` y `scripts/measure-home.mjs`, a 4G lenta y CPU 4×, en escritorio y en móvil:
  - LCP de `/es` < 2 500 ms y CLS < 0,1.
  - Bytes de JS menos 239 002 ≤ 30 720.
- Revisión final de toda la rama por revisores independientes con lentes distintas. Corrige lo que encuentren.

## 7. Al terminar
- Añade al traspaso la sección "Estado al cierre": qué se hizo, qué decidiste y por qué, qué quedó pendiente y cómo retomarlo. Luego el último commit y push.
- Escríbeme un informe en español:
  - tareas completadas, con sus commits;
  - resultados de las pruebas, con cifras;
  - LCP y peso de JS antes y después;
  - desviaciones del diseño y por qué;
  - pendientes, entre ellos el dominio `orbexs.tech` y el 404 de Vercel.
