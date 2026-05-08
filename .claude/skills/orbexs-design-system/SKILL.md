---
name: orbexs-design-system
description: >
  Orbexs ecosystem visual identity and design system. Enforces the exact color palette,
  typography (Geist), spacing scale, border radius, animation curves, component patterns,
  and layout conventions used across all Orbexs products. Use whenever building UI for
  any Orbexs project — websites, dashboards, apps, or landing pages — to guarantee
  visual consistency across the entire ecosystem.
when_to_use: >
  When creating UI components, pages, layouts, or any visual element for a Orbexs product.
  When styling with Tailwind, writing CSS, choosing colors, picking fonts, defining animations,
  or designing component variants. When building a new Orbexs app or adding features to
  an existing one. When someone asks about the Orbexs brand, visual style, or design tokens.
allowed-tools: Read Grep Glob
---

# Orbexs Design System

You are building for the Orbexs ecosystem. Every UI decision MUST follow this design system.
Orbexs is a high-end AI & Software agency. The aesthetic is **minimalist, architectural,
and enterprise-grade** — not playful, not skeuomorphic, not generic "SaaS template" style.

## Design Philosophy

- **Monochromatic dominance**: Black, white, and graduated grays. Color is used surgically, never decoratively.
- **Precision over ornament**: Sharp edges (2px radius on buttons), thin 1px borders, no drop shadows on cards.
- **Motion with purpose**: Every animation communicates hierarchy or state — never decorative.
- **Typography-driven**: Geist font family carries the brand. Headlines are bold and fluid-scaled.
- **Generous whitespace**: Sections breathe with `py-32` (128px). Density is the enemy.
- **Accessibility-first**: All motion respects `prefers-reduced-motion`. Focus states are visible and consistent.

## Anti-Patterns (NEVER do these)

- Colorful gradients, rainbow effects, or neon glows on UI elements
- Drop shadows on cards or panels (use border color shifts instead)
- Rounded corners larger than 8px (the max radius is `--radius-xl: 8px`)
- Generic sans-serif fonts — always use Geist
- Decorative animations without informational purpose
- Skeleton loaders with animated shimmer (use static placeholders)
- Thick borders (always 1px)
- Opacity-based text hierarchy on light backgrounds (use the specific gray values)

---

## Quick Reference: Design Tokens

### Color Palette

```
SURFACES (light)          SURFACES (dark)
#ffffff  surface-base     #0a0a0a  surface-dark
#f8f8f8  surface-elevated #141414  surface-dark-elevated
#e5e5e5  surface-border   #1a1a1a  surface-border-dark

TEXT (on light)           TEXT (on dark)
#0a0a0a  text-primary     #ffffff  text-on-dark
#525252  text-secondary   #a3a3a3  text-on-dark-secondary
#a3a3a3  text-tertiary

ACCENT
#0a0a0a  accent (primary — same as text-primary)
#2563eb  accent-blue (secondary — used sparingly)

3D / WEBGL ONLY
#00f0ff  cyan (particles, glow)
#2563eb  blue
#94a3b8  slate
#18181b  zinc
```

### Typography

```
Font family:  Geist (--font-sans, --font-heading)
Monospace:    Geist Mono (--font-mono)
Smoothing:    antialiased (both webkit and moz)

Fluid scale:
  Hero:    clamp(3.5rem, 8vw, 7rem)     — font-bold, tracking-tight
  H1:      clamp(2.5rem, 6vw, 5rem)     — font-bold, tracking-tight
  H2:      clamp(1.5rem, 3vw, 2.25rem)  — font-semibold, tracking-tight
  Body:    clamp(1.05rem, 1.5vw, 1.25rem) — font-normal, leading-relaxed

Eyebrows:  text-[10px] font-bold uppercase tracking-[0.3em] to tracking-[0.35em]
Labels:    text-sm font-medium
Small:     text-xs font-medium tracking-wide
```

### Spacing

```
Section padding:   py-32 (128px) — standard vertical rhythm
Compact section:   py-12 (48px) or py-24 (96px)
Container:         max-w-7xl mx-auto px-6
Card padding:      p-8 to p-12
Grid gaps:         gap-6 (cards), gap-8, gap-12, gap-16 (sections)
```

