#!/usr/bin/env bash
# portfree.sh <puerto> — sale con 0 si nadie ESCUCHA en ese puerto TCP, 1 si está ocupado.
# Úsalo antes de cada Playwright o `next dev`: con `reuseExistingServer`, Playwright
# reutilizaría en silencio el servidor de otro worktree. Portátil: lsof (macOS/Linux) o /proc.
p=${1:?uso: portfree.sh <puerto>}
if command -v lsof >/dev/null 2>&1; then
  if lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "PORT $p BUSY"; lsof -nP -iTCP:"$p" -sTCP:LISTEN | tail -n +2; exit 1
  fi
  echo "PORT $p free"; exit 0
fi
hex=$(printf '%04X' "$p")
files=(); for f in /proc/net/tcp /proc/net/tcp6; do [ -r "$f" ] && files+=("$f"); done
if [ ${#files[@]} -gt 0 ] && awk -v p=":$hex" 'FNR>1 && $4=="0A" && substr($2, length($2)-4)==p {f=1} END{exit f?0:1}' "${files[@]}"; then
  echo "PORT $p BUSY"; exit 1
fi
echo "PORT $p free"; exit 0
