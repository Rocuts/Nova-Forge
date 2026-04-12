// Shared easing curves
export const easing = {
  // Smooth, editorial entrance
  smooth: [0.25, 0.1, 0.25, 1] as const,
  // Controlled deceleration
  decel: [0, 0, 0.2, 1] as const,
  // Precise entrance
  entrance: [0.22, 1, 0.36, 1] as const,
}

// Standard durations
export const duration = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
  section: 0.8,
}

// Fade up variant — the bread and butter
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.smooth },
  },
}

// Fade in only (no movement)
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.smooth },
  },
}

// Stagger container
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number = 0.1) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
}

// Stagger item (child)
export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.entrance },
  },
}

// Section reveal — used for scroll-triggered sections
export const sectionReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.section, ease: easing.smooth },
  },
}

// Viewport settings for scroll animations
export const viewportOnce = { once: true, margin: "-80px" as const }
export const viewportSection = { once: true, margin: "-120px" as const }

// Hover transition for interactive elements
export const hoverTransition = {
  duration: duration.fast,
  ease: easing.smooth,
}
