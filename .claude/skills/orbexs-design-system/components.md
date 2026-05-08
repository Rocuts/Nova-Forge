# Orbexs Component Patterns — Complete Reference

## Buttons

### Variants

**Primary** (default):
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  className="inline-flex items-center justify-center rounded-[2px]
    bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]
    px-7 py-3 text-sm font-medium
    transition-colors
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50"
>
  Button Text
</motion.button>
```

**Inverted primary** (on dark backgrounds):
```
bg-white text-[#0a0a0a] hover:bg-[#e5e5e5]
```

**Secondary**:
```
border border-[#d4d4d4] bg-transparent text-[#0a0a0a]
hover:bg-[#f5f5f5] hover:border-[#a3a3a3]
```

**Ghost**:
```
bg-transparent text-[#525252]
hover:text-[#0a0a0a] hover:bg-[#f5f5f5]
```

### Sizes

| Size | Classes                                    |
|------|--------------------------------------------|
| sm   | `px-5 py-2.5 text-xs font-medium tracking-wide` |
| md   | `px-7 py-3 text-sm font-medium`            |
| lg   | `px-10 py-4 text-base font-medium`         |

### Magnetic Variant

Wraps any button with a magnetic hover effect:
- Detection radius: 100px
- Spring: `stiffness: 150, damping: 15`
- Text counter-parallax: `-0.5` of displacement
- Disabled when `prefers-reduced-motion: reduce`

---

## Cards / Panels

### Light Panel

```tsx
<div className="rounded-[6px] p-8
  bg-[#f8f8f8] border border-[#e5e5e5]
  hover:border-[#d4d4d4] hover:-translate-y-[2px]
  transition-all duration-300 ease-out">
  {children}
</div>
```

### Dark Panel

```tsx
<div className="rounded-[6px] p-8
  bg-[#141414] border border-[#1a1a1a]
  hover:border-[#2a2a2a] hover:-translate-y-[2px]
  transition-all duration-300 ease-out">
  {children}
</div>
```

### Card Content Anatomy

```
Card
├── Icon or number (optional)
│   └── Tabler icon: 36px, stroke={1.5}, currentColor
├── Title
│   └── text-xl font-semibold text-[#0a0a0a] (light) or text-white (dark)
├── Description
│   └── text-base text-[#525252] leading-relaxed (light) or text-[#a3a3a3] (dark)
└── Items list (optional)
    └── space-y-3, dash-separated items, text-sm text-[#525252]
```

### Stats / KPI Card

```tsx
<div className="bg-[#141414] border border-[#1a1a1a] rounded-[6px] p-6 md:p-8">
  <p className="text-4xl md:text-5xl font-bold tracking-tighter text-white break-words">
    {value}
  </p>
  <p className="text-sm font-medium text-[#a3a3a3] mt-2">{label}</p>
</div>
```

---

## Forms & Inputs

### Text Input (underline-only style)

```tsx
<div>
  <label className="text-sm font-medium text-[#0a0a0a]">{label}</label>
  <input
    className="w-full border-b border-[#e5e5e5] bg-transparent py-4
      text-[#0a0a0a] placeholder:text-[#a3a3a3]
      focus:border-[#0a0a0a] focus:outline-none
      transition-colors"
  />
</div>
```

### Textarea

```
Same border-b style as input. Add: resize-none, min-h for height.
```

### Chip / Tag Selector

```tsx
// Unselected
<button className="px-4 py-2 rounded-[4px] border border-[#e5e5e5]
  text-sm text-[#525252] bg-transparent
  hover:border-[#a3a3a3] transition-colors">
  {label}
</button>

// Selected
<button className="px-4 py-2 rounded-[4px] border border-[#0a0a0a]
  text-sm text-white bg-[#0a0a0a]">
  {label}
</button>
```

### Submit Button (full-width)

```
w-full bg-[#0a0a0a] text-white py-4 rounded-[2px]
disabled:opacity-40 disabled:pointer-events-none
```

---

## Navigation

### Header (fixed)

```
State:        Default              Scrolled (>50px)         Menu Open
Background:   white                white/90 backdrop-blur   #0a0a0a
Border:       none                 border-b #e5e5e5         border-b white/10
Text:         #0a0a0a              #0a0a0a                  white
Height:       h-16 (64px)          h-16                     h-16
Position:     fixed top-0 z-50     same                     same
Transition:   transition-colors duration-300
```

### Mega Menu (dark overlay)

```
Background: #0a0a0a
Layout: 3-column grid
Column header: text-[10px] font-bold tracking-[0.3em] uppercase text-[#525252]
Link: text-base font-medium text-white hover:text-[#a3a3a3]
Divider: border-white/5
Bottom bar: border-t border-white/10
```

### Hamburger Icon

3 horizontal lines (20px wide, 1.5px height, #0a0a0a or white):
- Open: top rotates +45deg, middle scales to 0, bottom rotates -45deg
- Transition: duration 300ms

---

## Footer

```
Background:  #0a0a0a
Border-top:  border-t border-[#1a1a1a]
Padding:     pt-16 pb-8
Layout:      5-column grid (lg), stacked on mobile

Brand column (spans 2):
  Logo: text-xl font-semibold text-white
  Tagline: text-[#a3a3a3] leading-relaxed
  Social: icon links, text-[#a3a3a3] hover:text-white

Link columns:
  Heading: font-medium text-white
  Links: text-[#a3a3a3] hover:text-white transition-colors

Bottom divider:
  border-t border-[#1a1a1a] pt-8
  Copyright: text-sm text-[#a3a3a3]
```

---

## Accordion / FAQ

```tsx
// Container: space-y-0, items separated by borders
<div className="border-b border-[#d4d4d4]">
  <button className="w-full flex justify-between items-center py-6 text-left">
    <span className="text-base font-medium text-[#0a0a0a]">{question}</span>
    <span className="text-xl transition-transform duration-300"
      style={{ rotate: isOpen ? 45 : 0 }}>
      +
    </span>
  </button>
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="pb-6 text-base text-[#525252] leading-relaxed">{answer}</p>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

## Badges / Eyebrows

### Standard Badge

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5">
  <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
</div>
```

### Section Eyebrow (with line)

```tsx
<div className="flex items-center gap-3">
  <span className="inline-block w-3 h-px bg-[#0a0a0a]/30" />
  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#0a0a0a]/90">
    {label}
  </span>
</div>
```

On dark backgrounds: `bg-white/30` for line, `text-[#a3a3a3]` for text.

---

## Icons

### System

- **Tabler Icons** (`@tabler/icons-react`): Section icons, features
  - Size: 36px for section cards, 20px for inline
  - Stroke: `1.5` (thin, consistent with minimal aesthetic)
  - Color: `currentColor`

- **Iconify** (`@iconify/react`): Tech logos, brand icons
  - Size: 20px
  - Color: `#525252`

### Icon Styling Rules

- Never fill icons — stroke-only for Tabler
- Icons inherit text color via `currentColor`
- No colored icons in UI (grayscale only, except in 3D/WebGL)

---

## Team Member Row (signature pattern)

```
Row structure:
├── Horizontal divider: border-b border-[#1a1a1a]
├── Grid: [index] [name] [role]
│   ├── Index: text-[8px] font-mono text-white/20 → accent color on hover
│   ├── Name: text-2xl md:text-4xl font-bold tracking-tight text-white
│   │   └── hover: translate-x-2
│   └── Role: text-[10px] uppercase tracking-[0.3em] text-[#a3a3a3]
├── Background: gradient (opacity 0 → 0.05 on hover)
├── Initials watermark: text-[7rem] md:text-[10rem] opacity 0.03 → 1 on hover
└── Accent line: 0% → 100% width, gradient, 0.5s ease
```

---

## Marquee / Scrolling List

```
Container: overflow-hidden
Track: flex gap-10, animation: marquee Xs linear infinite
Speed: 25-35s (varies per row)
Direction: alternates normal/reverse per row
Pause: on hover (.marquee-container:hover .marquee-track)
Items duplicated for seamless loop

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```
