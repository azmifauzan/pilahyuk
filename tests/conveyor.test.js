import { describe, it, expect, beforeEach } from 'vitest'
import { Conveyor, _resetUidForTests } from '../src/game/conveyor.js'

const FIXED_ITEM = { id: 'x', name: 'X', emoji: '❓', category: 'organik', subtype: null, funFact: '' }
const pickFixed = () => FIXED_ITEM

describe('Conveyor', () => {
  beforeEach(() => _resetUidForTests())

  it('rejects bad ctor args', () => {
    expect(() => new Conveyor({ beltLengthPx: 0, baseSpeedPxPerSec: 1 })).toThrow()
    expect(() => new Conveyor({ beltLengthPx: 1, baseSpeedPxPerSec: 0 })).toThrow()
  })

  it('spawns first item after spawnEverySec elapsed', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    let r = c.update(1, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    expect(r.spawned).toHaveLength(0)
    r = c.update(1.1, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    expect(r.spawned).toHaveLength(1)
    expect(c.count()).toBe(1)
    expect(c.items[0].x).toBe(400)
  })

  it('moves items leftward by speed*dt', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed }) // spawn one
    c.update(1, { speedMul: 1, spawnEverySec: 100, pickItem: pickFixed }) // no spawn
    expect(c.items[0].x).toBeCloseTo(400 - 100)
  })

  it('removes items that reach x <= 0 as missed', () => {
    const c = new Conveyor({ beltLengthPx: 100, baseSpeedPxPerSec: 100 })
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    const r = c.update(2, { speedMul: 1, spawnEverySec: 100, pickItem: pickFixed })
    expect(r.missed).toHaveLength(1)
    expect(c.count()).toBe(0)
  })

  it('spawns multiple times in a long tick', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 50 })
    const r = c.update(5, { speedMul: 1, spawnEverySec: 1, pickItem: pickFixed })
    expect(r.spawned.length).toBeGreaterThanOrEqual(5)
  })

  it('honours speedMul', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    c.update(1, { speedMul: 2, spawnEverySec: 100, pickItem: pickFixed })
    expect(c.items[0].x).toBeCloseTo(400 - 200)
  })

  it('removeByUid removes and returns the item', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    const uid = c.items[0].uid
    const removed = c.removeByUid(uid)
    expect(removed.uid).toBe(uid)
    expect(c.count()).toBe(0)
  })

  it('removeByUid returns null for unknown uid', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    expect(c.removeByUid(9999)).toBeNull()
  })

  it('topmost returns first item or null', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    expect(c.topmost()).toBeNull()
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    expect(c.topmost()).toBe(c.items[0])
  })

  it('skips spawn when pickItem returns null', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    const r = c.update(5, { speedMul: 1, spawnEverySec: 1, pickItem: () => null })
    expect(r.spawned).toHaveLength(0)
    expect(c.count()).toBe(0)
  })

  it('reset() clears items and spawn timer', () => {
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100 })
    c.update(2, { speedMul: 1, spawnEverySec: 2, pickItem: pickFixed })
    c.reset()
    expect(c.count()).toBe(0)
    expect(c.sinceLastSpawn).toBe(0)
  })

  it('passes rng to pickItem', () => {
    const seen = []
    const rng = () => 0.42
    const c = new Conveyor({ beltLengthPx: 400, baseSpeedPxPerSec: 100, rng })
    c.update(2, {
      speedMul: 1,
      spawnEverySec: 2,
      pickItem: (r) => { seen.push(r()); return FIXED_ITEM }
    })
    expect(seen).toEqual([0.42])
  })
})
