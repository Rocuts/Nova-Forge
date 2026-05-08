// Orbexs · Capabilities Brief — A4 vertical, 1 página
// Aesthetic ref: Linear changelog / Vercel marketing / Anduril / Bloomberg
// Layout: grid 12-col implícito, alineación izquierda por defecto

#set document(title: "Orbexs · Capabilities Brief", author: "Orbexs LLC")
#set page(paper: "a4", margin: (x: 18mm, y: 16mm))

// ── Paleta (TOLERANCIA 0) ──
#let ink   = rgb("#0a0a0a")
#let ink-2 = rgb("#525252")
#let ink-3 = rgb("#a3a3a3")
#let line-c = rgb("#e5e5e5")
#let accent = rgb("#2563eb") // reservado, no usado en esta versión

// ── Tipografía base ──
#set text(font: ("Inter", "Helvetica Neue"), size: 9pt, fill: ink-2, lang: "es")
#set par(leading: 0.45em, justify: false)

// ── Helpers ──
#let mono(body, size: 8pt, fill: ink, tracking: 0pt) = text(
  body,
  font: ("JetBrains Mono", "Menlo"),
  size: size,
  fill: fill,
  tracking: tracking,
)
#let eyebrow(t) = mono(upper(t), size: 8pt, fill: ink, tracking: 0.3em)
#let hline = line(length: 100%, stroke: 0.5pt + line-c)

#let cap-card(num, title, desc) = box(
  width: 100%,
  height: 100%,
  inset: 8pt,
  stroke: 0.5pt + line-c,
)[
  #mono(num, size: 7.5pt, fill: ink-3)
  #v(3pt)
  #text(title, font: "Inter", size: 9.5pt, weight: 600, fill: ink)
  #v(2pt)
  #text(desc, font: "Inter", size: 8pt, fill: ink-2)
]

#let metric(num, label) = stack(
  spacing: 4pt,
  text(num, font: "Inter", size: 22pt, weight: 600, fill: ink, tracking: -0.03em),
  mono(upper(label), size: 7.5pt, fill: ink-2, tracking: 0.08em),
)

#let step(num, name) = box(
  mono(num, size: 8pt, fill: ink-3) + h(4pt) + text(name, font: "Inter", size: 8.5pt, weight: 500, fill: ink)
)
#let arrow = h(8pt) + mono([→], size: 10pt, fill: ink-3) + h(8pt)

#let stackcol(label, items) = stack(
  spacing: 5pt,
  mono(upper(label), size: 7.5pt, fill: ink-3, tracking: 0.18em),
  mono(items.join(" · "), size: 7.5pt, fill: ink),
)

// ─── 1. HEADER ────────────────────────────────────────────
#grid(
  columns: (1fr, auto),
  align: (left + horizon, right + horizon),
  text("Orbexs", font: "Inter", size: 14pt, weight: 700, fill: ink, tracking: -0.05em),
  mono("MISSION-CRITICAL INFRASTRUCTURE · v1.0 · 2026", size: 8pt, fill: ink-2),
)
#v(3pt)
#hline
#v(8pt)

// ─── 2. HERO ──────────────────────────────────────────────
#eyebrow("Capabilities Brief · Confidencial")
#v(7pt)
#text("Construimos soberanía digital.",
  font: "Inter", size: 28pt, weight: 700, fill: ink, tracking: -0.04em,
)
#v(5pt)
// 88% de ancho para crear breathing room sin partir el copy
#block(width: 88%)[
  #text(font: "Inter", size: 11pt, fill: ink-2)[
    Ingeniería de software mission-critical, IA soberana, ciberseguridad agéntica
    y operaciones autónomas para gobiernos y organizaciones que operan bajo los
    estándares más exigentes del mundo.
  ]
]
#v(11pt)
#hline
#v(9pt)

// ─── 3. MÉTRICAS ──────────────────────────────────────────
// Divisor vertical = stroke izquierdo de las cajas 2 y 3
#grid(
  columns: (1fr, 1fr, 1fr),
  column-gutter: 14pt,
  metric([\$2M+], "En contratos enterprise activos"),
  box(stroke: (left: 0.5pt + line-c), inset: (left: 14pt))[
    #metric("99.9%", "Uptime en sistemas desplegados")
  ],
  box(stroke: (left: 0.5pt + line-c), inset: (left: 14pt))[
    #metric("4", "Industrias reguladas atendidas")
  ],
)
#v(11pt)
#hline
#v(9pt)

