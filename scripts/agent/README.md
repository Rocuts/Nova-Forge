# Scripts de agente

Utilidades para que varios agentes de Claude Code trabajen en paralelo en este repo sin
saturar la máquina ni pisarse (worktrees, puertos, procesos pesados). Portátiles: Linux y macOS.
Los usa el workflow guardado `.claude/workflows/home-task-cycle.js`.

| Script | Uso |
|---|---|
| `heavy.sh <orden…>` | Ejecuta la orden ocupando 1 de `HEAVY_SLOTS` turnos (por defecto 2). Para e2e y `next dev` de capturas. |
| `heavy.sh --exclusive <orden…>` | Ocupa todos los turnos: `next build` y mediciones. Nunca un build en paralelo con e2e. |
| `portfree.sh <puerto>` | Sale con 0 si el puerto está libre. Compruébalo antes de cada Playwright: `reuseExistingServer` reutilizaría el servidor de otro worktree. |
| `new-worktree.sh <repo> <ruta> <rama\|--detach> <base>` | Worktree listo: node_modules clonado (`cp -cR` en macOS, `cp -al` en Linux) y `next typegen`. Nunca `npm install` dentro. |
| `measure-js.mjs --url … --runs 3 --viewport 1440x900 --root <worktree> [--budget 269722] [--out r.json]` | Bytes de JS transferidos al cargar una URL (método de la línea base del plan). Contra `next start`, bajo `heavy.sh --exclusive`. |

Ajustes recomendados:
- Contenedor de Claude Code on the web (4 CPU): `HEAVY_SLOTS=2`.
- MacBook Pro M5 Pro 24 GB: `export HEAVY_SLOTS=3` y `export CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS=8`
  (cada `next dev` + Playwright ocupa 1,5–3 GB; el límite de uso de la cuenta se agota antes con más agentes).

Candados en `$HEAVY_LOCK_DIR` (por defecto `$TMPDIR/heavy-slots`). Si algo se queda colgado: `rm -rf "${TMPDIR:-/tmp}/heavy-slots"`.
