import { acceptedNames, type Mode, type Place, type Quiz } from '../quiz/quiz.ts'

// The current time in milliseconds. An Attempt is given one rather than reading the real clock,
// so tests control time.
export type Clock = () => number

// How an Attempt ended.
export type Ending = 'completed' | 'gave-up'

interface Progress {
  score: number
  total: number
  found: Place[]
  unfound: Place[]
  wrongGuessCount: number
  elapsedMs: number
}

export type AttemptState =
  | (Progress & { status: 'in-progress' })
  // Once the Attempt has ended, the Countries still Unfound are Missed.
  | (Progress & { status: Ending; missed: Place[] })

export type EndedAttemptState = Extract<AttemptState, { status: Ending }>

export type InputResult =
  | { kind: 'accepted'; place: Place }
  | { kind: 'already-found'; place: Place }
  | { kind: 'no-match' }

export type CommitResult =
  | { kind: 'wrong-guess' }
  | { kind: 'already-found'; place: Place }
  | { kind: 'nothing' }

export interface Attempt {
  inputChanged(text: string): InputResult
  commit(text: string): CommitResult
  giveUp(): void
  state(): AttemptState
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // diacritics: é → e
    .replace(/['‘’ʼ.]/g, '') // apostrophes and periods sit inside a word: d'Ivoire, U.K.
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // other punctuation separates words: Guinea-Bissau
    .trim()
    .replace(/^the /, '')
}

export function startAttempt(quiz: Quiz, _mode: Mode, clock: Clock): Attempt {
  const startedAt = clock()
  const placesByAcceptedName = new Map(
    quiz.places.flatMap((place) =>
      acceptedNames(place).map((name) => [normalize(name), place] as const),
    ),
  )
  const found = new Set<Place>()
  let wrongGuessCount = 0
  // How and when the Attempt ended, once it has.
  let end: { ending: Ending; at: number } | undefined

  return {
    inputChanged(text) {
      if (end) return { kind: 'no-match' }
      const place = placesByAcceptedName.get(normalize(text))
      if (!place) return { kind: 'no-match' }
      if (found.has(place)) return { kind: 'already-found', place }
      found.add(place)
      if (found.size === quiz.places.length) end = { ending: 'completed', at: clock() }
      return { kind: 'accepted', place }
    },

    commit(text) {
      if (end || text.trim() === '') return { kind: 'nothing' }
      const place = placesByAcceptedName.get(normalize(text))
      if (!place) {
        wrongGuessCount += 1
        return { kind: 'wrong-guess' }
      }
      if (found.has(place)) return { kind: 'already-found', place }
      // An Unfound Country is accepted as soon as it is typed, so it never reaches Enter.
      return { kind: 'nothing' }
    },

    giveUp() {
      end ??= { ending: 'gave-up', at: clock() }
    },

    state() {
      const unfound = quiz.places.filter((place) => !found.has(place))
      const progress: Progress = {
        score: found.size,
        total: quiz.places.length,
        found: [...found],
        unfound,
        wrongGuessCount,
        // Measured between timestamps, so it stays right however rarely it is read.
        elapsedMs: (end?.at ?? clock()) - startedAt,
      }
      return end
        ? { ...progress, status: end.ending, missed: unfound }
        : { ...progress, status: 'in-progress' }
    },
  }
}