// ─── 4. CAPACIDADES (4×2) ─────────────────────────────────
#eyebrow("Capacidades")
#v(7pt)
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  rows: (1fr, 1fr),
  column-gutter: 6pt,
  row-gutter: 6pt,
  cap-card("01", "IA Soberana",            "Infraestructura de IA bajo control total: on-premise, LLMs privados."),
  cap-card("02", "Ciberseguridad Agéntica","Agentes autónomos que auditan, detectan y responden 24/7."),
  cap-card("03", "Personal Ejecutivo IA",  "Asistentes en WhatsApp, Slack, Teams y email, siempre activos."),
  cap-card("04", "Sistemas Críticos",      "Arquitectura distribuida de alta disponibilidad y Zero-Trust."),
  cap-card("05", "Inteligencia Operativa", "Centros de comando con datos unificados y alertas predictivas."),
  cap-card("06", "Automatización de Gobierno","Workflows regulatorios con cadena de custodia digital."),
  cap-card("07", "Enriquecimiento de Datos","75+ fuentes autorizadas, 99.2% precisión, residencia soberana."),
  cap-card("08", "Extracción de Datos",    "Scrapers con IA para OSINT, monitoreo regulatorio y registros públicos."),
)
#v(11pt)
#hline
#v(9pt)

// ─── 5. METODOLOGÍA ───────────────────────────────────────
#eyebrow("The Orbexs Standard")
#v(7pt)
#step("01", "Diagnóstico")#arrow#step("02", "Arquitectura")#arrow#step("03", "Ingeniería")#arrow#step("04", "Validación")#arrow#step("05", "Operación")
#v(11pt)
#hline
#v(9pt)

// ─── 6. STACK ─────────────────────────────────────────────
#eyebrow("Stack")
#v(7pt)
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  column-gutter: 14pt,
  stackcol("AI",          ("Anthropic", "OpenAI", "LLaMA", "Mistral", "LangChain", "PyTorch", "Ollama")),
  stackcol("Cloud",       ("AWS", "GCP", "Azure", "Kubernetes", "Terraform")),
  stackcol("Seguridad",   ("Zero Trust", "SIEM/SOAR", "EDR/XDR", "Red/Blue Team", "WAF")),
  stackcol("Cumplimiento",("SOC 2", "ISO 27001", "GDPR", "NIST CSF", "PCI DSS")),
)
#v(11pt)
#hline
#v(9pt)

// ─── 7. EQUIPO ────────────────────────────────────────────
#eyebrow("Equipo")
#v(7pt)
#mono(
  "JR Johan Rocuts · CEO  |  YG Yeison Grisales · CCO  |  CM Cristian Mancilla · CTO  |  AR Andres Rodriguez · Lead Engineer",
  size: 8pt, fill: ink-2,
)
#v(11pt)
#hline
#v(9pt)

// ─── 8. QUOTE ─────────────────────────────────────────────
#text(
  "«La soberanía digital no es una tendencia — es el estándar inevitable para toda organización que opera con datos sensibles.»",
  font: "Inter", size: 11pt, style: "italic", fill: ink,
)
#v(4pt)
#mono("— Johan Rocuts, CEO", size: 7.5pt, fill: ink-2)
#v(11pt)
#hline
#v(9pt)

// ─── 9. CTA + CONTACTO ────────────────────────────────────
#grid(
  columns: (1.2fr, 1fr),
  column-gutter: 20pt,
  align: (left + top, right + top),
  [
    #text("Hablemos de su próximo sistema.",
      font: "Inter", size: 11pt, weight: 600, fill: ink, tracking: -0.02em,
    )
    #v(3pt)
    #text("Agende una evaluación técnica. Sin templates genéricos.",
      font: "Inter", size: 8pt, fill: ink-2,
    )
  ],
  align(right)[
    #set text(font: ("JetBrains Mono", "Menlo"), size: 8pt, fill: ink)
    contact\@orbexs.tech \
    wa.me/573015244404 \
    cal.com/orbexs/diagnostico \
    orbexs.tech
  ],
)
#v(11pt)
#hline
#v(5pt)

// ─── 10. FOOTER ───────────────────────────────────────────
#mono("© 2026 Orbexs LLC · Todos los derechos reservados · Documento confidencial",
  size: 7pt, fill: ink-3,
)
