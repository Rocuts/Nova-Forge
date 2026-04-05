# 3D & WebGL Architecture Architecture

## Component Boundary Strategy
Three.js y ReactDOM manejan grafos diferentes. En Novaforge, orquestamos estos mundos a través de las carpetas `/src/components/3d` y `/src/components/canvas`.

### Reglas de Implementación 3D
1. **Lazy Loading:** Nunca cargues componentes pesados de 3D sincrónicamente en el initial load del DOM de App Router. Usa `next/dynamic` con `ssr: false` para inyectar los Canvas en las secciones (ej. en `Hero.tsx`).
2. **Context Bridge:** Si necesitas compartir estado entre HTML UI y WebGL, rutea la data por Zustand o React Context, pero cuida los renderizados en cascada (React 19 Hooks ayudan aquí).
3. **Post-processing:** Todos los efectos de bloom/glitch deben aislarse en un componente `<Effects />` dentro del `<Canvas />`.

*(Usa estas reglas para no degradar el puntaje de Lighthouse).*
