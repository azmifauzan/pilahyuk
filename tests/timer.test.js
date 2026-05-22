import { describe, it, expect } from 'vitest'
import { CountdownTimer } from '../src/game/timer.js'

describe('CountdownTimer', () => {
  it('rejects non-positive totalSec', () => {
    expect(() => new CountdownTimer(0)).toThrow()
    expect(() => new CountdownTimer(-1)).toThrow()
  })

  it('starts at full remaining and not done', () => {
    const t = new CountdownTimer(10)
    expect(t.remaining()).toBe(10)
    expect(t.isDone()).toBe(false)
  })

  it('tick() decreases remaining', () => {
    const t = new CountdownTimer(10)
    t.tick(3)
    expect(t.remaining()).toBe(7)
    expect(t.isDone()).toBe(false)
  })

  it('tick() returns true the first time it completes', () => {
    const t = new CountdownTimer(5)
    expect(t.tick(3)).toBe(false)
    expect(t.tick(3)).toBe(true)
    expect(t.isDone()).toBe(true)
    expect(t.remaining()).toBe(0)
  })

  it('tick() after done is a no-op', () => {
    const t = new CountdownTimer(2)
    t.tick(5)
    expect(t.isDone()).toBe(true)
    expect(t.tick(1)).toBe(false)
    expect(t.remaining()).toBe(0)
  })

  it('ignores non-positive deltas', () => {
    const t = new CountdownTimer(5)
    t.tick(0)
    expect(t.remaining()).toBe(5)
    t.tick(-1)
    expect(t.remaining()).toBe(5)
  })

  it('reset() restores initial state', () => {
    const t = new CountdownTimer(5)
    t.tick(10)
    t.reset()
    expect(t.remaining()).toBe(5)
    expect(t.isDone()).toBe(false)
  })
})
