import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  type AttemptState,
  type EndedAttemptState,
  hasEnded,
  startAttempt,
  type TimerSetting,
} from '../attempt/attempt.ts'
import { type Cue, WorldMap } from '../map/WorldMap.tsx'
import type { Mode, Quiz } from '../quiz/quiz.ts'
import { formatDuration, formatTimerTime } from './formatDuration.ts'
import { ScoreFigure } from './ScoreFigure.tsx'

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
  // The Unfound Highlight is only a way of looking at the map, so the Attempt never knows of it.
  const [unfoundHighlight, setUnfoundHighlight] = useState(false)
  const answerBoxRef = useRef<HTMLInputElement>(null)
  // A tick and the player can both find the Attempt ended before the Results show, so the end is
  // reported only the first time, and the Attempt saved only once.
  const endReported = useRef(false)
  const paused = state.status === 'paused'
  const clockLabel = state.timer ? 'Time left' : 'Time'

  const foundIds = useMemo(() => new Set(state.found.map((place) => place.id)), [state])

  // The answer box has focus when the Attempt starts and whenever it resumes, so the player can type
  // straight away.
  useEffect(() => {
    if (!paused) answerBoxRef.current?.focus()
  }, [paused])

  useEffect(() => {
    const ticker = setInterval(() => {
      const latest = attempt.state()
      // A Timer runs out between answers, so it's a tick that finds the Attempt ended as Time's up.
      if (hasEnded(latest)) reportEnd(latest)
      else setClockText(formatClock(latest))
    }, TICK_MS)
    return () => clearInterval(ticker)
  }, [attempt, onEnd])

  function reportEnd(finalState: EndedAttemptState) {
    if (endReported.current) return
    endReported.current = true
    onEnd(finalState)
  }

  // Shows the Attempt's latest state, or its Results once it has ended.
  function showLatest() {
    const latest = attempt.state()
    if (hasEnded(latest)) {
      reportEnd(latest)
      return
    }
    setState(latest)
    setClockText(formatClock(latest))
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

  function handlePause() {
    attempt.pause()
    showLatest()
  }

  function handleResume() {
    attempt.resume()
    showLatest()
  }

  function handleGiveUp() {
    attempt.giveUp()
    showLatest()
  }

  return (
    <div className="attempt-screen">
      {/* Under the Pause overlay, the panels and map can't be focused, typed into or clicked. */}
      <div className="attempt-play" inert={paused}>
        <div className="frosted-panel answer-panel">
          <input
            ref={answerBoxRef}
            className="answer-box"
            aria-label="Answer"
            placeholder="Type an answer"
            autoComplete="off"
            spellCheck={false}
            value={answer}
            onChange={(event) => handleAnswerChange(event.target.value)}
            onKeyDown={handleAnswerKeyDown}
          />
        </div>
        <dl className="frosted-panel attempt-stats">
          <div>
            <dt className="small-label">Score</dt>
            <dd>
              <output aria-label="Score">
                <ScoreFigure score={state.score} total={state.total} />
              </output>
            </dd>
          </div>
          <div>
            <dt className="small-label">{clockLabel}</dt>
            <dd>
              <span className="clock" role="timer" aria-label={clockLabel}>
                {clockText}
              </span>
            </dd>
          </div>
        </dl>
        <div className="frosted-panel attempt-controls">
          {/* Its mousedowns are kept from taking focus, so the player can toggle it mid-answer. On
              narrow screens it reads "Unfound", but its name stays the glossary term. */}
          <button
            type="button"
            className="secondary-button unfound-highlight-button"
            aria-pressed={unfoundHighlight}
            aria-label="Unfound Highlight"
            title="Unfound Highlight: marks where every Unfound answer is, without naming any"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setUnfoundHighlight((on) => !on)}
          >
            <span className="unfound-swatch" />
            <span>
              Unfound<span className="unfound-label-rest"> Highlight</span>
            </span>
          </button>
          <button type="button" className="secondary-button" onClick={handlePause}>
            Pause
          </button>
        </div>
        <WorldMap
          countries={quiz.places}
          foundIds={foundIds}
          missedIds={null}
          tooltips="found"
          pulse={pulse}
          flash={flash}
          unfoundHighlight={unfoundHighlight}
        />
      </div>
      {/* Covers the map and Found answers, so the player can't study them with the clock stopped. */}
      {paused && (
        <section className="pause-overlay" aria-label="Paused">
          <h1 className="pause-title">Paused</h1>
          <dl className="pause-stats">
            <div>
              <dt className="small-label">Score</dt>
              <dd>
                <ScoreFigure score={state.score} total={state.total} />
              </dd>
            </div>
            <div>
              <dt className="small-label">{clockLabel}</dt>
              <dd className="pause-clock">{clockText}</dd>
            </div>
          </dl>
          {/* Give up is only reached from here, so ending an Attempt takes a Pause first. */}
          <div className="pause-actions">
            <button type="button" className="primary-button large" autoFocus onClick={handleResume}>
              Resume
            </button>
            <button type="button" className="secondary-button" onClick={handleGiveUp}>
              Give up
            </button>
          </div>
        </section>
      )}
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
