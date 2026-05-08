# Orbexs Motion System — Complete Reference

The animation library is `motion` v12+ (successor to framer-motion), imported as `motion/react`.

## Core Principles

1. **Every animation must communicate** — hierarchy, state change, or spatial relationship.
2. **No decorative animation** — no bouncing icons, pulsing badges, or shimmer loaders.
3. **Respect user preferences** — always check `prefers-reduced-motion`. If reduce, skip animation entirely or show static state.
4. **Animate once on scroll** — viewport-triggered animations fire once (`once: true`), never replay.
5. **Subtle over dramatic** — max Y displacement is 30px; typical is 16-20px.

---

## Easing Curves

```typescript
import { easing } from "@/lib/motion"

// Smooth editorial entrance — default for most animations
easing.smooth = [0.25, 0.1, 0.25, 1]

// Controlled deceleration — elements settling into place
easing.decel = [0, 0, 0.2, 1]

// Precise entrance — stagger items, accordion, text reveals
easing.entrance = [0.22, 1, 0.36, 1]
```

### When to Use Each

| Easing      | Use For                                           |
|-------------|---------------------------------------------------|
| `smooth`    | Fade-ups, section reveals, general transitions    |
| `decel`     | Elements arriving from off-screen                 |
| `entrance`  | Stagger children, FAQ expand, word reveals        |

---

## Durations

```typescript
import { duration } from "@/lib/motion"

duration.fast    = 0.3  // Hover states, micro-interactions, color transitions
duration.normal  = 0.5  // Fade-ups, standard entrances
duration.slow    = 0.7  // Text reveals, dramatic content
duration.section = 0.8  // Full section scroll reveals
```

### Duration by Context

| Context                  | Duration  | Easing      |
|--------------------------|-----------|-------------|
| Hover color change       | 0.3s      | smooth      |
| Button tap               | spring    | —           |
| Card fade-up             | 0.5s      | smooth      |
| Stagger child item       | 0.5s      | entrance    |
| Text word reveal         | 0.6s      | entrance    |
| Text character reveal    | 0.5s      | entrance    |
| Section scroll reveal    | 0.8s      | smooth      |
| Accordion expand         | 0.4s      | entrance    |
| FAQ icon rotation        | 0.3s      | default     |
| Animated counter         | 1.5s      | easeOutCubic|
| ScrambleText             | 700-1600ms| frame-based |
| IntroSequence letters    | 0.5s each | entrance    |
| IntroSequence clip-path  | 0.8s      | entrance    |
| Progress bar             | 1.2s      | easeInOut   |
| View transition          | 0.3s      | ease-in/out |

---

## Animation Variants (pre-built)

```typescript
import { fadeUp, fadeIn, staggerContainer, staggerItem, sectionReveal } from "@/lib/motion"

// Fade up — the bread and butter
fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
}

// Fade in only (no movement)
fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
}

// Stagger container
staggerContainer = {
  hidden: { opacity: 0 },
  visible: (delay = 0.1) => ({
    opacity: 1,
    transition: { staggerChildren: delay, delayChildren: 0.1 }
  })
}

// Stagger item
staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// Section reveal
sectionReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
}
```

---

## Viewport Triggers

```typescript
import { viewportOnce, viewportSection } from "@/lib/motion"

// Standard elements (cards, text blocks)
viewportOnce = { once: true, margin: "-80px" }

// Full sections
viewportSection = { once: true, margin: "-120px" }
```

Usage pattern:
```tsx
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={viewportOnce}
>
  {content}
</motion.div>
```

---

## Spring Configurations

| Name       | Config                                    | Usage                          |
|------------|-------------------------------------------|--------------------------------|
| magnetic   | `{ stiffness: 150, damping: 15 }`        | Magnetic button, cursor follow |
| crisp      | `{ stiffness: 400, damping: 25 }`        | Logo tap, snappy feedback      |
| parallax   | `{ stiffness: 100, damping: 30, mass: 0.5 }` | Scroll parallax           |
| entrance   | `{ stiffness: 80, damping: 25 }`         | Section entrance animations    |
| form       | `{ stiffness: 260, damping: 20 }`        | Form interactions, submits     |
| cursorOuter| `{ stiffness: 300, damping: 20 }`        | Custom cursor outer ring       |

---

## Stagger Patterns

### Word-Level Text Reveal

