import { describe, expect, it } from 'vitest'
import { countriesOfTheWorld } from '../quiz/countriesOfTheWorld.ts'
import { startAttempt } from './attempt.ts'

const start = () => startAttempt(countriesOfTheWorld, 'free-recall')

describe('a new Attempt of Countries of the World', () => {
  it('has a Score of 0 out of 197 with every Country Unfound', () => {
    const state = start().state()

    expect(state.score).toBe(0)
    expect(state.total).toBe(197)
    expect(state.found).toEqual([])
    expect(state.unfound).toHaveLength(197)
  })
})

describe('typing in the answer box', () => {
  it("accepts a Country's exact name and Finds it", () => {
    const attempt = start()

    const result = attempt.inputChanged('France')

    expect(result).toMatchObject({ kind: 'accepted', place: { id: 'FRA' } })
    const state = attempt.state()
    expect(state.score).toBe(1)
    expect(state.found.map((place) => place.id)).toEqual(['FRA'])
    expect(state.unfound).toHaveLength(196)
    expect(state.unfound.map((place) => place.id)).not.toContain('FRA')
  })

  it.each(['france', 'FRANCE', 'fRaNcE'])('accepts "%s" in any letter case', (text) => {
    const attempt = start()

    expect(attempt.inputChanged(text)).toMatchObject({ kind: 'accepted', place: { id: 'FRA' } })
  })

  it('increments the Score with each Country Found', () => {
    const attempt = start()

    attempt.inputChanged('Japan')
    attempt.inputChanged('Peru')
    attempt.inputChanged('Kenya')

    const state = attempt.state()
    expect(state.score).toBe(3)
    expect(state.total).toBe(197)
    expect(state.found.map((place) => place.name)).toEqual(['Japan', 'Peru', 'Kenya'])
    expect(state.unfound).toHaveLength(194)
  })

  it('does not re-accept a Country that is already Found', () => {
    const attempt = start()
    attempt.inputChanged('France')

    const result = attempt.inputChanged('france')

    expect(result).toMatchObject({ kind: 'already-found', place: { id: 'FRA' } })
    expect(attempt.state().score).toBe(1)
    expect(attempt.state().found.map((place) => place.id)).toEqual(['FRA'])
  })

  it.each(['', 'Fran', 'Atlantis', 'Greenland'])(
    'treats "%s" as no match and leaves the state unchanged',
    (text) => {
      const attempt = start()
      attempt.inputChanged('Japan')
      const before = attempt.state()

      expect(attempt.inputChanged(text)).toEqual({ kind: 'no-match' })
      expect(attempt.state()).toEqual(before)
    },
  )
})
