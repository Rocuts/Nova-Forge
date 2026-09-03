// Hand-rolled inline SVG primitives for the RealTy landing.
//
// No charting library, no hooks, no "use client": every component here is a
// pure function of its props, so it renders identically on the server and on
// the client and can sit inside an `m.*` wrapper without dragging motion into
// this module. The four forms the page needs — a sparkline, a funnel, a meter
// and a stat tile — are each well under sixty lines, which is the same reason
// the product's own console draws its charts by hand.
//
// Palette (Orbexs design system, monochrome dominance):
//   ink    #0a0a0a (light) / #ffffff (dark)  — the data mark
//   muted  #a3a3a3                            — secondary text, AA on both grounds
//   track  #e5e5e5 (light) / #2a2a2a (dark)   — the unfilled part of a bar
//   accent #2563eb                            — the ONE highlighted series per view
// No gradients, no shadows, no glow. The only texture allowed anywhere on this
// page is the diagonal hatch of the "simulated" rows, and it lives in Console.tsx.
//
// Entry animation without hooks: every primitive takes `drawn`. It defaults to
// `true` (so a static render shows the finished chart) and the client sections
// pass `false` until the frame enters the viewport, at which point a CSS
// transition draws the line / grows the bar. `motion-reduce:transition-none`
// collapses that to an instant paint, so nothing branches on a runtime value
// during render and hydration always matches.
//
// Accessibility: each figure carries `role="img"` plus an `ariaLabel` composed
// by the caller from dictionary strings and data — never a hardcoded sentence,
// in any language. Because `role="img"` makes the subtree presentational, the
// caller's label must name the values the figure shows.

export type VizTone = "light" | "dark"

const INK: Record<VizTone, string> = { light: "#0a0a0a", dark: "#ffffff" }
const TRACK: Record<VizTone, string> = { light: "#e5e5e5", dark: "#2a2a2a" }
const MUTED = "#a3a3a3"
const ACCENT = "#2563eb"

/** Secondary text colour per ground — kept at #a3a3a3 or better for AA. */
const MUTED_TEXT: Record<VizTone, string> = { light: "text-[#525252]", dark: "text-[#a3a3a3]" }
const INK_TEXT: Record<VizTone, string> = { light: "text-[#0a0a0a]", dark: "text-white" }

const round = (n: number) => Math.round(n * 100) / 100

interface Point {
  x: number
  y: number
}

/** Map a series onto the drawing box. A flat series sits on the centre line. */
function toPoints(series: readonly number[], width: number, height: number, pad: number): Point[] {
  const n = series.length
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min
  return series.map((value, i) => ({
    x: round(pad + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1))),
    y: round(span === 0 ? pad + innerH / 2 : pad + innerH - ((value - min) / span) * innerH),
  }))
}

/**
 * Catmull-Rom through the points, emitted as cubic béziers with the standard
 * 1/6 tension. Deterministic and rounded, so the `d` string is byte-identical
 * on server and client.
 */
