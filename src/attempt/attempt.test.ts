import { describe, expect, it } from 'vitest'
import { countriesOfTheWorld } from '../quiz/countriesOfTheWorld.ts'
import type { Place } from '../quiz/quiz.ts'
import { usStateCapitals } from '../quiz/usStateCapitals.ts'
import { type Attempt, type Clock, hasEnded, type Random, startAttempt, type TimerSetting } from './attempt.ts'

const start = (clock: Clock = () => 0) => startAttempt(countriesOfTheWorld, 'free-recall', clock)

// Starts an Attempt with the Timer on, set to the given number of minutes.
const startWithTimer = (minutes: number, clock: Clock) =>
  startAttempt(countriesOfTheWorld, 'free-recall', clock, minutes * 60_000)

// A clock that stands still until the test moves it on, starting from an arbitrary moment.
function testClock() {
  let now = 1_000_000
  return {
    now: () => now,
    advance(ms: number) {
      now += ms
    },
  }
}

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

function findEveryCountry(attempt: Attempt) {
  for (const place of countriesOfTheWorld.places) attempt.inputChanged(place.name)
}

// The state of an Attempt that has ended, failing the test if it is still in progress or paused.
function endedState(attempt: Attempt) {
  const state = attempt.state()
  if (!hasEnded(state)) throw new Error(`The Attempt is ${state.status}, not ended`)
  return state
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

  it('is in progress, with no time elapsed', () => {
    const state = start(testClock().now).state()

    expect(state.status).toBe('in-progress')
    expect(state.elapsedMs).toBe(0)
  })
})

describe('elapsed time', () => {
  it('is the time since the Attempt started, by the clock it was given', () => {
    const clock = testClock()
    const attempt = start(clock.now)

    clock.advance(1_500)
    expect(attempt.state().elapsedMs).toBe(1_500)

    clock.advance(61_000)
    expect(attempt.state().elapsedMs).toBe(62_500)
  })

  it('stays correct however long it goes unread, as in a background tab', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    attempt.inputChanged('Japan')

    clock.advance(10 * 60_000)

    expect(attempt.state().elapsedMs).toBe(10 * 60_000)
    expect(attempt.state().status).toBe('in-progress')
  })
})

describe('the Timer', () => {
  it('is off unless the Attempt is started with one', () => {
    expect(start().state().timer).toBeNull()
  })

  it('counts down from its duration, by the clock the Attempt was given', () => {
    const clock = testClock()
    const attempt = startWithTimer(15, clock.now)
    expect(attempt.state().timer).toEqual({ durationMs: 900_000, remainingMs: 900_000 })

    clock.advance(1_500)
    expect(attempt.state().timer).toEqual({ durationMs: 900_000, remainingMs: 898_500 })

    clock.advance(61_000)
    expect(attempt.state()).toMatchObject({
      status: 'in-progress',
      elapsedMs: 62_500,
      timer: { durationMs: 900_000, remainingMs: 837_500 },
    })
  })

  it("ends the Attempt as Time's up when it reaches 0:00, with every Unfound Country Missed", () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    attempt.inputChanged('Japan')
    attempt.inputChanged('Peru')

    clock.advance(599_999)
    expect(attempt.state()).toMatchObject({ status: 'in-progress', timer: { remainingMs: 1 } })

    clock.advance(1)
    const state = endedState(attempt)
    expect(state.status).toBe('times-up')
    expect(state.score).toBe(2)
    expect(state.missed).toHaveLength(195)
    expect(state.missed.map((place) => place.id)).not.toContain('JPN')
    expect(state.elapsedMs).toBe(600_000)
    expect(state.timer).toEqual({ durationMs: 600_000, remainingMs: 0 })
  })

  it('accepts no answers and counts no Wrong Guesses once it has run out, even before the Attempt is next read', () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    attempt.inputChanged('Japan')
    clock.advance(600_000)

    expect(attempt.inputChanged('France')).toEqual({ kind: 'no-match' })
    expect(attempt.commit('Atlantis')).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toMatchObject({ status: 'times-up', score: 1, wrongGuessCount: 0 })
  })

  it('still lets the Attempt end as Completed when every Country is Found before 0:00', () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    clock.advance(400_000)
    findEveryCountry(attempt)

    clock.advance(400_000)

    expect(attempt.state()).toMatchObject({
      status: 'completed',
      score: 197,
      missed: [],
      elapsedMs: 400_000,
      timer: { durationMs: 600_000, remainingMs: 200_000 },
    })
  })

  it("ends the Attempt as Time's up, not Gave up, when the player gives up after 0:00 before the Attempt is next read", () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    clock.advance(600_500)

    attempt.giveUp()

    expect(attempt.state()).toMatchObject({ status: 'times-up', elapsedMs: 600_000 })
  })

  it('is either running with time left or up, even read by a clock that moves while it is read', () => {
    // Like the real clock, this one moves on between one reading and the next.
    let now = 0
    const attempt = startWithTimer(1, () => (now += 1))
    now += 59_990

    for (let read = 0; read < 20; read++) {
      const state = attempt.state()
      if (state.status === 'in-progress') expect(state.timer?.remainingMs).toBeGreaterThan(0)
      else expect(state).toMatchObject({ status: 'times-up', elapsedMs: 60_000, timer: { remainingMs: 0 } })
    }
    expect(attempt.state().status).toBe('times-up')
  })

  it('stops the clock at 0:00, however late the Attempt is next read', () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)

    clock.advance(25 * 60_000)

    expect(attempt.state()).toMatchObject({
      status: 'times-up',
      elapsedMs: 600_000,
      timer: { durationMs: 600_000, remainingMs: 0 },
    })
  })
})

