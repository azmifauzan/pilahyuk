// Locked game rules — must match plan.md "Keputusan Final" + "Core Mechanics".
// Any change here must be approved by the user, not silently tuned.

export const ROUND_SECONDS = 60

export const START_LIVES = 3

export const SCORE_CORRECT = 10
export const SCORE_WRONG = 0
export const SCORE_MISS = -3
export const COMBO_THRESHOLD = 5
export const COMBO_BONUS = 25

export const BASE_BELT_SPEED_PX_PER_SEC = 90

export const DIFFICULTY_TIERS = Object.freeze([
  Object.freeze({ untilSec: 20, speedMul: 1.0, spawnEverySec: 2.0 }),
  Object.freeze({ untilSec: 40, speedMul: 1.25, spawnEverySec: 1.5 }),
  Object.freeze({ untilSec: 60, speedMul: 1.5, spawnEverySec: 1.2 })
])

export const CATEGORY_IDS = Object.freeze(['organik', 'anorganik', 'b3'])

export const CATEGORY_LABEL = Object.freeze({
  organik: 'Organik',
  anorganik: 'Anorganik',
  b3: 'B3'
})

export const CATEGORY_COLOR = Object.freeze({
  organik: 0x22c55e,
  anorganik: 0xeab308,
  b3: 0xef4444
})

export const SCENE_KEYS = Object.freeze({
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  TUTORIAL: 'TutorialScene',
  ABOUT: 'AboutScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  EDUCATION: 'EducationDetailScene'
})

export const GAME_WIDTH = 480
export const GAME_HEIGHT = 854

export const HIGH_SCORE_KEY = 'pilahyuk:highscore'

export const FONT = 'Arial, Helvetica, sans-serif'

export const GAME_CONFIG = Object.freeze({
  parent: 'game',
  backgroundColor: '#f0fdf4',
  scale: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  }
})
