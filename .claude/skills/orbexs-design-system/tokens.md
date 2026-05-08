# Orbexs Design Tokens — Complete Reference

## Color System

The palette is monochromatic with a single accent. All values are absolute hex — no opacity
variants except where explicitly listed. When building on dark backgrounds, use the dark
surface and text tokens; do not apply opacity to light-mode tokens.

### Surfaces

| Token                    | Hex       | Usage                                    |
|--------------------------|-----------|------------------------------------------|
| `surface-base`           | `#ffffff` | Default page background                  |
| `surface-elevated`       | `#f8f8f8` | Cards, panels, alternate section bg      |
| `surface-border`         | `#e5e5e5` | Borders, dividers on light backgrounds   |
| `surface-dark`           | `#0a0a0a` | Dark section backgrounds                 |
| `surface-dark-elevated`  | `#141414` | Cards and panels on dark backgrounds     |
| `surface-border-dark`    | `#1a1a1a` | Borders, dividers on dark backgrounds    |

### Hover Border Colors

| Context      | Default     | Hover       |
|--------------|-------------|-------------|
| Light card   | `#e5e5e5`   | `#d4d4d4`   |
| Dark card    | `#1a1a1a`   | `#2a2a2a`   |
| Secondary btn| `#d4d4d4`   | `#a3a3a3`   |

### Text Colors

| Token                    | Hex       | Usage                                      |
|--------------------------|-----------|--------------------------------------------|
| `text-primary`           | `#0a0a0a` | Headlines, primary body text on light      |
| `text-secondary`         | `#525252` | Descriptions, secondary copy on light      |
| `text-tertiary`          | `#a3a3a3` | Disabled text, hints, placeholders         |
| `text-on-dark`           | `#ffffff` | Primary text on dark backgrounds           |
| `text-on-dark-secondary` | `#a3a3a3` | Secondary text on dark backgrounds         |

Tertiary text on dark uses `white/[0.5]` (50% opacity white) in some contexts.

### Accent Colors

| Token          | Hex       | Usage                                            |
|----------------|-----------|--------------------------------------------------|
| `accent`       | `#0a0a0a` | Primary interactive accent (buttons, focus rings) |
| `accent-blue`  | `#2563eb` | Secondary accent — links, highlights (rare)       |

### Selection

```css
::selection {
  background: #0a0a0a;
  color: #ffffff;
}
```

### 3D / WebGL Colors (JS only, not CSS)

| Name   | Hex       | Usage                     |
|--------|-----------|---------------------------|
| `cyan` | `#00f0ff` | Particle glow, highlights |
| `blue` | `#2563eb` | Secondary 3D elements     |
| `slate`| `#94a3b8` | Neutral 3D elements       |
| `zinc` | `#18181b` | Dark 3D surfaces          |

### Background Patterns

```css
/* Dot grid — used on service sections */
.bg-grid {
  background-image: radial-gradient(circle, #d4d4d4 0.5px, transparent 0.5px);
  background-size: 24px 24px;
}
```

---

## Typography

### Font Stack

```
--font-sans:    Geist (via next/font/google, variable: --font-geist)
--font-heading: Geist (same as sans — unified system)
--font-mono:    Geist Mono (via next/font/google, variable: --font-geist-mono)

display: swap (both fonts)
Subsets: latin
```

### Fluid Type Scale

| Level   | CSS Value                           | Min      | Max      |
|---------|-------------------------------------|----------|----------|
| Hero    | `clamp(3.5rem, 8vw, 7rem)`         | 56px     | 112px    |
| H1      | `clamp(2.5rem, 6vw, 5rem)`         | 40px     | 80px     |
| H2      | `clamp(1.5rem, 3vw, 2.25rem)`      | 24px     | 36px     |
| Body    | `clamp(1.05rem, 1.5vw, 1.25rem)`   | 16.8px   | 20px     |

### Text Styles

| Style            | Size        | Weight     | Tracking            | Line Height    |
|------------------|-------------|------------|---------------------|----------------|
| Hero headline    | fluid-hero  | bold (700) | tracking-tight      | tight (1.1)    |
| Section headline | fluid-h1    | bold (700) | tracking-tight      | tight (1.1)    |
| Subsection title | fluid-h2    | semibold   | tracking-tight      | snug (1.3)     |
| Card title       | text-xl     | semibold   | default             | snug           |
| Body copy        | fluid-p     | normal     | default             | relaxed (1.75) |
| Eyebrow          | text-[10px] | bold       | tracking-[0.3em+]   | normal         |
| Small label      | text-xs     | medium     | tracking-wide       | normal         |
| Mono accent      | text-sm     | normal     | default             | normal         |

### Eyebrow Pattern

The eyebrow is a signature element. Always uppercase, always tiny, always tracked wide:

```html
<span class="text-[10px] font-bold uppercase tracking-[0.35em] text-[#0a0a0a]/90">
  LABEL TEXT
</span>
```

On dark backgrounds: `text-[#a3a3a3]`

Often preceded by a short horizontal line:
```html
<span class="inline-block w-3 h-px bg-[#0a0a0a]/30 mr-3" />
```

---

## Border Radius

| Token        | Value | Usage                              |
|--------------|-------|------------------------------------|
| `radius-sm`  | 2px   | Buttons, small interactive elements |
| `radius-md`  | 4px   | Inputs, badges, chips              |
| `radius-lg`  | 6px   | Cards, panels, containers          |
| `radius-xl`  | 8px   | Maximum — never exceed this        |

Orbexs has an architectural aesthetic. Large border radii (12px, 16px, full) are
explicitly prohibited. The sharpness of 2px buttons is a brand signature.

---

## Spacing Scale

### Section Rhythm

| Pattern            | Value      | Pixels |
|--------------------|------------|--------|
| Standard section   | `py-32`    | 128px  |
| Compact section    | `py-24`    | 96px   |
| Tight section      | `py-12`    | 48px   |
| Container padding  | `px-6`     | 24px   |

### Component Spacing

| Pattern              | Value     | Context                |
|----------------------|-----------|------------------------|
| Card padding         | `p-8`    | Standard cards         |
| Card padding (large) | `p-10`   | Feature/service cards  |
| Card padding (hero)  | `p-12`   | Flagship cards         |
| Grid gap (cards)     | `gap-6`  | Card grids             |
| Grid gap (medium)    | `gap-8`  | Mixed layouts          |
| Grid gap (section)   | `gap-12` | Section internals      |
| Grid gap (large)     | `gap-16` | Title + content blocks |
| Stack gap (items)    | `space-y-3` to `space-y-4` | List items  |

### Container

```html
<div class="mx-auto max-w-7xl px-6">
  <!-- content -->
</div>
```

For narrow content (forms, legal pages): `max-w-3xl` or `max-w-4xl`
For wider content (hero descriptions): `max-w-2xl` on the text block

---

## Focus States

```css
*:focus-visible {
  outline: 2px solid #0a0a0a;
  outline-offset: 4px;
  border-radius: 2px;
  transition: outline-offset 0.2s ease;
}
```

On interactive components (buttons):
```
focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2
```

---

## Dividers & Borders

| Context              | Style                                   |
|----------------------|-----------------------------------------|
| Section separator    | `border-t border-[#e5e5e5]`            |
| Dark section sep.    | `border-t border-white/10`              |
| Card border          | `border border-[#e5e5e5]` (1px solid)  |
| Dark card border     | `border border-[#1a1a1a]`              |
| Subtle dark divider  | `border-[white]/[0.08]`                |
| FAQ item divider     | `border-b border-[#d4d4d4]`            |
