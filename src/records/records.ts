import type { Clock, EndedAttemptState, Ending, TimerSetting } from '../attempt/attempt.ts'
import type { Mode, Quiz } from '../quiz/quiz.ts'

// Where Records keep their data: the browser's localStorage in the app, or memory in tests.
export interface RecordStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

// Storage that lasts only as long as the page.
export function inMemoryStorage(): RecordStorage {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  }
}

// The browser's localStorage, which lasts until the player clears it. A browser set to keep no site
// data refuses it, and then Records last only as long as the page, so Terminus still plays.
export function browserStorage(): RecordStorage {
  try {
    return window.localStorage
  } catch {
    return inMemoryStorage()
  }
}

// A finished Attempt, as Records keep it.
export interface AttemptRecord {
  quizId: string
  mode: Mode
  timerMs: TimerSetting
  score: number
  total: number
  elapsedMs: number
  ending: Ending
  wrongGuessCount: number
  // How many times the player Skipped a Prompt: always 0 in Free Recall.
  skipCount: number
  // When the Attempt finished, in milliseconds since the epoch.
  finishedAt: number
}

export interface Records {
  // Saves a finished Attempt, and tells whether it set a new Personal Best.
  save(quiz: Quiz, mode: Mode, finalState: EndedAttemptState): { newBest: boolean }
  // Every finished Attempt, oldest first.
  history(): AttemptRecord[]
  // The Personal Best for the Quiz played in the Mode with the Timer setting, unless none has finished.
  personalBest(quiz: Quiz, mode: Mode, timerMs: TimerSetting): AttemptRecord | undefined
}

const STORAGE_KEY = 'terminus.records'

// The stored data, with the version of its schema so a later one can migrate it.
interface StoredRecords {
  version: 1
  attempts: StoredAttempt[]
}

// A finished Attempt as stored. One saved before Skips were counted has no Skip count, which version 1
// of the schema allows.
type StoredAttempt = Omit<AttemptRecord, 'skipCount'> & { skipCount?: number }

// A stored Attempt as Records keep it, reading one saved before Skips were counted as having none.
function readAttempt(stored: StoredAttempt): AttemptRecord {
  return { ...stored, skipCount: stored.skipCount ?? 0 }
}

// Records kept in the given storage. They are given a clock to tell when each Attempt finished.
export function openRecords(storage: RecordStorage, clock: Clock): Records {
  // The stored Attempts, read afresh each time so Records open in two tabs never save over each
  // other's. Data that can't be read counts as none, and the next save replaces it, so a damaged store
  // can't stop Terminus working. Data in a later version of the schema is null: an older Terminus
  // still open in a tab can't read it, and mustn't save over it.
  function storedAttempts(): AttemptRecord[] | null {
    const text = storage.getItem(STORAGE_KEY)
    if (text === null) return []
    try {
      const data: { version?: unknown; attempts?: unknown } | null = JSON.parse(text)
      if (data?.version === 1 && Array.isArray(data.attempts)) {
        return (data.attempts as StoredAttempt[]).map(readAttempt)
      }
      // There is no version before 1, so any other is a later one.
      return typeof data?.version === 'number' && data.version !== 1 ? null : []
    } catch {
      return []
    }
  }

  function history(): AttemptRecord[] {
    return storedAttempts() ?? []
  }

  return {
    save(quiz, mode, finalState) {
      const record: AttemptRecord = {
        quizId: quiz.id,
        mode,
        timerMs: finalState.timer?.durationMs ?? null,
        score: finalState.score,
        total: finalState.total,
        elapsedMs: finalState.elapsedMs,
        ending: finalState.status,
        wrongGuessCount: finalState.wrongGuessCount,
        skipCount: finalState.skipCount,
        finishedAt: clock(),
      }
      const attempts = storedAttempts()
      // Unsaved, it can't be a Personal Best.
      if (attempts === null) return { newBest: false }
      const previousBest = personalBestAmong(attempts, quiz, mode, record.timerMs)
      const stored: StoredRecords = { version: 1, attempts: [...attempts, record] }
      storage.setItem(STORAGE_KEY, JSON.stringify(stored))
      return { newBest: !previousBest || beats(record, previousBest) }
    },

    history,

    personalBest(quiz, mode, timerMs) {
      return personalBestAmong(history(), quiz, mode, timerMs)
    },
  }
}

// Whether one finished Attempt is better than another: a higher Score wins, and on equal Scores the
// shorter time does.
function beats(record: AttemptRecord, other: AttemptRecord): boolean {
  return record.score !== other.score ? record.score > other.score : record.elapsedMs < other.elapsedMs
}

// The Personal Best among the finished Attempts for the Quiz played in the Mode with the Timer setting:
// the best Attempt played so, or the earliest of those equally good.
function personalBestAmong(
  attempts: AttemptRecord[],
  quiz: Quiz,
  mode: Mode,
  timerMs: TimerSetting,
): AttemptRecord | undefined {
  let best: AttemptRecord | undefined
  for (const record of attempts) {
    if (record.quizId !== quiz.id || record.mode !== mode || record.timerMs !== timerMs) continue
    if (!best || beats(record, best)) best = record
  }
  return best
}
