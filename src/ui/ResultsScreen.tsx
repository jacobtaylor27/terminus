import { useMemo } from 'react'
import type { EndedAttemptState, Ending } from '../attempt/attempt.ts'
import { WorldMap } from '../map/WorldMap.tsx'
import type { Quiz } from '../quiz/quiz.ts'
import { formatTimerTime, formatTimeTaken } from './formatDuration.ts'
import { ScoreFigure } from './ScoreFigure.tsx'

// How each way an Attempt can end is announced on the Results screen.
const endingTitles: Record<Ending, string> = {
  completed: 'Completed',
  'times-up': "Time's up",
  'gave-up': 'Gave up',
}

interface ResultsScreenProps {
  quiz: Quiz
  finalState: EndedAttemptState
  // Whether the Attempt set a new Personal Best for its Quiz, Mode and Timer setting.
  newBest: boolean
  onPlayAgain: () => void
  onBack: () => void
}

export function ResultsScreen({ quiz, finalState, newBest, onPlayAgain, onBack }: ResultsScreenProps) {
  const foundIds = useMemo(() => new Set(finalState.found.map((place) => place.id)), [finalState])
  const missedIds = useMemo(() => new Set(finalState.missed.map((place) => place.id)), [finalState])

  return (
    <div className="results-screen">
      {/* Read left to right, over Antarctica, so it covers none of the Reveal. In a narrow window it
          splits in two: the heading, between Back to Quizzes and Play again, in a strip above the
          map, and the rest in a strip under it. */}
      <section className="frosted-panel results-dock" aria-label="Results">
        <div className="results-heading">
          <p className="small-label results-quiz">{quiz.title}</p>
          <h1 className="results-ending">{endingTitles[finalState.status]}</h1>
        </div>
        <div className="results-summary">
          {/* The figure needs no label to be seen as the Score, but a screen reader is told. */}
          <p className="results-score">
            <span className="visually-hidden">Score </span>
            <ScoreFigure score={finalState.score} total={finalState.total} />
          </p>
          <dl className="results-stats">
            <div>
              <dt className="small-label">Time</dt>
              <dd>{formatTimeTaken(finalState.elapsedMs, finalState.timer !== null)}</dd>
            </div>
            <div>
              <dt className="small-label">Timer</dt>
              <dd>{finalState.timer ? formatTimerTime(finalState.timer.durationMs) : 'Off'}</dd>
            </div>
          </dl>
          {newBest && <p className="new-best">New best!</p>}
          <ul className="map-legend">
            <li className="found">
              Found <span className="legend-count">{finalState.found.length}</span>
            </li>
            <li className="missed">
              Missed <span className="legend-count">{finalState.missed.length}</span>
            </li>
          </ul>
        </div>
        <span className="results-divider" />
        <div className="results-actions">
          <button type="button" className="primary-button" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="text-link" onClick={onBack}>
            Back to Quizzes
          </button>
        </div>
      </section>
      <WorldMap
        countries={quiz.places}
        foundIds={foundIds}
        missedIds={missedIds}
        tooltips="all"
        pulse={null}
        flash={null}
        unfoundHighlight={false}
      />
    </div>
  )
}
