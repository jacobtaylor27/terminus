import { acceptedNames, type Mode, type Place, type Quiz } from '../quiz/quiz.ts'

// The current time in milliseconds. An Attempt is given one rather than reading the real clock,
// so tests control time.
export type Clock = () => number

// A number from 0 up to but not including 1, like Math.random's. An Attempt is given a source of them
// rather than calling Math.random, so tests fix the order of the Prompts.
export type Random = () => number

// The Timer an Attempt is played against: its duration in milliseconds, or null to play without one.
export type TimerSetting = number | null

// The Timer's duration unless the player sets another before the Attempt starts: 15:00.
export const DEFAULT_TIMER_MS = 15 * 60_000

// How an Attempt ended.
export type Ending = 'completed' | 'times-up' | 'gave-up'

interface Progress {
  score: number
  total: number
  found: Place[]
  unfound: Place[]
  wrongGuessCount: number
  // In Cued Recall, the Place the player is being asked for, until the Attempt ends. Null in Free Recall.
  prompt: Place | null
  elapsedMs: number
  // The Timer's duration and the time left on it, or null for an Attempt without one.
  timer: { durationMs: number; remainingMs: number } | null
}

export type AttemptState =
  | (Progress & { status: 'in-progress' | 'paused' })
  // Once the Attempt has ended, the Places still Unfound are Missed.
  | (Progress & { status: Ending; missed: Place[] })

export type EndedAttemptState = Extract<AttemptState, { status: Ending }>

// Whether the Attempt has ended, rather than being in progress or paused.
export function hasEnded(state: AttemptState): state is EndedAttemptState {
  return state.status !== 'in-progress' && state.status !== 'paused'
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
  pause(): void
  resume(): void
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

// The places in a random order, each order as likely as any other: a Fisher–Yates shuffle.
function shuffled(places: Place[], random: Random): Place[] {
  const order = [...places]
  for (let last = order.length - 1; last > 0; last--) {
    const pick = Math.floor(random() * (last + 1))
    ;[order[last], order[pick]] = [order[pick], order[last]]
  }
  return order
}

export function startAttempt(
  quiz: Quiz,
  mode: Mode,
  clock: Clock,
  timerMs: TimerSetting = null,
  random: Random = Math.random,
): Attempt {
  const startedAt = clock()
  const placesByAcceptedName = new Map(
    quiz.places.flatMap((place) =>
      acceptedNames(place).map((name) => [normalize(name), place] as const),
    ),
  )
  const found = new Set<Place>()
  // In Cued Recall, the Unfound Places in the order they'll be asked for, shuffled once at the start.
  // The first is the current Prompt. Null in Free Recall, which has no Prompts.
  const prompts = mode === 'cued-recall' ? shuffled(quiz.places, random) : null
  let wrongGuessCount = 0
  // When the current Pause began, while the Attempt is paused, and the time spent in earlier ones.
  let pausedAt: number | undefined
  let pausedMs = 0
  // How the Attempt ended and the time played when it did, once it has.
  let end: { ending: Ending; elapsedMs: number } | undefined

  function isPaused() {
    return pausedAt !== undefined
  }

  // Whether the Place is being asked for, so that an answer naming it can count: every Place is in Free
  // Recall, but only the current Prompt is in Cued Recall.
  function isAskedFor(place: Place) {
    return !prompts || place === prompts[0]
  }

  // The time played by the given moment, which stops while the Attempt is paused and when it ends.
  // Measured between timestamps, so it stays right however rarely it is read.
  function elapsedAt(now: number) {
    return end ? end.elapsedMs : (pausedAt ?? now) - startedAt - pausedMs
  }

  // Ends the Attempt as Time's up if the Timer has run out by the given moment, stopping the clock at
  // 0:00. Each operation reads the clock once and uses that moment throughout, so its checks agree.
  function endIfTimesUp(now: number) {
    if (timerMs === null || elapsedAt(now) < timerMs) return
    end ??= { ending: 'times-up', elapsedMs: timerMs }
  }

  return {
    inputChanged(text) {
      const now = clock()
      endIfTimesUp(now)
      if (end || isPaused()) return { kind: 'no-match' }
      const place = placesByAcceptedName.get(normalize(text))
      if (!place || !isAskedFor(place)) return { kind: 'no-match' }
      if (found.has(place)) return { kind: 'already-found', place }
      found.add(place)
      prompts?.shift()
      if (found.size === quiz.places.length) end = { ending: 'completed', elapsedMs: elapsedAt(now) }
      return { kind: 'accepted', place }
    },

    commit(text) {
      endIfTimesUp(clock())
      if (end || isPaused() || text.trim() === '') return { kind: 'nothing' }
      const place = placesByAcceptedName.get(normalize(text))
      // In Cued Recall, any answer but the current Prompt's is a Wrong Guess, even one already Found.
      if (!place || !isAskedFor(place)) {
        wrongGuessCount += 1
        return { kind: 'wrong-guess' }
      }
      if (found.has(place)) return { kind: 'already-found', place }
      // An Unfound Place being asked for is accepted as soon as it is typed, so it never reaches Enter.
      return { kind: 'nothing' }
    },

    pause() {
      const now = clock()
      endIfTimesUp(now)
      if (!end) pausedAt ??= now
    },

    resume() {
      if (end || pausedAt === undefined) return
      pausedMs += clock() - pausedAt
      pausedAt = undefined
    },

    giveUp() {
      const now = clock()
      endIfTimesUp(now)
      end ??= { ending: 'gave-up', elapsedMs: elapsedAt(now) }
    },

    state() {
      const now = clock()
      endIfTimesUp(now)
      const unfound = quiz.places.filter((place) => !found.has(place))
      const elapsedMs = elapsedAt(now)
      const progress: Progress = {
        score: found.size,
        total: quiz.places.length,
        found: [...found],
        unfound,
        wrongGuessCount,
        prompt: end ? null : (prompts?.[0] ?? null),
        elapsedMs,
        timer: timerMs === null ? null : { durationMs: timerMs, remainingMs: timerMs - elapsedMs },
      }
      return end
        ? { ...progress, status: end.ending, missed: unfound }
        : { ...progress, status: isPaused() ? 'paused' : 'in-progress' }
    },
  }
}
