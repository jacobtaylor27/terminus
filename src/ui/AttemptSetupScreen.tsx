import { type FormEvent, useState } from 'react'
import { type Mode, modeDetails, type Quiz } from '../quiz/quiz.ts'

interface AttemptSetupScreenProps {
  quiz: Quiz
  onStart: (mode: Mode) => void
  onBack: () => void
}

export function AttemptSetupScreen({ quiz, onStart, onBack }: AttemptSetupScreenProps) {
  const [chosenMode, setChosenMode] = useState<Mode>(quiz.modes[0])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onStart(chosenMode)
  }

  return (
    <main className="page">
      <button type="button" className="back-button" onClick={onBack}>
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
        {/* Focused on arrival, so Enter starts straight away. */}
        <button type="submit" className="start-button" autoFocus>
          Start
        </button>
      </form>
    </main>
  )
}