describe('Pause', () => {
  it('pauses the Attempt until the player resumes it', () => {
    const attempt = start()

    attempt.pause()
    expect(attempt.state().status).toBe('paused')

    attempt.resume()
    expect(attempt.state().status).toBe('in-progress')
  })

  it('stops the stopwatch, which carries on from where it stopped when the Attempt resumes', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    clock.advance(60_000)

    attempt.pause()
    clock.advance(5 * 60_000)
    expect(attempt.state().elapsedMs).toBe(60_000)

    attempt.resume()
    clock.advance(30_000)
    expect(attempt.state().elapsedMs).toBe(90_000)
  })

  it("holds the Timer's countdown, so Time's up cannot come while the Attempt is paused", () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    clock.advance(9 * 60_000)

    attempt.pause()
    clock.advance(20 * 60_000)
    expect(attempt.state()).toMatchObject({
      status: 'paused',
      elapsedMs: 9 * 60_000,
      timer: { durationMs: 600_000, remainingMs: 60_000 },
    })

    attempt.resume()
    clock.advance(59_999)
    expect(attempt.state()).toMatchObject({ status: 'in-progress', timer: { remainingMs: 1 } })

    clock.advance(1)
    expect(attempt.state()).toMatchObject({ status: 'times-up', elapsedMs: 600_000 })
  })

  it('leaves out the time of every Pause', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    for (let pause = 0; pause < 3; pause++) {
      clock.advance(10_000)
      attempt.pause()
      clock.advance(60_000)
      attempt.resume()
    }

    expect(attempt.state().elapsedMs).toBe(30_000)
  })

  it('accepts no answers and counts no Wrong Guesses while the Attempt is paused', () => {
    const attempt = start()
    attempt.inputChanged('Japan')
    attempt.pause()
    const before = attempt.state()

    expect(attempt.inputChanged('France')).toEqual({ kind: 'no-match' })
    expect(attempt.inputChanged('Japan')).toEqual({ kind: 'no-match' })
    expect(attempt.commit('Japan')).toEqual({ kind: 'nothing' })
    expect(attempt.commit('Atlantis')).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)
  })

  it('accepts answers again once the Attempt resumes', () => {
    const attempt = start()
    attempt.pause()
    attempt.inputChanged('France')

    attempt.resume()

    expect(attempt.inputChanged('France')).toMatchObject({ kind: 'accepted', place: { id: 'FRA' } })
    expect(attempt.state().score).toBe(1)
  })

  it("leaves the Attempt ended as Time's up when the player pauses after 0:00 before the Attempt is next read", () => {
    const clock = testClock()
    const attempt = startWithTimer(10, clock.now)
    clock.advance(600_500)

    attempt.pause()

    expect(attempt.state()).toMatchObject({ status: 'times-up', elapsedMs: 600_000 })
  })

  it('does nothing to an Attempt that has ended', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    clock.advance(60_000)
    attempt.giveUp()
    const before = attempt.state()

    attempt.pause()
    clock.advance(60_000)
    attempt.resume()

    expect(attempt.state()).toEqual(before)
  })

  it('ends the Attempt as Gave up, with the time played before the Pause, when the player gives up while paused', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    clock.advance(60_000)
    attempt.pause()
    clock.advance(5 * 60_000)

    attempt.giveUp()

    expect(attempt.state()).toMatchObject({ status: 'gave-up', elapsedMs: 60_000 })
  })
})

