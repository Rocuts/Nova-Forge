#!/usr/bin/env bash
# portfree.sh <puerto> — sale con 0 si nadie ESCUCHA en ese puerto TCP, 1 si está ocupado.
# Úsalo antes de cada Playwright, `next dev` o `next start`: con `reuseExistingServer`,
# Playwright reutilizaría en silencio el servidor de otro worktree. Si está ocupado, dice
# qué proceso escucha (PID, orden y carpeta) para que averigües si es tuyo.
# Portátil: consulta /proc/net/tcp{,6} (Linux) y lsof (macOS/Linux), y da el puerto por
# ocupado si cualquiera de los dos lo ve. En el contenedor de Claude Code on the web, lsof
# no lista los sockets de `next-server`: fiarse solo de él daba «free» con el puerto ocupado.
p=${1:?uso: portfree.sh <puerto>}
busy=""

# /proc (Linux): filas en estado LISTEN (0A) cuyo puerto local es el pedido; $10 es el inodo.
hex=$(printf '%04X' "$p")
files=(); for f in /proc/net/tcp /proc/net/tcp6; do [ -r "$f" ] && files+=("$f"); done
inodes=""
if [ ${#files[@]} -gt 0 ]; then
  inodes=$(awk -v p=":$hex" 'FNR>1 && $4=="0A" && substr($2, length($2)-4)==p {print $10}' "${files[@]}")
  [ -n "$inodes" ] && busy=1
fi

# lsof (macOS; en Linux, como segunda fuente).
lsof_out=""
if command -v lsof >/dev/null 2>&1; then
  lsof_out=$(lsof -nP -iTCP:"$p" -sTCP:LISTEN 2>/dev/null) && busy=1
fi

if [ -z "$busy" ]; then echo "PORT $p free"; exit 0; fi

echo "PORT $p BUSY"
[ -n "$lsof_out" ] && echo "$lsof_out" | tail -n +2
# Dueño del socket por su inodo: `next start` y `next dev` escuchan desde un proceso
# `next-server (vX)` que `pkill -f "next start -p N"` no alcanza (ver README).
for ino in $inodes; do
  for d in /proc/[0-9]*; do
    if ls -l "$d/fd" 2>/dev/null | grep -q "socket:\[$ino\]"; then
      echo "  pid ${d#/proc/}: $(tr '\0' ' ' <"$d/cmdline" 2>/dev/null | cut -c1-100)(cwd: $(readlink "$d/cwd" 2>/dev/null))"
    fi
  done
done
exit 1
