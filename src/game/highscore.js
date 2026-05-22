import { HIGH_SCORE_KEY } from '../config/gameConfig.js'

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch (_) {
    return null
  }
}

export function loadHighScore(storage = safeStorage()) {
  if (!storage) return 0
  const raw = storage.getItem(HIGH_SCORE_KEY)
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function saveHighScore(score, storage = safeStorage()) {
  if (!storage) return loadHighScore(storage)
  const current = loadHighScore(storage)
  if (score > current) {
    storage.setItem(HIGH_SCORE_KEY, String(score))
    return score
  }
  return current
}
