import { describe, expect, it } from 'vitest'
import { countriesOfTheWorld } from '../quiz/countriesOfTheWorld.ts'
import { type Attempt, startAttempt } from './attempt.ts'

const start = () => startAttempt(countriesOfTheWorld, 'free-recall')

// The Country a new Attempt Finds when the text is typed into its answer box, if any.
function countryFoundBy(text: string): string | undefined {
  const result = start().inputChanged(text)
  return result.kind === 'accepted' ? result.place.name : undefined
}

// Types text one key at a time, clearing the answer box after each accepted answer as the UI
// does, and returns the Countries Found along the way.
function typeKeys(attempt: Attempt, text: string): string[] {
  const found: string[] = []
  let box = ''
  for (const key of text) {
    box += key
    const result = attempt.inputChanged(box)
    if (result.kind === 'accepted') {
      found.push(result.place.name)
      box = ''
    }
  }
  return found
}

describe('a new Attempt of Countries of the World', () => {
  it('has a Score of 0 out of 197 with every Country Unfound', () => {
    const state = start().state()

    expect(state.score).toBe(0)
    expect(state.total).toBe(197)
    expect(state.found).toEqual([])
    expect(state.unfound).toHaveLength(197)
    expect(state.wrongGuessCount).toBe(0)
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

describe('pressing Enter', () => {
  it.each(['Atlantis', '???'])(
    'on "%s", which matches no Country, counts a Wrong Guess',
    (text) => {
      const attempt = start()
      attempt.inputChanged('Japan')
      attempt.inputChanged(text)

      expect(attempt.commit(text)).toEqual({ kind: 'wrong-guess' })
      const state = attempt.state()
      expect(state.wrongGuessCount).toBe(1)
      expect(state.score).toBe(1)
      expect(state.found.map((place) => place.name)).toEqual(['Japan'])
    },
  )

  it('counts every Wrong Guess', () => {
    const attempt = start()

    for (const text of ['Atlantis', 'Brazl', 'Holland']) {
      attempt.inputChanged(text)
      attempt.commit(text)
    }

    expect(attempt.state().wrongGuessCount).toBe(3)
  })

  it('on text that matches an Unfound Country is not a Wrong Guess', () => {
    const attempt = start()

    expect(attempt.commit('Japan')).toEqual({ kind: 'nothing' })
    expect(attempt.state().wrongGuessCount).toBe(0)
  })

  it('never counts text that was typed and then deleted as a Wrong Guess', () => {
    const attempt = start()
    typeKeys(attempt, 'Atlantis')
    for (let length = 'Atlantis'.length - 1; length >= 0; length--) {
      attempt.inputChanged('Atlantis'.slice(0, length))
    }

    expect(attempt.commit('')).toEqual({ kind: 'nothing' })
    expect(attempt.state().wrongGuessCount).toBe(0)
  })

  it.each(['', '   '])('on an empty answer box ("%s") does nothing', (text) => {
    const attempt = start()
    attempt.inputChanged('Japan')
    const before = attempt.state()

    expect(attempt.commit(text)).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)
  })

  it.each(['Myanmar', 'burma'])(
    'on an already-Found Country ("%s") is not a Wrong Guess',
    (text) => {
      const attempt = start()
      attempt.inputChanged('Myanmar')
      attempt.inputChanged(text)
      const before = attempt.state()

      expect(attempt.commit(text)).toMatchObject({ kind: 'already-found', place: { id: 'MMR' } })
      expect(attempt.state()).toEqual(before)
      expect(attempt.state().wrongGuessCount).toBe(0)
    },
  )
})

describe('answer matching', () => {
  it.each([
    ['Sao Tome and Principe', 'São Tomé and Príncipe'],
    ['Turkiye', 'Türkiye'],
    ['SÃO TOMÉ AND PRÍNCIPE', 'São Tomé and Príncipe'],
  ])('ignores accents: "%s" Finds %s', (text, country) => {
    expect(countryFoundBy(text)).toBe(country)
  })

  it.each([
    ['cote divoire', "Côte d'Ivoire"],
    ['Côte d’Ivoire', "Côte d'Ivoire"],
    ['Guinea Bissau', 'Guinea-Bissau'],
    ['Guinea-Bissau', 'Guinea-Bissau'],
    ['Timor Leste', 'Timor-Leste'],
  ])('ignores punctuation: "%s" Finds %s', (text, country) => {
    expect(countryFoundBy(text)).toBe(country)
  })

  it.each([
    ['  New   Zealand ', 'New Zealand'],
    ['Guinea - Bissau', 'Guinea-Bissau'],
  ])('collapses whitespace: "%s" Finds %s', (text, country) => {
    expect(countryFoundBy(text)).toBe(country)
  })

  it.each([
    ['Gambia', 'Gambia'],
    ['The Gambia', 'Gambia'],
    ['the Netherlands', 'Netherlands'],
    ['THE BAHAMAS', 'Bahamas'],
    ['Thailand', 'Thailand'],
    ['Saint Vincent and the Grenadines', 'Saint Vincent and the Grenadines'],
  ])('makes a leading "the" optional: "%s" Finds %s', (text, country) => {
    expect(countryFoundBy(text)).toBe(country)
  })

  it.each([
    ['Nigeria', 'Niger', 'Nigeria'],
    ['Guinea-Bissau', 'Guinea', 'Guinea-Bissau'],
    ['Dominican Republic', 'Dominica', 'Dominican Republic'],
    ['Ukraine', 'United Kingdom', 'Ukraine'],
    ['Congo-Kinshasa', 'Republic of the Congo', 'Democratic Republic of the Congo'],
  ])(
    'typing "%s": %s auto-accepts part-way through it, and retyping it Finds %s',
    (text, foundEarly, foundOnRetype) => {
      const attempt = start()

      expect(typeKeys(attempt, text)).toEqual([foundEarly])
      expect(typeKeys(attempt, text)).toEqual([foundOnRetype])
      expect(attempt.state().score).toBe(2)
    },
  )
})

describe('Aliases', () => {
  it.each([
    // short forms
    ['USA', 'United States'],
    ['U.S.A.', 'United States'],
    ['UK', 'United Kingdom'],
    ['UAE', 'United Arab Emirates'],
    // English and native names
    ['Ivory Coast', "Côte d'Ivoire"],
    ['East Timor', 'Timor-Leste'],
    ['Cape Verde', 'Cabo Verde'],
    ['Turkey', 'Türkiye'],
    // well-known former names
    ['Burma', 'Myanmar'],
    ['Swaziland', 'Eswatini'],
    ['Czech Republic', 'Czechia'],
    ['Macedonia', 'North Macedonia'],
    // St/Saint and &/and variants
    ['St Lucia', 'Saint Lucia'],
    ['St. Kitts & Nevis', 'Saint Kitts and Nevis'],
    ['Saint Vincent & the Grenadines', 'Saint Vincent and the Grenadines'],
    ['Trinidad & Tobago', 'Trinidad and Tobago'],
    ['Bosnia & Herzegovina', 'Bosnia and Herzegovina'],
  ])('"%s" Finds %s', (text, country) => {
    expect(countryFoundBy(text)).toBe(country)
  })

  it('Finds the Republic of the Congo from "Congo" alone', () => {
    expect(countryFoundBy('Congo')).toBe('Republic of the Congo')
  })

  it.each(['DR Congo', 'DRC', 'Democratic Republic of the Congo', 'Congo-Kinshasa', 'Zaire'])(
    '"%s" Finds the Democratic Republic of the Congo',
    (text) => {
      expect(countryFoundBy(text)).toBe('Democratic Republic of the Congo')
    },
  )

  it.each(['America', 'Holland', 'England'])(
    'does not accept the ambiguous colloquial name "%s"',
    (text) => {
      expect(countryFoundBy(text)).toBeUndefined()
    },
  )

  it.each(['Brazl', 'Phillipines', 'Columbia', 'Nigerai'])(
    'does not accept the misspelling "%s"',
    (text) => {
      expect(countryFoundBy(text)).toBeUndefined()
    },
  )

  it('counts a Country Found by an Alias as already Found by its name', () => {
    const attempt = start()
    attempt.inputChanged('Burma')

    expect(attempt.inputChanged('Myanmar')).toMatchObject({
      kind: 'already-found',
      place: { name: 'Myanmar' },
    })
    expect(attempt.state().score).toBe(1)
  })
})
