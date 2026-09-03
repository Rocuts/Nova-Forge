"use client"
// The one true system diagram of the RealTy landing: four bands read top to
// bottom — channels, the RealTy orchestration layer, the three sources of
// truth, and the outcomes that leave through the same commercial record.
//
// Wide screens draw an inline SVG on a fixed 1200×748 viewBox, so the geometry
// is authored once in user units and never reflows. Everything below `xl` does
// NOT shrink that SVG (its 10 px node type would fall under 8 px): it renders
// the same dictionary text as stacked HTML cards joined by hairline connectors.
//
// Every string inside the SVG comes from props. Text is wrapped here rather
// than by the browser (SVG <text> has no line box), so the wrap helper below
// estimates advance width from the font size; the per-band char budgets are
// chosen against the authored copy and truncate rather than overflow.
import { ArrowDown, ArrowUpDown } from "lucide-react"
import { m, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import { Qualifier, SectionHeading, StatusChip, reveal, viewportConfig } from "./shared"
import type { RealtyContent, RealtyStatus } from "./shared"

type Props = {
  content: RealtyContent["architecture"]
  labels: RealtyContent["statusLabels"]
}

const STATUS_ORDER: readonly RealtyStatus[] = ["real", "simulated", "mock", "not_implemented", "planned"]

const MONO = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" } as const

/* ---------------------------------------------------------------- geometry */

const VB_W = 1200
const VB_H = 748

const GUTTER_W = 152
const AREA_X = 180
const AREA_W = 990
const AREA_CX = AREA_X + AREA_W / 2

const CH_Y = 26
const CH_H = 84
const BUS1_Y = 140

const ORCH_Y = 176
const ORCH_H = 196
const ORCH_PAD = 16
const ORCH_NODES_Y = 238
const ORCH_NODE_H = 112

const SRC_X = 258
const SRC_W = 834
const SRC_Y = 440
const SRC_H = 108

const RAIL_L = 214
const RAIL_R = 1136
const RAIL_BUS_Y = 590

const OUT_Y = 628
const OUT_H = 100

const ARROW_ID = "realty-arch-arrow"

/** Column x/width for `cols` evenly spaced boxes inside a track. */
function columns(x: number, width: number, cols: number, gap: number) {
  const w = (width - gap * (cols - 1)) / cols
  return Array.from({ length: cols }, (_, i) => ({ x: x + i * (w + gap), w }))
}

/* ------------------------------------------------------------------- text */

/** Rough advance width of one glyph, as a fraction of the font size. */
const EM = 0.53

function fitChars(px: number, fontSize: number) {
  return Math.max(6, Math.floor(px / (fontSize * EM)))
}

/** Greedy word wrap. Truncates with an ellipsis instead of overflowing a node. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars || !line) {
      line = next
      continue
    }
    lines.push(line)
    line = word
    if (lines.length === maxLines) break
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines) {
    const consumed = lines.join(" ")
    if (consumed.length < text.length) {
      lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, Math.max(1, maxChars - 1))}…`
    }
  }
  return lines
}

/* ------------------------------------------------------------------ atoms */

function StatusGlyph({ x, y, status }: { x: number; y: number; status: RealtyStatus }) {
  const common = { x, y, width: 6, height: 6 }
  switch (status) {
    case "real":
      return <rect {...common} fill="#0a0a0a" />
    case "simulated":
      return <rect {...common} fill="#0a0a0a" fillOpacity={0.4} />
    case "mock":
      return <rect {...common} fill="none" stroke="#0a0a0a" strokeOpacity={0.6} strokeWidth={1} />
    case "not_implemented":
      return (
        <rect {...common} fill="none" stroke="#0a0a0a" strokeOpacity={0.55} strokeWidth={1} strokeDasharray="2 1.6" />
      )
    default:
      return (
        <rect {...common} fill="none" stroke="#0a0a0a" strokeOpacity={0.55} strokeWidth={1} strokeDasharray="1 1.6" />
      )
  }
}

type NodeBoxProps = {
  x: number
  y: number
  w: number
  h: number
  node: { label: string; detail: string; status: RealtyStatus }
  labels: RealtyContent["statusLabels"]
  labelSlots: number
  labelSize: number
  detailSize: number
  detailSlots: number
  pad: number
}

function NodeBox({ x, y, w, h, node, labels, labelSlots, labelSize, detailSize, detailSlots, pad }: NodeBoxProps) {
  const inner = w - pad * 2
  const labelLines = wrap(node.label, fitChars(inner, labelSize), labelSlots)
  const detailLines = wrap(node.detail, fitChars(inner, detailSize), detailSlots)
  const labelTop = y + pad + labelSize * 0.85
  const labelLh = labelSize + 2.5
  const detailTop = y + pad + labelSlots * labelLh + detailSize * 0.9 + 3
  const detailLh = detailSize + 2.5

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#ffffff" stroke="#e5e5e5" strokeWidth={1} />
      {labelLines.map((line, i) => (
        <text
          key={`l${i}`}
          x={x + pad}
          y={labelTop + i * labelLh}
          fontSize={labelSize}
          fontWeight={600}
          fill="#0a0a0a"
        >
          {line}
        </text>
      ))}
      {detailLines.map((line, i) => (
        <text key={`d${i}`} x={x + pad} y={detailTop + i * detailLh} fontSize={detailSize} fill="#525252">
          {line}
        </text>
      ))}
      <StatusGlyph x={x + pad} y={y + h - pad - 8} status={node.status} />
      <text
        x={x + pad + 11}
        y={y + h - pad - 2}
        fontSize={8.5}
        fill="#737373"
        letterSpacing="0.14em"
        style={MONO}
      >
        {labels[node.status].toUpperCase()}
      </text>
    </g>
  )
}

