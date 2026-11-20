import { describe, expect, it } from 'vitest'
import { MAX_STARS, nextStarScore, starsFor } from './stars.ts'

describe('Stars', () => {
  it('are earned for naming half, four-fifths and all of the Places, each share rounded up', () => {
    expect([0, 98, 99, 157, 158, 196, 197].map((score) => starsFor(score, 197))).toEqual([0, 0, 1, 1, 2, 2, 3])
  })

  it('are never more than three', () => {
    expect(MAX_STARS).toBe(3)
    expect(starsFor(12, 12)).toBe(3)
  })

  it('come one at a time from a short Quiz, where the shares round up to different Scores', () => {
    expect([5, 6, 9, 10, 11, 12].map((score) => starsFor(score, 12))).toEqual([0, 1, 1, 2, 2, 3])
  })
})

describe('the Score for the next Star', () => {
  it('is half the Places, rounded up, before any Star is earned', () => {
    expect(nextStarScore(0, 197)).toBe(99)
    expect(nextStarScore(98, 197)).toBe(99)
  })

  it('is four-fifths, then all, of the Places as each Star is earned', () => {
    expect(nextStarScore(99, 197)).toBe(158)
    expect(nextStarScore(158, 197)).toBe(197)
  })

  it('is none once every Star is earned', () => {
    expect(nextStarScore(197, 197)).toBeNull()
  })
})
