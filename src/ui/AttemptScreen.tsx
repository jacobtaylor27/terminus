import { type KeyboardEvent, useMemo, useState } from 'react'
import { startAttempt } from '../attempt/attempt.ts'
import { type Cue, WorldMap } from '../map/WorldMap.tsx'
import type { Mode, Quiz } from '../quiz/quiz.ts'

interface AttemptScreenProps {
  quiz: Quiz
  mode: Mode
}

export function AttemptScreen({ quiz, mode }: AttemptScreenProps) {
  const [attempt] = useState(() => startAttempt(quiz, mode))
  const [state, setState] = useState(() => attempt.state())
  const [answer, setAnswer] = useState('')
  const [pulse, setPulse] = useState<Cue | null>(null)
  const [flash, setFlash] = useState<Cue | null>(null)

  const foundIds = useMemo(() => new Set(state.found.map((place) => place.id)), [state])

  function handleAnswerChange(text: string) {
    const result = attempt.inputChanged(text)
    if (result.kind === 'accepted') {
      setAnswer('')
      setState(attempt.state())
      setPulse(nextCue(result.place.id))
      return
    }
    setAnswer(text)
    if (result.kind === 'already-found') setFlash(nextCue(result.place.id))
  }

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    const result = attempt.commit(answer)
    if (result.kind === 'nothing') return
    setAnswer('')
    setState(attempt.state())
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
          onKeyDown={handleAnswerKeyDown}
        />
        <output className="score" aria-label="Score">
          {state.score}/{state.total}
        </output>
      </header>
      <WorldMap countries={quiz.places} foundIds={foundIds} tooltips="found" pulse={pulse} flash={flash} />
    </div>
  )
}

// Cues the Country with the next sequence number, so its animation replays.
function nextCue(id: string) {
  return (previous: Cue | null): Cue => ({ id, sequence: (previous?.sequence ?? 0) + 1 })
}
