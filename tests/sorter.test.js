import { describe, it, expect } from 'vitest'
import { getItemById, judge, isValidCategory, randomItem } from '../src/game/sorter.js'
import { WASTE_ITEMS } from '../src/data/wasteItems.js'

describe('sorter', () => {
  it('getItemById returns matching item', () => {
    const it = getItemById('baterai')
    expect(it).not.toBeNull()
    expect(it.category).toBe('b3')
  })

  it('getItemById returns null for unknown id', () => {
    expect(getItemById('does-not-exist')).toBeNull()
  })

  it('isValidCategory accepts the 3 categories', () => {
    expect(isValidCategory('organik')).toBe(true)
    expect(isValidCategory('anorganik')).toBe(true)
    expect(isValidCategory('b3')).toBe(true)
    expect(isValidCategory('plastik')).toBe(false)
  })

  it('judge correct match returns ok=true with funFact + subtype', () => {
    const it = getItemById('popok-bayi')
    const r = judge(it, 'anorganik')
    expect(r.ok).toBe(true)
    expect(r.expected).toBe('anorganik')
    expect(r.subtype).toBe('residue')
    expect(r.funFact).toMatch(/residu/i)
  })

  it('judge wrong match returns ok=false with expected', () => {
    const r = judge(getItemById('baterai'), 'anorganik')
    expect(r.ok).toBe(false)
    expect(r.expected).toBe('b3')
    expect(r.chosen).toBe('anorganik')
  })

  it('judge null item returns unknown-item', () => {
    const r = judge(null, 'organik')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('unknown-item')
  })

  it('judge invalid category returns invalid-category', () => {
    const r = judge(getItemById('baterai'), 'logam')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('invalid-category')
    expect(r.expected).toBe('b3')
  })

  it('randomItem picks deterministically from rng', () => {
    const first = randomItem(() => 0)
    expect(first).toBe(WASTE_ITEMS[0])
    const last = randomItem(() => 0.999999)
    expect(last).toBe(WASTE_ITEMS[WASTE_ITEMS.length - 1])
  })

  it('randomItem uses Math.random by default', () => {
    const r = randomItem()
    expect(WASTE_ITEMS).toContain(r)
  })
})
