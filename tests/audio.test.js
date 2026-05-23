import { describe, it, expect } from 'vitest'
import { resumeAudio, playCorrect, playWrong, playCombo, playMiss } from '../src/game/audio.js'

// Web Audio API is browser-only; in Node, tone() silently catches errors.
// These tests verify the exported functions are callable without throwing.
describe('audio', () => {
  it('resumeAudio does not throw when no AudioContext exists', () => {
    expect(() => resumeAudio()).not.toThrow()
  })

  it('playCorrect does not throw', () => {
    expect(() => playCorrect()).not.toThrow()
  })

  it('playWrong does not throw', () => {
    expect(() => playWrong()).not.toThrow()
  })

  it('playCombo does not throw', () => {
    expect(() => playCombo()).not.toThrow()
  })

  it('playMiss does not throw', () => {
    expect(() => playMiss()).not.toThrow()
  })
})
