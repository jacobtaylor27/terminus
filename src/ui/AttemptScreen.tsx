import { type KeyboardEvent, useEffect, useMemo, useState } from 'react'
import {
  type AttemptState,
  type EndedAttemptState,
  startAttempt,
  type TimerSetting,
} from '../attempt/attempt.ts'
import { type Cue, WorldMap } from '../map/WorldMap.tsx'
import type { Mode, Quiz } from '../quiz/quiz.ts'
import { formatDuration, formatTimerTime } from './formatDuration.ts'

// How often the clock reads the Attempt's time. The time itself comes from timestamps, so a tick
// that a background tab delays only delays the display, and the Timer still runs out on time.
const TICK_MS = 250

interface AttemptScreenProps {
  quiz: Quiz
  mode: Mode
  timer: TimerSetting
  onEnd: (finalState: EndedAttemptState) => void
}

export function AttemptScreen({ quiz, mode, timer, onEnd }: AttemptScreenProps) {
  const [attempt] = useState(() => startAttempt(quiz, mode, Date.now, timer))
  const [state, setState] = useState(() => attempt.state())
  // Kept apart from the rest of the state, so ticking doesn't rebuild the map's Found set.
  const [clockText, setClockText] = useState(() => formatClock(state))
  const [answer, setAnswer] = useState('')
  const [pulse, setPulse] = useState<Cue | null>(null)
  const [flash, setFlash] = useState<Cue | null>(null)

  const foundIds = useMemo(() => new Set(state.found.map((place) => place.id)), [state])

  useEffect(() => {
    const ticker = setInterval(() => {
      const latest = attempt.state()
      // A Timer runs out between answers, so it's a tick that finds the Attempt ended as Time's up.
      if (latest.status === 'in-progress') setClockText(formatClock(latest))
      else onEnd(latest)
    }, TICK_MS)
    return () => clearInterval(ticker)
  }, [attempt, onEnd])

  // Shows the Attempt's latest state, or its Results once it has ended.
  function showLatest() {
    const latest = attempt.state()
    if (latest.status === 'in-progress') setState(latest)
    else onEnd(latest)
  }

  function handleAnswerChange(text: string) {
    const result = attempt.inputChanged(text)
    if (result.kind === 'accepted') {
      setAnswer('')
      setPulse(nextCue(result.place.id))
      showLatest()
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
    showLatest()
  }

  function handleGiveUp() {
    attempt.giveUp()
    showLatest()
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
        <span className="clock" role="timer" aria-label={state.timer ? 'Time left' : 'Time'}>
          {clockText}
        </span>
        <button type="button" className="give-up-button" onClick={handleGiveUp}>
          Give up
        </button>
      </header>
      <WorldMap
        countries={quiz.places}
        foundIds={foundIds}
        missedIds={null}
        tooltips="found"
        pulse={pulse}
        flash={flash}
      />
    </div>
  )
}

// What the clock shows: the countdown with the Timer on, or else the stopwatch. The countdown is
// rounded up to whole seconds, so it reads 0:00 only once the time has run out.
function formatClock(state: AttemptState): string {
  return state.timer
    ? formatTimerTime(Math.ceil(state.timer.remainingMs / 1000) * 1000)
    : formatDuration(state.elapsedMs)
}

// Cues the Country with the next sequence number, so its animation replays.
function nextCue(id: string) {
  return (previous: Cue | null): Cue => ({ id, sequence: (previous?.sequence ?? 0) + 1 })
}
