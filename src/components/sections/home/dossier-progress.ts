// Estado de extracción del expediente ("Del papel al dato", §5.4 del diseño).
// Módulo puro, sin React ni DOM: lo usan DossierStage.tsx y las pruebas e2e.

import { DOSSIER_FIELDS } from "./geometry"

// Una sola fuente para el número de campos: los recuadros medidos sobre la
// imagen. DossierContent.fields es una tupla de esa misma longitud (tsc obliga
// a que los diccionarios traigan un nombre por recuadro).
export const DOSSIER_FIELD_COUNT = DOSSIER_FIELDS.length
// Modo inView (celular): el primer campo al arrancar la secuencia y otro cada 700 ms.
export const DOSSIER_STEP_MS = 700

export type FieldState = "idle" | "active" | "done"

export interface Extraction {
  /** Campos terminados, 0…count. Los índices < done están "done". */
  done: number
  /** Índice del campo que se está extrayendo (el único azul), o null. */
  active: number | null
}

export const EXTRACTION_IDLE: Extraction = { done: 0, active: null }

/**
 * Modo scrub. `progress` es el avance 0→1 del contenedor fijo.
 * s = min(1, p·1,1)·count; done = floor(s);
 * active = done < count && s − done > 0,15 ? done : null.
 * El factor 1,1 deja el último ~9 % del recorrido con todos los campos terminados;
 * el umbral 0,15 deja un respiro sin azul entre un campo y el siguiente.
 */
export function extractionAt(progress: number, count: number = DOSSIER_FIELD_COUNT): Extraction {
  const s = Math.min(1, Math.max(0, progress) * 1.1) * count
  const done = Math.floor(s)
  const active = done < count && s - done > 0.15 ? done : null
  return { done, active }
}

/**
 * Modo inView. `step` = pasos dados desde que arrancó la secuencia (la región
 * de los campos o el panel llegaron a la mitad central del viewport; -1 =
 * todavía no): el paso 0 al arrancar y uno más cada 700 ms. En el paso k el
 * campo k está activo y los anteriores terminados; en el paso count, todos
 * terminados y ninguno activo.
 */
export function extractionAtStep(step: number, count: number = DOSSIER_FIELD_COUNT): Extraction {
  if (step < 0) return EXTRACTION_IDLE
  const done = Math.min(step, count)
  return { done, active: done < count ? done : null }
}

/** Modo static (reducir movimiento): todos los campos terminados, ninguno activo. */
export function extractionComplete(count: number = DOSSIER_FIELD_COUNT): Extraction {
  return { done: count, active: null }
}

export function fieldState(index: number, extraction: Extraction): FieldState {
  if (index < extraction.done) return "done"
  if (index === extraction.active) return "active"
  return "idle"
}
