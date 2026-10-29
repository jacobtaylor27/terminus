import { useMemo, useState } from 'react'
import { startAttempt } from '../attempt/attempt.ts'
import { WorldMap } from '../map/WorldMap.tsx'
import type { Mode, Quiz } from '../quiz/quiz.ts'

interface AttemptScreenProps {
  quiz: Quiz
  mode: Mode
}

export function AttemptScreen({ quiz, mode }: AttemptScreenProps) {
  const [attempt] = useState(() => startAttempt(quiz, mode))
  const [state, setState] = useState(() => attempt.state())
  const [answer, setAnswer] = useState('')

  const countryIds = useMemo(() => new Set(quiz.places.map((place) => place.id)), [quiz])
  const foundIds = useMemo(() => new Set(state.found.map((place) => place.id)), [state])

  function handleAnswerChange(text: string) {
    const result = attempt.inputChanged(text)
    if (result.kind === 'accepted') {
      setAnswer('')
      setState(attempt.state())
    } else {
      setAnswer(text)
    }
  }

  return (
    <div className="attempt-screen">
      <header className="attempt-bar">
        <input
          className="answer-box"
          aria-label="Answer"
          placeholder="Type an answer"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          value={answer}
          onChange={(event) => handleAnswerChange(event.target.value)}
        />
        <output className="score" aria-label="Score">
          {state.score}/{state.total}
        </output>
      </header>
      <WorldMap countryIds={countryIds} foundIds={foundIds} />
    </div>
  )
}
