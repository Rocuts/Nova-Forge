#!/usr/bin/env bash
# heavy.sh — limita los procesos pesados de los agentes (e2e, `next dev` para capturas,
# `next build`, mediciones) para no saturar la máquina. Portátil: Linux y macOS
# (candados con `mkdir` atómico; no necesita `flock`, que macOS no trae).
#
#   scripts/agent/heavy.sh <orden…>              ocupa 1 de los N turnos (e2e, next dev)
#   scripts/agent/heavy.sh --exclusive <orden…>  ocupa los N turnos (next build, mediciones:
#                                                nunca un build en paralelo con e2e)
#
# N = HEAVY_SLOTS (por defecto 2; con 4 CPU, 2; en un Mac M-Pro de 24 GB, 3).
# Candados en HEAVY_LOCK_DIR (por defecto $TMPDIR/heavy-slots). Si un proceso muere sin
# soltar su turno, el siguiente lo detecta por el PID; en último caso: rm -rf "$HEAVY_LOCK_DIR".
set -u
N=${HEAVY_SLOTS:-2}
LOCKDIR=${HEAVY_LOCK_DIR:-${TMPDIR:-/tmp}/heavy-slots}
mkdir -p "$LOCKDIR"
held=()

cleanup() {
  local d
  for d in "${held[@]+"${held[@]}"}"; do rm -rf "$d"; done
  held=()
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM

# Borra un candado cuyo dueño ya no existe (PID escrito y muerto).
reap() {
  local d=$1 pid
  pid=$(cat "$d/pid" 2>/dev/null || true)
  if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then rm -rf "$d"; fi
}

take() { # $1 = directorio del candado; 0 si se consiguió
  if mkdir "$1" 2>/dev/null; then
    echo $$ >"$1/pid"
    held+=("$1")
    return 0
  fi
  reap "$1"
  return 1
}

pending_alive() {
  [ -d "$LOCKDIR/excl-pending" ] || return 1
  reap "$LOCKDIR/excl-pending"
  [ -d "$LOCKDIR/excl-pending" ]
}

if [ "${1:-}" = "--exclusive" ]; then
  shift
  until take "$LOCKDIR/excl-pending"; do sleep 2; done   # una exclusiva a la vez
  for i in $(seq 1 "$N"); do
    until take "$LOCKDIR/slot-$i"; do sleep 2; done
  done
  rm -rf "$LOCKDIR/excl-pending"
  echo "[heavy] turnos exclusivos ($N): $*" >&2
else
  got=""
  while [ -z "$got" ]; do
    if ! pending_alive; then
      for i in $(seq 1 "$N"); do
        if take "$LOCKDIR/slot-$i"; then got=$i; break; fi
      done
    fi
    [ -z "$got" ] && sleep 2
  done
  echo "[heavy] turno $got/$N: $*" >&2
fi

"$@"
