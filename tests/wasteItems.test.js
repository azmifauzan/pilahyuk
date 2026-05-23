import { describe, it, expect } from 'vitest'
import {
  WASTE_ITEMS,
  WASTE_ITEMS_BY_ID,
  WASTE_ITEMS_BY_CATEGORY,
  WASTE_CATEGORIES
} from '../src/data/wasteItems.js'

describe('wasteItems DB', () => {
  it('has exactly 100 items', () => {
    expect(WASTE_ITEMS).toHaveLength(100)
  })

  it('has 30 organik / 45 anorganik / 25 b3', () => {
    expect(WASTE_ITEMS_BY_CATEGORY.organik).toHaveLength(30)
    expect(WASTE_ITEMS_BY_CATEGORY.anorganik).toHaveLength(45)
    expect(WASTE_ITEMS_BY_CATEGORY.b3).toHaveLength(25)
  })

  it('anorganik split: 30 recyclable + 15 residue', () => {
    const a = WASTE_ITEMS_BY_CATEGORY.anorganik
    expect(a.filter((i) => i.subtype === 'recyclable')).toHaveLength(30)
    expect(a.filter((i) => i.subtype === 'residue')).toHaveLength(15)
  })

  it('ids are unique', () => {
    const ids = WASTE_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every item has required fields', () => {
    for (const it of WASTE_ITEMS) {
      expect(typeof it.id).toBe('string')
      expect(it.id).toMatch(/^[a-z0-9-]+$/)
      expect(typeof it.name).toBe('string')
      expect(it.name.length).toBeGreaterThan(0)
      expect(typeof it.emoji).toBe('string')
      expect(WASTE_CATEGORIES).toContain(it.category)
      expect(typeof it.funFact).toBe('string')
      expect(it.funFact.length).toBeGreaterThan(10)
      if (it.category === 'anorganik') {
        expect(['recyclable', 'residue']).toContain(it.subtype)
      } else {
        expect(it.subtype).toBeNull()
      }
    }
  })

  it('WASTE_ITEMS_BY_ID indexes all items', () => {
    for (const it of WASTE_ITEMS) {
      expect(WASTE_ITEMS_BY_ID[it.id]).toBe(it)
    }
  })

  it('residue items funFact mentions non-recyclability for educational copy', () => {
    const residues = WASTE_ITEMS_BY_CATEGORY.anorganik.filter((i) => i.subtype === 'residue')
    for (const it of residues) {
      expect(it.funFact.toLowerCase()).toMatch(/residu|sekali pakai|daur ulang|kurang|gunting/)
    }
  })
})
