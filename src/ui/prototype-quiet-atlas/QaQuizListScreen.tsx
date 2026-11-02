// PROTOTYPE (quiet atlas) — throwaway. The Quiz card's Personal Bests in four shapes, switchable via
// ?card= from the prototype bar on the home page: the card as it is now, a wide ledger row, a Mode ×
// Timer table, and stacked figures.
import { DEFAULT_TIMER_MS, type TimerSetting } from '../../attempt/attempt.ts'
import { type Mode, modeDetails, type Quiz } from '../../quiz/quiz.ts'
import type { AttemptRecord, Records } from '../../records/records.ts'
import { formatTimerTime, formatTimeTaken } from '../formatDuration.ts'
import { QuizListScreen } from '../QuizListScreen.tsx'
import { useParam } from './params.ts'

export const cardVariants = [
  { key: 'now', name: 'Card as it is now' },
  { key: 'ledger', name: 'Wide row, dot leaders' },
  { key: 'table', name: 'Mode × Timer table' },
  { key: 'figures', name: 'Label over figure' },
] as const

export function useCardVariant(): string {
  const value = useParam('card', 'figures')
  return cardVariants.some((variant) => variant.key === value) ? value : 'figures'
}

const CARD_TIMERS: readonly TimerSetting[] = [null, DEFAULT_TIMER_MS]

declare const __APP_VERSION__: { version: string; build: number; commit: string }
const appVersion = __APP_VERSION__
const REPOSITORY_URL = 'https://github.com/jacobtaylor27/terminus'

interface QaQuizListScreenProps {
  quizzes: readonly Quiz[]
  records: Records
  onChoose: (quiz: Quiz) => void
}

export function QaQuizListScreen(props: QaQuizListScreenProps) {
  const card = useCardVariant()
  if (card === 'now') return <QuizListScreen {...props} />
  const Card = { ledger: LedgerCard, table: TableCard, figures: FiguresCard }[card] ?? LedgerCard
  return (
    <main className={`page home-page qa-home qa-home-${card}`}>
      <h1 className="app-title">Terminus</h1>
      <h2 className="page-heading">Choose a Quiz</h2>
      <ul className="qa-quiz-list">
        {props.quizzes.map((quiz) => (
          <li key={quiz.id}>
            <button type="button" className="quiz-card qa-card" onClick={() => props.onChoose(quiz)}>
              <Card quiz={quiz} records={props.records} />
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

interface CardProps {
  quiz: Quiz
  records: Records
}

// Every Mode and Timer setting the card shows, with its Personal Best if there is one.
function bests({ quiz, records }: CardProps) {
  return quiz.modes.flatMap((mode) =>
    CARD_TIMERS.map((timerMs) => ({ mode, timerMs, best: records.personalBest(quiz, mode, timerMs) })),
  )
}

const timerName = (timerMs: TimerSetting) => (timerMs === null ? 'Timer off' : `${formatTimerTime(timerMs)} Timer`)
const timeTaken = (best: AttemptRecord) => formatTimeTaken(best.elapsedMs, best.timerMs !== null)

// A wide card: the title on the left, and one line per setting on the right, joined to its result by
// dot leaders, like an atlas index.
function LedgerCard(props: CardProps) {
  return (
    <>
      <span className="quiz-title">{props.quiz.title}</span>
      <span className="qa-ledger">
        <span className="qa-small-caps">Personal Best</span>
        {bests(props).map(({ mode, timerMs, best }) => (
          <span key={`${mode} ${timerMs}`} className="qa-ledger-row">
            <span>
              {modeDetails[mode].name}, {timerName(timerMs)}
            </span>
            <span className="qa-ledger-leader" aria-hidden="true" />
            {best ? (
              <span className="qa-ledger-value">
                <span className="qa-fig">
                  {best.score}/{best.total}
                </span>{' '}
                in {timeTaken(best)}
              </span>
            ) : (
              <span className="qa-ledger-value qa-none">Not played yet</span>
            )}
          </span>
        ))}
      </span>
    </>
  )
}

// A tile with a small table: a row per Mode, a column per Timer setting.
function TableCard({ quiz, records }: CardProps) {
  return (
    <>
      <span className="quiz-title">{quiz.title}</span>
      <span className="qa-best-table">
        <span className="qa-small-caps">Personal Best</span>
        {CARD_TIMERS.map((timerMs) => (
          <span key={timerMs} className="qa-small-caps qa-col">
            {timerName(timerMs)}
          </span>
        ))}
        {quiz.modes.map((mode: Mode) => (
          <span key={mode} className="qa-best-table-row">
            <span className="qa-best-mode">{modeDetails[mode].name}</span>
            {CARD_TIMERS.map((timerMs) => {
              const best = records.personalBest(quiz, mode, timerMs)
              return best ? (
                <span key={timerMs} className="qa-col">
                  <span className="qa-fig qa-fig-large">
                    {best.score}
                    <span className="qa-of">/{best.total}</span>
                  </span>
                  <span className="qa-none">{timeTaken(best)}</span>
                </span>
              ) : (
                <span key={timerMs} className="qa-col qa-none">
                  <span className="qa-sr">Not played yet</span>
                  <span aria-hidden="true">—</span>
                </span>
              )
            })}
          </span>
        ))}
      </span>
    </>
  )
}

// A tile where each setting is a small-caps label over its result, so nothing has to share a line.
function FiguresCard(props: CardProps) {
  return (
    <>
      <span className="quiz-title">{props.quiz.title}</span>
      <span className="qa-figures">
        {bests(props).map(({ mode, timerMs, best }) => (
          <span key={`${mode} ${timerMs}`} className="qa-figure">
            <span className="qa-small-caps">
              {modeDetails[mode].name} · {timerName(timerMs)}
            </span>
            {best ? (
              <span>
                <span className="qa-fig qa-fig-large">
                  {best.score}
                  <span className="qa-of">/{best.total}</span>
                </span>{' '}
                <span className="qa-none">in {timeTaken(best)}</span>
              </span>
            ) : (
              <span className="qa-none">Not played yet</span>
            )}
          </span>
        ))}
      </span>
    </>
  )
}
