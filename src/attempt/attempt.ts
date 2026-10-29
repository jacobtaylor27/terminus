import { acceptedNames, type Mode, type Place, type Quiz } from '../quiz/quiz.ts'

export interface AttemptState {
  score: number
  total: number
  found: Place[]
  unfound: Place[]
  wrongGuessCount: number
}

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

export function startAttempt(quiz: Quiz, _mode: Mode): Attempt {
  const placesByAcceptedName = new Map(
    quiz.places.flatMap((place) =>
      acceptedNames(place).map((name) => [normalize(name), place] as const),
    ),
  )
  const found = new Set<Place>()
  let wrongGuessCount = 0

  return {
    inputChanged(text) {
      const place = placesByAcceptedName.get(normalize(text))
      if (!place) return { kind: 'no-match' }
      if (found.has(place)) return { kind: 'already-found', place }
      found.add(place)
      return { kind: 'accepted', place }
    },

    commit(text) {
      if (text.trim() === '') return { kind: 'nothing' }
      const place = placesByAcceptedName.get(normalize(text))
      if (!place) {
        wrongGuessCount += 1
        return { kind: 'wrong-guess' }
      }
      if (found.has(place)) return { kind: 'already-found', place }
      // An Unfound Country is accepted as soon as it is typed, so it never reaches Enter.
      return { kind: 'nothing' }
    },

    state() {
      return {
        score: found.size,
        total: quiz.places.length,
        found: [...found],
        unfound: quiz.places.filter((place) => !found.has(place)),
        wrongGuessCount,
      }
    },
  }
}
