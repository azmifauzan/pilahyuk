import { describe, it, expect } from 'vitest'
import {
  ROUND_SECONDS,
  SCORE_CORRECT,
  SCORE_WRONG,
  SCORE_MISS,
  COMBO_THRESHOLD,
  COMBO_BONUS,
  START_LIVES,
  DIFFICULTY_TIERS,
  CATEGORY_IDS,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  SCENE_KEYS,
  GAME_CONFIG,
  GAME_WIDTH,
  GAME_HEIGHT
} from '../src/config/gameConfig.js'

describe('gameConfig (locked constants)', () => {
  it('round is 60 seconds', () => {
    expect(ROUND_SECONDS).toBe(60)
  })

  it('scoring constants match plan.md (Phase 3.5)', () => {
    expect(SCORE_CORRECT).toBe(10)
    expect(SCORE_WRONG).toBe(0)
    expect(SCORE_MISS).toBe(-3)
    expect(COMBO_THRESHOLD).toBe(5)
    expect(COMBO_BONUS).toBe(25)
  })

  it('START_LIVES is 3', () => {
    expect(START_LIVES).toBe(3)
  })

  it('difficulty tiers cover 0-20 / 20-40 / 40-60 with correct multipliers', () => {
    expect(DIFFICULTY_TIERS).toHaveLength(3)
    expect(DIFFICULTY_TIERS[0]).toMatchObject({ untilSec: 20, speedMul: 1.0, spawnEverySec: 2.0 })
    expect(DIFFICULTY_TIERS[1]).toMatchObject({ untilSec: 40, speedMul: 1.25, spawnEverySec: 1.5 })
    expect(DIFFICULTY_TIERS[2]).toMatchObject({ untilSec: 60, speedMul: 1.5, spawnEverySec: 1.2 })
  })

  it('exposes the 3 expected categories with labels + colors', () => {
    expect(CATEGORY_IDS).toEqual(['organik', 'anorganik', 'b3'])
    for (const id of CATEGORY_IDS) {
      expect(typeof CATEGORY_LABEL[id]).toBe('string')
      expect(typeof CATEGORY_COLOR[id]).toBe('number')
    }
  })

  it('scene keys are unique strings', () => {
    const values = Object.values(SCENE_KEYS)
    expect(new Set(values).size).toBe(values.length)
  })

  it('GAME_CONFIG has matching dimensions', () => {
    expect(GAME_CONFIG.scale.width).toBe(GAME_WIDTH)
    expect(GAME_CONFIG.scale.height).toBe(GAME_HEIGHT)
    expect(GAME_CONFIG.parent).toBe('game')
  })
})
