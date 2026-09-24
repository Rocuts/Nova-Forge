# Trabajo aprobado sin integrar (pausa del 2026-09-24, 23:08 UTC)

El usuario pidió detenerse a mitad de la Fase 4. **T9** («Lo que ya construimos») y **T10a**
(«Metodología, cierre y FAQ», sin los tres `describe` de la home completa) están implementadas y
**aprobadas por los tres revisores** (cumplimiento, calidad y visual) en dos rondas, con todos sus
hallazgos corregidos. Solo falta integrarlas. La integración de T9 estaba a medias al detenerse y se
descartó: `origin/redesign/home` sigue en `5424779` (T8 integrada), sin cambios.

| Tarea | Base | Punta (rama local) | Parches | Ciclo |
|---|---|---|---|---|
| T9 | `3644611` | `bbb83c7` (`wt/task9`) | `task9/*.patch` | `task9/ciclo-revision.json` |
| T10a | `3644611` | `28e5287` (`wt/task10`) | `task10/*.patch` | `task10/ciclo-revision.json` |

## Cómo retomar
Si las ramas `wt/task9` y `wt/task10` ya no existen (contenedor nuevo), recréalas:
```bash
scripts/agent/new-worktree.sh "$PWD" ../wt/task9 wt/task9 3644611
git -C ../wt/task9 am "$PWD"/docs/superpowers/handoff/wip/task9/*.patch
scripts/agent/new-worktree.sh "$PWD" ../wt/task10 wt/task10 3644611
git -C ../wt/task10 am "$PWD"/docs/superpowers/handoff/wip/task10/*.patch
```
Luego la Fase 4 tal cual: `home-integrate-serial` (T9 → T10a, `measure: true`,
`previousJs: "222 150 B (T8, 5424779)"`, `specFile` `e2e/home-t9.spec.ts` / `e2e/home-t10.spec.ts`,
y como datos del ciclo los `ciclo-revision.json` de esta carpeta) y después T10b con
`home-task-cycle` (tres `describe` de la home completa, prueba de recorrido rápido en celular y
arreglo de raíz de la intermitente «portada · scrub en tableta vertical grande», helper
`routePaints`). Cruces esperables al integrar: `page.tsx` (orden §3.5: … Dossier → BuiltProof →
MethodologyLine → TechStack → FAQ → CTA), diccionarios (unión de claves), `e2e/helpers.ts`
(`settledTopOffset` de T8 + `FORBIDDEN_*` de T9, sin duplicar), `globals.css` (bloques sin JS de T8
y T10a), una sola `IDENTITY_TRANSFORM` en `home.spec.ts`. Al integrar cada tarea, borra su carpeta
de aquí en el mismo commit.
