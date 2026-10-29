import type { Mode, Place, Quiz } from '../quiz/quiz.ts'

export interface AttemptState {
  score: number
  total: number
  found: Place[]
  unfound: Place[]
}

export type InputResult =
  | { kind: 'accepted'; place: Place }
  | { kind: 'already-found'; place: Place }
  | { kind: 'no-match' }

export interface Attempt {
  inputChanged(text: string): InputResult
  state(): AttemptState
}

function normalize(text: string): string {
  return text.toLowerCase()
}

export function startAttempt(quiz: Quiz, _mode: Mode): Attempt {
  const placesByName = new Map(quiz.places.map((place) => [normalize(place.name), place]))
  const found = new Set<Place>()

  return {
    inputChanged(text) {
      const place = placesByName.get(normalize(text))
      if (!place) return { kind: 'no-match' }
      if (found.has(place)) return { kind: 'already-found', place }
      found.add(place)
      return { kind: 'accepted', place }
    },

    state() {
      return {
        score: found.size,
        total: quiz.places.length,
        found: [...found],
        unfound: quiz.places.filter((place) => !found.has(place)),
      }
    },
  }
}
