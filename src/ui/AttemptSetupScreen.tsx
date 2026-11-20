import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { DEFAULT_TIMER_MS, type TimerSetting } from '../attempt/attempt.ts'
import { MapThumbnail } from '../map/MapThumbnail.tsx'
import { loadMap } from '../map/QuizMap.tsx'
import { type Mode, modeDetails, type Quiz } from '../quiz/quiz.ts'
import type { Records } from '../records/records.ts'
import { formatTimerTime, formatTimeTaken } from './formatDuration.ts'
import { ScoreFigure } from './ScoreFigure.tsx'
import { goalText, StarMeter } from './StarMeter.tsx'

// The Timer is set in whole minutes: 15:00 unless the player changes it, from 1:00 to 60:00.
const DEFAULT_TIMER_MINUTES = DEFAULT_TIMER_MS / 60_000
const MIN_TIMER_MINUTES = 1
const MAX_TIMER_MINUTES = 60

// The Timer settings offered at a tap. Each keeps its own Personal Best, so players who pick the same
// ones can compare them; the stepper sets any other whole minute.
const TIMER_PRESET_MINUTES = [5, 10, 15, 30]

interface AttemptSetupScreenProps {
  quiz: Quiz
  records: Records
  onStart: (mode: Mode, timer: TimerSetting) => void
  onBack: () => void
}

// The Quiz's map, title and Stars at the left, as on its card on the home page, and the Mode and Timer
// to choose at the right, above Start and the Personal Best those settings would have to beat. On a
// narrow screen the two stack.
export function AttemptSetupScreen({ quiz, records, onStart, onBack }: AttemptSetupScreenProps) {
  const [chosenMode, setChosenMode] = useState<Mode>(quiz.modes[0])
  const [timerOn, setTimerOn] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES)
  const timerMs = timerMinutes * 60_000
  const timer: TimerSetting = timerOn ? timerMs : null

  const total = quiz.places.length
  const bestScore = Math.max(0, ...records.personalBests(quiz).map((best) => best.score))
  const bestForSettings = records.personalBest(quiz, chosenMode, timer)

  // The Quiz's map loads while the player sets up the Attempt, once this screen has shown, so it is
  // ready by the time they press Start.
  useEffect(() => loadMap(quiz.map), [quiz.map])

  function changeTimerBy(minutes: number) {
    setTimerMinutes((current) =>
      Math.min(MAX_TIMER_MINUTES, Math.max(MIN_TIMER_MINUTES, current + minutes)),
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onStart(chosenMode, timer)
  }

  return (
    <main className="page setup-page">
      <button type="button" className="text-link setup-back" onClick={onBack}>
        <span aria-hidden="true">← </span>Back to Quizzes
      </button>
      <div className="setup-layout">
        <header className="setup-plate">
          <div className="setup-map">
            <MapThumbnail quiz={quiz} />
          </div>
          <div className="setup-intro">
            <h1 className="page-heading setup-title">{quiz.title}</h1>
            <StarMeter score={bestScore} total={total} />
            <p className="quiz-goal">{goalText(bestScore, total)}</p>
          </div>
        </header>
        <form className="attempt-setup" onSubmit={handleSubmit}>
          <fieldset className="setup-section">
            <legend className="setup-legend">Mode</legend>
            <div className="mode-options">
              {quiz.modes.map((mode) => (
                <label key={mode} className="setup-option mode-option">
                  <OptionGlyph>{modeGlyphs[mode]}</OptionGlyph>
                  <span className="option-text">
                    <span className="option-name">{modeDetails[mode].name}</span>
                    <span className="option-description">{modeDetails[mode].description}</span>
                  </span>
                  <input
                    type="radio"
                    className="option-check"
                    name="mode"
                    value={mode}
                    checked={mode === chosenMode}
                    onChange={() => setChosenMode(mode)}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="setup-section">
            <legend className="setup-legend">Timer</legend>
            <div className={timerOn ? 'setup-option timer-setting on' : 'setup-option timer-setting'}>
              <label className="timer-toggle">
                <OptionGlyph>{stopwatchGlyph}</OptionGlyph>
                <span className="option-text">
                  <span className="option-name">Play against the clock</span>
                  <span className="option-description">
                    {timerOn ? 'The quiz ends when time runs out.' : 'No time limit. The clock counts up.'}
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={timerOn}
                  onChange={(event) => setTimerOn(event.target.checked)}
                />
              </label>
              {timerOn && (
                <div className="timer-controls">
                  <div className="timer-stepper">
                    <button
                      type="button"
                      className="secondary-button"
                      aria-label="One minute less"
                      disabled={timerMinutes <= MIN_TIMER_MINUTES}
                      onClick={() => changeTimerBy(-1)}
                    >
                      −
                    </button>
                    <output className="timer-duration" aria-label="Timer duration">
                      {formatTimerTime(timerMs)}
                    </output>
                    <button
                      type="button"
                      className="secondary-button"
                      aria-label="One minute more"
                      disabled={timerMinutes >= MAX_TIMER_MINUTES}
                      onClick={() => changeTimerBy(1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="timer-presets" role="group" aria-label="Common Timer settings">
                    {TIMER_PRESET_MINUTES.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        className="secondary-button timer-preset"
                        aria-pressed={minutes === timerMinutes}
                        onClick={() => setTimerMinutes(minutes)}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </fieldset>
          <div className="setup-start">
            {/* Focused on arrival, so Enter starts straight away. */}
            <button type="submit" className="primary-button large" autoFocus>
              Start
            </button>
            <p className="setup-best">
              {bestForSettings ? (
                <>
                  Your best with these settings:{' '}
                  <ScoreFigure score={bestForSettings.score} total={bestForSettings.total} /> in{' '}
                  {formatTimeTaken(bestForSettings.elapsedMs, bestForSettings.timerMs !== null)}
                </>
              ) : (
                'No best yet with these settings'
              )}
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

// The small picture leading a setting, drawn in a 32 × 32 box. It only illustrates the setting's name,
// so a screen reader skips it.
function OptionGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="option-glyph">
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        {children}
      </svg>
    </span>
  )
}

// Each Mode as a picture of how it's played. Free Recall: a grid of Places, some Found, in no
// particular order. Cued Recall: a stack of Prompts, one on top at a time.
const modeGlyphs: Record<Mode, ReactNode> = {
  'free-recall': [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((column) => (
      <rect
        key={`${row}-${column}`}
        className={[0, 4, 5, 7].includes(row * 3 + column) ? 'glyph-cell found' : 'glyph-cell'}
        x={2 + column * 10}
        y={2 + row * 10}
        width={8}
        height={8}
        rx={1.5}
      />
    )),
  ),
  'cued-recall': (
    <>
      <rect className="glyph-card" x={11} y={3} width={18} height={18} rx={2} />
      <rect className="glyph-card" x={7.5} y={6.5} width={18} height={18} rx={2} />
      <rect className="glyph-card front" x={4} y={10} width={18} height={18} rx={2} />
      <path className="glyph-line" d="M7.5 15.5h7" />
      <path className="glyph-line clue" d="M7.5 21h11" />
    </>
  ),
}

// The Timer: a stopwatch.
const stopwatchGlyph = (
  <>
    <path className="glyph-line" d="M13 3.5h6M16 3.5v3.5M24.5 9l1.75-1.75" />
    <circle className="glyph-card front" cx={16} cy={18} r={10.5} />
    <path className="glyph-line clue" d="M16 18V11.5" />
    <circle className="glyph-pin" cx={16} cy={18} r={1.6} />
  </>
)
