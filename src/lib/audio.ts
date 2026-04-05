let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let initialized = false
let muted = false

function init() {
  if (initialized) return
  if (typeof window === "undefined") return

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    muted = true
  }

  // Check localStorage
  try {
    muted = muted || localStorage.getItem("sound-muted") === "true"
  } catch {
    // localStorage unavailable
  }

  try {
    audioContext = new AudioContext()
    masterGain = audioContext.createGain()
    masterGain.gain.value = muted ? 0 : 0.05
    masterGain.connect(audioContext.destination)
  } catch {
    // AudioContext not supported or creation failed
    audioContext = null
    masterGain = null
  }
  initialized = true
}

function ensureContext(): boolean {
  if (!initialized) init()
  if (audioContext?.state === "suspended") audioContext.resume()
  return !!(audioContext && masterGain)
}

export function playClick() {
  if (!ensureContext() || muted) return
  const ctx = audioContext!
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.value = 800
  gain.gain.setValueAtTime(1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

  osc.connect(gain)
  gain.connect(masterGain!)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)
}

export function playHover() {
  if (!ensureContext() || muted) return
  const ctx = audioContext!
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.value = 1200
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)

  osc.connect(gain)
  gain.connect(masterGain!)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.03)
}

export function playSectionEnter() {
  if (!ensureContext() || muted) return
  const ctx = audioContext!
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.6, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

  osc.connect(gain)
  gain.connect(masterGain!)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

export function toggleMute(): boolean {
  if (!initialized) init()
  muted = !muted
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("sound-muted", String(muted))
    }
  } catch {
    // localStorage unavailable
  }
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.05
  }
  return muted
}

export function isMuted(): boolean {
  if (!initialized && typeof window !== "undefined") {
    // Read stored preference without fully initializing
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true
    }
    try {
      return localStorage.getItem("sound-muted") === "true"
    } catch {
      return true
    }
  }
  return muted
}
