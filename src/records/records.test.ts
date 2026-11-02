import { describe, expect, it } from 'vitest'
import { type Attempt, hasEnded, startAttempt, type TimerSetting } from '../attempt/attempt.ts'
import { countriesOfTheWorld } from '../quiz/countriesOfTheWorld.ts'
import type { Quiz } from '../quiz/quiz.ts'
import { inMemoryStorage, openRecords, type Records } from './records.ts'

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

// The state of an Attempt that has ended, failing the test if it is still in progress or paused.
function endedState(attempt: Attempt) {
  const state = attempt.state()
  if (!hasEnded(state)) throw new Error(`The Attempt is ${state.status}, not ended`)
  return state
}

// An Attempt of Countries of the World that Found the given number of Countries and was given up
// after the given time, played with the given Timer setting.
function gaveUp({ score, elapsedMs, timerMs = null }: { score: number; elapsedMs: number; timerMs?: TimerSetting }) {
  const clock = testClock()
  const attempt = startAttempt(countriesOfTheWorld, 'free-recall', clock.now, timerMs)
  for (const place of countriesOfTheWorld.places.slice(0, score)) attempt.inputChanged(place.name)
  clock.advance(elapsedMs)
  attempt.giveUp()
  return endedState(attempt)
}

// The Personal Best for Countries of the World in Free Recall, played without a Timer or with the one given.
const bestFor = (records: Records, timerMs: TimerSetting = null) =>
  records.personalBest(countriesOfTheWorld, 'free-recall', timerMs)

describe('saving a finished Attempt', () => {
  it('keeps its Quiz, Mode, Timer setting, Score, time, ending, Wrong Guess count and when it finished', () => {
    const clock = testClock()
    const records = openRecords(inMemoryStorage(), clock.now)
    const attempt = startAttempt(countriesOfTheWorld, 'free-recall', clock.now, 15 * 60_000)
    attempt.inputChanged('Japan')
    attempt.inputChanged('Peru')
    attempt.commit('Atlantis')
    clock.advance(90_000)
    attempt.giveUp()

    records.save(countriesOfTheWorld, 'free-recall', endedState(attempt))

    expect(records.history()).toEqual([
      {
        quizId: 'countries-of-the-world',
        mode: 'free-recall',
        timerMs: 900_000,
        score: 2,
        total: 197,
        elapsedMs: 90_000,
        ending: 'gave-up',
        wrongGuessCount: 1,
        finishedAt: 1_090_000,
      },
    ])
  })

  it('keeps every finished Attempt, oldest first, for Records opened later over the same storage', () => {
    const storage = inMemoryStorage()
    const clock = testClock()
    const records = openRecords(storage, clock.now)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))
    clock.advance(600_000)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 25, elapsedMs: 200_000 }))

    const reopened = openRecords(storage, clock.now)

    expect(reopened.history()).toMatchObject([
      { score: 40, elapsedMs: 300_000, finishedAt: 1_000_000 },
      { score: 25, elapsedMs: 200_000, finishedAt: 1_600_000 },
    ])
    expect(bestFor(reopened)).toMatchObject({ score: 40, elapsedMs: 300_000 })
  })
})

