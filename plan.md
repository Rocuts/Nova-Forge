# Novaforge — Plan de Elevación Visual Top-Tier 2026

> Objetivo: Transformar la landing de "sitio dark bien construido" a "experiencia inmersiva nivel Awwwards".
> Regla: Zero dependencias nuevas. Todo se implementa con el stack existente (Three.js, motion/react, Lenis, Tailwind v4).

---

## Estado Actual (completado)

- [x] Lenis smooth scroll activado globalmente
- [x] Hooks de parallax reutilizables (`useParallax`, `useSectionEntrance`, `useScrollScale`)
- [x] Hero con parallax por capas (texto sube 1.5x, canvas baja 0.5x)
- [x] Cards con parallax escalonado (cada card a diferente velocidad)
- [x] Methodology con reveals direccionales alternos
- [x] CTA con scale-up dramático al entrar al viewport
- [x] Partículas globales reactivas al scroll (velocidad, inclinación, pulso de tamaño)
- [x] Spring physics en todas las animaciones de scroll

---

## Tier 1 — Impacto Visual Inmediato

### 1.1 Post-Processing Cinematográfico en Three.js
**Archivos:** `src/components/canvas/GlobalParticleScene.tsx`, `src/components/canvas/HeroScene.tsx`

**Qué hacer:**
- Agregar `EffectComposer` a la escena de partículas globales (actualmente solo el hero tiene Bloom)
- Implementar film grain via shader custom en ambas escenas
- Agregar chromatic aberration sutil (`offset: [0.002, 0.002]`) al HeroScene
- Ajustar Bloom existente: bajar `luminanceThreshold` a 0.3, subir `intensity` a 2.0 para glow más envolvente
- Agregar vignette sutil para guiar la mirada al centro

**Resultado esperado:** Las escenas 3D pasan de "demo WebGL" a "cinematográfico". El grain elimina la sensación digital estéril.

**Consideraciones de performance:**
- El grain debe ser un shader ligero, no un post-pass completo
- En mobile, desactivar chromatic aberration y reducir intensity del Bloom
- Usar `dpr: [1, 1.5]` máximo para las escenas con post-processing

---

### 1.2 Custom Cursor + Botones Magnéticos
**Archivos nuevos:** `src/components/ui/CustomCursor.tsx`, `src/components/ui/MagneticButton.tsx`
**Archivos modificados:** `src/app/layout.tsx`, `src/components/ui/Button.tsx`

**Custom Cursor:**
- Componente global montado en layout.tsx (solo desktop, ocultar en touch devices)
- Dot interno (8px) que sigue el mouse 1:1
- Circle externo (40px) que sigue con spring physics (`stiffness: 150, damping: 15`)
- El circle se escala x1.5 al hacer hover sobre elementos interactivos
- `mix-blend-mode: difference` para contraste automático contra cualquier fondo
- El dot se convierte en flecha/icono contextual según el elemento (link, botón, input)
- Ocultar `cursor: none` en el body cuando el custom cursor está activo

**Botones Magnéticos:**
- Detectar distancia del mouse al centro del botón
- Dentro de un radio de ~100px, el botón se desplaza hacia el cursor (30% de la distancia)
- Spring de retorno al soltar (`stiffness: 150, damping: 15`)
- Integrar con el componente `Button.tsx` existente via prop `magnetic`
- El texto interno del botón se mueve en dirección opuesta al desplazamiento (parallax interno)

---

### 1.3 Text Reveals por Línea con Masked Animation
**Archivos nuevos:** `src/components/ui/RevealText.tsx`
**Archivos modificados:** Todos los section headings (Hero, Services, FlagshipAI, Methodology, Team, FAQ, CTA)

**Componente RevealText:**
- Recibe texto y lo divide en líneas
- Cada línea se envuelve en un container `overflow: hidden`
- La línea interna anima de `translateY(110%)` a `translateY(0)` al entrar al viewport
- Stagger entre líneas: `0.08s`
- Easing: `[0.22, 1, 0.36, 1]` (deceleration curve premium)
- El hero usa variante especial con character-level stagger (`0.02s` por carácter)

**Variante CharReveal para el hero headline:**
- Cada carácter es un `<span>` independiente
- Anima desde `translateY(100%) + rotateX(90deg) + opacity(0)`
- Stagger de 0.015s por carácter
- Blur de 4px que se resuelve a 0

