import { describe, it, expect, beforeEach } from 'vitest'
import { loadHighScore, saveHighScore } from '../src/game/highscore.js'
import { HIGH_SCORE_KEY } from '../src/config/gameConfig.js'

function makeStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)) },
    removeItem: (k) => { data.delete(k) },
    _data: data
  }
}

describe('highscore', () => {
  let storage
  beforeEach(() => { storage = makeStorage() })

  it('loadHighScore returns 0 when nothing stored', () => {
    expect(loadHighScore(storage)).toBe(0)
  })

  it('loadHighScore returns 0 when stored value is not a positive number', () => {
    storage.setItem(HIGH_SCORE_KEY, 'banana')
    expect(loadHighScore(storage)).toBe(0)
    storage.setItem(HIGH_SCORE_KEY, '-12')
    expect(loadHighScore(storage)).toBe(0)
  })

  it('saveHighScore stores a higher score and returns it', () => {
    expect(saveHighScore(50, storage)).toBe(50)
    expect(loadHighScore(storage)).toBe(50)
  })

  it('saveHighScore keeps existing higher score', () => {
    saveHighScore(80, storage)
    expect(saveHighScore(40, storage)).toBe(80)
    expect(loadHighScore(storage)).toBe(80)
  })

  it('returns 0 gracefully when storage is null', () => {
    expect(loadHighScore(null)).toBe(0)
    expect(saveHighScore(100, null)).toBe(0)
  })

  it('loadHighScore and saveHighScore work without explicit storage (real localStorage path)', () => {
    // exercises safeStorage() which checks typeof localStorage
    expect(() => loadHighScore()).not.toThrow()
    expect(() => saveHighScore(0)).not.toThrow()
  })
})
