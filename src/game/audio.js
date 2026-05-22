// Procedural SFX via Web Audio API. No asset files needed.
let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function tone(freq, type, duration, gainPeak = 0.3, startDelay = 0) {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = ac.currentTime + startDelay
    gain.gain.setValueAtTime(gainPeak, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  } catch (_) {}
}

export function resumeAudio() {
  try {
    if (ctx && ctx.state === 'suspended') ctx.resume()
  } catch (_) {}
}

export function playCorrect() {
  tone(880, 'sine', 0.12, 0.3)
  tone(1320, 'sine', 0.12, 0.25, 0.08)
}

export function playWrong() {
  tone(200, 'sawtooth', 0.3, 0.4)
}

export function playCombo() {
  const freqs = [440, 554, 659, 880]
  freqs.forEach((f, i) => tone(f, 'sine', 0.15, 0.3, i * 0.07))
}

export function playMiss() {
  tone(280, 'triangle', 0.2, 0.12)
}
