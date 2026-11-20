import { useState } from 'react'
import type { EndedAttemptState, TimerSetting } from './attempt/attempt.ts'
import { quizCatalog } from './quiz/catalog.ts'
import type { Mode, Quiz } from './quiz/quiz.ts'
import type { Records } from './records/records.ts'
import { AttemptScreen } from './ui/AttemptScreen.tsx'
import { AttemptSetupScreen } from './ui/AttemptSetupScreen.tsx'
import { QuizListScreen } from './ui/QuizListScreen.tsx'
import { ResultsScreen } from './ui/ResultsScreen.tsx'

type Screen =
  | { kind: 'quiz-list' }
  | { kind: 'attempt-setup'; quiz: Quiz }
  | { kind: 'attempt'; quiz: Quiz; mode: Mode; timer: TimerSetting }
  | {
      kind: 'results'
      quiz: Quiz
      mode: Mode
      timer: TimerSetting
      finalState: EndedAttemptState
      newBest: boolean
    }

interface AppProps {
  records: Records
}

export function App({ records }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'quiz-list' })
  // The Quiz list's open tab, kept while the player is away from it, so they come back to it.
  const [openCategory, setOpenCategory] = useState(quizCatalog[0].name)

  switch (screen.kind) {
    case 'quiz-list':
      return (
        <QuizListScreen
          categories={quizCatalog}
          records={records}
          openCategory={openCategory}
          onOpenCategory={setOpenCategory}
          onChoose={(quiz) => setScreen({ kind: 'attempt-setup', quiz })}
        />
      )
    case 'attempt-setup':
      return (
        <AttemptSetupScreen
          quiz={screen.quiz}
          records={records}
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
          onEnd={(finalState) => {
            // Saved as it ends, so an Attempt in progress is never kept.
            const { newBest } = records.save(screen.quiz, screen.mode, finalState)
            setScreen({
              kind: 'results',
              quiz: screen.quiz,
              mode: screen.mode,
              timer: screen.timer,
              finalState,
              newBest,
            })
          }}
        />
      )
    case 'results':
      return (
        <ResultsScreen
          quiz={screen.quiz}
          finalState={screen.finalState}
          newBest={screen.newBest}
          onPlayAgain={() =>
            setScreen({ kind: 'attempt', quiz: screen.quiz, mode: screen.mode, timer: screen.timer })
          }
          onBack={() => setScreen({ kind: 'quiz-list' })}
        />
      )
  }
}