```typescript
// Container
transition: { staggerChildren: 0.06, delayChildren: delay }

// Each word
initial: { y: "100%" }
animate: { y: "0%" }
transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
```

### Character-Level Text Reveal

```typescript
// Container
transition: { staggerChildren: 0.02, delayChildren: delay }

// Each character
initial: { y: "100%", opacity: 0 }
animate: { y: "0%", opacity: 1 }
transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
```

### Hero Section Stagger

```typescript
// Sequential elements with increasing delay
const stagger = (i: number) => ({
  delay: 0.15 * i,
  duration: 0.6,
  ease: "easeOut"
})
// Element 0: 0s, Element 1: 0.15s, Element 2: 0.3s, Element 3: 0.45s
```

### Card Grid Stagger

```typescript
// Container
variants={staggerContainer}
custom={0.1} // 100ms between children

// Each card
variants={staggerItem}
```

---

## ScrambleText Effect

Custom frame-based animation (not motion library):

```
Frame rate: ~25 FPS (40ms intervals via requestAnimationFrame)
Character set: "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#_"
Settle pattern: sequential left-to-right
Settle time per char: (duration / text.length) * charIndex
Default duration: 1000ms
Configurable: delay (seconds), duration (milliseconds)

Always provide sr-only text for accessibility.
```

---

## Scroll-Linked Animations

### useParallax Hook

```typescript
// Transforms scroll progress into Y displacement
// Config: spring { stiffness: 100, damping: 30, mass: 0.5 }
// Range: scrollYProgress mapped to [0, -distance]
```

### useSectionEntrance Hook

```typescript
// Combined opacity + scale + Y offset triggered by viewport
// Spring: { stiffness: 80, damping: 25 }
// Returns: { ref, style: { opacity, y, scale } }
```

### useScrollVelocitySkew Hook

```typescript
// Scroll velocity mapped to subtle skew angle
// Spring: { stiffness: 100, damping: 30 }
// Max skew: ±0.5 degrees
```

---

## Interaction Animations

### Button Tap

```typescript
whileTap={{ scale: 0.98 }}
```

### Hover Transition

```typescript
import { hoverTransition } from "@/lib/motion"
// { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
```

### Card Hover

```
Border color shift (300ms transition-colors)
translate-y: -2px (respects prefers-reduced-motion)
```

### Custom Cursor

```
Inner dot: 8px, mixBlendMode: "difference", follows mouse 1:1
Outer ring: 40px, 1.5px border white, spring-followed
Hover scale: 1.5x (spring: stiffness 300, damping 20)
Desktop only: @media (pointer: fine)
```

### Magnetic Button

```
Detection radius: 100px from center
Button displacement: mouseOffset * magneticStrength (default 0.3)
Text counter-movement: displacement * -0.5
Spring: stiffness 150, damping 15
Reset to origin on mouse leave
```

---

## 3D / WebGL Motion

### HeroCanvas (Starfield)

```
Point count: 5000
Distribution: sphere with radius variation
Mouse parallax: rotation x -= delta/15, y -= delta/20
Position parallax: x,y *= 0.05 toward mouse at 0.5 strength
Point material: size 0.005, opacity 0.6
```

### GlobalParticleScene

```
Desktop particles: 2000 | Mobile: 500
Scroll velocity: scrollDelta * 0.003
Rotation boost: 1 + scrollSpeed * 8
Tilt angle: scrollDelta * 0.0003
Size pulse: 0.08 + scrollSpeed * 0.15
Mouse tracking: position lerp at 0.02 factor (desktop only)
Post-processing: Bloom + Vignette
```

---

## CSS Animations

### Marquee

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
/* Speed: 25-35s per row, linear, infinite */
/* Pauses on hover */
```

### View Transitions

```css
::view-transition-old(root) { animation: fade-out 0.3s ease-in forwards; }
::view-transition-new(root) { animation: fade-in 0.3s ease-out forwards; }
```

---

## Accessibility Checklist

- [ ] All motion components check `prefers-reduced-motion`
- [ ] If reduced motion: skip animation, show final state immediately
- [ ] ScrambleText provides `sr-only` text content
- [ ] No auto-playing animations that distract (marquee pauses on hover)
- [ ] Custom cursor only on `pointer: fine` (desktop)
- [ ] Magnetic effects disabled for reduced motion
- [ ] 3D scenes degrade gracefully (fewer particles on mobile)
