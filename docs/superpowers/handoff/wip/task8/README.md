# T8 «Del papel al dato»: trabajo sin integrar (sesión 2)

**Estado al guardar (2026-09-24, ~10:25 UTC):** implementada y corregida en dos rondas de revisión con tres lentes (cumplimiento, calidad, visual). **Falta:** la ronda 3 de revisión (con 1 mayor nuevo de calidad: ver tabla) y una **ronda 4** con su corrector, y la integración sobre `redesign/home` (que ya tiene P1 `25f4227` y T7 `27d841d`).

- **Base de los parches:** `ca0dd63` (T6 + primer commit de traspaso, *antes* de P1 y de T7).
- **Parches** (`git format-patch ca0dd63..wt/task8`, rama `wt/task8`):
  1. `5248386` feat(home): del papel al dato, extracción de 6 campos sobre el expediente
  2. `57042ff` fix(home): foco visible y panel estable en del papel al dato *(ronda 1)*
  3. `e445319` fix(home): del papel al dato arranca en celular apaisado y cabe a 1024×768 *(ronda 2)*
- **Ciclo completo** (decisiones del implementador, hallazgos y arreglos de cada ronda): `ciclo-revision.json`.

## Rondas
| Ronda | Cumplimiento | Calidad | Visual | Corrector |
|---|---|---|---|---|
| 1 | cambios (2 mayores: foco invisible en los enlaces sobre `#0a0a0a`; panel roto en tabletas verticales 768–900 px) | cambios (los mismos 2 mayores) | cambios (1 mayor) | 7 arreglados, 0 rechazados |
| 2 | cambios (1 mayor: en celular apaisado < 768 px la secuencia `inView` nunca arrancaba, `amount: 0.5` de un marco más alto que la pantalla) | 2 menores | aprueba (1 detalle) | 5 arreglados, 0 rechazados |
| 3 | **cambios: el mismo mayor** (confirmado de forma independiente; mismo arreglo propuesto) + 1 detalle: en el plan, el grep del paso 3, la plantilla del commit del paso 4 y §3.6 aún describen la versión inicial (marco al 50 %, `short:`) | **cambios: 1 mayor.** En celular (`inView`) la secuencia depende solo de `useInView(frameRef)`: al bajar hasta el panel (debajo de la imagen) el marco sale de la franja central y la secuencia se congela en «00/06» o «01/06» con una fila «Procesando» fija; si se llega al panel de un salto, ni arranca. Arreglo propuesto: `ref` en el panel, segundo `useInView(panelRef, { margin: "-25% 0px -25% 0px" })` y `running = frameInView \|\| panelInView` (o semántica «una vez» con `once: true`). + 1 detalle: el grep del paso 3 del plan anuncia «una sola línea» y también encuentra `HeroRoute.tsx`. | en curso al cerrar | pendiente (ronda 4) |

Verificación del corrector de la ronda 2: lint y tsc limpios; `e2e/home-t8.spec.ts` 16/16; suite completa 162/162 (146 + 16). Una primera pasada dio 42 «Internal Server Error» del servidor de desarrollo en los últimos archivos (seo, smoke, wizard) por carga de la máquina; al repetir, todo en verde. JS: +1 786 B sobre su base en ES5 (implementador), dentro del tope de +3 000 B.

## Cómo retomarlo en el Mac
```bash
cd <repo>                                  # en redesign/home, al día
scripts/agent/new-worktree.sh "$PWD" ../wt/task8 wt/task8 ca0dd63
git -C ../wt/task8 am "$PWD"/docs/superpowers/handoff/wip/task8/*.patch
git -C ../wt/task8 log --oneline -4        # e445319-equivalente en la punta
```
Luego:
1. **Revisión (ronda 3)** con `home-task-cycle` retomando la implementación: `tasks: [{ id: 8, title: "Del papel al dato", lines: <recalcular>, port: 3080, build: true, visual: true, lenses: ["compliance","quality","visual"], impl: { status: "done", base_commit: "ca0dd63…", head_commit: <punta del worktree>, verification: "…", decisions: [...] } , extra: <el de args-f3.json para T8> }]`, con `integrate: false`. Si la ronda 3 ya aprobó (tabla de arriba) y solo quedan detalles, basta con un corrector y pasar a integrar.
2. **Integración** con `home-integrate-serial` (`specFile: "e2e/home-t8.spec.ts"`, `measure: true`, `previousJs: "220 233 B (T7, 27d841d)"`). Cruces esperables: `page.tsx` (P1 quitó `next/dynamic`; T7 cambió Services/FlagshipAI por Thesis + CapabilitiesIndex; Dossier va después de Capacidades, contrato §3.5), `e2e/helpers.ts` (T8 añade `settledTopOffset` al final), diccionarios (T8 añade `dossier`), plan (T8 documentó decisiones en su sección). El tope de JS de T8 es +3 000 B sobre 220 233 B.