**Integración:**
- Reemplazar los `motion.h1` / `motion.h2` genéricos con `<RevealText>` en cada sección
- Mantener `whileInView` para trigger, no `animate` (evitar que todas se disparen al cargar)

---

### 1.4 SVG Noise Texture Overlay
**Archivos modificados:** `src/app/globals.css`

**Qué hacer:**
- Crear un pseudo-elemento `::after` global en el body con un filtro SVG `feTurbulence`
- Parámetros: `type="fractalNoise"`, `baseFrequency="0.65"`, `numOctaves="3"`, `seed="2"`
- Opacidad: `0.03–0.05` (apenas perceptible, pero elimina banding)
- `pointer-events: none`, `position: fixed`, `inset: 0`, `z-index: 100` (sobre todo excepto cursor)
- `mix-blend-mode: overlay` para que interactúe con los colores del sitio

**Resultado:** El fondo negro deja de ser plano y digital. Se siente como una superficie con textura real.

---

### 1.5 Gradientes OKLCH
**Archivos modificados:** `src/app/globals.css`, section components con gradientes inline

**Qué hacer:**
- Reemplazar todos los `bg-gradient-to-r from-primary-cyan via-accent-amber to-white` con equivalentes OKLCH
- Los gradientes en OKLCH no tienen el "muddy middle" que tienen los sRGB

**Gradientes a migrar:**
1. Hero headline: `from-primary-cyan via-accent-amber to-white`
   → `linear-gradient(to right, oklch(0.82 0.18 195), oklch(0.72 0.17 65), oklch(0.95 0.02 90))`
2. CTA headline: `from-primary-cyan via-accent-amber to-accent-amber/50`
   → `linear-gradient(to right, oklch(0.82 0.18 195), oklch(0.72 0.17 65), oklch(0.72 0.09 65))`
3. Methodology numbers: `from-primary-cyan to-accent-amber`
   → `linear-gradient(to bottom right, oklch(0.82 0.18 195), oklch(0.72 0.17 65))`

**Crear utility classes en globals.css:**
```css
.gradient-brand {
  background: linear-gradient(to right, oklch(0.82 0.18 195), oklch(0.72 0.17 65), oklch(0.95 0.02 90));
}
.gradient-cta {
  background: linear-gradient(to right, oklch(0.82 0.18 195), oklch(0.72 0.17 65), oklch(0.72 0.09 65));
}
.gradient-accent {
  background: linear-gradient(135deg, oklch(0.82 0.18 195), oklch(0.72 0.17 65));
}
```

---

## Tier 2 — Polish Profesional

### 2.1 Scroll-Velocity Skew
**Archivos nuevos:** `src/hooks/useScrollVelocity.ts`
**Archivos modificados:** Section components

**Qué hacer:**
- Hook que lee `window.scrollY` cada frame y calcula delta (velocidad)
- Aplica `skewY` proporcional a la velocidad (clamp entre -2deg y 2deg)
- Spring de retorno a 0 cuando el scroll para
- Aplicar a los containers principales de cada sección (no a elementos individuales)

**Resultado:** El contenido se "estira" sutilmente en la dirección del scroll, como si tuviera inercia física. Es un efecto subliminal que comunica fluidez.

---

### 2.2 Hover Parallax Interno en Cards
**Archivos modificados:** `src/components/ui/GlassPanel.tsx`

**Qué hacer:**
- Extender el mouse tracking existente para mover capas internas del card
- El glow ya sigue al mouse. Agregar: el contenido se inclina con `perspective(800px) rotateX(Ydeg) rotateY(Xdeg)`
- Icon se mueve 2x la distancia del mouse offset
- Título se mueve 1.5x
- Texto se mueve 1x
- Esto requiere que `GlassPanel` acepte children con slot pattern o use CSS para targetear hijos por profundidad

**Resultado:** Las cards tienen profundidad 3D real al hacer hover, no solo un glow plano.

---

### 2.3 Loading/Intro Sequence
**Archivos nuevos:** `src/components/ui/IntroSequence.tsx`
**Archivos modificados:** `src/app/layout.tsx`

**Qué hacer:**
- Overlay negro que cubre toda la pantalla al cargar
- Logo de Novaforge aparece con character reveal (stagger)
- Línea de progreso sutil debajo del logo (conectada a `document.readyState` o next/font loading)
- Al completar: el overlay hace clip-path circle expand (centro hacia fuera) revelando el sitio
- Duración total: 1.5–2s máximo
- Solo en primera visita (usar `sessionStorage` para skip en navegación interna)
- `prefers-reduced-motion`: skip directo, mostrar sitio inmediatamente