describe('Finding every Country', () => {
  const [lastCountry, ...otherCountries] = countriesOfTheWorld.places

  it('ends the Attempt as Completed the moment the 197th is Found, with nothing Missed', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    for (const place of otherCountries) {
      attempt.inputChanged(place.name)
      clock.advance(1_000)
    }
    expect(attempt.state().status).toBe('in-progress')

    expect(attempt.inputChanged(lastCountry.name)).toMatchObject({
      kind: 'accepted',
      place: { id: lastCountry.id },
    })

    const state = endedState(attempt)
    expect(state.status).toBe('completed')
    expect(state.score).toBe(197)
    expect(state.missed).toEqual([])
    expect(state.elapsedMs).toBe(196_000)
  })

  it('stops the clock when the Attempt is Completed', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    findEveryCountry(attempt)
    clock.advance(60_000)

    expect(attempt.state().elapsedMs).toBe(0)
  })
})

describe('giving up', () => {
  it('ends the Attempt as Gave up, with every Unfound Country Missed', () => {
    const attempt = start()
    attempt.inputChanged('Japan')
    attempt.inputChanged('Peru')

    attempt.giveUp()

    const state = endedState(attempt)
    expect(state.status).toBe('gave-up')
    expect(state.score).toBe(2)
    expect(state.missed).toHaveLength(195)
    const missedIds = state.missed.map((place) => place.id)
    expect(missedIds).toContain('FRA')
    expect(missedIds).not.toContain('JPN')
    expect(missedIds).not.toContain('PER')
  })

  it('stops the clock at the moment the player gives up', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    clock.advance(5 * 60_000)

    attempt.giveUp()
    clock.advance(60_000)

    expect(attempt.state().elapsedMs).toBe(5 * 60_000)
  })
})

