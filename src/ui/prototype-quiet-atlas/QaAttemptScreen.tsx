// PROTOTYPE (quiet atlas) — throwaway. The Attempt screen in three layouts. The play logic is copied
// from AttemptScreen into one hook, so switching layout mid-Attempt keeps the Attempt going; only
// Give up has moved, into the Pause overlay.
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  type AttemptState,
  type EndedAttemptState,
  hasEnded,
  startAttempt,
  type TimerSetting,
} from '../../attempt/attempt.ts'
import { type Cue, WorldMap } from '../../map/WorldMap.tsx'
import type { Mode, Quiz } from '../../quiz/quiz.ts'
import { formatDuration, formatTimerTime } from '../formatDuration.ts'
import { useTweak, useVariant } from './params.ts'

const TICK_MS = 250

interface QaAttemptScreenProps {
  quiz: Quiz
  mode: Mode
  timer: TimerSetting
  onEnd: (finalState: EndedAttemptState) => void
}

type Play = ReturnType<typeof useAttemptPlay>

function useAttemptPlay({ quiz, mode, timer, onEnd }: QaAttemptScreenProps) {
  const [attempt] = useState(() => startAttempt(quiz, mode, Date.now, timer))
  const [state, setState] = useState(() => attempt.state())
  const [clockText, setClockText] = useState(() => formatClock(state))
  const [answer, setAnswer] = useState('')
  const [pulse, setPulse] = useState<Cue | null>(null)
  const [flash, setFlash] = useState<Cue | null>(null)
  const [unfoundHighlight, setUnfoundHighlight] = useState(false)
  const answerBoxRef = useRef<HTMLInputElement>(null)
  const endReported = useRef(false)
  const paused = state.status === 'paused'
  const clockLabel = state.timer ? 'Time left' : 'Time'
  const foundIds = useMemo(() => new Set(state.found.map((place) => place.id)), [state])

  useEffect(() => {
    if (!paused) answerBoxRef.current?.focus()
  }, [paused])

  useEffect(() => {
    const ticker = setInterval(() => {
      const latest = attempt.state()
      if (hasEnded(latest)) reportEnd(latest)
      else setClockText(formatClock(latest))
    }, TICK_MS)
    return () => clearInterval(ticker)
  }, [attempt, onEnd])

  // Prototype helpers, fired from the prototype bar: find some answers at random, or flash one.
  useEffect(() => {
    function find(event: Event) {
      const unfound = [...attempt.state().unfound].sort(() => Math.random() - 0.5)
      let last
      for (const place of unfound.slice(0, (event as CustomEvent<number>).detail)) {
        attempt.inputChanged(place.name)
        last = place
      }
      if (last) setPulse(nextCue(last.id))
      showLatest()
    }
    function flashOne() {
      const found = attempt.state().found
      if (found.length) setFlash(nextCue(found[Math.floor(Math.random() * found.length)].id))
    }
    addEventListener('qa-find', find)
    addEventListener('qa-flash', flashOne)
    return () => {
      removeEventListener('qa-find', find)
      removeEventListener('qa-flash', flashOne)
    }
  })

  function reportEnd(finalState: EndedAttemptState) {
    if (endReported.current) return
    endReported.current = true
    onEnd(finalState)
  }

  function showLatest() {
    const latest = attempt.state()
    if (hasEnded(latest)) {
      reportEnd(latest)
      return
    }
    setState(latest)
    setClockText(formatClock(latest))
  }

  return {
    state,
    paused,
    clockText,
    clockLabel,
    answer,
    pulse,
    flash,
    unfoundHighlight,
    foundIds,
    answerBoxRef,
    onAnswerChange(text: string) {
      const result = attempt.inputChanged(text)
      if (result.kind === 'accepted') {
        setAnswer('')
        setPulse(nextCue(result.place.id))
        showLatest()
        return
      }
      setAnswer(text)
      if (result.kind === 'already-found') setFlash(nextCue(result.place.id))
    },
    onAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
      const result = attempt.commit(answer)
      if (result.kind === 'nothing') return
      setAnswer('')
      showLatest()
    },
    toggleUnfoundHighlight() {
      setUnfoundHighlight((on) => !on)
    },
    pause() {
      attempt.pause()
      showLatest()
    },
    resume() {
      attempt.resume()
      showLatest()
    },
    giveUp() {
      attempt.giveUp()
      showLatest()
    },
  }
}

export function QaAttemptScreen(props: QaAttemptScreenProps) {
  const play = useAttemptPlay(props)
  const variant = useVariant()
  const Layout = { A: FloatingCorners, B: CalmTopBar, C: BottomDock, D: FloatingCorners }[variant] ?? FloatingCorners
  return (
    <div className="qa-screen">
      <Layout play={play} quiz={props.quiz} />
      {play.paused && <PauseOverlay play={play} />}
    </div>
  )
}

interface LayoutProps {
  play: Play
  quiz: Quiz
}

// A — the agreed design: the map fills the window and paper panels float in its empty corners.
function FloatingCorners({ play, quiz }: LayoutProps) {
  return (
    <div className="qa-play qa-a" inert={play.paused}>
      <div className="qa-panel qa-a-answer" data-qa-panel="Answer box">
        <AnswerBox play={play} />
      </div>
      <div className="qa-panel qa-a-status" data-qa-panel="Score and clock">
        <Score play={play} />
        <Clock play={play} />
      </div>
      <div className="qa-panel qa-a-controls" data-qa-panel="Unfound Highlight and Pause">
        <UnfoundHighlightButton play={play} />
        <PauseButton play={play} />
      </div>
      <AttemptMap play={play} quiz={quiz} />
    </div>
  )
}