describe('Personal Best', () => {
  it('is the first finished Attempt for a Quiz, which sets a new Personal Best', () => {
    const records = openRecords(inMemoryStorage(), testClock().now)
    expect(bestFor(records)).toBeUndefined()

    const { newBest } = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))

    expect(newBest).toBe(true)
    expect(bestFor(records)).toMatchObject({ score: 40, elapsedMs: 300_000 })
  })

  it('goes to a higher Score, whatever the time, and never to a lower one', () => {
    const records = openRecords(inMemoryStorage(), testClock().now)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))

    const higher = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 41, elapsedMs: 900_000 }))
    const lower = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 39, elapsedMs: 60_000 }))

    expect(higher.newBest).toBe(true)
    expect(lower.newBest).toBe(false)
    expect(bestFor(records)).toMatchObject({ score: 41, elapsedMs: 900_000 })
  })

  it('goes to the shorter time when the Scores are equal', () => {
    const records = openRecords(inMemoryStorage(), testClock().now)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))

    const slower = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 301_000 }))
    const faster = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 299_000 }))

    expect(slower.newBest).toBe(false)
    expect(faster.newBest).toBe(true)
    expect(bestFor(records)).toMatchObject({ score: 40, elapsedMs: 299_000 })
  })

  it('stays with the earlier Attempt when a later one has the same Score and time', () => {
    const clock = testClock()
    const records = openRecords(inMemoryStorage(), clock.now)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))
    clock.advance(600_000)

    const same = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))

    expect(same.newBest).toBe(false)
    expect(bestFor(records)).toMatchObject({ finishedAt: 1_000_000 })
  })

  it('is kept for each Timer setting apart, so an untimed Attempt never affects a timed Personal Best', () => {
    const records = openRecords(inMemoryStorage(), testClock().now)

    const untimed = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 150, elapsedMs: 1_800_000 }))
    const fifteenMinutes = records.save(
      countriesOfTheWorld,
      'free-recall',
      gaveUp({ score: 90, elapsedMs: 600_000, timerMs: 900_000 }),
    )
    const tenMinutes = records.save(
      countriesOfTheWorld,
      'free-recall',
      gaveUp({ score: 60, elapsedMs: 500_000, timerMs: 600_000 }),
    )

    expect([untimed.newBest, fifteenMinutes.newBest, tenMinutes.newBest]).toEqual([true, true, true])
    expect(bestFor(records)).toMatchObject({ timerMs: null, score: 150 })
    expect(bestFor(records, 900_000)).toMatchObject({ timerMs: 900_000, score: 90 })
    expect(bestFor(records, 600_000)).toMatchObject({ timerMs: 600_000, score: 60 })
    expect(bestFor(records, 300_000)).toBeUndefined()
  })

  it('is kept for each Quiz apart', () => {
    const capitalsOfAfrica: Quiz = {
      id: 'capitals-of-africa',
      title: 'Capitals of Africa',
      modes: ['free-recall'],
      map: 'world',
      places: [
        { id: 'KEN', name: 'Nairobi' },
        { id: 'GHA', name: 'Accra' },
      ],
    }
    const records = openRecords(inMemoryStorage(), testClock().now)
    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))
    const capitalsAttempt = startAttempt(capitalsOfAfrica, 'free-recall', testClock().now)
    capitalsAttempt.inputChanged('Nairobi')
    capitalsAttempt.giveUp()

    const capitals = records.save(capitalsOfAfrica, 'free-recall', endedState(capitalsAttempt))

    expect(capitals.newBest).toBe(true)
    expect(bestFor(records)).toMatchObject({ score: 40, total: 197 })
    expect(records.personalBest(capitalsOfAfrica, 'free-recall', null)).toMatchObject({ score: 1, total: 2 })
  })
})

// The stored data outlives any one version of Terminus, so its key and shape are a contract with past
// and later versions, and these tests spell them out rather than share the module's constant.
describe('the stored data', () => {
  it('carries the version of its schema, so a later one can migrate it', () => {
    const storage = inMemoryStorage()
    const records = openRecords(storage, testClock().now)

    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 2, elapsedMs: 90_000, timerMs: 900_000 }))

    expect(JSON.parse(storage.getItem('terminus.records') ?? 'null')).toEqual({
      version: 1,
      attempts: [
        {
          quizId: 'countries-of-the-world',
          mode: 'free-recall',
          timerMs: 900_000,
          score: 2,
          total: 197,
          elapsedMs: 90_000,
          ending: 'gave-up',
          wrongGuessCount: 0,
          finishedAt: 1_000_000,
        },
      ],
    })
  })

  it('is started afresh when what is stored cannot be read', () => {
    const storage = inMemoryStorage()
    storage.setItem('terminus.records', '{"version":1,"attem')
    const records = openRecords(storage, testClock().now)

    expect(records.history()).toEqual([])
    expect(bestFor(records)).toBeUndefined()

    records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))
    expect(openRecords(storage, testClock().now).history()).toMatchObject([{ score: 40 }])
  })

  it('is left alone when it is in a later version of the schema, as an older Terminus still open in a tab would find it', () => {
    const storage = inMemoryStorage()
    const later = JSON.stringify({ version: 2, attempts: [], played: [] })
    storage.setItem('terminus.records', later)
    const records = openRecords(storage, testClock().now)

    expect(records.history()).toEqual([])

    const { newBest } = records.save(countriesOfTheWorld, 'free-recall', gaveUp({ score: 40, elapsedMs: 300_000 }))
    expect(newBest).toBe(false)
    expect(storage.getItem('terminus.records')).toBe(later)
  })
})
