import { describe, it, expect, beforeEach } from 'vitest'
import { Scoring } from '../src/game/scoring.js'
import {
  SCORE_CORRECT,
  SCORE_WRONG,
  SCORE_MISS,
  COMBO_THRESHOLD,
  COMBO_BONUS,
  START_LIVES
} from '../src/config/gameConfig.js'

describe('Scoring', () => {
  let s
  beforeEach(() => { s = new Scoring() })

  it('starts at zero score/combo with full lives', () => {
    expect(s.score).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.maxCombo).toBe(0)
    expect(s.lives).toBe(START_LIVES)
  })

  it('correct() adds SCORE_CORRECT and increments combo, does not change lives', () => {
    const r = s.correct()
    expect(r.delta).toBe(SCORE_CORRECT)
    expect(r.combo).toBe(1)
    expect(r.bonus).toBe(0)
    expect(s.score).toBe(SCORE_CORRECT)
    expect(s.correctCount).toBe(1)
    expect(s.lives).toBe(START_LIVES)
  })

  it('awards COMBO_BONUS at every COMBO_THRESHOLD', () => {
    for (let i = 0; i < COMBO_THRESHOLD - 1; i++) s.correct()
    expect(s.score).toBe(SCORE_CORRECT * (COMBO_THRESHOLD - 1))
    const r = s.correct()
    expect(r.bonus).toBe(COMBO_BONUS)
    expect(r.delta).toBe(SCORE_CORRECT + COMBO_BONUS)
    expect(s.score).toBe(SCORE_CORRECT * COMBO_THRESHOLD + COMBO_BONUS)
  })

  it('awards bonus again at 2*threshold', () => {
    for (let i = 0; i < COMBO_THRESHOLD * 2; i++) {
      const r = s.correct()
      if ((i + 1) % COMBO_THRESHOLD === 0) expect(r.bonus).toBe(COMBO_BONUS)
      else expect(r.bonus).toBe(0)
    }
    expect(s.score).toBe(SCORE_CORRECT * COMBO_THRESHOLD * 2 + COMBO_BONUS * 2)
  })

  it('wrong() resets combo, delta is SCORE_WRONG (0), decrements lives', () => {
    s.correct(); s.correct()
    expect(s.combo).toBe(2)
    const r = s.wrong()
    expect(r.delta).toBe(SCORE_WRONG)
    expect(r.combo).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.wrongCount).toBe(1)
    expect(s.score).toBe(SCORE_CORRECT * 2 + SCORE_WRONG)
    expect(r.lives).toBe(START_LIVES - 1)
    expect(s.lives).toBe(START_LIVES - 1)
  })

  it('wrong() clamps lives at 0, never goes negative', () => {
    for (let i = 0; i < START_LIVES + 2; i++) s.wrong()
    expect(s.lives).toBe(0)
  })

  it('miss() resets combo and adds SCORE_MISS, does not affect lives', () => {
    s.correct()
    const r = s.miss()
    expect(r.delta).toBe(SCORE_MISS)
    expect(r.combo).toBe(0)
    expect(s.missCount).toBe(1)
    expect(s.lives).toBe(START_LIVES)
  })

  it('isOutOfLives() false initially, true after START_LIVES wrongs', () => {
    expect(s.isOutOfLives()).toBe(false)
    for (let i = 0; i < START_LIVES - 1; i++) {
      s.wrong()
      expect(s.isOutOfLives()).toBe(false)
    }
    s.wrong()
    expect(s.isOutOfLives()).toBe(true)
  })

  it('tracks maxCombo across wrong/miss resets', () => {
    s.correct(); s.correct(); s.correct()
    expect(s.maxCombo).toBe(3)
    s.wrong()
    s.correct(); s.correct()
    expect(s.maxCombo).toBe(3)
    s.correct(); s.correct()
    expect(s.maxCombo).toBe(4)
  })

  it('summary() returns accuracy, lives, livesUsed', () => {
    s.correct(); s.correct(); s.correct(); s.wrong(); s.miss()
    const sm = s.summary()
    expect(sm.correctCount).toBe(3)
    expect(sm.wrongCount).toBe(1)
    expect(sm.missCount).toBe(1)
    expect(sm.accuracy).toBeCloseTo(3 / 5)
    expect(sm.lives).toBe(START_LIVES - 1)
    expect(sm.livesUsed).toBe(1)
  })

  it('summary() accuracy is 0 when no actions', () => {
    const sm = s.summary()
    expect(sm.accuracy).toBe(0)
    expect(sm.lives).toBe(START_LIVES)
    expect(sm.livesUsed).toBe(0)
  })

  it('reset() clears everything including lives', () => {
    s.correct(); s.wrong()
    s.reset()
    expect(s.score).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.maxCombo).toBe(0)
    expect(s.correctCount).toBe(0)
    expect(s.wrongCount).toBe(0)
    expect(s.missCount).toBe(0)
    expect(s.lives).toBe(START_LIVES)
  })
})
