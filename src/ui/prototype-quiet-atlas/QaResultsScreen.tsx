// PROTOTYPE (quiet atlas) — throwaway. The Results screen in three layouts, each showing the Reveal
// on the full map.
import { useMemo } from 'react'
import type { EndedAttemptState, Ending } from '../../attempt/attempt.ts'
import { WorldMap } from '../../map/WorldMap.tsx'
import type { Quiz } from '../../quiz/quiz.ts'
import { formatTimerTime, formatTimeTaken } from '../formatDuration.ts'
import { useTweak, useVariant } from './params.ts'

const endingTitles: Record<Ending, string> = {
  completed: 'Completed',
  'times-up': "Time's up",
  'gave-up': 'Gave up',
}

interface QaResultsScreenProps {
  quiz: Quiz
  finalState: EndedAttemptState
  newBest: boolean
  onPlayAgain: () => void
  onBack: () => void
}

export function QaResultsScreen(props: QaResultsScreenProps) {
  const variant = useVariant()
  const best = useTweak('best')
  const newBest = best === 'real' ? props.newBest : best === 'on'
  const Layout = { A: FloatingSummary, B: TopBarSummary, C: DockSummary, D: DockSummary }[variant] ?? FloatingSummary
  return (
    <div className="qa-screen">
      <Layout {...props} newBest={newBest} />
    </div>
  )
}

// A — the agreed design: a summary panel top-left and the legend bottom-left, over the full map.
function FloatingSummary(props: QaResultsScreenProps) {
  return (
    <div className="qa-play qa-a qa-results">
      <section className="qa-panel qa-a-summary" data-qa-panel="Summary">
        <Heading {...props} />
        <p className="qa-big-score qa-display-figures">
          {props.finalState.score}
          <span className="qa-of">/{props.finalState.total}</span>
        </p>
        <SmallStats {...props} />
        {props.newBest && <NewBest />}
        <Actions {...props} />
      </section>
      <div className="qa-panel qa-a-legend" data-qa-panel="Legend">
        <Legend {...props} />
      </div>
      <ResultsMap {...props} />
    </div>
  )
}

// B — the fallback: the summary in one bar above the map.
function TopBarSummary(props: QaResultsScreenProps) {
  return (
    <div className="qa-play qa-b qa-results">
      <header className="qa-b-bar qa-b-results-bar">
        <Heading {...props} />
        <div className="qa-stat">
          <span className="qa-stat-label">Score</span>
          <span className="qa-score">
            {props.finalState.score}
            <span className="qa-of">/{props.finalState.total}</span>
          </span>
        </div>
        <SmallStats {...props} />
        {props.newBest && <NewBest />}
        <Legend {...props} />
        <Actions {...props} />
      </header>
      <ResultsMap {...props} />
    </div>
  )
}

// C — the summary in one dock over Antarctica.
function DockSummary(props: QaResultsScreenProps) {
  return (
    <div className="qa-play qa-c qa-results">
      <section className="qa-panel qa-c-dock qa-c-results-dock" data-qa-panel="Dock">
        <Heading {...props} />
        <p className="qa-score qa-c-big">
          {props.finalState.score}
          <span className="qa-of">/{props.finalState.total}</span>
        </p>
        <SmallStats {...props} />
        {props.newBest && <NewBest />}
        <Legend {...props} />
        <span className="qa-c-divider" />
        <Actions {...props} />
      </section>
      <ResultsMap {...props} />
    </div>
  )
}

function Heading({ quiz, finalState }: QaResultsScreenProps) {
  return (
    <div className="qa-heading">
      <p className="qa-quiz">{quiz.title}</p>
      <h1 className="qa-ending">{endingTitles[finalState.status]}</h1>
    </div>
  )
}

function SmallStats({ finalState }: QaResultsScreenProps) {
  return (
    <dl className="qa-small-stats">
      <div>
        <dt>Time</dt>
        <dd>{formatTimeTaken(finalState.elapsedMs, finalState.timer !== null)}</dd>
      </div>
      <div>
        <dt>Timer</dt>
        <dd>{finalState.timer ? formatTimerTime(finalState.timer.durationMs) : 'Off'}</dd>
      </div>
    </dl>
  )
}

function NewBest() {
  return <p className="qa-new-best">New best</p>
}

function Legend({ finalState }: QaResultsScreenProps) {
  return (
    <ul className="qa-legend">
      <li className="found">
        Found <span>{finalState.found.length}</span>
      </li>
      <li className="missed">
        Missed <span>{finalState.missed.length}</span>
      </li>
    </ul>
  )
}

function Actions({ onPlayAgain, onBack }: QaResultsScreenProps) {
  return (
    <div className="qa-actions">
      <button type="button" className="qa-button qa-primary" onClick={onPlayAgain}>
        Play again
      </button>
      <button type="button" className="qa-link" onClick={onBack}>
        Back to Quizzes
      </button>
    </div>
  )
}

function ResultsMap({ quiz, finalState }: QaResultsScreenProps) {
  const grid = useTweak('grid')
  const foundIds = useMemo(() => new Set(finalState.found.map((place) => place.id)), [finalState])
  const missedIds = useMemo(() => new Set(finalState.missed.map((place) => place.id)), [finalState])
  return (
    <WorldMap
      countries={quiz.places}
      foundIds={foundIds}
      missedIds={missedIds}
      tooltips="all"
      pulse={null}
      flash={null}
      unfoundHighlight={false}
      graticule={grid === 'on'}
    />
  )
}
