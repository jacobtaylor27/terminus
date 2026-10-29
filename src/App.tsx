import { useState } from 'react'
import { quizCatalog } from './quiz/catalog.ts'
import type { Mode, Quiz } from './quiz/quiz.ts'
import { AttemptScreen } from './ui/AttemptScreen.tsx'
import { AttemptSetupScreen } from './ui/AttemptSetupScreen.tsx'
import { QuizListScreen } from './ui/QuizListScreen.tsx'

type Screen =
  | { kind: 'quiz-list' }
  | { kind: 'attempt-setup'; quiz: Quiz }
  | { kind: 'attempt'; quiz: Quiz; mode: Mode }

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
          onStart={(mode) => setScreen({ kind: 'attempt', quiz: screen.quiz, mode })}
          onBack={() => setScreen({ kind: 'quiz-list' })}
        />
      )
    case 'attempt':
      return <AttemptScreen quiz={screen.quiz} mode={screen.mode} />
  }
}