type GutterProps = {
  index: string
  title: string
  caption: string
  centerY: number
  captionSlots: number
}

/** Band label column: mono index, mono title, small caption. */
function GutterLabel({ index, title, caption, centerY, captionSlots }: GutterProps) {
  const titleLines = wrap(title.toUpperCase(), 20, 2)
  const captionLines = wrap(caption, fitChars(GUTTER_W, 10), captionSlots)
  const stackH = 12 + titleLines.length * 14 + 6 + captionLines.length * 13
  const top = centerY - stackH / 2

  return (
    <g>
      <text x={0} y={top + 9} fontSize={9} fill="#737373" letterSpacing="0.2em" style={MONO}>
        {index}
      </text>
      {titleLines.map((line, i) => (
        <text
          key={`t${i}`}
          x={0}
          y={top + 23 + i * 14}
          fontSize={10}
          fontWeight={700}
          fill="#0a0a0a"
          letterSpacing="0.16em"
          style={MONO}
        >
          {line}
        </text>
      ))}
      {captionLines.map((line, i) => (
        <text
          key={`c${i}`}
          x={0}
          y={top + 12 + titleLines.length * 14 + 16 + i * 13}
          fontSize={10}
          fill="#707070"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ motion */

// `initial` is the same variant name for everyone: it is serialised into the
// server markup through the children's resolved variant, and useReducedMotion()
// is false during SSR — branching it mismatches on hydration. Reduced motion is
// expressed in the transitions only (see reveal() in ./shared).
function connectorGroup(reduced: boolean | null | undefined, band: number) {
  return {
    initial: "hidden",
    whileInView: "shown",
    viewport: viewportConfig,
    variants: {
      hidden: {},
      shown: {
        transition: {
          staggerChildren: reduced ? 0 : 0.05,
          delayChildren: reduced ? 0 : 0.15 + 0.22 * band,
        },
      },
    } satisfies Variants,
  }
}

// `hidden` is identical in both branches so the SSR and client markup agree;
// only the `shown` transition differs, and a zero-duration one snaps the
// connector into place on the first frame it is in view.
function pathVariants(reduced: boolean | null | undefined): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    shown: {
      pathLength: 1,
      opacity: 1,
      transition: reduced
        ? { duration: 0 }
        : { pathLength: { duration: 0.9, ease: "easeInOut" }, opacity: { duration: 0.25 } },
    },
  }
}

const LINE = { stroke: "#a3a3a3", strokeWidth: 1, fill: "none" } as const

/* --------------------------------------------------------------- section */

export function RealtyArchitecture({ content, labels }: Props) {
  const reduced = useReducedMotion()

  const byKey = (key: string) => content.layers.find((l) => l.key === key)
  const channels = byKey("channels")
  const orchestration = byKey("orchestration")
  const sources = byKey("sources")
  const outcomes = byKey("outcomes")

  const titleId = "realty-architecture-title"
  const descId = "realty-architecture-desc"

  const chCols = columns(AREA_X, AREA_W, channels?.nodes.length ?? 5, 14)
  const orchCols = columns(AREA_X + ORCH_PAD, AREA_W - ORCH_PAD * 2, orchestration?.nodes.length ?? 6, 10)
  const srcCols = columns(SRC_X, SRC_W, sources?.nodes.length ?? 3, 22)
  const outCols = columns(AREA_X, AREA_W, outcomes?.nodes.length ?? 5, 14)

  const paths = pathVariants(reduced)

  return (
    <section id={content.id} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading head={content} tone="light" />

        {/* ---------------------------------------------------- desktop SVG */}
        {/*
          The viewBox is 1200 units wide, so the diagram is only ever drawn at
          `xl`, where the container (max-w-7xl minus px-6) is 1232 px and the
          scale lands at 1:1. Any narrower and the 10 px node type would shrink
          below 8 px, so the stacked variant takes over instead — a shrunk
          diagram nobody can read is worse than an honest list.
        */}
        <m.div {...reveal(reduced, 0, 12)} className="hidden xl:block">
          <svg
            role="img"
            aria-labelledby={`${titleId} ${descId}`}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto"
            style={{ fontFamily: "inherit" }}
          >
            <title id={titleId}>{content.title}</title>
            <desc id={descId}>{content.flowLabel}</desc>

            <defs>
              <marker
                id={ARROW_ID}
                viewBox="0 0 10 10"
                refX={9}
                refY={5}
                markerWidth={9}
                markerHeight={9}
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#737373" />
              </marker>
            </defs>

            {/* Band 01 — channels */}
            <m.g {...reveal(reduced, 0, 8)}>
              <GutterLabel
                index="01"
                title={channels?.title ?? ""}
                caption={channels?.caption ?? ""}
                centerY={CH_Y + CH_H / 2}
                captionSlots={2}
              />
              {channels?.nodes.map((node, i) => (
                <NodeBox
                  key={node.label}
                  x={chCols[i].x}
                  y={CH_Y}
                  w={chCols[i].w}
                  h={CH_H}
                  node={node}
                  labels={labels}
                  labelSlots={1}
                  labelSize={13}
                  detailSize={10.5}
                  detailSlots={2}
                  pad={12}
                />
              ))}
            </m.g>

            {/* channels → orchestration: verticals into a bus, one arrow down */}
            <m.g {...connectorGroup(reduced, 0)}>
              {chCols.map((col, i) => (
                <m.path
                  key={`c${i}`}
                  variants={paths}
                  d={`M ${col.x + col.w / 2} ${CH_Y + CH_H} V ${BUS1_Y}`}
                  {...LINE}
                />
              ))}
              <m.path
                variants={paths}
                d={`M ${chCols[0].x + chCols[0].w / 2} ${BUS1_Y} H ${chCols[chCols.length - 1].x + chCols[chCols.length - 1].w / 2}`}
                {...LINE}
              />
              <m.path
                variants={paths}
                d={`M ${AREA_CX} ${BUS1_Y} V ${ORCH_Y}`}
                markerEnd={`url(#${ARROW_ID})`}
                {...LINE}
              />
            </m.g>

            {/* Band 02 — the RealTy orchestration layer */}
            <m.g {...reveal(reduced, 1, 8)}>
              <GutterLabel
                index="02"
                title={orchestration?.title ?? ""}
                caption={orchestration?.caption ?? ""}
                centerY={ORCH_Y + ORCH_H / 2}
                captionSlots={4}
              />
              <rect
                x={AREA_X}
                y={ORCH_Y}
                width={AREA_W}
                height={ORCH_H}
                rx={6}
                fill="#f8f8f8"
                stroke="#0a0a0a"
                strokeWidth={1}
              />
              <text
                x={AREA_X + ORCH_PAD}
                y={ORCH_Y + 26}
                fontSize={10}
                fill="#525252"
                letterSpacing="0.22em"
                style={MONO}
              >
                {content.centerLabel.toUpperCase()}
              </text>
              <line
                x1={AREA_X + ORCH_PAD}
                y1={ORCH_Y + 40}
                x2={AREA_X + AREA_W - ORCH_PAD}
                y2={ORCH_Y + 40}
                stroke="#d4d4d4"
                strokeWidth={1}
              />
              {orchestration?.nodes.map((node, i) => (
                <NodeBox
                  key={node.label}
                  x={orchCols[i].x}
                  y={ORCH_NODES_Y}
                  w={orchCols[i].w}
                  h={ORCH_NODE_H}
                  node={node}
                  labels={labels}
                  labelSlots={2}
                  labelSize={12}
                  detailSize={10}
                  detailSlots={3}
                  pad={11}
                />
              ))}
            </m.g>

            {/* orchestration ↔ sources: one pair of opposed arrows per source */}
            <m.g {...connectorGroup(reduced, 1)}>
              {srcCols.map((col, i) => (
                <g key={`s${i}`}>
                  <m.path
                    variants={paths}
                    d={`M ${col.x + col.w / 2 - 9} ${ORCH_Y + ORCH_H} V ${SRC_Y}`}
                    markerEnd={`url(#${ARROW_ID})`}
                    {...LINE}
                  />
                  <m.path
                    variants={paths}
                    d={`M ${col.x + col.w / 2 + 9} ${SRC_Y} V ${ORCH_Y + ORCH_H}`}
                    markerEnd={`url(#${ARROW_ID})`}
                    {...LINE}
                  />
                </g>
              ))}
            </m.g>

            {/* Band 03 — sources of truth */}
            <m.g {...reveal(reduced, 2, 8)}>
              <GutterLabel
                index="03"
                title={sources?.title ?? ""}
                caption={sources?.caption ?? ""}
                centerY={SRC_Y + SRC_H / 2}
                captionSlots={3}
              />
              {sources?.nodes.map((node, i) => (
                <NodeBox
                  key={node.label}
                  x={srcCols[i].x}
                  y={SRC_Y}
                  w={srcCols[i].w}
                  h={SRC_H}
                  node={node}
                  labels={labels}
                  labelSlots={1}
                  labelSize={13}
                  detailSize={10.5}
                  detailSlots={3}
                  pad={12}
                />
              ))}
            </m.g>

            {/* orchestration → outcomes: two rails around the sources band */}
            <m.g {...connectorGroup(reduced, 2)}>
              <m.path variants={paths} d={`M ${RAIL_L} ${ORCH_Y + ORCH_H} V ${RAIL_BUS_Y}`} {...LINE} />
              <m.path variants={paths} d={`M ${RAIL_R} ${ORCH_Y + ORCH_H} V ${RAIL_BUS_Y}`} {...LINE} />
              <m.path variants={paths} d={`M ${RAIL_L} ${RAIL_BUS_Y} H ${RAIL_R}`} {...LINE} />
              {outCols.map((col, i) => (
                <m.path
                  key={`o${i}`}
                  variants={paths}
                  d={`M ${col.x + col.w / 2} ${RAIL_BUS_Y} V ${OUT_Y}`}
                  markerEnd={`url(#${ARROW_ID})`}
                  {...LINE}
                />
              ))}
            </m.g>

            {/* Band 04 — outcomes */}
            <m.g {...reveal(reduced, 3, 8)}>
              <GutterLabel
                index="04"
                title={outcomes?.title ?? ""}
                caption={outcomes?.caption ?? ""}
                centerY={OUT_Y + OUT_H / 2}
                captionSlots={2}
              />
              {outcomes?.nodes.map((node, i) => (
                <NodeBox
                  key={node.label}
                  x={outCols[i].x}
                  y={OUT_Y}
                  w={outCols[i].w}
                  h={OUT_H}
                  node={node}
                  labels={labels}
                  labelSlots={2}
                  labelSize={13}
                  detailSize={10.5}
                  detailSlots={2}
                  pad={12}
                />
              ))}
            </m.g>
          </svg>
        </m.div>

        {/* ------------------------------------------------- mobile stacked */}
        <div className="xl:hidden">
          {content.layers.map((layer, i) => (
            <div key={layer.key}>
              <m.div
                {...reveal(reduced, i, 8)}
                className="border border-[#e5e5e5] rounded-[6px] overflow-hidden bg-white"
              >
                <div
                  className={`px-4 py-4 border-b ${
                    layer.key === "orchestration" ? "bg-[#f8f8f8] border-[#d4d4d4]" : "border-[#e5e5e5]"
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[#737373]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-[#0a0a0a]">
                      {layer.title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#707070]">{layer.caption}</p>
                  {layer.key === "orchestration" && (
                    <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#525252]">
                      {content.centerLabel}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5e5e5]">
                  {layer.nodes.map((node) => (
                    <div key={node.label} className="bg-white px-4 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <p className="text-sm font-semibold tracking-tight text-[#0a0a0a]">{node.label}</p>
                        <StatusChip status={node.status} labels={labels} tone="light" />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#707070]">{node.detail}</p>
                    </div>
                  ))}
                </div>
              </m.div>
              {i < content.layers.length - 1 && (
                <div aria-hidden="true" className="flex flex-col items-center py-4 text-[#a3a3a3]">
                  <span className="w-[1px] h-5 bg-[#d4d4d4]" />
                  {layer.key === "orchestration" ? (
                    <ArrowUpDown size={14} strokeWidth={1.5} />
                  ) : (
                    <ArrowDown size={14} strokeWidth={1.5} />
                  )}
                  <span className="w-[1px] h-5 bg-[#d4d4d4]" />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-[#707070]">{content.flowLabel}</p>

        <div className="mt-10 pt-8 border-t border-[#e5e5e5]">
          <p className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-[#525252] mb-4">
            {content.legendTitle}
          </p>
          <ul className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => (
              <li key={status}>
                <StatusChip status={status} labels={labels} tone="light" />
              </li>
            ))}
          </ul>
        </div>

        <Qualifier text={content.qualifier} tone="light" />
      </div>
    </section>
  )
}
