import {
  SCORE_CORRECT,
  SCORE_WRONG,
  SCORE_MISS,
  COMBO_THRESHOLD,
  COMBO_BONUS,
  START_LIVES
} from '../config/gameConfig.js'

export class Scoring {
  constructor() {
    this.reset()
  }

  reset() {
    this.score = 0
    this.combo = 0
    this.maxCombo = 0
    this.correctCount = 0
    this.wrongCount = 0
    this.missCount = 0
    this.lives = START_LIVES
  }

  correct() {
    this.score += SCORE_CORRECT
    this.combo += 1
    this.correctCount += 1
    if (this.combo > this.maxCombo) this.maxCombo = this.combo
    let bonus = 0
    if (this.combo > 0 && this.combo % COMBO_THRESHOLD === 0) {
      this.score += COMBO_BONUS
      bonus = COMBO_BONUS
    }
    return { delta: SCORE_CORRECT + bonus, combo: this.combo, bonus, score: this.score, lives: this.lives }
  }

  wrong() {
    this.score += SCORE_WRONG
    this.combo = 0
    this.wrongCount += 1
    this.lives = Math.max(0, this.lives - 1)
    return { delta: SCORE_WRONG, combo: 0, bonus: 0, score: this.score, lives: this.lives }
  }

  miss() {
    this.score += SCORE_MISS
    this.combo = 0
    this.missCount += 1
    return { delta: SCORE_MISS, combo: 0, bonus: 0, score: this.score, lives: this.lives }
  }

  isOutOfLives() {
    return this.lives <= 0
  }

  summary() {
    const total = this.correctCount + this.wrongCount + this.missCount
    const accuracy = total === 0 ? 0 : this.correctCount / total
    return {
      score: this.score,
      maxCombo: this.maxCombo,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      missCount: this.missCount,
      accuracy,
      lives: this.lives,
      livesUsed: START_LIVES - this.lives
    }
  }
}
