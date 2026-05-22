import { describe, it, expect } from 'vitest'
import { tierForElapsed, speedAt, spawnIntervalAt } from '../src/game/difficulty.js'
import { DIFFICULTY_TIERS, BASE_BELT_SPEED_PX_PER_SEC } from '../src/config/gameConfig.js'

describe('difficulty', () => {
  it('tier 0 at start', () => {
    expect(tierForElapsed(0)).toBe(DIFFICULTY_TIERS[0])
    expect(tierForElapsed(15)).toBe(DIFFICULTY_TIERS[0])
    expect(tierForElapsed(29.99)).toBe(DIFFICULTY_TIERS[0])
  })

  it('tier 1 between 30 and 60', () => {
    expect(tierForElapsed(30)).toBe(DIFFICULTY_TIERS[1])
    expect(tierForElapsed(45)).toBe(DIFFICULTY_TIERS[1])
    expect(tierForElapsed(59.99)).toBe(DIFFICULTY_TIERS[1])
  })

  it('tier 2 between 60 and 90', () => {
    expect(tierForElapsed(60)).toBe(DIFFICULTY_TIERS[2])
    expect(tierForElapsed(89.99)).toBe(DIFFICULTY_TIERS[2])
  })

  it('clamps to last tier past 90s', () => {
    expect(tierForElapsed(120)).toBe(DIFFICULTY_TIERS[2])
    expect(tierForElapsed(1e9)).toBe(DIFFICULTY_TIERS[2])
  })

  it('speedAt multiplies base speed by tier multiplier', () => {
    expect(speedAt(0)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.0)
    expect(speedAt(45)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.25)
    expect(speedAt(75)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.5)
  })

  it('speedAt respects explicit base', () => {
    expect(speedAt(75, 100)).toBeCloseTo(150)
  })

  it('spawnIntervalAt returns correct seconds per tier', () => {
    expect(spawnIntervalAt(0)).toBe(2.0)
    expect(spawnIntervalAt(45)).toBe(1.5)
    expect(spawnIntervalAt(75)).toBe(1.2)
  })
})
