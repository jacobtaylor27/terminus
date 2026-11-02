import { DEFAULT_TIMER_MS, type TimerSetting } from '../attempt/attempt.ts'
import { type Mode, modeDetails, type Quiz } from '../quiz/quiz.ts'
import type { Records } from '../records/records.ts'
import { formatTimerTime, formatTimeTaken } from './formatDuration.ts'

// The Timer settings whose Personal Bests a Quiz card shows: untimed, and the Timer the setup screen
// starts on. Those for other Timers are kept too, but would crowd the card.
const CARD_TIMERS: readonly TimerSetting[] = [null, DEFAULT_TIMER_MS]

// Which build this is, baked in by vite.config.ts.
declare const __APP_VERSION__: { version: string; build: number; commit: string }
const appVersion = __APP_VERSION__

const REPOSITORY_URL = 'https://github.com/jacobtaylor27/terminus'

interface QuizListScreenProps {
  quizzes: readonly Quiz[]
  records: Records
  onChoose: (quiz: Quiz) => void
}

export function QuizListScreen({ quizzes, records, onChoose }: QuizListScreenProps) {
  return (
    <main className="page home-page">
      <h1 className="app-title">Terminus</h1>
      <h2 className="page-heading">Choose a Quiz</h2>
      <ul className="quiz-list">
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <button type="button" className="quiz-card" onClick={() => onChoose(quiz)}>
              <span className="quiz-title">{quiz.title}</span>
              <PersonalBests quiz={quiz} records={records} />
            </button>
          </li>
        ))}
      </ul>
      <footer className="app-version">
        <a href={`${REPOSITORY_URL}/commit/${appVersion.commit}`} title={`Commit ${appVersion.commit.slice(0, 7)}`}>
          v{appVersion.version} ({appVersion.build})
        </a>
      </footer>
    </main>
  )
}

// The Quiz's Personal Best in each of its Modes, untimed and with the default Timer. They sit inside
// the card's button, so they are laid out in spans, which a button may hold.
function PersonalBests({ quiz, records }: { quiz: Quiz; records: Records }) {
  return (
    <span className="quiz-bests">
      <span className="quiz-bests-label">Personal Best</span>
      {quiz.modes.flatMap((mode) =>
        CARD_TIMERS.map((timerMs) => {
          const best = records.personalBest(quiz, mode, timerMs)
          return (
            <span key={`${mode} ${timerMs}`} className="quiz-best">
              <span>{settingName(mode, timerMs)}</span>
              {best ? (
                <span className="quiz-best-result">
                  {best.score}/{best.total} in {formatTimeTaken(best.elapsedMs, timerMs !== null)}
                </span>
              ) : (
                // Every finished Attempt sets the Personal Best for its setting if there is none.
                <span className="quiz-best-result none">Not played yet</span>
              )}
            </span>
          )
        }),
      )}
    </span>
  )
}

// The Mode and Timer setting a Personal Best is for: "Free Recall, Timer off" or "Free Recall, 15:00 Timer".
function settingName(mode: Mode, timerMs: TimerSetting): string {
  const timer = timerMs === null ? 'Timer off' : `${formatTimerTime(timerMs)} Timer`
  return `${modeDetails[mode].name}, ${timer}`
}
