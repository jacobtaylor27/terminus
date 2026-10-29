import { useMemo } from 'react'
import type { EndedAttemptState, Ending } from '../attempt/attempt.ts'
import { WorldMap } from '../map/WorldMap.tsx'
import type { Quiz } from '../quiz/quiz.ts'
import { formatDuration } from './formatDuration.ts'

// How each way an Attempt can end is announced on the Results screen.
const endingTitles: Record<Ending, string> = {
  completed: 'Completed',
  'gave-up': 'Gave up',
}

interface ResultsScreenProps {
  quiz: Quiz
  finalState: EndedAttemptState
  onPlayAgain: () => void
  onBack: () => void
}

export function ResultsScreen({ quiz, finalState, onPlayAgain, onBack }: ResultsScreenProps) {
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
            <dd>{formatDuration(finalState.elapsedMs)}</dd>
          </div>
        </dl>
        <ul className="map-legend">
          <li className="found">Found</li>
          <li className="missed">Missed</li>
        </ul>
        <div className="results-actions">
          <button type="button" className="start-button" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="back-button" onClick={onBack}>
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
      />
    </div>
  )
}
