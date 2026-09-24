# Scripts de agente

Utilidades para que varios agentes de Claude Code trabajen en paralelo en este repo sin
saturar la máquina ni pisarse (worktrees, puertos, procesos pesados). Portátiles: Linux y macOS.
Los usa el workflow guardado `.claude/workflows/home-task-cycle.js`.

| Script | Uso |
|---|---|
| `heavy.sh <orden…>` | Ejecuta la orden ocupando 1 de `HEAVY_SLOTS` turnos (por defecto 2). Para e2e y `next dev` de capturas. |
| `heavy.sh --exclusive <orden…>` | Ocupa todos los turnos: `next build` y mediciones. Nunca un build en paralelo con e2e. |
| `portfree.sh <puerto>` | Sale con 0 si el puerto está libre. Compruébalo antes de cada Playwright, `next dev` o `next start`: `reuseExistingServer` reutilizaría el servidor de otro worktree. Si está ocupado, muestra el PID, la orden y la carpeta (cwd) del proceso que escucha. Consulta `/proc/net/tcp{,6}` y `lsof` (en el contenedor web, `lsof` no ve los sockets de `next-server`). |
| `new-worktree.sh <repo> <ruta> <rama\|--detach> <base>` | Worktree listo: node_modules clonado (`cp -cR` en macOS, `cp -al` en Linux) y `next typegen`. Nunca `npm install` dentro. |
| `measure-js.mjs --url … --runs 3 --viewport 1440x900 --root <worktree> [--budget 269722] [--out r.json]` | Bytes de JS transferidos al cargar una URL (método de la línea base del plan). Contra `next start`, bajo `heavy.sh --exclusive`. |

Ajustes recomendados:
- Contenedor de Claude Code on the web (4 CPU): `HEAVY_SLOTS=2`.
- MacBook Pro M5 Pro 24 GB: `export HEAVY_SLOTS=3` y `export CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS=8`
  (cada `next dev` + Playwright ocupa 1,5–3 GB; el límite de uso de la cuenta se agota antes con más agentes).

Parar un servidor (`next dev`, `next start`): quien escucha es un proceso hijo llamado
`next-server (vX)`, que `pkill -f "next start -p N"` no alcanza y que queda huérfano en el
puerto. Arráncalo en su propio grupo de procesos y para el grupo entero:

```bash
set -m                                   # bash: cada trabajo en segundo plano, su propio grupo
npx next start -p "$PORT" >/tmp/start.log 2>&1 &
pgid=$!                                  # (en Linux vale también `setsid … &`)
# … medir, capturar …
kill -- -"$pgid"
scripts/agent/portfree.sh "$PORT"         # debe decir «free»
```

Si aun así queda uno, `portfree.sh` muestra su PID y su cwd: mátalo solo si la cwd es tu worktree.

Candados en `$HEAVY_LOCK_DIR` (por defecto `$TMPDIR/heavy-slots`). Si algo se queda colgado: `rm -rf "${TMPDIR:-/tmp}/heavy-slots"`.
