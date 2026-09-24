import { cn } from "@/lib/utils"
import type { StageMode } from "@/hooks/useStageProgress"

// La altura larga y el sticky los pone solo CSS (stage:), igual en el
// servidor y en el cliente: la hidratación no mueve el layout (CLS). En celular
// o con reducir movimiento la sección es un bloque normal.
const TRACK_CLASS = {
  short: "stage:h-[160svh]",
  long: "stage:h-[250svh]",
} as const

const FRAME_CLASS = "relative stage:sticky stage:top-0 stage:h-svh stage:overflow-hidden"

interface ScrollStageProps {
  ref?: React.Ref<HTMLElement>
  id?: string
  track: "short" | "long"
  mode: StageMode
  theme: "light" | "dark"
  /** Primera sección oscura de la página: el encabezado ya es claro antes de hidratar. */
  startsDark?: boolean
  className?: string
  frameClassName?: string
  children: React.ReactNode
}

/**
 * Escenario de scroll: contenedor alto + marco `sticky` (`top-0 h-svh`).
 * Sin hooks: el modo lo calcula la isla cliente que lo usa (useStageProgress)
 * y aquí solo se expone en `data-stage-mode` para las pruebas.
 */
export function ScrollStage({
  ref,
  id,
  track,
  mode,
  theme,
  startsDark = false,
  className,
  frameClassName,
  children,
}: ScrollStageProps) {
  return (
    <section
      ref={ref}
      id={id}
      data-header-theme={theme}
      data-header-start={startsDark ? "dark" : undefined}
      data-stage-mode={mode}
      className={cn("relative", TRACK_CLASS[track], className)}
    >
      <div data-stage-frame="" className={cn(FRAME_CLASS, frameClassName)}>
        {children}
      </div>
    </section>
  )
}
