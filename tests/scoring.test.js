import { describe, it, expect, beforeEach } from 'vitest'
import { Scoring } from '../src/game/scoring.js'
import {
  SCORE_CORRECT,
  SCORE_WRONG,
  SCORE_MISS,
  COMBO_THRESHOLD,
  COMBO_BONUS
} from '../src/config/gameConfig.js'

describe('Scoring', () => {
  let s
  beforeEach(() => { s = new Scoring() })

  it('starts at zero', () => {
    expect(s.score).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.maxCombo).toBe(0)
  })

  it('correct() adds SCORE_CORRECT and increments combo', () => {
    const r = s.correct()
    expect(r.delta).toBe(SCORE_CORRECT)
    expect(r.combo).toBe(1)
    expect(r.bonus).toBe(0)
    expect(s.score).toBe(SCORE_CORRECT)
    expect(s.correctCount).toBe(1)
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

  it('wrong() resets combo and adds SCORE_WRONG', () => {
    s.correct(); s.correct()
    expect(s.combo).toBe(2)
    const r = s.wrong()
    expect(r.delta).toBe(SCORE_WRONG)
    expect(r.combo).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.wrongCount).toBe(1)
    expect(s.score).toBe(SCORE_CORRECT * 2 + SCORE_WRONG)
  })

  it('miss() resets combo and adds SCORE_MISS', () => {
    s.correct()
    const r = s.miss()
    expect(r.delta).toBe(SCORE_MISS)
    expect(r.combo).toBe(0)
    expect(s.missCount).toBe(1)
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

  it('summary() returns accuracy', () => {
    s.correct(); s.correct(); s.correct(); s.wrong(); s.miss()
    const sm = s.summary()
    expect(sm.correctCount).toBe(3)
    expect(sm.wrongCount).toBe(1)
    expect(sm.missCount).toBe(1)
    expect(sm.accuracy).toBeCloseTo(3 / 5)
  })

  it('summary() accuracy is 0 when no actions', () => {
    expect(s.summary().accuracy).toBe(0)
  })

  it('reset() clears everything', () => {
    s.correct(); s.wrong()
    s.reset()
    expect(s.score).toBe(0)
    expect(s.combo).toBe(0)
    expect(s.maxCombo).toBe(0)
    expect(s.correctCount).toBe(0)
    expect(s.wrongCount).toBe(0)
    expect(s.missCount).toBe(0)
  })
})
