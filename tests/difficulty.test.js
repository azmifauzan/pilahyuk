import { describe, it, expect } from 'vitest'
import { tierForElapsed, speedAt, spawnIntervalAt, tierIndexAt } from '../src/game/difficulty.js'
import { DIFFICULTY_TIERS, BASE_BELT_SPEED_PX_PER_SEC } from '../src/config/gameConfig.js'

describe('difficulty', () => {
  it('tier 0 at start (0–20s)', () => {
    expect(tierForElapsed(0)).toBe(DIFFICULTY_TIERS[0])
    expect(tierForElapsed(15)).toBe(DIFFICULTY_TIERS[0])
    expect(tierForElapsed(19.99)).toBe(DIFFICULTY_TIERS[0])
  })

  it('tier 1 between 20 and 40s', () => {
    expect(tierForElapsed(20)).toBe(DIFFICULTY_TIERS[1])
    expect(tierForElapsed(30)).toBe(DIFFICULTY_TIERS[1])
    expect(tierForElapsed(39.99)).toBe(DIFFICULTY_TIERS[1])
  })

  it('tier 2 between 40 and 60s', () => {
    expect(tierForElapsed(40)).toBe(DIFFICULTY_TIERS[2])
    expect(tierForElapsed(59.99)).toBe(DIFFICULTY_TIERS[2])
  })

  it('clamps to last tier past 60s', () => {
    expect(tierForElapsed(60)).toBe(DIFFICULTY_TIERS[2])
    expect(tierForElapsed(1e9)).toBe(DIFFICULTY_TIERS[2])
  })

  it('speedAt multiplies base speed by tier multiplier', () => {
    expect(speedAt(0)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.0)
    expect(speedAt(30)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.25)
    expect(speedAt(50)).toBeCloseTo(BASE_BELT_SPEED_PX_PER_SEC * 1.5)
  })

  it('speedAt respects explicit base', () => {
    expect(speedAt(50, 100)).toBeCloseTo(150)
  })

  it('spawnIntervalAt returns correct seconds per tier', () => {
    expect(spawnIntervalAt(0)).toBe(2.0)
    expect(spawnIntervalAt(30)).toBe(1.5)
    expect(spawnIntervalAt(50)).toBe(1.2)
  })

  it('tierIndexAt returns 0-based index matching tierForElapsed', () => {
    expect(tierIndexAt(0)).toBe(0)
    expect(tierIndexAt(19.99)).toBe(0)
    expect(tierIndexAt(20)).toBe(1)
    expect(tierIndexAt(39.99)).toBe(1)
    expect(tierIndexAt(40)).toBe(2)
    expect(tierIndexAt(59.99)).toBe(2)
    expect(tierIndexAt(100)).toBe(2)
  })
})
