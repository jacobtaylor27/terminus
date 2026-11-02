import { useMemo } from 'react'
import type { EndedAttemptState, Ending } from '../attempt/attempt.ts'
import { WorldMap } from '../map/WorldMap.tsx'
import type { Quiz } from '../quiz/quiz.ts'
import { formatTimerTime, formatTimeTaken } from './formatDuration.ts'

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
      <header className="results-bar">
        <div className="results-heading">
          <p className="results-quiz">{quiz.title}</p>
          <h1 className="results-ending">{endingTitles[finalState.status]}</h1>
        </div>
        <dl className="results-stats">
          <div>
            <dt>Score</dt>
            <dd>
              {finalState.score}/{finalState.total}
            </dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatTimeTaken(finalState.elapsedMs, finalState.timer !== null)}</dd>
          </div>
          <div>
            <dt>Timer</dt>
            <dd>{finalState.timer ? formatTimerTime(finalState.timer.durationMs) : 'Off'}</dd>
          </div>
        </dl>
        {newBest && <p className="new-best">New best!</p>}
        <ul className="map-legend">
          <li className="found">Found</li>
          <li className="missed">Missed</li>
        </ul>
        <div className="results-actions">
          <button type="button" className="primary-button" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="text-link" onClick={onBack}>
            Back to Quizzes
          </button>
        </div>
      </header>
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
