import { cn } from "@/lib/utils"

/**
 * Marco 3:2 que se comporta como `object-fit: cover` con punto focal
 * (`--fx` / `--fy`, por defecto 50 %). La imagen (`next/image` con `fill`) y su
 * superposición `<svg viewBox="0 0 1536 1024">` van dentro y comparten caja,
 * así que siempre coinciden. `object-position` no se puede reproducir en SVG:
 * por eso el encuadre lo hace el marco y no la imagen. CSS en globals.css.
 *
 * El padre debe estar posicionado (el marco es `absolute inset-0`). La vista
 * previa de la imagen va con `placeholder={coverPlaceholder(imagen)}`
 * (src/lib/image-placeholder.ts), no con `placeholder="blur"`, que a este
 * tamaño bloquea el hilo principal en equipos sin GPU.
 */
export function FocalCover({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("focal-frame", className)}>
      <div className="focal-cover">{children}</div>
    </div>
  )
}