function smoothPath(points: readonly Point[]): string {
  if (points.length === 0) return ""
  const first = points[0]
  if (points.length === 1) return `M ${first.x} ${first.y}`
  let d = `M ${first.x} ${first.y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    d += ` C ${round(p1.x + (p2.x - p0.x) / 6)} ${round(p1.y + (p2.y - p0.y) / 6)},`
    d += ` ${round(p2.x - (p3.x - p1.x) / 6)} ${round(p2.y - (p3.y - p1.y) / 6)},`
    d += ` ${p2.x} ${p2.y}`
  }
  return d
}

/** Polyline length, rounded up — a good enough dasharray for a smoothed path. */
function pathLength(points: readonly Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return Math.ceil(total * 1.08) || 1
}

/* ── Sparkline ─────────────────────────────────────────────────────────────
   A 96×24 trend line: no area fill, no axes, no per-point labels. One end dot
   marks the current value. */

export interface SparklineProps {
  /** Ordered values, oldest first. Two points or more draw a line. */
  series: readonly number[]
  /** Composed by the caller, e.g. `${tile.label}: ${tile.value}`. */
  ariaLabel: string
  tone?: VizTone
  /** Paint in #2563eb. At most one accented series per view. */
  accent?: boolean
  /** Pass `false` until the frame is in view to draw the line on entry. */
  drawn?: boolean
  width?: number
  height?: number
  /** Stagger the draw across a row of tiles. */
  delayMs?: number
  className?: string
}

export function Sparkline({
  series,
  ariaLabel,
  tone = "dark",
  accent = false,
  drawn = true,
  width = 96,
  height = 24,
  delayMs = 0,
  className = "",
}: SparklineProps) {
  if (series.length === 0) return null
  const points = toPoints(series, width, height, 3)
  const last = points[points.length - 1]
  const length = pathLength(points)
  const color = accent ? ACCENT : INK[tone]

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      className={`block ${className}`}
    >
      <path
        d={smoothPath(points)}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[transition:stroke-dashoffset_900ms_ease-out] motion-reduce:transition-none"
        style={{ strokeDasharray: length, strokeDashoffset: drawn ? 0 : length, transitionDelay: `${delayMs}ms` }}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={1.75}
        fill={color}
        className="[transition:opacity_400ms_ease-out] motion-reduce:transition-none"
        style={{ opacity: drawn ? 1 : 0, transitionDelay: `${delayMs + 650}ms` }}
      />
    </svg>
  )
}

/* ── Meter ─────────────────────────────────────────────────────────────────
   A 6px bar with a 2px radius. Percentage widths and no viewBox, so the
   rounded ends never distort however wide the container is. */

export interface MeterProps {
  value: number
  max: number
  /** Composed by the caller, e.g. `${component.name}: 17 / 20`. */
  ariaLabel: string
  tone?: VizTone
  accent?: boolean
  drawn?: boolean
  /** Bar height in px. */
  height?: number
  delayMs?: number
  className?: string
}

export function Meter({
  value,
  max,
  ariaLabel,
  tone = "dark",
  accent = false,
  drawn = true,
  height = 6,
  delayMs = 0,
  className = "",
}: MeterProps) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const radius = Math.min(2, height / 2)

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      // `width` as a presentation attribute, not a `w-full` class: a class
      // would collide with a caller's own width utility (Tailwind's cascade
      // order, not the attribute order, would decide) and leave the bar at the
      // SVG default intrinsic size inside a max-content track.
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={`block ${className}`}
    >
      <rect x={0} y={0} width="100%" height={height} rx={radius} fill={TRACK[tone]} />
      <rect
        x={0}
        y={0}
        width={`${round(ratio * 100)}%`}
        height={height}
        rx={radius}
        fill={accent ? ACCENT : INK[tone]}
        className="[transition:transform_700ms_ease-out] motion-reduce:transition-none"
        style={{
          transform: drawn ? "scaleX(1)" : "scaleX(0)",
          transformBox: "fill-box",
          transformOrigin: "left center",
          transitionDelay: `${delayMs}ms`,
        }}
      />
    </svg>
  )
}

/* ── Funnel ────────────────────────────────────────────────────────────────
   Stage name left, proportional bar, count right. No percentages and no
   drop-off figures: the widths carry the shape, the counts carry the values.
   The rows are real HTML so the type stays crisp at any width; the figure as a
   whole is the `role="img"`, and its label must therefore name the stages. */

export interface FunnelStage {
  name: string
  count: number
}

export interface FunnelProps {
  stages: readonly FunnelStage[]
  /** Composed by the caller from the stage names and counts. */
  ariaLabel: string
  /** Optional visible caption above the chart. */
  label?: string
  tone?: VizTone
  /** Index of the one stage painted in the accent hue. */
  accentIndex?: number
  drawn?: boolean
  className?: string
}

export function Funnel({
  stages,
  ariaLabel,
  label,
  tone = "dark",
  accentIndex,
  drawn = true,
  className = "",
}: FunnelProps) {
  if (stages.length === 0) return null
  const peak = Math.max(...stages.map((stage) => stage.count), 1)

  return (
    <div className={className}>
      {label ? (
        <p className={`font-mono text-[10px] tracking-[0.22em] uppercase ${MUTED_TEXT[tone]}`}>{label}</p>
      ) : null}
      <div role="img" aria-label={ariaLabel} className={label ? "mt-4 space-y-[5px]" : "space-y-[5px]"}>
        {stages.map((stage, i) => (
          <div
            key={stage.name}
            className="grid grid-cols-[minmax(0,1fr)_1.15fr_auto] items-center gap-2 sm:gap-3"
          >
            <span className={`truncate text-[10px] leading-tight sm:text-[11px] ${MUTED_TEXT[tone]}`}>
              {stage.name}
            </span>
            <svg aria-hidden="true" height={8} preserveAspectRatio="none" className="block w-full">
              <rect x={0} y={0} width="100%" height={8} rx={2} fill={TRACK[tone]} />
              <rect
                x={0}
                y={0}
                width={`${round(Math.max((stage.count / peak) * 100, 2))}%`}
                height={8}
                rx={2}
                fill={i === accentIndex ? ACCENT : INK[tone]}
                className="[transition:transform_700ms_ease-out] motion-reduce:transition-none"
                style={{
                  transform: drawn ? "scaleX(1)" : "scaleX(0)",
                  transformBox: "fill-box",
                  transformOrigin: "left center",
                  transitionDelay: `${i * 55}ms`,
                }}
              />
            </svg>
            <span className={`font-mono text-[11px] tabular-nums ${INK_TEXT[tone]}`}>{stage.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── StatTile ──────────────────────────────────────────────────────────────
   Label, value, trend. The value uses proportional figures (a display number
   set in tabular figures reads loose); only columns get `tabular-nums`. */

export interface StatTileProps {
  label: string
  value: string
  series: readonly number[]
  tone?: VizTone
  accent?: boolean
  drawn?: boolean
  /** Defaults to `${label}: ${value}` — pass a richer one if the frame has it. */
  sparklineLabel?: string
  delayMs?: number
  className?: string
}

export function StatTile({
  label,
  value,
  series,
  tone = "dark",
  accent = false,
  drawn = true,
  sparklineLabel,
  delayMs = 0,
  className = "",
}: StatTileProps) {
  return (
    <div className={`px-4 py-4 sm:px-5 sm:py-5 ${className}`}>
      <p className={`font-mono text-[9px] leading-tight tracking-[0.2em] uppercase ${MUTED_TEXT[tone]}`}>{label}</p>
      <p className={`mt-2 font-heading text-2xl font-bold tracking-tight ${INK_TEXT[tone]}`}>{value}</p>
      <Sparkline
        series={series}
        ariaLabel={sparklineLabel ?? `${label}: ${value}`}
        tone={tone}
        accent={accent}
        drawn={drawn}
        delayMs={delayMs}
        className="mt-3"
      />
    </div>
  )
}

/** Exported for sections that need the same greys on a bare element. */
export const vizInk = INK
export const vizMuted = MUTED
export const vizTrack = TRACK
export const vizAccent = ACCENT