describe('an Attempt that has ended', () => {
  it('accepts no answers and counts no Wrong Guesses', () => {
    const attempt = start()
    attempt.inputChanged('Japan')
    attempt.giveUp()
    const before = attempt.state()

    expect(attempt.inputChanged('France')).toEqual({ kind: 'no-match' })
    expect(attempt.commit('Atlantis')).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)
  })

  it('stays Completed if the player then gives up', () => {
    const clock = testClock()
    const attempt = start(clock.now)
    findEveryCountry(attempt)
    clock.advance(60_000)

    attempt.giveUp()

    expect(attempt.state()).toMatchObject({ status: 'completed', elapsedMs: 0, missed: [] })
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

// A source of randomness that gives the same numbers for the same seed, so a test fixes the order of
// the Prompts: the Park–Miller generator.
function seededRandom(seed: number) {
  let n = seed
  return () => (n = (n * 16_807) % 2_147_483_647) / 2_147_483_647
}

// Starts a Cued Recall Attempt of US State Capitals, its Prompts ordered by the given randomness.
const startCued = ({
  random = seededRandom(1),
  clock = () => 0,
  timerMs = null,
}: { random?: Random; clock?: Clock; timerMs?: TimerSetting } = {}) =>
  startAttempt(usStateCapitals, 'cued-recall', clock, timerMs, random)

// The current Prompt, failing the test if there is none.
function currentPrompt(attempt: Attempt): Place {
  const { prompt } = attempt.state()
  if (!prompt) throw new Error(`The ${attempt.state().status} Attempt has no Prompt`)
  return prompt
}

// Answers the given number of Prompts in turn, and returns the capitals they asked for, in order.
function answerPrompts(attempt: Attempt, count: number): Place[] {
  const asked: Place[] = []
  for (let answered = 0; answered < count; answered++) {
    const prompt = currentPrompt(attempt)
    asked.push(prompt)
    attempt.inputChanged(prompt.name)
  }
  return asked
}

// The States a whole Attempt's Prompts ask about, in order.
const promptOrder = (attempt: Attempt) =>
  answerPrompts(attempt, usStateCapitals.places.length).map((place) => place.id)

// Answers Prompts in turn until the given State's is current.
function answerPromptsUntil(attempt: Attempt, stateId: string) {
  for (let answered = 0; currentPrompt(attempt).id !== stateId; answered++) {
    if (answered === usStateCapitals.places.length) throw new Error(`${stateId} was never prompted`)
    attempt.inputChanged(currentPrompt(attempt).name)
  }
}

// A capital whose State isn't the given one's.
function capitalOtherThan(place: Place): Place {
  const other = usStateCapitals.places.find((capital) => capital !== place)
  if (!other) throw new Error(`There is no capital other than ${place.name}`)
  return other
}

describe('a Cued Recall Attempt of US State Capitals', () => {
  it('asks for every capital once, one Prompt at a time, in an order set by the randomness it is given', () => {
    const order = promptOrder(startCued({ random: seededRandom(1) }))

    expect(new Set(order).size).toBe(50)
    expect(order).not.toEqual(usStateCapitals.places.map((place) => place.id))
    expect(promptOrder(startCued({ random: seededRandom(1) }))).toEqual(order)
    expect(promptOrder(startCued({ random: seededRandom(2) }))).not.toEqual(order)
  })

  it("accepts the current Prompt's capital, Finding it, and then asks for the next", () => {
    const attempt = startCued()
    const prompt = currentPrompt(attempt)

    expect(attempt.inputChanged(prompt.name)).toEqual({ kind: 'accepted', place: prompt })
    expect(attempt.state()).toMatchObject({ score: 1, found: [prompt], unfound: expect.not.arrayContaining([prompt]) })
    expect(currentPrompt(attempt)).not.toBe(prompt)
  })

  it("does not accept another State's capital, and keeps the same Prompt", () => {
    const attempt = startCued()
    const prompt = currentPrompt(attempt)
    const before = attempt.state()

    expect(attempt.inputChanged(capitalOtherThan(prompt).name)).toEqual({ kind: 'no-match' })
    expect(attempt.state()).toEqual(before)
    expect(currentPrompt(attempt)).toBe(prompt)
  })

  it.each(['St Paul', 'st. paul', 'SAINT PAUL'])(
    'accepts "%s" for Saint Paul when Minnesota is the Prompt, by its Alias and ignoring case and punctuation',
    (text) => {
      const attempt = startCued()
      answerPromptsUntil(attempt, 'MN')

      expect(attempt.inputChanged(text)).toMatchObject({ kind: 'accepted', place: { name: 'Saint Paul' } })
    },
  )

  it("treats a capital already Found as no match, never as already Found, and keeps the same Prompt", () => {
    const attempt = startCued()
    const [capitalFound] = answerPrompts(attempt, 1)
    const before = attempt.state()

    expect(attempt.inputChanged(capitalFound.name)).toEqual({ kind: 'no-match' })
    expect(attempt.state()).toEqual(before)
  })
})

describe('pressing Enter in Cued Recall', () => {
  it("on another State's capital counts a Wrong Guess and keeps the same Prompt", () => {
    const attempt = startCued()
    const prompt = currentPrompt(attempt)
    const otherCapital = capitalOtherThan(prompt).name
    attempt.inputChanged(otherCapital)

    expect(attempt.commit(otherCapital)).toEqual({ kind: 'wrong-guess' })
    expect(attempt.state()).toMatchObject({ wrongGuessCount: 1, score: 0, prompt })
  })

  it('on a capital already Found counts a Wrong Guess', () => {
    const attempt = startCued()
    const [capitalFound] = answerPrompts(attempt, 1)
    attempt.inputChanged(capitalFound.name)

    expect(attempt.commit(capitalFound.name)).toEqual({ kind: 'wrong-guess' })
    expect(attempt.state()).toMatchObject({ wrongGuessCount: 1, score: 1 })
  })

  it.each(['Los Angeles', 'California', 'Sacra'])('on "%s", which is no capital, counts a Wrong Guess', (text) => {
    const attempt = startCued()
    attempt.inputChanged(text)

    expect(attempt.commit(text)).toEqual({ kind: 'wrong-guess' })
    expect(attempt.state().wrongGuessCount).toBe(1)
  })

  it("on the current Prompt's capital is not a Wrong Guess, as it is accepted the moment it's typed", () => {
    const attempt = startCued()

    expect(attempt.commit(currentPrompt(attempt).name)).toEqual({ kind: 'nothing' })
    expect(attempt.state().wrongGuessCount).toBe(0)
  })

  it.each(['', '   '])('on an empty answer box ("%s") does nothing', (text) => {
    const attempt = startCued()
    answerPrompts(attempt, 1)
    const before = attempt.state()

    expect(attempt.commit(text)).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)
  })
})

describe('a Cued Recall Attempt that is paused', () => {
  it('keeps its Prompt, but accepts no answer and counts no Wrong Guess until it resumes', () => {
    const attempt = startCued()
    answerPrompts(attempt, 1)
    const prompt = currentPrompt(attempt)
    attempt.pause()
    const before = attempt.state()

    expect(before.prompt).toBe(prompt)
    expect(attempt.inputChanged(prompt.name)).toEqual({ kind: 'no-match' })
    expect(attempt.commit(capitalOtherThan(prompt).name)).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)

    attempt.resume()
    expect(attempt.inputChanged(prompt.name)).toEqual({ kind: 'accepted', place: prompt })
  })
})

describe('a Cued Recall Attempt that has ended', () => {
  it('ends as Completed the moment the 50th capital is Found, with nothing Missed and no Prompt', () => {
    const clock = testClock()
    const attempt = startCued({ clock: clock.now })
    for (let answered = 0; answered < 49; answered++) {
      clock.advance(1_000)
      attempt.inputChanged(currentPrompt(attempt).name)
    }
    const lastPrompt = currentPrompt(attempt)
    expect(attempt.state()).toMatchObject({ status: 'in-progress', score: 49, unfound: [lastPrompt] })

    clock.advance(1_000)
    expect(attempt.inputChanged(lastPrompt.name)).toEqual({ kind: 'accepted', place: lastPrompt })

    expect(endedState(attempt)).toMatchObject({
      status: 'completed',
      score: 50,
      missed: [],
      elapsedMs: 50_000,
      prompt: null,
    })
  })

  it("ends as Time's up when the Timer runs out, with every Unfound capital Missed and no Prompt", () => {
    const clock = testClock()
    const attempt = startCued({ clock: clock.now, timerMs: 10 * 60_000 })
    answerPrompts(attempt, 3)
    const prompt = currentPrompt(attempt)

    clock.advance(10 * 60_000)

    const state = endedState(attempt)
    expect(state).toMatchObject({ status: 'times-up', score: 3, prompt: null })
    expect(state.missed).toHaveLength(47)
    expect(state.missed).toContain(prompt)
    expect(attempt.inputChanged(prompt.name)).toEqual({ kind: 'no-match' })
  })

  it('has no Prompt once given up, and accepts no answer and counts no Wrong Guess', () => {
    const attempt = startCued()
    answerPrompts(attempt, 1)
    const prompt = currentPrompt(attempt)

    attempt.giveUp()

    const before = endedState(attempt)
    expect(before).toMatchObject({ status: 'gave-up', score: 1, prompt: null })
    expect(attempt.inputChanged(prompt.name)).toEqual({ kind: 'no-match' })
    expect(attempt.commit('Atlantis')).toEqual({ kind: 'nothing' })
    expect(attempt.state()).toEqual(before)
  })
})

describe('a Free Recall Attempt', () => {
  it.each([countriesOfTheWorld, usStateCapitals])('of $title has no Prompt, even for a Quiz with prompts', (quiz) => {
    const attempt = startAttempt(quiz, 'free-recall', () => 0)
    attempt.inputChanged(quiz.places[0].name)

    expect(attempt.state().prompt).toBeNull()
  })

  it('accepts any Unfound capital of US State Capitals, whatever its order', () => {
    const attempt = startAttempt(usStateCapitals, 'free-recall', () => 0)

    expect(attempt.inputChanged('Juneau')).toMatchObject({ kind: 'accepted', place: { id: 'AK' } })
    expect(attempt.inputChanged('Montgomery')).toMatchObject({ kind: 'accepted', place: { id: 'AL' } })
  })
})