// B — the fallback: one slim bar above the map, grouped status | answer | controls.
function CalmTopBar({ play, quiz }: LayoutProps) {
  return (
    <div className="qa-play qa-b" inert={play.paused}>
      <header className="qa-b-bar">
        <div className="qa-b-status">
          <Score play={play} />
          <Clock play={play} />
        </div>
        <AnswerBox play={play} />
        <div className="qa-b-controls">
          <UnfoundHighlightButton play={play} />
          <PauseButton play={play} />
        </div>
      </header>
      <AttemptMap play={play} quiz={quiz} />
    </div>
  )
}

// C — everything in one paper dock over Antarctica, leaving every corner of the map empty.
function BottomDock({ play, quiz }: LayoutProps) {
  return (
    <div className="qa-play qa-c" inert={play.paused}>
      <div className="qa-panel qa-c-dock" data-qa-panel="Dock">
        <Score play={play} />
        <AnswerBox play={play} />
        <Clock play={play} />
        <span className="qa-c-divider" />
        <UnfoundHighlightButton play={play} />
        <PauseButton play={play} />
      </div>
      <AttemptMap play={play} quiz={quiz} />
    </div>
  )
}

function AttemptMap({ play, quiz }: LayoutProps) {
  const grid = useTweak('grid')
  return (
    <WorldMap
      countries={quiz.places}
      foundIds={play.foundIds}
      missedIds={null}
      tooltips="found"
      pulse={play.pulse}
      flash={play.flash}
      unfoundHighlight={play.unfoundHighlight}
      graticule={grid === 'on'}
    />
  )
}

function AnswerBox({ play }: { play: Play }) {
  return (
    <input
      ref={play.answerBoxRef}
      className="qa-answer"
      aria-label="Answer"
      placeholder="Type an answer"
      autoComplete="off"
      spellCheck={false}
      // A layout switch mounts a new answer box, which takes focus as the old one had it.
      autoFocus
      value={play.answer}
      onChange={(event) => play.onAnswerChange(event.target.value)}
      onKeyDown={play.onAnswerKeyDown}
    />
  )
}

function Score({ play }: { play: Play }) {
  return (
    <div className="qa-stat">
      <span className="qa-stat-label">Score</span>
      <output className="qa-score" aria-label="Score">
        {play.state.score}
        <span className="qa-of">/{play.state.total}</span>
      </output>
    </div>
  )
}

function Clock({ play }: { play: Play }) {
  return (
    <div className="qa-stat">
      <span className="qa-stat-label">{play.clockLabel}</span>
      <span className="qa-clock" role="timer" aria-label={play.clockLabel}>
        {play.clockText}
      </span>
    </div>
  )
}

function UnfoundHighlightButton({ play }: { play: Play }) {
  const label = useTweak('label')
  const on = play.unfoundHighlight
  const mark = label === 'icon' || label === 'icon-only' ? <TargetIcon /> : <span className="qa-swatch" />
  // The full label drops " Highlight" on narrow screens, where it doesn't fit; the button's name keeps it.
  const full = (
    <span>
      Unfound<span className="qa-label-rest"> Highlight</span>
    </span>
  )
  const text = { full, short: 'Unfound', icon: 'Unfound', 'icon-only': null }[label]
  return (
    <>
      <button
        type="button"
        className="qa-button qa-highlight-button"
        aria-pressed={on}
        aria-label="Unfound Highlight"
        title="Unfound Highlight: marks where every Unfound answer is, without naming any"
        onMouseDown={(event) => event.preventDefault()}
        onClick={play.toggleUnfoundHighlight}
      >
        {mark}
        {text}
      </button>
      {label === 'icon-only' && on && (
        <span className="qa-key">
          <span className="qa-swatch" /> Unfound Highlight
        </span>
      )}
    </>
  )
}

function TargetIcon() {
  return (
    <svg className="qa-icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle className="qa-icon-fill" cx="8" cy="8" r="4.5" />
      <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 0.5v3M8 12.5v3M0.5 8h3M12.5 8h3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function PauseButton({ play }: { play: Play }) {
  return (
    <button type="button" className="qa-button" onClick={play.pause}>
      Pause
    </button>
  )
}

// Covers the map and the Found answers. Resume is the main button; Give up, moved here from the
// play screen, is the secondary one.
function PauseOverlay({ play }: { play: Play }) {
  return (
    <section className="qa-pause" aria-label="Paused">
      <h1 className="qa-pause-title">Paused</h1>
      <dl className="qa-pause-stats">
        <div>
          <dt>Score</dt>
          <dd className="qa-display-figures">
            {play.state.score}
            <span className="qa-of">/{play.state.total}</span>
          </dd>
        </div>
        <div>
          <dt>{play.clockLabel}</dt>
          <dd className="qa-pause-clock">{play.clockText}</dd>
        </div>
      </dl>
      <div className="qa-pause-actions">
        <button type="button" className="qa-button qa-primary qa-large" autoFocus onClick={play.resume}>
          Resume
        </button>
        <button type="button" className="qa-button" onClick={play.giveUp}>
          Give up
        </button>
      </div>
    </section>
  )
}

function formatClock(state: AttemptState): string {
  return state.timer
    ? formatTimerTime(Math.ceil(state.timer.remainingMs / 1000) * 1000)
    : formatDuration(state.elapsedMs)
}

function nextCue(id: string) {
  return (previous: Cue | null): Cue => ({ id, sequence: (previous?.sequence ?? 0) + 1 })
}
