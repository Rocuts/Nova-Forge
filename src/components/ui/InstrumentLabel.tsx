import { cn } from "@/lib/utils"

interface InstrumentLabelProps {
  children: React.ReactNode
  /** Tono de la SUPERFICIE sobre la que va la etiqueta (plan §3.1). */
  tone?: "light" | "dark"
  as?: "span" | "p" | "div"
  className?: string
}

/**
 * Capa de instrumento: índices (`/01`), contadores (`02 / 04`), eyebrows y
 * "Imagen ilustrativa". Geist Mono 10–11 px en mayúsculas.
 * Sobre blanco o #f8f8f8 → #707070 (4,66:1); sobre oscuro → #a3a3a3.
 */
export function InstrumentLabel({ children, tone = "dark", as: Tag = "span", className }: InstrumentLabelProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.3em] md:text-[11px]",
        tone === "dark" ? "text-[#a3a3a3]" : "text-[#707070]",
        className,
      )}
    >
      {children}
    </Tag>
  )
}
