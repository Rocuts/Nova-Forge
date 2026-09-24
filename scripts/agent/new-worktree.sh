#!/usr/bin/env bash
# new-worktree.sh <repo> <ruta-worktree> <rama-nueva|--detach> <base>
# Crea un worktree listo para trabajar: node_modules clonado (nunca `npm install` dentro)
# y next-env.d.ts generado (sin él, tsc no conoce los imports de imágenes).
#  - macOS (APFS): `cp -cR` clona con copy-on-write: instantáneo y sin coste de disco.
#  - Linux: `cp -al` con enlaces duros (comparten inodos: no modificar node_modules).
# No usar un symlink de node_modules: Turbopack rechaza symlinks que salen de la raíz.
set -eu
repo=$1 wt=$2 branch=$3 base=$4
if [ "$branch" = "--detach" ]; then
  git -C "$repo" worktree add --detach "$wt" "$base"
else
  git -C "$repo" worktree add "$wt" -b "$branch" "$base"
fi
if [ "$(uname)" = "Darwin" ]; then cp -cR "$repo/node_modules" "$wt/node_modules"
else cp -al "$repo/node_modules" "$wt/node_modules"; fi
(cd "$wt" && npx next typegen >/dev/null)
echo "worktree listo: $wt ($(git -C "$wt" rev-parse --short HEAD))"