### Border Radius

```
--radius-sm:  2px   (buttons, small interactive elements)
--radius-md:  4px   (inputs, badges)
--radius-lg:  6px   (cards, panels, containers)
--radius-xl:  8px   (maximum — never exceed)
```

### Section Background Alternation

```
Pattern: white (#fff) -> light gray (#f8f8f8) -> white -> dark (#0a0a0a)
Dividers: border-t border-[#e5e5e5] (light) or border-white/10 (dark)
```

---

## Quick Reference: Components

### Buttons

```
Primary:    bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] rounded-[2px]
Secondary:  border border-[#d4d4d4] bg-transparent hover:bg-[#f5f5f5] hover:border-[#a3a3a3] rounded-[2px]
Ghost:      bg-transparent text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[2px]

Sizes:
  sm: px-5 py-2.5 text-xs font-medium tracking-wide
  md: px-7 py-3 text-sm font-medium
  lg: px-10 py-4 text-base font-medium

Interaction: whileTap={{ scale: 0.98 }}
Focus: focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2
```

### Cards / Panels

```
Light:  bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] hover:border-[#d4d4d4]
Dark:   bg-[#141414] border border-[#1a1a1a] rounded-[6px] hover:border-[#2a2a2a]

Hover effect: hover:-translate-y-[2px] (respects prefers-reduced-motion)
Transition:   transition-all duration-300 ease-out
Padding:      p-8 (standard) or p-10 to p-12 (spacious)
NO shadows — ever.
```

### Inputs / Forms

```
Style:       border-b border-[#e5e5e5] bg-transparent py-4 (underline-only)
Focus:       border-[#0a0a0a] outline-none
Placeholder: text-[#a3a3a3]
Label:       text-sm font-medium text-[#0a0a0a]

Chip selectors:
  Unselected: border border-[#e5e5e5] text-[#525252] bg-transparent
  Selected:   bg-[#0a0a0a] text-white border-[#0a0a0a]
```

---

## Quick Reference: Motion

### Easing Curves

```typescript
smooth:    [0.25, 0.1, 0.25, 1]   // Editorial entrance — default for most animations
decel:     [0, 0, 0.2, 1]         // Controlled deceleration
entrance:  [0.22, 1, 0.36, 1]     // Precise entrance — stagger items, FAQ, reveals
```

### Durations

```typescript
fast:    0.3s   // Hovers, micro-interactions
normal:  0.5s   // Fade-ups, standard transitions
slow:    0.7s   // Text reveals, dramatic entrances
section: 0.8s   // Full section reveals on scroll
```

### Animation Variants

```typescript
// Fade up — the bread and butter
fadeUp:    { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

// Stagger container
stagger:   { staggerChildren: 0.1, delayChildren: 0.1 }

// Section reveal
section:   { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

// Viewport triggers
viewportOnce:    { once: true, margin: "-80px" }
viewportSection: { once: true, margin: "-120px" }
```

### Spring Configurations

```typescript
magnetic:    { stiffness: 150, damping: 15 }         // Magnetic buttons, cursor
crisp:       { stiffness: 400, damping: 25 }          // Logo, snappy feedback
parallax:    { stiffness: 100, damping: 30, mass: 0.5 } // Scroll parallax
entrance:    { stiffness: 80, damping: 25 }           // Section entrances
form:        { stiffness: 260, damping: 20 }          // Form interactions
```

### Stagger Patterns

```
Word-level text reveal:     staggerChildren: 0.06
Character-level reveal:     staggerChildren: 0.02
Card/item stagger:          staggerChildren: 0.1
Section element stagger:    delay: 0.15 * index
```

---

## Detailed References

For in-depth specifications, see:
- [tokens.md](tokens.md) — Complete design token reference with all values
- [components.md](components.md) — All component patterns, variants, and code examples
- [motion.md](motion.md) — Full animation system, spring configs, and interaction patterns
- [layout.md](layout.md) — Page structure, section patterns, responsive grid, and navigation