**Resultado:** Primera impresión cinematográfica en vez de contenido que "aparece". Establece el tono de la experiencia.

---

### 2.4 Icosahedron Dissolve-to-Particles on Scroll
**Archivos modificados:** `src/components/canvas/HeroScene.tsx`

**Qué hacer:**
- Al scrollear fuera del hero (scrollYProgress 0.5–1.0), los vértices del icosahedron se separan
- Implementar con vertex shader: `mix(originalPosition, explodedPosition, uProgress)`
- `explodedPosition` = `position + normal * explosionDistance`
- La opacidad de cada vértice decrece con la distancia al centro
- Los vértices separados se convierten en partículas que se integran con el GlobalParticleScene
- Usar `uScrollProgress` uniform que se actualiza desde React via `useScroll`

**Resultado:** El hero no solo desaparece — se transforma. Conexión visual entre el hero y el fondo de partículas.

---

## Tier 3 — Competencia Awwwards

### 3.1 Sound Design Sutil
**Archivos nuevos:** `src/lib/audio.ts`, `src/hooks/useUISound.ts`

**Qué hacer:**
- Web Audio API context (lazy init on first user interaction)
- Sonidos generados proceduralmente (no archivos .mp3):
  - Click: sine wave 800Hz, 50ms decay
  - Hover: sine wave 1200Hz, 30ms, very low volume
  - Section enter: low sine sweep 200→400Hz, 200ms
- Volumen global muy bajo (`gainNode.gain.value = 0.05`)
- Respetar `prefers-reduced-motion` (silenciar)
- Toggle global en la UI para desactivar sonido

---

### 3.2 View Transitions API
**Archivos nuevos:** `src/components/ui/TransitionLink.tsx`
**Archivos modificados:** Navigation links

**Qué hacer:**
- Wrapper de `next/link` que usa `document.startViewTransition()` cuando está disponible
- Fallback graceful a navegación estándar en Safari
- CSS `::view-transition-old` y `::view-transition-new` para controlar la animación
- El canvas 3D persiste (no se desmonta) durante transiciones
- Animación: crossfade con scale sutil (old page scale down 0.95, new page scale up from 1.05)

---

### 3.3 Variable Font Weight on Scroll
**Archivos modificados:** Section headings

**Qué hacer:**
- Outfit (heading font) soporta variable weight
- Headings que empiezan en weight 400 y transicionan a 700 conforme entran al viewport
- Implementar con `useTransform(scrollYProgress, [0, 1], [400, 700])` aplicado a `fontVariationSettings`
- Efecto sutil pero perceptible — el texto se "solidifica" al entrar

---

## Orden de Implementación Recomendado

```
Fase 1 (impacto máximo, ~2-3 horas de trabajo):
  1.4 SVG Noise Overlay        ← 5 min, impacto inmediato en el fondo
  1.5 Gradientes OKLCH          ← 15 min, colores más ricos
  1.2 Custom Cursor + Magnetic  ← 45 min, señal premium instantánea
  1.3 Text Reveals               ← 45 min, headings cinematográficos
  1.1 Post-Processing            ← 30 min, escenas 3D cinematográficas

Fase 2 (polish, ~2 horas):
  2.1 Scroll-Velocity Skew
  2.2 Hover Parallax en Cards
  2.3 Intro Sequence
  2.4 Icosahedron Dissolve

Fase 3 (competencia, ~2 horas):
  3.1 Sound Design
  3.2 View Transitions
  3.3 Variable Font Weight
```

---

## Principios de Implementación

1. **Performance first:** Todo efecto debe correr a 60fps. Si no, se degrada gracefully.
2. **Mobile-aware:** Desactivar cursor custom, reducir post-processing, simplificar parallax en touch devices.
3. **Accessibility:** Respetar `prefers-reduced-motion` en CADA animación. Sound mutable. No depender de animación para comunicar información.
4. **No dependencies nuevas:** Todo se construye con Three.js, motion/react, Lenis, y CSS moderno.
5. **Progressive enhancement:** El sitio debe funcionar sin JS (SSR base), sin WebGL (fallback gradients), sin smooth scroll (native scroll). Las capas de experiencia se agregan, no reemplazan.
