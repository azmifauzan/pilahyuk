import { DIFFICULTY_TIERS, BASE_BELT_SPEED_PX_PER_SEC } from '../config/gameConfig.js'

export function tierForElapsed(elapsedSec) {
  for (const tier of DIFFICULTY_TIERS) {
    if (elapsedSec < tier.untilSec) return tier
  }
  return DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1]
}

export function speedAt(elapsedSec, baseSpeed = BASE_BELT_SPEED_PX_PER_SEC) {
  return baseSpeed * tierForElapsed(elapsedSec).speedMul
}

export function spawnIntervalAt(elapsedSec) {
  return tierForElapsed(elapsedSec).spawnEverySec
}

export function tierIndexAt(elapsedSec) {
  for (let i = 0; i < DIFFICULTY_TIERS.length; i++) {
    if (elapsedSec < DIFFICULTY_TIERS[i].untilSec) return i
  }
  return DIFFICULTY_TIERS.length - 1
}
