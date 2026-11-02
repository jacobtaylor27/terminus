import { useState } from 'react'
import type { EndedAttemptState, TimerSetting } from './attempt/attempt.ts'
import { quizCatalog } from './quiz/catalog.ts'
import type { Mode, Quiz } from './quiz/quiz.ts'
import { AttemptScreen } from './ui/AttemptScreen.tsx'
import { AttemptSetupScreen } from './ui/AttemptSetupScreen.tsx'
import { QuizListScreen } from './ui/QuizListScreen.tsx'
import { ResultsScreen } from './ui/ResultsScreen.tsx'

type Screen =
  | { kind: 'quiz-list' }
  | { kind: 'attempt-setup'; quiz: Quiz }
  | { kind: 'attempt'; quiz: Quiz; mode: Mode; timer: TimerSetting }
  | { kind: 'results'; quiz: Quiz; mode: Mode; timer: TimerSetting; finalState: EndedAttemptState }

export function App() {
  const [screen, setScreen] = useState<Screen>({ kind: 'quiz-list' })

  switch (screen.kind) {
    case 'quiz-list':
      return (
        <QuizListScreen
          quizzes={quizCatalog}
          onChoose={(quiz) => setScreen({ kind: 'attempt-setup', quiz })}
        />
      )
    case 'attempt-setup':
      return (
        <AttemptSetupScreen
          quiz={screen.quiz}
          onStart={(mode, timer) => setScreen({ kind: 'attempt', quiz: screen.quiz, mode, timer })}
          onBack={() => setScreen({ kind: 'quiz-list' })}
        />
      )
    case 'attempt':
      return (
        <AttemptScreen
          quiz={screen.quiz}
          mode={screen.mode}
          timer={screen.timer}
          onEnd={(finalState) =>
            setScreen({ kind: 'results', quiz: screen.quiz, mode: screen.mode, timer: screen.timer, finalState })
          }
        />
      )
    case 'results':
      return (
        <ResultsScreen
          quiz={screen.quiz}
          finalState={screen.finalState}
          onPlayAgain={() =>
            setScreen({ kind: 'attempt', quiz: screen.quiz, mode: screen.mode, timer: screen.timer })
          }
          onBack={() => setScreen({ kind: 'quiz-list' })}
        />
      )
  }
}
