import { WASTE_ITEMS, WASTE_ITEMS_BY_ID } from '../data/wasteItems.js'
import { CATEGORY_IDS } from '../config/gameConfig.js'

export function getItemById(id) {
  return WASTE_ITEMS_BY_ID[id] ?? null
}

export function isValidCategory(category) {
  return CATEGORY_IDS.includes(category)
}

export function judge(item, chosenCategory) {
  if (!item) return { ok: false, reason: 'unknown-item' }
  if (!isValidCategory(chosenCategory)) return { ok: false, reason: 'invalid-category', expected: item.category }
  return {
    ok: item.category === chosenCategory,
    expected: item.category,
    chosen: chosenCategory,
    funFact: item.funFact,
    subtype: item.subtype
  }
}

export function randomItem(rng = Math.random) {
  const idx = Math.floor(rng() * WASTE_ITEMS.length)
  return WASTE_ITEMS[idx]
}
