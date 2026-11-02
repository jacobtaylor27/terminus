import { type FormEvent, useState } from 'react'
import { DEFAULT_TIMER_MS, type TimerSetting } from '../attempt/attempt.ts'
import { type Mode, modeDetails, type Quiz } from '../quiz/quiz.ts'
import { formatTimerTime } from './formatDuration.ts'

// The Timer is set in whole minutes: 15:00 unless the player changes it, from 1:00 to 60:00.
const DEFAULT_TIMER_MINUTES = DEFAULT_TIMER_MS / 60_000
const MIN_TIMER_MINUTES = 1
const MAX_TIMER_MINUTES = 60

interface AttemptSetupScreenProps {
  quiz: Quiz
  onStart: (mode: Mode, timer: TimerSetting) => void
  onBack: () => void
}

export function AttemptSetupScreen({ quiz, onStart, onBack }: AttemptSetupScreenProps) {
  const [chosenMode, setChosenMode] = useState<Mode>(quiz.modes[0])
  const [timerOn, setTimerOn] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES)
  const timerMs = timerMinutes * 60_000

  function changeTimerBy(minutes: number) {
    setTimerMinutes((current) =>
      Math.min(MAX_TIMER_MINUTES, Math.max(MIN_TIMER_MINUTES, current + minutes)),
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onStart(chosenMode, timerOn ? timerMs : null)
  }

  return (
    <main className="page">
      <button type="button" className="text-link setup-back" onClick={onBack}>
        <span aria-hidden="true">← </span>Back to Quizzes
      </button>
      <h1 className="page-heading">{quiz.title}</h1>
      <form className="attempt-setup" onSubmit={handleSubmit}>
        <fieldset className="mode-picker">
          <legend>Mode</legend>
          {quiz.modes.map((mode) => (
            <label key={mode} className="mode-option">
              <input
                type="radio"
                name="mode"
                value={mode}
                checked={mode === chosenMode}
                onChange={() => setChosenMode(mode)}
              />
              <span className="mode-name">{modeDetails[mode].name}</span>
              <span className="mode-description">{modeDetails[mode].description}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="timer-picker">
          <legend>Timer</legend>
          <div className="timer-setting">
            <label className="timer-toggle">
              <input
                type="checkbox"
                role="switch"
                checked={timerOn}
                onChange={(event) => setTimerOn(event.target.checked)}
              />
              Play against the clock
            </label>
            <div className={timerOn ? 'timer-stepper' : 'timer-stepper off'}>
              <button
                type="button"
                className="secondary-button"
                aria-label="One minute less"
                disabled={!timerOn || timerMinutes <= MIN_TIMER_MINUTES}
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
                disabled={!timerOn || timerMinutes >= MAX_TIMER_MINUTES}
                onClick={() => changeTimerBy(1)}
              >
                +
              </button>
            </div>
          </div>
        </fieldset>
        {/* Focused on arrival, so Enter starts straight away. */}
        <button type="submit" className="primary-button large" autoFocus>
          Start
        </button>
      </form>
    </main>
  )
}
